import { api } from './api';
import { Produto, Pedido, Categoria, Borda, StatusPedido } from '../types';

export interface RelatorioVendas {
  totalPedidos: number;
  totalFaturamento: number;
  ticketMedio: number;
  pedidosPorStatus: Partial<Record<StatusPedido, number>>;
}

export interface RelatorioProduto {
  produtoId: number;
  nome: string;
  totalVendido: number;
  faturamento: number;
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

  async createCategory(payload: { nome: string; icone?: string; ordem: number; ativo?: boolean }): Promise<Categoria> {
    const { data } = await api.post<Categoria>('/admin/categories', payload);
    return data;
  },

  async updateCategory(id: number, payload: Partial<{ nome: string; icone: string; ordem: number; ativo: boolean }>): Promise<Categoria> {
    const { data } = await api.put<Categoria>(`/admin/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  // ─── Bordas ────────────────────────────────────────────────────────────────

  async createCrust(payload: { nome: string; preco: number }): Promise<Borda> {
    const { data } = await api.post<Borda>('/admin/crusts', payload);
    return data;
  },

  async updateCrust(id: number, payload: Partial<{ nome: string; preco: number }>): Promise<Borda> {
    const { data } = await api.put<Borda>(`/admin/crusts/${id}`, payload);
    return data;
  },

  async deleteCrust(id: number): Promise<void> {
    await api.delete(`/admin/crusts/${id}`);
  },

  // ─── Relatórios (ADMIN) ────────────────────────────────────────────────────

  async getSalesReport(params?: { de?: string; ate?: string }): Promise<RelatorioVendas> {
    const { data } = await api.get<RelatorioVendas>('/admin/reports/sales', { params });
    return data;
  },

  async getProductsReport(): Promise<RelatorioProduto[]> {
    const { data } = await api.get<RelatorioProduto[]>('/admin/reports/products');
    return data;
  },
};
