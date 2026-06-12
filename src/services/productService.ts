import { api } from './api';
import { Categoria, Produto, TamanhoProduto, Avaliacao } from '../types';

export const productService = {
  async getCategories(): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categories');
    return data;
  },

  async getProductsByCategory(categoryId: number): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>(`/categories/${categoryId}/products`);
    return data;
  },

  async getProducts(params?: {
    categoriaId?: number;
    busca?: string;
    disponivel?: boolean;
  }): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>('/products', { params });
    return data;
  },

  async getProduct(id: number): Promise<Produto> {
    const { data } = await api.get<Produto>(`/products/${id}`);
    return data;
  },

  async getProductSizes(id: number): Promise<TamanhoProduto[]> {
    const { data } = await api.get<TamanhoProduto[]>(`/products/${id}/sizes`);
    return data;
  },

  async getProductReviews(id: number): Promise<Avaliacao[]> {
    const { data } = await api.get<Avaliacao[]>(`/products/${id}/reviews`);
    return data;
  },
};
