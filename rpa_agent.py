import pyautogui
import time
import sys

def rpa_agent_task():
    print("🤖 RPA 에이전트 시작: 3초 뒤 화면 조작을 시작합니다. 대상 창(터미널 등)을 띄워두세요.")
    time.sleep(3)
    
    # --- 1. 마우스 조작 ---
    # 예시: 특정 좌표(x=500, y=500)로 0.5초에 걸쳐 이동 후 클릭하여 창에 포커스 맞추기
    # 화면 해상도에 맞게 좌표를 수정하거나, 이 부분을 주석 처리하고 사용자가 직접 창을 포커스해도 됩니다.
    # print("🖱️ 마우스 이동 및 클릭")
    # pyautogui.moveTo(500, 500, duration=0.5)
    # pyautogui.click()

    # 이미지 인식 기반 클릭 (미리 캡처해둔 버튼 이미지가 화면에 보일 때 클릭)
    # location = pyautogui.locateCenterOnScreen('target_button.png')
    # if location:
    #     pyautogui.click(location)

    # --- 2. 키보드 타이핑 ---
    target_command = "echo 'Hello! I am your RPA Agent running outside tmux.'"
    print(f"⌨️ 명령어 타이핑 중: {target_command}")
    
    # 사람이 타이핑하듯 글자당 0.05초의 간격을 두고 입력합니다.
    pyautogui.write(target_command, interval=0.05)
    
    # --- 3. 엔터 전송 ---
    print("↵ 엔터키 입력")
    pyautogui.press('enter')
    
    print("✅ 작업 완료!")

if __name__ == "__main__":
    try:
        rpa_agent_task()
    except KeyboardInterrupt:
        print("\n중단되었습니다.")
        sys.exit(0)
    except Exception as e:
        print(f"\n오류 발생: {e}")
        print("\n💡 리눅스 환경 주의사항: ")
        print("1. Wayland 대신 X11(Xorg) 환경에서 실행해야 PyAutoGUI가 정상 작동합니다.")
        print("2. xdotool 설치가 필요할 수 있습니다: sudo apt-get install xdotool scrot")
