import asyncio
import os
from google.antigravity import Agent, LocalAgentConfig

async def main():
    # 1. API 키가 환경변수에 있는지 확인합니다.
    if not os.environ.get("GEMINI_API_KEY"):
        print("[WARNING] GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")
        print("실행 전에 반드시 'export GEMINI_API_KEY=\"your_key\"'를 터미널에 입력해 주세요.")
        return

    # 2. 에이전트 기본 설정 생성
    config = LocalAgentConfig(
        system_instructions="You are a helpful coding assistant."
    )

    print("에이전트를 초기화하고 대화를 시작합니다...")
    
    # 3. 에이전트 컨텍스트 실행 및 대화 요청
    async with Agent(config) as agent:
        response = await agent.chat("Python의 list comprehension에 대해 한 줄로 설명해줘.")
        
        # 4. 결과 출력
        result = await response.text()
        print(f"\n[Agent Response]:\n{result}")

if __name__ == "__main__":
    asyncio.run(main())
