import axios, { AxiosError } from 'axios';

const API_URL = process.env.API_URL;

export const apiClient = (token?: string) => axios.create({
  baseURL: API_URL || '/',
  headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  // withCredentials: true,
});

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status: number;
  errors?: Record<string, string[]>;

}

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'BAD_REQUEST',
};

export function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 500;
    const data = err.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    } | undefined;

    return {
      code: STATUS_TO_CODE[status] ?? 'INTERNAL_SERVER_ERROR',
      message: data?.message ?? err.message,
      status,
      errors: data?.errors,
    };
  }
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: err instanceof Error ? err.message : 'Unexpected error',
    status: 500,
  };
}
