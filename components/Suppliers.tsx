
import React, { useState } from 'react';
import { Supplier } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (s: Supplier) => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, onAddSupplier }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const handleSave = () => {
    if (!form.name) return;
    onAddSupplier({
      id: Math.random().toString(36).substr(2, 9),
      companyId: '', 
      name: form.name!,
      cnpj: form.cnpj || '',
      email: form.email || '',
      phone: form.phone || '',
      category: form.category || 'Geral'
    } as Supplier);
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Gestão de Fornecedores</h2>
          <p className="text-stone-500 font-medium">Seu ecossistema de suprimentos em um só lugar.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3">
          <i className="fa-handshake"></i> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <i className="fa-truck text-6xl"></i>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{sup.category}</span>
            <h3 className="text-xl font-black text-stone-800 mt-4">{sup.name}</h3>
            <p className="text-xs font-bold text-stone-400 mb-6">{sup.cnpj}</p>
            
            <div className="space-y-3 pt-6 border-t border-stone-50">
               <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                  <i className="fa-phone w-4 text-emerald-500"></i> {sup.phone}
               </div>
               <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                  <i className="fa-envelope w-4 text-emerald-500"></i> {sup.email}
               </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in">
             <div className="p-8 bg-stone-900 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black">Adicionar Fornecedor</h3>
                <button onClick={() => setShowModal(false)}><i className="fa-times"></i></button>
             </div>
             <div className="p-10 space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Nome / Razão Social</label>
                   <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">CNPJ</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                        value={form.cnpj} 
                        onChange={e => setForm({...form, cnpj: e.target.value})} 
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Categoria</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})} 
                      />
                   </div>
                </div>
                <button onClick={handleSave} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100">CADASTRAR</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
