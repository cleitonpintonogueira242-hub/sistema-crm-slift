import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppRates } from '../types';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { DEFAULT_RATES } from '../constants';

export const Settings: React.FC = () => {
  const { rates, updateRates } = useApp();
  const [formRates, setFormRates] = useState<AppRates>(rates);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormRates(rates);
  }, [rates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRates(formRates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar os valores padrão?')) {
      updateRates(DEFAULT_RATES);
    }
  };

  return (
    <div className="p-8 ml-64 min-h-screen bg-navy-50">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
             <SettingsIcon className="text-blue-600" /> Configurações do Sistema
           </h2>
           <p className="text-slate-500">Gerencie valores padrões, bonificações e taxas.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-navy-900">Valores de Bonificação (Prêmios FDS)</h3>
            <p className="text-sm text-slate-500">Valores pagos aos ajudantes por serviço em finais de semana.</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ressonância Magnética (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full border p-2 rounded bg-indigo-50 border-indigo-200 text-indigo-900 font-bold"
                value={formRates.MRI_HELPER_BASE}
                onChange={e => setFormRates({...formRates, MRI_HELPER_BASE: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tomografia (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full border p-2 rounded bg-blue-50 border-blue-200 text-blue-900 font-bold"
                value={formRates.CT_HELPER_BASE}
                onChange={e => setFormRates({...formRates, CT_HELPER_BASE: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Outros Serviços (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full border p-2 rounded"
                value={formRates.OTHER_HELPER_BASE}
                onChange={e => setFormRates({...formRates, OTHER_HELPER_BASE: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="p-6 border-b border-slate-100 bg-slate-50 border-t">
            <h3 className="font-bold text-navy-900">Variáveis de Custo Operacional</h3>
            <p className="text-sm text-slate-500">Usado para cálculo automático de custos nas viagens.</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Médio Combustível (R$/Litro)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full border p-2 rounded"
                value={formRates.FUEL_PRICE_AVG}
                onChange={e => setFormRates({...formRates, FUEL_PRICE_AVG: parseFloat(e.target.value)})}
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adicional FDS Motorista (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full border p-2 rounded pr-8"
                  value={formRates.WEEKEND_BONUS_PERCENT * 100}
                  onChange={e => setFormRates({...formRates, WEEKEND_BONUS_PERCENT: parseFloat(e.target.value) / 100})}
                />
                <span className="absolute right-3 top-2 text-slate-400">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Ex: 20% de adicional sobre o valor do KM ou diária.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diária Base Motorista (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full border p-2 rounded"
                value={formRates.DRIVER_DAILY_BASE}
                onChange={e => setFormRates({...formRates, DRIVER_DAILY_BASE: parseFloat(e.target.value)})}
              />
              <p className="text-xs text-slate-400 mt-1">Usado se o motorista não tiver valor/KM definido.</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
             <button 
               type="button" 
               onClick={handleReset}
               className="flex items-center gap-2 text-slate-500 hover:text-slate-700 px-4 py-2 rounded transition-colors"
             >
               <RefreshCw size={16} /> Restaurar Padrões
             </button>

             <button 
               type="submit" 
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-bold transition-all shadow-lg ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
               {saved ? 'Salvo!' : <><Save size={18} /> Salvar Alterações</>}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};