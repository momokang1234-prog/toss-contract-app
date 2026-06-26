const { execSync } = require('child_process');
const fs = require('fs');

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    return '';
  }
}

function main() {
  let inputData = '';
  process.stdin.on('data', chunk => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    let invocationNum = 1;
    let conversationId = '';
    
    try {
      if (inputData.trim()) {
        const context = JSON.parse(inputData);
        if (context) {
          if (typeof context.invocationNum === 'number') {
            invocationNum = context.invocationNum;
          }
          if (typeof context.conversationId === 'string') {
            conversationId = context.conversationId;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Removed tmux update logic; now handled by global * hook

    // Only inject the ephemeral message on the first invocation
    if (invocationNum === 1) {
      console.log(JSON.stringify({
        injectSteps: [
          {
            ephemeralMessage: `[SYSTEM INSTRUCTION] 시작 전 항상 의도 파악(A-to-B Reframing Protocol)을 먼저 수행하고, 그 결과를 'Intent Analysis Report' 형식으로 먼저 출력한 뒤 동의를 구하고 작업을 진행하세요. 자세한 가이드는 intent-analyzer 스킬(file:///root/toss-contract-app/.agents/skills/intent-analyzer/SKILL.md)을 확인하십시오.`
          }
        ]
      }));
    } else {
      console.log(JSON.stringify({ injectSteps: [] }));
    }
  });
}

main();
