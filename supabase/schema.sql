
-- Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Lojas
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL, -- Em prod: REFERENCES stores(id)
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    unit TEXT CHECK (unit IN ('kg', 'un')) DEFAULT 'kg',
    price_per_kg INTEGER NOT NULL, -- Centavos
    tare_weight INTEGER DEFAULT 0,
    min_stock_threshold INTEGER DEFAULT 1000, -- 1kg padrão
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, sku)
);

-- 3. Movimentações de Estoque (Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    product_id UUID REFERENCES products(id),
    type TEXT CHECK (type IN ('INBOUND', 'SALE', 'LOSS', 'ADJUSTMENT', 'RETURN')),
    quantity_grams INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Link com Auth Users
);

-- 4. Etiquetas (Weighings)
CREATE TABLE IF NOT EXISTS weighings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    product_id UUID REFERENCES products(id),
    operator_id UUID,
    
    weight_grams INTEGER NOT NULL,
    price_snapshot INTEGER NOT NULL,
    final_price INTEGER NOT NULL,
    
    barcode TEXT NOT NULL UNIQUE,
    status TEXT CHECK (status IN ('GENERATED', 'SOLD', 'VOID')) DEFAULT 'GENERATED',
    printed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vendas
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id),
    product_id UUID REFERENCES products(id),
    weighing_id UUID REFERENCES weighings(id), -- Opcional
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL
);

-- VIEW: Estoque Atual (Calculado)
CREATE OR REPLACE VIEW view_products_with_stock AS
SELECT 
    p.*,
    COALESCE(SUM(sm.quantity_grams), 0) as current_stock_grams
FROM products p
LEFT JOIN stock_movements sm ON p.id = sm.product_id
GROUP BY p.id;
