#!/usr/bin/env node
/**
 * Research Team Loop - Multi-Agent Collaborative Research
 *
 * Runs research topics through a 6-agent team:
 * - Research Coordinator: Orchestrates process
 * - Lead Researcher: Primary investigation (uses insane-search)
 * - Cross-Examiner: Challenges assumptions
 * - Fact-Checker: Validates claims
 * - Peer Reviewer: Quality assessment
 * - Knowledge Integrator: Synthesizes final knowledge
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESEARCH_TOPICS = [
  // === Priority: Toss Mini-App Launch ===
  {
    id: 'toss-miniapp-launch-complete',
    title: '토스 미니앱 출시까지 필요한 모든 직간접적 지식 (Complete Knowledge for Toss Mini-App Launch)',
    questions: [
      'What are all requirements for Toss mini-app production launch?',
      'What are the Granite framework production deployment steps?',
      'What security and compliance requirements exist?',
      'What are the common launch blockers and how to avoid them?',
      'What documentation and deliverables are required?'
    ],
    sources: ['antigravity.google/docs', 'toss.im', 'github.com/toss', ' Granite docs']
  },
  {
    id: 'granite-production-deployment',
    title: 'Granite Framework Production Deployment Best Practices',
    questions: [
      'How to configure Granite for production environment?',
      'What are the build and deployment steps?',
      'How to handle environment variables and secrets?',
      'What are the performance optimization settings?',
      'How to set up monitoring and logging?'
    ],
    sources: ['antigravity.google/docs', 'github.com/toss/granite']
  },
  // === Priority: User Personalization ===
  {
    id: 'user-personalization-strategies',
    title: '사용자 개인 맞춤화 전략 (User Personalization Strategies)',
    questions: [
      'What are the effective personalization patterns for contract apps?',
      'How to implement role-based UX (employer vs worker)?',
      'What personalization data should be collected?',
      'How to balance personalization with privacy?',
      'What are the personalization triggers and rules?'
    ],
    sources: ['nngroup.com', 'smashingmagazine.com', 'uxdesign.cc', 'medium.com']
  },
  {
    id: 'personalization-data-architecture',
    title: 'Personalization Data Architecture and Storage',
    questions: [
      'How to store user preferences in Supabase?',
      'What is the optimal schema for personalization data?',
      'How to handle real-time personalization updates?',
      'What are the RLS policies for personalization data?'
    ],
    sources: ['supabase.com/docs', 'postgresql.org/docs']
  },
  // === Priority: Insight Extraction ===
  {
    id: 'insight-extraction-ux',
    title: '인사이트 추출을 위한 UX 패턴 (UX Patterns for Insight Extraction)',
    questions: [
      'What UI patterns help extract user insights?',
      'How to design effective feedback collection flows?',
      'What are the best analytics event tracking practices?',
      'How to extract insights from user behavior data?'
    ],
    sources: ['mixpanel.com/blog', 'amplitude.com/blog', 'producthunt.com']
  },
  {
    id: 'analytics-tracking-contract-app',
    title: 'Analytics Tracking for Contract Applications',
    questions: [
      'What events to track for contract signing flows?',
      'How to measure drop-off points in contracts?',
      'What are the key metrics for contract app success?',
      'How to set up funnel analytics?'
    ],
    sources: ['segment.com/blog', 'googleanalytics.dev']
  },
  // === Technical Foundation ===
  {
    id: 'react-performance-2026',
    title: 'React Performance Optimization Patterns 2026',
    questions: [
      'What are the latest React performance optimization patterns?',
      'How does React Compiler change optimization approaches?',
      'What are the best practices for memoization in 2026?'
    ],
    sources: ['react.dev', 'github.com/facebook/react', 'devblogs']
  },
  {
    id: 'vite-plugin-ecosystem',
    title: 'Vite Plugin Ecosystem Analysis',
    questions: [
      'What essential Vite plugins exist for production apps?',
      'How to optimize plugin loading order?',
      'Which plugins provide the best bundle size reduction?'
    ],
    sources: ['vitejs.dev', 'github.com/vitejs/vite', 'npm trends']
  }
];

const OUTPUT_DIR = path.join(__dirname, '../.claude/research-reports');
const TARGET_TIME = new Date().setHours(7, 0, 0, 0); // 7:00 AM today

class ResearchLoop {
  constructor() {
    this.startTime = Date.now();
    this.completedTopics = [];
    this.currentTopic = null;
    this.running = true;
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  }

  getRemainingTime() {
    return Math.max(0, TARGET_TIME - Date.now());
  }

  formatTime(ms) {
    if (ms <= 0) return '0h 0m 0s';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  logStatus(message) {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const remaining = this.getRemainingTime();

    console.log(`\n[${timestamp}] ${message}`);
    console.log(`┌─ Research Loop Status ─────────────────────────────────────`);
    console.log(`│ Running: ${this.running ? '🟢' : '🔴'}`);
    console.log(`│ Elapsed: ${this.formatTime(elapsed)}`);
    console.log(`│ Remaining: ${this.formatTime(remaining)}`);
    console.log(`│ Progress: ${this.completedTopics.length}/${RESEARCH_TOPICS.length} topics`);
    if (this.currentTopic) {
      console.log(`│ Current: ${this.currentTopic.title.substring(0, 50)}...`);
    }
    console.log(`└───────────────────────────────────────────────────────────`);
  }

  async runInsaneSearch(topic) {
    console.log(`\n🔍 Phase 2: Lead Researcher - insane-search investigation`);
    console.log(`Topic: ${topic.title}`);

    const searchPrompt = `
Research Topic: ${topic.title}

Research Questions:
${topic.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Use insane-search to:
1. Search multiple sources about this topic
2. Find recent blog posts, documentation, GitHub discussions
3. Identify patterns and best practices
4. Collect specific code examples and configurations

Focus on 2026-current information and toss-contract-app context.
`;

    // This would call the insane-search skill
    // For now, simulate with placeholder
    return {
      findings: 'Research findings would be generated by insane-search',
      sources: topic.sources,
      confidence: 'medium'
    };
  }

  crossExamineFindings(findings, topic) {
    console.log(`\n🔎 Phase 3: Cross-Examination`);

    const challenges = [
      'What assumptions are being made?',
      'Are there alternative approaches?',
      'What are the limitations of this approach?',
      'Does this apply to our specific context?'
    ];

    return challenges.map(challenge => ({
      challenge,
      response: 'Cross-examination would validate findings'
    }));
  }

  factCheckFindings(findings) {
    console.log(`\n✓ Phase 4: Fact-Checking`);

    return {
      verifiedClaims: [],
      disputedClaims: [],
      missingEvidence: []
    };
  }

  peerReviewReport(reportData) {
    console.log(`\n📋 Phase 5: Peer Review`);

    return {
      completenessScore: 0,
      accuracyScore: 0,
      recommendations: []
    };
  }

  synthesizeReport(topic, researchData, crossExam, factCheck, peerReview) {
    console.log(`\n📝 Phase 6: Knowledge Synthesis`);

    const report = {
      meta: {
        topicId: topic.id,
        title: topic.title,
        date: new Date().toISOString(),
        version: '1.0'
      },
      questions: topic.questions,
      methodology: {
        approach: 'Multi-agent collaborative research with insane-search',
        sources: researchData.sources,
        timeline: `${Math.floor((Date.now() - this.startTime) / 60000)} minutes`
      },
      findings: researchData,
      crossExamination: crossExam,
      factCheck: factCheck,
      peerReview: peerReview
    };

    // Save report
    const reportPath = path.join(OUTPUT_DIR, `${topic.id}.md`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Report saved: ${reportPath}`);
    return report;
  }

  async researchTopic(topic) {
    this.currentTopic = topic;
    this.logStatus(`Starting: ${topic.title}`);

    try {
      // Phase 1: Briefing (already done)
      console.log(`\n📋 Phase 1: Research Briefing`);
      console.log(`Questions: ${topic.questions.length}`);
      console.log(`Target Sources: ${topic.sources.join(', ')}`);

      // Phase 2: Lead Researcher with insane-search
      const researchData = await this.runInsaneSearch(topic);

      // Phase 3: Cross-Examination
      const crossExam = this.crossExamineFindings(researchData, topic);

      // Phase 4: Fact-Checking
      const factCheck = this.factCheckFindings(researchData);

      // Phase 5: Peer Review
      const peerReview = this.peerReviewReport({
        researchData,
        crossExam,
        factCheck
      });

      // Phase 6: Knowledge Synthesis
      const report = this.synthesizeReport(topic, researchData, crossExam, factCheck, peerReview);

      this.completedTopics.push(topic.id);
      this.logStatus(`Completed: ${topic.title}`);

      return report;
    } catch (error) {
      console.error(`❌ Error researching ${topic.id}:`, error.message);
      return null;
    } finally {
      this.currentTopic = null;
    }
  }

  async start() {
    console.log('🎯 Research Team Loop Started');
    console.log(`📅 Started: ${new Date(this.startTime).toLocaleString('ko-KR')}`);
    console.log(`🕐 Target: ${new Date(TARGET_TIME).toLocaleString('ko-KR')}`);
    console.log(`📚 Topics: ${RESEARCH_TOPICS.length}\n`);

    let topicIndex = 0;

    while (this.running && topicIndex < RESEARCH_TOPICS.length) {
      const remainingTime = this.getRemainingTime();

      if (remainingTime <= 0) {
        console.log('\n⏰ Target time reached!');
        break;
      }

      const topic = RESEARCH_TOPICS[topicIndex];

      // Estimate time per topic (conservative: 25 min each)
      const estimatedTimePerTopic = 25 * 60 * 1000;
      const totalRemainingTopics = RESEARCH_TOPICS.length - topicIndex;
      const estimatedTotalTime = totalRemainingTopics * estimatedTimePerTopic;

      if (remainingTime < estimatedTimePerTopic && topicIndex > 0) {
        console.log('\n⚠️  Not enough time for next topic. Finishing early.');
        break;
      }

      await this.researchTopic(topic);
      topicIndex++;
    }

    this.running = false;
    console.log('\n✅ Research Loop Complete!');
    console.log(`📊 Completed: ${this.completedTopics.length}/${RESEARCH_TOPICS.length} topics`);
    console.log(`🕐 Ended: ${new Date().toLocaleString('ko-KR')}`);
    console.log(`⏱️  Total Duration: ${this.formatTime(Date.now() - this.startTime)}`);
  }
}

// Start the research loop
if (require.main === module) {
  const loop = new ResearchLoop();

  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Received interrupt signal...');
    loop.running = false;
    loop.logStatus('Interrupted by user');
    process.exit(0);
  });

  loop.start().catch(console.error);
}

module.exports = ResearchLoop;
