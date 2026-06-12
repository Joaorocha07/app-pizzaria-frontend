import { api } from './api';
import { Banner, Cupom, Borda } from '../types';

export const marketingService = {
  async getBanners(): Promise<Banner[]> {
    const { data } = await api.get<Banner[]>('/banners');
    return data;
  },

  async validateCoupon(codigo: string): Promise<Cupom> {
    const { data } = await api.get<Cupom>(`/coupons/${codigo}`);
    return data;
  },

  async getCrusts(): Promise<Borda[]> {
    const { data } = await api.get<Borda[]>('/crusts');
    return data;
  },

  async createReview(payload: {
    pedidoId?: number;
    produtoId?: number;
    nota: number;
    comentario?: string;
  }): Promise<void> {
    await api.post('/reviews', payload);
  },
};
