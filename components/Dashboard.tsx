
import React, { useState, useEffect } from 'react';
import { Product, Sale, FinancialTransaction } from '../types';
import { getInventoryInsights } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  transactions: FinancialTransaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, transactions }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const totalSalesVal = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  
  // Logic updated to check both warehouse purchase alerts AND store replenishment alerts
  const lowStockCount = products.filter(p => 
      p.currentStock <= p.minStockWarehouse || p.exposedStock <= p.minStockStore
  ).length;
  
  const balance = transactions.reduce((acc, t) => 
    t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  const chartData = [
    { name: 'Vendas', value: totalSalesVal, color: '#10b981' },
    { name: 'Saldo', value: balance, color: '#0ea5e9' },
  ];

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const msg = await getInventoryInsights(products);
      setAiInsight(msg || "Nenhum insight disponível.");
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Painel de Controle</h2>
          <p className="text-stone-500">Visão geral do seu negócio de produtos naturais.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-stone-600">Sistema Operacional: Loja Matriz</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Vendas do Período" value={`R$ ${totalSalesVal.toFixed(2)}`} icon="fa-shopping-cart" color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Alertas de Estoque" value={lowStockCount.toString()} icon="fa-exclamation-triangle" color="bg-amber-100 text-amber-700" />
        <StatCard title="Saldo Financeiro" value={`R$ ${balance.toFixed(2)}`} icon="fa-wallet" color="bg-sky-100 text-sky-700" />
        <StatCard title="Total de Produtos" value={products.length.toString()} icon="fa-leaf" color="bg-stone-100 text-stone-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <i className="fa-chart-simple text-emerald-600"></i>
            Performance Geral
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
              <i className="fa-robot"></i>
            </div>
            <h3 className="font-bold text-emerald-900">IA NaturaInsight</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingInsight ? (
              <div className="flex flex-col items-center justify-center h-full text-emerald-600 space-y-2">
                <i className="fa-spinner fa-spin text-2xl"></i>
                <p className="text-sm italic">Analisando tendências de estoque...</p>
              </div>
            ) : (
              <div className="text-emerald-800 text-sm leading-relaxed space-y-4">
                <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                  {aiInsight}
                </div>
                <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg text-xs font-medium border border-emerald-200">
                  <i className="fa-lightbulb mr-1"></i> Sugestão: Inicie uma promoção para os itens com mais de 3 meses em estoque.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
