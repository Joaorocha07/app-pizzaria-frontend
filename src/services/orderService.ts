import { api } from './api';
import { Pedido, HistoricoStatusPedido, CriarPedidoPayload } from '../types';

export const orderService = {
  async createOrder(payload: CriarPedidoPayload): Promise<Pedido> {
    const { data } = await api.post<Pedido>('/orders', payload);
    return data;
  },

  async getMyOrders(): Promise<Pedido[]> {
    const { data } = await api.get<Pedido[]>('/orders/me');
    return data;
  },

  async getOrder(id: number): Promise<Pedido> {
    const { data } = await api.get<Pedido>(`/orders/${id}`);
    return data;
  },

  async getOrderHistory(id: number): Promise<HistoricoStatusPedido[]> {
    const { data } = await api.get<HistoricoStatusPedido[]>(`/orders/${id}/history`);
    return data;
  },

  async cancelOrder(id: number): Promise<void> {
    await api.put(`/orders/${id}/cancel`);
  },
};
