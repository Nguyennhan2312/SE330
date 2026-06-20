export type ApiResponse<T> = {
  success: boolean;
  message: string;
  code?: string;
  data?: T;
  meta?: unknown;
  timestamp: string;
  traceId?: string;
};

export class ApiError extends Error {
  code?: string;
  status: number;
  traceId?: string;

  constructor(message: string, status: number, code?: string, traceId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.traceId = traceId;
  }
}
