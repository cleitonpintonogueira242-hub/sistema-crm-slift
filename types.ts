export enum Role {
  DRIVER = 'Motorista',
  HELPER = 'Ajudante'
}

export enum TripType {
  MRI = 'Ressonância Magnética',
  CT = 'Tomografia',
  OTHER = 'Outros'
}

export enum TripStatus {
  OPEN = 'Em Aberto',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Finalizado'
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  phone: string;
  // New fields
  vehicleModel?: string;
  licensePlate?: string;
  kmRate?: number; // Valor do KM acordado
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  avgConsumption: number; // km/l
}

export interface DriverSplit {
  driverId: string;
  driverName: string;
  amount: number;
}

export interface AppRates {
  MRI_HELPER_BASE: number;
  CT_HELPER_BASE: number;
  OTHER_HELPER_BASE: number;
  WEEKEND_BONUS_PERCENT: number;
  FUEL_PRICE_AVG: number;
  DRIVER_DAILY_BASE: number;
}

export interface Trip {
  id: string;
  date: string;
  
  origin: string;
  destination: string;
  clientName: string;
  status: TripStatus;
  
  distanceKm: number;
  
  // Primary Driver (Legacy & Main)
  driverId: string;
  vehicleLabel?: string; 

  // Secondary Driver (New)
  secondDriverId?: string;
  secondDriverCost?: number; // Cost specifically for the second driver

  // Helper
  helperId?: string;
  
  type: TripType;
  isWeekend: boolean;
  
  revenue: number;
  
  // Costs
  fuelCost: number;
  driverCost: number; // This is the TOTAL driver cost (Driver 1 + Driver 2)
  helperCost: number;
  tollCost: number;
  otherCost: number;
  
  notes?: string;
}

export interface Payment {
  id: string;
  staffId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  totalTrips: number;
  totalKm: number;
}