
import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Product } from '../types';

interface PurchaseOrdersProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  onAddOrder: (o: PurchaseOrder) => void;
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ orders, suppliers, products, onAddOrder }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);

  const handleCreate = () => {
    if (!selectedSupplier || cart.length === 0) return;
    const newOrder: PurchaseOrder = {
      id: `PO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      companyId: '',
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      status: 'pending',
      items: cart.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        costPrice: i.product.costPrice || 0
      })),
      totalAmount: cart.reduce((acc, i) => acc + (i.quantity * (i.product.costPrice || 0)), 0),
      timestamp: new Date()
    };
    onAddOrder(newOrder);
    setShowModal(false);
    setCart([]);
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Pedidos de Compra</h2>
          <p className="text-stone-500 font-medium">Gestão de abastecimento e custos de entrada.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3">
          <i className="fa-file-circle-plus"></i> Novo Pedido
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead className="bg-stone-50">
              <tr>
                 <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase">Referência</th>
                 <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase">Fornecedor</th>
                 <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase">Status</th>
                 <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase">Total</th>
                 <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase text-right">Ações</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-stone-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-5 font-black text-stone-800">{o.id}</td>
                  <td className="px-8 py-5 font-bold text-xs text-stone-600">{o.supplierName}</td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                       o.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                     }`}>{o.status === 'pending' ? 'Pendente' : 'Recebido'}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-stone-900">R$ {o.totalAmount.toFixed(2)}</td>
                  <td className="px-8 py-5 text-right">
                     <button className="text-emerald-600 font-black text-[10px] uppercase hover:underline">Detalhes</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-stone-400 font-bold italic">Nenhum pedido de compra registrado.</td>
                </tr>
              )}
           </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in">
             <div className="p-8 bg-stone-900 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black">Novo Pedido de Compra</h3>
                <button onClick={() => setShowModal(false)}><i className="fa-times"></i></button>
             </div>
             <div className="p-10 space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Selecione o Fornecedor</label>
                   <select className="w-full px-5 py-4 rounded-2xl border border-stone-200 font-bold outline-none" onChange={e => setSelectedSupplier(suppliers.find(s => s.id === e.target.value) || null)}>
                      <option value="">Escolha um fornecedor...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Itens do Pedido</p>
                   <div className="max-h-64 overflow-y-auto space-y-2">
                      {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                           <span className="font-bold text-xs text-stone-700">{p.name}</span>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-stone-400 uppercase">Kg:</span>
                              <input type="number" className="w-20 px-3 py-2 rounded-lg border border-stone-200 font-bold text-xs" defaultValue={0} onChange={e => {
                                 const qty = Number(e.target.value);
                                 if (qty > 0) {
                                    setCart(prev => [...prev.filter(item => item.product.id !== p.id), {product: p, quantity: qty}]);
                                 } else {
                                    setCart(prev => prev.filter(item => item.product.id !== p.id));
                                 }
                              }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <button onClick={handleCreate} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100">GERAR PEDIDO</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
