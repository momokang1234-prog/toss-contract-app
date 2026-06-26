const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function writeLog(msg) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('/tmp/agy_tmux.log', `[${timestamp}] ${msg}\n`);
  } catch (e) {}
}

function runCmd(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf8' }).trim();
    writeLog(`[CMD] ${cmd} => ${result ? result.substring(0, 50) + (result.length > 50 ? '...' : '') : 'SUCCESS'}`);
    return result;
  } catch (e) {
    writeLog(`[CMD ERROR] ${cmd} => ${e.message}`);
    return '';
  }
}

function getPaneId() {
  const pane = process.env.TMUX_PANE;
  if (pane) {
    return pane;
  }
  return runCmd("tmux display-message -p '#{pane_id}'") || '%0';
}

function getStatePath(paneId) {
  const cleanId = paneId.replace(/[^a-zA-Z0-9]/g, '_');
  return `/tmp/tmux_state_${cleanId}.json`;
}

function getSessionInfo(conversationId, paneId) {
  const logPath = `/root/.gemini/antigravity-cli/brain/${conversationId}/.system_generated/logs/transcript.jsonl`;
  let title = "Antigravity Session";
  let summary = "대기 중...";

  if (!fs.existsSync(logPath)) {
    return { title, summary };
  }

  try {
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
    let firstInput = '';
    let lastInput = '';

    // Parse checkpoint first for compaction history
    for (const line of lines) {
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'CHECKPOINT' && obj.content) {
          const match = obj.content.match(/1\.\s+(.+)/);
          if (match && match[1]) {
            firstInput = match[1].trim();
          }
        }
      } catch (e) {}
    }

    // Parse explicit USER_INPUT steps
    for (const line of lines) {
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT' && obj.content) {
          const cleaned = obj.content
            .replace(/<[^>]+>/g, '') // remove tags
            .replace(/\s+/g, ' ')    // collapse spaces
            .trim();
          
          if (!firstInput) {
            firstInput = cleaned;
          }
          lastInput = cleaned;
        }
      } catch (e) {}
    }

    if (firstInput) {
      title = firstInput;
    }
    if (lastInput) {
      summary = lastInput;
    }
  } catch (e) {
    // ignore
  }

  // Dynamic truncation based on actual pane width to prevent wrapping issues
  const paneWidth = parseInt(runCmd(`tmux display-message -p -t "${paneId}" '#{pane_width}'`) || '80', 10);
  const budget = Math.max(30, paneWidth - 10); 
  
  let titleLimit = Math.max(15, Math.min(30, Math.floor(budget * 0.4)));
  let summaryLimit = Math.max(15, Math.min(50, budget - titleLimit));

  if (title.length > titleLimit) {
    title = title.substring(0, titleLimit - 3) + "...";
  }
  if (summary.length > summaryLimit) {
    summary = summary.substring(0, summaryLimit - 3) + "...";
  }

  return { title, summary };
}

function getResumeConversationId() {
  const historyPath = '/root/.gemini/antigravity-cli/history.jsonl';
  if (!fs.existsSync(historyPath)) return null;
  const lines = fs.readFileSync(historyPath, 'utf8').trim().split('\n');
  const currentWorkspace = process.cwd();
  
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i]) continue;
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.workspace === currentWorkspace && obj.conversationId) {
        return obj.conversationId;
      }
    } catch(e) {}
  }
  return null;
}

function init() {
  const paneId = getPaneId();
  const statePath = getStatePath(paneId);

  if (fs.existsSync(statePath)) {
    return;
  }

  // Check if this is the first agy session active
  const existingStates = fs.readdirSync('/tmp').filter(f => f.startsWith('tmux_state_') && f.endsWith('.json'));
  
  let originalStatus = 'off';

  if (existingStates.length === 0) {
    // Backup global status configuration
    originalStatus = runCmd(`tmux show-option -gqv pane-border-status`) || 'off';
    
    // Cleanup any old global formats from previous broken versions
    runCmd(`tmux set-option -g -u pane-border-format`);
    
    runCmd(`tmux set-option -g pane-border-status bottom`);
  } else {
    try {
      const firstStateFile = path.join('/tmp', existingStates[0]);
      const data = JSON.parse(fs.readFileSync(firstStateFile, 'utf8'));
      originalStatus = data.originalStatus;
    } catch (e) {}
  }

  const state = {
    originalStatus
  };

  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

  // Pick a bright, distinct random color
  const colors = [ 39, 45, 51, 75, 81, 87, 111, 117, 123, 141, 147, 153, 203, 209, 215, 220, 226 ];
  const randColor = colors[Math.floor(Math.random() * colors.length)];

  // Set the pane-local format! Only Title and Summary. No agy text, no desktop title.
  const paneFormat = `#{?pane_active,#[reverse],}#{pane_index}#[default] #[fg=colour${randColor}]#[bold]#{@agy_session_title}#[default] | #[fg=colour245]#{@agy_session_summary}#[default]`;
  
  runCmd(`tmux set-option -p -t "${paneId}" pane-border-format '${paneFormat}'`);
  
  // Try to resume session immediately
  let title = "연결 중...";
  let summary = "대화 분석 중...";
  
  const args = process.argv.slice(3);
  const isNew = args.includes('--new') || args.includes('-n');
  writeLog(`[INIT] Starting init for Pane: ${paneId}. args: ${JSON.stringify(args)}, isNew: ${isNew}`);
  
  if (!isNew) {
    const resumeId = getResumeConversationId();
    writeLog(`[INIT] Resolved Resume ID: ${resumeId}`);
    if (resumeId) {
      const info = getSessionInfo(resumeId, paneId);
      if (info.title !== "Antigravity Session") {
        title = info.title;
        summary = info.summary;
        writeLog(`[INIT] Resumed Title: ${title}, Summary: ${summary}`);
      } else {
        writeLog(`[INIT] Found resume ID but could not parse transcripts properly.`);
      }
    }
  }

  runCmd(`tmux set-option -p -t "${paneId}" @agy_session_title "${title}"`);
  runCmd(`tmux set-option -p -t "${paneId}" @agy_session_summary "${summary}"`);
}

function update(conversationId) {
  const paneId = getPaneId();
  
  if (!conversationId) {
    return;
  }

  const { title, summary } = getSessionInfo(conversationId, paneId);
  
  // Update the pane-local user options
  runCmd(`tmux set-option -p -t "${paneId}" @agy_session_title "${title}"`);
  runCmd(`tmux set-option -p -t "${paneId}" @agy_session_summary "${summary}"`);
  
  // Ensure pane-border-status bottom is set globally
  runCmd(`tmux set-option -g pane-border-status bottom`);
}

function reset() {
  const paneId = getPaneId();
  const statePath = getStatePath(paneId);

  // Unset the pane-local options
  runCmd(`tmux set-option -p -u -t "${paneId}" @agy_session_title`);
  runCmd(`tmux set-option -p -u -t "${paneId}" @agy_session_summary`);
  runCmd(`tmux set-option -p -u -t "${paneId}" pane-border-format`);

  if (!fs.existsSync(statePath)) {
    return;
  }

  let originalStatus = 'off';

  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    originalStatus = state.originalStatus;
  } catch (e) {}

  try {
    fs.unlinkSync(statePath);
  } catch (e) {}

  // Check if other sessions are still active
  const remainingStates = fs.readdirSync('/tmp').filter(f => f.startsWith('tmux_state_') && f.endsWith('.json'));
  
  if (remainingStates.length === 0) {
    // No other sessions left, restore global status settings
    if (originalStatus === 'top' || originalStatus === 'bottom' || originalStatus === 'off') {
      runCmd(`tmux set-option -g pane-border-status ${originalStatus}`);
    } else {
      runCmd(`tmux set-option -g -u pane-border-status`);
    }
  }
}

const action = process.argv[2];
const argId = process.argv[3];

if (action === 'init') {
  init();
} else if (action === 'update') {
  update(argId);
} else if (action === 'reset') {
  reset();
} else {
  console.log("Usage: node tmux_manager.cjs [init|update|reset] [conversationId]");
}
