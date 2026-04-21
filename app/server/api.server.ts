import { apiClient, toApiError, type ApiError } from '~/lib/apiClient';
import type { ApiResponse } from '~/types/api';
import type { Family } from '~/types/family';

export interface GetFamiliesParams {
  token: string;
  page?: number;
  per_page?: number;
  name?: string;
  order?: { updated_at?: 'asc' | 'desc' };
}

export async function getFamilies({
  token,
  ...params
}: GetFamiliesParams): Promise<ApiResponse<Family>> {
  try {
    const { data } = await apiClient.get<ApiResponse<Family>>('/api/families', {
      params,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getFamily(id: number): Promise<Family> {
  try {
    const { data } = await apiClient.get<Family>(`/api/families/${id}`);
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
    const { data } = await apiClient.post<Family>('/api/families', payload);
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
    const { data } = await apiClient.patch<Family>(`/api/families/${id}`, payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}
