import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "jobfit-prototype");
const dataDir = path.join(__dirname, "data");
const questionBankPath = path.join(dataDir, "question-bank.json");

loadDotEnv();

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const aiTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 45000);
const searchApiKey = process.env.SEARCH_API_KEY || process.env.TAVILY_API_KEY || "";
const searchProvider = process.env.SEARCH_API_PROVIDER || (searchApiKey ? "tavily" : "");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const fallbackTemplates = {
  finance: {
    match: /财务|会计|出纳|税务|报销|凭证|结账|总账|发票|财务分析/,
    defaultTitle: "财务专员",
    industry: "企业财务 / 财务共享",
    direction: "财务",
    responsibilities: [
      "处理日常账务核算、凭证录入与账务核对，确保账目准确完整",
      "审核费用报销、发票及相关单据合规性，推动流程规范执行",
      "协助完成月度结账、报表整理、税务申报和财务资料归档",
      "对接业务部门，解答费用、发票、合同归档等基础财务流程问题",
    ],
    coreAbilities: ["会计准则应用", "费用合规审核", "月度结账执行", "财务报表编制", "税务申报协同", "跨部门沟通"],
    keySkills: ["总账核算与关账流程", "费用报销制度执行", "增值税发票合规审核", "财务报表编制", "Excel 数据整理", "税务申报基础"],
    interviewFocus: ["是否熟悉凭证、报销、发票和结账流程", "是否理解会计准则与财税合规要求", "是否能说明账务核对和异常处理案例", "是否具备与业务部门沟通财务流程的经验"],
  },
  aiProduct: {
    match: /ai|AI|人工智能|大模型|智能体|agent|Agent|产品/,
    defaultTitle: "AI 产品经理",
    industry: "互联网 / AI 工具",
    direction: "AI 产品",
    responsibilities: [
      "洞察用户与业务场景，识别 AI 产品机会和核心价值",
      "规划 AI 产品功能、MVP 验证路径和关键指标",
      "协调设计、研发、算法、数据等团队推动产品落地",
      "跟踪产品数据、用户反馈和模型效果，持续优化体验",
    ],
    coreAbilities: ["产品规划与策略", "需求分析与定义", "数据分析与决策", "AI 产品理解", "项目管理与协同", "用户研究"],
    keySkills: ["PRD 撰写", "用户访谈", "原型设计", "数据分析", "AI 基础认知", "MVP 验证"],
    interviewFocus: ["是否理解 AI 能力边界", "能否从用户场景定义产品价值", "是否能设计验证指标", "是否有跨团队推进经验"],
  },
  dataAnalyst: {
    match: /数据分析|数据分析师|商业分析|BI|bi|数仓|指标/,
    defaultTitle: "数据分析师",
    industry: "互联网 / 业务分析",
    direction: "数据分析",
    responsibilities: [
      "搭建业务指标体系，监控核心经营和产品数据",
      "基于 SQL、报表和分析模型定位业务问题",
      "输出专题分析结论，为产品、运营和业务决策提供支持",
      "推动数据口径统一、看板建设和分析方法沉淀",
    ],
    coreAbilities: ["指标体系搭建", "SQL 与数据处理", "业务问题拆解", "数据可视化", "分析结论表达", "跨部门沟通"],
    keySkills: ["SQL", "Excel", "Python", "Tableau / Power BI", "A/B 测试", "统计分析"],
    interviewFocus: ["是否能从业务问题拆指标", "SQL 和数据处理是否扎实", "能否把分析结论转化为建议", "是否理解数据口径和异常排查"],
  },
  javaDeveloper: {
    match: /java|Java|后端|服务端|开发工程师|Spring|spring/,
    defaultTitle: "Java 开发工程师",
    industry: "互联网 / 后端研发",
    direction: "Java 后端",
    responsibilities: [
      "负责后端服务设计、接口开发和业务逻辑实现",
      "参与数据库设计、性能优化和系统稳定性建设",
      "与产品、测试、前端协作完成需求交付",
      "排查线上问题，优化服务可用性、扩展性和安全性",
    ],
    coreAbilities: ["Java 基础", "Spring 生态", "数据库设计", "接口设计", "系统性能优化", "问题排查"],
    keySkills: ["Java", "Spring Boot", "MySQL", "Redis", "消息队列", "Linux"],
    interviewFocus: ["Java 基础是否扎实", "是否理解高并发和缓存设计", "是否有系统设计经验", "线上问题排查思路是否清晰"],
  },
  operation: {
    match: /运营|用户运营|内容运营|增长运营|社群|活动/,
    defaultTitle: "运营经理",
    industry: "互联网 / 用户增长",
    direction: "运营",
    responsibilities: [
      "制定用户增长、留存或转化策略，并拆解执行计划",
      "策划活动、内容或社群运营方案，推动指标提升",
      "分析运营数据，复盘活动效果并持续优化策略",
      "协调产品、设计、渠道等资源完成运营目标",
    ],
    coreAbilities: ["用户分层", "活动策划", "数据复盘", "增长策略", "内容运营", "资源协调"],
    keySkills: ["用户画像", "活动方案", "数据分析", "A/B 测试", "社群运营", "转化漏斗"],
    interviewFocus: ["是否能拆解运营目标", "是否有可量化的增长案例", "是否能复盘活动效果", "是否理解用户生命周期"],
  },
};

const referenceQuestionBank = {
  finance: {
    match: /财务|会计|出纳|税务|报销|凭证|结账|总账|发票|财务分析/,
    sourceType: "本地题库",
    sourceName: "财务会计岗位面试题型整理",
    sourceNote: "当前为内置整理版；联网题库不足时用于保证题目不串岗。",
    questions: [
      {
        title: "请介绍一次你处理月度结账或账务核对的经历。",
        skills: ["月度结账执行", "账务核对", "问题排查"],
        answerThinking: "按结账背景、负责模块、核对动作、发现问题和最终结果展开。",
        referenceAnswer: "我会先说明负责的账务模块和结账周期，再讲凭证检查、往来核对、银行余额或费用归集等动作。如果发现差异，会说明如何定位原因、与业务或出纳确认，并最终保证报表及时准确出具。",
      },
      {
        title: "如果发现员工报销单据或发票不合规，你会怎么处理？",
        skills: ["费用合规审核", "发票审核", "沟通协作"],
        answerThinking: "先说明审核依据，再讲异常识别、沟通补充、流程记录和风险控制。",
        referenceAnswer: "我会先依据公司报销制度和税务要求核对发票抬头、税号、金额、业务真实性和附件完整性。发现问题后先与提交人沟通补充或更正，必要时退回流程，并记录高频问题，推动业务部门提前规范提交。",
      },
      {
        title: "你如何保证凭证录入和账务处理的准确性？",
        skills: ["会计准则应用", "凭证录入", "账务准确性"],
        answerThinking: "围绕科目判断、附件核验、复核机制和异常处理说明。",
        referenceAnswer: "我会先确认业务实质和对应会计科目，再检查合同、发票、审批单等附件是否一致。录入后通过科目余额、明细账、往来账和报表勾稽关系复核，发现异常及时追溯原始单据并更正。",
      },
      {
        title: "请讲一次你配合税务申报或发票管理的经验。",
        skills: ["税务申报协同", "发票管理", "资料整理"],
        answerThinking: "说明申报类型、资料准备、核对动作、时间节点和风险点。",
        referenceAnswer: "我会先说明参与的税种或发票管理场景，再讲如何整理销项、进项、费用和台账资料，核对发票认证、抵扣和申报口径，最后说明如何保证资料完整、节点及时、风险可追溯。",
      },
      {
        title: "业务部门对费用报销规则不理解时，你会如何沟通？",
        skills: ["跨部门沟通", "费用制度执行", "流程规范"],
        answerThinking: "强调先理解业务诉求，再用制度依据和替代方案沟通。",
        referenceAnswer: "我会先了解业务实际场景，判断是材料缺失、流程不清还是制度边界问题。沟通时不只说不能报，而是解释制度依据、税务或内控风险，并给出可执行的补充材料或后续规范提交方式。",
      },
    ],
  },
  product: {
    match: /产品|AI|ai|人工智能|大模型|智能体|agent|Agent|用户|需求|增长|B端|b端|SaaS/,
    sourceType: "本地题库",
    sourceName: "公开面经与产品岗位题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
    questions: [
      {
        title: "你如何判断一个需求是否值得做？",
        skills: ["需求判断", "产品优先级", "业务理解"],
        answerThinking: "先讲需求来源，再讲用户价值、业务价值、实现成本和风险，最后说明如何验证。",
        referenceAnswer: "我会先确认需求对应的用户场景和痛点，再评估影响用户规模、业务指标、实现成本和潜在风险。若价值较高但不确定性大，会先设计 MVP 或灰度实验，用转化率、留存、使用频次等指标验证，再决定是否扩大投入。",
      },
      {
        title: "如果用户需求和业务目标冲突，你会怎么处理？",
        skills: ["产品判断", "沟通协同", "优先级"],
        answerThinking: "先拆冲突本质，再比较收益、成本、风险，最后给出分阶段方案和沟通方式。",
        referenceAnswer: "我会先确认用户需求背后的真实问题，同时明确业务目标的约束。然后把方案拆成用户价值、业务收益、资源成本和风险四个维度比较。如果短期冲突明显，会优先设计折中方案，例如灰度、分层或低成本验证，并和业务、研发同步取舍依据。",
      },
      {
        title: "你如何验证一个新功能上线后是否有效？",
        skills: ["数据分析", "指标设计", "复盘能力"],
        answerThinking: "先定义目标指标，再说明对照方式、观察周期、数据口径和复盘结论。",
        referenceAnswer: "我会先明确功能目标，例如提升转化、效率或留存，再拆出核心指标和辅助指标。上线前确认埋点和口径，尽量设置对照组或灰度范围。上线后观察指标变化、用户反馈和异常数据，最后判断是否达到预期，并决定继续优化、扩大上线或回滚。",
      },
      {
        title: "如何判断一个 AI 功能是真需求，而不是为了 AI 而 AI？",
        skills: ["AI 产品理解", "场景判断", "价值验证"],
        answerThinking: "先回到用户任务，判断 AI 是否显著降低成本或提升结果，再验证效果和风险。",
        referenceAnswer: "我会先看用户原本要完成什么任务，以及现有方案的问题在哪里。如果 AI 能明显降低时间成本、提升质量或解决过去做不到的问题，才说明有价值。随后用 MVP 验证任务完成率、节省时间、用户采纳率和错误率，并评估幻觉、可控性和兜底方案。",
      },
      {
        title: "你如何向非技术团队解释 AI 能力边界？",
        skills: ["AI 能力边界", "跨团队沟通", "风险表达"],
        answerThinking: "用业务场景解释能做什么、不能保证什么、风险在哪里、如何兜底。",
        referenceAnswer: "我会避免直接讲模型术语，而是用具体业务例子说明 AI 适合处理高频、规则可归纳、允许人工校验的任务；不适合承诺完全准确、强合规或无兜底的结果。同时说明置信度、人工审核、异常回退和用户提示机制。",
      },
      {
        title: "请讲一个你通过用户反馈推动产品迭代的案例。",
        skills: ["用户研究", "需求分析", "项目推进"],
        answerThinking: "按背景、反馈来源、问题归纳、方案设计、上线结果来讲。",
        referenceAnswer: "可以先说明项目背景和反馈来源，例如访谈、客服记录或数据异常；再归纳高频问题，说明你如何判断优先级并设计方案；最后讲推动过程和上线结果，例如效率提升、转化提升或用户满意度改善。",
      },
    ],
  },
  data: {
    match: /数据|分析|BI|指标|数仓|商业分析/,
    sourceType: "本地题库",
    sourceName: "公开数据分析岗位面试题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
    questions: [
      {
        title: "你如何搭建一个业务指标体系？",
        skills: ["指标体系", "业务理解", "数据分析"],
        answerThinking: "先讲业务目标，再拆北极星指标、过程指标和诊断指标。",
        referenceAnswer: "我会先明确业务目标和关键链路，再定义北极星指标。之后按用户生命周期或业务漏斗拆过程指标，并补充诊断指标用于定位问题。最后统一口径、数据来源和看板展示方式。",
      },
      {
        title: "发现核心指标下跌，你会如何分析？",
        skills: ["问题拆解", "归因分析", "数据验证"],
        answerThinking: "先确认口径和数据质量，再按时间、人群、渠道、功能路径拆解。",
        referenceAnswer: "我会先排查埋点、口径和数据延迟，再确认下跌时间点。之后按渠道、人群、版本、地区和关键路径拆分，找到变化最大的环节，并结合业务动作或产品变更提出假设，再用数据验证原因。",
      },
      {
        title: "你如何评估一次活动是否有效？",
        skills: ["活动分析", "指标设计", "复盘"],
        answerThinking: "区分目标指标、成本指标和长期影响，并说明对照方式。",
        referenceAnswer: "我会先明确活动目标，例如拉新、转化或留存，再看参与人数、转化率、ROI、留存和复购等指标。若条件允许，会设置对照组或历史基线，排除自然波动，最后沉淀可复用结论。",
      },
    ],
  },
  engineering: {
    match: /java|Java|后端|前端|开发|工程师|Spring|服务端/,
    sourceType: "本地题库",
    sourceName: "公开研发岗位面试题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
    questions: [
      {
        title: "请介绍一个你负责的系统设计或接口设计案例。",
        skills: ["系统设计", "接口设计", "工程实现"],
        answerThinking: "说明业务背景、架构选择、关键难点、性能和稳定性考虑。",
        referenceAnswer: "可以从需求背景讲起，说明服务边界、接口字段、数据模型和异常处理。再讲你如何考虑性能、并发、缓存、幂等和监控，最后用上线效果或问题复盘证明设计有效。",
      },
      {
        title: "线上接口变慢，你会如何排查？",
        skills: ["问题排查", "性能优化", "稳定性"],
        answerThinking: "按监控、日志、链路、数据库、缓存、依赖服务逐层排查。",
        referenceAnswer: "我会先确认影响范围和时间点，再看监控指标和日志。之后沿调用链排查慢 SQL、缓存命中率、外部依赖、线程池和资源使用情况，定位瓶颈后再做索引、缓存、限流或异步化优化。",
      },
    ],
  },
};

const jobAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["isEnough", "missingTypes", "clarifyingQuestions", "message", "jobModel"],
  properties: {
    isEnough: { type: "boolean" },
    missingTypes: {
      type: "array",
      items: { type: "string" },
    },
    clarifyingQuestions: {
      type: "array",
      items: { type: "string" },
    },
    message: { type: "string" },
    jobModel: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["title", "industry", "direction", "level", "responsibilities", "coreAbilities", "keySkills", "interviewFocus"],
          properties: {
            title: { type: "string" },
            industry: { type: "string" },
            direction: { type: "string" },
            level: { type: "string" },
            responsibilities: {
              type: "array",
              items: { type: "string" },
            },
            coreAbilities: {
              type: "array",
              items: { type: "string" },
            },
            keySkills: {
              type: "array",
              items: { type: "string" },
            },
            interviewFocus: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      ],
    },
  },
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/api/analyze-job") {
      const body = await readJson(req);
      const result = await analyzeJob(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/analyze-job-stream") {
      const body = await readJson(req);
      await analyzeJobStreaming(body, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/extract-jd") {
      const result = await extractJdFromFile(req);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/analyze-profile") {
      const body = await readJson(req);
      const result = await analyzeProfile(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/analyze-profile-stream") {
      const body = await readJson(req);
      await analyzeProfileStreaming(body, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/analyze-gap") {
      const body = await readJson(req);
      const result = await analyzeGap(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/analyze-gap-stream") {
      const body = await readJson(req);
      await analyzeGapStreaming(body, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/generate-questions") {
      const body = await readJson(req);
      const result = await generateQuestions(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/search-question-sources") {
      const body = await readJson(req);
      const result = await searchQuestionSources(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/review-answer") {
      const body = await readJson(req);
      const result = await reviewAnswer(body);
      sendJson(res, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/review-answer-stream") {
      const body = await readJson(req);
      await reviewAnswerStreaming(body, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/generate-review") {
      const body = await readJson(req);
      const result = await generateReview(body);
      sendJson(res, result);
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, { error: "Method not allowed" }, 405);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, { error: "Server error", message: error.message }, 500);
  }
});

server.listen(port, host, () => {
  console.log(`JobFit prototype: http://${host}:${port}`);
  console.log(process.env.OPENAI_API_KEY ? `AI mode enabled with ${model} at ${baseUrl}` : "OPENAI_API_KEY missing, AI service disabled.");
  console.log(searchApiKey ? `Web search enabled with ${searchProvider}` : "SEARCH_API_KEY missing, using local question bank only.");
});

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(publicDir, safePath));

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, { error: "Forbidden" }, 403);
    return;
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    sendJson(res, { error: "Not found" }, 404);
  }
}

function sendSseEvent(res, eventType, data) {
  try {
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {}
}

function sendSseStatus(res, step, detail) {
  sendSseEvent(res, "status", { step, detail });
}

function sendSseContent(res, text) {
  sendSseEvent(res, "content", { text });
}

function sendSseDone(res, result) {
  sendSseEvent(res, "done", result);
}

function sendSseError(res, message) {
  sendSseEvent(res, "error", { message });
}

function requireAiService() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI 服务暂未配置，请联系管理员。");
  }
}

function initSseResponse(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
}

async function callStreamingModel(systemPrompt, payload, res) {
  const isDashScope = baseUrl.includes("dashscope");
  const body = {
    model,
    messages: [
      { role: "system", content: `${systemPrompt}\n\n你必须只输出一个 JSON 对象，不要输出 Markdown、代码块或解释。字段名必须严格使用：isEnough、missingTypes、clarifyingQuestions、message、jobModel。jobModel 内部字段名必须严格使用：title、industry、direction、level、responsibilities、coreAbilities、keySkills、interviewFocus。\n\n当 isEnough=true 时，jobModel 不能为空，且 responsibilities 至少 3 条，coreAbilities 至少 5 个，keySkills 至少 5 个，interviewFocus 至少 3 条。` },
      { role: "user", content: JSON.stringify(payload) },
    ],
    stream: true,
  };
  if (isDashScope) {
    body.result_format = "message";
  }

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, aiTimeoutMs);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Streaming API error: ${response.status} ${response.statusText}`, errorText.slice(0, 300));
    throw new Error(`Streaming request failed: ${response.status} ${response.statusText}`);
  }

  console.log("Streaming response received, status:", response.status);

  let fullContent = "";
  let lastStep = "";

  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === "[DONE]") continue;
        try {
          const chunk = JSON.parse(dataStr);
          const delta = chunk.choices?.[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            sendSseContent(res, delta);
            const newStep = detectStreamStep(fullContent, lastStep);
            if (newStep !== lastStep) {
              lastStep = newStep;
              sendSseStatus(res, newStep, getStepDetail(newStep, fullContent));
            }
          }
        } catch {}
      }
    }
  } catch (readerError) {
    console.error("Stream reader error, trying text fallback:", readerError.message);
    const text = await response.text();
    const dataLines = text.split("\n").filter((l) => l.trim().startsWith("data:") && !l.includes("[DONE]"));
    for (const line of dataLines) {
      try {
        const chunk = JSON.parse(line.trim().slice(5).trim());
        const delta = chunk.choices?.[0]?.delta?.content || "";
        if (delta) {
          fullContent += delta;
          sendSseContent(res, delta);
        }
      } catch {}
    }
    if (!fullContent) {
      const output = text.split("\n").filter((l) => l.trim().startsWith("data:") && !l.includes("[DONE]"));
      for (const l of output) {
        try {
          const c = JSON.parse(l.trim().slice(5).trim());
          const msg = c.choices?.[0]?.message?.content || "";
          if (msg) fullContent += msg;
        } catch {}
      }
    }
  }

  return fullContent;
}

function detectStreamStep(content, currentStep) {
  const steps = [
    { key: "model_start", marker: '"jobModel"' },
    { key: "title", marker: '"title"' },
    { key: "responsibilities", marker: '"responsibilities"' },
    { key: "coreAbilities", marker: '"coreAbilities"' },
    { key: "keySkills", marker: '"keySkills"' },
    { key: "interviewFocus", marker: '"interviewFocus"' },
    { key: "complete", marker: '"interviewFocus":[' },
  ];
  const stepOrder = steps.map((s) => s.key);
  let bestStep = currentStep;
  for (const step of steps) {
    if (content.includes(step.marker)) {
      if (stepOrder.indexOf(step.key) > stepOrder.indexOf(bestStep)) {
        bestStep = step.key;
      }
    }
  }
  return bestStep;
}

function getStepDetail(step, content) {
  const details = {
    model_start: "正在构建岗位能力模型...",
    title: "已确认岗位定位",
    responsibilities: "正在生成核心职责...",
    coreAbilities: "正在识别核心能力...",
    keySkills: "正在梳理关键技能...",
    interviewFocus: "正在总结面试关注点...",
    complete: "岗位能力模型生成完成",
  };
  return details[step] || "正在分析...";
}

async function callStreamingJsonModel(system, payload, res, maxTokens = 3200) {
  const isDashScope = baseUrl.includes("dashscope");
  const body = {
    model,
    messages: [
      { role: "system", content: `${system}\n\n你必须只输出一个 JSON 对象，不要输出 Markdown、代码块或解释。` },
      { role: "user", content: JSON.stringify(payload) },
    ],
    max_tokens: maxTokens,
    stream: true,
  };
  if (isDashScope) {
    body.result_format = "message";
  } else {
    body.response_format = { type: "json_object" };
  }

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, aiTimeoutMs);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Streaming request failed: ${response.status} ${errorText.slice(0, 160)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const dataStr = trimmed.slice(5).trim();
      if (dataStr === "[DONE]") continue;
      try {
        const chunk = JSON.parse(dataStr);
        const delta = chunk.choices?.[0]?.delta?.content || "";
        if (delta) {
          fullContent += delta;
          sendSseContent(res, delta);
        }
      } catch {}
    }
  }
  return fullContent;
}

async function analyzeJobStreaming(input, res) {
  const normalizedInput = normalizeInput(input);
  initSseResponse(res);
  try {
    if (!process.env.OPENAI_API_KEY) {
      sendSseError(res, "AI 服务暂未配置，请联系管理员。");
      res.end();
      return;
    }

    sendSseStatus(res, "understand", "正在理解岗位信息...");
    const understanding = await understandJobInput(normalizedInput);
    if (shouldClarifyJobInput(understanding)) {
      sendSseStatus(res, "clarify", "信息不足，需要补充");
      const clarifyResult = {
        source: "ai",
        isEnough: false,
        missingTypes: firstArray(understanding.missingTypes, understanding.riskTypes, ["job_understanding_clarification"]),
        clarifyingQuestions: firstArray(understanding.clarifyingQuestions).slice(0, 3),
        message: firstString(understanding.message, understanding.conflictReason, "当前岗位信息需要进一步确认后再生成能力模型。"),
        jobModel: null,
      };
      sendSseDone(res, clarifyResult);
      res.end();
      return;
    }

    sendSseStatus(res, "generate_start", "岗位信息足够，开始生成能力模型...");
    let rawText = "";
    try {
      rawText = await callStreamingModel(systemInstruction(), normalizedInput, res);
    } catch (streamError) {
      console.error("Streaming failed, falling back to non-streaming:", streamError.message);
      sendSseStatus(res, "fallback", "流式输出异常，切换为普通模式...");
      const fallbackResult = await analyzeJob(normalizedInput);
      sendSseDone(res, fallbackResult);
      res.end();
      return;
    }
    let parsed;
    try {
      parsed = parseModelJson(rawText);
    } catch (e) {
      parsed = { isEnough: false, missingTypes: [], clarifyingQuestions: [], message: "AI 输出解析失败，请重试。", jobModel: null };
    }
    const result = { source: "ai", ...coerceJobAnalysisResult(parsed, normalizedInput) };
    sendSseDone(res, result);
    res.end();
  } catch (error) {
    console.error("Streaming analyze-job failed:", error.message);
    sendSseError(res, error.message);
    res.end();
  }
}

async function analyzeProfileStreaming(input, res) {
  const normalizedInput = normalizeProfileInput(input);
  initSseResponse(res);
  try {
    if (!process.env.OPENAI_API_KEY) {
      sendSseError(res, "AI 服务暂未配置，请联系管理员。");
      res.end();
      return;
    }
    sendSseStatus(res, "extract_work", "正在整理工作经历...");
    sendSseStatus(res, "extract_project", "正在整理项目经历...");
    sendSseStatus(res, "match_job", "正在结合岗位能力模型...");
    sendSseStatus(res, "generate", "正在请求 AI 生成个人能力画像...");
    const rawText = await callStreamingJsonModel(profileSystemInstruction(), normalizedInput, res, 3200);
    const parsed = parseModelJson(rawText);
    sendSseDone(res, { source: "ai", ...coerceProfileAnalysisResult(parsed) });
    res.end();
  } catch (error) {
    console.error("Streaming analyze-profile failed:", error.message);
    sendSseStatus(res, "fallback", "AI 响应异常，切换为兜底规则生成...");
    sendSseDone(res, buildProfileFallback(normalizedInput));
    res.end();
  }
}

async function analyzeGapStreaming(input, res) {
  initSseResponse(res);
  try {
    if (!process.env.OPENAI_API_KEY) {
      sendSseError(res, "AI 服务暂未配置，请联系管理员。");
      res.end();
      return;
    }
    sendSseStatus(res, "read_job", "正在读取岗位能力模型...");
    sendSseStatus(res, "read_profile", "正在读取个人能力画像...");
    sendSseStatus(res, "match", "正在请求 AI 逐项匹配能力...");
    const rawText = await callStreamingJsonModel(
      "你是 JobFit 的能力差距分析 Agent。你要对比 jobModel 和 userProfile，输出结构化能力差距分析。字段必须包含 overallMatch、basis、gapItems、practiceFocus、riskTips。gapItems 每项必须包含 ability、jobRequirement、userCurrent、matchStatus、evidenceLevel、depthLevel、gapReason、interviewRisk、suggestion。matchStatus 只能使用：匹配、部分匹配、存在差距。evidenceLevel 只能使用：强、中、弱。depthLevel 只能使用：超过、达到、低于。至少输出 5 项能力分析，内容要具体，能服务后续题目生成。",
      input,
      res,
      3600,
    );
    sendSseStatus(res, "score", "正在计算匹配分数...");
    sendSseStatus(res, "generate", "正在整理结构化差距结果...");
    const parsed = parseModelJson(rawText);
    sendSseDone(res, { source: "ai", gapAnalysis: coerceGapAnalysis(parsed) });
    res.end();
  } catch (error) {
    console.error("Streaming analyze-gap failed:", error.message);
    sendSseStatus(res, "fallback", "AI 响应异常，切换为兜底规则生成...");
    sendSseDone(res, { source: "fallback", gapAnalysis: buildGapFallback(input) });
    res.end();
  }
}

async function extractJdFromFile(req) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return { success: false, text: "", error: "请上传文件" };
  }
  const boundary = contentType.split("boundary=")[1];
  if (!boundary) return { success: false, text: "", error: "请求格式错误" };

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks);
  const boundaryBuf = Buffer.from(`--${boundary}`);

  let fileContent = null;
  let filename = "";
  let pos = 0;
  while (pos < raw.length) {
    const start = raw.indexOf(boundaryBuf, pos);
    if (start === -1) break;
    const headerEnd = raw.indexOf("\r\n\r\n", start);
    if (headerEnd === -1) break;
    const header = raw.slice(start + boundaryBuf.length, headerEnd).toString("utf8");
    const nextBoundary = raw.indexOf(boundaryBuf, headerEnd + 4);
    const bodyEnd = nextBoundary !== -1 ? nextBoundary - 2 : raw.length - 2;
    const nameMatch = header.match(/name="([^"]+)"/);
    const filenameMatch = header.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
      fileContent = raw.slice(headerEnd + 4, bodyEnd);
    }
    pos = bodyEnd;
  }

  if (!fileContent) return { success: false, text: "", error: "未找到文件内容" };

  const ext = (filename.split(".").pop() || "").toLowerCase();
  let text = "";
  if (ext === "txt") {
    text = fileContent.toString("utf8").trim();
  } else if (ext === "pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(fileContent);
      text = (result.text || "").trim();
    } catch {
      return { success: false, text: "", error: "PDF 解析需要安装 pdf-parse，请运行 npm install pdf-parse 后重试" };
    }
  } else if (ext === "docx" || ext === "doc") {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileContent });
      text = (result.value || "").trim();
    } catch {
      return { success: false, text: "", error: "Word 解析需要安装 mammoth，请运行 npm install mammoth 后重试" };
    }
  } else {
    return { success: false, text: "", error: `不支持的文件格式: .${ext}，请使用 PDF、Word 或 TXT` };
  }

  if (!text || text.length < 10) {
    return { success: false, text: "", error: "文件内容过少或无法解析" };
  }
  return { success: true, text: text.slice(0, 8000), filename };
}

async function analyzeJob(input) {
  const normalizedInput = normalizeInput(input);

  requireAiService();

  const understanding = await understandJobInput(normalizedInput);
  if (shouldClarifyJobInput(understanding)) {
    return {
      source: "ai",
      isEnough: false,
      missingTypes: firstArray(understanding.missingTypes, understanding.riskTypes, ["job_understanding_clarification"]),
      clarifyingQuestions: firstArray(understanding.clarifyingQuestions).slice(0, 3),
      message: firstString(understanding.message, understanding.conflictReason, "当前岗位信息需要进一步确认后再生成能力模型。"),
      jobModel: null,
    };
  }

  const isOpenAIResponses = baseUrl.includes("api.openai.com");
  const response = await fetchWithTimeout(isOpenAIResponses ? `${baseUrl}/responses` : `${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isOpenAIResponses ? buildOpenAIResponsesPayload(normalizedInput) : buildChatCompletionsPayload(normalizedInput)),
  }, aiTimeoutMs);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const outputText = isOpenAIResponses ? data.output_text || extractOutputText(data) : data.choices?.[0]?.message?.content;
  if (!outputText) {
    throw new Error("AI response missing output text");
  }

  const parsed = parseModelJson(outputText);
  return {
    source: "ai",
    ...coerceJobAnalysisResult(parsed, normalizedInput),
  };
}

function coerceJobAnalysisResult(result, input) {
  const isEnough = Boolean(result.isEnough);
  const jobModel = result.jobModel || null;

  return {
    isEnough,
    missingTypes: Array.isArray(result.missingTypes) ? result.missingTypes : [],
    clarifyingQuestions: Array.isArray(result.clarifyingQuestions) ? result.clarifyingQuestions : [],
    message: typeof result.message === "string" ? result.message : isEnough ? "信息足够生成岗位能力模型。" : "当前信息不足，需要补充后再生成岗位能力模型。",
    jobModel: isEnough && jobModel ? coerceJobModel(jobModel, input) : null,
  };
}

function coerceJobModel(jobModel, input) {
  const responsibilities = firstArray(jobModel.responsibilities, jobModel.coreResponsibilities, jobModel.keyResponsibilities);
  const abilities = firstArray(jobModel.coreAbilities, jobModel.requiredCompetencies, jobModel.competencies, jobModel.abilities);
  const skills = firstArray(jobModel.keySkills, jobModel.skills, jobModel.tools, jobModel.preferredBackground);
  const focus = firstArray(jobModel.interviewFocus, jobModel.interviewFocuses, jobModel.assessmentFocus, jobModel.interviewQuestions);
  const title = firstString(jobModel.title, jobModel.coreRole, jobModel.role, input.targetJobTitle, "目标岗位");
  const industry = firstString(jobModel.industry, input.industry, "未填写");
  const direction = firstString(jobModel.direction, jobModel.function, input.jobDirection, "未填写");
  const level = firstString(jobModel.level, jobModel.seniority, input.levelRequirement, "未填写");
  const normalized = sanitizeJobModelForRole({
    title,
    industry,
    direction,
    level,
    responsibilities: responsibilities.length ? responsibilities.slice(0, 6) : ["分析岗位职责与业务目标，提炼核心工作内容"],
    coreAbilities: abilities.length ? abilities.slice(0, 8) : ["需求分析", "业务理解", "项目推进", "沟通协作"],
    keySkills: skills.length ? skills.slice(0, 8) : ["结构化表达", "数据分析", "文档撰写", "跨团队沟通"],
    interviewFocus: focus.length ? focus.slice(0, 6) : ["是否理解岗位核心职责", "是否具备相关项目经验", "是否能清晰表达个人贡献"],
  }, input);

  return normalized;
}

function sanitizeJobModelForRole(jobModel, input = {}) {
  const signal = [
    input.targetJobTitle,
    input.jobDescription,
    input.jobDirection,
    jobModel.title,
    jobModel.direction,
  ].join(" ");
  const isFinance = /财务|会计|出纳|税务|报销|凭证|结账|总账|发票|财务分析/.test(signal);
  const explicitlyDataFinance = /财务数据分析|经营分析|数据分析|BI|SQL|数仓|商业分析/.test(signal);
  if (!isFinance || explicitlyDataFinance) return jobModel;

  const financeTemplate = fallbackTemplates.finance;
  const bannedToolPattern = /SQL|BI|Power\s*BI|Tableau|Python|数仓|数据处理|数据可视化/i;
  const keepRelevant = (items) => items.filter((item) => !bannedToolPattern.test(String(item)));
  const merge = (primary, backup, max = 8) => uniqueItems([...keepRelevant(primary), ...backup]).slice(0, max);
  return {
    ...jobModel,
    direction: /未填写/.test(jobModel.direction) ? financeTemplate.direction : jobModel.direction,
    responsibilities: merge(jobModel.responsibilities, financeTemplate.responsibilities, 6),
    coreAbilities: merge(jobModel.coreAbilities, financeTemplate.coreAbilities, 8),
    keySkills: merge(jobModel.keySkills, financeTemplate.keySkills, 8),
    interviewFocus: merge(jobModel.interviewFocus, financeTemplate.interviewFocus, 6),
  };
}

function firstString(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim();
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value) && value.length) || [];
}

async function understandJobInput(input) {
  return callJsonModel(
    "你是 JobFit 的岗位理解 Agent。你不是生成岗位能力模型，而是先判断用户提交的岗位信息是否可以进入生成阶段。请基于语义理解，不要依赖固定关键词表。你需要判断：targetJobTitle 实际指向的岗位、jobDescription 实际描述的岗位、二者是否一致、岗位是否过泛、信息是否足够生成基础能力模型、下一步动作是什么。字段必须包含 targetJobCategory、jdInferredCategory、isConsistent、isAmbiguous、isEnoughForBasicModel、confidence、nextAction、missingTypes、conflictReason、clarifyingQuestions、message。nextAction 只能是 generate 或 clarify。规则：1. 如果岗位名和 JD 明显不一致，nextAction=clarify。2. 如果岗位名过泛且缺少 JD/行业/方向，nextAction=clarify。3. 如果岗位名明确，即使 JD 为空，也可以 nextAction=generate。4. 如果 JD 比岗位名更具体且不冲突，可以 generate。5. clarifyingQuestions 必须是用户容易回答的 1-3 个问题。",
    input,
    1600,
  );
}

function shouldClarifyJobInput(understanding) {
  if (!understanding || typeof understanding !== "object") return false;
  if (understanding.nextAction === "clarify") return true;
  if (understanding.isConsistent === false && Number(understanding.confidence || 0) >= 0.65) return true;
  if (understanding.isEnoughForBasicModel === false && understanding.isAmbiguous === true) return true;
  return false;
}

function parseModelJson(text) {
  const raw = String(text || "").trim();
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw error;
  }
}

function buildOpenAIResponsesPayload(normalizedInput) {
  return {
    model,
    input: [
      {
        role: "system",
        content: systemInstruction(),
      },
      {
        role: "user",
        content: JSON.stringify(normalizedInput),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "job_analysis_result",
        strict: true,
        schema: jobAnalysisSchema,
      },
    },
    max_output_tokens: 2200,
  };
}

function buildChatCompletionsPayload(normalizedInput) {
  return {
    model,
    messages: [
      {
        role: "system",
        content: `${systemInstruction()}\n\n你必须只输出一个 JSON 对象，不要输出 Markdown、代码块或解释。字段名必须严格使用：isEnough、missingTypes、clarifyingQuestions、message、jobModel。jobModel 内部字段名必须严格使用：title、industry、direction、level、responsibilities、coreAbilities、keySkills、interviewFocus。\n\n当 isEnough=true 时，jobModel 不能为空，且 responsibilities 至少 3 条，coreAbilities 至少 5 个，keySkills 至少 5 个，interviewFocus 至少 3 条。\n\n输出示例：{\"isEnough\":true,\"missingTypes\":[],\"clarifyingQuestions\":[],\"message\":\"信息足够生成岗位能力模型。\",\"jobModel\":{\"title\":\"AI 产品经理\",\"industry\":\"互联网 / AI 工具\",\"direction\":\"AI 产品\",\"level\":\"1-3 年\",\"responsibilities\":[\"分析用户需求与业务场景\",\"规划 AI 产品功能和验证路径\",\"协调算法、研发、设计推动落地\"],\"coreAbilities\":[\"AI 产品理解\",\"需求分析\",\"产品规划\",\"数据分析\",\"项目推进\"],\"keySkills\":[\"PRD 撰写\",\"用户访谈\",\"原型设计\",\"指标设计\",\"Prompt 基础\"],\"interviewFocus\":[\"是否理解 AI 能力边界\",\"是否能设计 MVP 验证指标\",\"是否有跨团队落地经验\"]}}`,
      },
      {
        role: "user",
        content: JSON.stringify(normalizedInput),
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2200,
  };
}

function systemInstruction() {
  return "你是 JobFit 的岗位分析 Agent。你要根据用户的目标岗位、JD、行业、方向、年限和补充说明，判断信息是否足够，并生成用于求职面试准备的岗位能力模型。判断标准要适合当前产品：只要能识别岗位类型、主要方向和基本职责，就应该生成一个有用的岗位能力模型；不要因为缺少组织架构、汇报对象、技术细节等高级信息而过度追问。当目标岗位本身已经足够明确，例如“AI 产品经理”“数据分析师”“Java 开发工程师”，即使没有 JD、行业、方向或年限，也应该先生成基础岗位能力模型，并在 message 中提示用户补充 JD、行业或年限可以提升准确度。只有当岗位名称过泛或存在明显歧义，例如只写“产品”“运营”“开发”，且没有 JD、行业、方向或年限补充时，才返回 isEnough=false 并提出 1-3 个关键补充问题。重要：如果目标岗位名称和 JD 明显不一致，例如目标岗位写“采购”，但 JD 描述的是财务、会计、报销、凭证、结账、税务等工作，必须返回 isEnough=false，追问用户确认以岗位名称还是 JD 为准，不能擅自按数据分析或其他岗位生成能力模型。信息足够时返回 isEnough=true 和结构化 jobModel。结果要具体、克制、可用于后续能力差距分析和面试题生成。";
}

function extractOutputText(data) {
  return data.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function normalizeInput(input) {
  return {
    targetJobTitle: String(input.targetJobTitle || "").trim(),
    jobDescription: String(input.jobDescription || "").trim(),
    industry: String(input.industry || "").trim(),
    jobDirection: String(input.jobDirection || "").trim(),
    levelRequirement: String(input.levelRequirement || "").trim(),
    extraInfo: String(input.extraInfo || "").trim(),
    supplement: String(input.supplement || "").trim(),
  };
}

function mockAnalyzeJob(input) {
  const signalText = Object.values(input).join(" ");
  const structuredCount = [input.industry, input.jobDirection, input.levelRequirement, input.extraInfo, input.supplement].filter(Boolean).length;
  const usefulTextLength = signalText.replace(/\s/g, "").length;
  const clearTitle = /ai|AI|人工智能|数据|java|Java|前端|后端|用户研究|B端|b端|SaaS|增长|运营|产品|开发|分析|财务|会计|出纳|税务|报销|凭证|结账/.test(signalText);

  if (!input.targetJobTitle || (usefulTextLength < 10 && !clearTitle) || (input.targetJobTitle.length <= 2 && structuredCount === 0)) {
    return {
      source: "mock",
      isEnough: false,
      missingTypes: ["industry", "direction", "level"],
      clarifyingQuestions: [
        "这个岗位主要面向哪个行业或业务场景？",
        "这个岗位更偏哪个方向？例如 B 端、增长、策略、AI 产品、数据分析或研发。",
        "目标岗位大概要求几年经验或什么职级？",
      ],
      message: "当前岗位信息还比较泛，建议先补充行业、方向或经验要求，这样生成的能力模型会更准确。",
      jobModel: null,
    };
  }

  const template = Object.values(fallbackTemplates).find((item) => item.match.test(signalText)) || fallbackTemplates.aiProduct;
  return {
    source: "mock",
    isEnough: true,
    missingTypes: [],
    clarifyingQuestions: [],
    message: "已根据当前输入生成岗位能力模型。当前为本地模拟结果；配置 OPENAI_API_KEY 后会切换为真实 AI 生成。",
    jobModel: {
      title: input.targetJobTitle || template.defaultTitle,
      industry: input.industry || template.industry,
      direction: input.jobDirection || template.direction,
      level: input.levelRequirement || "未填写",
      ...sanitizeJobModelForRole({
        title: input.targetJobTitle || template.defaultTitle,
        industry: input.industry || template.industry,
        direction: input.jobDirection || template.direction,
        level: input.levelRequirement || "未填写",
        responsibilities: template.responsibilities,
        coreAbilities: template.coreAbilities,
        keySkills: template.keySkills,
        interviewFocus: template.interviewFocus,
      }, input),
    },
  };
}

async function analyzeProfile(input) {
  const normalizedInput = normalizeProfileInput(input);
  requireAiService();

  try {
    const result = await callJsonModel(
      profileSystemInstruction(),
      normalizedInput,
      3200,
    );
    return {
      source: "ai",
      ...coerceProfileAnalysisResult(result),
    };
  } catch (error) {
    console.error("Profile analysis failed:", error.message);
    return buildProfileFallback(normalizedInput);
  }
}

function normalizeProfileInput(input) {
  const jobModel = input.jobModel || null;
  const slimJobModel = jobModel ? {
    title: jobModel.title || "",
    industry: jobModel.industry || "",
    direction: jobModel.direction || "",
    level: jobModel.level || "",
    coreAbilities: firstArray(jobModel.coreAbilities).slice(0, 5),
  } : null;
  return {
    jobModel: slimJobModel,
    selfIntroduction: String(input.selfIntroduction || "").trim().slice(0, 300),
    workExperience: String(input.workExperience || "").trim().slice(0, 1500),
    projectExperience: String(input.projectExperience || "").trim().slice(0, 1500),
    resumeText: String(input.resumeText || "").trim().slice(0, 1000),
    supplement: String(input.supplement || "").trim().slice(0, 300),
  };
}

function profileSystemInstruction() {
  return "你是 JobFit 的用户背景分析 Agent。结合岗位能力模型和用户填写的自我介绍、工作经历、项目经历，判断信息是否足够，并生成个人能力画像。判断标准适度：至少有一段具体经历能看出岗位、职责、行动或结果就应生成。不要过度追问。字段必须严格使用：isEnough、missingTypes、clarifyingQuestions、message、userProfile。userProfile 字段：summary、yearsOfExperience、industries、abilityTags、experienceTypes、strengths、transferableSkills、weakSignals、interviewCases。isEnough=true 时 userProfile 不能为空，abilityTags 至少 5 个，strengths 至少 3 条，transferableSkills 至少 4 个，weakSignals 至少 2 条，interviewCases 至少 1 条。";
}

function buildProfileFallback(input) {
  const text = [input.selfIntroduction, input.workExperience, input.projectExperience, input.resumeText, input.supplement].join(" ");
  const hasUsefulDetail = text.replace(/\s/g, "").length >= 30 || (text.replace(/\s/g, "").length >= 15);
  const jobAbilities = firstArray(input?.jobModel?.coreAbilities);
  const jobTitle = firstString(input?.jobModel?.title, "目标岗位");
  const extractedTags = uniqueItems([
    ...jobAbilities.slice(0, 4),
    /供应商|采购|询价|比价|合同|到货|台账/.test(text) ? "采购流程执行" : "",
    /成本|降本|价格|报价|费用/.test(text) ? "成本意识" : "",
    /沟通|协同|对接|财务|研发|生产|销售/.test(text) ? "跨部门协同" : "",
    /数据|Excel|表|台账|分析/.test(text) ? "数据整理分析" : "",
  ].filter(Boolean)).slice(0, 8);

  if (hasUsefulDetail) {
    return {
      source: "fallback",
      ...coerceProfileAnalysisResult({
        isEnough: true,
        missingTypes: [],
        clarifyingQuestions: [],
        message: "已根据当前经历生成基础能力画像。当前为兜底结果，建议稍后重新生成以获得更准确分析。",
        userProfile: {
          summary: `已围绕${jobTitle}从当前经历中提炼出基础能力画像，后续可继续补充更具体的项目、个人动作和结果。`,
          yearsOfExperience: "未明确",
          industries: input?.jobModel?.industry ? [input.jobModel.industry] : ["待结合目标岗位确认"],
          abilityTags: extractedTags.length ? extractedTags : ["业务理解", "流程执行", "资料整理", "跨部门沟通", "结果意识"],
          experienceTypes: ["日常业务执行", "跨部门协作"],
          strengths: ["有具体工作职责描述", "能体现流程处理和协作经验", "具备基础资料整理能力"],
          transferableSkills: ["结构化表达", "流程梳理", "沟通协调", "细节核对"],
          weakSignals: ["项目结果需要进一步量化", "个人贡献需要更具体"],
          interviewCases: ["当前填写的代表性工作经历"],
        },
      }),
    };
  }

  return {
    source: "fallback",
    isEnough: false,
    missingTypes: ["project_detail", "personal_contribution", "result"],
    clarifyingQuestions: [
      "请补充一段最能代表你的具体工作或项目经历。",
      "你在这段经历中具体负责什么？",
      "这件事最后产生了什么结果或产出？",
    ],
    message: "背景分析暂时未成功生成完整画像。请先补充具体经历、个人动作和结果后再试。",
    userProfile: null,
  };
}

function coerceProfileAnalysisResult(result) {
  const isEnough = Boolean(result.isEnough);
  const userProfile = result.userProfile || null;

  return {
    isEnough,
    missingTypes: Array.isArray(result.missingTypes) ? result.missingTypes : [],
    clarifyingQuestions: Array.isArray(result.clarifyingQuestions) ? result.clarifyingQuestions : [],
    message: typeof result.message === "string" ? result.message : isEnough ? "信息足够生成个人能力画像。" : "当前信息不足，需要补充后再生成个人能力画像。",
    userProfile: isEnough && userProfile ? coerceUserProfile(userProfile) : null,
  };
}

function coerceUserProfile(userProfile) {
  return {
    summary: firstString(userProfile.summary, userProfile.profileSummary, "已根据当前经历生成个人能力画像。"),
    yearsOfExperience: firstString(userProfile.yearsOfExperience, userProfile.years, "未明确"),
    industries: firstArray(userProfile.industries, userProfile.industryExperience).slice(0, 5),
    abilityTags: firstArray(userProfile.abilityTags, userProfile.coreAbilities, userProfile.skills).slice(0, 8),
    experienceTypes: firstArray(userProfile.experienceTypes, userProfile.projectTypes).slice(0, 5),
    strengths: firstArray(userProfile.strengths, userProfile.advantages).slice(0, 5),
    transferableSkills: firstArray(userProfile.transferableSkills, userProfile.transferableAbilities).slice(0, 8),
    weakSignals: firstArray(userProfile.weakSignals, userProfile.weaknesses, userProfile.risks).slice(0, 5),
    interviewCases: firstArray(userProfile.interviewCases, userProfile.representativeCases).slice(0, 5),
  };
}

function mockAnalyzeProfile(input) {
  const text = [input.workExperience, input.projectExperience, input.resumeText, input.supplement].join(" ");
  const enough = text.replace(/\s/g, "").length >= 70 || (/项目|负责|上线|结果|数据|用户|调研|PRD|原型|推进/.test(text) && text.replace(/\s/g, "").length >= 38);

  if (!enough) {
    return {
      source: "mock",
      isEnough: false,
      missingTypes: ["project_detail", "personal_contribution", "result"],
      clarifyingQuestions: [
        "请补充一个你参与过的具体项目，包括项目目标和你的角色。",
        "在这个项目中，你主要负责哪些工作？",
        "项目最后产生了什么结果？可以是数据、上线结果或业务反馈。",
      ],
      message: "当前经历描述还比较概括，暂时无法准确判断你的能力优势，需要补充具体项目和个人贡献。",
      userProfile: null,
    };
  }

  return {
    source: "mock",
    isEnough: true,
    missingTypes: [],
    clarifyingQuestions: [],
    message: "已根据当前经历生成个人能力画像。当前为本地模拟结果。",
    userProfile: {
      summary: "具备产品项目推进和需求分析基础，能够围绕目标岗位准备相关面试案例。",
      yearsOfExperience: "未明确",
      industries: ["互联网", "AI 工具"],
      abilityTags: ["需求分析", "产品设计", "用户研究", "项目推进", "数据分析"],
      experienceTypes: ["从 0 到 1 项目", "跨团队协作"],
      strengths: ["有完整产品流程经验", "能把用户需求转化为产品方案", "具备结构化表达基础"],
      transferableSkills: ["沟通协作", "需求拆解", "项目管理", "结构化表达"],
      weakSignals: ["结果量化表达不足", "AI 产品案例需要补充"],
      interviewCases: ["代表性产品项目案例"],
    },
  };
}

async function callJsonModel(system, payload, maxTokens = 2400) {
  const isDashScope = baseUrl.includes("dashscope");
  const body = {
    model,
    messages: [
      { role: "system", content: `${system}\n\n你必须只输出一个 JSON 对象，不要输出 Markdown、代码块或解释。` },
      { role: "user", content: JSON.stringify(payload) },
    ],
    max_tokens: maxTokens,
  };
  if (isDashScope) {
    body.result_format = "message";
  } else {
    body.response_format = { type: "json_object" };
  }

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, aiTimeoutMs);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI error ${response.status}:`, errorText.slice(0, 200));
    throw new Error(`AI request failed: ${response.status}`);
  }
  const data = await response.json();
  const outputText = data.choices?.[0]?.message?.content;
  if (!outputText) throw new Error("AI response missing output text");
  return parseModelJson(outputText);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function analyzeGap(input) {
  requireAiService();
  try {
    const result = await callJsonModel(
      "你是 JobFit 的能力差距分析 Agent。你要对比 jobModel 和 userProfile，输出结构化能力差距分析。字段必须包含 overallMatch、basis、gapItems、practiceFocus、riskTips。gapItems 每项必须包含 ability、jobRequirement、userCurrent、matchStatus、gapReason、interviewRisk、suggestion。matchStatus 只能使用：匹配、部分匹配、存在差距。至少输出 5 项能力分析，内容要具体，能服务后续题目生成。",
      input,
      3600,
    );
    return {
      source: "ai",
      gapAnalysis: coerceGapAnalysis(result),
    };
  } catch (error) {
    console.error("Gap analysis failed:", error.message);
    return {
      source: "fallback",
      gapAnalysis: buildGapFallback(input),
    };
  }
}

function buildGapFallback(input) {
  const jobAbilities = firstArray(input?.jobModel?.coreAbilities).length
    ? firstArray(input.jobModel.coreAbilities)
    : ["岗位核心能力", "流程执行能力", "沟通协同能力"];
  const profileTags = firstArray(input?.userProfile?.abilityTags);
  const weakSignals = firstArray(input?.userProfile?.weakSignals);
  const focus = [...new Set([...weakSignals, ...jobAbilities].filter(Boolean))].slice(0, 3);
  const gapItems = jobAbilities.slice(0, 5).map((ability, index) => {
    const hasEvidence = profileTags.some((tag) => ability.includes(tag) || tag.includes(ability));
    return {
      ability,
      jobRequirement: `岗位要求能稳定完成${ability}相关任务，并能说明具体方法和结果。`,
      userCurrent: hasEvidence ? `经历中已体现${ability}相关基础。` : "当前经历证据还不够充分。",
      matchStatus: hasEvidence ? "部分匹配" : "存在差距",
      evidenceLevel: hasEvidence ? "中" : "弱",
      depthLevel: hasEvidence ? "达到" : "低于",
      gapReason: weakSignals[index] || "需要补充更具体的案例、数据或个人动作。",
      interviewRisk: `面试中可能被追问${ability}的真实案例和结果。`,
      suggestion: `准备一个能证明${ability}的 STAR 案例。`,
    };
  });
  return {
    overallMatch: { score: 65, level: "中等匹配", summary: "已基于当前岗位能力和个人经历生成基础差距分析。" },
    gapItems,
    practiceFocus: focus.length ? focus : jobAbilities.slice(0, 3),
    riskTips: focus.map((item) => `需要补充${item}相关案例证据。`).slice(0, 3),
  };
}

function coerceGapAnalysis(result) {
  const gapAnalysis = result.gapAnalysis || result;
  const rawOverall = gapAnalysis.overallMatch;
  const overallMatch =
    typeof rawOverall === "number"
      ? { score: Math.round(rawOverall * 100), level: rawOverall >= 0.75 ? "较高匹配" : rawOverall >= 0.6 ? "中等匹配" : "存在明显差距", summary: firstString(gapAnalysis.basis, "已根据岗位和个人画像生成能力差距分析。") }
      : rawOverall || { score: 72, level: "中等匹配", summary: firstString(gapAnalysis.basis, "已根据岗位和个人画像生成能力差距分析。") };
  return {
    overallMatch,
    basis: gapAnalysis.basis || {},
    gapItems: firstArray(gapAnalysis.gapItems, gapAnalysis.abilityMatches, gapAnalysis.items).map((item) => ({
      ability: firstString(item.ability, item.name, "能力项"),
      jobRequirement: firstString(item.jobRequirement, item.requiredByJob, "岗位要求待补充"),
      userCurrent: firstString(item.userCurrent, item.userEvidence, "用户现状待补充"),
      matchStatus: firstString(item.matchStatus, item.status, "部分匹配"),
      evidenceLevel: firstString(item.evidenceLevel, item.evidence, "中"),
      depthLevel: firstString(item.depthLevel, item.depth, "达到"),
      gapReason: firstString(item.gapReason, item.reason, "需要补充更具体的能力证据"),
      interviewRisk: firstString(item.interviewRisk, item.risk, "面试中可能被追问细节"),
      suggestion: firstString(item.suggestion, item.action, "准备一个具体项目案例"),
    })).slice(0, 8),
    practiceFocus: firstArray(gapAnalysis.practiceFocus, gapAnalysis.focus).slice(0, 5),
    riskTips: firstArray(gapAnalysis.riskTips, gapAnalysis.risks).slice(0, 5),
  };
}

function mockAnalyzeGap(input = {}) {
  return {
    source: "mock",
    gapAnalysis: buildGapFallback(input),
  };
}

function buildSearchQueries(input) {
  const jobTitle = input?.jobModel?.title || input?.jobModel?.direction || "";
  const jobFamily = firstString(input?.jobModel?.direction, input?.jobModel?.jobFamily, inferJobFamily(jobTitle), "");
  const focus = firstArray(input?.gapAnalysis?.practiceFocus).filter(Boolean).slice(0, 3);
  const gapAbilities = firstArray(input?.gapAnalysis?.gapItems)
    .map((item) => item.ability)
    .filter(Boolean)
    .slice(0, 3);
  const abilities = uniqueItems([
    ...firstArray(input?.jobModel?.coreAbilities),
    ...firstArray(input?.jobModel?.keySkills),
    ...focus,
    ...gapAbilities,
  ]).slice(0, 4);

  const queries = [];
  if (jobTitle) {
    queries.push(`${jobTitle} 面试题`);
    queries.push(`${jobTitle} 面经`);
    queries.push(`${jobTitle} 常见面试问题`);
    queries.push(`${jobTitle} 面试经历`);
  }
  if (jobFamily && jobFamily !== jobTitle) {
    queries.push(`${jobFamily} 面试题`);
    queries.push(`${jobFamily} 面经`);
  }
  for (const ability of abilities.slice(0, 3)) {
    queries.push(`${ability} 面试题`);
    if (jobFamily) queries.push(`${jobFamily} ${ability} 面试题`);
    if (jobTitle) queries.push(`${jobTitle} ${ability} 面试题`);
  }
  return uniqueItems(queries).slice(0, 10);
}

function uniqueItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const normalized = String(item || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function inferJobFamily(jobTitle = "") {
  const title = String(jobTitle);
  if (/采购|供应商|供应链/.test(title)) return "采购";
  if (/财务|会计|出纳|税务/.test(title)) return "财务";
  if (/运营|增长|社群|内容/.test(title)) return "运营";
  if (/产品|PM|经理/.test(title)) return "产品经理";
  if (/数据|BI|商业分析/.test(title)) return "数据分析";
  if (/Java|后端|前端|测试|开发|工程师/.test(title)) return "研发";
  if (/销售|客户|商务/.test(title)) return "销售";
  if (/人力|招聘|HR|hr/.test(title)) return "人力资源";
  return title.replace(/专员|经理|助理|工程师|主管|总监|实习生/g, "") || title;
}

async function searchWithTavily(query) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${searchApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily search failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return (data.results || []).map((item) => ({
    title: item.title || "",
    url: item.url || "",
    content: item.content || "",
    snippet: item.content || "",
  }));
}

async function extractWithTavily(urls) {
  if (!urls.length) return [];
  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${searchApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      urls,
      extract_depth: "basic",
      format: "markdown",
      timeout: 12,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily extract failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.results || [];
}

async function searchWithSerpAPI(query) {
  const params = new URLSearchParams({
    q: query,
    api_key: searchApiKey,
    engine: "google",
    num: "5",
    hl: "zh-cn",
  });
  const response = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpAPI search failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return (data.organic_results || []).map((item) => ({
    title: item.title || "",
    url: item.link || "",
    content: item.snippet || "",
    snippet: item.snippet || "",
  }));
}

async function searchWithBing(query) {
  const params = new URLSearchParams({ q: query, count: "5", mkt: "zh-CN" });
  const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params}`, {
    headers: { "Ocp-Apim-Subscription-Key": searchApiKey },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bing search failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return (data.webPages?.value || []).map((item) => ({
    title: item.name || "",
    url: item.url || "",
    content: item.snippet || "",
    snippet: item.snippet || "",
  }));
}

async function searchWebSingle(query) {
  const provider = searchProvider.toLowerCase();
  if (provider === "tavily") return searchWithTavily(query);
  if (provider === "serpapi" || provider === "serp") return searchWithSerpAPI(query);
  if (provider === "bing") return searchWithBing(query);
  throw new Error(`Unsupported search provider: ${provider}`);
}

async function collectSearchResults(input) {
  const queries = buildSearchQueries(input);
  const resultMap = new Map();
  for (const query of queries) {
    try {
      const results = await searchWebSingle(query);
      for (const result of results) {
        if (!result.url || resultMap.has(result.url)) continue;
        resultMap.set(result.url, {
          ...result,
          matchedQuery: query,
          qualityScore: scoreSearchResult(result, query),
        });
      }
    } catch (error) {
      console.error(`Search failed for "${query}":`, error.message);
    }
  }
  const results = [...resultMap.values()]
    .filter((item) => item.qualityScore >= 0.35)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 12);
  return { queries, results };
}

async function extractSourceDocuments(results, limit = 8) {
  const selected = results.slice(0, limit);
  if (!selected.length) return [];
  if (searchProvider.toLowerCase() !== "tavily") {
    return selected.map((item) => ({
      title: item.title,
      url: item.url,
      matchedQuery: item.matchedQuery,
      qualityScore: item.qualityScore,
      rawContent: item.content || item.snippet || "",
    }));
  }
  try {
    const extracted = await extractWithTavily(selected.map((item) => item.url));
    const byUrl = new Map(extracted.map((item) => [item.url, item.raw_content || ""]));
    return selected
      .map((item) => ({
        title: item.title,
        url: item.url,
        matchedQuery: item.matchedQuery,
        qualityScore: item.qualityScore,
        rawContent: normalizeSourceContent(byUrl.get(item.url) || item.content || item.snippet || ""),
      }))
      .filter((item) => item.rawContent.length >= 120);
  } catch (error) {
    console.error("Source extraction failed:", error.message);
    return selected.map((item) => ({
      title: item.title,
      url: item.url,
      matchedQuery: item.matchedQuery,
      qualityScore: item.qualityScore,
      rawContent: item.content || item.snippet || "",
    }));
  }
}

function normalizeSourceContent(content) {
  return String(content || "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractQuestionsFromSearchResults(results) {
  const questions = [];
  for (const result of results) {
    const text = `${result.title} ${result.content}`;
    const questionPatterns = [
      /(?:面试题|面试问题|面试经验|面经)[：:]\s*(.+?)(?:[。.？?]|$)/g,
      /[Qq]\d*[：:.]\s*(.+?)(?:[。.？?]|$)/g,
      /(?:请|如何|怎么|为什么|什么是|谈谈|介绍|描述|举个|说说)(.+?)(?:[？?。.]|$)/g,
    ];
    for (const pattern of questionPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        addExtractedQuestion(questions, match[0], result);
      }
    }
    if (result.content && result.content.length > 30) {
      const sentences = result.content.split(/[。.！!？?\n]/).filter((s) => s.trim().length >= 10);
      for (const sentence of sentences.slice(0, 3)) {
        const cleaned = sentence.trim();
        if ((cleaned.includes("？") || cleaned.includes("?") || /^如何|^怎么|^为什么|^什么是|^请/.test(cleaned)) && cleaned.length >= 8 && cleaned.length <= 120) {
          addExtractedQuestion(questions, cleaned, result);
        }
      }
    }
  }
  return questions.slice(0, 15);
}

function addExtractedQuestion(questions, rawTitle, result) {
  const title = cleanQuestionTitle(rawTitle);
  if (!isLikelyInterviewQuestion(title)) return;
  if (questions.some((existing) => normalizeQuestionText(existing.title) === normalizeQuestionText(title))) return;
  questions.push({
    title,
    skills: [],
    answerThinking: "",
    referenceAnswer: "",
    sourceType: "联网检索",
    sourceName: result.title?.slice(0, 40) || "公开面经",
    sourceUrl: result.url || "",
    sourceNote: `来源：${result.title || "网络面经"}`,
  });
}

function cleanQuestionTitle(rawTitle) {
  let title = String(rawTitle || "")
    .replace(/^[\s"'“”‘’《》#>*-]+/, "")
    .replace(/^(?:问题|面试题|面试问题|Q|q)?\s*\d+[、.．:：]\s*/, "")
    .replace(/^(?:问|答|回答)[：:]\s*/, "")
    .trim();
  title = title.split(/(?:这时候|千万别|回答[:：]|答[:：]|参考答案[:：]|解析[:：])/)[0].trim();
  title = title.replace(/[。.]$/, "？");
  return title;
}

function isLikelyInterviewQuestion(title) {
  if (title.length < 8 || title.length > 120) return false;
  if (/广告|课程|下载|收藏|岗位职责|任职要求|简历模板/.test(title)) return false;
  if (/[,，、]\s*(?:供应商|评估|处理|质量|售后|风险|流程).*[等。？?]$/.test(title)) return false;
  if (/(?:并|和|或|与|及|以及|有\d+个)$/.test(title)) return false;
  if (/^(?:介绍|描述)(?!一下|你|您|一个|过往|自己|相关)/.test(title)) return false;
  if (/^(?:如何|怎么|为什么|什么是|请|谈谈|说说|介绍|描述|举例|举个|你认为|你会|你如何|您如何|您能否|面对|如果)/.test(title)) return true;
  return /[？?]$/.test(title) && /你|您|如何|怎么|为什么|什么|是否|能否|采购|供应商|成本|面试/.test(title);
}

function normalizeQuestionText(text) {
  return String(text || "").toLowerCase().replace(/[\s"'“”‘’。？！?!.，,、:：；;]/g, "");
}

async function readQuestionBank() {
  if (!existsSync(questionBankPath)) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      questions: [],
    };
  }
  try {
    const data = JSON.parse(await readFile(questionBankPath, "utf8"));
    return {
      version: data.version || 1,
      updatedAt: data.updatedAt || new Date().toISOString(),
      questions: firstArray(data.questions),
    };
  } catch (error) {
    console.error("Failed to read question bank:", error.message);
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      questions: [],
    };
  }
}

async function writeQuestionBank(bank) {
  await mkdir(dataDir, { recursive: true });
  const payload = {
    version: bank.version || 1,
    updatedAt: new Date().toISOString(),
    questions: firstArray(bank.questions),
  };
  await writeFile(questionBankPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function buildQuestionId(question) {
  const raw = normalizeQuestionText(`${question.title}|${question.sourceUrl || ""}`);
  return `q_${createHash("sha1").update(raw).digest("hex").slice(0, 12)}`;
}

function toQuestionBankRecord(input, question) {
  const jobTitle = firstString(input?.jobModel?.title, input?.jobModel?.direction, "未知岗位");
  const jobFamily = firstString(input?.jobModel?.jobFamily, input?.jobModel?.direction, inferJobFamily(jobTitle), "通用");
  const sourceSnippet = extractSourceSnippet(question.sourceNote);
  const record = {
    id: "",
    title: firstString(question.title, question.question, "常见面试题"),
    jobFamily,
    jobTitles: uniqueItems([jobTitle]),
    abilities: uniqueItems(firstArray(question.skills, question.abilities).concat(firstArray(input?.gapAnalysis?.practiceFocus))).slice(0, 8),
    questionType: firstString(question.questionType, "面试题"),
    answerThinking: firstString(question.answerThinking, "") || "",
    referenceAnswer: firstString(question.referenceAnswer, "") || "",
    sourceType: firstString(question.sourceType, "联网正文抽取"),
    sourceName: firstString(question.sourceName, "公开面经"),
    sourceUrl: firstString(question.sourceUrl, ""),
    sourceSnippet,
    sourceNote: firstString(question.sourceNote, ""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  record.id = buildQuestionId(record);
  return record;
}

function extractSourceSnippet(sourceNote = "") {
  const marker = "原文：";
  const index = sourceNote.indexOf(marker);
  return index >= 0 ? sourceNote.slice(index + marker.length).trim().slice(0, 180) : "";
}

async function persistQuestionsToBank(input, questions) {
  const records = firstArray(questions).map((question) => toQuestionBankRecord(input, question));
  if (!records.length) return { addedCount: 0, savedQuestions: [] };
  const bank = await readQuestionBank();
  const existing = new Map();
  for (const question of bank.questions) {
    existing.set(question.id || buildQuestionId(question), question);
    existing.set(normalizeQuestionText(question.title), question);
  }
  const savedQuestions = [];
  let addedCount = 0;
  for (const record of records) {
    const sameTitle = existing.get(normalizeQuestionText(record.title));
    const sameId = existing.get(record.id);
    if (sameTitle || sameId) {
      const old = sameTitle || sameId;
      old.jobTitles = uniqueItems(firstArray(old.jobTitles).concat(record.jobTitles));
      old.abilities = uniqueItems(firstArray(old.abilities).concat(record.abilities)).slice(0, 12);
      old.updatedAt = new Date().toISOString();
      savedQuestions.push(old);
      continue;
    }
    bank.questions.unshift(record);
    existing.set(record.id, record);
    existing.set(normalizeQuestionText(record.title), record);
    savedQuestions.push(record);
    addedCount += 1;
  }
  await writeQuestionBank(bank);
  return { addedCount, savedQuestions };
}

async function retrieveQuestionsFromBank(input, limit = 10) {
  const bank = await readQuestionBank();
  if (!bank.questions.length) return [];
  const queryText = buildQuestionRetrievalText(input);
  const targetFamily = inferQuestionJobFamily(input);
  return bank.questions
    .map((question) => ({
      question,
      score: scoreBankQuestion(question, queryText, targetFamily),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => bankRecordToSourceQuestion(item.question));
}

function buildQuestionRetrievalText(input) {
  return uniqueItems([
    input?.jobModel?.title,
    input?.jobModel?.direction,
    input?.jobModel?.industry,
    ...(input?.jobModel?.coreAbilities || []),
    ...(input?.jobModel?.keySkills || []),
    ...(input?.gapAnalysis?.practiceFocus || []),
    ...firstArray(input?.gapAnalysis?.gapItems).map((item) => item.ability),
  ]).join(" ");
}

function inferQuestionJobFamily(input = {}) {
  return inferJobFamily([
    input?.jobModel?.title,
    input?.jobModel?.direction,
    input?.jobModel?.industry,
  ].filter(Boolean).join(" "));
}

function scoreBankQuestion(question, queryText, targetFamily = "") {
  const questionFamily = String(question.jobFamily || "").trim();
  const questionTitles = firstArray(question.jobTitles).join(" ");
  if (targetFamily && questionFamily && questionFamily !== targetFamily) {
    const directTitleMatch = questionTitles.includes(targetFamily) || String(question.title || "").includes(targetFamily);
    if (!directTitleMatch) return 0;
  }
  const text = [
    question.title,
    question.jobFamily,
    ...(question.jobTitles || []),
    ...(question.abilities || []),
    question.questionType,
  ].join(" ");
  let score = 0;
  if (targetFamily && questionFamily === targetFamily) score += 8;
  if (targetFamily && questionTitles.includes(targetFamily)) score += 4;
  for (const term of uniqueItems(queryText.split(/\s+/))) {
    if (term && text.includes(term)) score += 1;
  }
  if (question.sourceType === "联网正文抽取") score += 0.5;
  return score;
}

function bankRecordToSourceQuestion(record) {
  return {
    title: record.title,
    skills: firstArray(record.abilities).slice(0, 4),
    questionType: record.questionType,
    answerThinking: record.answerThinking,
    referenceAnswer: record.referenceAnswer,
    sourceType: "题库沉淀",
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    sourceNote: firstString(record.sourceNote, `来源：${record.sourceName}${record.sourceUrl ? ` · ${record.sourceUrl}` : ""}`),
  };
}

async function searchQuestionSources(input) {
  if (!searchApiKey || !searchProvider) {
    return {
      source: "search",
      provider: searchProvider || "none",
      enabled: false,
      message: "未配置搜索 API Key，当前只能使用本地题库。",
      queries: buildSearchQueries(input),
      results: [],
      extractedQuestions: [],
    };
  }
  const { queries, results } = await collectSearchResults(input);
  const sourceDocuments = await extractSourceDocuments(results);
  const extractedQuestions = await extractInterviewQuestionsFromSourceDocuments(input, sourceDocuments);
  const persistence = await persistQuestionsToBank(input, extractedQuestions);
  return {
    source: "search",
    provider: searchProvider,
    enabled: true,
    queries,
    results: results.map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet || item.content,
      matchedQuery: item.matchedQuery,
      qualityScore: item.qualityScore,
    })),
    sourceDocuments: sourceDocuments.map((item) => ({
      title: item.title,
      url: item.url,
      matchedQuery: item.matchedQuery,
      qualityScore: item.qualityScore,
      contentLength: item.rawContent.length,
      preview: item.rawContent.slice(0, 220),
    })),
    extractedQuestions,
    bank: {
      addedCount: persistence.addedCount,
      savedCount: persistence.savedQuestions.length,
      path: questionBankPath,
    },
  };
}

function scoreSearchResult(result, query) {
  const text = `${result.title || ""} ${result.content || ""} ${result.snippet || ""}`.toLowerCase();
  const queryTerms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  if (/面试题|面试问题|面经|面试经验|常见问题|interview/.test(text)) score += 0.45;
  if (/招聘|职位描述|岗位职责|培训|课程|广告|下载/.test(text)) score -= 0.25;
  for (const term of queryTerms) {
    if (text.includes(term)) score += 0.08;
  }
  const url = String(result.url || "").toLowerCase();
  if (/nowcoder|牛客|zhihu|知乎|csdn|juejin|掘金|github|博客园|segmentfault|mianshiya|面试鸭|interviews\.chat/.test(url)) score += 0.15;
  if (/mianti\.zcmima\.cn\/(?:gaopinzhiwei|qiyemianjing)\//.test(url)) score += 0.2;
  if (/scribd|wk\.baidu|\/t\//.test(url)) score -= 0.18;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

async function extractInterviewQuestionsFromSourceDocuments(input, sourceDocuments) {
  if (!sourceDocuments.length) return [];
  if (!process.env.OPENAI_API_KEY) {
    return extractQuestionsFromSearchResults(sourceDocuments.map((item) => ({
      title: item.title,
      url: item.url,
      content: item.rawContent,
      snippet: item.rawContent,
    })));
  }
  const sources = sourceDocuments.slice(0, 4).map((item) => ({
    sourceTitle: item.title,
    sourceUrl: item.url,
    matchedQuery: item.matchedQuery,
    content: item.rawContent.slice(0, 7000),
  }));
  const result = await callJsonModel(
    "你是 JobFit 的题库抽取 Agent。你会收到若干公开网页正文。你的任务是只从网页正文中抽取真实出现的面试题，不能凭空编题。必须输出 JSON 对象，字段 extractedQuestions 是数组。每个题目包含 title、skills、questionType、answerThinking、referenceAnswer、sourceUrl、sourceTitle、sourceSnippet。规则：1. title 必须是网页正文中明确出现或可从正文问题句完整还原的面试题。2. 如果网页没有真实面试题，返回空数组。3. sourceSnippet 必须摘录能证明该题来源的短片段，不超过 80 字。4. answerThinking 和 referenceAnswer 只有在正文包含答案或足够明确时才填写；否则留空字符串，后续 Agent 会补。5. skills 输出 1-4 个与岗位能力相关的中文标签。6. 优先抽取专业能力题和行为面试题，过滤广告、岗位 JD、目录说明和截断句。",
    {
      jobModel: input.jobModel,
      gapAnalysis: input.gapAnalysis,
      sources,
    },
    6000,
  );
  const normalized = normalizeWebExtractedQuestions(firstArray(result.extractedQuestions, result.questions), sourceDocuments);
  if (normalized.length) return normalized;
  return extractQuestionsFromSearchResults(sourceDocuments.map((item) => ({
    title: item.title,
    url: item.url,
    content: item.rawContent,
    snippet: item.rawContent,
  })));
}

function normalizeWebExtractedQuestions(items, sourceDocuments) {
  const sourceByUrl = new Map(sourceDocuments.map((item) => [item.url, item]));
  const questions = [];
  for (const item of items) {
    const title = cleanQuestionTitle(firstString(item.title, item.question, ""));
    if (!isLikelyInterviewQuestion(title)) continue;
    if (questions.some((existing) => normalizeQuestionText(existing.title) === normalizeQuestionText(title))) continue;
    const sourceUrl = firstString(item.sourceUrl, item.url, "");
    const source = sourceByUrl.get(sourceUrl) || sourceDocuments.find((doc) => doc.title === item.sourceTitle) || {};
    const sourceTitle = firstString(item.sourceTitle, source.title, "公开面经");
    const sourceSnippet = firstString(item.sourceSnippet, item.snippet, "");
    questions.push({
      title,
      skills: firstArray(item.skills, item.abilities).slice(0, 4),
      questionType: firstString(item.questionType, "面试题"),
      answerThinking: firstString(item.answerThinking, item.thinking, ""),
      referenceAnswer: firstString(item.referenceAnswer, item.answer, ""),
      sourceType: "联网正文抽取",
      sourceName: sourceTitle.slice(0, 40),
      sourceUrl: firstString(sourceUrl, source.url, ""),
      sourceNote: `来源：${sourceTitle}${firstString(sourceUrl, source.url, "") ? ` · ${firstString(sourceUrl, source.url, "")}` : ""}${sourceSnippet ? ` · 原文：${sourceSnippet}` : ""}`,
    });
  }
  return questions.slice(0, 20);
}

async function searchWebInterviewQuestions(input) {
  if (!searchApiKey || !searchProvider) {
    console.log("No search API configured, using local question bank only.");
    return [];
  }
  const searchResult = await searchQuestionSources(input);
  console.log(`Searched ${searchResult.queries.length} queries, extracted ${searchResult.extractedQuestions.length} questions from ${searchResult.sourceDocuments?.length || 0} pages, saved ${searchResult.bank?.addedCount || 0} new questions.`);
  return searchResult.extractedQuestions;
}

function mergeSourceQuestions(webQuestions, localQuestions) {
  if (!webQuestions.length) return localQuestions;
  const merged = [...webQuestions];
  for (const local of localQuestions) {
    const isDuplicate = merged.some((web) => {
      const webTitle = web.title.toLowerCase().replace(/\s/g, "");
      const localTitle = local.title.toLowerCase().replace(/\s/g, "");
      return webTitle === localTitle || webTitle.includes(localTitle) || localTitle.includes(webTitle);
    });
    if (!isDuplicate) merged.push(local);
  }
  return merged;
}

async function generateQuestions(input) {
  const bankQuestions = await retrieveQuestionsFromBank(input);
  const localQuestions = selectReferenceQuestions(input);
  let webQuestions = [];
  if (bankQuestions.length < 5) {
    try {
      webQuestions = await searchWebInterviewQuestions(input);
    } catch (error) {
      console.warn("Question web search failed, using local references:", error.message);
      webQuestions = [];
    }
  }
  const sourceQuestions = mergeSourceQuestions([...bankQuestions, ...webQuestions], localQuestions);
  if (bankQuestions.length >= 5) {
    return buildQuestionResponseFromSources(bankQuestions, input.gapAnalysis, "question-bank");
  }
  try {
    requireAiService();
  } catch (error) {
    return buildQuestionResponseFromSources(sourceQuestions, input.gapAnalysis, "source-fallback");
  }
  try {
    const result = await callJsonModel(
      "你是 JobFit 的面试题筛选与改写 Agent。你不能凭空编题。输入里会给 sourceQuestions，它代表当前可用的题型参考资料，来自公开面经、网络资料、联网检索或本地题库。你要做两件事：1. questionReferences 必须从 sourceQuestions 中选择，保留题目、答题思路、参考答案和来源字段，不要新增 sourceQuestions 之外的参考题。2. practiceQuestions 必须基于 sourceQuestions，再结合 gapAnalysis 中的用户短板筛选或轻度改写，推荐给用户练习。重要：sourceQuestions 中有些题目来源是\"联网检索\"，它们的 answerThinking 和 referenceAnswer 可能为空字符串。遇到这种情况，你必须根据题目内容自行生成简洁的答题思路和参考答案，不能留空。来源字段（sourceType、sourceName、sourceNote）必须保留原始值，不要修改。字段必须包含 practiceQuestions 和 questionReferences。practiceQuestions 生成 3-6 道，每项包含 title、skills、recommendReason、answerThinking、referenceAnswer、sourceType、sourceName、sourceNote。questionReferences 生成 3-5 道，每项包含 title、skills、answerThinking、referenceAnswer、sourceType、sourceName、sourceNote。推荐原因必须说明这道题为什么适合当前用户的能力差距。每个字段内容要短：recommendReason 不超过 55 字，answerThinking 不超过 100 字，referenceAnswer 不超过 150 字。",
      { ...input, sourceQuestions },
      5000,
    );
    const references = normalizeQuestionReferences(firstArray(result.questionReferences, result.references), sourceQuestions).slice(0, 5);
    const practices = firstArray(result.practiceQuestions, result.questions).map((item, index) => coerceQuestion(item, references[index % Math.max(references.length, 1)] || sourceQuestions[index % sourceQuestions.length])).slice(0, 8);
    return {
      source: "ai",
      practiceQuestions: practices.length ? practices : buildPracticeQuestionsFromReferences(sourceQuestions, input.gapAnalysis),
      questionReferences: references.length ? references : sourceQuestions.slice(0, 5).map(coerceReference),
    };
  } catch (error) {
    console.error("Question generation failed:", error.message);
    return buildQuestionResponseFromSources(sourceQuestions, input.gapAnalysis, "source-fallback");
  }
}

function buildQuestionResponseFromSources(sourceQuestions, gapAnalysis, source = "source-fallback") {
  return {
    source,
    practiceQuestions: buildPracticeQuestionsFromReferences(sourceQuestions, gapAnalysis),
    questionReferences: sourceQuestions.slice(0, 5).map(coerceReference),
  };
}

function selectReferenceQuestions(input) {
  const text = [
    input?.jobModel?.title,
    input?.jobModel?.industry,
    input?.jobModel?.direction,
    ...(input?.jobModel?.coreAbilities || []),
    ...(input?.gapAnalysis?.practiceFocus || []),
    ...((input?.gapAnalysis?.gapItems || []).map((item) => item.ability)),
  ]
    .filter(Boolean)
    .join(" ");
  const bank = Object.values(referenceQuestionBank).find((item) => item.match.test(text)) || referenceQuestionBank.product;
  return bank.questions.map((question) => ({
    ...question,
    sourceType: bank.sourceType,
    sourceName: bank.sourceName,
    sourceNote: bank.sourceNote,
  }));
}

function normalizeQuestionReferences(items, sourceQuestions) {
  if (!items.length) return sourceQuestions.map(coerceReference);
  return items.map((item, index) => coerceReference(item, sourceQuestions[index % sourceQuestions.length]));
}

function buildPracticeQuestionsFromReferences(sourceQuestions, gapAnalysis) {
  const focus = firstArray(gapAnalysis?.practiceFocus, gapAnalysis?.focus);
  return sourceQuestions.slice(0, 6).map((item) =>
    coerceQuestion(
      {
        ...item,
        recommendReason: focus.length ? `匹配你的短板：${focus.slice(0, 2).join("、")}` : "来自真实题型参考，适合作为本轮练习。",
      },
      item,
    ),
  );
}

function coerceQuestion(item, fallback = {}) {
  return {
    title: firstString(item.title, item.question, fallback.title, "请介绍一个与目标岗位相关的项目案例。"),
    skills: firstArray(item.skills, item.abilityTags, item.abilities, fallback.skills).slice(0, 4),
    recommendReason: firstString(item.recommendReason, item.reason, "用于补强当前能力差距。"),
    answerThinking: firstString(item.answerThinking, item.thinking, fallback.answerThinking, "建议按背景、任务、行动、结果展开。"),
    referenceAnswer: firstString(item.referenceAnswer, item.answer, fallback.referenceAnswer, "参考答案需结合你的真实经历改写。"),
    sourceType: firstString(item.sourceType, fallback.sourceType, "本地题库"),
    sourceName: firstString(item.sourceName, fallback.sourceName, "公开面经与岗位题型整理"),
    sourceNote: firstString(item.sourceNote, fallback.sourceNote, "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。"),
  };
}

function coerceReference(item, fallback = {}) {
  return {
    title: firstString(item.title, item.question, fallback.title, "常见面试题"),
    skills: firstArray(item.skills, item.abilityTags, item.abilities, fallback.skills).slice(0, 4),
    answerThinking: firstString(item.answerThinking, item.thinking, fallback.answerThinking, "先说明思路，再结合案例。"),
    referenceAnswer: firstString(item.referenceAnswer, item.answer, fallback.referenceAnswer, "参考答案需结合你的真实经历改写。"),
    sourceType: firstString(item.sourceType, fallback.sourceType, "本地题库"),
    sourceName: firstString(item.sourceName, fallback.sourceName, "公开面经与岗位题型整理"),
    sourceNote: firstString(item.sourceNote, fallback.sourceNote, "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。"),
  };
}

function mockGenerateQuestions(input = {}, sourceQuestions = selectReferenceQuestions(input)) {
  return {
    source: "mock",
    practiceQuestions: buildPracticeQuestionsFromReferences(sourceQuestions, input.gapAnalysis),
    questionReferences: sourceQuestions.slice(0, 5).map(coerceReference),
  };
}

async function reviewAnswer(input) {
  requireAiService();
  const result = await callJsonModel(
    "你是 JobFit 的回答点评 Agent。你要基于题目、用户回答、岗位模型和能力差距生成结构化点评。字段必须包含 isEnough、message、answerReview。如果回答过短或没有真实案例，isEnough=false 并返回 clarifyingQuestions。answerReview 包含 overallScore、summary、dimensions、mainProblems、suggestions、optimizedDirection。dimensions 每项包含 name、score、comment。",
    input,
    3200,
  );
  const answerReview = result.answerReview || null;
  const hasUsableReview = Boolean(answerReview && (answerReview.summary || answerReview.overallScore || firstArray(answerReview.dimensions).length));
  return {
    source: "ai",
    isEnough: Boolean(result.isEnough) || hasUsableReview,
    clarifyingQuestions: Array.isArray(result.clarifyingQuestions) ? result.clarifyingQuestions : [],
    message: result.message || (hasUsableReview ? "已生成回答点评。" : ""),
    answerReview,
  };
}

async function reviewAnswerStreaming(input, res) {
  initSseResponse(res);
  try {
    requireAiService();
    sendSseStatus(res, "read_answer", "正在读取你的回答...");
    sendSseStatus(res, "match_question", "正在结合题目和岗位能力...");
    const rawText = await callStreamingJsonModel(
      "你是 JobFit 的回答点评 Agent。你要基于题目、用户回答、岗位模型和能力差距生成结构化点评。字段必须包含 isEnough、message、answerReview。如果回答过短或没有真实案例，isEnough=false 并返回 clarifyingQuestions。answerReview 包含 overallScore、summary、dimensions、mainProblems、suggestions、optimizedDirection。dimensions 每项包含 name、score、comment。",
      input,
      res,
      3200,
    );
    sendSseStatus(res, "generate", "正在整理点评结果...");
    const result = parseModelJson(rawText);
    const answerReview = result.answerReview || null;
    const hasUsableReview = Boolean(answerReview && (answerReview.summary || answerReview.overallScore || firstArray(answerReview.dimensions).length));
    sendSseDone(res, {
      source: "ai",
      isEnough: Boolean(result.isEnough) || hasUsableReview,
      clarifyingQuestions: Array.isArray(result.clarifyingQuestions) ? result.clarifyingQuestions : [],
      message: result.message || (hasUsableReview ? "已生成回答点评。" : ""),
      answerReview,
    });
    res.end();
  } catch (error) {
    console.error("Streaming review-answer failed:", error.message);
    sendSseError(res, error.message);
    res.end();
  }
}

function mockReviewAnswer(input) {
  return {
    source: "mock",
    isEnough: true,
    message: "已生成回答点评。",
    answerReview: {
      overallScore: 72,
      summary: "回答有基本结构，但案例证据和结果量化不足。",
      dimensions: [
        { name: "结构清晰度", score: 72, comment: "有基本顺序，但验证步骤还可以更具体。" },
        { name: "岗位贴合度", score: 68, comment: "能回应岗位方向，但缺少岗位语言。" },
        { name: "案例具体性", score: 55, comment: "缺少真实项目、指标或用户反馈。" },
        { name: "表达有效性", score: 70, comment: "观点清楚，但需要用结果证明判断。" },
      ],
      mainProblems: ["缺少量化结果", "个人贡献不够突出"],
      suggestions: ["补充真实项目", "说明验证指标"],
      optimizedDirection: "按 STAR 结构补充项目背景、个人动作和结果。",
    },
  };
}

async function generateReview(input) {
  requireAiService();
  const result = await callJsonModel(
    "你是 JobFit 的复盘总结 Agent。你要基于 answerReviews 生成本轮复盘。字段必须包含 reviewSummary。reviewSummary 只包含 overallScore、answeredCount、priorityCount、nextTypeCount、overallSummary、answeredQuestions、nextPracticeFocus。不要输出额外示例字段。answeredQuestions 每项包含 question、mainProblem、suggestion、status。",
    input,
    3600,
  );
  return { source: "ai", reviewSummary: coerceReviewSummary(input, result.reviewSummary || result) };
}

function mockGenerateReview(input) {
  const reviews = firstArray(input.answerReviews);
  return {
    source: "mock",
    reviewSummary: coerceReviewSummary(input, {
      overallScore: 66,
      answeredCount: reviews.length || 1,
      priorityCount: 3,
      nextTypeCount: 2,
      overallSummary: "能回答核心方向，但案例证据和结果表达还不够强。",
      answeredQuestions: reviews.map((review, index) => ({
        question: review.questionTitle || `练习题 ${index + 1}`,
        mainProblem: "案例证据和结果量化不足。",
        suggestion: "补充指标、结果和个人贡献。",
        status: "需复练",
      })),
      nextPracticeFocus: ["数据化表达", "AI 产品价值判断"],
    }),
  };
}

function coerceReviewSummary(input, summary = {}) {
  const reviews = firstArray(input?.answerReviews);
  const reviewScores = reviews
    .map((review) => Number(review.overallScore ?? review.score ?? review.scores?.overall))
    .filter((score) => Number.isFinite(score));
  const averageScore = reviewScores.length
    ? Math.round(reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length)
    : Number(summary.overallScore);
  const nextPracticeFocus = firstArray(summary.nextPracticeFocus, input?.gapAnalysis?.practiceFocus).slice(0, 5);
  const answeredQuestions = firstArray(summary.answeredQuestions).map((item, index) => ({
    question: firstString(item.question, item.questionTitle, reviews[index]?.questionTitle, `练习题 ${index + 1}`),
    mainProblem: firstString(item.mainProblem, firstArray(item.mainProblems, reviews[index]?.mainProblems)[0], "需要补充更具体的回答证据。"),
    suggestion: firstString(item.suggestion, firstArray(item.suggestions, reviews[index]?.suggestions)[0], "补充项目背景、个人动作和结果。"),
    status: normalizeReviewStatus(firstString(item.status, "需复练")),
  }));
  return {
    overallScore: Number.isFinite(averageScore) ? averageScore : 66,
    answeredCount: Number(summary.answeredCount) || reviews.length,
    priorityCount: Number(summary.priorityCount) || nextPracticeFocus.length,
    nextTypeCount: Number(summary.nextTypeCount) || Math.min(2, Math.max(1, nextPracticeFocus.length)),
    overallSummary: firstString(summary.overallSummary, "已根据本轮答题生成复盘。"),
    answeredQuestions: answeredQuestions.length ? answeredQuestions : reviews.map((review, index) => ({
      question: firstString(review.questionTitle, `练习题 ${index + 1}`),
      mainProblem: firstString(firstArray(review.mainProblems)[0], "需要补充更具体的回答证据。"),
      suggestion: firstString(firstArray(review.suggestions)[0], "补充项目背景、个人动作和结果。"),
      status: "需复练",
    })),
    nextPracticeFocus,
  };
}

function normalizeReviewStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (["pass", "passed", "good", "complete", "completed", "通过"].includes(normalized)) return "通过";
  if (["weak", "incomplete", "todo", "待巩固"].includes(normalized)) return "待巩固";
  return "需复练";
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
