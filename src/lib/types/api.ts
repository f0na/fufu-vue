export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiErrorBody {
  error: {
    code: number;
    message: string;
  };
}

export interface ApiMessageResponse {
  message: string;
}
