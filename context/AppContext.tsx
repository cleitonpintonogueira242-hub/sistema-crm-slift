import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, Staff, Vehicle, Payment, AppRates } from '../types';
import { MOCK_STAFF, MOCK_VEHICLES, DEFAULT_RATES } from '../constants';

interface AppState {
  trips: Trip[];
  staff: Staff[];
  vehicles: Vehicle[];
  payments: Payment[];
  rates: AppRates;
  logo: string | null;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  addVehicle: (vehicle: Vehicle) => void;
  addPayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  updateRates: (rates: AppRates) => void;
  setLogo: (logo: string | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('transport_trips');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('transport_staff');
    return saved ? JSON.parse(saved) : MOCK_STAFF;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('transport_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('transport_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [rates, setRates] = useState<AppRates>(() => {
    const saved = localStorage.getItem('transport_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  const [logo, setLogoState] = useState<string | null>(() => {
    return localStorage.getItem('transport_logo');
  });

  useEffect(() => {
    localStorage.setItem('transport_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('transport_staff', JSON.stringify(staff));
  }, [staff]);

   useEffect(() => {
    localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transport_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('transport_rates', JSON.stringify(rates));
  }, [rates]);

  const setLogo = (newLogo: string | null) => {
    setLogoState(newLogo);
    if (newLogo) {
      localStorage.setItem('transport_logo', newLogo);
    } else {
      localStorage.removeItem('transport_logo');
    }
  };

  const addTrip = (trip: Trip) => setTrips(prev => [trip, ...prev]);
  
  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const deleteTrip = (id: string) => setTrips(prev => prev.filter(t => t.id !== id));
  
  const addStaff = (newStaff: Staff) => setStaff(prev => [...prev, newStaff]);
  
  const updateStaff = (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const addVehicle = (newVehicle: Vehicle) => setVehicles(prev => [...prev, newVehicle]);

  const addPayment = (newPayment: Payment) => setPayments(prev => [newPayment, ...prev]);
  const deletePayment = (id: string) => setPayments(prev => prev.filter(p => p.id !== id));

  const updateRates = (newRates: AppRates) => setRates(newRates);

  return (
    <AppContext.Provider value={{ 
      trips, staff, vehicles, payments, rates, logo,
      addTrip, updateTrip, deleteTrip, addStaff, updateStaff, addVehicle, addPayment, deletePayment, updateRates, setLogo 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};