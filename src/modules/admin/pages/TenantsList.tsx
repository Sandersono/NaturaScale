
import React, { useState } from 'react';
import { Tenant } from '../../../core/domain/admin';

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Mundo Verde - Matriz', slug: 'mundo-verde-sp', document: '12.345.678/0001-90', ownerName: 'Carlos Silva', ownerEmail: 'carlos@mundoverde.com', planId: 'PRO', status: 'ACTIVE', createdAt: new Date() },
  { id: '2', name: 'Empório Natural', slug: 'emporio-natural', document: '98.765.432/0001-10', ownerName: 'Ana Souza', ownerEmail: 'ana@emporio.com', planId: 'STARTER', status: 'TRIAL', createdAt: new Date() },
  { id: '3', name: 'Zona Cerealista Oficial', slug: 'zona-cerealista', document: '11.222.333/0001-55', ownerName: 'Roberto Dias', ownerEmail: 'roberto@zc.com.br', planId: 'ENTERPRISE', status: 'ACTIVE', createdAt: new Date() },
];

export const TenantsList: React.FC = () => {
  const [tenants] = useState<Tenant[]>(MOCK_TENANTS);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Inquilinos (Tenants)</h3>
          <p className="text-slate-500">Gestão das lojas cadastradas na plataforma.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <i className="fa-solid fa-plus mr-2"></i> Criar Nova Loja
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Loja</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Responsável</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Plano</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">
                  <div className="font-bold text-slate-800">{tenant.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{tenant.slug}.naturascale.app</div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-slate-700 font-medium">{tenant.ownerName}</div>
                  <div className="text-xs text-slate-400">{tenant.ownerEmail}</div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black border border-slate-200 uppercase">{tenant.planId}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    tenant.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">Gerenciar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
