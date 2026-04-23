import { apiClient, toApiError, type ApiError } from '~/lib/apiClient';
import type { ApiResponse } from '~/types/api';
import type { Category } from '~/types/category';

export interface GetCategoriesParams {
  token: string;
  page?: number;
  per_page?: number;
  name?: string;
  order?: { updated_at?: 'asc' | 'desc' };
}

export async function getCategories({
  token,
  ...params
}: GetCategoriesParams): Promise<ApiResponse<Category>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Category>>('/api/categories', {
      params,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getCategory(id: number, token: string): Promise<Category> {
  try {
    const { data } = await apiClient(token).get<Category>(`/api/categories/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createCategory(
  payload: { name: string },
  token: string,
): Promise<Category | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Category>('/api/categories', payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function updateCategory(
  id: number,
  payload: { name: string },
  token: string,
): Promise<Category | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Category>(`/api/categories/${id}`, payload);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}

export async function deleteCategory(
  id: number,
  token: string,
): Promise<any | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/categories/${id}`);
    return data;
  } catch (err) {
    return { error: toApiError(err) };
  }
}
