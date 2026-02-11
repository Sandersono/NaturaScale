
import React from 'react';
import { Sale } from '../types';

interface OrdersProps {
  sales: Sale[];
}

const Orders: React.FC<OrdersProps> = ({ sales }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-stone-800">Histórico de Pedidos</h2>
          <p className="text-stone-500">Acompanhamento de vendas e documentos fiscais.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">ID Pedido</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Data/Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Pagamento</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Valor Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sales.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(sale => (
                <tr key={sale.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-stone-800">#{sale.id}</td>
                  <td className="px-6 py-4 text-xs font-medium text-stone-500">
                    {sale.timestamp.toLocaleDateString()} {sale.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black border ${
                      sale.documentType === 'NFE' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}>
                      {sale.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black text-stone-600 uppercase">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-700">
                    R$ {sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-2 ml-auto">
                      <i className="fa-print"></i> Re-imprimir
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400 italic">Nenhum pedido realizado hoje.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
