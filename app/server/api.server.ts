import { apiClient, toApiError, type ApiError } from '~/lib/apiClient';
import type { ApiResponse } from '~/types/api';
import type { Family } from '~/types/family';

export interface GetFamiliesParams {
  token: string;
  page?: number;
  per_page?: number;
  name?: string;
  order?: { updated_at?: 'asc' | 'desc' };
  pagination?: boolean;
}

export async function getFamilies({
  token,
  ...params
}: GetFamiliesParams): Promise<ApiResponse<Family>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Family>>('/api/families', {
      params,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getFamily(id: number, token: string): Promise<Family> {
  try {
    const { data } = await apiClient(token).get<Family>(`/api/families/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createFamily(
  payload: { name: string },
  token: string,
): Promise<Family | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Family>('/api/families', payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function updateFamily(
  id: number,
  payload: { name: string },
  token: string,
): Promise<Family | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Family>(`/api/families/${id}`, payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function deleteFamily(
  id: number,
  token: string,
): Promise<any | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/families/${id}`);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}
