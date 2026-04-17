import axios, { AxiosError, type AxiosInstance } from 'axios';
import { ActionError } from 'astro:actions';

const API_URL = import.meta.env.PUBLIC_LARAVEL_API_URL;

export function apiClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: API_URL,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const STATUS_TO_CODE: Record<number, ActionError['code']> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'BAD_REQUEST',
};

export function toActionError(err: unknown): ActionError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 500;
    const data = err.response?.data as { message?: string } | undefined;
    return new ActionError({
      code: STATUS_TO_CODE[status] ?? 'INTERNAL_SERVER_ERROR',
      message: data?.message ?? err.message,
    });
  }
  return new ActionError({
    code: 'INTERNAL_SERVER_ERROR',
    message: err instanceof Error ? err.message : 'Unexpected error',
  });
}
