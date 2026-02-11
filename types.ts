
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface Plan {
  id: string;
  name: string;
  price: number;
  maxUsers: number;
  maxProducts: number;
  maxIntegrations: number;
  features: string[]; // ['pos', 'finance', 'inventory', 'api', 'loyalty', 'purchase_orders']
}

export interface Integration {
  id: string;
  name: string;
  slug: string; 
  icon: string;
  description: string;
  category: 'delivery' | 'marketplace' | 'erp' | 'marketing' | 'payment' | 'ecommerce';
}

export interface Company {
  id: string;
  subdomain: string;
  name: string;
  cnpj: string;
  mainEmail: string; // E-mail principal para comunicações e recuperação
  planId: string;
  status: 'active' | 'suspended' | 'trial';
  enabledIntegrations: string[];
  activeModules: {
    inventory: boolean;
    finance: boolean;
    loyalty: boolean;
    aiInsights: boolean;
    multiStock: boolean;
    pos: boolean;
    purchaseOrders: boolean;
  };
  aiConfig: {
    provider: 'gemini' | 'openai';
    apiKey?: string;
    modelName?: string;
  };
  databaseConfig: {
    provider: 'supabase' | 'postgres' | 'local';
    url: string;
    apiKey?: string;
    lastBackup?: Date;
  };
  settings: StoreSettings;
}

export interface StoreSettings {
  loyaltyEnabled: boolean;
  loyaltyName: string;
  loyaltySpendThreshold: number; 
  loyaltyPointValue: number;     
  redemptionType: 'points' | 'currency'; 
  currencySymbol: string;
  salesChannels: string[];
  
  // Integration Keys
  asaasApiKey?: string;
  nuvemshopToken?: string;
  nuvemshopUserId?: string;
  mercadolivreToken?: string;
  ifoodMerchantId?: string;
  tinyErpToken?: string;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  webhookUrl?: string;
}

export interface User {
  id: string;
  companyId: string | 'global';
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Simulação de hash
  recoveryEmail?: string;
  avatar?: string;
  permissions?: string[]; // Permissões granulares se necessário
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  category: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  status: 'pending' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  timestamp: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  points: number;
}

export type ProductUnit = 'kg' | 'un';

export interface Product {
  id: string;
  companyId: string;
  name: string;
  category: string;
  unit: ProductUnit; 
  pricePerUnit: number; // Preço Base (Loja Física)
  channelPrices?: {     // Preços Específicos por Canal (ex: {'ifood': 45.00})
    [key: string]: number;
  };
  costPrice?: number;
  
  // Stock Levels
  currentStock: number; // Warehouse (Depósito)
  exposedStock: number; // Storefront (Loja)
  
  // Split Thresholds
  minStockWarehouse: number; // Alerta de Compra
  minStockStore: number;     // Alerta de Reposição de Gôndola
  
  sku: string;
  scaleCode: string;
  barcode?: string;
  imageUrl?: string;
  nextExpirationDate?: Date; 
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
  userName: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'transfer' | 'loss' | 'entry';
  from: 'warehouse' | 'storefront' | 'supplier';
  to?: 'warehouse' | 'storefront';
  quantity: number;
  reason: string;
  timestamp: Date;
  userId: string;
}

export type DocumentType = 'CUPOM' | 'NFE';

export interface Sale {
  id: string;
  companyId: string;
  timestamp: Date;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'pix';
  documentType: DocumentType;
  customerId?: string;
  nfCpf?: string; // CPF for Invoice (NF Paulista)
  sellerId: string;
  origin: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  unit: ProductUnit;
}

export interface FinancialTransaction {
  id: string;
  companyId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  timestamp: Date;
}
