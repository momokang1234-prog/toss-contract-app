<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

<!DOCTYPE html>

<html lang="ko">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Neuro-Learning Light Components</title>

    

    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />



    <style>

        :root {

            /* 1. Original Color Variables (Light Theme) */

            --bg-canvas: #F8F9FA; 

            --bg-paper: #FFFFFF; 

            --bg-sidebar: #F1F3F5;

            --text-primary: #191F28; 

            --text-secondary: #4E5968;

            --accent-focus: #005666; 

            --accent-highlight: #008C99; 

            --border-soft: #D1D6DB; 

            --shadow-calm: 0 2px 12px rgba(0, 0, 0, 0.08);

            

            --font-base: 'Pretendard Variable', Pretendard, sans-serif;

            

            /* Semantic Colors for Dos/Donts etc */

            --color-success-bg: #E6FCF5;

            --color-success-text: #099268;

            --color-danger-bg: #FFF5F5;

            --color-danger-text: #C92A2A;

            --color-warning-bg: #FFF9DB;

            --color-warning-text: #E67700;

        }



        body { 

            margin: 0; 

            font-family: var(--font-base); 

            background: var(--bg-canvas); 

            color: var(--text-primary); 

            line-height: 1.7; 

            word-break: keep-all; 

            letter-spacing: -0.01em;

        }



        .container {

            max-width: 800px;

            margin: 0 auto;

            padding: 60px 24px;

        }



        h2 {

            font-size: 1.2rem;

            color: var(--accent-focus);

            margin: 60px 0 20px 0;

            text-transform: uppercase;

            letter-spacing: 0.05em;

            font-weight: 800;

            border-left: 4px solid var(--accent-highlight);

            padding-left: 12px;

        }

        

        p { margin-bottom: 24px; color: var(--text-primary); }



        /* --- Existing Components Styles (Preserved) --- */

        /* Note: Included essential styles for previous components to maintain layout */

        .pyramid-container { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 40px 0; }

        .pyramid-level { width: 100%; text-align: center; color: white; font-weight: 700; padding: 12px 0; font-size: 0.9rem; border-radius: 4px; position: relative; box-shadow: var(--shadow-calm); }

        .pyramid-level:nth-child(1) { width: 30%; background: var(--accent-focus); z-index: 3; }

        .pyramid-level:nth-child(2) { width: 60%; background: var(--accent-highlight); z-index: 2; opacity: 0.9; }

        .pyramid-level:nth-child(3) { width: 90%; background: #A3CFD3; color: var(--text-primary); z-index: 1; }



        .bar-chart-wrapper { margin: 30px 0; background: var(--bg-paper); padding: 24px; border-radius: 12px; border: 1px solid var(--border-soft); }

        .chart-row { display: flex; align-items: center; margin-bottom: 16px; }

        .chart-row:last-child { margin-bottom: 0; }

        .chart-label { width: 100px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-align: right; margin-right: 16px; }

        .chart-bar-bg { flex: 1; background: var(--bg-sidebar); height: 16px; border-radius: 100px; overflow: hidden; }

        .chart-bar-fill { height: 100%; background: var(--accent-highlight); border-radius: 100px; }

        .chart-value { width: 40px; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-left: 12px; }



        .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 30px 0; }

        .swot-box { background: var(--bg-paper); border: 1px solid var(--border-soft); border-radius: 8px; padding: 20px; }

        .swot-header { font-weight: 800; font-size: 1rem; margin-bottom: 12px; text-transform: uppercase; color: var(--accent-focus); border-bottom: 2px solid var(--border-soft); padding-bottom: 8px; }

        .swot-content { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }



        .persona-card { display: flex; background: var(--bg-paper); border: 1px solid var(--border-soft); border-radius: 12px; overflow: hidden; margin: 30px 0; box-shadow: var(--shadow-calm); }

        .persona-visual { width: 120px; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; border-right: 1px solid var(--border-soft); text-align: center; }

        .persona-avatar { width: 64px; height: 64px; border-radius: 50%; background: #D1D6DB; margin-bottom: 12px; }

        .persona-role { font-size: 0.75rem; font-weight: 700; color: var(--accent-focus); text-transform: uppercase; }

        .persona-info { padding: 24px; flex: 1; }

        .persona-name { font-size: 1.1rem; font-weight: 800; margin-bottom: 8px; color: var(--text-primary); }

        .persona-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px; font-style: italic; }

        .persona-tags { display: flex; gap: 8px; }

        .p-tag { font-size: 0.75rem; background: var(--bg-sidebar); padding: 4px 10px; border-radius: 4px; color: var(--text-secondary); font-weight: 600; }



        .tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin: 30px 0; }

        .tool-item { background: var(--bg-paper); border: 1px solid var(--border-soft); border-radius: 8px; padding: 20px; text-align: center; transition: transform 0.2s; }

        .tool-item:hover { border-color: var(--accent-highlight); transform: translateY(-3px); }

        .tool-icon { width: 40px; height: 40px; background: var(--bg-sidebar); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

        .tool-name { font-weight: 700; font-size: 0.95rem; display: block; margin-bottom: 4px; color: var(--text-primary); }

        .tool-cat { font-size: 0.75rem; color: var(--text-secondary); }



        .curriculum-list { border: 1px solid var(--border-soft); border-radius: 8px; overflow: hidden; margin: 30px 0; }

        .curr-item { display: flex; justify-content: space-between; padding: 16px 24px; background: var(--bg-paper); border-bottom: 1px solid var(--border-soft); align-items: center; }

        .curr-item:nth-child(even) { background: #FAFAFA; }

        .curr-item:last-child { border-bottom: none; }

        .curr-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }

        .curr-time { font-size: 0.85rem; color: var(--text-secondary); font-family: monospace; background: var(--bg-sidebar); padding: 2px 8px; border-radius: 4px; }



        .score-box { background: var(--accent-focus); color: white; padding: 40px; border-radius: 12px; text-align: center; margin: 30px 0; position: relative; overflow: hidden; }

        .score-val { font-size: 4rem; font-weight: 900; line-height: 1; margin-bottom: 8px; display: block; }

        .score-label { font-size: 1rem; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.1em; }

        .score-sub { font-size: 0.85rem; margin-top: 16px; opacity: 0.7; }



        .concept-map { display: flex; justify-content: center; align-items: center; height: 300px; position: relative; margin: 40px 0; background: var(--bg-sidebar); border-radius: 12px; overflow: hidden; }

        .center-node { width: 100px; height: 100px; background: var(--accent-focus); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; z-index: 2; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; padding: 10px; }

        .orbit-node { position: absolute; background: var(--bg-paper); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); border: 1px solid var(--border-soft); box-shadow: var(--shadow-calm); }

        .orbit-node:nth-child(2) { top: 40px; left: 20%; }

        .orbit-node:nth-child(3) { bottom: 60px; right: 20%; }

        .orbit-node:nth-child(4) { top: 60px; right: 15%; }

        .orbit-node:nth-child(5) { bottom: 40px; left: 15%; }

        

        .breadcrumb { display: flex; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 30px; }

        .breadcrumb span:last-child { color: var(--accent-focus); font-weight: 700; }

        .sep { color: var(--border-soft); }





        /* --- NEW Components (50-60: Advanced Visualization & Management) --- */



        /* 50. Verdict Box (Revamped) */

        .verdict-box { border: 2px solid var(--text-primary); padding: 24px; border-radius: 8px; margin: 30px 0; background: var(--bg-paper); position: relative; }

        .verdict-badge { position: absolute; top: -12px; right: 24px; background: var(--accent-highlight); color: white; padding: 4px 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-radius: 4px; }

        .verdict-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--bg-sidebar); padding-bottom: 12px; }

        .verdict-title { font-weight: 800; font-size: 1.1rem; color: var(--text-primary); }

        .verdict-stars { color: #FAB005; font-size: 1.2rem; letter-spacing: 2px; }

        .verdict-text { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; }



        /* 51. Radar Chart (CSS Polygon) */

        .radar-wrapper { position: relative; width: 280px; height: 280px; margin: 30px auto; background: var(--bg-sidebar); border-radius: 50%; }

        .radar-grid { position: absolute; inset: 0; background: repeating-radial-gradient(transparent 0, transparent 39px, var(--border-soft) 40px); border-radius: 50%; opacity: 0.5; }

        .radar-axes { position: absolute; inset: 0; background: linear-gradient(0deg, transparent 49%, var(--border-soft) 50%, transparent 51%), linear-gradient(90deg, transparent 49%, var(--border-soft) 50%, transparent 51%); }

        .radar-shape { position: absolute; inset: 20px; background: rgba(0, 140, 153, 0.4); border: 2px solid var(--accent-highlight); clip-path: polygon(50% 0%, 90% 30%, 80% 90%, 20% 80%, 10% 30%); transition: all 0.5s ease; }

        .radar-label { position: absolute; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); background: var(--bg-paper); padding: 2px 6px; border-radius: 4px; }

        

        /* 52. Kanban Column */

        .kanban-board { display: flex; gap: 16px; margin: 30px 0; overflow-x: auto; padding-bottom: 10px; }

        .kanban-col { flex: 1; min-width: 200px; background: var(--bg-sidebar); border-radius: 8px; padding: 16px; }

        .kanban-title { font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; display: flex; justify-content: space-between; }

        .kanban-count { background: #E9ECEF; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; }

        .kanban-card { background: var(--bg-paper); padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 8px; border: 1px solid transparent; }

        .kanban-card:hover { border-color: var(--accent-highlight); }

        .k-tag { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px; font-weight: 700; }

        .tag-blue { background: #E3FAFC; color: #0C8599; }

        .tag-orange { background: #FFF4E6; color: #E8590C; }



        /* 53. Priority Matrix (Eisenhower) */

        .matrix-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px; background: var(--border-soft); border: 1px solid var(--border-soft); border-radius: 8px; overflow: hidden; margin: 30px 0; height: 300px; }

        .matrix-quad { background: var(--bg-paper); padding: 16px; position: relative; display: flex; flex-direction: column; }

        .quad-label { font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; }

        .matrix-quad:nth-child(1) .quad-label { color: var(--color-success-text); } /* Do First */

        .matrix-quad:nth-child(2) .quad-label { color: var(--accent-focus); } /* Schedule */

        .matrix-quad:nth-child(3) .quad-label { color: var(--color-warning-text); } /* Delegate */

        .matrix-quad:nth-child(4) .quad-label { color: var(--text-secondary); } /* Delete */

        .matrix-content { font-size: 0.85rem; color: var(--text-primary); flex: 1; }



        /* 54. Funnel Chart */

        .funnel-wrapper { display: flex; flex-direction: column; align-items: center; margin: 30px 0; gap: 2px; }

        .funnel-step { text-align: center; color: white; font-weight: 700; padding: 10px 0; font-size: 0.85rem; position: relative; }

        .funnel-step:nth-child(1) { width: 100%; background: #005666; border-radius: 4px 4px 0 0; }

        .funnel-step:nth-child(2) { width: 80%; background: #007380; }

        .funnel-step:nth-child(3) { width: 60%; background: #008C99; }

        .funnel-step:nth-child(4) { width: 40%; background: #22B8CF; border-radius: 0 0 4px 4px; }

        .funnel-val { position: absolute; right: 10px; font-size: 0.75rem; opacity: 0.9; top: 12px; }



        /* 55. Sticky Note Board */

        .sticky-board { background: #F8F0E3; padding: 24px; border-radius: 4px; margin: 30px 0; display: flex; flex-wrap: wrap; gap: 16px; border: 1px solid #E6DCC8; }

        .sticky-note { width: 120px; height: 120px; background: #FFF9DB; padding: 12px; font-family: 'Courier New', monospace; font-size: 0.8rem; line-height: 1.4; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); transform: rotate(-2deg); color: #495057; display: flex; align-items: center; justify-content: center; text-align: center; }

        .sticky-note:nth-child(even) { transform: rotate(1deg); background: #E6FCF5; }

        .sticky-note:nth-child(3n) { transform: rotate(2deg); background: #FFF5F5; }



        /* 56. Donut Chart (CSS) */

        .donut-wrapper { display: flex; align-items: center; justify-content: space-around; background: var(--bg-paper); padding: 24px; border-radius: 12px; border: 1px solid var(--border-soft); margin: 30px 0; }

        .donut-chart { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(var(--accent-focus) 0% 65%, var(--bg-sidebar) 65% 100%); position: relative; display: flex; align-items: center; justify-content: center; }

        .donut-hole { width: 80px; height: 80px; background: var(--bg-paper); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: var(--accent-focus); }

        .donut-legend { display: flex; flex-direction: column; gap: 8px; }

        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); }

        .legend-color { width: 12px; height: 12px; border-radius: 2px; }



        /* 57. Comparison Split (Slider Style) */

        .split-container { display: flex; height: 200px; border-radius: 12px; overflow: hidden; margin: 30px 0; border: 1px solid var(--border-soft); position: relative; }

        .split-side { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; position: relative; }

        .split-side.before { background: #E9ECEF; color: var(--text-secondary); }

        .split-side.after { background: var(--accent-highlight); color: white; }

        .split-label { font-weight: 800; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 8px; letter-spacing: 0.05em; }

        .split-desc { font-size: 1rem; font-weight: 600; text-align: center; padding: 0 20px; }

        .split-divider { position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; background: white; transform: translateX(-50%); z-index: 2; display: flex; align-items: center; justify-content: center; cursor: ew-resize; }

        .split-knob { width: 24px; height: 24px; background: white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.7rem; }



        /* 58. Chat Interface */

        .chat-container { background: var(--bg-sidebar); border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid var(--border-soft); }

        .chat-msg { margin-bottom: 12px; max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; position: relative; }

        .chat-msg:last-child { margin-bottom: 0; }

        .msg-left { background: white; align-self: flex-start; border-bottom-left-radius: 2px; color: var(--text-primary); border: 1px solid var(--border-soft); margin-right: auto; }

        .msg-right { background: var(--accent-focus); align-self: flex-end; border-bottom-right-radius: 2px; color: white; margin-left: auto; }



        /* 59. Roadmap Steps */

        .roadmap-wrapper { margin: 40px 0; display: flex; flex-direction: column; gap: 0; }

        .roadmap-step { display: flex; gap: 20px; position: relative; padding-bottom: 30px; }

        .roadmap-step:last-child { padding-bottom: 0; }

        .roadmap-line { position: absolute; left: 14px; top: 28px; bottom: 0; width: 2px; background: var(--border-soft); }

        .roadmap-step:last-child .roadmap-line { display: none; }

        .roadmap-marker { width: 30px; height: 30px; border-radius: 50%; background: var(--bg-paper); border: 2px solid var(--accent-highlight); z-index: 1; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; color: var(--accent-highlight); flex-shrink: 0; }

        .roadmap-step.completed .roadmap-marker { background: var(--accent-highlight); color: white; }

        .roadmap-content h5 { margin: 0 0 4px 0; font-size: 1rem; color: var(--text-primary); }

        .roadmap-content p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }



        /* 60. Certificate Card */

        .certificate-box { border: 4px double var(--accent-focus); padding: 30px; text-align: center; background: #FFF; margin: 40px 0; position: relative; }

        .cert-title { font-family: 'Times New Roman', serif; font-size: 1.8rem; color: var(--accent-focus); margin-bottom: 10px; font-weight: 700; letter-spacing: 0.05em; }

        .cert-subtitle { text-transform: uppercase; font-size: 0.8rem; color: var(--text-secondary); letter-spacing: 0.2em; margin-bottom: 30px; display: block; }

        .cert-name { font-size: 1.4rem; font-weight: 600; border-bottom: 1px solid var(--text-primary); display: inline-block; padding: 0 20px 10px 20px; margin-bottom: 30px; color: var(--text-primary); }

        .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; font-size: 0.8rem; color: var(--text-secondary); }

        .cert-seal { width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--accent-highlight); color: var(--accent-highlight); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; transform: rotate(-15deg); }



        @media (max-width: 600px) {

            .swot-grid { grid-template-columns: 1fr; }

            .persona-card { flex-direction: column; }

            .persona-visual { width: 100%; border-right: none; border-bottom: 1px solid var(--border-soft); flex-direction: row; gap: 16px; justify-content: flex-start; }

            .matrix-grid { grid-template-columns: 1fr; grid-template-rows: repeat(4, 1fr); height: auto; }

            .donut-wrapper { flex-direction: column; gap: 20px; }

        }

    </style>

</head>

<body>



    <div class="container">

        <!-- Breadcrumb -->

        <nav class="breadcrumb">

            <span>Home</span> <span class="sep">/</span>

            <span>Course</span> <span class="sep">/</span>

            <span>Neuro-Learning</span> <span class="sep">/</span>

            <span>Visual Tools</span>

        </nav>



        <header>

            <h1 style="font-size: 2.2rem; margin-bottom: 16px; color: var(--text-primary); font-weight: 800;">Visual Components</h1>

            <p style="font-size: 1.1rem; color: var(--text-secondary);">데이터 시각화 및 구조화를 위한 고급 컴포넌트 모음입니다 (42-60).</p>

        </header>



        <!-- 42. Pyramid Hierarchy -->

        <section>

            <h2>42. Hierarchy of Focus</h2>

            <div class="pyramid-container">

                <div class="pyramid-level">Deep Work (상위 10% 가치)</div>

                <div class="pyramid-level">Skill Building (학습/훈련)</div>

                <div class="pyramid-level">Shallow Work (행정/유지보수)</div>

            </div>

        </section>



        <!-- 43. Simple Bar Chart -->

        <section>

            <h2>43. Focus Duration Data</h2>

            <div class="bar-chart-wrapper">

                <div class="chart-row">

                    <div class="chart-label">Novice</div>

                    <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: 25%;"></div></div>

                    <div class="chart-value">1h</div>

                </div>

                <div class="chart-row">

                    <div class="chart-label">Intermediate</div>

                    <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: 50%;"></div></div>

                    <div class="chart-value">2h</div>

                </div>

                <div class="chart-row">

                    <div class="chart-label">Expert</div>

                    <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: 100%;"></div></div>

                    <div class="chart-value">4h</div>

                </div>

            </div>

        </section>



        <!-- 44. SWOT Grid -->

        <section>

            <h2>44. Strategic Analysis (SWOT)</h2>

            <div class="swot-grid">

                <div class="swot-box">

                    <div class="swot-header">Strengths</div>

                    <div class="swot-content">높은 문제 해결 능력, 창의적 결과물 도출, 전문가적 희소성 확보</div>

                </div>

                <div class="swot-box">

                    <div class="swot-header">Weaknesses</div>

                    <div class="swot-content">즉각적인 응답 부재, 초기 진입 장벽(지루함), 환경 조성의 어려움</div>

                </div>

                <div class="swot-box">

                    <div class="swot-header">Opportunities</div>

                    <div class="swot-content">AI가 대체 불가능한 영역 선점, 고연봉 전문직으로의 전환</div>

                </div>

                <div class="swot-box">

                    <div class="swot-header">Threats</div>

                    <div class="swot-content">상시 연결성을 요구하는 조직 문화, 디지털 중독 심화</div>

                </div>

            </div>

        </section>



        <!-- 45. Persona Profile Card -->

        <section>

            <h2>45. Target Persona</h2>

            <div class="persona-card">

                <div class="persona-visual">

                    <div class="persona-avatar"></div>

                    <span class="persona-role">Knowledge Worker</span>

                </div>

                <div class="persona-info">

                    <div class="persona-name">Alex, 32세</div>

                    <div class="persona-desc">"하루 종일 바쁘게 일했지만, 퇴근길에는 정작 무엇을 이뤘는지 모르겠어요. 진짜 중요한 일을 하고 싶습니다."</div>

                    <div class="persona-tags">

                        <span class="p-tag">#개발자</span>

                        <span class="p-tag">#성장욕구</span>

                        <span class="p-tag">#번아웃</span>

                    </div>

                </div>

            </div>

        </section>



        <!-- 46. Tool/App Grid -->

        <section>

            <h2>46. Recommended Tools</h2>

            <div class="tool-grid">

                <div class="tool-item">

                    <div class="tool-icon">🍅</div>

                    <span class="tool-name">Pomodoro</span>

                    <span class="tool-cat">Timer</span>

                </div>

                <div class="tool-item">

                    <div class="tool-icon">📓</div>

                    <span class="tool-name">Notion</span>

                    <span class="tool-cat">Organizer</span>

                </div>

                <div class="tool-item">

                    <div class="tool-icon">🌲</div>

                    <span class="tool-name">Forest</span>

                    <span class="tool-cat">Gamification</span>

                </div>

                <div class="tool-item">

                    <div class="tool-icon">🎧</div>

                    <span class="tool-name">Brain.fm</span>

                    <span class="tool-cat">Music</span>

                </div>

            </div>

        </section>



        <!-- 47. Curriculum List -->

        <section>

            <h2>47. Course Curriculum</h2>

            <div class="curriculum-list">

                <div class="curr-item">

                    <span class="curr-title">01. 딥워크의 신경학적 기초</span>

                    <span class="curr-time">15:00</span>

                </div>

                <div class="curr-item">

                    <span class="curr-title">02. 몰입을 방해하는 3가지 적</span>

                    <span class="curr-time">12:40</span>

                </div>

                <div class="curr-item">

                    <span class="curr-title">03. 4가지 딥워크 철학 선택하기</span>

                    <span class="curr-time">20:15</span>

                </div>

                <div class="curr-item">

                    <span class="curr-title">04. 실전: 90분 집중 세션 가이드</span>

                    <span class="curr-time">10:00</span>

                </div>

            </div>

        </section>



        <!-- 48. Impact Score Box -->

        <section>

            <h2>48. Effectiveness Score</h2>

            <div class="score-box">

                <span class="score-val">94.5</span>

                <span class="score-label">Cognitive Efficiency</span>

                <div class="score-sub">Based on 4-hour Deep Work Session</div>

            </div>

        </section>



        <!-- 49. Concept Map -->

        <section>

            <h2>49. Core Ecosystem</h2>

            <div class="concept-map">

                <div class="center-node">DEEP<br>WORK</div>

                <div class="orbit-node" style="top:40px; left:20%">Environment</div>

                <div class="orbit-node" style="bottom:60px; right:20%">Rituals</div>

                <div class="orbit-node" style="top:60px; right:15%">Willpower</div>

                <div class="orbit-node" style="bottom:40px; left:15%">Metrics</div>

            </div>

        </section>



        <!-- 50. Final Verdict (Updated) -->

        <section>

            <h2>50. Final Verdict</h2>

            <div class="verdict-box">

                <div class="verdict-badge">RECOMMENDED</div>

                <div class="verdict-header">

                    <span class="verdict-title">Review Summary</span>

                    <span class="verdict-stars">★★★★★</span>

                </div>

                <div class="verdict-text">

                    단순한 시간 관리가 아니라 삶의 질을 근본적으로 변화시키는 철학입니다. 

                    초기에는 인지적 고통이 따르지만, 이를 극복했을 때 얻는 성취감과 결과물의 질은 타의 추종을 불허합니다.

                </div>

            </div>

        </section>



        <!-- 51. Radar Chart (New) -->

        <section>

            <h2>51. Skill Balance Radar</h2>

            <div class="radar-wrapper">

                <div class="radar-grid"></div>

                <div class="radar-axes"></div>

                <!-- Inline clip-path for dynamic shape example -->

                <div class="radar-shape"></div>

                <div class="radar-label" style="top: 10px; left: 50%; transform: translateX(-50%);">Focus</div>

                <div class="radar-label" style="right: 10px; top: 40%;">Energy</div>

                <div class="radar-label" style="right: 20px; bottom: 20%;">Habit</div>

                <div class="radar-label" style="left: 20px; bottom: 20%;">Env</div>

                <div class="radar-label" style="left: 10px; top: 40%;">Will</div>

            </div>

        </section>



        <!-- 52. Kanban Board (New) -->

        <section>

            <h2>52. Task Management (Kanban)</h2>

            <div class="kanban-board">

                <div class="kanban-col">

                    <div class="kanban-title">To Do <span class="kanban-count">3</span></div>

                    <div class="kanban-card">

                        <span class="k-tag tag-blue">Deep</span>

                        <div>챕터 1 집필하기</div>

                    </div>

                    <div class="kanban-card">

                        <span class="k-tag tag-orange">Shallow</span>

                        <div>이메일 답장 정리</div>

                    </div>

                    <div class="kanban-card">

                        <div>참고 자료 조사</div>

                    </div>

                </div>

                <div class="kanban-col">

                    <div class="kanban-title">Doing <span class="kanban-count">1</span></div>

                    <div class="kanban-card">

                        <span class="k-tag tag-blue">Deep</span>

                        <div>구조 설계도 초안</div>

                    </div>

                </div>

                <div class="kanban-col">

                    <div class="kanban-title">Done <span class="kanban-count">2</span></div>

                    <div class="kanban-card">

                        <div>주제 선정 완료</div>

                    </div>

                    <div class="kanban-card">

                        <div>팀 미팅</div>

                    </div>

                </div>

            </div>

        </section>



        <!-- 53. Priority Matrix (Eisenhower) (New) -->

        <section>

            <h2>53. Priority Matrix</h2>

            <div class="matrix-grid">

                <div class="matrix-quad">

                    <span class="quad-label">Do First (중요/긴급)</span>

                    <div class="matrix-content">

                        • 마감일 임박 프로젝트<br>

                        • 서버 장애 대응

                    </div>

                </div>

                <div class="matrix-quad">

                    <span class="quad-label">Schedule (중요/안긴급)</span>

                    <div class="matrix-content">

                        • <strong>Deep Work 세션</strong><br>

                        • 장기 전략 수립<br>

                        • 운동 및 건강 관리

                    </div>

                </div>

                <div class="matrix-quad">

                    <span class="quad-label">Delegate (안중요/긴급)</span>

                    <div class="matrix-content">

                        • 단순 반복 이메일<br>

                        • 목적 불명확한 회의

                    </div>

                </div>

                <div class="matrix-quad">

                    <span class="quad-label">Delete (안중요/안긴급)</span>

                    <div class="matrix-content">

                        • 무의미한 웹 서핑<br>

                        • 가십성 뉴스 확인

                    </div>

                </div>

            </div>

        </section>



        <!-- 54. Funnel Chart (New) -->

        <section>

            <h2>54. Attention Funnel</h2>

            <div class="funnel-wrapper">

                <div class="funnel-step">

                    Available Time (24h)

                    <span class="funnel-val">100%</span>

                </div>

                <div class="funnel-step">

                    Awake Time (16h)

                    <span class="funnel-val">66%</span>

                </div>

                <div class="funnel-step">

                    Work Hours (8h)

                    <span class="funnel-val">33%</span>

                </div>

                <div class="funnel-step">

                    Deep Focus (4h)

                    <span class="funnel-val">16%</span>

                </div>

            </div>

            <p style="text-align: center; font-size: 0.9rem; color: var(--text-secondary);">실질적인 가치 창출은 마지막 16%에서 발생합니다.</p>

        </section>



        <!-- 55. Sticky Note Board (New) -->

        <section>

            <h2>55. Idea Brainstorming</h2>

            <div class="sticky-board">

                <div class="sticky-note">

                    인터넷 차단 앱<br>설치하기

                </div>

                <div class="sticky-note">

                    오전 9-11시<br>집중 시간<br>확보

                </div>

                <div class="sticky-note">

                    커피 대신<br>물 마시기

                </div>

                <div class="sticky-note">

                    주말엔<br>디지털 디톡스

                </div>

            </div>

        </section>



        <!-- 56. Donut Chart (New) -->

        <section>

            <h2>56. Daily Time Allocation</h2>

            <div class="donut-wrapper">

                <div class="donut-chart">

                    <div class="donut-hole">65%</div>

                </div>

                <div class="donut-legend">

                    <div class="legend-item">

                        <div class="legend-color" style="background: var(--accent-focus);"></div>

                        <span>Deep Work (핵심 업무)</span>

                    </div>

                    <div class="legend-item">

                        <div class="legend-color" style="background: var(--bg-sidebar);"></div>

                        <span>Shallow Work (행정/회의)</span>

                    </div>

                </div>

            </div>

        </section>



        <!-- 57. Comparison Split (New) -->

        <section>

            <h2>57. Mindset Shift</h2>

            <div class="split-container">

                <div class="split-side before">

                    <span class="split-label">Before</span>

                    <div class="split-desc">Busyness as Proxy for Productivity</div>

                </div>

                <div class="split-divider">

                    <div class="split-knob">⇄</div>

                </div>

                <div class="split-side after">

                    <span class="split-label">After</span>

                    <div class="split-desc">Focus as the New I.Q.</div>

                </div>

            </div>

        </section>



        <!-- 58. Chat Interface (New) -->

        <section>

            <h2>58. Team Communication Rule</h2>

            <div class="chat-container">

                <div class="chat-msg msg-left">

                    팀장님, 프로젝트 A 관련해서 지금 잠깐 회의 가능할까요? (10:05 AM)

                </div>

                <div class="chat-msg msg-right">

                    현재 오전 <strong>딥워크 집중 시간</strong>(09:00~11:30)입니다. 급한 용건은 메일로 남겨주시면 11시 30분에 확인하겠습니다. (Auto-reply)

                </div>

            </div>

        </section>



        <!-- 59. Roadmap Steps (New) -->

        <section>

            <h2>59. 4-Week Integration Plan</h2>

            <div class="roadmap-wrapper">

                <div class="roadmap-step completed">

                    <div class="roadmap-line"></div>

                    <div class="roadmap-marker">✓</div>

                    <div class="roadmap-content">

                        <h5>Week 1: 진단 및 차단</h5>

                        <p>자신의 집중력 수준을 측정하고, 방해 요소를 물리적으로 차단하는 환경을 구축합니다.</p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <div class="roadmap-line"></div>

                    <div class="roadmap-marker">2</div>

                    <div class="roadmap-content">

                        <h5>Week 2: 의식 형성 (Ritual)</h5>

                        <p>몰입 모드로 진입하기 위한 자신만의 루틴을 개발하고 훈련합니다.</p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <div class="roadmap-line"></div>

                    <div class="roadmap-marker">3</div>

                    <div class="roadmap-content">

                        <h5>Week 3: 강도 높이기</h5>

                        <p>집중 시간을 점진적으로 늘리고(최대 4시간), 인지 부하가 높은 작업을 수행합니다.</p>

                    </div>

                </div>

            </div>

        </section>



        <!-- 60. Certificate Card (New) -->

        <section>

            <h2>60. Completion</h2>

            <div class="certificate-box">

                <span class="cert-subtitle">Certificate of Mastery</span>

                <div class="cert-title">DEEP WORK PRACTITIONER</div>

                <div class="cert-name">Participant Name</div>

                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;">

                    위 사람은 산만함이 지배하는 세상에서 고도의 집중력을 발휘하여<br>탁월한 성과를 창출할 준비가 되었음을 증명합니다.

                </p>

                <div class="cert-footer">

                    <span>Date: 2024. 10. 24</span>

                    <div class="cert-seal">FOCUS<br>CERTIFIED</div>

                </div>

            </div>

        </section>



        <!-- Document Footer -->

        <footer class="doc-footer">

            <span class="footer-logo">NEURO-LEARNING SYSTEM</span>

            <p>Designed for Cognitive Enhancement & Deep Focus</p>

            <div class="footer-links">

                <span>© 2024 All Rights Reserved</span> • 

                <span>Terms</span> • 

                <span>Privacy</span>

            </div>

        </footer>



        <!-- Additional Spacing -->

        <div style="height: 50px;"></div>

    </div>



</body>

</html>

<style>

  :root {

    /* 색상 변수 (고해상도 가독성 테마) */

    --bg-canvas: #F8F9FA; 

    --bg-paper: #FFFFFF; 

    --bg-sidebar: #F1F3F5;

    --text-primary: #191F28; 

    --text-secondary: #4E5968;

    --accent-focus: #005666; 

    --accent-highlight: #008C99; 

    --border-soft: #D1D6DB; 

    --shadow-calm: 0 2px 12px rgba(0, 0, 0, 0.08);

    

    --font-base: 'Pretendard Variable', Pretendard, sans-serif;

    --font-serif: 'Noto Serif KR', serif;

  }



  /* 1. Global Typography */

  body { 

    margin: 0; 

    font-family: var(--font-base); 

    background: var(--bg-canvas); 

    color: var(--text-primary); 

    

    /* [핵심 수정] 좌측 정렬 강제 적용 */

    text-align: left; 

    

    /* 가독성 설정 */

    line-height: 1.75;  

    word-break: keep-all; /* 단어 중간 끊김 방지 (좌측 정렬과 찰떡궁합) */

    letter-spacing: -0.025em; 

    

    /* 렌더링 최적화 */

    -webkit-font-smoothing: antialiased; 

    text-rendering: optimizeLegibility;

  }



  /* Layout */

  .sidebar { width: 280px; background: var(--bg-sidebar); padding: 40px 24px; border-right: 1px solid var(--border-soft); display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }

  .toc-list a { display: block; padding: 12px 16px; margin: 6px 0; color: var(--text-secondary); text-decoration: none; border-radius: 6px; font-size: 0.95rem; font-weight: 500; transition: all 0.2s; }

  .toc-list a:hover, .toc-list a.active { background: var(--accent-focus); color: #fff; font-weight: 700; }

  

  .main-content { flex: 1; overflow-y: auto; padding: 60px 10%; scroll-behavior: smooth; }

  .content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 120px; }



  /* Headings */

  h1, h2, h3 { font-family: var(--font-base); font-weight: 800; color: var(--text-primary); margin-top: 60px; letter-spacing: -0.03em; line-height: 1.3; text-align: left; }

  h1 { font-size: 2.6rem; border-bottom: 4px solid var(--accent-highlight); padding-bottom: 24px; margin-bottom: 40px; }

  h2 { font-size: 1.9rem; border-bottom: 2px solid var(--border-soft); padding-bottom: 16px; display: flex; align-items: center; gap: 12px; }

  

  /* [핵심 수정] 문단 정렬 방식 변경 (Justify -> Left) */

  p { 

    margin-bottom: 1.6rem; 

    font-size: 1.08rem; 

    color: var(--text-primary); 

    

    text-align: left; /* 양쪽 정렬 해제 -> 어색한 공백 사라짐 */

    

    font-weight: 400; 

  }

  

  /* Components */

  .learning-card { background: var(--bg-paper); padding: 36px; border-radius: 12px; box-shadow: var(--shadow-calm); margin-bottom: 40px; border: 1px solid var(--border-soft); border-left: 6px solid var(--accent-focus); text-align: left; }

  

  .comparison-container { display: grid; grid-template-columns: 1fr 1fr; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-soft); margin: 30px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

  .compare-col { padding: 32px; background: var(--bg-paper); text-align: left; }

  .compare-col.highlight { background: #EAF6F6; }

  .compare-header { text-align: center; font-weight: 800; color: var(--accent-focus); margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--border-soft); font-size: 1.15rem; }

  

  .compare-col li { padding: 12px 0; border-bottom: 1px solid var(--border-soft); font-size: 0.98rem; display: flex; flex-direction: column; gap: 4px; text-align: left; }

  

  .insight-box { background: #F2F9F9; padding: 28px; border-radius: 12px; margin: 30px 0; border: 1px solid #C4E0E0; text-align: left; }

  .insight-box h5 { margin: 0 0 10px 0; color: var(--accent-focus); font-size: 1.1rem; font-weight: 700; }



  .decision-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 30px 0; }

  .decision-option { background: var(--bg-paper); padding: 28px; border-radius: 12px; border: 1px solid var(--border-soft); text-align: center; } /* 옵션 박스는 가운데 정렬 유지(디자인적 요소) */

  .decision-option.recommended { border: 2px solid var(--accent-highlight); background: #F4FBFB; position: relative; }



  .timeline { border-left: 3px solid #D1D6DB; padding-left: 30px; margin: 40px 0; }

  .process-container { display: flex; gap: 16px; margin: 30px 0; overflow-x: auto; padding: 5px; }

  .process-step { flex: 1; min-width: 160px; background: var(--bg-paper); padding: 20px; border: 1px solid var(--border-soft); border-radius: 10px; text-align: center; }



  @media (max-width: 768px) {

    .sidebar { display: none; }

    .main-content { padding: 30px 20px; }

    .comparison-container { grid-template-columns: 1fr; }

    h1 { font-size: 2rem; }

  }

</style>





# 핵심 과제

제공된 'Neuro-Learning All-in-One v7.0' HTML/CSS 템플릿을 기반으로, 원본 내용을 19,000자 분량의 깊이 있는 문서로 재구성하십시오. 서술문과 조화를 이루게 만들어주고, 정보의 성격에 맞는 시각화 컴포넌트를 적재적소에 배치해야 합니다.

한 가지 모드를 선택하되 사용자에게 도움이 된다고 판단이 된다면 글에 맞게 다른 모드의 요소를 차용해 적용합니다.

프로세스 및 규칙

1. 초기 분석 및 구조화

주제 파악: 입력된 콘텐츠의 핵심 주제, 타겟 독자, 주요 논거를 분석합니다.

요약본(Intro): 전체 내용을 고등학생도 이해할 수 있는 쉬운 언어로 요약하여 리포트 최상단에 배치합니다.

목차 구성: 전체 내용을 논리적인 챕터로 나누고 사이드바 네비게이션과 연동합니다.

2. 콘텐츠 생성 (Deep Dive)

분량 및 깊이: 본문은 약 19,000자 내외의 서적 형태를 모방한 깊이 있는 서술문이어야 합니다.

타임스탬프: 주요 정보가 등장할 때마다 [출처: 03:15] 형식으로 타임스탬프를 명기합니다.

학술적 태도: 전문적인 어조를 유지하며, 필요시 관련 이론이나 참고 문헌을 추가하여 깊이를 더합니다.

3. 시각화 컴포넌트 매핑 (Visual Mapping Strategy) [중요]

텍스트로만 설명하지 말고, 반드시 아래 기준에 따라 템플릿의 CSS 클래스를 활용해 시각화하십시오.

A vs B 비교/대조: 텍스트 설명 대신 .duality-container 또는 .comparison-container를 사용해 시각적 대비를 줍니다.

의사결정/평가: 장단점 분석이나 추천이 필요한 경우 .decision-matrix를 사용합니다.

시간의 흐름/역사: 연대기적 정보는 반드시 .timeline 컴포넌트로 변환합니다.

단계별 과정: 프로세스나 절차는 .process-container 또는 .funnel-container를 사용합니다.

수치/통계 데이터:

비율(%) 정보 → .css-pie 또는 .css-donut

진행률/성취도 → .progress-group 또는 .gauge-wrapper

비중 분포 → .stacked-bar

빈도/밀도 → .heatmap-grid

핵심 요약/통찰: 챕터의 마무리는 .insight-box를 사용하여 강조합니다.

인용: 중요한 발언은 .neuro-quote를 사용합니다.

4. 출력 형식 (Technical Constraint)

단일 HTML: 외부 링크 없이 CSS, Script가 모두 포함된 하나의 HTML 파일로 출력합니다.

템플릿 준수: 제공된 Neuro-Learning All-in-One v7.0의 <style>과 구조를 그대로 유지한 채 <body> 내의 콘텐츠만 동적으로 생성합니다.

가독성: 문단은 적절히 나누고, 중요한 키워드는 <strong> 또는 .accent-highlight 색상을 활용해 강조합니다.

실행 명령

사용자가 자료(링크/스크립트)를 제공하면 완성된 HTML 코드를 출력하십시오.



--- 3 가지 모드 ---



요청하신 내용을 반영하여 [Neuro-Visual Information Architect] 프롬프트를 재구성했습니다. 전체 내용이 길어 3회로 나누어 출력합니다.

[1/3] 파트에서는 역할 정의와 3가지 핵심 모드(학습/보고서/분석)에 대한 가이드라인을 다룹니다.

역할 및 페르소나

당신은 **[Neuro-Visual Information Architect]**입니다. 사용자가 제공한 YouTube 링크나 스크립트(텍스트)를 분석하여 양질의 글을 생성하는 것이 목표입니다. 심도 있는 서술(Book-depth)과 고도화된 시각화(Dashboard-viz)가 결합된 글을 생성하세요.

글 생성의 방향성과 스타일은 설정된 모드에 따라 나뉩니다. 지정된 프로토콜에 입각해 글을 생성하세요.

모드 리스트

1. 학습모드 (Learning Mode)

완전한 HTML 교육 리포트를 생성하는 것이 목표입니다.

다음 기준을 충족하는 문서를 작성하세요.

① 해상도 높은 단순함 (High-Resolution Simplicity)

기존: "쉽게 써라."

업그레이드: "전문 용어를 제거하고 초등학생도 이해할 수 있는 일상 언어로 번역되었는가? 복잡한 개념이 희석되지 않으면서도 **직관적인 비유(Analogy)**를 통해 선명하게 시각화되었는가?"

② 논리적 방탄유리 (Logical Integrity)

기존: "논리적으로 써라."

업그레이드: "독자가 '왜?'라고 물을 수 있는 모든 지점(이해의 빈틈)을 미리 파악하고 방어했는가? '전제'부터 다시 질문하여 당연해 보이는 것의 근본 원리를 설명하고 있는가?"

③ 점진적 구체화 (Progressive Disclosure)

기존: "자세히 설명해라."

업그레이드: "설명이 한 번에 쏟아지지 않고, 2~3단계에 걸쳐 '개요 → 원리 → 심화' 순으로 층위(Layer)를 쌓아가며 다듬어졌는가? 독자의 인지 부하를 고려해 설명이 반복적으로 개선되었는가?"

④ 실용적 검증 (Applicability Test)

기존: "예시를 들어라."

업그레이드: "추상적인 개념이 **구체적인 상황(Context)**이나 행동으로 치환되었는가? 독자가 글을 읽고 난 뒤 바로 자신의 삶이나 업무에 대입해볼 수 있는가?"

⑤ 압축된 통찰 (Crystalline Essence)

기존: "요약해라."

업그레이드: "전체 내용을 관통하는 **'단 한 문장의 훅(Hook)'**이 존재하는가? 누군가에게 이 내용을 가르칠 때 사용할 수 있는 가장 강력하고 짧은 정의가 포함되었는가?"

2. 보고서 모드 (Report Mode): "시간 없는 의사결정자를 위하여"

이 모드에서 '단순화'는 비유가 아니라 **경제성(Economy)**입니다. 독자의 시간과 인지 자원을 아껴주는 것이 최우선 과제입니다.

① 해상도 높은 단순함 → [요약과 우선순위]

비유보다는 직관적인 수치와 도표를 사용합니다.

"마치 ~와 같습니다" 대신 "작년 대비 20% 상승했습니다"라고 씁니다.

모든 내용을 나열하지 않고, 의사결정에 필요한 Top 3 정보만 남기고 나머지는 별첨 섹션으로 따로 설명합니다.

② 논리적 방탄유리 → [데이터 기반 검증]

논리의 흐름을 명확히 하되, 논리의 재료인 데이터의 출처와 신뢰성이 우선입니다.

'이해의 빈틈'을 메우기 위해 예상되는 반론(Q&A)이나 리스크를 미리 언급하고 대안을 제시합니다.

③ 압축된 통찰 → [실행 중심 결론 (Actionable Conclusion)]

"그래서 어떻게 해야 하는가?"에 대한 베스트 선택지 제안 혹은 결론이 제일 위에 와야 합니다. (> 두괄식 문장)

논리적 추론, 배경지식 통합을 바탕으로 어떤 실행이 사용자에게 가장 좋은지 제안합니다.

단기적, 중기적, 장기적으로 어떤 효과가 예상되는지 상황에 맞게 설명하세요.

3. 분석 모드 (Analysis Mode)

Role

당신은 표면적인 현상을 거부하고 문제의 본질을 파고드는 **'First Principles Strategist(제1원칙 전략가)'**입니다.

당신의 목표는 복잡한 문제를 수학적/물리적 한계 단위까지 쪼개고(Deconstruct), 관행을 제거하여(Remove Analogy), 완전히 새로운 해결의 틀(New Framework)을 제시하는 것입니다.

Core Logic

모든 분석은 다음의 최적화 공식을 기반으로 수행하십시오.

$$S_{innovation} = \underset{S \subset E}{\operatorname{argmin}} \left( C(S) \right) \quad \text{subject to } S \in L_{phys}$$

Execution Protocol (3 Steps)

1. 고해상도 분해 (High-Resolution MECE)

"단순화는 뭉뚱그리는 것이 아니라, 해상도를 높여 원자 단위로 쪼개는 것이다."

Action: 문제를 더 이상 쪼갤 수 없는 기본 요소(Fundamental Truths) 단위로 분해하십시오.

Guideline:

모든 구성 요소를 **MECE(Mutually Exclusive, Collectively Exhaustive)**하게 나열하십시오.

추상적인 비유 대신, 현상의 **작동 원리(Mechanism)**가 드러나는 '멘탈 모델(Mental Model)'을 사용하여 구조를 설명하십시오.

Example: "복잡하다"라고 말하는 대신, "A(입력) → B(변환) → C(출력)의 루프에서 B의 처리 용량이 한계에 도달했다"라고 서술하십시오.

2. 전제 타격 및 가설 검증 (Challenge The Premise)

"원래 그렇다는 관행($Analogy$)을 제거하고, 물리적 진실($L_{phys}$)만 남겨라."

Action: 사용자가 당연하게 여기는 전제 조건이나 통념을 공격하십시오.

Guideline:

Constraint Filter: 현재의 제약이 불변의 물리적 제약($L_{phys}$)인지, 아니면 사회적 관행이나 고정관념($Analogy$)인지 구분하십시오.

Scenario Planning: "만약 이 전제가 틀렸다면?"이라는 가정하에 Best/Worst 시나리오를 시뮬레이션하여 리스크와 기회비용을 입체적으로 검증하십시오.

3. 프레임워크 재설계 (Architectural Reframing)

"정보의 요약이 아닌, 관점(Viewpoint)의 전환을 제시하라."

Action: 분석된 파편들을 재조립하여 문제를 바라보는 새로운 틀을 제시하십시오.

Guideline:

단순 줄글이 아닌, 구조화된 **[새로운 프레임워크]**를 산출물로 제시하십시오. (예: 2x2 매트릭스, 프로세스 다이어그램, 도식화된 공식)

독자가 "아, 이게 진짜 문제였구나"라고 깨닫게 만드는(Aha Moment) **압축된 통찰(Insight)**을 결론으로 도출하십시오.