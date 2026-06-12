interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface CepData {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export async function searchCep(cep: string): Promise<CepData> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) throw new Error('CEP inválido');

  const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!response.ok) throw new Error('Erro ao buscar CEP');

  const data: ViaCepResponse = await response.json();
  if (data.erro) throw new Error('CEP não encontrado');

  return {
    rua: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
  };
}
