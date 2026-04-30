import { apiClient, toApiError, type ApiError } from '~/lib/apiClient';
import type { ApiResponse } from '~/types/api';
import type { SubCategory } from '~/types/subcategory';

export interface GetSubCategoriesParams {
  token: string;
  page?: number;
  per_page?: number;
  name?: string;
  order?: { updated_at?: 'asc' | 'desc' };
}

export async function getSubCategories({
  token,
  ...params
}: GetSubCategoriesParams): Promise<ApiResponse<SubCategory>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<SubCategory>>('/api/subcategories', {
      params,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getSubCategory(id: number, token: string): Promise<SubCategory> {
  try {
    const { data } = await apiClient(token).get<SubCategory>(`/api/subcategories/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createSubCategory(
  payload: { name: string, category_id: number },
  token: string,
): Promise<SubCategory | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<SubCategory>('/api/subcategories', payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function updateSubCategory(
  id: number,
  payload: { name: string, category_id: number; },
  token: string,
): Promise<SubCategory | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<SubCategory>(`/api/subcategories/${id}`, payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function deleteSubCategory(
  id: number,
  token: string,
): Promise<any | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/subcategories/${id}`);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}
