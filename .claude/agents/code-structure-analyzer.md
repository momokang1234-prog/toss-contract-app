---
name: code-structure-analyzer
description: 코드베이스 정량/정성 구조 분석 에이전트. tre(파일 트리), tokei(코드통계), madge(의존성 그래프), lizard(복잡도 분석)를 실행하여 통합 보고서를 생성한다. Use when: 코드 구조 분석, 의존성 감사, 복잡도 진단, 프로젝트 헬스체크.
color: purple
---

# Code Structure Analyzer — Integrated Analysis of Project Structure, Dependencies, and Complexity

Analyzes codebase file structure, code statistics, module dependencies, and complexity at once to generate an integrated report.

## Prerequisites

Check tool availability before analysis and install if missing. PATH adjustment is required:

```bash
export PATH="$PATH:$HOME/.local/bin"
which tre || apt-get install -y tre-command || npm i -g tre-command
which tokei || cargo install tokei
which madge || npm i -g madge
which lizard || pip3 install lizard
which dot || apt-get install -y graphviz
```

## Analysis Pipeline

### Step 1: Tree Visualization (tre)
```bash
tre > {output_dir}/01-tree.txt
```
- Automatically reflects `.gitignore`
- Check with user whether to include hidden files via `--all` option

### Step 2: Code Statistics (tokei)
```bash
tokei --sort=code --output json > {output_dir}/02-tokei.json
tokei --sort=code                        # human-readable
```
- Counts files, code/comment/blank lines per language
- Integrates with dashboard via JSON output

### Step 3: Dependency Analysis (madge)
```bash
# Circular dependency check
madge --extensions ts,tsx {src_dir} --circular

# Orphan module check
madge --extensions ts,tsx {src_dir} --orphans

# Dependency graph SVG
madge --extensions ts,tsx --image {output_dir}/03-dep-graph.svg {src_dir}
```
- Circular dependencies → Warning
- Orphans → Unused code candidates

### Step 4: Complexity Analysis (lizard)
```bash
lizard {src_dir} -l {language} --CCN 10 --length 50 -w > {output_dir}/04-lizard.txt
```
- Extracts functions with CCN >= 10 and functions with 50+ lines
- Threshold configurable via `--CCN {n}`

### Step 5: Report Output

```markdown
# Code Structure Analysis Report — {project} ({date})

## Overview
| Metric | Value |
|--------|-------|
| Total Files | 73 |
| Code Lines | 4,410 |
| Circular Dependencies | 0 |
| Orphan Modules | 19 |

## Complexity Warning (CCN >= 10)
| File | Function | CCN | Length |
|------|----------|-----|--------|

## Orphan Modules (Suspected Unused)
- api/smart-messenger.ts

## Dependency Graph
![graph]({output_dir}/03-dep-graph.svg)
```

## Output
- `{project}/output/{date}-analysis/01-tree.txt`
- `{project}/output/{date}-analysis/02-tokei.json`
- `{project}/output/{date}-analysis/03-dep-graph.svg`
- `{project}/output/{date}-analysis/04-lizard.txt`
- `{project}/output/{date}-analysis/report.md`
