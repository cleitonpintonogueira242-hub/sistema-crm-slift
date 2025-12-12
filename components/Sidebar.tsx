import React, { useRef } from 'react';
import { LayoutDashboard, Truck, Users, Map, PieChart, Settings, Award, Wallet, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { logo, setLogo } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'trips', label: 'Viagens', icon: Map },
    { id: 'driver_freight', label: 'Fretes Motoristas', icon: Wallet },
    { id: 'weekend_awards', label: 'Prêmios FDS', icon: Award },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'finance', label: 'Financeiro', icon: PieChart },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-navy-800 relative group">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleLogoUpload}
        />
        
        {logo ? (
          <div 
            className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden cursor-pointer shadow-lg shadow-blue-900/50"
            onClick={() => fileInputRef.current?.click()}
            title="Alterar Logo"
          >
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div 
            className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/50 cursor-pointer hover:bg-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Clique para adicionar sua logo"
          >
            S
          </div>
        )}

        <div>
          <h1 className="font-bold text-lg tracking-tight">Slift Logística</h1>
          <p className="text-xs text-slate-400">Logística Integrada</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-700 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-800">
        <button 
          onClick={() => setActivePage('settings')}
          className={`flex items-center gap-3 text-sm px-4 py-2 w-full transition-colors ${activePage === 'settings' ? 'text-white bg-navy-800 rounded' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={16} />
          Configurações
        </button>
      </div>
    </aside>
  );
};