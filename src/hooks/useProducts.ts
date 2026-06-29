import { useState, useEffect } from 'react';
import { Produto, Categoria } from '../types';
import { productService } from '../services/productService';

export function useProducts(params?: { categoriaId?: number; busca?: string }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService
      .getProducts({ ...params, disponivel: true })
      .then((data) => { if (!cancelled) setProdutos(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.categoriaId, params?.busca]);

  return { produtos, loading, error };
}

export function useCategories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService
      .getCategories()
      .then(setCategorias)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { categorias, loading, error };
}

export function useProduct(id: number) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    productService
      .getProduct(id)
      .then(setProduto)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { produto, loading, error };
}
