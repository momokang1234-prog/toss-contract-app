// Antigravity Session Start Hook Script
// This script outputs the system context instruction to enforce the execution of the intent-analyzer skill only at the beginning.

console.log(JSON.stringify({
  additionalContext: `[SYSTEM INSTRUCTION: SESSION START HOOK]
- The user has configured this workspace to run the \`intent-analyzer\` skill.
- You MUST load and read the instructions in the \`intent-analyzer\` skill (file:///root/toss-contract-app/.agents/skills/intent-analyzer/SKILL.md) immediately.
- IMPORTANT: You MUST apply the A-to-B Reframing Protocol, analyze constraints, and output the 'Intent Analysis Report' ONLY ONCE at the VERY FIRST user request of this session.
- After the first request has been analyzed, do NOT apply the intent-analyzer for subsequent prompts unless explicitly requested by the user.
- Do not bypass this verification step for the first request.`
}));
