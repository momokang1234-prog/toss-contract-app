---
title: Desktop RPA — WSL-Windows 인터롭
type: topic
updated: 2026-06-26
sources:
  - 02446945-940e-402b-bd6d-a82d522737af
tags:
  - desktop-rpa
  - wsl
  - powershell
  - agy-cli
  - windows-interop
---

# Desktop RPA — WSL-Windows 인터롭

WSL 환경에 상주하는 `agy-cli`(antigravity-agent)가 Windows 호스트 애플리케이션을 직접 제어할 때 사용하는 패턴 모음.
참조 파일: `.agents/skills/desktop-rpa/examples/wsl-interop-examples.md`

## 핵심 규칙

> **모든 `powershell.exe` 명령 끝에 `< /dev/null` 필수**
> stdin 대기로 인한 무한 행(Hang) 방지.

## 패턴별 예제

### 1. 웹 브라우저(Chrome) 제어

```bash
# 구글 검색
powershell.exe -Command "Start-Process 'chrome' 'https://www.google.com/search?q=검색어'" < /dev/null

# 특정 URL 직접 이동
powershell.exe -Command "Start-Process 'chrome' 'https://www.youtube.com/@sinsaimdang'" < /dev/null
```

### 2. 윈도우 기본 앱 실행

```bash
# 메모장
powershell.exe -Command "Start-Process 'notepad'" < /dev/null

# 현재 WSL 디렉토리를 파일 탐색기로 열기
powershell.exe -Command "Invoke-Item ." < /dev/null
```

### 3. 화면 캡처 + WebP 압축 (토큰 절약)

WSL 내 `pyautogui.screenshot()`은 X11 권한 문제로 동작 안 함.
→ PowerShell .NET 프레임워크로 원본 캡처 후 Python PIL로 즉시 압축.

```bash
powershell.exe -Command "
  Add-Type -AssemblyName System.Windows.Forms;
  \$s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds;
  \$bmp = New-Object System.Drawing.Bitmap(\$s.Width, \$s.Height);
  \$g = [System.Drawing.Graphics]::FromImage(\$bmp);
  \$g.CopyFromScreen(\$s.Location, [System.Drawing.Point]::Empty, \$s.Size);
  \$bmp.Save('raw_temp.png')
" < /dev/null

python3 -c "
from PIL import Image; import os
img = Image.open('raw_temp.png')
w, h = img.size
img = img.resize((w//2, h//2), Image.Resampling.LANCZOS).convert('L')
img.save('verify.webp', 'webp', quality=40)
os.remove('raw_temp.png')
print('Visual verification saved to: verify.webp')
"
```

- 해상도 50% 축소 + 흑백 변환 + quality=40 WebP
- 파일 용량과 토큰 소비를 최소화하는 시각 검증용 패턴

### 4. 클립보드 읽기/쓰기 (한글 깨짐 방지)

한글 텍스트를 `SendKeys`로 직접 타이핑하면 깨질 수 있어 클립보드 경유가 안전.

```bash
# WSL → 윈도우 클립보드로 복사
echo "복사할 한글 텍스트" | clip.exe

# 윈도우 클립보드 내용을 WSL에서 읽기
powershell.exe -Command "Get-Clipboard" < /dev/null
```

### 5. UI Automation — 키보드 매크로 전송

`wscript.shell` COM 오브젝트로 특정 창에 키 입력 전송.

```bash
# Chrome 활성화 → 새 탭(Ctrl+T) → 클립보드 붙여넣기(Ctrl+V) → Enter
powershell.exe -Command "
  \$wshell = New-Object -ComObject wscript.shell;
  \$wshell.AppActivate('Chrome'); Sleep 1;
  \$wshell.SendKeys('^t'); Sleep 1;
  \$wshell.SendKeys('^v'); Sleep 1;
  \$wshell.SendKeys('{ENTER}');
" < /dev/null
```

### 6. 윈도우 Toast 알림

에이전트가 장시간 작업 완료 후 우측 하단 팝업 알림.

```bash
powershell.exe -Command "
  [reflection.assembly]::loadwithpartialname('System.Windows.Forms');
  [reflection.assembly]::loadwithpartialname('System.Drawing');
  \$notify = new-object system.windows.forms.notifyicon;
  \$notify.icon = [System.Drawing.SystemIcons]::Information;
  \$notify.visible = \$true;
  \$notify.showballoontip(10,'작업 완료','에이전트의 자동화 작업이 끝났습니다!',[system.windows.forms.tooltipicon]::None)
" < /dev/null
```

## 세션 이력

### 2026-06-26 — RPA 테스트 스크립트 실행 (`02446945`)

- `agy-cli`가 `intent-analyzer` SKILL.md와 `wsl-interop-examples.md`를 참조
- `rpa_test.sh` 생성 후 background task(`task-18`)로 실행
- 실행 로그: `~/.gemini/antigravity-cli/brain/02446945-940e-402b-bd6d-a82d522737af/.system_generated/tasks/task-18.log`

## 관련 페이지

- [[agent-setup]] — agy-cli 및 antigravity 에이전트 설정
