import { api } from './api';
import { Produto, Pedido, Categoria, Borda, Cupom, Banner, ConfiguracaoLoja, StatusPedido } from '../types';

export interface RelatorioVendas {
  totalPedidos: number;
  receita: number;
  porStatus: { status: StatusPedido; quantidade: number }[];
}

export interface RelatorioProduto {
  produto: { id: number; nome: string; preco: number };
  quantidade: number;
}

export const adminService = {
  // ─── Pedidos ───────────────────────────────────────────────────────────────

  async getOrders(params?: { status?: StatusPedido; data?: string }): Promise<Pedido[]> {
    const { data } = await api.get<Pedido[]>('/admin/orders', { params });
    return data;
  },

  async getOrderById(id: number): Promise<Pedido> {
    const { data } = await api.get<Pedido>(`/admin/orders/${id}`);
    return data;
  },

  async updateOrderStatus(id: number, status: StatusPedido): Promise<void> {
    await api.put(`/admin/orders/${id}/status`, { status });
  },

  // ─── Produtos ──────────────────────────────────────────────────────────────

  async createProduct(payload: {
    categoriaId: number;
    nome: string;
    descricao?: string;
    urlImagem?: string;
    preco: number;
    disponivel?: boolean;
  }): Promise<Produto> {
    const { data } = await api.post<Produto>('/admin/products', payload);
    return data;
  },

  async updateProduct(
    id: number,
    payload: Partial<{
      categoriaId: number;
      nome: string;
      descricao: string;
      urlImagem: string;
      preco: number;
      disponivel: boolean;
    }>,
  ): Promise<Produto> {
    const { data } = await api.put<Produto>(`/admin/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  // ─── Categorias ────────────────────────────────────────────────────────────

  async createCategory(payload: { nome: string; icone?: string; urlImagem?: string; ordem: number; ativo?: boolean }): Promise<Categoria> {
    const { data } = await api.post<Categoria>('/admin/categories', payload);
    return data;
  },

  async updateCategory(id: number, payload: Partial<{ nome: string; icone: string; urlImagem: string; ordem: number; ativo: boolean }>): Promise<Categoria> {
    const { data } = await api.put<Categoria>(`/admin/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  // ─── Bordas ────────────────────────────────────────────────────────────────

  async createCrust(payload: { nome: string; preco: number; urlImagem?: string }): Promise<Borda> {
    const { data } = await api.post<Borda>('/admin/crusts', payload);
    return data;
  },

  async updateCrust(id: number, payload: Partial<{ nome: string; preco: number; urlImagem: string }>): Promise<Borda> {
    const { data } = await api.put<Borda>(`/admin/crusts/${id}`, payload);
    return data;
  },

  async deleteCrust(id: number): Promise<void> {
    await api.delete(`/admin/crusts/${id}`);
  },

  // ─── Cupons ────────────────────────────────────────────────────────────────

  async getCoupons(): Promise<Cupom[]> {
    const { data } = await api.get<Cupom[]>('/admin/coupons');
    return data;
  },

  async createCoupon(payload: {
    codigo: string;
    valorDesconto: number;
    tipoDesconto: 'PERCENTUAL' | 'FIXO';
    validoDe: string;
    validoAte: string;
    ativo?: boolean;
    limiteUso?: number;
  }): Promise<Cupom> {
    const { data } = await api.post<Cupom>('/admin/coupons', payload);
    return data;
  },

  async updateCoupon(
    id: number,
    payload: Partial<{
      codigo: string;
      valorDesconto: number;
      tipoDesconto: 'PERCENTUAL' | 'FIXO';
      validoDe: string;
      validoAte: string;
      ativo: boolean;
      limiteUso: number;
    }>,
  ): Promise<Cupom> {
    const { data } = await api.put<Cupom>(`/admin/coupons/${id}`, payload);
    return data;
  },

  async deleteCoupon(id: number): Promise<void> {
    await api.delete(`/admin/coupons/${id}`);
  },

  // ─── Banners ───────────────────────────────────────────────────────────────

  async createBanner(payload: { titulo: string; urlImagem: string; urlLink?: string; ativo?: boolean }): Promise<Banner> {
    const { data } = await api.post<Banner>('/admin/banners', payload);
    return data;
  },

  async updateBanner(
    id: number,
    payload: Partial<{ titulo: string; urlImagem: string; urlLink: string; ativo: boolean }>,
  ): Promise<Banner> {
    const { data } = await api.put<Banner>(`/admin/banners/${id}`, payload);
    return data;
  },

  async deleteBanner(id: number): Promise<void> {
    await api.delete(`/admin/banners/${id}`);
  },

  // ─── Configurações ─────────────────────────────────────────────────────────

  async getConfig(): Promise<ConfiguracaoLoja[]> {
    const { data } = await api.get<ConfiguracaoLoja[]>('/admin/config');
    return data;
  },

  async updateConfig(payload: { chave: string; valor: string; descricao?: string }): Promise<ConfiguracaoLoja> {
    const { data } = await api.put<ConfiguracaoLoja>('/admin/config', payload);
    return data;
  },

  // ─── Relatórios ────────────────────────────────────────────────────────────

  async getSalesReport(params?: { de?: string; ate?: string }): Promise<RelatorioVendas> {
    const { data } = await api.get<RelatorioVendas>('/admin/reports/sales', { params });
    return data;
  },

  async getProductsReport(): Promise<RelatorioProduto[]> {
    const { data } = await api.get<RelatorioProduto[]>('/admin/reports/products');
    return data;
  },
};
