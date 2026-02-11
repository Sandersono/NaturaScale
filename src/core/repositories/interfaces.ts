
import { Product, StockMovement, Weighing, Sale } from '../domain/entities';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
  listLowStock(): Promise<Product[]>;
}

export interface IStockRepository {
  addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<void>;
  getCurrentStock(productId: string): Promise<number>;
}

export interface IWeighingRepository {
  create(weighing: Omit<Weighing, 'id' | 'status' | 'printedAt'>): Promise<Weighing>;
  findByBarcode(barcode: string): Promise<Weighing | null>;
  markAsSold(id: string): Promise<void>;
  voidLabel(id: string): Promise<void>;
}

export interface ISaleRepository {
  processSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<string>; // Retorna ID da venda
  getDailyTotal(date: Date): Promise<number>;
}
