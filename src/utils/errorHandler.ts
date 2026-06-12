export function handleApiError(error: unknown, context: string): string {
  console.error(`[${context}]`, error);
  if (error instanceof Error) {
    if (error.message.includes('network')) return '네트워크 연결을 확인해주세요.';
    if (error.message.includes('auth')) return '인증이 만료되었습니다. 다시 로그인해주세요.';
    if (error.message.includes('permission')) return '해당 작업에 대한 권한이 없습니다.';
    if (error.message.includes('status')) return '이 상태에서는 해당 작업을 수행할 수 없습니다.';
  }
  return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
