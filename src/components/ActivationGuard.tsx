import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Key, Smartphone, Send, CheckCircle2 } from 'lucide-react';

interface ActivationGuardProps {
  children: React.ReactNode;
}

export const ActivationGuard: React.FC<ActivationGuardProps> = ({ children }) => {
  const { isActivated, installationId, activateApp } = useStore();
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = activateApp(keyInput);
    if (!result.success) {
      setError(result.error || 'Error desconocido');
    }
  };

  const shareId = () => {
    const message = `Hola Rodrigo, solicito activación para EsthetiKare Pro.\nCódigo de Instalación: ${installationId}`;
    window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isActivated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#500732] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-slide-in">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-aesthetic-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-aesthetic-200">
            <ShieldAlert className="w-10 h-10 text-[#8a1d5a]" />
          </div>
          <h2 className="text-2xl font-black text-[#332724] tracking-tight">Activación Requerida</h2>
          <p className="text-sm text-aesthetic-600 font-medium">Su licencia profesional no ha sido activada aún.</p>
        </div>

        <div className="bg-aesthetic-50 rounded-2xl p-5 border border-aesthetic-200/50 space-y-4">
          <div className="flex items-center space-x-3 text-xs font-bold text-aesthetic-700 uppercase tracking-widest">
            <Smartphone className="w-4 h-4" />
            <span>Su Código de Instalación:</span>
          </div>
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border-2 border-aesthetic-200 shadow-inner">
            <span className="font-black text-lg text-[#332724] tracking-widest">{installationId}</span>
            <button
              onClick={shareId}
              className="text-aesthetic-500 hover:text-[#8a1d5a] transition-colors"
              title="Enviar por WhatsApp"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-aesthetic-400 font-bold leading-tight">
            Copie este código y envíelo a su proveedor para recibir su clave de producto.
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest ml-1">Clave de Activación (Serial)</label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 w-5 h-5 text-aesthetic-300" />
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="EK-XXXX-XXXX-PRO"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-aesthetic-200 text-sm font-black tracking-widest bg-[#faf6f7] text-[#332724] focus:outline-none focus:border-[#8a1d5a] transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase text-center rounded-xl animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#500732] hover:bg-[#8a1d5a] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#500732]/20 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Desbloquear Aplicación</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-aesthetic-300 font-bold uppercase tracking-tighter">
          © 2026 EsthetiKare Pro - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};
