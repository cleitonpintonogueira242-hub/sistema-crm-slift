import { TripStatus, AppRates } from "./types";

// Valores base para pagamentos (Padrão inicial)
export const DEFAULT_RATES: AppRates = {
  MRI_HELPER_BASE: 80, 
  CT_HELPER_BASE: 60,
  OTHER_HELPER_BASE: 50,
  WEEKEND_BONUS_PERCENT: 0.20, 
  FUEL_PRICE_AVG: 5.80, 
  DRIVER_DAILY_BASE: 150,
};

export const MOCK_STAFF = [
  { 
    id: '1', 
    name: 'Carlos Silva', 
    role: 'Motorista', 
    phone: '11 99999-9999',
    vehicleModel: 'Fiat Ducato',
    licensePlate: 'ABC-1234',
    kmRate: 2.50
  },
  { 
    id: '2', 
    name: 'João Souza', 
    role: 'Ajudante', 
    phone: '11 88888-8888' 
  },
  { 
    id: '3', 
    name: 'Maria Oliveira', 
    role: 'Ajudante', 
    phone: '11 77777-7777' 
  },
];

export const MOCK_VEHICLES = [
  // Keeping purely for legacy or fleet pool if needed, 
  // but logic is moving to driver-owned vehicles as requested
  { id: 'v1', plate: 'ABC-1234', model: 'Fiat Ducato', avgConsumption: 9 },
  { id: 'v2', plate: 'XYZ-9876', model: 'Renault Master', avgConsumption: 8.5 },
];