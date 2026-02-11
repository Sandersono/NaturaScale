
import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../constants';

const EXTENDED_USERS = [
  ...INITIAL_USERS,
  { id: 'u_super', companyId: 'global', name: 'Super Administrador', role: 'SUPERADMIN', email: 'admin@naturascale.com' }
];

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [portal, setPortal] = useState<'store' | 'admin'>('store');

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-stone-100">
        {/* Decorative Side */}
        <div className="bg-emerald-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xl rotate-6">
              <i className="fa-leaf text-emerald-950"></i>
            </div>
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">NaturaScale<br/>Manager</h1>
            <p className="text-emerald-400 font-medium leading-relaxed opacity-80">
              A próxima geração em gestão de varejo a granel. Inteligente, ágil e totalmente integrado.
            </p>
          </div>
          <div className="relative z-10 pt-10">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Software de Gestão Multi-Tenant</p>
          </div>
        </div>
        
        {/* Form Side */}
        <div className="p-12 flex flex-col">
          <div className="flex bg-stone-100 p-1 rounded-2xl mb-10">
             <button 
              onClick={() => setPortal('store')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${portal === 'store' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >Acesso Lojista</button>
             <button 
              onClick={() => setPortal('admin')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${portal === 'admin' ? 'bg-white text-purple-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >Super Admin</button>
          </div>

          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-black text-stone-800 mb-6">Seja bem-vindo.</h2>
            
            {EXTENDED_USERS.filter(u => portal === 'admin' ? u.role === 'SUPERADMIN' : u.role !== 'SUPERADMIN').map(user => (
              <button
                key={user.id}
                onClick={() => onLogin(user as User)}
                className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 border-stone-50 bg-stone-50/50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                  user.role === 'SUPERADMIN' 
                  ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' 
                  : 'bg-white text-stone-300 group-hover:bg-emerald-500 group-hover:text-white shadow-sm'
                }`}>
                  <i className={`fa-solid ${user.role === 'SUPERADMIN' ? 'fa-crown' : user.role === 'ADMIN' ? 'fa-user-shield' : 'fa-cash-register'}`}></i>
                </div>
                <div className="text-left">
                  <p className="font-bold text-stone-800 leading-none mb-1">{user.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400 group-hover:text-emerald-600">
                    {user.role} {user.companyId !== 'global' ? '• Loja Matriz' : '• Console Global'}
                  </p>
                </div>
                <i className="fa-chevron-right ml-auto text-stone-200 group-hover:text-emerald-500"></i>
              </button>
            ))}
          </div>

          <div className="pt-10 border-t border-stone-100 text-center">
             <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">v3.4.0 SaaS Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
