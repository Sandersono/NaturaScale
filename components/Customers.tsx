
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAddCustomer }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({ name: '', cpf: '', email: '', phone: '' });

  const handleSave = () => {
    if (!form.name || !form.cpf) return;
    // Added companyId to satisfy Customer type requirements; it will be correctly assigned in App.tsx
    onAddCustomer({
      id: Math.random().toString(36).substr(2, 9),
      companyId: '', 
      name: form.name!,
      cpf: form.cpf!,
      email: form.email || '',
      phone: form.phone || '',
      points: 0
    });
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Base de Clientes</h2>
          <p className="text-stone-500">Gestão de fidelidade e cadastros.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3"
        >
          <i className="fa-user-plus"></i> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex items-start gap-4 relative">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold flex-shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-800 truncate pr-4">{customer.name}</h3>
                <p className="text-xs font-medium text-stone-400 mb-2">{customer.cpf}</p>
                <div className="space-y-1">
                  <p className="text-xs text-stone-600 flex items-center gap-2">
                    <i className="fa-phone text-emerald-500 w-3 text-center"></i> {customer.phone}
                  </p>
                  <p className="text-xs text-stone-600 flex items-center gap-2 truncate">
                    <i className="fa-envelope text-emerald-500 w-3 text-center"></i> {customer.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Saldo Fidelidade</p>
                <p className="text-lg font-black text-emerald-600">{customer.points} <span className="text-xs font-bold text-stone-400">PTS</span></p>
              </div>
              <button className="p-2 text-stone-400 hover:text-emerald-500 transition-colors"><i className="fa-pen-to-square"></i></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-emerald-900 text-white flex justify-between items-center">
               <div>
                  <h3 className="text-2xl font-black">Cadastrar Cliente</h3>
                  <p className="text-emerald-400 text-xs uppercase font-bold tracking-widest mt-1">Identificação e Contato</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center hover:bg-emerald-700 transition-colors">
                  <i className="fa-times"></i>
               </button>
            </div>
            <div className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ex: Maria das Dores Silva"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">CPF</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                    value={form.cpf}
                    onChange={e => setForm({...form, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Telefone</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>
              <button 
                onClick={handleSave} 
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                <i className="fa-check-circle"></i> CONCLUIR CADASTRO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
