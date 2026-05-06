# JobFit AI Interview Agent

JobFit 是一套面向求职面试准备场景的智能面试教练 Agent 产品。产品围绕目标岗位和个人经历，构建从岗位理解、候选人分析、能力差距诊断、模拟面试、AI 答题点评到复盘提升的完整工作流，帮助用户更有针对性地准备岗位面试。

这个项目重点展示 AI 产品经理在真实业务场景中的产品设计能力：将求职准备流程拆解为可执行 Agent 工作流，引入 RAG 流程提升题目真实性，并将岗位能力建模、题目筛选与改写等高频 AI 能力沉淀为可复用 Skill。

## Core Capabilities

- 岗位能力建模：根据岗位名称、JD 和行业信息生成岗位族、核心职责、核心能力、关键技能和面试关注点。
- 个人能力画像：基于用户背景识别已有能力、优势信号和薄弱点。
- 能力差距诊断：对比目标岗位能力和用户现状，输出匹配度、面试风险和优先练习方向。
- 模拟面试训练：围绕能力差距生成针对性练习题，并提供考察点、答题框架和参考回答示例。
- AI 答题点评：判断回答是否足够具体，并从结构、岗位贴合度、案例证据和表达效果等维度给出反馈。
- 复盘提升分析：基于本轮答题记录生成综合表现、主要问题、能力短板和下一批练习方向。

## Agent Workflow

```text
目标岗位输入
  -> 岗位能力模型
  -> 个人能力画像
  -> 能力差距分析
  -> 针对性模拟面试
  -> AI 回答点评
  -> 复盘提升与下一轮练习
```

JobFit 不是单次问答工具，而是围绕用户目标持续推进的 Agent 工作流。每一步都会产生结构化数据，并作为下一步分析、决策和训练的输入。

## RAG Flow

项目中加入了 RAG 流程，用于提升面试题的真实性和岗位贴合度：

```text
公开题源检索
  -> 网页正文抓取
  -> 真实面试题抽取
  -> 题库沉淀
  -> 能力标签匹配
  -> 针对性练习推荐
```

真实公开资料负责提供题目来源，AI 负责抽题、筛选、打标签、轻度改写和生成答题参考。题目记录按题目级结构存储，支持跨岗位复用和后续向量检索扩展。

## Skill Design

项目将部分高频 AI 能力沉淀为可复用 Skill：

- `jobfit-job-model`：岗位能力模型 Skill，定义岗位族判断、职责抽取、核心能力建模和异常处理规则。
- `jobfit-question-curation`：题目筛选与改写 Skill，定义真实题源抽取、能力标签判断、题型分类、题目改写和答题参考生成规则。

Skill 不是普通 prompt，而是 Agent 的标准作业能力说明书。它将业务规则、输入输出、判断标准和失败处理显式化，帮助 AI 在不同岗位和不同用户背景下稳定执行任务。

## Project Structure

```text
.
├── server.mjs
├── package.json
├── jobfit-prototype/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── data/
│   └── question-bank.json
├── skills/
│   ├── jobfit-job-model/
│   │   └── SKILL.md
│   └── jobfit-question-curation/
│       └── SKILL.md
├── docs/
│   ├── product-overview.md
│   ├── agent-workflow.md
│   └── rag-and-skill-design.md
└── .env.example
```

## Run Locally

```bash
npm install
cp .env.example .env
npm start
```

默认访问：

```text
http://127.0.0.1:4188
```

`.env` 需要自行配置模型和搜索服务密钥。仓库不会包含任何真实密钥。

## Notes

- 当前仓库为面试展示版，保留核心产品代码、样例题库、Skill 设计和产品说明文档。
- `.env`、`node_modules`、临时草图和个人学习笔记不会进入仓库。
- 后续可扩展方向包括后台题库采集任务、embedding 召回、rerank、长期练习趋势分析和 MCP Server 工具化接入。
