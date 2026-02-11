
import React, { useState } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { AdminLayout } from './modules/admin/layouts/AdminLayout';
import { TenantsList } from './modules/admin/pages/TenantsList';
import { ShopApp } from './modules/shop/ShopApp';
import Login from './components/Login';
import { User } from './types';

const AppContent: React.FC = () => {
  const { mode, path, navigate } = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'SUPERADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/app/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  // 1. Não Logado
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Módulo Super Admin
  if (mode === 'admin') {
    // Segurança básica: Se não for SuperAdmin, chuta pra fora
    if (currentUser.role !== 'SUPERADMIN') {
        handleLogout();
        return null;
    }

    return (
      <AdminLayout user={currentUser} onLogout={handleLogout}>
        {path === '/admin/tenants' ? <TenantsList /> : (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200 shadow-sm animate-in zoom-in">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                <i className="fa-chart-pie"></i>
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Dashboard de Infraestrutura</h2>
             <p className="text-slate-500">Selecione "Tenants" no menu para gerenciar as lojas.</p>
          </div>
        )}
      </AdminLayout>
    );
  }

  // 3. Módulo Loja (Shop)
  if (mode === 'shop') {
     return <ShopApp user={currentUser} onLogout={handleLogout} />;
  }

  // Fallback
  return null;
};

const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;
