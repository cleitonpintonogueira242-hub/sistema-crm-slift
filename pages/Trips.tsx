import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trip, TripType, TripStatus, Role } from '../types';
import { estimateDistance } from '../services/geminiService';
import { Plus, Trash2, MapPin, User, Calculator, PlayCircle, CheckCircle, Clock, Truck, Edit2 } from 'lucide-react';

export const Trips: React.FC = () => {
  const { trips, staff, rates, addTrip, updateTrip, deleteTrip } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Trip>>({
    date: new Date().toISOString().split('T')[0],
    type: TripType.OTHER,
    status: TripStatus.OPEN,
    isWeekend: false,
    distanceKm: 0,
    revenue: 0,
    otherCost: 0,
    tollCost: 0,
    origin: '',
    destination: '',
    clientName: '',
    secondDriverId: ''
  });

  const [selectedDriverRate, setSelectedDriverRate] = useState<number>(0);
  const [secondDriverRate, setSecondDriverRate] = useState<number>(0);

  const drivers = staff.filter(s => s.role === Role.DRIVER);
  const helpers = staff.filter(s => s.role === Role.HELPER);

  // Auto-calculation: Weekend
  useEffect(() => {
    if (formData.date) {
      const dateObj = new Date(formData.date);
      // getDay() returns 0 (Sunday) to 6 (Saturday). 
      // Need to ensure timezone doesn't shift it, but basic check is fine for local ops.
      // To be safe with "YYYY-MM-DD" string, create date with time set to noon or use UTC split.
      // Simple approach:
      const day = new Date(formData.date + 'T12:00:00').getDay();
      const isWeekend = day === 0 || day === 6;
      setFormData(prev => ({ ...prev, isWeekend }));
    }
  }, [formData.date]);

  const handleDriverChange = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setFormData(prev => ({ 
        ...prev, 
        driverId, 
        vehicleLabel: `${driver.vehicleModel} (${driver.licensePlate})` 
      }));
      setSelectedDriverRate(driver.kmRate || 0);
    } else {
      setFormData(prev => ({ ...prev, driverId: '', vehicleLabel: '' }));
      setSelectedDriverRate(0);
    }
  };

  const handleSecondDriverChange = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setFormData(prev => ({ ...prev, secondDriverId: driverId }));
      setSecondDriverRate(driver.kmRate || 0);
    } else {
      setFormData(prev => ({ ...prev, secondDriverId: '' }));
      setSecondDriverRate(0);
    }
  }

  const handleEditClick = (trip: Trip) => {
    setIsEditing(true);
    setEditingId(trip.id);
    setFormData({
      ...trip
    });
    
    // Set Rates for calculation context
    const d1 = drivers.find(d => d.id === trip.driverId);
    if (d1) setSelectedDriverRate(d1.kmRate || 0);
    
    const d2 = drivers.find(d => d.id === trip.secondDriverId);
    if (d2) setSecondDriverRate(d2.kmRate || 0);

    setShowForm(true);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: TripType.OTHER,
      status: TripStatus.OPEN,
      isWeekend: false,
      distanceKm: 0,
      revenue: 0,
      otherCost: 0,
      tollCost: 0,
      origin: '',
      destination: '',
      clientName: '',
      secondDriverId: '',
      driverId: '',
      helperId: '',
      vehicleLabel: ''
    });
    setSelectedDriverRate(0);
    setSecondDriverRate(0);
    setShowForm(true);
  };

  const handleEstimate = async () => {
    if (formData.origin && formData.destination) {
      setLoadingDist(true);
      const dist = await estimateDistance(formData.origin, formData.destination);
      setLoadingDist(false);
      if (dist > 0) {
        setFormData(prev => ({ ...prev, distanceKm: dist }));
      } else {
        alert("Não foi possível calcular. Insira manualmente.");
      }
    } else {
      alert("Preencha Origem e Destino");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate final costs
    const isWeekend = formData.isWeekend;
    const type = formData.type || TripType.OTHER;
    
    // Helper Cost Logic: STRICTLY WEEKEND ONLY (Using Configured Rates)
    let finalHelperCost = 0;
    if (isWeekend && formData.helperId) {
      if (type === TripType.MRI) finalHelperCost = rates.MRI_HELPER_BASE;
      else if (type === TripType.CT) finalHelperCost = rates.CT_HELPER_BASE;
      else finalHelperCost = rates.OTHER_HELPER_BASE;
    } else {
      finalHelperCost = 0; // Ensure 0 if not weekend
    }

    // Driver 1 Cost Logic
    let driver1Cost = 0;
    if (selectedDriverRate > 0) {
      driver1Cost = (formData.distanceKm || 0) * selectedDriverRate;
      if (isWeekend) driver1Cost += (driver1Cost * rates.WEEKEND_BONUS_PERCENT);
    } else {
      driver1Cost = rates.DRIVER_DAILY_BASE;
      if (isWeekend) driver1Cost += (driver1Cost * rates.WEEKEND_BONUS_PERCENT);
    }

    // Driver 2 Cost Logic
    let driver2Cost = 0;
    if (formData.secondDriverId) {
       if (secondDriverRate > 0) {
          driver2Cost = (formData.distanceKm || 0) * secondDriverRate;
          if (isWeekend) driver2Cost += (driver2Cost * rates.WEEKEND_BONUS_PERCENT);
       } else {
          driver2Cost = rates.DRIVER_DAILY_BASE;
          if (isWeekend) driver2Cost += (driver2Cost * rates.WEEKEND_BONUS_PERCENT);
       }
    }

    const vehicleCount = formData.secondDriverId ? 2 : 1;
    const fuelCost = (((formData.distanceKm || 0) / 8.5) * rates.FUEL_PRICE_AVG) * vehicleCount;

    const tripData: Trip = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      date: formData.date!,
      origin: formData.origin || 'N/A',
      destination: formData.destination || 'N/A',
      clientName: formData.clientName || 'Cliente Final',
      status: formData.status || TripStatus.OPEN,
      distanceKm: Number(formData.distanceKm),
      
      driverId: formData.driverId!,
      vehicleLabel: formData.vehicleLabel,
      
      secondDriverId: formData.secondDriverId,
      secondDriverCost: driver2Cost,

      helperId: formData.helperId,
      type: formData.type!,
      isWeekend: isWeekend || false,
      
      revenue: Number(formData.revenue),
      
      fuelCost,
      driverCost: driver1Cost + driver2Cost, // Total Cost
      helperCost: finalHelperCost,
      tollCost: Number(formData.tollCost || 0),
      otherCost: Number(formData.otherCost || 0),
      notes: formData.notes
    };

    if (isEditing) {
      updateTrip(tripData);
    } else {
      addTrip(tripData);
    }

    setShowForm(false);
  };

  const getStatusColor = (s: TripStatus) => {
    switch(s) {
      case TripStatus.OPEN: return 'bg-yellow-100 text-yellow-700';
      case TripStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TripStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100';
    }
  }

  const getStatusIcon = (s: TripStatus) => {
    switch(s) {
      case TripStatus.OPEN: return <Clock size={14}/>;
      case TripStatus.IN_PROGRESS: return <PlayCircle size={14}/>;
      case TripStatus.COMPLETED: return <CheckCircle size={14}/>;
    }
  }

  return (
    <div className="p-8 ml-64 min-h-screen bg-navy-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900">Gerenciar Viagens</h2>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus size={18} />
          Nova Viagem
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-navy-900 text-white rounded-t-xl">
              <h3 className="text-lg font-bold">{isEditing ? 'Editar Viagem' : 'Nova Viagem'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* SECTION: BÁSICO */}
              <div className="md:col-span-3 pb-2 border-b border-slate-100 mb-2">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Informações Gerais</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input type="date" required className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                {formData.isWeekend ? (
                   <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                     <CheckCircle size={10}/> Final de Semana (Bonificação Ativa)
                   </span>
                ) : (
                   <span className="text-xs text-slate-400 mt-1 block">Dia de Semana (Sem Bonificação)</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TripStatus})}>
                  {Object.values(TripStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <input type="text" required placeholder="Nome do Cliente" className="w-full border p-2 rounded" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>

              {/* SECTION: ROTA */}
              <div className="md:col-span-3 pb-2 border-b border-slate-100 mt-2 mb-2">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Rota & Distância</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                <input type="text" placeholder="Cidade/Bairro Origem" className="w-full border p-2 rounded" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
                <input type="text" placeholder="Cidade/Bairro Destino" className="w-full border p-2 rounded" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                   Distância (KM)
                   <button type="button" onClick={handleEstimate} disabled={loadingDist} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                     {loadingDist ? 'Calculando...' : <><Calculator size={10}/> Calcular com IA</>}
                   </button>
                </label>
                <input type="number" min="0" step="0.1" required className="w-full border p-2 rounded" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: parseFloat(e.target.value)})} />
              </div>

              {/* SECTION: EQUIPE */}
              <div className="md:col-span-3 pb-2 border-b border-slate-100 mt-2 mb-2">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Equipe & Veículos</h4>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Motorista Principal</label>
                <select required className="w-full border p-2 rounded" value={formData.driverId || ''} onChange={e => handleDriverChange(e.target.value)}>
                  <option value="">Selecione...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <div className="text-xs text-slate-500 mt-1">{formData.vehicleLabel}</div>
              </div>

              <div className="md:col-span-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">2º Motorista (Opcional)</label>
                 <select className="w-full border p-2 rounded" value={formData.secondDriverId || ''} onChange={e => handleSecondDriverChange(e.target.value)}>
                  <option value="">Nenhum</option>
                  {drivers.filter(d => d.id !== formData.driverId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {formData.secondDriverId && <div className="text-xs text-blue-600 mt-1">+ Custo Frete Adicional</div>}
              </div>

              <div className="md:col-span-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Ajudante (Opcional)</label>
                 <select className="w-full border p-2 rounded" value={formData.helperId || ''} onChange={e => setFormData({...formData, helperId: e.target.value})}>
                  <option value="">Nenhum</option>
                  {helpers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                {!formData.isWeekend && formData.helperId && (
                  <p className="text-[10px] text-red-500 mt-1 font-bold">Sem bonificação em dias de semana.</p>
                )}
              </div>

              {/* SECTION: FINANCEIRO */}
               <div className="md:col-span-3 pb-2 border-b border-slate-100 mt-2 mb-2">
                 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Serviço & Faturamento</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select required className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TripType})}>
                  {Object.values(TripType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receita (R$)</label>
                <input type="number" min="0" step="0.01" required className="w-full border border-green-300 bg-green-50 p-2 rounded font-medium" value={formData.revenue} onChange={e => setFormData({...formData, revenue: parseFloat(e.target.value)})} />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pedágio/Outros (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border p-2 rounded" value={formData.tollCost} onChange={e => setFormData({...formData, tollCost: parseFloat(e.target.value)})} />
              </div>

              <div className="md:col-span-3 pt-4 flex gap-3 justify-end border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-medium shadow-lg">
                  {isEditing ? 'Atualizar Viagem' : 'Salvar Viagem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Cliente/Rota</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Equipe</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Custos Totais</th>
              <th className="p-4 font-medium">Receita</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Nenhuma viagem registrada. Clique em "Nova Viagem".
                </td>
              </tr>
            ) : (
              trips.map(trip => {
                const totalCost = trip.fuelCost + trip.driverCost + trip.helperCost + trip.otherCost + trip.tollCost;
                const profit = trip.revenue - totalCost;
                const driverName = staff.find(s => s.id === trip.driverId)?.name || 'Desconhecido';
                const secondDriverName = trip.secondDriverId ? staff.find(s => s.id === trip.secondDriverId)?.name : null;
                const helperName = staff.find(s => s.id === trip.helperId)?.name;

                return (
                  <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group text-sm">
                    <td className="p-4 text-slate-700 whitespace-nowrap">
                      {new Date(trip.date).toLocaleDateString('pt-BR')}
                      {trip.isWeekend && <div className="text-[10px] text-green-600 font-bold">FDS</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-navy-900">{trip.clientName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={10}/> {trip.origin} <span className="text-slate-300">→</span> {trip.destination}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)} {trip.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-medium text-slate-700"><User size={12}/> {driverName}</div>
                      {secondDriverName && (
                        <div className="flex items-center gap-1 font-medium text-slate-700 mt-1">
                           <Truck size={12} className="text-blue-500"/> {secondDriverName}
                        </div>
                      )}
                      {helperName && <div className="text-xs text-indigo-600 mt-1">+ {helperName}</div>}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                        trip.type === TripType.MRI ? 'bg-indigo-100 text-indigo-700' :
                        trip.type === TripType.CT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {trip.type}
                      </span>
                    </td>
                    <td className="p-4 text-red-600 font-medium whitespace-nowrap">
                      R$ {totalCost.toFixed(2)}
                      {trip.secondDriverId && <div className="text-[10px] text-slate-400">2 Veículos/Mot</div>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-green-700">R$ {trip.revenue.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">Lucro: R$ {profit.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleEditClick(trip)}
                          className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTrip(trip.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};