
import { Product, FinancialTransaction, User, Customer, Company } from './types';

// Added missing email property to satisfy User interface
export const INITIAL_USERS: User[] = [
  { id: 'u1', companyId: 'comp_1', name: 'Ricardo Admin', role: 'ADMIN', email: 'ricardo@naturascale.com' },
  { id: 'u2', companyId: 'comp_1', name: 'Ana Gerente', role: 'MANAGER', email: 'ana@naturascale.com' },
  { id: 'u3', companyId: 'comp_1', name: 'João Caixa', role: 'CASHIER', email: 'joao@naturascale.com' },
];

// Added companyId: 'comp_1' to all initial customers to satisfy Customer interface
export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', companyId: 'comp_1', name: 'Maria Silva', cpf: '123.456.789-00', email: 'maria@email.com', phone: '(11) 98888-7777', points: 150 },
  { id: 'c2', companyId: 'comp_1', name: 'José Santos', cpf: '987.654.321-11', email: 'jose@email.com', phone: '(11) 97777-6666', points: 45 },
];

// Updated to include split min stocks
export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', companyId: 'comp_1', name: 'Castanha do Pará Inteira', category: 'Oleaginosas', unit: 'kg', pricePerUnit: 85.00, currentStock: 12.5, exposedStock: 2.5, minStockWarehouse: 10, minStockStore: 2, sku: 'CP-001', scaleCode: '101', barcode: '200010100000' },
  { id: '2', companyId: 'comp_1', name: 'Granola Artesanal', category: 'Cereais', unit: 'kg', pricePerUnit: 32.50, currentStock: 8.0, exposedStock: 2.0, minStockWarehouse: 15, minStockStore: 3, sku: 'GR-002', scaleCode: '102', barcode: '200010200000' },
  { id: '3', companyId: 'comp_1', name: 'Chá de Hibisco', category: 'Chás', unit: 'kg', pricePerUnit: 45.00, currentStock: 2.1, exposedStock: 0.5, minStockWarehouse: 5, minStockStore: 1, sku: 'CH-003', scaleCode: '103', barcode: '200010300000' },
  { id: '4', companyId: 'comp_1', name: 'Barra de Cereal Nutry', category: 'Snacks', unit: 'un', pricePerUnit: 4.50, currentStock: 48, exposedStock: 12, minStockWarehouse: 50, minStockStore: 10, sku: 'BC-004', scaleCode: '', barcode: '789123456789' },
  { id: '5', companyId: 'comp_1', name: 'Mel Orgânico 500g', category: 'Adoçantes', unit: 'un', pricePerUnit: 35.00, currentStock: 20, exposedStock: 10, minStockWarehouse: 10, minStockStore: 5, sku: 'MO-005', scaleCode: '', barcode: '789987654321' },
];

// Added companyId: 'comp_1' to all initial transactions to satisfy FinancialTransaction interface
export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  { id: 't1', companyId: 'comp_1', type: 'expense', category: 'Fornecedores', description: 'Compra de Oleaginosas', amount: 1200.00, timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: 't2', companyId: 'comp_1', type: 'income', category: 'Vendas', description: 'Venda PDV - 25/10', amount: 450.00, timestamp: new Date(Date.now() - 86400000 * 1) },
  { id: 't3', companyId: 'comp_1', type: 'expense', category: 'Aluguel', description: 'Aluguel Mensal', amount: 2500.00, timestamp: new Date(Date.now() - 3600000 * 5) },
];
