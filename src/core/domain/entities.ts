
export type ProductUnit = 'kg' | 'un';
export type StockMovementType = 'INBOUND' | 'SALE' | 'LOSS' | 'ADJUSTMENT' | 'RETURN';
export type WeighingStatus = 'GENERATED' | 'SOLD' | 'VOID';

export interface Store {
  id: string;
  name: string;
  slug: string;
  activeModules: {
    pos: boolean;
    inventory: boolean;
    loyalty: boolean;
  };
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  category: string;
  unit: ProductUnit;
  pricePerKg: number; // Armazenado em CENTAVOS para evitar erro de float
  tareWeight: number; // Em gramas
  
  // O estoque não é um campo editável, é derivado de movimentos
  currentStockGrams: number; 
  
  minStockThreshold: number; // Alerta
  isActive: boolean;
  imageUrl?: string;
  expirationDate?: Date;
}

export interface Weighing {
  id: string;
  storeId: string;
  productId: string;
  productName: string; // Desnormalizado para performance de leitura
  operatorId: string;
  
  weightGrams: number;
  priceSnapshot: number; // Preço do KG no momento da pesagem
  finalPrice: number;    // (weight / 1000) * priceSnapshot
  
  barcode: string; // Identificador único da etiqueta
  status: WeighingStatus;
  printedAt: Date;
}

export interface StockMovement {
  id: string;
  storeId: string;
  productId: string;
  type: StockMovementType;
  quantityGrams: number; // Positivo (entrada) ou Negativo (saída)
  reason?: string;
  referenceId?: string; // ID da Venda ou ID da Nota de Compra
  createdAt: Date;
  createdBy: string;
}

export interface Sale {
  id: string;
  storeId: string;
  totalAmount: number; // Em centavos
  status: 'COMPLETED' | 'CANCELED';
  items: SaleItem[];
  paymentMethod: 'CASH' | 'CARD' | 'PIX';
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number; // Gramas ou Unidades
  unitPrice: number;
  totalPrice: number;
  weighingId?: string; // Link para a etiqueta (obrigatório se for granel pesado na loja)
}
