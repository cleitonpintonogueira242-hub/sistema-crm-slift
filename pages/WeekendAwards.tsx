import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Trip, Payment, TripStatus } from '../types';
import { Award, DollarSign, Calendar, ArrowRight, UserCheck } from 'lucide-react';

export const WeekendAwards: React.FC = () => {
  const { staff, trips, payments, addPayment, deletePayment } = useApp();
  const [selectedHelperId, setSelectedHelperId] = useState<string | null>(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter only helpers
  const helpers = useMemo(() => staff.filter(s => s.role === Role.HELPER), [staff]);

  // Calculate balances
  const helperStats = useMemo(() => {
    return helpers.map(helper => {
      // Trips specifically for this helper on weekends where they earned money AND status is COMPLETED
      const weekendTrips = trips.filter(t => 
        t.helperId === helper.id && 
        t.isWeekend && 
        t.helperCost > 0 &&
        t.status === TripStatus.COMPLETED
      );
      const totalEarned = weekendTrips.reduce((sum, t) => sum + t.helperCost, 0);
      
      const helperPayments = payments.filter(p => p.staffId === helper.id);
      const totalPaid = helperPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        ...helper,
        weekendTrips,
        payments: helperPayments,
        totalEarned,
        totalPaid,
        balance: totalEarned - totalPaid
      };
    });
  }, [helpers, trips, payments]);

  const selectedHelper = useMemo(() => {
    if (!selectedHelperId) return null;
    return helperStats.find(h => h.id === selectedHelperId);
  }, [selectedHelperId, helperStats]);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHelperId || !paymentAmount) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      staffId: selectedHelperId,
      amount: parseFloat(paymentAmount),
      date: paymentDate,
      notes: 'Pagamento Prêmios FDS'
    };

    addPayment(newPayment);
    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  return (
    <div className="p-8 ml-64 min-h-screen bg-navy-50">
      <h2 className="text-2xl font-bold text-navy-900 mb-2">Prêmios Final de Semana</h2>
      <p className="text-slate-500 mb-8">Controle de bonificações para ajudantes em Ressonâncias e Tomografias (FDS). 
      <br/><span className="text-xs text-orange-600 font-bold">* Somente viagens finalizadas aparecem aqui.</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Helper List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wide">Ajudantes</h3>
          {helperStats.map(helper => (
            <div 
              key={helper.id}
              onClick={() => setSelectedHelperId(helper.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedHelperId === helper.id 
                  ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                     <UserCheck size={20}/>
                   </div>
                   <div>
                     <h4 className="font-bold text-navy-900">{helper.name}</h4>
                     <p className="text-xs text-slate-500">{helper.phone}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-bold">Saldo</span>
                  <div className={`font-bold text-lg ${helper.balance > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                    R$ {helper.balance.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                 <div className="flex-1 text-center bg-slate-50 rounded py-1">
                    <span className="block text-slate-400">Ganhos</span>
                    <span className="font-bold text-slate-700">R$ {helper.totalEarned.toFixed(2)}</span>
                 </div>
                 <div className="flex-1 text-center bg-slate-50 rounded py-1">
                    <span className="block text-slate-400">Pagos</span>
                    <span className="font-bold text-slate-700">R$ {helper.totalPaid.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-2">
          {selectedHelper ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                 <div>
                   <h3 className="text-xl font-bold text-navy-900">{selectedHelper.name}</h3>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                     <Award size={16} className="text-orange-500"/>
                     <span>Extrato de Bonificações</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <div className="text-xs text-slate-500 uppercase">A Receber</div>
                      <div className="text-2xl font-bold text-green-600">R$ {selectedHelper.balance.toFixed(2)}</div>
                    </div>
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-green-200 flex items-center gap-2"
                    >
                      <DollarSign size={18} />
                      Pagar
                    </button>
                 </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Trips History */}
                <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500"/> Histórico de Viagens (Créditos)
                </h4>
                
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-8">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                       <tr>
                         <th className="p-3 font-medium">Data</th>
                         <th className="p-3 font-medium">Viagem/Cliente</th>
                         <th className="p-3 font-medium">Tipo</th>
                         <th className="p-3 font-medium text-right">Valor</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {selectedHelper.weekendTrips.length === 0 ? (
                         <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhuma bonificação finalizada.</td></tr>
                       ) : (
                         selectedHelper.weekendTrips.map(trip => (
                           <tr key={trip.id} className="hover:bg-white transition-colors">
                             <td className="p-3">{new Date(trip.date).toLocaleDateString('pt-BR')}</td>
                             <td className="p-3 font-medium text-navy-900">{trip.clientName}</td>
                             <td className="p-3">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{trip.type}</span>
                             </td>
                             <td className="p-3 text-right font-bold text-green-700">+ R$ {trip.helperCost.toFixed(2)}</td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>

                {/* Payments History */}
                <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-500"/> Histórico de Pagamentos (Débitos)
                </h4>

                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                       <tr>
                         <th className="p-3 font-medium">Data Pagamento</th>
                         <th className="p-3 font-medium">Descrição</th>
                         <th className="p-3 font-medium text-right">Valor Pago</th>
                         <th className="p-3 w-10"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {selectedHelper.payments.length === 0 ? (
                         <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhum pagamento realizado.</td></tr>
                       ) : (
                         selectedHelper.payments.map(payment => (
                           <tr key={payment.id} className="hover:bg-white transition-colors">
                             <td className="p-3">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                             <td className="p-3 text-slate-600">{payment.notes}</td>
                             <td className="p-3 text-right font-bold text-red-600">- R$ {payment.amount.toFixed(2)}</td>
                             <td className="p-3 text-center">
                               <button onClick={() => deletePayment(payment.id)} className="text-slate-300 hover:text-red-500">
                                 &times;
                               </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
              <div className="text-center">
                 <ArrowRight size={40} className="mx-auto mb-2 opacity-50"/>
                 <p>Selecione um ajudante ao lado para ver o extrato.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedHelper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Registrar Pagamento</h3>
              <p className="text-sm text-slate-500 mb-4">
                Realizando pagamento para <strong className="text-navy-900">{selectedHelper.name}</strong>.
                Saldo devedor atual: <span className="text-green-600 font-bold">R$ {selectedHelper.balance.toFixed(2)}</span>
              </p>
              
              <form onSubmit={handleRegisterPayment} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     max={selectedHelper.balance} // Optional: Prevent overpaying
                     className="w-full border p-2 rounded text-lg font-bold text-slate-800"
                     value={paymentAmount}
                     onChange={e => setPaymentAmount(e.target.value)}
                     autoFocus
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Data do Pagamento</label>
                   <input 
                     type="date"
                     className="w-full border p-2 rounded"
                     value={paymentDate}
                     onChange={e => setPaymentDate(e.target.value)}
                   />
                </div>
                
                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                   <button type="submit" className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold">Confirmar Pagamento</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};