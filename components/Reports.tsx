
import React, { useMemo } from 'react';
import { Sale, Customer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface ReportsProps {
  sales: Sale[];
  customers: Customer[];
}

const Reports: React.FC<ReportsProps> = ({ sales, customers }) => {
  
  // 1. Sales by Channel
  const salesByChannel = useMemo(() => {
    const data: Record<string, number> = {};
    sales.forEach(sale => {
      const channel = sale.origin || 'Balcão';
      data[channel] = (data[channel] || 0) + sale.totalAmount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [sales]);

  // 2. Churn Risk (Customers who haven't bought in 21+ days)
  const churnRiskCustomers = useMemo(() => {
    const riskDays = 21;
    const now = new Date();
    const riskDate = new Date(now.setDate(now.getDate() - riskDays));

    // Find last purchase date for each customer
    const lastPurchaseMap: Record<string, Date> = {};
    sales.forEach(sale => {
      if (sale.customerId) {
        const saleDate = new Date(sale.timestamp);
        if (!lastPurchaseMap[sale.customerId] || saleDate > lastPurchaseMap[sale.customerId]) {
          lastPurchaseMap[sale.customerId] = saleDate;
        }
      }
    });

    return customers
      .map(c => ({
        ...c,
        lastPurchase: lastPurchaseMap[c.id] || null
      }))
      .filter(c => {
        // If never bought or bought before risk date
        if (!c.lastPurchase) return true; 
        return c.lastPurchase < riskDate;
      });
  }, [sales, customers]);

  const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Relatórios Gerenciais</h2>
        <p className="text-stone-500 font-medium">Análise de canais e retenção de clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales by Channel Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
          <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">
            <i className="fa-bullseye text-emerald-600"></i> Vendas por Canal
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={salesByChannel}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByChannel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
               </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
             {salesByChannel.map((ch, idx) => (
               <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-500">{ch.name}</span>
                  <span className="text-sm font-black text-stone-800">R$ {ch.value.toFixed(2)}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Churn Risk List */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
               <i className="fa-user-clock text-amber-500"></i> Risco de Churn (21+ dias)
            </h3>
            <p className="text-xs text-stone-400 mt-1 font-medium">Clientes inativos que precisam de atenção.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-96">
             {churnRiskCustomers.length > 0 ? (
               churnRiskCustomers.map(c => {
                 const daysInactive = c.lastPurchase 
                    ? Math.floor((new Date().getTime() - new Date(c.lastPurchase).getTime()) / (1000 * 3600 * 24))
                    : 'Nunca comprou';
                 
                 return (
                   <div key={c.id} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100 hover:bg-amber-50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold border border-amber-100 shadow-sm">
                            {c.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-stone-800 text-sm">{c.name}</p>
                            <p className="text-[10px] text-stone-400 font-medium">{c.phone || c.email}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] uppercase font-black text-amber-400 tracking-widest">Inativo há</p>
                         <p className="text-lg font-black text-amber-600">{daysInactive} <span className="text-xs">dias</span></p>
                      </div>
                   </div>
                 );
               })
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
                  <i className="fa-mug-hot text-4xl mb-2"></i>
                  <p className="text-sm font-bold">Todos os clientes estão ativos!</p>
               </div>
             )}
          </div>
          {churnRiskCustomers.length > 0 && (
            <button className="mt-6 w-full py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-600 transition-colors">
                <i className="fa-whatsapp mr-2"></i> Enviar Campanha de Retorno
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
