#!/usr/bin/env node
/**
 * Hard Timer Hook - Ensures autonomous loop continues until 7:00 AM
 * This script runs continuously and checks timer status
 */

const TARGET_HOUR = 7;
const TARGET_MINUTE = 0;
const CHECK_INTERVAL = 60000; // Check every minute

class AutonomousLoopTimer {
  constructor() {
    this.startTime = Date.now();
    this.targetTime = this.getTargetTime();
    this.running = true;
    this.checkCount = 0;
  }

  getTargetTime() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

    // If target is in the past, set for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    return target.getTime();
  }

  formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  checkTimer() {
    this.checkCount++;
    const now = Date.now();
    const remaining = Math.max(0, this.targetTime - now);
    const elapsed = now - this.startTime;
    const progress = Math.min(100, (elapsed / (this.targetTime - this.startTime)) * 100);

    console.log('\n' + '='.repeat(60));
    console.log(`🤖 AUTONOMOUS LOOP TIMER CHECK #${this.checkCount}`);
    console.log('='.repeat(60));
    console.log(`⏰ Current Time:    ${new Date(now).toLocaleString('ko-KR')}`);
    console.log(`🎯 Target Time:    ${new Date(this.targetTime).toLocaleString('ko-KR')}`);
    console.log(`⏳ Remaining:      ${this.formatTime(remaining)}`);
    console.log(`📊 Progress:       ${progress.toFixed(1)}%`);
    console.log(`⚡ Status:         ${remaining > 0 ? '🟢 RUNNING' : '🔴 COMPLETE'}`);
    console.log('='.repeat(60));

    if (remaining <= 0) {
      console.log('\n🎉 TARGET TIME REACHED!');
      console.log('✅ Autonomous loop completed successfully at 07:00 KST');
      console.log(`📈 Total checks: ${this.checkCount}`);
      console.log(`⏱️  Total runtime: ${this.formatTime(elapsed)}`);
      this.running = false;
      process.exit(0);
    }

    // Log to file
    const fs = require('fs');
    const logEntry = {
      timestamp: new Date().toISOString(),
      checkNumber: this.checkCount,
      remaining: this.formatTime(remaining),
      progress: progress.toFixed(1) + '%',
      status: remaining > 0 ? 'RUNNING' : 'COMPLETE'
    };

    fs.appendFileSync(
      '.claude/timer-log.jsonl',
      JSON.stringify(logEntry) + '\n'
    );
  }

  start() {
    console.log('🚀 Autonomous Loop Timer Started');
    console.log(`📅 Started: ${new Date(this.startTime).toLocaleString('ko-KR')}`);
    console.log(`🎯 Target: ${new Date(this.targetTime).toLocaleString('ko-KR')}`);
    console.log(`⏱️  Duration: ${this.formatTime(this.targetTime - this.startTime)}`);
    console.log('');

    // Initial check
    this.checkTimer();

    // Set up interval checks
    this.intervalId = setInterval(() => {
      if (this.running) {
        this.checkTimer();
      }
    }, CHECK_INTERVAL);

    // Keep process alive
    this.keepAlive();
  }

  keepAlive() {
    // Prevent process from exiting
    const keepAliveInterval = setInterval(() => {
      // Do nothing, just keep process alive
    }, 10000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n⚠️  SIGINT received but loop continues until 07:00!');
      console.log('🔄 Timer check will continue...');
      this.checkTimer();
    });

    process.on('SIGTERM', () => {
      console.log('\n\n⚠️  SIGTERM received but loop continues until 07:00!');
      console.log('🔄 Timer check will continue...');
      this.checkTimer();
    });
  }
}

// Start the timer
if (require.main === module) {
  const timer = new AutonomousLoopTimer();
  timer.start();
}

module.exports = AutonomousLoopTimer;
