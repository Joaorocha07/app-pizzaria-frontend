import { Endereco } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Pedidos: undefined;
  AdminPedidos: undefined;
  AdminProdutos: undefined;
  AdminRelatorios: undefined;
  AdminGerenciar: undefined;
  Perfil: undefined;
};

export type AppStackParamList = {
  MainTabs: { screen?: keyof AppTabParamList };
  ProductDetails: { productId: number };
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: number };
  EditProfile: undefined;
  ChangePassword: undefined;
  Addresses: undefined;
  AddressForm: { address?: Endereco };
  Notificacoes: undefined;
  Review: { orderId?: number; productId?: number };
  AdminProductForm: { productId?: number };
  AdminCategories: undefined;
  AdminCategoryForm: { categoryId?: number };
  AdminCrusts: undefined;
  AdminCrustForm: { crustId?: number };
  AdminCoupons: undefined;
  AdminCouponForm: { couponId?: number };
  AdminBanners: undefined;
  AdminBannerForm: { bannerId?: number };
  AdminStoreConfig: undefined;
};
