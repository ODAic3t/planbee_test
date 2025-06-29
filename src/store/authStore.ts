import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Patient, Staff } from '@/types';

interface AuthState {
  user: AuthUser | null;
  patient: Patient | null;
  staff: Staff | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setPatient: (patient: Patient | null) => void;
  setStaff: (staff: Staff | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      patient: null,
      staff: null,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user }),
      setPatient: (patient) => set({ patient }),
      setStaff: (staff) => set({ staff }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ 
        user: null, 
        patient: null, 
        staff: null, 
        error: null 
      }),
    }),
    {
      name: 'planbee-auth',
      partialize: (state) => ({ 
        user: state.user,
        patient: state.patient,
        staff: state.staff 
      }),
    }
  )
); 