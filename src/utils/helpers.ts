export function formatOrderId(id: number): string {
  return `#${String(id).padStart(6, '0')}`;
}

export function formatCurrency(value: number): string {
  /* Formatação manual: Hermes no Android pode vir sem dados de Intl,
     fazendo toLocaleString degradar para "49.9" silenciosamente. */
  const fixed = Number(value).toFixed(2).replace('.', ',');
  const comMilhar = fixed.replace(/\B(?=(\d{3})+(?=,))/g, '.');
  return `R$ ${comMilhar}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatCep(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cep;
}
