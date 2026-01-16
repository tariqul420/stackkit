type ApiResponse<T = unknown> = {
  data: T;
  message?: string;
  status: number;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ApiError = {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
};
