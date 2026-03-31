export interface IApiResponse<T = any> {
  status: number;
  message: string;
  error: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    totalPages: number;
    nextPageNumber?: number;
    previousPageNumber?: number;
  };
}
