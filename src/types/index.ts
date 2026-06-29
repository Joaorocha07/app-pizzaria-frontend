export type PapelUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMIN';

export type StatusPedido =
  | 'PENDENTE'
  | 'PREPARANDO'
  | 'ENTREGANDO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type MetodoPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO';

export type TipoDesconto = 'PERCENTUAL' | 'FIXO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  papel: PapelUsuario;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Endereco {
  id: number;
  usuarioId: number;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  icone?: string;
  urlImagem?: string;
  ordem: number;
  ativo: boolean;
}

export interface Produto {
  id: number;
  categoriaId: number;
  nome: string;
  descricao?: string;
  urlImagem?: string;
  preco: number;
  disponivel: boolean;
  categoria?: Categoria;
}

export interface TamanhoProduto {
  id: number;
  produtoId: number;
  nome: string;
  fatorPreco: number;
}

export interface Borda {
  id: number;
  nome: string;
  preco: number;
  urlImagem?: string;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  enderecoId: number;
  status: StatusPedido;
  total: number;
  metodoPagamento: MetodoPagamento;
  cupomId?: number | null;
  criadoEm: string;
}

export interface ItemPedido {
  produtoId: number;
  tamanhoProdutoId?: number | null;
  bordaId?: number | null;
  quantidade: number;
  preco: number;
}

export interface HistoricoStatusPedido {
  id: number;
  status: StatusPedido;
  registradoEm: string;
}

export interface Cupom {
  id: number;
  codigo: string;
  valorDesconto: number;
  tipoDesconto: TipoDesconto;
  validoDe: string;
  validoAte: string;
  ativo: boolean;
  limiteUso?: number | null;
}

export interface Banner {
  id: number;
  titulo: string;
  urlImagem: string;
  urlLink?: string | null;
  ativo: boolean;
}

export interface Avaliacao {
  id: number;
  usuarioId: number;
  pedidoId?: number | null;
  produtoId?: number | null;
  nota: number;
  comentario?: string | null;
  criadoEm: string;
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

export interface ConfiguracaoLoja {
  id: number;
  chave: string;
  valor: string;
  descricao?: string | null;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface ItemCarrinho {
  produto: Produto;
  tamanho?: TamanhoProduto;
  borda?: Borda;
  quantidade: number;
  precoUnitario: number;
}

export interface CriarPedidoPayload {
  enderecoId: number;
  metodoPagamento: MetodoPagamento;
  codigoCupom?: string;
  itens: ItemPedido[];
}
