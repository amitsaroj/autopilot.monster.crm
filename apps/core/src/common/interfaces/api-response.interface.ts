export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp: string;
  correlationId?: string;
}
