---
type: session
agent: agy-cli
model: antigravity-agent
project: 99f966cc-1ae4-4dbb-9488-9aabc14bade5
session_id: 99f966cc-1ae4-4dbb-9488-9aabc14bade5
date: 2026-06-30
start_time: "2026-06-30T18:39:02+00:00"
end_time: "2026-06-30T18:39:02+00:00"
turns: 5
tokens_in: 0
tokens_out: 0
tools_used: [grep_search]
host: DESKTOP-QBALFK6
status: raw
session_type: interactive
---

# agy-cli 세션: 99f966cc-1ae4-4dbb-9488-9aabc14bade5

> **프로젝트**: 99f966cc-1ae4-4dbb-9488-9aabc14bade5 | **브랜치**: - | **시간**: 18:39 (0m)

## Turn 1 — Assistant

Created At: 2026-07-01T03:38:43+09:00
Completed At: 2026-07-01T03:38:43+09:00
File Path: `file:///root/.gemini/antigravity-cli/builtin/skills/antigravity_guide/SKILL.md`
Total Lines: 54
Total Bytes: 2945
Showing lines 1 to 54
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: ---
2: name: antigravity-guide
3: description: Provides a comprehensive guide, quick reference, and sitemap for Google Antigravity (AGY), including the Antigravity CLI (agy), Antigravity 2.0, Antigravity IDE, Python SDK, slash commands, keybindings, and customizations (skills, rules, MCP, sidecars). Activate this skill when the user asks questions about how to use, configure, or customize Antigravity, AGY, the agy CLI, the Antigravity IDE, or Antigravity 2.0.
4: ---
5: 
6: # Google Antigravity (AGY) Guide & Sitemap
7: 
8: Google Antigravity is an AI-first development platform. Depending on which
9: surface the user is asking about, you **MUST** read the corresponding
10: subdocumentation in the `references/` directory of this skill:
11: 
12: ## 1. Surfaces Sitemap (Offline Subdocs)
13: 
14: -   **Antigravity CLI (`agy`)**: [references/cli.md](references/cli.md)
15:     -   Covers TUI navigation, keyboard shortcuts, CLI-only slash commands, and
16:         `settings.json` configuration keys.
17: -   **Antigravity IDE**: [references/ide.md](references/ide.md)
18:     -   Covers the standalone AI-first IDE, sidebar chat panels, and inline code
19:         lenses.
20: -   **Antigravity 2.0**: [references/app.md](references/app.md)
21:     -   Covers the parallel desktop application, left-hand sidebar, chat canvas,
22:         and the HTML Auxiliary Pane (Subagents, Background Tasks, Artifacts,
23:         Files Changed, Terminals).
24: -   **Antigravity SDK**: [references/sdk.md](references/sdk.md)
25:     -   Covers the public Python SDK
26:         (https://github.com/google-antigravity/antigravity-sdk-python) for
27:         programmatic agent leasing, orchestration APIs, and custom tool
28:         exposing.
29: 
30: --------------------------------------------------------------------------------
31: 
32: ## 2. Smart Hybrid Retrieval: When to Fetch Live Docs
33: 
34: The offline subdocs provide excellent quick references. However, if the user
35: asks for the latest updates, advanced Vertex AI integrations, or complex setups
36: not covered here, you **MUST** dynamically fetch the live page from the official
37: sitemap:
38: 
39: <!-- LINT.IfChange(sitemap) -->
40: 
41: -   **Main Documentation Home**: `https://antigravity.google/docs`
42: -   **Skills**: `https://antigravity.google/docs/skills`
43: -   **Rules**: `https://antigravity.google/docs/rules`
44: -   **Hooks**: `https://antigravity.google/docs/hooks`
45: -   **Plugins**: `https://antigravity.google/docs/plugins`
46: -   **Sidecars**: `https://antigravity.google/docs/sidecars`
47: -   **Model Context Protocol (MCP)**: `https://antigravity.google/docs/mcp`
48: -   **Browser Automation & Testing**: `https://antigravity.google/docs/browser`
49: -   **Agent Permissions & Security**:
50:     `https://antigravity.google/docs/agent-permissions`
51: -   **Changelog & Release Notes**: `https://antigravity.google/changelog`
52: -   **Troubleshooting & Support**: `https://antigravity.google/support`
53:     <!-- LINT.ThenChange(//depot/google3/third_party/gemini_coder/agent_ui_toolkit/dev/appVariant/externalAppVariant.ts:custom_links) -->
54: 
The above content shows the entire, complete file contents of the requested file.

## Turn 2 — System

The following is an <EPHEMERAL_MESSAGE> not actually sent by the user. It is provided by the system as a set of reminders and general important information to pay attention to. Do NOT respond to this message, just act accordingly.

<EPHEMERAL_MESSAGE>
<bash_command_reminder>
CRITICAL INSTRUCTION 1: You may have access to a variety of tools at your disposal. Some tools may be for a specific task such as 'view_file' (for viewing contents of a file). Others may be very broadly applicable such as the ability to run a command on a terminal. Always prioritize using the most specific tool you can for the task at hand. Here are some rules: (a) NEVER run cat inside a bash command to create a new file or append to an existing file. (b) ALWAYS use grep_search instead of running grep inside a bash command unless absolutely needed. (c) DO NOT use ls for listing, cat for viewing, grep for finding, sed for replacing. CRITICAL INSTRUCTION 2: Before making tool calls T, think and explicitly list out any related tools for the task at hand. You can only execute a set of tools T if all other tools in the list are either more generic or cannot be used for the task at hand. ALWAYS START your thought with recalling critical instructions 1 and 2. In particular, the format for the start of your thought block must be '...94>thought
CRITICAL INSTRUCTION 1: ...
CRITICAL INSTRUCTION 2: ...'.
</bash_command_reminder>
</EPHEMERAL_MESSAGE>

## Turn 3 — Assistant

> [!tool]- grep_search

## Turn 4 — System

The following is an <EPHEMERAL_MESSAGE> not actually sent by the user. It is provided by the system as a set of reminders and general important information to pay attention to. Do NOT respond to this message, just act accordingly.

<EPHEMERAL_MESSAGE>
<bash_command_reminder>
CRITICAL INSTRUCTION 1: You may have access to a variety of tools at your disposal. Some tools may be for a specific task such as 'view_file' (for viewing contents of a file). Others may be very broadly applicable such as the ability to run a command on a terminal. Always prioritize using the most specific tool you can for the task at hand. Here are some rules: (a) NEVER run cat inside a bash command to create a new file or append to an existing file. (b) ALWAYS use grep_search instead of running grep inside a bash command unless absolutely needed. (c) DO NOT use ls for listing, cat for viewing, grep for finding, sed for replacing. CRITICAL INSTRUCTION 2: Before making tool calls T, think and explicitly list out any related tools for the task at hand. You can only execute a set of tools T if all other tools in the list are either more generic or cannot be used for the task at hand. ALWAYS START your thought with recalling critical instructions 1 and 2. In particular, the format for the start of your thought block must be '...94>thought
CRITICAL INSTRUCTION 1: ...
CRITICAL INSTRUCTION 2: ...'.
</bash_command_reminder>
</EPHEMERAL_MESSAGE>

## Turn 5 — Assistant

**아니요, AGY CLI 자체에는 "DAG(Directed Acyclic Graph)" 전용 내장 엔진이나 명령어(`agy dag` 등)가 제공되지 않습니다.** (Apache Airflow나 LangGraph 같이 시각적이거나 엄격한 상태 머신 기반의 기본 DAG 빌더는 없습니다.)

하지만 AGY CLI는 **서브에이전트 통신 기능(A2A, Agent-to-Agent)**을 통해 DAG와 유사한 복잡한 워크플로우를 "에이전트 단위"로 동적 구현하도록 설계되어 있습니다. 구체적인 방식은 다음과 같습니다.

### AGY CLI에서 DAG 워크플로우를 구현하는 방식
1. **A2A 오케스트레이션 (동적 Graph)**
   - `invoke_subagent`: 여러 서브에이전트를 병렬로 생성합니다 (Fan-out).
   - `send_message`: 에이전트 간 비동기로 메시지를 주고받으며 선행/후행 작업의 의존성을 해결합니다. 이를 통해 런타임에 동적인 그래프(Graph) 워크플로우가 형성됩니다.
2. **백그라운드 비동기 제어**
   - `manage_task`, `schedule` 등을 이용해 백그라운드 태스크의 상태를 추적하고 콜백(Callback)을 관리합니다.
3. **외부 DAG 프레임워크 연동 (권장)**
   - 앞서 시스템 리포트(`upgrade_final_report.md` 등)에서 권고된 것처럼, AGY CLI 환경 위에서 **LangGraph**, **Dagster**, **Prefect** 같은 Python 기반 DAG 프레임워크를 연동하는 스크립트(플러그인/스킬)를 구성하여 통제하는 방식을 주로 사용합니다.

요약하자면, AGY CLI가 자체적인 DAG 문법이나 실행기를 갖고 있지는 않지만, **서브에이전트(Subagent) 간의 메시징을 통해 분산형 노드(Node) 워크플로우를 만들거나, 외부 Python DAG 프레임워크를 에이전트가 실행하도록 지시**하는 방식으로 운영됩니다. 

관련하여 외부 프레임워크(예: LangGraph)를 연동하는 스크립트 세팅을 도와드릴까요?

