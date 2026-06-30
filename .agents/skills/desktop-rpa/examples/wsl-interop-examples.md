# WSL Windows Interop Examples (WSL 환경 윈도우 제어 예제)

WSL 환경에 상주하는 에이전트가 윈도우 호스트(Windows Host)의 애플리케이션을 직접 제어할 때 사용하는 `powershell.exe` 기반 자동화 예제 모음입니다.

> [!WARNING]
> 모든 명령어의 끝에는 파이프라인 표준 입력 대기로 인한 무한 대기(Hang)를 막기 위해 **반드시 `< /dev/null`을 명시**해야 합니다.

## 1. 웹 브라우저(크롬) 제어 및 특정 URL 탐색
```bash
# 구글에서 특정 키워드 검색 
powershell.exe -Command "Start-Process 'chrome' 'https://www.google.com/search?q=검색어'" < /dev/null

# 특정 웹사이트(유튜브 채널 등) 다이렉트 이동
powershell.exe -Command "Start-Process 'chrome' 'https://www.youtube.com/@sinsaimdang'" < /dev/null
```

## 2. 윈도우 기본 애플리케이션 실행
```bash
# 메모장(Notepad) 실행
powershell.exe -Command "Start-Process 'notepad'" < /dev/null

# 윈도우 파일 탐색기로 현재 WSL 디렉토리 열기
powershell.exe -Command "Invoke-Item ." < /dev/null
```

## 3. 윈도우 호스트 화면 캡처 및 저용량 WebP 압축 (가장 중요)
WSL 내부의 `pyautogui.screenshot()`은 X11 권한 문제로 동작하지 않습니다. 따라서 PowerShell .NET 프레임워크로 윈도우 전체 화면을 원본 캡처한 뒤, 파일 용량과 토큰 절약을 위해 즉시 Python PIL을 호출하여 **해상도 축소(50%) + 흑백 변환 + WebP 압축**을 수행하는 2-Step 구조를 사용합니다.

> **💡 아키텍처 설계 의도 (Zero-Dependency Best Practice):** 
> 윈도우 CLI에서 WebP로 다이렉트 캡처하려면 `FFmpeg` 같은 무거운 외부 바이너리를 호스트에 강제로 설치해야 합니다. 반면 이 2-Step 방식은 윈도우 기본 내장 `.NET`과 WSL의 파이썬 `PIL`만 교차 활용하므로, **사용자 PC에 추가 설치 의존성 없이 가장 가볍고 확실하게 동작하는 최적의 파이프라인**입니다.
```bash
# 1단계: PowerShell로 윈도우 전체 화면 원본 캡처 (임시 저장)
powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; \$Screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; \$Bitmap = New-Object System.Drawing.Bitmap \$Screen.Width, \$Screen.Height; \$Graphics = [System.Drawing.Graphics]::FromImage(\$Bitmap); \$Graphics.CopyFromScreen(\$Screen.X, \$Screen.Y, 0, 0, \$Bitmap.Size); \$Bitmap.Save('raw_temp.png'); \$Graphics.Dispose(); \$Bitmap.Dispose();" < /dev/null

# 2단계: WSL 내부 파이썬을 통해 저용량 WebP로 최적화 후 원본 삭제
# (주의: 사용자가 컬러 구분을 요구한 태스크라면 아래 코드에서 .convert('L') 부분을 제외하고 실행하세요)
python3 -c "from PIL import Image; import os; img = Image.open('raw_temp.png'); w, h = img.size; img = img.resize((w//2, h//2), Image.Resampling.LANCZOS).convert('L'); img.save('verify.webp', 'webp', quality=40); os.remove('raw_temp.png'); print('Visual verification saved to: verify.webp')"
```

## 4. 윈도우 클립보드 읽기/쓰기 (한글 깨짐 방지)
한글 텍스트를 `SendKeys`로 타이핑하면 깨질 수 있으므로, 클립보드에 복사한 뒤 `Ctrl+V`를 전송하는 방식이 안전합니다.
```bash
# WSL에서 윈도우 클립보드로 텍스트 복사
echo "복사할 한글 텍스트" | clip.exe

# 윈도우 클립보드에 있는 텍스트를 WSL에서 읽어오기
powershell.exe -Command "Get-Clipboard" < /dev/null
```

## 5. 윈도우 UI Automation (키보드 매크로 전송)
간단한 키보드 입력을 윈도우 창으로 전송하는 복합 명령어 예시입니다. (크롬 창을 활성화한 뒤 1초 대기 후 `Ctrl+T`로 새 탭을 열고 `Ctrl+V`로 클립보드 내용 붙여넣기)
```bash
powershell.exe -Command "\$wshell = New-Object -ComObject wscript.shell; \$wshell.AppActivate('Chrome'); Sleep 1; \$wshell.SendKeys('^t'); Sleep 1; \$wshell.SendKeys('^v'); Sleep 1; \$wshell.SendKeys('{ENTER}');" < /dev/null
```

## 6. 윈도우 네이티브 알림(Toast Notification) 띄우기
에이전트가 장시간의 작업을 끝낸 후, 사용자 윈도우 우측 하단에 작업 완료 알림 팝업을 띄울 때 사용합니다.
```bash
powershell.exe -Command "[reflection.assembly]::loadwithpartialname('System.Windows.Forms'); [reflection.assembly]::loadwithpartialname('System.Drawing'); \$notify = new-object system.windows.forms.notifyicon; \$notify.icon = [System.Drawing.SystemIcons]::Information; \$notify.visible = \$true; \$notify.showballoontip(10,'작업 완료','에이전트의 자동화 작업이 끝났습니다!',[system.windows.forms.tooltipicon]::None)" < /dev/null
```
