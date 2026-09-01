import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';

interface Center {
  id: string;
  name: string;
  activation_code: string;
  is_active: boolean;
}

interface AuthState {
  currentCenter: Center | null;
  isLoading: boolean;
  error: string | null;
  joinCenter: (code: string) => Promise<{ success: boolean; error?: string }>;
  logoutCenter: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentCenter: null,
      isLoading: false,
      error: null,

      joinCenter: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('centers')
            .select('*')
            .eq('activation_code', code.toUpperCase())
            .single();

          if (error || !data) {
            throw new Error('Código de centro inválido o centro no encontrado.');
          }

          if (!data.is_active) {
            throw new Error('Este centro se encuentra suspendido. Contacte a soporte.');
          }

          set({ currentCenter: data, isLoading: false });
          return { success: true };
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      logoutCenter: () => {
        set({ currentCenter: null });
      },
    }),
    {
      name: 'estheticare-auth',
    }
  )
);
