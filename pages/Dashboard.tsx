import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Wallet, TrendingUp, Truck, Calendar, Filter } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC = () => {
  const { trips } = useApp();

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const d = new Date(t.date);
      return d.getMonth().toString() === selectedMonth && d.getFullYear().toString() === selectedYear;
    });
  }, [trips, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let distance = 0;
    let weekendTrips = 0;

    filteredTrips.forEach(t => {
      revenue += t.revenue;
      cost += (t.fuelCost + t.driverCost + t.helperCost + t.otherCost + t.tollCost);
      distance += t.distanceKm;
      if (t.isWeekend) weekendTrips++;
    });

    return {
      revenue,
      cost,
      profit: revenue - cost,
      margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
      totalTrips: filteredTrips.length,
      weekendTrips,
      distance
    };
  }, [filteredTrips]);

  const chartData = useMemo(() => {
    return filteredTrips.slice(0, 15).map(t => ({
      name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Receita: t.revenue,
      Custo: t.fuelCost + t.driverCost + t.helperCost + t.otherCost + t.tollCost
    })).reverse();
  }, [filteredTrips]);

  const clientData = useMemo(() => {
    const clients: Record<string, number> = {};
    filteredTrips.forEach(t => {
      clients[t.clientName] = (clients[t.clientName] || 0) + 1;
    });
    
    return Object.entries(clients)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [filteredTrips]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="p-8 ml-64 min-h-screen bg-navy-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Painel de Controle</h2>
          <p className="text-slate-500">Resumo da sua operação logística.</p>
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 px-2 text-slate-500">
             <Filter size={16}/>
             <span className="text-xs font-bold uppercase">Filtros</span>
           </div>
           <select 
             className="border-l border-slate-200 pl-2 text-sm text-slate-700 outline-none bg-transparent"
             value={selectedMonth}
             onChange={e => setSelectedMonth(e.target.value)}
           >
             {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
           </select>
           <select 
             className="border-l border-slate-200 pl-2 text-sm text-slate-700 outline-none bg-transparent"
             value={selectedYear}
             onChange={e => setSelectedYear(e.target.value)}
           >
             <option value="2024">2024</option>
             <option value="2025">2025</option>
             <option value="2026">2026</option>
           </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={Wallet}
          color="bg-green-100 text-green-700"
        />
        <StatCard 
          title="Lucro Líquido" 
          value={`R$ ${stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingUp}
          color="bg-blue-100 text-blue-700"
          subValue={`${stats.margin.toFixed(1)}% Margem`}
        />
        <StatCard 
          title="Viagens" 
          value={stats.totalTrips.toString()} 
          icon={Truck}
          color="bg-orange-100 text-orange-700"
          subValue={`${stats.weekendTrips} em FDS`}
        />
        <StatCard 
          title="KM Rodados" 
          value={`${stats.distance.toLocaleString('pt-BR')} km`} 
          icon={Calendar} 
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita vs Custos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-navy-900 mb-6">Receita vs. Custos (Diário)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Custo" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-navy-900 mb-6">Top 5 Clientes (Viagens)</h3>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={clientData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {clientData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; subValue?: string }> = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-navy-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    {subValue && (
      <p className="text-xs font-medium text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded">
        {subValue}
      </p>
    )}
  </div>
);