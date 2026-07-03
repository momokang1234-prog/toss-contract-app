---
description: Start autonomous development loop for toss-contract-app. This command initializes the orchestrator which will coordinate specialist agents for 2-3 hours of autonomous development. The loop will analyze codebase, implement improvements, fix bugs, and enhance features with minimal human intervention.
---

# Autonomous Development Loop Starter

This initiates the autonomous development loop for toss-contract-app.

## What This Does

1. **Initializes Orchestrator**: Loads the lead coordinator agent
2. **Analyzes Project**: Scans codebase, identifies priorities
3. **Dispatches Specialists**: Coordinates architect, builder, validator, QA agents
4. **Tracks Progress**: Updates PROGRESS.md every 30 minutes
5. **Reports Status**: Hourly summaries of completed work

## Expected Behavior

- **Runtime**: 2-3 hours of autonomous development
- **Scope**: Bug fixes, improvements, feature enhancements
- **Intervention**: Minimal (only for critical decisions)
- **Output**: Commits, progress updates, completion report

## How to Use

Simply call this command:
```
/start-autonomous-loop
```

The orchestrator will:
1. Assess current project state
2. Create prioritized task queue
3. Execute development iterations
4. Generate final report

## Safety Features

- **Quality Gates**: Each phase must pass validation
- **Rollback Ready**: All changes committed incrementally
- **Pause Conditions**: Auto-pauses on critical issues
- **Progress Visibility**: PROGRESS.md updated regularly

## What Gets Done

Typical autonomous session includes:
- Bug fixes from recent commits
- Test coverage improvements
- Code refactoring opportunities
- Feature enhancements (backlog items)
- Documentation updates
- Performance optimizations

## Stopping the Loop

To stop early:
- Use `/tasks` to check running agents
- Use `Ctrl+C` in active terminal
- Check `PROGRESS.md` for current state

## After Completion

Review:
1. `PROGRESS.md` - Full development log
2. Git commits - Incremental changes
3. Test results - Quality verification
4. Completion report - Summary of work

## Recovery

If interrupted:
- Check `PROGRESS.md` for last state
- Review recent git commits
- Re-run this command to resume

---

**Note**: This is designed for hands-off operation. The orchestrator will make routine decisions and only pause for critical issues requiring human judgment.
