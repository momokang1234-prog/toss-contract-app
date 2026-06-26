const { execSync } = require('child_process');

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
    let conversationId = '';
    
    try {
      if (inputData.trim()) {
        const context = JSON.parse(inputData);
        if (context && typeof context.conversationId === 'string') {
          conversationId = context.conversationId;
        }
      }
    } catch (e) {
      // ignore
    }

    if (conversationId) {
      // Background update call
      runCmd(`node /root/toss-contract-app/scripts/tmux_manager.cjs update ${conversationId}`);
    }

    // Always return a valid JSON format for the hook
    console.log(JSON.stringify({ injectSteps: [] }));
  });
}

main();
