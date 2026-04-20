import { apiClient, toApiError } from '~/lib/apiClient';
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
    const { data } = await apiClient(token).get<ApiResponse<Family>>('/api/families', {
      params,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
