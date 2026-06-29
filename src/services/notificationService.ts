import { api } from './api';
import { Notificacao } from '../types';

export const notificationService = {
  async getMyNotifications(): Promise<Notificacao[]> {
    const { data } = await api.get<Notificacao[]>('/notifications/me');
    return data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
};
