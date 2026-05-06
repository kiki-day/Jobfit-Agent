const state = {
  currentStep: "job",
  jobModelReady: false,
  profileReady: false,
  gapReady: false,
  reviewReady: false,
  selectedQuestion: 0,
  practiceMode: "round",
  questionScope: "all",
  abilityFilter: "all",
  jobTitle: "",
  jobModel: null,
  userProfile: null,
  gapAnalysis: null,
  profileSource: "",
  gapSource: "",
  questionSource: "",
  answerReviews: [],
  reviewSummary: null,
  reviewSelectedIndex: 0,
};

const jobModelTemplates = {
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

let practiceQuestions = [
  {
    title: "如何从 0 到 1 设计并验证一款 AI 产品的核心价值？",
    skills: ["AI 产品理解", "产品策略", "用户验证"],
  },
  {
    title: "如何用数据判断一次产品改版是否有效？",
    skills: ["数据分析", "指标判断", "复盘能力"],
  },
  {
    title: "如果用户需求和业务目标冲突，你会怎么处理？",
    skills: ["产品判断", "优先级", "沟通影响力"],
  },
  {
    title: "讲一个你用用户反馈推动产品迭代的案例。",
    skills: ["用户研究", "需求判断", "方案迭代"],
  },
  {
    title: "如何判断一个 AI 功能是真需求，而不是为了 AI 而 AI？",
    skills: ["AI 产品价值", "场景判断", "需求验证"],
  },
  {
    title: "复盘一个你做得不够好的项目，你会如何改进？",
    skills: ["复盘能力", "自我认知", "改进意识"],
  },
];

let questionReferences = [
  {
    title: "如何设计一个 AI 产品的用户画像？",
    skills: ["用户画像", "AI 产品"],
    answerThinking: "先说明用户分层，再说明使用场景和核心需求。",
    referenceAnswer: "可以从目标用户、使用频次、核心任务和成功指标四个维度拆分。",
    sourceType: "本地题库",
    sourceName: "公开面经与产品岗位题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
  },
  {
    title: "如何衡量 AI 产品的用户体验好坏？",
    skills: ["体验指标", "数据分析"],
    answerThinking: "结合任务完成率、人工修正率、满意度和留存观察。",
    referenceAnswer: "我会先定义核心任务，再用完成率、耗时、修正率和主观满意度一起判断。",
    sourceType: "本地题库",
    sourceName: "公开面经与产品岗位题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
  },
  {
    title: "如何向非技术团队解释 AI 能力边界？",
    skills: ["AI 能力边界", "跨团队沟通"],
    answerThinking: "用场景、可做、不可做、风险和兜底来解释。",
    referenceAnswer: "我会避免讲模型术语，而是用业务例子说明 AI 适合处理什么、不适合承诺什么。",
    sourceType: "本地题库",
    sourceName: "公开面经与产品岗位题型整理",
    sourceNote: "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。",
  },
];

const defaultPracticeQuestions = practiceQuestions.map((item) => ({ ...item }));
const defaultQuestionReferences = questionReferences.map((item) => ({ ...item }));

const docsContent = {
  job: {
    title: "职位分析页说明",
    sections: [
      {
        heading: "页面定位",
        items: ["职位分析页是 JobFit 的第一步。它的核心任务不是让用户填写完整岗位资料，而是先提供一个足够明确的目标岗位，让系统生成后续分析所需的 <code>jobModel</code>。"],
      },
      {
        heading: "需求描述",
        items: ["用户输入目标岗位名称，并可选择粘贴岗位 JD 或补充岗位方向、行业、年限等信息。", "系统判断岗位信息是否足够清晰：足够则生成岗位能力模型，不足则先展示补充问题。"],
      },
      {
        heading: "业务规则",
        items: ["职位分析是整个主流程的第一步。", "未生成岗位能力模型前，不允许进入背景填写后的完整分析流程。", "目标岗位为必填项，JD 和补充信息为选填项。", "JD 不是必填内容，但填写 JD 会提升岗位能力模型的准确度。", "岗位能力模型保存为 <code>jobModel</code>，后续页面直接读取该状态。"],
      },
      {
        heading: "页面字段",
        items: ["目标职位：必填，建议 2-80 字，例如 AI 产品经理、Java 开发工程师。", "职位描述 JD：选填，建议包含岗位职责和任职要求。", "行业 / 业务场景：选填，例如互联网、金融科技、教育、AI 工具。", "岗位方向：选填，例如 B 端产品、增长产品、AI 产品。", "工作年限 / 职级：选填，例如 1-3 年、中级、高级。", "其他补充：选填，例如偏策略、偏落地、需要带团队。"],
      },
      {
        heading: "功能描述",
        items: ["用户输入目标岗位。", "用户可选择粘贴岗位 JD。", "用户可选择填写行业、岗位方向、年限和其他补充信息。", "用户点击“生成岗位能力模型”。", "系统校验输入内容并判断岗位信息是否足够清晰。", "信息不足时展示补充问题，信息足够时展示岗位能力模型。", "用户可点击“修改信息”重新编辑，也可点击“下一步：完善个人背景”进入下一步。"],
      },
      {
        heading: "交互规则",
        items: ["初始状态下，状态标签显示“待填写”，结果区和补充问题区不展示，下一步按钮不可用或弱化。", "点击“生成岗位能力模型”后，系统先校验目标职位是否为空，再判断岗位名称是否过于模糊。", "若信息不足，展示“需要补充的信息”。", "若信息足够，按钮进入 loading，结束后展示岗位能力模型，状态标签更新为“已生成”。", "点击“修改信息”后，保留当前输入内容，隐藏结果区，状态恢复为“待填写”。", "点击下一步时，系统检查 <code>jobModel</code> 是否存在，存在才进入背景填写页。"],
      },
      {
        heading: "异常规则",
        items: ["目标职位为空：提示“请输入目标职位”，不允许生成。", "岗位名称过于模糊：例如只写“产品”“运营”“开发”，展示补充问题，暂不进入结果。", "JD 信息过短：提示可补充职责、任职要求、业务方向；不强制阻断，但结果可能较泛。", "未来接 AI 后接口失败：提示“生成失败，请稍后重试”，不允许进入下一步。"],
      },
      {
        heading: "补充问题规则",
        items: ["当前流程中，补充问题可以先固定为：这个岗位主要面向哪个行业或业务场景？", "这个岗位更偏哪个方向，例如 B 端、增长、策略、AI 产品？", "目标岗位大概要求几年经验或什么职级？", "真实 Agent 版本中，补充问题不应写死，而应由 AI 根据用户输入动态生成。"],
      },
      {
        heading: "结果展示",
        items: ["生成成功后展示岗位能力模型，建议包含核心职责、核心能力、关键技能和面试关注点。", "示例核心能力：产品规划与策略、用户研究与需求分析、数据分析与决策、AI 产品理解、项目管理与协同。"],
      },
      {
        heading: "字段 / 状态",
        items: ["生成成功后保存 <code>jobModel</code>。", "<code>jobModel</code> 建议包含 title、industry、direction、level、responsibilities、coreAbilities、keySkills、interviewFocus。"],
      },
      {
        heading: "AI / Agent 规则",
        items: ["当前产品可先用前端规则判断信息是否足够。", "可先用固定示例生成岗位能力模型，用固定补充问题模拟 Agent 追问。", "真实 Agent 阶段，AI 根据岗位名称、JD 和补充信息判断完整度，动态生成补充问题和结构化岗位能力模型。"],
      },
      {
        heading: "验收标准",
        items: ["用户不输入目标职位时，不能生成岗位能力模型。", "用户输入过于模糊时，能看到补充问题。", "用户输入足够信息后，能看到岗位能力模型。", "岗位能力模型生成后，下一步按钮可用。", "进入背景填写页后，不需要用户重新输入岗位信息。"],
      },
    ],
  },
  background: {
    title: "背景填写页说明",
    sections: [
      {
        heading: "页面定位",
        items: ["背景填写页是 JobFit 的第二步，承接 <code>jobModel</code>，产出后续能力差距分析所需的 <code>userProfile</code>。"],
      },
      {
        heading: "需求描述",
        items: ["用户输入工作经历、项目经历和可选简历文本，系统判断背景信息是否足够用于能力画像提炼。", "信息足够时生成个人能力画像，信息不足时展示补充问题。"],
      },
      {
        heading: "业务规则",
        items: ["必须先完成职位分析。", "工作经历和项目经历不要求全部填写，但至少需要一类有效经历内容。", "当前不做文件上传，先用文本粘贴验证主流程。", "个人能力画像保存为 <code>userProfile</code>，供能力差距分析使用。"],
      },
      {
        heading: "页面字段",
        items: ["工作经历描述：建议包含岗位、职责、项目和结果。", "项目经历描述：建议包含背景、任务、行动、结果。", "简历文本粘贴：选填，可粘贴简历中的经历部分。"],
      },
      {
        heading: "功能描述",
        items: ["用户输入工作经历、项目经历或简历文本。", "点击“生成个人能力画像”。", "系统校验并判断信息是否足够。", "信息不足时展示补充问题，信息足够时展示个人能力画像。", "用户可修改信息，也可进入能力差距分析。"],
      },
      {
        heading: "交互规则",
        items: ["初始状态下，能力画像结果区和补充问题区不展示，下一步不可用或弱化。", "点击生成后，系统判断是否包含项目、职责、动作、结果等关键信息。", "若信息不足，展示补充问题。", "若信息足够，进入 loading，随后展示能力画像并解锁下一步。", "点击修改信息后，保留输入内容，隐藏结果区，状态恢复为待填写。"],
      },
      {
        heading: "异常规则",
        items: ["经历内容为空：提示补充工作经历或项目经历。", "内容过短：展示补充问题，暂不进入结果。", "缺少项目职责：追问具体职责和关键动作。", "缺少结果产出：追问上线结果、指标或用户反馈。", "与目标岗位关系不清：追问最相关项目或岗位方向。"],
      },
      {
        heading: "补充问题规则",
        items: ["你在项目中主要负责什么？", "这个项目最后有什么结果？例如上线、转化提升、效率提升、用户反馈等。", "哪段经历最能证明你适合当前目标岗位？", "真实 Agent 版本中，补充问题应由 AI 根据用户输入动态生成。"],
      },
      {
        heading: "结果展示",
        items: ["个人能力画像建议展示综合能力匹配度、经验年限、主要行业经验、优势能力、相关项目经验、可迁移能力和可能薄弱项。"],
      },
      {
        heading: "字段 / 状态",
        items: ["生成成功后保存 <code>userProfile</code>。", "<code>userProfile</code> 建议包含 years、industries、strengths、projectExperience、transferableSkills、weakSignals。"],
      },
      {
        heading: "AI / Agent 规则",
        items: ["当前可先用文本长度和关键词判断信息是否足够。", "真实 Agent 阶段，AI 从用户文本中提炼能力、经验、项目和结果，并判断哪些经历更贴合目标岗位。"],
      },
      {
        heading: "验收标准",
        items: ["未填写任何经历时不能生成能力画像。", "输入过短时能看到补充问题。", "信息足够后能看到个人能力画像。", "能力画像生成后，下一步按钮可用。"],
      },
    ],
  },
  ability: {
    title: "能力差距分析页说明",
    sections: [
      {
        heading: "页面定位",
        items: ["能力差距分析页是 JobFit 的核心判断页。它把 <code>jobModel</code> 和 <code>userProfile</code> 进行对比，产出 <code>gapAnalysis</code>，并为模拟面试提供题目依据。"],
      },
      {
        heading: "需求描述",
        items: ["用户不需要新增输入。系统基于前两步结果输出能力匹配、能力差距、面试风险和优先练习方向。", "这一页的目标是帮助用户做准备决策，而不是展示复杂图表。"],
      },
      {
        heading: "业务规则",
        items: ["必须同时存在 <code>jobModel</code> 和 <code>userProfile</code>。", "缺少任一状态时，不生成分析结果。", "能力差距分析会作为后续模拟面试的题目推荐依据。", "核心差距应直接展示在页面中，不藏进弹窗。"],
      },
      {
        heading: "展示项",
        items: ["分析依据：岗位能力模型和用户能力画像摘要。", "综合匹配概览：整体匹配判断。", "能力差距表：能力项、岗位要求、用户现状、差距、风险、建议。", "面试风险提示。", "下一步练习方向。"],
      },
      {
        heading: "功能描述",
        items: ["系统读取 <code>jobModel</code> 和 <code>userProfile</code>。", "用户点击“生成能力差距分析”。", "系统生成能力匹配和差距结果。", "页面展示完整能力差距表、面试风险和优先练习方向。", "用户点击“开始模拟面试”进入下一步。"],
      },
      {
        heading: "交互规则",
        items: ["前置条件不足时，页面展示阻断提示，不展示能力差距结果。", "点击生成后，系统检查 <code>jobModel</code> 和 <code>userProfile</code> 是否存在。", "状态完整时进入 loading，随后展示分析依据和能力差距结果。", "生成成功后解锁模拟面试页。"],
      },
      {
        heading: "异常规则",
        items: ["缺少岗位能力模型：提示先完成职位分析。", "缺少个人能力画像：提示先完成背景填写。", "背景信息过弱：建议返回背景填写页补充经历。", "未来接 AI 后生成失败：提示稍后重试。"],
      },
      {
        heading: "能力差距表规则",
        items: ["建议包含能力项、岗位要求、用户现状、匹配状态、主要差距、面试风险、建议动作。", "匹配状态可使用：匹配、部分匹配、存在差距。"],
      },
      {
        heading: "字段 / 状态",
        items: ["输入状态：<code>jobModel</code>、<code>userProfile</code>。", "输出状态：<code>gapAnalysis</code>。", "<code>gapAnalysis</code> 建议包含 overallMatch、matchedAbilities、partialAbilities、gapAbilities、interviewRisks、practiceFocus。"],
      },
      {
        heading: "AI / Agent 规则",
        items: ["当前可先用固定差距表或简单规则匹配。", "真实 Agent 中，AI 对比 <code>jobModel</code> 和 <code>userProfile</code>，解释每个差距为什么成立，并判断哪些差距会影响面试表现。", "题目推荐必须来自差距项，而不是通用题库。"],
      },
      {
        heading: "验收标准",
        items: ["未完成前两步时，能力分析页能正确阻断。", "状态完整时能生成能力差距分析。", "页面能完整展示差距，而不是只展示总分。", "用户能理解下一步为什么要练这些题。"],
      },
    ],
  },
  practice: {
    title: "模拟面试页说明",
    sections: [
      {
        heading: "页面定位",
        items: ["模拟面试页是 JobFit 的第四步。它让用户围绕能力差距真实作答，暴露回答问题，并生成可用于复盘的 <code>answerReviews</code>。", "本页同时包含练习行为和学习行为：提交答案进入复盘，只看题型参考不进入复盘。"],
      },
      {
        heading: "需求描述",
        items: ["系统基于能力差距生成推荐练习方向和练习题。", "用户可以批量练习、单题练习，也可以查看题型参考辅助理解。", "只有提交回答后，系统才生成点评数据并进入复盘。"],
      },
      {
        heading: "业务规则",
        items: ["必须先完成能力差距分析。", "推荐题来自 <code>gapAnalysis</code>，不是通用题库。", "批量练习不限制题目数量。", "题型参考是辅助学习，不计入复盘。", "只有已提交回答的题目才进入复盘。"],
      },
      {
        heading: "页面模块",
        items: ["本次优先练习方向。", "开始批量练习。", "为你推荐练习题。", "题型参考。", "答题弹窗。", "回答点评。"],
      },
      {
        heading: "功能描述",
        items: ["页面展示本次优先练习方向、批量练习入口、个性化推荐练习题和题型参考表格。", "用户进入答题弹窗，输入回答并提交。", "系统判断回答是否足够具体；不足时提示补充，足够时生成回答点评。", "用户可继续下一题或查看复盘。"],
      },
      {
        heading: "交互规则",
        items: ["点击“开始批量答题”后，打开弹窗，从推荐题第一题开始连续答题。", "点击推荐题“答题”后，只练当前题。", "查看题型参考中的思路和参考答案不会保存为答题记录。", "点击“用这题练习”后，从题型参考进入答题。", "提交回答后，系统校验回答，足够时生成点评、保存 <code>answerReview</code> 并解锁复盘入口。"],
      },
      {
        heading: "异常规则",
        items: ["回答为空：提示输入回答，不生成点评。", "回答过短：提示补充真实项目、关键动作和结果，不生成点评。", "缺少案例：提示补充具体项目案例。", "缺少结果：提示补充产出结果，可生成但标记为不足。", "只看参考：不进入复盘。"],
      },
      {
        heading: "回答点评规则",
        items: ["当前页面可以固定展示结构清晰度、岗位贴合度、案例具体性、表达有效性。", "真实产品中，每道题的具体点评内容应由 AI 根据题目和回答生成。", "原则是 UI 结构相对固定，评价内容动态生成。"],
      },
      {
        heading: "字段 / 状态",
        items: ["输入状态：<code>gapAnalysis</code>。", "输出状态：<code>practiceQuestions</code>、<code>answerReviews</code>。", "<code>answerReviews</code> 建议包含 questionTitle、abilityTags、userAnswer、scores、mainProblems、suggestions。"],
      },
      {
        heading: "AI / Agent 规则",
        items: ["当前可先用固定题目列表和规则判断回答长度。", "真实 Agent 阶段，AI 根据 <code>gapAnalysis</code> 生成练习题，根据题目和用户回答生成点评，并判断回答是否足够进入复盘。"],
      },
      {
        heading: "验收标准",
        items: ["未完成能力分析时，不能进入模拟面试。", "用户可以从批量练习和单题推荐进入答题。", "只查看题型参考不会进入复盘。", "回答过短时能看到补充提示。", "提交有效回答后，能看到点评并进入复盘。"],
      },
    ],
  },
  improve: {
    title: "复盘提升页说明",
    sections: [
      {
        heading: "页面定位",
        items: ["复盘提升页是当前产品的第五步。它不是结束页，而是下一轮练习的起点。", "它把用户已提交回答从“一次答题结果”转化成“下一步可执行的提升计划”。"],
      },
      {
        heading: "需求描述",
        items: ["系统基于用户已经提交过的回答点评，生成本次练习诊断报告。", "复盘内容包括本轮综合表现、主要失分原因、能力短板排序、答题质量分布、下一批练习依据和答过题详情。"],
      },
      {
        heading: "业务规则",
        items: ["必须至少存在一条有效 <code>answerReview</code>。", "复盘只基于用户提交过的回答。", "只查看题型参考或参考答案，不进入复盘。", "答过的题默认展示最近 10 条。", "底部只保留继续练习下一批题入口。"],
      },
      {
        heading: "页面模块",
        items: ["本轮综合表现。", "有效答题数。", "主要失分原因统计。", "能力短板排序。", "答题质量分布。", "下一批练习依据。", "答过的题与本题复盘详情。"],
      },
      {
        heading: "功能描述",
        items: ["系统检查是否存在 <code>answerReviews</code>。", "若不存在，展示无法生成复盘的提示。", "若存在，按答题分数、问题标签和建议动作生成练习诊断报告。"],
      },
      {
        heading: "交互规则",
        items: ["未完成练习进入复盘页时，展示“暂时无法生成复盘”，提示至少完成一道模拟题点评，并提供返回模拟面试入口。", "已完成练习进入复盘页时，展示数据诊断和最近 10 条答题记录。", "点击答过的题可切换右侧本题复盘详情。", "点击“继续练习下一批题”进入下一轮练习。"],
      },
      {
        heading: "异常规则",
        items: ["没有答题记录：提示先完成模拟面试，不生成复盘。", "只有查看记录：提示查看参考不计入复盘。", "点评无效：提示需要提交有效回答。", "记录超过 10 条：默认展示最近 10 条。"],
      },
      {
        heading: "答过题展示规则",
        items: ["答过的题默认展示最近 10 条。", "每条记录展示题目、本题得分、主要问题和状态。", "选中题目后，右侧展示本题得分、命中问题、评分维度、面试风险、主要问题和改进建议。"],
      },
      {
        heading: "字段 / 状态",
        items: ["输入状态：<code>answerReviews</code>。", "输出状态：<code>reviewSummary</code>、<code>nextPracticeFocus</code>。", "统计项由本轮点评结果计算，AI 负责总结问题和生成下一批练习方向。"],
      },
      {
        heading: "AI / Agent 规则",
        items: ["规则负责计算平均分、问题出现次数、答题质量分布和本题风险。", "AI 基于 <code>answerReviews</code> 总结共性短板，并基于复盘结果生成下一批巩固练习方向。", "复盘要服务下一轮练习，不只是结束总结。"],
      },
      {
        heading: "验收标准",
        items: ["未提交回答时不能生成复盘。", "只查看参考答案时不能生成复盘。", "提交有效回答后，复盘页能展示本轮数据诊断、答过的题和本题复盘详情。", "底部只保留继续练习下一批题入口。"],
      },
    ],
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function show(el) {
  if (!el) return;
  el.classList.remove("hidden");
}

function hide(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function setStep(step) {
  if (step === "background" && !state.jobModelReady) return;
  if (step === "ability" && !state.profileReady) {
    state.currentStep = "ability";
    $("#job-screen").classList.remove("active");
    $("#background-screen").classList.remove("active");
    $("#ability-screen").classList.add("active");
    show($("#ability-blocked"));
    hide($("#ability-loading"));
    hide($("#ability-ready"));
    const ab = $("#analysis-basis"); if (ab) ab.classList.add("hidden");
    const gr = $("#gap-result"); if (gr) gr.classList.add("hidden");
    updateStepPills("ability");
    renderDocs("ability");
    return;
  }
  if (step === "practice" && !state.gapReady) return;
  if (step === "improve" && !state.reviewReady) {
    state.currentStep = "improve";
    $("#job-screen").classList.remove("active");
    $("#background-screen").classList.remove("active");
    $("#ability-screen").classList.remove("active");
    $("#practice-screen").classList.remove("active");
    $("#improve-screen").classList.add("active");
    show($("#improve-blocked"));
    hide($("#improve-result"));
    updateStepPills("improve");
    renderDocs("improve");
    return;
  }

  state.currentStep = step;
  $("#job-screen").classList.toggle("active", step === "job");
  $("#background-screen").classList.toggle("active", step === "background");
  $("#ability-screen").classList.toggle("active", step === "ability");
  $("#practice-screen").classList.toggle("active", step === "practice");
  $("#improve-screen").classList.toggle("active", step === "improve");

  if (step === "ability") {
    prepareAbilityPage();
  }
  if (step === "improve") {
    prepareImprovePage();
  }

  updateStepPills(step);
  renderDocs(step);
}

function updateStepPills(step) {
  $$(".step-pill").forEach((pill) => {
    const target = pill.dataset.stepTarget;
    pill.classList.toggle("active", target === step);
    if (target === "background") {
      pill.classList.toggle("locked", !state.jobModelReady);
    }
    if (target === "ability") {
      pill.classList.toggle("locked", !state.profileReady);
    }
    if (target === "practice") {
      pill.classList.toggle("locked", !state.gapReady);
    }
    if (target === "improve") {
      pill.classList.toggle("locked", !state.reviewReady);
    }
  });
}

function renderDocs(step = state.currentStep) {
  const doc = docsContent[step];
  if (!doc) return;
  $("#docs-title").textContent = doc.title;
  $("#docs-body").innerHTML = doc.sections
    .map(
      (section) => `
        <section class="docs-section">
          <h3>${section.heading}</h3>
          <ul>
            ${section.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      `,
    )
    .join("");
}

function toggleDocs(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !document.body.classList.contains("docs-open");
  document.body.classList.toggle("docs-open", shouldOpen);
  $("#docs-panel").setAttribute("aria-hidden", String(!shouldOpen));
  $("#toggle-docs").setAttribute("aria-expanded", String(shouldOpen));
  $("#toggle-docs").classList.toggle("active", shouldOpen);
  if (shouldOpen) {
    renderDocs();
  }
}

function getTextLength(...values) {
  return values.join("").trim().replace(/\s/g, "").length;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSourceMeta(source) {
  const map = {
    ai: { label: "AI 实时生成", className: "success", note: "基于当前岗位模型和你填写的背景动态生成。" },
    fallback: { label: "兜底规则生成", className: "warning", note: "AI 响应超时或失败时启用，结果会按岗位和经历做基础推断。" },
    "question-bank": { label: "题库召回", className: "success", note: "本轮题目来自已沉淀题库。" },
    "source-fallback": { label: "来源兜底", className: "warning", note: "AI 筛选超时后，直接使用可用题源返回。" },
  };
  return map[source] || { label: source || "未知来源", className: "", note: "当前来源未标记。" };
}

function setStreamWaiting(selector) {
  const el = $(selector);
  if (el) el.textContent = "正在等待 AI 返回分析内容...";
}

function looksLikeStructuredChunk(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return true;
  if (/^[\{\}\[\],:"\s\dA-Za-z_\-]+$/.test(trimmed) && /["\{\}\[\]:]/.test(trimmed)) return true;
  if (/^["']?[A-Za-z0-9_]+["']?\s*:/.test(trimmed)) return true;
  if (/[{}\[\]]/.test(trimmed) && /"[^"]+"\s*:/.test(trimmed)) return true;
  return false;
}

function toNaturalStreamText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return "";
  if (looksLikeStructuredChunk(raw)) return "正在整理结构化结果...\n";
  return raw
    .replace(/```(?:json|javascript|js)?/gi, "")
    .replace(/```/g, "")
    .replace(/[{}[\]",]/g, "")
    .replace(/^\s*[A-Za-z0-9_]+\s*:\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

function appendStreamingText(selector, text) {
  const el = $(selector);
  if (!el) return;
  const displayText = toNaturalStreamText(text);
  if (!displayText.trim()) return;
  if (el.textContent === "正在等待 AI 返回分析内容...") el.textContent = "";
  if (displayText === "正在整理结构化结果...\n" && el.textContent.includes("正在整理结构化结果")) return;
  el.textContent += displayText;
  el.scrollTop = el.scrollHeight;
}

async function requestStreamingJson(endpoint, payload, handlers = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `${endpoint} 调用失败`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const eventText of events) {
      const lines = eventText.split("\n");
      const eventLine = lines.find((line) => line.startsWith("event:"));
      const dataLine = lines.find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      const eventName = eventLine ? eventLine.slice(6).trim() : "message";
      const data = JSON.parse(dataLine.slice(5).trim());
      if (eventName === "status") handlers.onStatus?.(data);
      if (eventName === "content") handlers.onContent?.(data.text || "");
      if (eventName === "done") donePayload = data;
      if (eventName === "error") throw new Error(data.message || `${endpoint} 调用失败`);
    }
  }
  if (!donePayload) throw new Error(`${endpoint} 未返回最终结果`);
  return donePayload;
}

function renderSourceBadge(containerSelector, source) {
  const container = $(containerSelector);
  if (!container) return;
  const meta = getSourceMeta(source);
  const existing = container.querySelector(".result-source-badge");
  if (existing) existing.remove();
  const badge = document.createElement("span");
  badge.className = `status-badge result-source-badge ${meta.className}`.trim();
  badge.title = meta.note;
  badge.textContent = meta.label;
  container.appendChild(badge);
}

function detectJobModel(input) {
  const text = input.signalText || "";
  const matchedTemplate =
    Object.values(jobModelTemplates).find((template) => template.match.test(text)) ||
    jobModelTemplates.aiProduct;

  return {
    title: input.title || matchedTemplate.defaultTitle,
    industry: input.industry || matchedTemplate.industry,
    direction: input.direction || matchedTemplate.direction,
    level: input.level || "示例未填写",
    responsibilities: matchedTemplate.responsibilities,
    coreAbilities: matchedTemplate.coreAbilities,
    keySkills: matchedTemplate.keySkills,
    interviewFocus: matchedTemplate.interviewFocus,
  };
}

function buildLocalQuestionsForCurrentJob() {
  const title = state.jobModel?.title || state.jobTitle || "目标岗位";
  const abilities = state.jobModel?.coreAbilities?.length ? state.jobModel.coreAbilities : ["岗位核心能力", "流程执行能力", "沟通协作"];
  const skills = state.jobModel?.keySkills?.length ? state.jobModel.keySkills : abilities;
  const isFinance = /财务|会计|出纳|税务|报销|凭证|结账|总账|发票/.test(`${title} ${state.jobModel?.direction || ""}`);
  const financeQuestions = [
    { title: "请介绍一次你处理月度结账或账务核对的经历。", skills: ["月度结账执行", "账务核对", "问题排查"] },
    { title: "如果发现员工报销单据或发票不合规，你会怎么处理？", skills: ["费用合规审核", "发票审核", "沟通协作"] },
    { title: "你如何保证凭证录入和账务处理的准确性？", skills: ["会计准则应用", "凭证录入", "账务准确性"] },
    { title: "请讲一次你配合税务申报或发票管理的经验。", skills: ["税务申报协同", "发票管理", "资料整理"] },
    { title: "业务部门对费用报销规则不理解时，你会如何沟通？", skills: ["跨部门沟通", "费用制度执行", "流程规范"] },
  ];
  const genericQuestions = abilities.slice(0, 5).map((ability) => ({
    title: `请讲一个能体现你${ability}的真实工作案例。`,
    skills: [ability, skills[0] || "岗位能力"],
  }));
  const base = isFinance ? financeQuestions : genericQuestions;
  const decorate = (item) => ({
    ...item,
    recommendReason: `围绕${title}的核心能力进行练习。`,
    answerThinking: "建议按背景、任务、行动、结果展开，重点说明你的个人动作和可验证结果。",
    referenceAnswer: `示例结构：在${title}相关场景中，我会先说明业务背景和目标，再讲我负责的关键动作，最后补充结果、指标或风险控制效果。`,
    sourceType: "当前岗位兜底题",
    sourceName: `${title}题型兜底`,
    sourceNote: "接口不可用或联网题源不足时，基于当前岗位能力模型生成，避免沿用其他岗位题目。",
  });
  const questions = base.map(decorate);
  return {
    practiceQuestions: questions,
    questionReferences: questions.slice(0, 5),
  };
}

function resetPracticeAndReviewState() {
  practiceQuestions = defaultPracticeQuestions.map((item) => ({ ...item }));
  questionReferences = defaultQuestionReferences.map((item) => ({ ...item }));
  state.selectedQuestion = 0;
  state.questionScope = "all";
  state.abilityFilter = "all";
  state.answerReviews = [];
  state.reviewSummary = null;
  state.reviewSelectedIndex = 0;
  state.reviewReady = false;
}

function renderJobModel(jobModel) {
  $("#job-result-subtitle").textContent = `${jobModel.title} · ${jobModel.direction} · ${jobModel.level}`;
  $("#job-summary-text").textContent = `${jobModel.title} · ${jobModel.direction} · 已生成职位能力模型`;
  { const bj = $("#basis-job-title"); if (bj) bj.textContent = jobModel.title; }

  const blocks = $$("#job-result .result-block");
  if (blocks[0]) blocks[0].querySelector("ul").innerHTML = jobModel.responsibilities
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
  const abilitiesEl = $("#job-core-abilities");
  if (abilitiesEl) abilitiesEl.innerHTML = (jobModel.coreAbilities || [])
    .slice(0, 6)
    .map((item, index) => renderCleanAbilityRow(item, index, "岗位核心要求"))
    .join("");
  const skillsEl = $("#job-key-skills");
  if (skillsEl) skillsEl.innerHTML = (jobModel.keySkills || [])
    .slice(0, 8)
    .map((item) => `<span>${escapeHTML(item)}</span>`)
    .join("");
  const focusEl = $("#job-interview-focus");
  if (focusEl) focusEl.innerHTML = (jobModel.interviewFocus || [])
    .slice(0, 6)
    .map((item) => `<div><span></span><p>${escapeHTML(item)}</p></div>`)
    .join("");
}

function renderCleanAbilityRow(item, index, note) {
  return `
    <div class="clean-ability-row">
      <span class="clean-index">${index + 1}</span>
      <div>
        <strong>${escapeHTML(item)}</strong>
        <p>${escapeHTML(note)}</p>
      </div>
    </div>
  `;
}

function renderJobClarification(result) {
  const message = result.message || "这个职位方向还不够清晰，暂时无法生成准确的职位能力模型。";
  $("#job-clarify .card-title-row p").textContent = message;
  $("#job-clarify .question-list").innerHTML = (result.clarifyingQuestions || [
    "你更关注哪个行业或业务场景？",
    "这个岗位更偏哪个方向？",
    "目标岗位大概是初级、中级还是高级？",
  ])
    .map((item) => `<div>${escapeHTML(item)}</div>`)
    .join("");
}

function renderProfileClarification(result) {
  const message = result.message || "还差一点信息，暂时无法生成准确的能力画像。";
  $("#profile-clarify .card-title-row p").textContent = message;
  $("#profile-clarify .question-list").innerHTML = (result.clarifyingQuestions || [
    "你做过什么具体项目？",
    "你在项目中主要负责什么？",
    "有没有结果、数据或产出？",
  ])
    .map((item) => `<div>${escapeHTML(item)}</div>`)
    .join("");
}

function normalizeUserProfile(userProfile) {
  return {
    summary: userProfile?.summary || "已根据当前经历生成个人能力画像。",
    yearsOfExperience: userProfile?.yearsOfExperience || "未明确",
    industries: Array.isArray(userProfile?.industries) ? userProfile.industries : [],
    abilityTags: Array.isArray(userProfile?.abilityTags) ? userProfile.abilityTags : [],
    experienceTypes: Array.isArray(userProfile?.experienceTypes) ? userProfile.experienceTypes : [],
    strengths: Array.isArray(userProfile?.strengths) ? userProfile.strengths : [],
    transferableSkills: Array.isArray(userProfile?.transferableSkills) ? userProfile.transferableSkills : [],
    weakSignals: Array.isArray(userProfile?.weakSignals) ? userProfile.weakSignals : [],
    interviewCases: Array.isArray(userProfile?.interviewCases) ? userProfile.interviewCases : [],
  };
}

function renderUserProfile(userProfile) {
  const summaryEl = $("#profile-result-summary");
  if (summaryEl) summaryEl.textContent = userProfile.summary || "";

  const metaEl = $("#profile-meta-area");
  if (metaEl) {
    const industries = userProfile.industries?.length ? userProfile.industries.join(" / ") : "行业未明确";
    metaEl.innerHTML = `
      <div class="profile-meta-clean">
        <section><strong>${escapeHTML(userProfile.yearsOfExperience || "未明确")}</strong><span>经验年限</span></section>
        <section><strong>${escapeHTML(industries)}</strong><span>相关行业</span></section>
      </div>
    `;
  }

  const abilitiesEl = $("#profile-abilities");
  if (abilitiesEl) abilitiesEl.innerHTML = userProfile.abilityTags
    .slice(0, 6)
    .map((item, index) => renderCleanAbilityRow(item, index, "已在经历中识别到相关能力信号"))
    .join("");

  const strengthsEl = $("#profile-strengths");
  if (strengthsEl) strengthsEl.innerHTML = userProfile.strengths
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");

  const transferableEl = $("#profile-transferable");
  if (transferableEl) transferableEl.innerHTML = userProfile.transferableSkills
    .map((item) => `<span>${escapeHTML(item)}</span>`)
    .join("");

  const weakEl = $("#profile-weak");
  if (weakEl) weakEl.innerHTML = userProfile.weakSignals
    .map((item) => `<div><span></span><p>${escapeHTML(item)}</p></div>`)
    .join("");

  const casesEl = $("#profile-cases");
  if (casesEl) casesEl.innerHTML = userProfile.interviewCases
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
}

function applyProfileResult(result) {
  state.profileReady = true;
  state.profileSource = result.source || "";
  state.userProfile = normalizeUserProfile(result.userProfile);
  renderUserProfile(state.userProfile);
  $("#profile-result .result-source-badge")?.remove();
  hide($("#profile-loading"));
  show($("#profile-result"));
  $("#generate-profile").textContent = "生成个人能力画像";
  $("#generate-profile").disabled = false;
  $("#profile-next-panel").classList.remove("disabled");
  $("#profile-next-panel button").disabled = false;
  $(".step-pill[data-step-target='ability']").classList.remove("locked");
}

async function requestProfileAnalysis(input) {
  if (window.location.protocol === "file:") {
    const text = [input.workExperience, input.projectExperience, input.resumeText, input.supplement].join(" ");
    const enough = text.replace(/\s/g, "").length >= 70 || (/项目|负责|上线|结果|数据|用户|调研|PRD|原型|推进/.test(text) && text.replace(/\s/g, "").length >= 38);
    if (!enough) {
      return {
        source: "mock",
        isEnough: false,
        missingTypes: ["project_detail", "personal_contribution", "result"],
        clarifyingQuestions: ["请补充一个具体项目。", "你在项目中主要负责什么？", "项目最后有什么结果？"],
        message: "当前经历描述还比较概括，需要补充具体项目、个人职责和结果。",
        userProfile: null,
      };
    }
    return {
      source: "mock",
      isEnough: true,
      userProfile: {
        summary: "具备产品项目推进和需求分析基础。",
        yearsOfExperience: "未明确",
        industries: ["互联网", "AI 工具"],
        abilityTags: ["需求分析", "产品设计", "用户研究", "项目推进", "数据分析"],
        experienceTypes: ["从 0 到 1 项目", "跨团队协作"],
        strengths: ["有完整产品流程经验", "能把用户需求转化为产品方案", "具备结构化表达基础"],
        transferableSkills: ["沟通协作", "需求拆解", "项目管理", "结构化表达"],
      },
    };
  }

  try {
    const response = await postJsonWithTimeout("/api/analyze-profile", input, 55000);

    if (response.ok) {
      const result = await response.json();
      if (result && (result.isEnough || result.userProfile)) return result;
    }
  } catch (e) {
    console.warn("Profile API failed, using fallback:", e.message);
  }

  const text = [input.selfIntroduction, input.workExperience, input.projectExperience, input.supplement].join(" ");
  const hasDetail = text.replace(/\s/g, "").length >= 20;
  if (hasDetail) {
    return {
      source: "fallback",
      isEnough: true,
      missingTypes: [],
      clarifyingQuestions: [],
      message: "已根据当前经历生成基础能力画像。",
      userProfile: {
        summary: "已从当前经历中提炼出基础能力画像。",
        yearsOfExperience: "未明确",
        industries: input.jobModel?.industry ? [input.jobModel.industry] : ["待确认"],
        abilityTags: ["需求分析", "业务理解", "项目推进", "沟通协作", "结构化表达"],
        experienceTypes: ["项目经验"],
        strengths: ["有具体工作经历描述", "能体现基本职责和行动"],
        transferableSkills: ["沟通协作", "需求拆解", "项目管理", "结构化表达"],
        weakSignals: ["结果需要进一步量化", "个人贡献需要更具体"],
        interviewCases: ["当前填写的工作经历"],
      },
    };
  }
  return {
    source: "fallback",
    isEnough: false,
    missingTypes: ["project_detail", "personal_contribution", "result"],
    clarifyingQuestions: ["请补充一段具体的工作或项目经历。", "你在其中负责什么？", "有什么结果或产出？"],
    message: "当前信息不足，请补充具体经历后再试。",
    userProfile: null,
  };
}

function normalizeJobModel(jobModel, fallbackTitle) {
  return {
    title: jobModel?.title || fallbackTitle || "目标岗位",
    industry: jobModel?.industry || "未填写",
    direction: jobModel?.direction || "未填写",
    level: jobModel?.level || "未填写",
    responsibilities: Array.isArray(jobModel?.responsibilities) ? jobModel.responsibilities : [],
    coreAbilities: Array.isArray(jobModel?.coreAbilities) ? jobModel.coreAbilities : [],
    keySkills: Array.isArray(jobModel?.keySkills) ? jobModel.keySkills : [],
    interviewFocus: Array.isArray(jobModel?.interviewFocus) ? jobModel.interviewFocus : [],
  };
}

async function requestJobAnalysis(input) {
  if (window.location.protocol === "file:") {
    const signalText = Object.values(input).join(" ");
    const structuredCount = [input.industry, input.jobDirection, input.levelRequirement, input.extraInfo, input.supplement].filter(Boolean).length;
    const clearTitle = /ai|AI|人工智能|数据|java|Java|前端|后端|用户研究|B端|b端|SaaS|增长|运营|产品|开发|分析|财务|会计|出纳|税务|报销|凭证|结账/.test(signalText);

    if (input.targetJobTitle.length <= 2 && structuredCount === 0 && !clearTitle) {
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

    return {
      source: "mock",
      isEnough: true,
      missingTypes: [],
      clarifyingQuestions: [],
      message: "当前通过本地文件打开，使用前端模拟结果。启动本地服务后可调用后端 AI 接口。",
      jobModel: detectJobModel({
        title: input.targetJobTitle,
        industry: input.industry,
        direction: input.jobDirection,
        level: input.levelRequirement,
        signalText,
      }),
    };
  }

  const response = await fetch("/api/analyze-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "职位分析接口调用失败");
  }

  return response.json();
}

function resetJobOutput() {
  hide($("#job-loading"));
  hide($("#job-clarify"));
  hide($("#job-result"));
  const jobBadge = $("#job-status-badge");
  if (jobBadge) { jobBadge.textContent = "待填写"; jobBadge.className = "status-badge"; }
  state.jobModelReady = false;
  state.jobModel = null;
  resetPracticeAndReviewState();
  $("#go-background").disabled = true;
  $("#job-next-panel").classList.add("disabled");
  $(".step-pill[data-step-target='background']").classList.add("locked");
  hide($("#job-summary"));
}

function resetProfileOutput() {
  hide($("#profile-loading"));
  hide($("#profile-clarify"));
  hide($("#profile-result"));
  hide($("#ability-loading"));
  hide($("#ability-blocked"));
  hide($("#ability-ready"));
  hide($("#analysis-basis"));
  hide($("#gap-result"));
  state.gapReady = false;
  state.reviewReady = false;
  state.profileSource = "";
  state.gapSource = "";
  state.questionSource = "";
  resetPracticeAndReviewState();
  $(".step-pill[data-step-target='practice']").classList.add("locked");
  $(".step-pill[data-step-target='improve']").classList.add("locked");
  { const pb = $("#profile-status-badge"); if (pb) { pb.textContent = "待填写"; pb.className = "status-badge"; } }
  state.profileReady = false;
  state.userProfile = null;
  $("#profile-next-panel").classList.add("disabled");
  $("#profile-next-panel button").disabled = true;
  $(".step-pill[data-step-target='ability']").classList.add("locked");
}

const streamStepLabels = {
  understand: "正在理解岗位信息",
  generate_start: "开始生成能力模型",
  model_start: "正在构建岗位能力模型",
  title: "已确认岗位定位",
  responsibilities: "正在生成核心职责",
  coreAbilities: "正在识别核心能力",
  keySkills: "正在梳理关键技能",
  interviewFocus: "正在总结面试关注点",
  complete: "生成完成",
  clarify: "信息不足",
};

const streamStepOrder = ["understand", "generate_start", "model_start", "title", "responsibilities", "coreAbilities", "keySkills", "interviewFocus", "complete"];

function resetStreamingUI() {
  const stepsEl = $("#stream-steps");
  const contentEl = $("#stream-content");
  const cursorEl = $("#stream-cursor");
  const fillEl = $("#stream-progress-fill");
  const textEl = $("#stream-progress-text");
  if (stepsEl) stepsEl.innerHTML = "";
  if (contentEl) contentEl.textContent = "正在等待 AI 返回分析内容...";
  if (cursorEl) show(cursorEl);
  if (fillEl) fillEl.style.width = "0%";
  if (textEl) textEl.textContent = "正在思考...";
}

function renderStreamStep(step) {
  const stepsEl = $("#stream-steps");
  if (!stepsEl) return;
  const existing = stepsEl.querySelector(`[data-step="${step}"]`);
  if (existing) return;
  const currentStepIndex = streamStepOrder.indexOf(step);
  stepsEl.querySelectorAll(".stream-step").forEach((el) => {
    const elStep = el.dataset.step;
    const elIndex = streamStepOrder.indexOf(elStep);
    if (elIndex >= 0 && elIndex < currentStepIndex) {
      const icon = el.querySelector(".stream-step-icon");
      if (icon) {
        icon.className = "stream-step-icon done";
        icon.textContent = "✓";
      }
    }
  });
  const div = document.createElement("div");
  div.className = "stream-step";
  div.dataset.step = step;
  div.innerHTML = `<div class="stream-step-icon active">●</div><div class="stream-step-text">${escapeHTML(streamStepLabels[step] || step)}<span class="step-detail"></span></div>`;
  stepsEl.appendChild(div);
  updateStreamProgress(step);
}

function updateStreamProgress(step) {
  const fillEl = $("#stream-progress-fill");
  const textEl = $("#stream-progress-text");
  const idx = streamStepOrder.indexOf(step);
  const total = streamStepOrder.length;
  const pct = Math.min(95, Math.round(((idx + 1) / total) * 100));
  if (fillEl) fillEl.style.width = pct + "%";
  if (textEl) {
    const remain = Math.max(0, Math.round((total - idx - 1) * 1.2));
    textEl.textContent = remain > 0 ? `约 ${remain} 秒后完成` : "即将完成...";
  }
}

let streamQueue = "";
let streamTimer = null;

function appendStreamContent(text) {
  const displayText = toNaturalStreamText(text);
  if (!displayText.trim()) return;
  const contentEl = $("#stream-content");
  if (displayText === "正在整理结构化结果...\n" && contentEl?.textContent.includes("正在整理结构化结果")) return;
  streamQueue += displayText;
  if (!streamTimer) {
    streamTimer = setInterval(() => {
      if (!streamQueue.length) {
        clearInterval(streamTimer);
        streamTimer = null;
        return;
      }
      const chunk = streamQueue.slice(0, 3);
      streamQueue = streamQueue.slice(3);
      const contentEl = $("#stream-content");
      if (!contentEl) return;
      if (contentEl.textContent === "正在等待 AI 返回分析内容...") contentEl.textContent = "";
      contentEl.textContent += chunk;
      contentEl.scrollTop = contentEl.scrollHeight;
    }, 30);
  }
}

function flushStreamQueue() {
  if (streamTimer) { clearInterval(streamTimer); streamTimer = null; }
  const contentEl = $("#stream-content");
  if (contentEl && streamQueue) {
    contentEl.textContent += streamQueue;
    contentEl.scrollTop = contentEl.scrollHeight;
  }
  streamQueue = "";
}

function finishStreamingSteps() {
  flushStreamQueue();
  const stepsEl = $("#stream-steps");
  if (stepsEl) {
    stepsEl.querySelectorAll(".stream-step-icon").forEach((icon) => {
      icon.className = "stream-step-icon done";
      icon.textContent = "✓";
    });
  }
  const fillEl = $("#stream-progress-fill");
  if (fillEl) fillEl.style.width = "100%";
  const textEl = $("#stream-progress-text");
  if (textEl) textEl.textContent = "生成完成";
  const cursorEl = $("#stream-cursor");
  if (cursorEl) hide(cursorEl);
}

async function beginJobAnalysis(force = false) {
  const title = $("#job-title-input").value.trim();
  const jd = $("#job-jd-input").value.trim();
  const industry = $("#job-industry-input").value.trim();
  const direction = $("#job-direction-input").value.trim();
  const level = $("#job-level-input").value.trim();
  const extra = $("#job-extra-input").value.trim();
  const supplement = $("#job-supplement").value.trim();
  const structuredInfo = `${industry} ${direction} ${level} ${extra}`;
  const signalText = `${title} ${jd} ${structuredInfo} ${supplement}`;

  resetJobOutput();
  resetProfileOutput();

  if (!title) {
    renderJobClarification({
      message: "请先填写目标职位，这样系统才能判断岗位方向。",
      clarifyingQuestions: ["你想准备的目标岗位是什么？例如 AI 产品经理、数据分析师、Java 开发工程师。"],
    });
    show($("#job-clarify"));
    { const jb = $("#job-status-badge"); if (jb) { jb.textContent = "需补充"; jb.className = "status-badge warning"; } }
    return;
  }

  show($("#job-loading"));
  $("#generate-job").textContent = "正在分析职位...";
  $("#generate-job").disabled = true;

  resetStreamingUI();
  renderStreamStep("understand");

  // Safety timeout: always restore button after 65s
  const safetyTimer = setTimeout(() => {
    hide($("#job-loading"));
    $("#generate-job").textContent = "生成职位能力模型";
    $("#generate-job").disabled = false;
  }, 65000);

  const input = { targetJobTitle: title, jobDescription: jd, industry, jobDirection: direction, levelRequirement: level, extraInfo: extra, supplement };

  window.setTimeout(async () => {
    try {
      const result = force
        ? await requestJobAnalysis(input)
        : await requestStreamingJson("/api/analyze-job-stream", input, {
            onStatus: (data) => renderStreamStep(data.step),
            onContent: (text) => appendStreamContent(text),
          });
      finishStreamingSteps();
      clearTimeout(safetyTimer);
      hide($("#job-loading"));
      $("#generate-job").textContent = "生成职位能力模型";
      $("#generate-job").disabled = false;
      if (!result.isEnough) {
        renderJobClarification(result);
        show($("#job-clarify"));
        return;
      }
      applyJobResult(result, title);
    } catch (error) {
      clearTimeout(safetyTimer);
      handleJobError(error);
    }
  }, 500);
  return;
}

function applyJobResult(result, title) {
  state.jobModelReady = true;
  state.jobModel = normalizeJobModel(result.jobModel, title);
  state.jobTitle = state.jobModel.title;
  { const jb = $("#job-status-badge"); if (jb) { jb.textContent = result.source === "ai" ? "AI 已生成" : "已生成"; jb.className = "status-badge success"; } }
  renderJobModel(state.jobModel);
  show($("#job-result"));
  show($("#job-summary"));
  $("#go-background").disabled = false;
  $("#job-next-panel").classList.remove("disabled");
  $(".step-pill[data-step-target='background']").classList.remove("locked");
}

function handleJobError(error) {
  hide($("#job-loading"));
  $("#generate-job").textContent = "生成职位能力模型";
  $("#generate-job").disabled = false;
  renderJobClarification({
    message: "职位分析生成失败，请稍后重试；如果你正在接入真实 AI，请检查本地服务和 API Key。",
    clarifyingQuestions: [error.message],
  });
  show($("#job-clarify"));
  { const jb = $("#job-status-badge"); if (jb) { jb.textContent = "需补充"; jb.className = "status-badge warning"; } }
}

const profileStepLabels = {
  extract_work: "正在提取工作经历",
  extract_project: "正在提取项目经历",
  match_job: "正在关联目标岗位能力",
  generate: "正在生成个人能力画像",
  fallback: "切换兜底规则生成",
};
const profileStepOrder = ["extract_work", "extract_project", "match_job", "generate"];

function resetProfileStreamUI() {
  const stepsEl = $("#profile-stream-steps");
  const contentEl = $("#profile-stream-content");
  const cursorEl = $("#profile-stream-cursor");
  const fillEl = $("#profile-stream-fill");
  const textEl = $("#profile-stream-text");
  if (stepsEl) stepsEl.innerHTML = "";
  if (contentEl) contentEl.textContent = "正在等待 AI 返回分析内容...";
  if (cursorEl) show(cursorEl);
  if (fillEl) fillEl.style.width = "0%";
  if (textEl) textEl.textContent = "正在思考...";
}

function finishProfileStreamUI() {
  const stepsEl = $("#profile-stream-steps");
  if (stepsEl) stepsEl.querySelectorAll(".stream-step-icon").forEach((ic) => { ic.className = "stream-step-icon done"; ic.textContent = "✓"; });
  const fillEl = $("#profile-stream-fill");
  if (fillEl) fillEl.style.width = "100%";
  const textEl = $("#profile-stream-text");
  if (textEl) textEl.textContent = "生成完成";
  const cursorEl = $("#profile-stream-cursor");
  if (cursorEl) hide(cursorEl);
}

function addProfileStep(step) {
  const stepsEl = $("#profile-stream-steps");
  if (!stepsEl || stepsEl.querySelector(`[data-step="${step}"]`)) return;
  const currentIdx = profileStepOrder.indexOf(step);
  stepsEl.querySelectorAll(".stream-step").forEach((el) => {
    const elIdx = profileStepOrder.indexOf(el.dataset.step);
    if (elIdx >= 0 && elIdx < currentIdx) {
      const icon = el.querySelector(".stream-step-icon");
      if (icon) { icon.className = "stream-step-icon done"; icon.textContent = "✓"; }
    }
  });
  const div = document.createElement("div");
  div.className = "stream-step";
  div.dataset.step = step;
  div.innerHTML = `<div class="stream-step-icon active">●</div><div class="stream-step-text">${escapeHTML(profileStepLabels[step] || step)}</div>`;
  stepsEl.appendChild(div);
  const fillEl = $("#profile-stream-fill");
  const textEl = $("#profile-stream-text");
  const pct = Math.min(95, Math.round(((currentIdx + 1) / profileStepOrder.length) * 100));
  if (fillEl) fillEl.style.width = pct + "%";
  if (textEl) textEl.textContent = `约 ${Math.max(0, (profileStepOrder.length - currentIdx - 1) * 1.5).toFixed(0)} 秒后完成`;
}

async function beginProfileAnalysis(force = false) {
  const selfIntro = $("#self-intro-input") ? $("#self-intro-input").value.trim() : "";
  const work = $("#work-input").value.trim();
  const project = $("#project-input").value.trim();
  const supplement = $("#profile-supplement") ? $("#profile-supplement").value.trim() : "";

  resetProfileOutput();

  show($("#profile-loading"));
  resetProfileStreamUI();
  $("#generate-profile").textContent = "正在分析经历...";
  $("#generate-profile").disabled = true;

  const input = {
    jobModel: state.jobModel,
    selfIntroduction: selfIntro,
    workExperience: work,
    projectExperience: project,
    resumeText: "",
    supplement,
  };

  const stepDelay = (ms) => new Promise((r) => setTimeout(r, ms));

  if (force || window.location.protocol === "file:") {
    addProfileStep("extract_work");
    await stepDelay(800);
    addProfileStep("extract_project");
    await stepDelay(800);
    addProfileStep("match_job");
    await stepDelay(800);
    addProfileStep("generate");
    const result = await requestProfileAnalysis(input);
    hide($("#profile-loading"));
    if (!result.isEnough) {
      renderProfileClarification(result);
      show($("#profile-clarify"));
      $("#generate-profile").textContent = "生成个人能力画像";
      $("#generate-profile").disabled = false;
      return;
    }
    applyProfileResult(result);
    return;
  }

  try {
    addProfileStep("extract_work");
    await stepDelay(600);
    addProfileStep("extract_project");
    await stepDelay(600);
    addProfileStep("match_job");
    await stepDelay(600);
    addProfileStep("generate");

    const result = await requestStreamingJson("/api/analyze-profile-stream", input, {
      onStatus: (data) => addProfileStep(data.step),
      onContent: (text) => appendStreamingText("#profile-stream-content", text),
    });
    finishProfileStreamUI();

    await stepDelay(500);
    hide($("#profile-loading"));

    if (!result.isEnough) {
      renderProfileClarification(result);
      show($("#profile-clarify"));
      $("#generate-profile").textContent = "生成个人能力画像";
      $("#generate-profile").disabled = false;
      return;
    }
    applyProfileResult(result);
  } catch (error) {
    hide($("#profile-loading"));
    $("#generate-profile").textContent = "生成个人能力画像";
    $("#generate-profile").disabled = false;
    renderProfileClarification({
      message: "背景分析生成失败，请稍后重试。",
      clarifyingQuestions: [error.message],
    });
    show($("#profile-clarify"));
  }
}

async function requestJson(endpoint, payload) {
  const response = await postJsonWithTimeout(endpoint, payload);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `${endpoint} 调用失败`);
  }
  return response.json();
}

async function requestJsonWithTimeout(endpoint, payload, timeoutMs) {
  const response = await postJsonWithTimeout(endpoint, payload, timeoutMs);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `${endpoint} 调用失败`);
  }
  return response.json();
}

async function postJsonWithTimeout(endpoint, payload, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`${endpoint} 响应超时，请稍后重试`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function renderPrereqCards() {
  const jm = state.jobModel;
  const up = state.userProfile;
  if (jm) {
    const sub = $("#prereq-job-sub");
    if (sub) sub.textContent = `${jm.title} · ${jm.industry} · ${jm.level}`;
    const resp = $("#prereq-job-resp");
    if (resp) resp.innerHTML = (jm.responsibilities || []).map((r) => `<li>${escapeHTML(r)}</li>`).join("");
    const ab = $("#prereq-job-abilities");
    if (ab) ab.innerHTML = (jm.coreAbilities || []).slice(0, 6).map((a, index) => `
      <div class="prereq-ability-row">
        <span class="ability-index">${index + 1}</span>
        <div>
          <strong>${escapeHTML(a)}</strong>
          <p>面试会关注你的方法、真实案例和结果表达。</p>
        </div>
        <em>核心</em>
      </div>
    `).join("");
    const sk = $("#prereq-job-skills");
    if (sk) sk.innerHTML = (jm.keySkills || []).slice(0, 8).map((s) => `<span>${escapeHTML(s)}</span>`).join("");
  }
  if (up) {
    const sub = $("#prereq-profile-sub");
    if (sub) sub.textContent = `${up.yearsOfExperience || "未明确"} · ${(up.industries || []).join(" / ")}`;
    const ab = $("#prereq-profile-abilities");
    if (ab) ab.innerHTML = (up.abilityTags || []).slice(0, 6).map((a, index) => `
      <div class="prereq-ability-row">
        <span class="ability-index">${index + 1}</span>
        <div>
          <strong>${escapeHTML(a)}</strong>
          <p>当前经历中已出现相关信号，后续需要补充证据强度。</p>
        </div>
        <em>已识别</em>
      </div>
    `).join("");
    const st = $("#prereq-profile-strengths");
    if (st) st.innerHTML = (up.strengths || []).map((s) => `<li>${escapeHTML(s)}</li>`).join("");
    const wk = $("#prereq-profile-weak");
    if (wk) wk.innerHTML = (up.weakSignals || []).map((w) => `
      <div class="prereq-warning-row">
        <span></span>
        <p>${escapeHTML(w)}</p>
      </div>
    `).join("");
  }
}

function calculateGapScore(gapItems) {
  const scoreMap = { "匹配": 100, "部分匹配": 60, "存在差距": 20 };
  const evMap = { "强": 100, "中": 60, "弱": 30 };
  const depthMap = { "超过": 100, "达到": 80, "低于": 40 };
  const items = gapItems || [];
  if (!items.length) return { total: 0, coverage: 0, evidence: 0, depth: 0, expression: 0 };
  const coverage = Math.round(items.reduce((s, i) => s + (scoreMap[i.matchStatus] || 50), 0) / items.length);
  const evidence = Math.round(items.reduce((s, i) => s + (evMap[i.evidenceLevel] || 50), 0) / items.length);
  const depth = Math.round(items.reduce((s, i) => s + (depthMap[i.depthLevel] || 60), 0) / items.length);
  const hasCases = (state.userProfile?.interviewCases?.length || 0) > 0;
  const expression = hasCases ? 80 : 40;
  const total = Math.round(coverage * 0.4 + evidence * 0.3 + depth * 0.2 + expression * 0.1);
  return { total, coverage, evidence, depth, expression };
}

function renderScoreOverview(gapAnalysis) {
  const score = calculateGapScore(gapAnalysis.gapItems);
  const numEl = $("#score-num");
  if (numEl) numEl.textContent = score.total;
  const ringFill = $("#score-ring-fill");
  if (ringFill) ringFill.style.strokeDashoffset = 264 - (264 * score.total / 100);
  const dims = [
    { name: "能力覆盖度", icon: "◎", val: score.coverage, color: "var(--blue)", weight: "40%", desc: `${gapAnalysis.gapItems?.length || 0} 项能力的匹配情况` },
    { name: "证据充分度", icon: "◇", val: score.evidence, color: "var(--orange)", weight: "30%", desc: "有项目经历但证据强度不同" },
    { name: "深度匹配度", icon: "↗", val: score.depth, color: "var(--green)", weight: "20%", desc: "经验深度与岗位要求的匹配" },
    { name: "表达准备度", icon: "✦", val: score.expression, color: "var(--purple)", weight: "10%", desc: "是否有可直接用于面试的案例" },
  ];
  const dimsEl = $("#score-dims");
  if (dimsEl) dimsEl.innerHTML = dims.map((d) => `
    <div class="score-dim">
      <div class="score-dim-header">
        <span class="score-dim-name">${d.icon} ${d.name}</span>
        <span class="score-dim-val" style="color:${d.color}">${d.val}</span>
      </div>
      <div class="score-dim-bar"><div class="score-dim-fill" style="width:${d.val}%;background:${d.color}"></div></div>
      <div class="score-dim-weight">权重 ${d.weight} · ${d.desc}</div>
    </div>
  `).join("");
}

function renderGapAnalysis(gapAnalysis) {
  renderPrereqCards();
  renderSourceBadge("#gap-result .card-header", state.gapSource);
  renderScoreOverview(gapAnalysis);
  const evLabel = { "强": "strong", "中": "mid", "弱": "weak" };
  const rows = (gapAnalysis.gapItems || [])
    .map((item) => {
      const statusClass = item.matchStatus === "匹配" ? "match-good" : item.matchStatus === "存在差距" ? "match-weak" : "match-partial";
      const ev = item.evidenceLevel || "中";
      return `
        <tr>
          <td><strong>${escapeHTML(item.ability)}</strong></td>
          <td>${escapeHTML(item.jobRequirement)}</td>
          <td>${escapeHTML(item.userCurrent)}</td>
          <td><span class="match-pill ${statusClass}">${escapeHTML(item.matchStatus)}</span></td>
          <td><span class="evidence-pill ev-${evLabel[ev] || "mid"}">${escapeHTML(ev)}</span></td>
          <td>${escapeHTML(item.gapReason || "-")}</td>
          <td>${escapeHTML(item.interviewRisk)}</td>
          <td>${escapeHTML(item.suggestion)}</td>
        </tr>
      `;
    })
    .join("");
  const tbody = $("#gap-table-body");
  if (tbody) tbody.innerHTML = rows;

  const focus = gapAnalysis.practiceFocus || [];
  const focusEl = $("#gap-focus");
  if (focusEl) focusEl.innerHTML = focus.length ? `<h3>&#127919; 优先练习方向</h3><div class="focus-tags">${focus.map((f) => `<span class="focus-tag">${escapeHTML(f)}</span>`).join("")}</div>` : "";

  const risks = gapAnalysis.riskTips || [];
  const riskEl = $("#gap-risk");
  if (riskEl) riskEl.innerHTML = risks.length ? `<h3>&#9888;&#65039; 面试风险提示</h3><ul>${risks.map((r) => `<li>${escapeHTML(r)}</li>`).join("")}</ul>` : "";
}

function renderPracticeContent() {
  syncAbilityFilter();
  renderQuestionList();
  renderInlineQuestion();
  bindPracticeButtons();
}

function bindPracticeButtons() {
  $$(".practice-question-item").forEach((button) => {
    button.onclick = () => selectPracticeQuestion(Number(button.dataset.question), "single");
  });
}

function getAllPracticeQuestions() {
  const merged = [];
  const seen = new Set();
  [...practiceQuestions, ...questionReferences].forEach((item) => {
    if (!item?.title || seen.has(item.title)) return;
    seen.add(item.title);
    merged.push({
      skills: item.skills?.length ? item.skills : ["岗位能力"],
      recommendReason: item.recommendReason || "适合围绕当前岗位能力进行练习。",
      answerThinking: item.answerThinking,
      referenceAnswer: item.referenceAnswer,
      sourceType: item.sourceType || "题库",
      sourceName: item.sourceName || "公开面经与岗位题型整理",
      sourceNote: item.sourceNote || "题目来自真实公开资料、题库沉淀或岗位题型整理；答案由 AI 辅助生成或整理。",
      ...item,
    });
  });
  return merged;
}

function getQuestionPool() {
  const all = getAllPracticeQuestions();
  if (state.questionScope === "recommended") {
    const focus = state.gapAnalysis?.practiceFocus || [];
    const matched = all.filter((question) =>
      (question.skills || []).some((skill) => focus.some((f) => skill.includes(f) || f.includes(skill))),
    );
    return matched.length ? matched : all.slice(0, Math.max(3, Math.min(all.length, 6)));
  }
  if (state.questionScope === "ability" && state.abilityFilter !== "all") {
    return all.filter((question) => (question.skills || []).some((skill) => skill === state.abilityFilter));
  }
  return all;
}

function syncAbilityFilter() {
  const wrap = $("#ability-filter-wrap");
  const select = $("#ability-filter");
  if (!wrap || !select) return;
  const abilities = [...new Set(getAllPracticeQuestions().flatMap((question) => question.skills || []).filter(Boolean))];
  select.innerHTML = abilities.map((ability) => `<option value="${escapeHTML(ability)}">${escapeHTML(ability)}</option>`).join("");
  if (!abilities.includes(state.abilityFilter)) state.abilityFilter = abilities[0] || "all";
  select.value = state.abilityFilter;
  wrap.classList.toggle("hidden", state.questionScope !== "ability");
}

function renderQuestionList() {
  const list = $("#practice-question-list");
  if (!list) return;
  const pool = getQuestionPool();
  if (!pool.length) {
    list.innerHTML = `<div class="empty-state">当前分类暂无题目。</div>`;
    return;
  }
  if (!pool[state.selectedQuestion]) state.selectedQuestion = 0;
  list.innerHTML = pool
    .map((question, index) => {
      const type = getQuestionType(question);
      return `
        <button class="practice-question-item ${index === state.selectedQuestion ? "selected" : ""}" data-question="${index}" type="button">
          <span class="question-index">${index + 1}</span>
          <span class="question-list-copy">
            <strong>${escapeHTML(question.title)}</strong>
            <small>${escapeHTML(question.recommendReason || "围绕当前岗位能力练习。")}</small>
            <em>${(question.skills || []).slice(0, 3).map((skill) => escapeHTML(skill)).join(" · ")}</em>
          </span>
          <span class="question-type-pill">${escapeHTML(type)}</span>
        </button>
      `;
    })
    .join("");
}

function getQuestionType(question) {
  const explicit = question.questionType || question.type;
  if (explicit) return explicit;
  const title = question.title || "";
  if (/经历|案例|举例|介绍|讲一次|复盘|做过|负责/.test(title)) return "经验案例题";
  if (/如何设计|怎么设计|建立|方案|从 0 到 1|规划|制定/.test(title)) return "方案设计题";
  if (/如何判断|如何评估|怎么看|选择|是否合理|标准/.test(title)) return "判断评估题";
  if (/冲突|变化|不同意|优先级|协调/.test(title)) return "冲突处理题";
  if (/延期|异常|失败|压力|突发|风险|事故/.test(title)) return "压力异常题";
  if (/理解|认知|区别|关系|价值/.test(title)) return "认知理解题";
  return "专业知识题";
}

function buildFrameworkFromType(question, skills) {
  const type = getQuestionType(question);
  const templates = {
    经验案例题: ["背景：交代业务场景、目标和你承担的角色。", "任务：说明当时要解决的核心问题。", "行动：展开你的关键动作、判断和协作过程。", "结果：用指标、反馈或沉淀说明效果。"],
    方案设计题: ["目标：先说明要解决的用户问题和业务目标。", "现状：分析用户痛点、约束条件和机会判断。", "方案：描述 MVP、核心路径、资源协同和落地步骤。", "风险：说明可能的技术、数据、运营或协作风险。", "验证：用指标、反馈和实验结果判断价值是否成立。"],
    判断评估题: ["标准：先定义判断维度和优先级。", "信息收集：说明需要哪些数据、样本或业务信息。", "对比分析：用评分、权重或横向比较得出判断。", "结论：说明选择或判断结果，以及取舍原因。", "风险：补充兜底方案和后续跟踪方式。"],
    冲突处理题: ["冲突识别：先说明各方诉求和冲突本质。", "利益分析：判断业务目标、用户价值和资源约束。", "沟通协调：说明你如何推动信息对齐和决策。", "替代方案：给出可落地的折中或分阶段方案。", "结果：说明最终影响和复盘沉淀。"],
    压力异常题: ["止损：先控制影响范围和优先级。", "排查：快速定位原因和责任边界。", "协调：推动相关角色形成处理方案。", "预案：准备替代路径和风险兜底。", "复盘：沉淀机制，避免问题重复发生。"],
    认知理解题: ["观点：先给出明确判断。", "原因：解释你的判断依据和适用边界。", "案例：用项目或行业例子支撑观点。", "边界：说明什么情况下需要调整判断。", "总结：回到岗位价值和行动建议。"],
    专业知识题: ["概念：先说明关键概念或流程。", "流程：按步骤讲清楚怎么做。", "注意事项：指出容易出错的地方。", "案例：结合真实业务场景解释。", "风险：补充合规、质量或协作风险。"],
  };
  const selected = templates[type] || templates.专业知识题;
  const abilityHint = skills?.[0] ? `重点围绕${skills[0]}展开。` : "";
  return `${type}：${abilityHint}${selected.join(" ")}`;
}

function buildQuestionGuide(question) {
  const skills = question.skills?.length ? question.skills : state.jobModel?.coreAbilities?.slice(0, 3) || ["岗位核心能力"];
  const jobTitle = state.jobModel?.title || state.jobTitle || "目标岗位";
  const assessment = `这道题主要考察 ${skills.join("、")}。面试官想看你是否能结合${jobTitle}的真实工作场景，讲清楚问题判断、个人动作和可验证结果。`;
  const framework = question.answerThinking?.trim()?.length > 16
    ? question.answerThinking.trim()
    : buildFrameworkFromType(question, skills);
  const hasStrongAnswer = question.referenceAnswer?.trim()?.length > 80;
  const answerExample = hasStrongAnswer
    ? question.referenceAnswer.trim()
    : `示例结构：在${jobTitle}相关场景中，我会先说明问题背景和目标，再讲我如何拆解${skills[0] || "核心能力"}相关任务，具体采取了哪些动作，最后补充结果指标、业务反馈或复盘结论。真实作答时，需要替换成你自己的项目经历，避免只停留在方法论。`;
  return {
    assessment,
    framework,
    answerExample,
    answerSource: hasStrongAnswer ? "AI 基于题源整理" : "AI 辅助生成",
  };
}

function renderInlineQuestion() {
  const pool = getQuestionPool();
  const question = pool[state.selectedQuestion] || pool[0] || practiceQuestions[0];
  if (!question) return;
  const progressText = state.practiceMode === "round" ? `模拟面试 · 第 ${state.selectedQuestion + 1} 题` : "单题练习";
  $("#inline-progress").textContent = progressText;
  $("#inline-question-title").textContent = question.title;
  $("#modal-question-title").textContent = question.title;
  $("#modal-question-meta").innerHTML = (question.skills || ["岗位能力"]).map((skill) => `<span>${escapeHTML(skill)}</span>`).join("");
  const guide = buildQuestionGuide(question);
  $("#guide-assessment").textContent = guide.assessment;
  $("#guide-framework").textContent = guide.framework;
  $("#guide-answer-example").textContent = guide.answerExample;
  const skillTags = $("#guide-skill-tags");
  if (skillTags) {
    skillTags.innerHTML = (question.skills || ["岗位能力"])
      .slice(0, 4)
      .map((skill) => `<span>${escapeHTML(skill)}</span>`)
      .join("");
  }
}

function selectPracticeQuestion(index, mode = "single") {
  state.selectedQuestion = index;
  state.practiceMode = mode;
  renderQuestionList();
  bindPracticeButtons();
  renderInlineQuestion();
  $("#answer-input").value = "";
  resetAnswerReview();
}

function bindReferenceButtons() {
  $$(".reference-detail").forEach((button) => {
    button.onclick = () => openReferenceModal(Number(button.dataset.reference), button.dataset.detail);
  });
  $$(".practice-reference").forEach((button) => {
    button.onclick = () => openReferencePractice(Number(button.dataset.reference));
  });
}

function openReferenceModal(index, detailType) {
  const item = questionReferences[index];
  if (!item) return;
  const isAnswer = detailType === "answer";
  $("#reference-modal-kicker").textContent = isAnswer ? "题型参考 · 参考答案" : "题型参考 · 答题思路";
  $("#reference-modal-title").textContent = item.title;
  $("#reference-modal-source").innerHTML = `
    <span class="source-pill">${escapeHTML(item.sourceType || "题库")}</span>
    <span>${escapeHTML(item.sourceName || "公开面经与岗位题型整理")}</span>
    <small>${escapeHTML(item.sourceNote || "当前为内置整理版；后续可替换为联网检索或 RAG 召回结果。")}</small>
  `;
  $("#reference-modal-body").textContent = isAnswer ? item.referenceAnswer || "暂无参考答案。" : item.answerThinking || "暂无答题思路。";
  show($("#reference-modal"));
  document.body.classList.add("modal-open");
}

function closeReferenceModal() {
  hide($("#reference-modal"));
  if ($("#practice-modal").classList.contains("hidden")) {
    document.body.classList.remove("modal-open");
  }
}

function openReferencePractice(index) {
  const item = questionReferences[index];
  if (!item) return;
  const practiceQuestion = {
    title: item.title,
    skills: item.skills?.length ? item.skills : ["题型参考"],
    recommendReason: "来自题型参考，适合直接练习。",
    answerThinking: item.answerThinking,
    referenceAnswer: item.referenceAnswer,
    sourceType: item.sourceType,
    sourceName: item.sourceName,
    sourceNote: item.sourceNote,
  };
  const existingIndex = practiceQuestions.findIndex((question) => question.title === practiceQuestion.title);
  const targetIndex = existingIndex >= 0 ? existingIndex : practiceQuestions.push(practiceQuestion) - 1;
  state.questionScope = "all";
  selectPracticeQuestion(targetIndex, "single");
}

function getSelectedPracticeQuestion() {
  const pool = getQuestionPool();
  return pool[state.selectedQuestion] || pool[0] || practiceQuestions[0];
}

const gapStepLabels = {
  read_job: "读取岗位能力模型",
  read_profile: "读取个人能力画像",
  match: "逐项匹配能力",
  score: "计算匹配分数",
  generate: "生成差距分析",
  fallback: "切换兜底规则生成",
};
const gapStepOrder = ["read_job", "read_profile", "match", "score", "generate"];

function resetGapStreamUI() {
  const stepsEl = $("#gap-stream-steps");
  const contentEl = $("#gap-stream-content");
  const cursorEl = $("#gap-stream-cursor");
  const fillEl = $("#gap-stream-fill");
  const textEl = $("#gap-stream-text");
  if (stepsEl) stepsEl.innerHTML = "";
  if (contentEl) contentEl.textContent = "正在等待 AI 返回分析内容...";
  if (cursorEl) show(cursorEl);
  if (fillEl) fillEl.style.width = "0%";
  if (textEl) textEl.textContent = "正在思考...";
}

function finishGapStreamUI() {
  const stepsEl = $("#gap-stream-steps");
  if (stepsEl) stepsEl.querySelectorAll(".stream-step-icon").forEach((ic) => { ic.className = "stream-step-icon done"; ic.textContent = "✓"; });
  const fillEl = $("#gap-stream-fill");
  if (fillEl) fillEl.style.width = "100%";
  const textEl = $("#gap-stream-text");
  if (textEl) textEl.textContent = "生成完成";
  const cursorEl = $("#gap-stream-cursor");
  if (cursorEl) hide(cursorEl);
}

function buildFallbackGapAnalysis() {
  const jobAbilities = state.jobModel?.coreAbilities?.length
    ? state.jobModel.coreAbilities
    : ["岗位核心能力", "流程执行能力", "沟通协同能力"];
  const profileTags = state.userProfile?.abilityTags || [];
  const weakSignals = state.userProfile?.weakSignals || [];
  const focus = [...new Set([...weakSignals, ...jobAbilities].filter(Boolean))].slice(0, 3);
  const gapItems = jobAbilities.slice(0, 5).map((ability, index) => {
    const hasEvidence = profileTags.some((tag) => ability.includes(tag) || tag.includes(ability));
    return {
      ability,
      jobRequirement: `岗位要求能稳定完成${ability}相关任务，并能说明具体方法和结果。`,
      userCurrent: hasEvidence ? `经历中已体现${ability}相关基础。` : "当前经历证据还不够充分。",
      matchStatus: hasEvidence ? "部分匹配" : "存在差距",
      evidenceLevel: hasEvidence ? "中" : "低",
      depthLevel: hasEvidence ? "达到" : "不足",
      gapReason: weakSignals[index] || "需要补充更具体的案例、数据或个人动作。",
      interviewRisk: `面试中可能被追问${ability}的真实案例和结果。`,
      suggestion: `准备一个能证明${ability}的 STAR 案例。`,
    };
  });
  return {
    overallMatch: {
      score: 65,
      level: "中等匹配",
      summary: "已基于当前岗位能力和个人经历生成基础差距分析。",
    },
    gapItems,
    practiceFocus: focus.length ? focus : jobAbilities.slice(0, 3),
    riskTips: focus.map((item) => `需要补充${item}相关案例证据。`).slice(0, 3),
  };
}

function addGapStep(step, detail) {
  const stepsEl = $("#gap-stream-steps");
  if (!stepsEl || stepsEl.querySelector(`[data-step="${step}"]`)) return;
  const idx = gapStepOrder.indexOf(step);
  stepsEl.querySelectorAll(".stream-step").forEach((el) => {
    const elIdx = gapStepOrder.indexOf(el.dataset.step);
    if (elIdx >= 0 && elIdx < idx) {
      const icon = el.querySelector(".stream-step-icon");
      if (icon) { icon.className = "stream-step-icon done"; icon.textContent = "✓"; }
    }
  });
  const div = document.createElement("div");
  div.className = "stream-step";
  div.dataset.step = step;
  div.innerHTML = `<div class="stream-step-icon active">●</div><div class="stream-step-text">${escapeHTML(detail || gapStepLabels[step] || step)}</div>`;
  stepsEl.appendChild(div);
  const fillEl = $("#gap-stream-fill");
  const textEl = $("#gap-stream-text");
  const pct = Math.min(95, Math.round(((idx + 1) / gapStepOrder.length) * 100));
  if (fillEl) fillEl.style.width = pct + "%";
  if (textEl) textEl.textContent = `约 ${Math.max(0, (gapStepOrder.length - idx - 1) * 1.5).toFixed(0)} 秒后完成`;
}

async function beginAbilityAnalysis() {
  hide($("#ability-blocked"));
  hide($("#gap-result"));
  hide($("#ability-ready"));
  show($("#ability-loading"));
  resetGapStreamUI();

  const stepDelay = (ms) => new Promise((r) => setTimeout(r, ms));

  addGapStep("read_job", `读取岗位能力模型：${state.jobModel?.title || ""}，${(state.jobModel?.coreAbilities || []).length} 项核心能力`);
  await stepDelay(700);
  addGapStep("read_profile", `读取个人能力画像：${(state.userProfile?.abilityTags || []).length} 项能力标签`);
  await stepDelay(700);
  addGapStep("match", "逐项匹配能力...");
  await stepDelay(700);

  try {
    let gapResult;
    try {
      gapResult = await requestStreamingJson("/api/analyze-gap-stream", { jobModel: state.jobModel, userProfile: state.userProfile }, {
        onStatus: (data) => addGapStep(data.step, data.detail),
        onContent: (text) => appendStreamingText("#gap-stream-content", text),
      });
    } catch (e) {
      console.warn("Gap API failed, using fallback:", e.message);
      gapResult = { source: "fallback", gapAnalysis: buildFallbackGapAnalysis() };
    }
    state.gapSource = gapResult.source || "";
    state.gapAnalysis = gapResult.gapAnalysis;

    addGapStep("score", "计算匹配分数...");
    await stepDelay(500);
    addGapStep("generate", "生成差距分析完成");

    finishGapStreamUI();

    const localQuestionSet = buildLocalQuestionsForCurrentJob();
    state.questionSource = "current-job-fallback";
    practiceQuestions = localQuestionSet.practiceQuestions;
    questionReferences = localQuestionSet.questionReferences;
    state.selectedQuestion = 0;
    state.questionScope = "all";

    await stepDelay(500);
    hide($("#ability-loading"));
    renderGapAnalysis(state.gapAnalysis);
    renderPracticeContent();
    show($("#gap-result"));
    state.gapReady = true;
    const nextPanel = $("#gap-next-panel");
    if (nextPanel) { nextPanel.classList.remove("disabled"); nextPanel.querySelector("button").disabled = false; }
    $(".step-pill[data-step-target='practice']").classList.remove("locked");
    refreshPracticeQuestionsInBackground();
  } catch (error) {
    hide($("#ability-loading"));
    show($("#ability-blocked"));
    const p = $("#ability-blocked p");
    if (p) p.textContent = `能力差距分析失败：${error.message}`;
  }
}

async function refreshPracticeQuestionsInBackground() {
  try {
    const questionResult = await requestJsonWithTimeout(
      "/api/generate-questions",
      { jobModel: state.jobModel, userProfile: state.userProfile, gapAnalysis: state.gapAnalysis },
      30000,
    );
    if (!questionResult?.practiceQuestions?.length && !questionResult?.questionReferences?.length) return;
    const currentTitle = state.jobModel?.title || "";
    const localQuestionSet = buildLocalQuestionsForCurrentJob();
    state.questionSource = questionResult.source || state.questionSource;
    practiceQuestions = questionResult.practiceQuestions?.length ? questionResult.practiceQuestions : localQuestionSet.practiceQuestions;
    questionReferences = questionResult.questionReferences?.length ? questionResult.questionReferences : localQuestionSet.questionReferences;
    state.selectedQuestion = 0;
    renderPracticeContent();
    console.info(`Practice questions refreshed for ${currentTitle || "current job"}.`);
  } catch (error) {
    console.warn("Background question refresh failed, keeping current-job fallback:", error.message);
  }
}

function prepareAbilityPage() {
  hide($("#ability-blocked"));
  hide($("#ability-loading"));
  hide($("#gap-result"));
  show($("#ability-ready"));
  show($("#prereq-grid"));
  renderPrereqCards();
}

function getReviewEntries(summary = {}) {
  const summaries = summary.answeredQuestions || [];
  const reviews = state.answerReviews || [];
  const source = reviews.length ? reviews : summaries;
  return source.slice(0, 10).map((review, index) => {
    const summaryItem = summaries[index] || {};
    const score = Number(review.overallScore ?? review.score ?? summaryItem.score ?? 0);
    const mainProblems = (review.mainProblems?.length ? review.mainProblems : [summaryItem.mainProblem]).filter(Boolean);
    const suggestions = (review.suggestions?.length ? review.suggestions : [summaryItem.suggestion]).filter(Boolean);
    const status = summaryItem.status || review.status || getReviewStatusByScore(score);
    return {
      question: review.questionTitle || summaryItem.question || `练习题 ${index + 1}`,
      score: Number.isFinite(score) && score > 0 ? score : Number(summary.overallScore) || 66,
      mainProblems: mainProblems.length ? mainProblems : ["需要补充更具体的回答证据。"],
      suggestions: suggestions.length ? suggestions : ["补充项目背景、个人动作和结果。"],
      status,
      dimensions: review.dimensions || [],
      optimizedDirection: review.optimizedDirection || "",
    };
  });
}

function getReviewStatusByScore(score) {
  if (score >= 80) return "通过";
  if (score >= 70) return "需复练";
  return "待巩固";
}

function getStatusClass(status) {
  if (status === "通过") return "success";
  if (status === "待巩固") return "danger";
  return "warning";
}

function classifyReviewProblem(text = "") {
  if (/结果|指标|量化|数据|反馈|证明|证据/.test(text)) return "缺少结果证据";
  if (/案例|真实|具体|背景|项目/.test(text)) return "案例不够具体";
  if (/岗位|贴合|语言|要求/.test(text)) return "岗位语言不足";
  if (/结构|STAR|顺序|框架|完整/.test(text)) return "结构不够完整";
  if (/个人|贡献|动作|负责/.test(text)) return "个人动作不突出";
  return String(text).slice(0, 12) || "回答证据不足";
}

function countItems(items) {
  return items.reduce((map, item) => {
    const key = String(item || "").trim();
    if (!key) return map;
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
}

function getReviewDiagnostics(summary = {}) {
  const entries = getReviewEntries(summary);
  const scores = entries.map((entry) => entry.score).filter((score) => Number.isFinite(score));
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : Number(summary.overallScore) || 66;
  const issueCounts = [...countItems(entries.flatMap((entry) => entry.mainProblems.map(classifyReviewProblem))).entries()]
    .sort((a, b) => b[1] - a[1]);
  const focusItems = [
    ...(summary.nextPracticeFocus || []),
    ...(state.gapAnalysis?.practiceFocus || []),
    ...issueCounts.map(([issue]) => issue),
  ].filter(Boolean);
  const focus = [...new Set(focusItems)].slice(0, 3);
  const quality = {
    excellent: scores.filter((score) => score >= 80).length,
    usable: scores.filter((score) => score >= 70 && score < 80).length,
    needsWork: scores.filter((score) => score > 0 && score < 70).length,
    invalid: Math.max(0, Number(summary.answeredCount || entries.length) - entries.length),
  };
  return { entries, average, issueCounts, focus, quality };
}

function buildLocalReviewSummary() {
  const reviews = state.answerReviews || [];
  const scores = reviews
    .map((review) => Number(review.overallScore ?? review.score ?? 0))
    .filter((score) => Number.isFinite(score) && score > 0);
  const overallScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const mainIssues = reviews.flatMap((review) => review.mainProblems || []).map(classifyReviewProblem);
  const nextPracticeFocus = [
    ...new Set([
      ...(state.gapAnalysis?.practiceFocus || []),
      ...mainIssues,
    ].filter(Boolean)),
  ].slice(0, 3);
  const overallSummary = overallScore >= 80
    ? "本轮回答整体较完整，下一步可以继续强化结果证据和岗位表达。"
    : overallScore >= 70
      ? "本轮回答方向基本成立，但案例细节、个人动作和结果证据还需要继续补强。"
      : "本轮回答暴露出较明显的表达短板，建议优先补充真实场景、关键动作和可验证结果。";

  return {
    overallScore,
    answeredCount: reviews.length,
    overallSummary,
    answeredQuestions: reviews.map((review, index) => ({
      question: review.questionTitle || `练习题 ${index + 1}`,
      score: Number(review.overallScore ?? review.score ?? overallScore),
      mainProblem: (review.mainProblems || [])[0] || "需要补充更具体的回答证据。",
      suggestion: (review.suggestions || [])[0] || "补充项目背景、个人动作和结果。",
      status: review.status || getReviewStatusByScore(Number(review.overallScore ?? review.score ?? overallScore)),
    })),
    nextPracticeFocus,
  };
}

function renderReviewIssues(issueCounts) {
  const max = Math.max(...issueCounts.map(([, count]) => count), 1);
  const fallback = [["暂无高频问题", 0]];
  const rows = (issueCounts.length ? issueCounts : fallback).slice(0, 4);
  $("#review-issue-list").innerHTML = rows.map(([issue, count]) => `
    <div class="review-issue-row">
      <div><strong>${escapeHTML(issue)}</strong><p>${getIssueDescription(issue)}</p></div>
      <div class="review-bar"><span style="width:${count ? Math.max(18, Math.round((count / max) * 100)) : 8}%"></span></div>
      <span class="status-badge ${count ? "warning" : ""}">${count} 次</span>
    </div>
  `).join("");
}

function getIssueDescription(issue) {
  if (issue.includes("结果")) return "没有指标、结果或反馈";
  if (issue.includes("案例")) return "背景、动作、过程偏泛";
  if (issue.includes("岗位")) return "没有贴近目标岗位表达";
  if (issue.includes("结构")) return "缺少背景、动作、结果闭环";
  if (issue.includes("个人")) return "你的关键动作不够突出";
  return "需要补充更具体的回答证据";
}

function renderReviewPriority(focus, issueCounts) {
  const items = (focus.length ? focus : issueCounts.map(([issue]) => issue)).slice(0, 3);
  $("#review-priority-list").innerHTML = (items.length ? items : ["结果证据", "案例细节", "岗位表达"]).map((item, index) => `
    <section class="review-priority-item">
      <span class="review-rank">${index + 1}</span>
      <div>
        <h3>${escapeHTML(item)}</h3>
        <p>${getPriorityDescription(item)}</p>
      </div>
      <span class="status-badge ${index === 0 ? "danger" : index === 1 ? "warning" : ""}">${index === 0 ? "高风险" : index === 1 ? "需复练" : "可提升"}</span>
    </section>
  `).join("");
}

function getPriorityDescription(item) {
  if (/结果|量化|指标|数据/.test(item)) return "回答里有行动过程，但缺少能证明效果的指标、结果或业务反馈。";
  if (/案例|真实|项目/.test(item)) return "案例本身可用，但背景、个人动作和关键细节还需要展开。";
  if (/岗位|表达|语言/.test(item)) return "需要把经历翻译成目标岗位更关心的能力语言。";
  return "这是本轮复盘中最影响面试表现的短板之一，下一批练习会优先覆盖。";
}

function renderReviewQuality(quality) {
  const rows = [
    ["优秀", quality.excellent, "var(--green)"],
    ["可用", quality.usable, "var(--blue)"],
    ["需补充", quality.needsWork, "var(--orange)"],
    ["无法点评", quality.invalid, "var(--red)"],
  ];
  const max = Math.max(...rows.map(([, count]) => count), 1);
  $("#review-quality-list").innerHTML = rows.map(([label, count, color]) => `
    <div class="review-quality-row">
      <span>${label}</span>
      <div class="review-bar"><span style="width:${count ? Math.max(12, Math.round((count / max) * 100)) : 6}%;background:${color}"></span></div>
      <strong>${count}</strong>
    </div>
  `).join("");
}

function renderReviewReasons(focus, issueCounts) {
  const issues = issueCounts.map(([issue]) => issue);
  const reasons = [
    `本轮最高频问题是「${issues[0] || "回答证据不足"}」，下一批会增加追问证据和结果的题。`,
    `优先补强「${focus[0] || "岗位核心能力"}」，帮助你把经历讲得更贴近目标岗位。`,
    `继续练习「${focus[1] || issues[1] || "案例细节"}」，让回答从方法论变成可验证的真实案例。`,
  ];
  $("#review-reason-grid").innerHTML = reasons.map((reason, index) => `
    <section class="review-reason-card">
      <span class="status-badge ${index === 0 ? "warning" : index === 1 ? "success" : ""}">原因 ${index + 1}</span>
      <p>${escapeHTML(reason)}</p>
    </section>
  `).join("");
}

function renderReviewQuestionList(entries) {
  $("#review-question-count").textContent = `${entries.length} 题`;
  $("#review-question-list").innerHTML = entries.map((entry, index) => `
    <button class="review-question-item ${index === state.reviewSelectedIndex ? "active" : ""}" data-review-index="${index}" type="button">
      <div class="review-question-line">
        <h3>${escapeHTML(entry.question)}</h3>
        <span class="status-badge ${getStatusClass(entry.status)}">${escapeHTML(entry.score)}</span>
      </div>
      <p>主要问题：${escapeHTML(entry.mainProblems[0] || "需要补充更具体的回答证据。")}</p>
    </button>
  `).join("");
  $$("#review-question-list .review-question-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.reviewSelectedIndex = Number(button.dataset.reviewIndex) || 0;
      renderReviewDetail(entries);
      renderReviewQuestionList(entries);
    });
  });
}

function renderReviewDetail(entries) {
  const entry = entries[state.reviewSelectedIndex] || entries[0];
  if (!entry) return;
  const statusEl = $("#review-selected-status");
  statusEl.textContent = entry.status || "需复练";
  statusEl.className = `status-badge ${getStatusClass(entry.status)}`;
  $("#review-detail-stats").innerHTML = `
    <div class="review-detail-stat"><strong>${escapeHTML(entry.score)}</strong><span>本题得分</span></div>
    <div class="review-detail-stat"><strong>${entry.mainProblems.length}</strong><span>命中问题</span></div>
    <div class="review-detail-stat"><strong>${entry.dimensions.length || 4}</strong><span>评分维度</span></div>
    <div class="review-detail-stat"><strong>${entry.score >= 75 ? "低" : entry.score >= 65 ? "中" : "高"}</strong><span>面试风险</span></div>
  `;
  $("#review-detail-grid").innerHTML = `
    <section class="review-detail-block">
      <h3>主要问题</h3>
      <ul>${entry.mainProblems.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </section>
    <section class="review-detail-block">
      <h3>改进建议</h3>
      <ul>${entry.suggestions.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderReviewSummary(summary = {}) {
  const diagnostics = getReviewDiagnostics(summary);
  const topIssue = diagnostics.issueCounts[0] || ["暂无高频问题", 0];
  state.reviewSelectedIndex = Math.min(state.reviewSelectedIndex || 0, Math.max(diagnostics.entries.length - 1, 0));

  $("#review-overall-score").textContent = diagnostics.average;
  const ringEl = $(".review-score-ring");
  if (ringEl) ringEl.style.background = `conic-gradient(var(--green) 0 ${Math.max(0, diagnostics.average - 52)}%, var(--blue) ${Math.max(0, diagnostics.average - 52)}% ${diagnostics.average}%, #e8eef8 ${diagnostics.average}% 100%)`;
  $("#review-overall-summary").textContent = summary.overallSummary || "已根据本轮答题生成复盘。";
  $("#review-answered-count").textContent = diagnostics.entries.length;
  $("#review-effective-rate").textContent = `${diagnostics.entries.length} / ${Math.max(Number(summary.answeredCount) || diagnostics.entries.length, diagnostics.entries.length)}`;
  $("#review-top-issue-count").textContent = topIssue[1];
  $("#review-top-issue").textContent = topIssue[1] ? `「${topIssue[0]}」是本轮最高频问题。` : "完成更多答题后会生成高频问题。";
  $("#review-next-focus-main").textContent = (diagnostics.focus[0] || "补强").slice(0, 4);
  $("#review-next-focus-copy").textContent = diagnostics.focus.length
    ? `下一批题会优先围绕：${diagnostics.focus.join("、")}。`
    : "下一批题会围绕本轮暴露的问题生成。";

  renderReviewIssues(diagnostics.issueCounts);
  renderReviewPriority(diagnostics.focus, diagnostics.issueCounts);
  renderReviewQuality(diagnostics.quality);
  renderReviewReasons(diagnostics.focus, diagnostics.issueCounts);
  renderReviewQuestionList(diagnostics.entries);
  renderReviewDetail(diagnostics.entries);
}

function prepareImprovePage() {
  if (!state.answerReviews?.length) {
    show($("#improve-blocked"));
    hide($("#improve-result"));
    return;
  }
  hide($("#improve-blocked"));
  show($("#improve-result"));
  state.reviewSummary = buildLocalReviewSummary();
  renderReviewSummary(state.reviewSummary);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderModalQuestion() {
  const question = getSelectedPracticeQuestion();
  if (!question) return;
  const progressText =
    state.practiceMode === "round"
      ? `刷题练习 · 第 ${state.selectedQuestion + 1} 题`
      : "单题练习 · 个性化补强";

  $("#modal-progress").textContent = progressText;
  $("#modal-question-title").textContent = question.title;
  $("#modal-question-meta").innerHTML = (question.skills || ["岗位能力"]).map((skill) => `<span>${escapeHTML(skill)}</span>`).join("");
}

function openPracticeModal(index = 0, mode = "round") {
  selectPracticeQuestion(index, mode);
  setStep("practice");
}

function closePracticeModal() {
  const modal = $("#practice-modal");
  if (modal) hide(modal);
  document.body.classList.remove("modal-open");
}

function resetAnswerReview() {
  hide($("#answer-clarify"));
  hide($("#answer-loading"));
  hide($("#answer-review"));
  hide($("#next-question"));
  hide($("#go-improve"));
  hide($("#answer-next-panel"));
  setStreamWaiting("#answer-stream-content");
  $("#submit-answer").textContent = "提交回答";
  $("#submit-answer").disabled = false;
  show($("#submit-answer"));
}

function renderAnswerReview(review) {
  const dimensions = review.dimensions?.length ? review.dimensions : [];
  $(".score-grid").innerHTML = dimensions
    .slice(0, 4)
    .map(
      (item) => `
        <div>
          <strong>${escapeHTML(item.score)}</strong>
          <span>${escapeHTML(item.name)}</span>
          <p>${escapeHTML(item.comment)}</p>
        </div>
      `,
    )
    .join("");
  const sections = $$("#answer-review .review-grid .result-section");
  sections[0].querySelector("ul").innerHTML = (review.mainProblems || [])
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
  sections[1].querySelector("ul").innerHTML = (review.suggestions || [])
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
}

async function submitAnswer() {
  const answer = $("#answer-input").value.trim();
  resetAnswerReview();

  const enough =
    getTextLength(answer) >= 60 ||
    (/项目|负责|用户|数据|指标|MVP|验证|结果|上线|反馈|转化|留存/.test(answer) && getTextLength(answer) >= 36);

  if (!enough) {
    show($("#answer-clarify"));
    return;
  }

  show($("#answer-loading"));
  $("#submit-answer").textContent = "正在点评回答...";
  $("#submit-answer").disabled = true;

  window.setTimeout(async () => {
    try {
      const question = getSelectedPracticeQuestion();
      let result;
      try {
        setStreamWaiting("#answer-stream-content");
        result = await requestStreamingJson("/api/review-answer-stream", {
          question,
          answer,
          jobModel: state.jobModel,
          userProfile: state.userProfile,
          gapAnalysis: state.gapAnalysis,
        }, {
          onContent: (text) => appendStreamingText("#answer-stream-content", text),
        });
      } catch (e) {
        console.warn("Review answer API failed, using fallback:", e.message);
        result = { isEnough: true, source: "fallback", answerReview: { overallScore: 68, summary: "回答有基本结构，但案例证据和结果量化可以更充分。", dimensions: [{ name: "结构清晰度", score: 70, comment: "有基本顺序，但可以更具体。" }, { name: "岗位贴合度", score: 65, comment: "能回应方向，但缺少岗位语言。" }, { name: "案例具体性", score: 60, comment: "缺少真实指标或用户反馈。" }, { name: "表达有效性", score: 72, comment: "观点清楚，需要用结果证明。" }], mainProblems: ["缺少量化结果", "个人贡献不够突出"], suggestions: ["补充真实项目指标", "说明验证过程"], optimizedDirection: "按 STAR 结构补充项目背景、个人动作和结果。" } };
      }

      hide($("#answer-loading"));
      if (!result.isEnough) {
        $("#answer-clarify p").textContent = result.message || "请补充真实项目、关键动作和结果。";
        show($("#answer-clarify"));
        $("#submit-answer").textContent = "提交回答";
        $("#submit-answer").disabled = false;
        return;
      }

      const answerReview = result.answerReview;
      state.answerReviews.push({
        questionTitle: question.title,
        userAnswer: answer,
        ...answerReview,
      });
      renderAnswerReview(answerReview);
      show($("#answer-review"));
      state.reviewReady = true;
      $(".step-pill[data-step-target='improve']").classList.remove("locked");
      if (state.practiceMode === "round" && state.selectedQuestion < getQuestionPool().length - 1) {
        show($("#next-question"));
      }
      show($("#answer-next-panel"));
      show($("#go-improve"));
      $("#submit-answer").textContent = "重新提交回答";
      $("#submit-answer").disabled = false;
    } catch (error) {
      hide($("#answer-loading"));
      $("#answer-clarify p").textContent = `回答点评失败：${error.message}`;
      show($("#answer-clarify"));
      $("#submit-answer").textContent = "提交回答";
      $("#submit-answer").disabled = false;
    }
  }, 700);
}

function goNextPracticeQuestion() {
  const pool = getQuestionPool();
  if (state.selectedQuestion >= pool.length - 1) {
    resetAnswerReview();
    return;
  }
  selectPracticeQuestion(state.selectedQuestion + 1, state.practiceMode);
}

$("#generate-job").addEventListener("click", () => beginJobAnalysis(false));
$("#retry-job").addEventListener("click", () => beginJobAnalysis(true));
$("#edit-job").addEventListener("click", resetJobOutput);
$("#go-background").addEventListener("click", () => setStep("background"));
$("#toggle-docs").addEventListener("click", () => toggleDocs());
$("#close-docs").addEventListener("click", () => toggleDocs(false));

$("#generate-profile").addEventListener("click", () => beginProfileAnalysis(false));
$("#retry-profile").addEventListener("click", () => beginProfileAnalysis(true));
$("#edit-profile").addEventListener("click", resetProfileOutput);
$("#go-ability").addEventListener("click", () => setStep("ability"));
$("#generate-gap").addEventListener("click", beginAbilityAnalysis);
$("#go-practice").addEventListener("click", () => setStep("practice"));
$("#start-practice-round").addEventListener("click", () => openPracticeModal(0, "round"));
$("#submit-answer").addEventListener("click", submitAnswer);
$("#next-question").addEventListener("click", goNextPracticeQuestion);
$("#go-improve").addEventListener("click", () => {
  closePracticeModal();
  setStep("improve");
});
$("#skip-practice").addEventListener("click", () => {
  $("#answer-input").value = "";
  resetAnswerReview();
});
$("#close-practice-modal").addEventListener("click", closePracticeModal);
$("#close-practice-modal-bottom").addEventListener("click", closePracticeModal);
$("#practice-modal").addEventListener("click", (event) => {
  if (event.target.id === "practice-modal") {
    closePracticeModal();
  }
});
$$(".practice-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.questionScope = button.dataset.questionScope;
    state.selectedQuestion = 0;
    $$(".practice-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    syncAbilityFilter();
    renderQuestionList();
    renderInlineQuestion();
    resetAnswerReview();
    bindPracticeButtons();
  });
});
$("#ability-filter").addEventListener("change", (event) => {
  state.abilityFilter = event.target.value;
  state.selectedQuestion = 0;
  renderQuestionList();
  renderInlineQuestion();
  resetAnswerReview();
  bindPracticeButtons();
});
$("#close-reference-modal").addEventListener("click", closeReferenceModal);
$("#close-reference-modal-bottom").addEventListener("click", closeReferenceModal);
$("#reference-modal").addEventListener("click", (event) => {
  if (event.target.id === "reference-modal") {
    closeReferenceModal();
  }
});

$$(".practice-single").forEach((button) => {
  button.addEventListener("click", () => openPracticeModal(Number(button.dataset.question), "single"));
});
bindReferenceButtons();

$$("[data-step-target]").forEach((button) => {
  button.addEventListener("click", () => setStep(button.dataset.stepTarget));
});

// Combo dropdown
let comboJustSelected = false;
document.addEventListener("click", (e) => {
  $$(".combo-dropdown.open").forEach((dd) => {
    if (!dd.parentElement.contains(e.target)) dd.classList.remove("open");
  });
});
$$(".combo-wrap").forEach((wrap) => {
  const input = wrap.querySelector(".combo-input");
  const arrow = wrap.querySelector(".combo-arrow");
  const dropdown = wrap.querySelector(".combo-dropdown");
  if (!input || !dropdown) return;
  const toggle = () => {
    if (comboJustSelected) { comboJustSelected = false; return; }
    const isOpen = dropdown.classList.contains("open");
    $$(".combo-dropdown.open").forEach((dd) => dd.classList.remove("open"));
    if (!isOpen) dropdown.classList.add("open");
  };
  if (arrow) arrow.addEventListener("click", toggle);
  input.addEventListener("focus", toggle);
  dropdown.querySelectorAll(".combo-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      input.value = opt.dataset.value || opt.textContent.trim();
      dropdown.classList.remove("open");
      comboJustSelected = true;
      input.blur();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
});

// Resume file import
const resumeFileBtn = $("#resume-file-btn");
const resumeFileInput = $("#resume-file-input");
const resumeFileStatus = $("#resume-file-status");
if (resumeFileBtn && resumeFileInput) {
  resumeFileBtn.addEventListener("click", () => resumeFileInput.click());
  resumeFileInput.addEventListener("change", async () => {
    const file = resumeFileInput.files[0];
    if (!file) return;
    resumeFileBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.8s linear infinite;"></span> 正在识别...';
    resumeFileBtn.disabled = true;
    resumeFileBtn.className = "file-import-btn";
    if (resumeFileStatus) resumeFileStatus.className = "file-import-status hidden";
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/extract-jd", { method: "POST", body: formData });
      if (!resp.ok) throw new Error("识别失败");
      const result = await resp.json();
      if (result.text) {
        const workInput = $("#work-input");
        if (workInput && !workInput.value.trim()) workInput.value = result.text.slice(0, 2000);
      }
      resumeFileBtn.innerHTML = '<span class="fi-icon">&#10003;</span> 识别成功';
      resumeFileBtn.className = "file-import-btn success";
      if (resumeFileStatus) { resumeFileStatus.textContent = `已从简历中提取经历信息（${file.name}）`; resumeFileStatus.className = "file-import-status success"; }
    } catch (err) {
      resumeFileBtn.innerHTML = '<span class="fi-icon">&#10007;</span> 识别失败，点击重试';
      resumeFileBtn.className = "file-import-btn fail";
      if (resumeFileStatus) { resumeFileStatus.textContent = "文件识别失败，请重试或手动输入"; resumeFileStatus.className = "file-import-status fail"; }
    }
    resumeFileBtn.disabled = false;
    resumeFileInput.value = "";
  });
}

// JD File import
const jdFileBtn = $("#jd-file-btn");
const jdFileInput = $("#jd-file-input");
const jdFileStatus = $("#jd-file-status");
if (jdFileBtn && jdFileInput) {
  jdFileBtn.addEventListener("click", () => jdFileInput.click());
  jdFileInput.addEventListener("change", async () => {
    const file = jdFileInput.files[0];
    if (!file) return;
    jdFileBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.8s linear infinite;"></span> 正在识别...';
    jdFileBtn.disabled = true;
    jdFileBtn.className = "file-import-btn";
    jdFileStatus.className = "file-import-status hidden";
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/extract-jd", { method: "POST", body: formData });
      if (!resp.ok) throw new Error(`识别失败: ${resp.status}`);
      const result = await resp.json();
      if (result.text) {
        $("#job-jd-input").value = result.text;
      }
      jdFileBtn.innerHTML = '<span class="fi-icon">&#10003;</span> 识别成功';
      jdFileBtn.className = "file-import-btn success";
      jdFileStatus.textContent = `AI 已从文件中识别到岗位信息并填充（${file.name}）`;
      jdFileStatus.className = "file-import-status success";
    } catch (err) {
      jdFileBtn.innerHTML = '<span class="fi-icon">&#10007;</span> 识别失败，点击重试';
      jdFileBtn.className = "file-import-btn fail";
      jdFileStatus.textContent = "文件识别失败，请重试或手动输入";
      jdFileStatus.className = "file-import-status fail";
    }
    jdFileBtn.disabled = false;
    jdFileInput.value = "";
  });
}

renderDocs();
