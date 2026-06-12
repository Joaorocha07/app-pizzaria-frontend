import { api } from './api';
import { Usuario, Endereco } from '../types';

export const userService = {
  async getMe(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/users/me');
    return data;
  },

  async updateMe(payload: { nome?: string; telefone?: string }): Promise<Usuario> {
    const { data } = await api.put<Usuario>('/users/me', payload);
    return data;
  },

  async changePassword(senhaAtual: string, novaSenha: string): Promise<void> {
    await api.put('/users/me/password', { senhaAtual, novaSenha });
  },

  async getAddresses(): Promise<Endereco[]> {
    const { data } = await api.get<Endereco[]>('/users/me/addresses');
    return data;
  },

  async createAddress(payload: Omit<Endereco, 'id' | 'usuarioId' | 'criadoEm'>): Promise<Endereco> {
    const { data } = await api.post<Endereco>('/users/me/addresses', payload);
    return data;
  },

  async updateAddress(
    id: number,
    payload: Partial<Omit<Endereco, 'id' | 'usuarioId' | 'criadoEm'>>,
  ): Promise<Endereco> {
    const { data } = await api.put<Endereco>(`/users/me/addresses/${id}`, payload);
    return data;
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/users/me/addresses/${id}`);
  },
};
