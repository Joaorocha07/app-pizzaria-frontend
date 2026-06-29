import React, { createContext, useContext, useState, useCallback } from 'react';
import { ItemCarrinho, Produto, TamanhoProduto, Borda, Cupom } from '../types';

interface CartContextData {
  itens: ItemCarrinho[];
  cupom: Cupom | null;
  subtotal: number;
  desconto: number;
  total: number;
  totalItens: number;
  addItem: (produto: Produto, quantidade: number, tamanho?: TamanhoProduto, borda?: Borda) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantidade: number) => void;
  clearCart: () => void;
  applyCoupon: (cupom: Cupom) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

function calcPrecoUnitario(produto: Produto, tamanho?: TamanhoProduto, borda?: Borda): number {
  const base = tamanho ? produto.preco * tamanho.fatorPreco : produto.preco;
  return base + (borda?.preco ?? 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [cupom, setCupom] = useState<Cupom | null>(null);

  const subtotal = itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);

  const desconto = (() => {
    if (!cupom) return 0;
    if (cupom.tipoDesconto === 'PERCENTUAL') return subtotal * (cupom.valorDesconto / 100);
    return Math.min(cupom.valorDesconto, subtotal);
  })();

  const total = Math.max(subtotal - desconto, 0);
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  const addItem = useCallback(
    (produto: Produto, quantidade: number, tamanho?: TamanhoProduto, borda?: Borda) => {
      const precoUnitario = calcPrecoUnitario(produto, tamanho, borda);
      setItens((prev) => {
        const existingIndex = prev.findIndex(
          (i) =>
            i.produto.id === produto.id &&
            i.tamanho?.id === tamanho?.id &&
            i.borda?.id === borda?.id,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantidade: updated[existingIndex].quantidade + quantidade,
          };
          return updated;
        }
        return [...prev, { produto, tamanho, borda, quantidade, precoUnitario }];
      });
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantidade: number) => {
    if (quantidade <= 0) {
      setItens((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setItens((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantidade };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItens([]);
    setCupom(null);
  }, []);

  const applyCoupon = useCallback((c: Cupom) => setCupom(c), []);
  const removeCoupon = useCallback(() => setCupom(null), []);

  return (
    <CartContext.Provider
      value={{
        itens,
        cupom,
        subtotal,
        desconto,
        total,
        totalItens,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
