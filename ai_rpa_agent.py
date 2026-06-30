import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def main():
    print("🚀 AGY 기반 AI RPA 에이전트 부팅 중 (OAuth 인증 자동 연동)...")
    
    # 에이전트 설정: 터미널 명령어(run_command)를 실행할 수 있도록 권한 부여
    config = LocalAgentConfig(
        system_instructions="""You are an AI RPA (Robotic Process Automation) Agent running on a Linux desktop.
Your objective is to physically manipulate the user's screen (mouse, keyboard) to complete tasks.
You can execute bash commands using your tools. To control the GUI, you should dynamically generate and run Python one-liners or scripts using the `pyautogui` library.
For example, to type something, you can run: python -c "import pyautogui, time; time.sleep(2); pyautogui.write('hello'); pyautogui.press('enter')"

Always wait 2-3 seconds before typing to ensure the user has focused the target window.
""",
        capabilities=CapabilitiesConfig(),
    )

    # AGY의 세션(OAuth)을 공유하여 에이전트 스폰
    async with Agent(config) as agent:
        # 사용자 지시사항
        task = "Please wait 3 seconds, then simulate typing 'echo I am a Smart RPA Agent powered by AGY!' and press enter."
        print(f"\n[사용자 지시사항]: {task}\n")
        print("🤖 에이전트가 코드를 작성하고 조작을 시작합니다...\n")
        
        # 에이전트에게 지시 전송 (백그라운드에서 스스로 코드를 짜서 터미널에 실행함)
        response = await agent.chat(task)

        # 에이전트의 답변 스트리밍 출력
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()
        print("\n\n✅ 작업 완료!")

if __name__ == "__main__":
    asyncio.run(main())
