import { api } from './api';

type Folder = 'products' | 'banners' | 'categories';

function getMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

export const uploadService = {
  async uploadImage(localUri: string, folder: Folder = 'products'): Promise<string> {
    const filename = localUri.split('/').pop() ?? `image_${Date.now()}.jpg`;
    const mimeType = getMimeType(localUri);

    const formData = new FormData();
    formData.append('file', { uri: localUri, name: filename, type: mimeType } as any);
    formData.append('folder', folder);

    const { data } = await api.post<{ url: string }>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.url;
  },
};
