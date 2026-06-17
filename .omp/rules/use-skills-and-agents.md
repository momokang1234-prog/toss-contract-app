name: use-skills-and-agents
type: always
description: "작업 수행 시 스킬과 에이전트 목록을 우선 탐색하고 도구를 호출하도록 강제하는 지침"

# Active Use of Skills and Agents

When performing any task, you MUST unconditionally review the available list of skills and subagents. Find the most appropriate skill or agent for the given context, and then actively invoke them or make the corresponding tool calls to execute the task. Do not attempt to perform tasks manually if a specialized agent or skill is available to handle it.
