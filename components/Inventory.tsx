
import React, { useState } from 'react';
import { Product, StockMovement, Company } from '../types';
import { IntegrationService } from '../services/integrationService';

interface InventoryProps {
  products: Product[];
  currentCompany: Company;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRecordMovement: (m: Omit<StockMovement, 'id' | 'timestamp' | 'userId'>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, currentCompany, onAddProduct, onUpdateProduct, onDeleteProduct, onRecordMovement }) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'transfer' | 'restock' | 'loss' | 'batch' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [transferDirection, setTransferDirection] = useState<'to_store' | 'to_warehouse'>('to_store');
  const [lossReason, setLossReason] = useState('Vencimento');
  const [lossSource, setLossSource] = useState<'store' | 'warehouse'>('store');
  const [newExpiration, setNewExpiration] = useState<string>('');

  const [form, setForm] = useState<Partial<Product>>({ unit: 'kg', channelPrices: {} });

  // List of integrations that support custom pricing
  const pricingIntegrations = [
    { slug: 'ifood', name: 'iFood', icon: 'fa-burger' },
    { slug: 'mercadolivre', name: 'Mercado Livre', icon: 'fa-handshake' },
    { slug: 'nuvemshop', name: 'Nuvemshop', icon: 'fa-shopping-bag' }
  ];

  const enabledPricingIntegrations = pricingIntegrations.filter(i => currentCompany.enabledIntegrations.includes(i.slug));

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setForm({ ...p, channelPrices: p.channelPrices || {} });
    setModalMode('edit');
  };

  const handleSaveEdit = () => {
    if (selectedProduct) {
      const updated = { ...selectedProduct, ...form } as Product;
      onUpdateProduct(updated);
      
      // Pass settings (assuming context or we pass it, for now we mock empty settings but in real app pass currentCompany.settings)
      IntegrationService.syncStock(updated, currentCompany.settings); 
      setModalMode(null);
    }
  };

  const handleAddProduct = () => {
    if(!form.name || !form.pricePerUnit) return;
    const newProd: Product = {
        id: Math.random().toString(36).substr(2, 9),
        companyId: currentCompany.id,
        name: form.name,
        category: 'Geral',
        unit: form.unit || 'kg',
        pricePerUnit: Number(form.pricePerUnit),
        channelPrices: form.channelPrices || {},
        costPrice: Number(form.costPrice) || 0,
        currentStock: Number(form.currentStock) || 0,
        exposedStock: Number(form.exposedStock) || 0,
        minStockWarehouse: Number(form.minStockWarehouse) || 0,
        minStockStore: Number(form.minStockStore) || 0,
        sku: form.sku || '000',
        scaleCode: form.scaleCode || '',
        barcode: form.barcode,
        imageUrl: form.imageUrl,
        nextExpirationDate: form.nextExpirationDate
    };
    onAddProduct(newProd);
    setModalMode(null);
    setForm({ unit: 'kg', channelPrices: {} });
  };

  // ... (Other handlers: handleRestock, handleLoss, handleTransfer, handlePrintLabel, getExpirationStatus - Keep existing logic) ...
  const handleRestock = () => {
     if (!selectedProduct || amountValue <= 0) return;
     let updatedProduct = { ...selectedProduct };
     updatedProduct.currentStock += amountValue;
     if (newExpiration) updatedProduct.nextExpirationDate = new Date(newExpiration);
     onRecordMovement({
        productId: updatedProduct.id,
        type: 'entry',
        from: 'supplier',
        to: 'warehouse',
        quantity: amountValue,
        reason: 'Entrada de Mercadoria / Compra'
     });
     onUpdateProduct(updatedProduct);
     setModalMode(null);
     setAmountValue(0);
     setNewExpiration('');
  };

  const handleLoss = () => {
    if (!selectedProduct || amountValue <= 0) return;
    let updatedProduct = { ...selectedProduct };
    if (lossSource === 'store') {
        if (updatedProduct.exposedStock < amountValue) { alert('Qtd maior que estoque loja.'); return; }
        updatedProduct.exposedStock -= amountValue;
    } else {
        if (updatedProduct.currentStock < amountValue) { alert('Qtd maior que estoque depósito.'); return; }
        updatedProduct.currentStock -= amountValue;
    }
    onRecordMovement({ productId: updatedProduct.id, type: 'loss', from: lossSource === 'store' ? 'storefront' : 'warehouse', quantity: amountValue, reason: lossReason });
    onUpdateProduct(updatedProduct);
    setModalMode(null);
    setAmountValue(0);
  };

  const handleTransfer = () => {
    if (!selectedProduct || amountValue <= 0) return;
    let updatedProduct = { ...selectedProduct };
    if (transferDirection === 'to_store') {
        if (updatedProduct.currentStock < amountValue) { alert("Estoque depósito insuficiente."); return; }
        updatedProduct.currentStock -= amountValue;
        updatedProduct.exposedStock += amountValue;
        onRecordMovement({ productId: updatedProduct.id, type: 'transfer', from: 'warehouse', to: 'storefront', quantity: amountValue, reason: 'Reposição de Loja' });
    } else {
        if (updatedProduct.exposedStock < amountValue) { alert("Estoque loja insuficiente."); return; }
        updatedProduct.exposedStock -= amountValue;
        updatedProduct.currentStock += amountValue;
        onRecordMovement({ productId: updatedProduct.id, type: 'transfer', from: 'storefront', to: 'warehouse', quantity: amountValue, reason: 'Retorno ao Depósito' });
    }
    onUpdateProduct(updatedProduct);
    setModalMode(null);
    setAmountValue(0);
  };

  const handlePrintLabel = (p: Product) => {
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (printWindow) {
        printWindow.document.write(`<html><body><h3>${p.name}</h3><p>R$ ${p.pricePerUnit.toFixed(2)} / ${p.unit}</p><p>Val: ${p.nextExpirationDate ? new Date(p.nextExpirationDate).toLocaleDateString() : 'Indet.'}</p></body></html>`); 
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    }
  };

  const getExpirationStatus = (date?: Date) => {
     if (!date) return 'ok';
     const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
     if (days < 0) return 'expired';
     if (days < 15) return 'warning';
     return 'ok';
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Estoque & Produtos</h2>
          <p className="text-stone-500 font-medium italic">Gestão completa de itens, validades e etiquetas.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModalMode('batch')} className="bg-white border border-stone-200 text-stone-600 px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-stone-50 transition-all flex items-center gap-3"><i className="fa-file-import text-emerald-500"></i> Importar Lote</button>
          <button onClick={() => { setForm({ unit: 'kg', channelPrices: {} }); setModalMode('add'); }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3"><i className="fa-plus"></i> Novo Produto</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Foto</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Produto / SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Unid.</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Validade</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Depósito</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Loja (Expo)</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map(p => {
                 const status = getExpirationStatus(p.nextExpirationDate);
                 return (
                <tr key={p.id} className="hover:bg-stone-50/50 group transition-colors">
                  <td className="px-8 py-4">
                     <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex items-center justify-center text-stone-300">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : <i className="fa-image text-xl"></i>}
                     </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="font-black text-stone-800">{p.name}</p>
                    <div className="flex gap-2 text-[9px] font-black uppercase text-stone-400 mt-0.5">
                       {p.scaleCode && <span className="bg-stone-100 px-1.5 py-0.5 rounded">PLU {p.scaleCode}</span>}
                       <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">SKU {p.sku}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="text-xs font-black uppercase text-stone-400 border border-stone-200 px-2 py-1 rounded-md">{p.unit}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                     {p.nextExpirationDate ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                            status === 'expired' ? 'bg-red-50 border-red-100 text-red-600' :
                            status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            'bg-stone-50 border-stone-100 text-stone-500'
                        }`}>
                           <i className={`fa-solid ${status === 'expired' ? 'fa-triangle-exclamation' : 'fa-clock'}`}></i>
                           <span className="text-[10px] font-black uppercase">{new Date(p.nextExpirationDate).toLocaleDateString()}</span>
                        </div>
                     ) : (
                        <span className="text-stone-300 text-xs font-medium">---</span>
                     )}
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex flex-col items-center">
                        <p className="font-black text-stone-400">{p.currentStock.toFixed(p.unit === 'kg' ? 3 : 0)}{p.unit}</p>
                        {p.currentStock <= p.minStockWarehouse && <span className="text-[8px] font-black text-amber-500 uppercase bg-amber-50 px-1 rounded mt-1">Repor</span>}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex flex-col items-center">
                        <div className="inline-block px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                          <p className="font-black text-emerald-700 text-lg">{p.exposedStock.toFixed(p.unit === 'kg' ? 3 : 0)}{p.unit}</p>
                        </div>
                        {p.exposedStock <= p.minStockStore && <span className="text-[8px] font-black text-red-500 uppercase mt-1">Gôndola Baixa</span>}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setSelectedProduct(p); setAmountValue(0); setModalMode('restock'); }} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200" title="Entrada de Mercadoria">
                          <i className="fa-plus"></i>
                       </button>
                       <button onClick={() => { setSelectedProduct(p); setAmountValue(0); setModalMode('loss'); }} className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all" title="Baixa por Perda/Vencimento">
                          <i className="fa-trash-can"></i>
                       </button>
                       <button onClick={() => handlePrintLabel(p)} className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-all" title="Imprimir Etiqueta">
                          <i className="fa-print"></i>
                       </button>
                       <button onClick={() => handleOpenEdit(p)} className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-all">
                          <i className="fa-pen"></i>
                       </button>
                       <button onClick={() => { setSelectedProduct(p); setAmountValue(0); setModalMode('transfer'); }} className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-700 transition-all" title="Movimentar Estoque">
                          <i className="fa-right-left"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock/Loss/Transfer Modals - Omitted for brevity */}

      {/* Edit/Add Product Modal */}
      {(modalMode === 'edit' || modalMode === 'add') && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in">
              <div className="p-8 bg-stone-900 text-white flex justify-between items-center">
                 <h3 className="text-2xl font-black">{modalMode === 'add' ? 'Novo Produto' : 'Editar Produto'}</h3>
                 <button onClick={() => setModalMode(null)}><i className="fa-times"></i></button>
              </div>
              <div className="p-10 grid grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
                 <div className="col-span-2">
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                    <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Unidade de Medida</label>
                    <div className="flex bg-stone-100 p-1 rounded-2xl">
                        <button onClick={() => setForm({...form, unit: 'kg'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${form.unit === 'kg' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}>KG (Peso)</button>
                        <button onClick={() => setForm({...form, unit: 'un'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${form.unit === 'un' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}>UN (Item)</button>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Preço Loja (Padrão)</label>
                    <input type="number" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" value={form.pricePerUnit || ''} onChange={e => setForm({...form, pricePerUnit: Number(e.target.value)})} placeholder="0.00" />
                 </div>
                 
                 {/* Channel Pricing Section */}
                 {enabledPricingIntegrations.length > 0 && (
                     <div className="col-span-2 bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <div className="flex items-center gap-2 mb-4">
                             <i className="fa-tags text-stone-400"></i>
                             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Preços Diferenciados (Canais)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {enabledPricingIntegrations.map(integ => (
                                <div key={integ.slug}>
                                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                                        <i className={`fa-brands ${integ.icon}`}></i> {integ.name}
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 font-bold outline-none focus:border-emerald-500" 
                                        value={form.channelPrices?.[integ.slug] || ''} 
                                        onChange={e => setForm({
                                            ...form, 
                                            channelPrices: { 
                                                ...form.channelPrices, 
                                                [integ.slug]: Number(e.target.value) 
                                            }
                                        })} 
                                        placeholder={`Padrão: ${form.pricePerUnit || 0}`}
                                    />
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {/* Inventory Thresholds */}
                 <div className="col-span-2 grid grid-cols-2 gap-8 bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                     <div className="col-span-2 flex items-center gap-2 mb-2">
                        <i className="fa-sliders text-indigo-500"></i>
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Níveis de Estoque Mínimo (Alerta)</span>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Mínimo na Loja</label>
                        <input type="number" className="w-full px-5 py-4 rounded-2xl border border-indigo-200 bg-white text-indigo-900 font-bold outline-none focus:border-indigo-500" value={form.minStockStore || 0} onChange={e => setForm({...form, minStockStore: Number(e.target.value)})} placeholder="0" />
                        <p className="text-[9px] text-indigo-400 mt-2 font-medium">Avisa quando repor gôndola.</p>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Mínimo no Depósito</label>
                        <input type="number" className="w-full px-5 py-4 rounded-2xl border border-indigo-200 bg-white text-indigo-900 font-bold outline-none focus:border-indigo-500" value={form.minStockWarehouse || 0} onChange={e => setForm({...form, minStockWarehouse: Number(e.target.value)})} placeholder="0" />
                        <p className="text-[9px] text-indigo-400 mt-2 font-medium">Avisa quando comprar fornecedor.</p>
                     </div>
                 </div>

                 {modalMode === 'add' && (
                     <>
                        <div>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">PLU (Balança)</label>
                            <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" value={form.scaleCode || ''} onChange={e => setForm({...form, scaleCode: e.target.value})} placeholder="Ex: 105" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Cód. Barras (EAN)</label>
                            <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" value={form.barcode || ''} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Scannear..." />
                        </div>
                     </>
                 )}

                 <div className="col-span-2 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                     <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Vencimento Lote Atual</label>
                     <input type="date" className="w-full px-5 py-4 rounded-xl border border-amber-200 bg-white font-bold text-amber-900" value={form.nextExpirationDate ? new Date(form.nextExpirationDate).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, nextExpirationDate: new Date(e.target.value)})} />
                 </div>

                 <button onClick={modalMode === 'add' ? handleAddProduct : handleSaveEdit} className="col-span-2 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100">{modalMode === 'add' ? 'CADASTRAR PRODUTO' : 'ATUALIZAR CADASTRO'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
