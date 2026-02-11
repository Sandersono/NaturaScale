import { IProductRepository } from '../../core/repositories/interfaces';
import { Product } from '../../core/domain/entities';
import { supabase } from '../supabase/client';

export class SupabaseProductRepository implements IProductRepository {
  
  // Mapeia do formato do banco (snake_case) para domínio (camelCase)
  private mapToDomain(row: any): Product {
    return {
      id: row.id,
      storeId: row.store_id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      unit: row.unit,
      pricePerKg: row.price_per_kg,
      tareWeight: row.tare_weight,
      currentStockGrams: row.current_stock_grams || 0, // Vem de uma View
      minStockThreshold: row.min_stock_threshold,
      isActive: row.is_active,
      imageUrl: row.image_url,
      expirationDate: row.expiration_date ? new Date(row.expiration_date) : undefined
    };
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('view_products_with_stock') // Usamos uma View que já calcula o estoque
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('view_products_with_stock')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('view_products_with_stock')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(50);

    if (error) throw error;
    return (data || []).map(row => this.mapToDomain(row));
  }

  async listLowStock(): Promise<Product[]> {
    // Busca produtos onde estoque atual <= minimo
    // Nota: Comparação entre colunas não é suportada nativamente no client sem RPC/Computed Column
    const { data, error } = await supabase
      .from('view_products_with_stock')
      .select('*');

    if (error) throw error;
    
    // Filtragem em memória como fallback para a falta de suporte a comparação de colunas no filtro
    return (data || [])
      .map(row => this.mapToDomain(row))
      .filter(p => p.currentStockGrams <= p.minStockThreshold);
  }

  async save(product: Product): Promise<void> {
    // Salvamos apenas os dados cadastrais, estoque é via Movimentação
    const payload = {
      store_id: product.storeId,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      price_per_kg: product.pricePerKg,
      tare_weight: product.tareWeight,
      min_stock_threshold: product.minStockThreshold,
      is_active: product.isActive,
      image_url: product.imageUrl,
      expiration_date: product.expirationDate?.toISOString()
    };

    if (product.id) {
      await supabase.from('products').update(payload).eq('id', product.id);
    } else {
      await supabase.from('products').insert(payload);
    }
  }
}