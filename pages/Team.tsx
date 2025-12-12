import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Staff } from '../types';
import { User, Phone, Truck, Wallet, Edit2 } from 'lucide-react';

export const Team: React.FC = () => {
  const { staff, addStaff, updateStaff } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.DRIVER);
  const [newPhone, setNewPhone] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newKmRate, setNewKmRate] = useState(0);

  const handleEditClick = (member: Staff) => {
    setIsEditing(true);
    setEditingId(member.id);
    setNewName(member.name);
    setNewRole(member.role);
    setNewPhone(member.phone);
    setNewVehicleModel(member.vehicleModel || '');
    setNewPlate(member.licensePlate || '');
    setNewKmRate(member.kmRate || 0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  }

  const resetForm = () => {
    setNewName(''); setNewPhone(''); setNewVehicleModel(''); setNewPlate(''); setNewKmRate(0);
    setNewRole(Role.DRIVER);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const staffData: Staff = { 
        id: isEditing && editingId ? editingId : Date.now().toString(), 
        name: newName, 
        role: newRole, 
        phone: newPhone,
        vehicleModel: newRole === Role.DRIVER ? newVehicleModel : undefined,
        licensePlate: newRole === Role.DRIVER ? newPlate : undefined,
        kmRate: newRole === Role.DRIVER ? newKmRate : undefined
    };

    if (isEditing) {
      updateStaff(staffData);
      setIsEditing(false);
      setEditingId(null);
    } else {
      addStaff(staffData);
    }
    resetForm();
  };

  return (
    <div className="p-8 ml-64 min-h-screen bg-navy-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900">Gerenciar Equipe</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add/Edit Staff */}
        <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4 transition-colors ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isEditing ? 'text-amber-800' : 'text-navy-900'}`}>
                {isEditing ? <Edit2 size={18}/> : <User size={18} />} 
                {isEditing ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nome Completo" className="w-full border p-2 rounded" value={newName} onChange={e => setNewName(e.target.value)} required />
                
                <input type="text" placeholder="Telefone Celular" className="w-full border p-2 rounded" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                
                <select className="w-full border p-2 rounded" value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
                  <option value={Role.DRIVER}>Motorista</option>
                  <option value={Role.HELPER}>Ajudante</option>
                </select>

                {newRole === Role.DRIVER && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 animate-fade-in">
                    <p className="text-xs font-bold text-slate-500 uppercase">Dados do Veículo & Frete</p>
                    <input type="text" placeholder="Modelo do Veículo (ex: HR, Ducato)" className="w-full border p-2 rounded" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} />
                    <input type="text" placeholder="Placa (ABC-1234)" className="w-full border p-2 rounded uppercase" value={newPlate} onChange={e => setNewPlate(e.target.value)} />
                    <div>
                      <label className="text-xs text-slate-500">Valor do KM Acordado (R$)</label>
                      <input type="number" step="0.01" className="w-full border p-2 rounded" value={newKmRate} onChange={e => setNewKmRate(parseFloat(e.target.value))} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {isEditing && (
                    <button type="button" onClick={handleCancelEdit} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded hover:bg-slate-300 font-medium">Cancelar</button>
                  )}
                  <button type="submit" className={`flex-1 py-2 rounded text-white font-medium ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isEditing ? 'Salvar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
        </div>
        
        {/* List Staff */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map(member => (
            <div key={member.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              {member.role === Role.DRIVER && (
                 <div className="absolute top-0 right-0 p-2 bg-slate-50 rounded-bl-xl text-slate-300 group-hover:text-blue-200 transition-colors">
                   <Truck size={40} />
                 </div>
              )}
              
              <div className="mb-4 relative z-10">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-navy-900 text-lg">{member.name}</h4>
                  <div className="flex gap-2">
                     <span className={`px-2 py-0.5 rounded text-xs font-bold h-fit ${member.role === Role.DRIVER ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {member.role.toUpperCase()}
                     </span>
                     <button onClick={() => handleEditClick(member)} className="text-slate-400 hover:text-blue-600">
                        <Edit2 size={16}/>
                     </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                   <Phone size={14}/> {member.phone || 'Sem telefone'}
                </div>
              </div>

              {member.role === Role.DRIVER && (
                <div className="border-t border-slate-100 pt-3 mt-auto space-y-2 text-sm relative z-10">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Veículo:</span>
                      <span className="font-medium text-slate-700">{member.vehicleModel || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Placa:</span>
                      <span className="font-mono text-slate-700">{member.licensePlate || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between bg-green-50 p-2 rounded items-center">
                      <span className="text-green-700 font-medium flex items-center gap-1"><Wallet size={14}/> Valor/KM:</span>
                      <span className="font-bold text-green-800">R$ {member.kmRate?.toFixed(2) || '0.00'}</span>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};