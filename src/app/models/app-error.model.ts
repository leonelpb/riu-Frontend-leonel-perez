export interface AppError {
  code: 'HTTP_ERROR' | 'NOT_FOUND' | 'INVALID_RESPONSE' | 'API_DOWN' | 'INCOMPLETE_DATA' | 'UNKNOWN';
  message: string;
  originalError?: unknown;
}

export function createAppError(code: AppError['code'], message: string, originalError?: unknown): AppError {
  return { code, message, originalError };
}
