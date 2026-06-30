import asyncio
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, RichLog
from textual import work

from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

class RPA_TUI(App):
    """AGY 기반 AI RPA 봇의 터미널 UI(Textual) 버전"""

    # TUI 화면의 레이아웃 스타일 지정
    CSS = """
    RichLog {
        height: 1fr;
        border: solid green;
        padding: 1;
        background: $surface;
    }
    Input {
        dock: bottom;
        margin: 1;
    }
    """

    BINDINGS = [("d", "toggle_dark", "다크 모드 전환"), ("q", "quit", "종료")]

    def __init__(self):
        super().__init__()
        self.task_queue = asyncio.Queue()

    def compose(self) -> ComposeResult:
        """화면 구성요소 렌더링"""
        yield Header(show_clock=True)
        # 봇과 대화하는 로그 창
        yield RichLog(id="chat_log", wrap=True, markup=True)
        # 사용자 명령 입력창
        yield Input(placeholder="봇에게 내릴 명령을 입력하고 엔터를 누르세요 (예: 터미널에 hello 쳐줘)...", id="command_input")
        yield Footer()

    async def on_mount(self) -> None:
        """앱이 시작될 때 백그라운드 봇 초기화"""
        log = self.query_one("#chat_log", RichLog)
        log.write("[bold green]🚀 AGY 기반 AI RPA 봇 부팅 중 (OAuth 인증 확인)...[/bold green]")
        
        # 에이전트 루프를 백그라운드 워커로 실행
        self.run_worker(self.agent_loop(), exclusive=True)

    async def agent_loop(self) -> None:
        """AGY 에이전트를 스폰하고, 사용자의 명령을 기다리는 무한 루프"""
        log = self.query_one("#chat_log", RichLog)
        
        config = LocalAgentConfig(
            system_instructions="""You are an AI RPA (Robotic Process Automation) Agent running on a Linux desktop.
Your objective is to physically manipulate the user's screen (mouse, keyboard) to complete tasks.
You can execute bash commands using your tools. To control the GUI, you should dynamically generate and run Python one-liners or scripts using the `pyautogui` library.
For example, to type something, you can run: python -c "import pyautogui, time; time.sleep(2); pyautogui.write('hello'); pyautogui.press('enter')"

Always wait 2-3 seconds before typing to ensure the user has focused the target window.
Keep your text responses concise and Korean. Let the user know what action you are taking.
""",
            capabilities=CapabilitiesConfig()
        )

        try:
            # AGY 세션(OAuth) 스폰 (이 컨텍스트 안에 있어야 봇이 살아있음)
            async with Agent(config) as agent:
                log.write("[bold cyan]🤖 에이전트 연결 완료! 언제든 명령을 내려주세요.[/bold cyan]")
                
                while True:
                    # 큐에서 사용자가 입력한 메시지를 대기
                    user_input = await self.task_queue.get()
                    if user_input == "QUIT":
                        break
                    
                    log.write(f"\n[bold magenta]👤 나:[/bold magenta] {user_input}")
                    log.write("[bold yellow]🤖 에이전트가 코드를 작성하며 화면 조작을 준비 중입니다...[/bold yellow]")
                    
                    try:
                        # 봇에게 지시 전송
                        response = await agent.chat(user_input)
                        
                        reply = ""
                        # 실시간으로 생성되는 답변을 모아서 출력
                        async for token in response:
                            reply += token
                            
                        log.write(f"[bold green]🤖 봇:[/bold green]\n{reply}\n")
                    except Exception as e:
                        log.write(f"[bold red]명령 수행 중 오류 발생: {e}[/bold red]")
                    
                    self.task_queue.task_done()
                    
        except Exception as e:
            log.write(f"[bold red]에이전트 연결 실패: {e}[/bold red]")

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """사용자가 엔터를 쳤을 때 발생"""
        input_widget = event.input
        user_text = input_widget.value.strip()
        
        if user_text:
            # 입력창 비우기
            input_widget.value = ""
            # 백그라운드 봇에게 메시지 전송
            await self.task_queue.put(user_text)

if __name__ == "__main__":
    app = RPA_TUI()
    app.run()
