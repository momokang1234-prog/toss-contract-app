---
description: Python PyAutoGUI와 xdotool을 사용하여 운영체제 데스크톱 화면을 물리적으로 조작(마우스 이동, 클릭, 키보드 타이핑 등)하는 RPA 자동화 스킬입니다. 터미널 명령어나 코드 수정 외에 실제 화면 제어가 필요할 때 사용합니다.
---

# Desktop RPA (Screen Automation) Playbook

## 목적
이 스킬은 API나 내부 CLI 명령어로 불가능한 "물리적 화면 조작(마우스/키보드)"이 필요할 때 에이전트가 `pyautogui`를 이용해 데스크톱을 직접 제어하기 위한 가이드입니다.

## 사전 준비 (Dependencies)
- 이 스킬을 수행하려면 시스템에 `pyautogui` 라이브러리와 `xdotool`이 설치되어 있어야 합니다. (이미 설치되어 있다고 가정합니다.)
- 리눅스 데스크톱(X11) 환경에서 작동합니다.

## 실행 절차 (Workflow)

1. **상황 파악 및 좌표/동작 계산**
   - 사용자가 어떤 창에 어떤 입력을 원하는지 파악합니다. (예: "브라우저 클릭 후 주소창에 github.com 치고 엔터")
   - 마우스 이동이 필요 없는 경우, 터미널 포커스가 다른 창으로 넘어갈 시간을 주기 위해 반드시 **3초 이상의 대기 시간(`time.sleep(3)`)**을 스크립트 최상단에 포함해야 합니다.

2. **단일 파이썬 스크립트 작성 및 실행**
   - 여러 번 명령을 나누어 실행하지 말고, 하나의 `pyautogui` 파이썬 스크립트(또는 One-liner)를 완성한 뒤 `run_command` 도구를 통해 한 번에 실행합니다.

   **[터미널 타이핑 예시 코드]**
   ```bash
   python3 -c "import pyautogui, time; time.sleep(3); pyautogui.write('echo Hello World', interval=0.05); pyautogui.press('enter')"
   ```

   **[마우스 제어 포함 예시 코드]**
   ```python
   # rpa_task.py로 임시 파일 생성 후 실행
   import pyautogui
   import time

   time.sleep(2)
   # x=500, y=500 위치로 이동하여 클릭 (좌표는 상황에 맞게 추정)
   pyautogui.moveTo(500, 500, duration=0.5)
   pyautogui.click()
   pyautogui.write('https://github.com')
   pyautogui.press('enter')
   ```

3. **피드백 제공 및 시각적 검증 (Visual Verification)**
   - 사용자에게 "현재 3초 대기 중입니다. 대상 창을 포커스해주세요."라고 미리 안내합니다.
   - 조작이 끝나면 어떤 행동(타이핑 내용, 누른 키 등)을 수행했는지 요약하여 보고합니다.
   - **(필수) 결과 검증용 저용량 스크린샷 캡처**: 조작 완료 직후 스크린샷을 캡처하고, 에이전트가 해당 이미지를 읽어들여(또는 사용자에게 제시하여) 의도한 대로 창이 열렸는지, 텍스트가 입력되었는지 직접 확인합니다.

   **[저용량 스크린샷 캡처 방법론 (이미지 용량 최소화 전략)]**
   에이전트가 이미지를 판독할 때 발생하는 컨텍스트 비용과 파일 용량을 최소화하기 위해 다음 4가지 최적화 기법을 스크립트에 반드시 적용합니다.
   1. **포맷 최적화**: 무손실 PNG 포맷 대신 압축률이 뛰어난 `WebP` 또는 `JPEG` 포맷을 사용합니다 (`WebP` 권장).
   2. **해상도 축소(Downscale)**: 단순 레이아웃 및 텍스트 확인용으로는 원본 해상도가 불필요하므로 크기를 50% 이하로 리사이징합니다 (픽셀 수 75% 감소 효과).
   3. **상황별 색상 유지/단순화 (자동 판별)**:
      - **기본값 (흑백):** 텍스트/레이아웃 판독만 필요한 경우 흑백(`'L'` 모드)으로 변환해 용량을 극한으로 줄입니다.
      - **컬러 보존:** 사용자 요청에 특정 색상 판별(예: "빨간 버튼", "초록색 아이콘")이 필요하다고 판단되면 에이전트 스스로 흑백 변환 코드를 생략하고 컬러(RGB)를 유지합니다.
   4. **품질 압축 설정**: 이미지 저장 시 `quality=40~50` 수준의 손실 압축 옵션을 부여합니다.

   **[최적화 캡처 및 저장 예시 코드]**
   ```python
   # RPA 조작 코드 하단에 아래 캡처 로직을 이어붙여 실행합니다.
   from PIL import Image
   import pyautogui

   # 화면 캡처
   img = pyautogui.screenshot()
   w, h = img.size

   # 1. 해상도 50% 축소
   img = img.resize((w // 2, h // 2), Image.Resampling.LANCZOS)

   # 2. 색상 보존 여부 (에이전트 자율 판단)
   # 컬러 구분이 불필요할 때만 아래 흑백 변환을 실행합니다.
   img = img.convert('L')

   # 3. WebP 포맷 & quality=40으로 고압축 저장
   verify_path = '/tmp/rpa_verify.webp'
   img.save(verify_path, 'webp', quality=40)
   print(f"시각적 검증 파일 저장 완료: {verify_path}")
   ```
   스크립트가 완료되면, 에이전트는 저장된 `/tmp/rpa_verify.webp` 파일을 시각적으로 분석하여 최종 성공 여부를 판단합니다.

## WSL 환경 전용 우회 기법 (Windows Interop)
에이전트가 구동 중인 곳이 **Windows 기반의 WSL(Linux 하위 시스템)** 환경일 경우, 리눅스용 `pyautogui`는 X11 권한 부재(`.Xauthority` 에러)로 인해 윈도우 호스트 화면을 직접 제어하지 못합니다. 이때는 다음 규칙을 따릅니다.

1. **PowerShell 원격 제어:** `pyautogui` 대신 윈도우의 `powershell.exe`를 호출하여 윈도우 프로세스를 브릿지 제어합니다.
2. **[핵심] 무한 대기(Hang) 병목 방지:** `run_command`로 윈도우 `.exe` 파일을 실행할 때, PTY 파이프라인의 표준 입력 대기로 인해 프로세스가 영구적으로 멈추는 심각한 버그가 있습니다. 이를 방지하기 위해 명령어 끝에 **반드시 `< /dev/null`을 명시하여 입력 채널을 강제 종료**해야 합니다.

**[WSL -> Windows 호스트 안전한 제어 예시]**
```bash
# 크롬 실행 시 Hang을 막기 위한 < /dev/null 필수 추가
powershell.exe -Command "Start-Process 'chrome' 'https://www.google.com'" < /dev/null
```

## 주의 사항
- `pyautogui.write()` 호출 시 한글 텍스트 직접 입력은 OS 설정에 따라 깨질 수 있으므로 영문/숫자 타이핑을 우선시하거나 클립보드 복사(pyperclip) 방식을 고려하세요.
- 갑작스러운 조작으로 인한 사고를 막기 위해, 위험한 명령(삭제 등)을 타이핑할 때는 `enter`를 누르기 전에 사용자에게 최종 확인을 받으세요.

## References (참고 문서 및 예제)
- [WSL 호스트 제어 예제 코드 (크롬 열기, 메모장 등)](.claude/commands/desktop-rpa/references/examples/wsl-interop-examples.md)
