
import React from 'react';
import { Company, StoreSettings, Integration } from '../types';

interface SettingsProps {
  company: Company;
  availableIntegrations: Integration[];
  onUpdateSettings: (settings: StoreSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ company, availableIntegrations, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = React.useState<'loyalty' | 'channels' | 'integrations' | 'api'>('loyalty');
  const [form, setForm] = React.useState<StoreSettings>(company.settings);
  const [newChannel, setNewChannel] = React.useState('');
  const [configIntegration, setConfigIntegration] = React.useState<string | null>(null);

  const enabledIntegList = availableIntegrations.filter(i => company.enabledIntegrations.includes(i.slug));

  const save = () => {
    onUpdateSettings(form);
    setConfigIntegration(null);
    alert("Configurações salvas com sucesso!");
  };

  const addChannel = () => {
    if (!newChannel) return;
    setForm({ ...form, salesChannels: [...form.salesChannels, newChannel] });
    setNewChannel('');
  };

  return (
    <div className="max-w-6xl space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Centro de Controle</h2>
          <p className="text-stone-500">Personalize as ferramentas da sua unidade.</p>
        </div>
        <button 
          onClick={save}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3"
        >
          <i className="fa-save"></i> SALVAR CONFIGURAÇÕES
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
         {[
           { id: 'loyalty', label: 'Fidelidade', icon: 'fa-gift', enabled: company.activeModules.loyalty },
           { id: 'channels', label: 'Canais de Venda', icon: 'fa-bullseye', enabled: true },
           { id: 'integrations', label: 'Integrações', icon: 'fa-plug', enabled: company.enabledIntegrations.length > 0 },
           { id: 'api', label: 'Webhooks & API', icon: 'fa-code', enabled: company.planId === 'p3' }
         ].filter(t => t.enabled).map(tab => (
           <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setConfigIntegration(null); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'
            }`}
           >
             <i className={`fa-solid ${tab.icon}`}></i>
             {tab.label}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm p-10">
         {activeTab === 'loyalty' && (
            <div className="space-y-8 max-w-2xl">
               <div className="flex items-center justify-between p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <div>
                    <p className="font-black text-stone-800">Programa de Fidelidade Ativo</p>
                    <p className="text-xs text-stone-400 font-medium">Permitir acúmulo e resgate de pontos no PDV.</p>
                  </div>
                  <button 
                    onClick={() => setForm({...form, loyaltyEnabled: !form.loyaltyEnabled})}
                    className={`w-14 h-8 rounded-full transition-all relative ${form.loyaltyEnabled ? 'bg-emerald-500' : 'bg-stone-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${form.loyaltyEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>
               
               <div className={`space-y-6 ${form.loyaltyEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                   <div>
                       <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome da Moeda / Pontos</label>
                       <input type="text" className="w-full px-5 py-4 rounded-2xl border bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all" value={form.loyaltyName} onChange={e => setForm({...form, loyaltyName: e.target.value})} placeholder="Ex: NaturaPoints" />
                   </div>
                   
                   <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                     <h4 className="font-black text-indigo-900 mb-4 flex items-center gap-2">
                        <i className="fa-calculator"></i> Regra de Acúmulo
                     </h4>
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                           <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">A cada (R$)</label>
                           <input 
                              type="number" 
                              className="w-full px-5 py-4 rounded-2xl border border-indigo-200 bg-white text-indigo-900 font-bold outline-none focus:border-indigo-500 text-center text-xl" 
                              value={form.loyaltySpendThreshold} 
                              onChange={e => setForm({...form, loyaltySpendThreshold: Number(e.target.value)})} 
                           />
                           <p className="text-[10px] text-indigo-400 mt-2 text-center font-bold uppercase">Gasto pelo Cliente</p>
                        </div>
                        <i className="fa-arrow-right text-indigo-300 text-2xl mt-4"></i>
                        <div className="flex-1">
                           <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Gerar</label>
                           <input 
                              type="number" 
                              className="w-full px-5 py-4 rounded-2xl border border-indigo-200 bg-white text-indigo-900 font-bold outline-none focus:border-indigo-500 text-center text-xl" 
                              value={form.loyaltyPointValue} 
                              onChange={e => setForm({...form, loyaltyPointValue: Number(e.target.value)})} 
                           />
                           <p className="text-[10px] text-indigo-400 mt-2 text-center font-bold uppercase">{form.loyaltyName}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'channels' && (
            <div className="space-y-8 max-w-2xl animate-in fade-in">
               <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 mb-6">
                 <p className="font-bold text-stone-800 mb-2">Gerenciar Canais de Venda</p>
                 <p className="text-xs text-stone-500 mb-4 font-medium leading-relaxed">Adicione origens de venda para rastrear no PDV e Relatórios (ex: iFood, WhatsApp, Balcão, Feira).</p>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Novo canal (ex: Instagram)" 
                      className="flex-1 px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 font-bold outline-none focus:border-emerald-500 transition-all"
                      value={newChannel}
                      onChange={e => setNewChannel(e.target.value)}
                    />
                    <button onClick={addChannel} className="bg-stone-900 text-white px-8 rounded-2xl font-black uppercase text-xs hover:bg-emerald-600 transition-all">Adicionar</button>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.salesChannels.map(c => (
                     <div key={c} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                        <span className="font-bold text-stone-700">{c}</span>
                        <button onClick={() => setForm({...form, salesChannels: form.salesChannels.filter(x => x !== c)})} className="text-stone-300 hover:text-red-500 transition-colors"><i className="fa-times-circle"></i></button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'integrations' && !configIntegration && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {enabledIntegList.map(integ => (
                  <div key={integ.slug} className="p-8 rounded-[2rem] border-2 border-emerald-50 bg-emerald-50/20 flex items-start gap-6 relative overflow-hidden group">
                     <i className={`fa-brands ${integ.icon} absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 transition-transform`}></i>
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-emerald-600 shadow-sm">
                        <i className={`fa-brands ${integ.icon}`}></i>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-stone-800 text-lg mb-1">{integ.name}</h4>
                        <p className="text-xs text-stone-500 font-medium leading-relaxed mb-4">{integ.description}</p>
                        <button onClick={() => setConfigIntegration(integ.slug)} className="bg-white border border-stone-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase text-stone-600 hover:bg-stone-900 hover:text-white transition-all">Configurar Chaves</button>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'integrations' && configIntegration && (
             <div className="max-w-2xl animate-in fade-in">
                 <button onClick={() => setConfigIntegration(null)} className="mb-6 text-xs font-black uppercase text-stone-400 hover:text-stone-800 flex items-center gap-2">
                     <i className="fa-arrow-left"></i> Voltar
                 </button>
                 <h3 className="text-2xl font-black mb-6 capitalize">Configurar {configIntegration}</h3>
                 
                 <div className="space-y-6">
                     {configIntegration === 'mercadolivre' && (
                         <div>
                             <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Access Token (OAuth)</label>
                             <input type="password" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.mercadolivreToken || ''} onChange={e => setForm({...form, mercadolivreToken: e.target.value})} placeholder="APP_USR-..." />
                             <p className="text-[10px] text-stone-400 mt-2">Cole aqui o token de aplicação do Mercado Livre Developers.</p>
                         </div>
                     )}
                     {configIntegration === 'nuvemshop' && (
                         <>
                            <div>
                                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Access Token</label>
                                <input type="password" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.nuvemshopToken || ''} onChange={e => setForm({...form, nuvemshopToken: e.target.value})} />
                            </div>
                            <div className="mt-4">
                                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">ID da Loja (User ID)</label>
                                <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.nuvemshopUserId || ''} onChange={e => setForm({...form, nuvemshopUserId: e.target.value})} />
                            </div>
                         </>
                     )}
                     {configIntegration === 'asaas' && (
                         <div>
                             <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">API Key ($)</label>
                             <input type="password" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.asaasApiKey || ''} onChange={e => setForm({...form, asaasApiKey: e.target.value})} />
                         </div>
                     )}
                     {configIntegration === 'tiny' && (
                         <div>
                             <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Token ERP</label>
                             <input type="password" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.tinyErpToken || ''} onChange={e => setForm({...form, tinyErpToken: e.target.value})} />
                         </div>
                     )}
                     {configIntegration === 'whatsapp' && (
                         <>
                            <div>
                                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Meta Bearer Token</label>
                                <input type="password" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.whatsappToken || ''} onChange={e => setForm({...form, whatsappToken: e.target.value})} />
                            </div>
                            <div className="mt-4">
                                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Phone Number ID</label>
                                <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.whatsappPhoneNumberId || ''} onChange={e => setForm({...form, whatsappPhoneNumberId: e.target.value})} />
                            </div>
                         </>
                     )}
                     {configIntegration === 'ifood' && (
                         <div>
                             <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Merchant ID</label>
                             <input type="text" className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 font-bold outline-none focus:bg-white focus:border-emerald-500" value={form.ifoodMerchantId || ''} onChange={e => setForm({...form, ifoodMerchantId: e.target.value})} />
                         </div>
                     )}
                 </div>
             </div>
         )}

         {activeTab === 'api' && (
            <div className="space-y-8 max-w-2xl">
               <div className="bg-stone-900 text-white p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">Sua Chave de API</p>
                    <button className="text-[10px] font-black uppercase underline">Gerar Nova</button>
                  </div>
                  <code className="block bg-black/30 p-4 rounded-xl font-mono text-emerald-300 text-xs overflow-x-auto">
                    ns_live_51Mv9L2Kx8J3Wz0Q7f...
                  </code>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Webhook de Vendas (URL)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 font-bold bg-stone-50 text-stone-900 outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                    placeholder="https://seu-erp.com/webhook" 
                    value={form.webhookUrl || ''}
                    onChange={e => setForm({...form, webhookUrl: e.target.value})}
                  />
                  <p className="text-[10px] text-stone-400 mt-2 italic">Enviaremos um POST JSON a cada venda finalizada.</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default Settings;
