import React, { useState } from 'react';
import { FinancialTransaction } from '../types';

interface FinanceProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (t: FinancialTransaction) => void;
}

const Finance: React.FC<FinanceProps> = ({ transactions, onAddTransaction }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FinancialTransaction>>({ type: 'expense', amount: 0, description: '', category: '' });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const handleSave = () => {
    if (!form.amount || !form.description) return;
    // Added companyId to fix missing property error; it will be correctly assigned in App.tsx
    const newT: FinancialTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: '', 
      type: form.type as 'income' | 'expense',
      category: form.category || 'Outros',
      description: form.description!,
      amount: Number(form.amount),
      timestamp: new Date()
    };
    onAddTransaction(newT);
    setShowForm(false);
    setForm({ type: 'expense', amount: 0, description: '', category: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Fluxo Financeiro</h2>
          <p className="text-stone-500">Gestão de entradas e saídas de caixa.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
        >
          <i className="fa-plus"></i> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Entradas</p>
          <p className="text-3xl font-black text-emerald-900 leading-none">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Saídas</p>
          <p className="text-3xl font-black text-red-900 leading-none">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
          <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-1">Saldo Atual</p>
          <p className="text-3xl font-black text-sky-900 leading-none">R$ {(totalIncome - totalExpense).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50">
          <h3 className="font-bold text-stone-700">Histórico Recente</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {transactions.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(t => (
            <div key={t.id} className="flex items-center p-4 hover:bg-stone-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <i className={`fa-solid ${t.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-800">{t.description}</p>
                <div className="flex gap-2 text-xs text-stone-400 font-medium">
                  <span>{t.timestamp.toLocaleDateString()} {t.timestamp.toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{t.category}</span>
                </div>
              </div>
              <div className={`font-black text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-6 bg-emerald-900 text-white flex justify-between">
              <h3 className="text-xl font-bold">Novo Lançamento</h3>
              <button onClick={() => setShowForm(false)}><i className="fa-times"></i></button>
            </div>
            <div className="p-8 space-y-4">
               <div>
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Tipo de Transação</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setForm({...form, type: 'income'})}
                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${form.type === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-400 border-stone-200'}`}
                  >Entrada</button>
                  <button 
                    onClick={() => setForm({...form, type: 'expense'})}
                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${form.type === 'expense' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-stone-400 border-stone-200'}`}
                  >Saída</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Descrição</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Categoria</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Valor (R$)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all text-lg"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: Number(e.target.value)})}
                />
              </div>
              <button onClick={handleSave} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all">SALVAR REGISTRO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;