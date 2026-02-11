
import React, { useState } from 'react';
import { Product } from '../types';

interface ScaleManagerProps {
  products: Product[];
}

const ScaleManager: React.FC<ScaleManagerProps> = ({ products }) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = () => {
    setSyncing(true);
    // Simulating file generation for scale software (like MGV or Filizola)
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date());
      
      // Simulation of generating a text file for download
      const content = products.map(p => 
        `${p.scaleCode.padStart(6, '0')} 1 ${p.pricePerUnit.toFixed(2).replace('.', '').padStart(6, '0')} 0 ${p.name.padEnd(25, ' ')}`
      ).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ITENS_BALANCA.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black text-stone-800 mb-2 flex items-center gap-3">
            <i className="fa-weight-scale text-emerald-600"></i>
            Gestor de Balanças
          </h2>
          <p className="text-stone-500 text-lg mb-8">
            Atualize os preços e nomes dos produtos diretamente nas balanças da loja. O sistema gera o arquivo compatível com softwares de balanças (Toledo, Filizola, Elgin).
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400 font-bold uppercase tracking-widest">Produtos na fila:</span>
              <span className="font-black text-stone-800">{products.length} itens</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400 font-bold uppercase tracking-widest">Última Sincronização:</span>
              <span className="font-black text-stone-800">{lastSync ? lastSync.toLocaleString() : 'Nunca realizada'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400 font-bold uppercase tracking-widest">Formato Exportação:</span>
              <span className="font-black text-emerald-700">TXT (Compatibilidade Universal)</span>
            </div>
          </div>

          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-4 ${
              syncing 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 active:scale-95'
            }`}
          >
            {syncing ? (
              <>
                <i className="fa-spinner fa-spin"></i>
                PROCESSANDO...
              </>
            ) : (
              <>
                <i className="fa-cloud-arrow-down"></i>
                SINCRONIZAR BALANÇAS
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-start gap-4">
        <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fa-circle-info"></i>
        </div>
        <div>
          <h4 className="font-bold text-amber-900 mb-1">Dica de Configuração</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Certifique-se de que o software da sua balança (ex: MGV 6 ou 7) está configurado para ler o arquivo na pasta de download padrão ou em uma pasta monitorada. Após o download, clique em "Importar" no software da balança.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScaleManager;
