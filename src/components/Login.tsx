import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShieldCheck, Lock, Delete } from 'lucide-react';

export const Login: React.FC = () => {
  const { professionals, login } = useStore();
  const [selectedProfId, setSelectedProfId] = useState<string>(professionals[0]?.id || '');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const activeProfessionals = professionals.filter(p => p.active);

  // Sincronizar el id seleccionado cuando la lista de profesionales se hidrata del almacenamiento local
  useEffect(() => {
    if (activeProfessionals.length > 0) {
      const exists = activeProfessionals.some(p => p.id === selectedProfId);
      if (!selectedProfId || !exists) {
        setSelectedProfId(activeProfessionals[0].id);
      }
    }
  }, [activeProfessionals, selectedProfId]);

  const handleKeyPress = (num: string) => {
    setError(null);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto submit if 4 digits are complete
      if (newPin.length === 4) {
        submitLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const submitLogin = (pinToSubmit: string) => {
    const matchedProf = activeProfessionals.find(p => p.id === selectedProfId);
    if (!matchedProf) {
      setError("Seleccione un especialista válido.");
      setPin('');
      return;
    }

    if (matchedProf.pin === pinToSubmit) {
      const result = login(pinToSubmit);
      if (!result.success) {
        setError(result.error || "Error de autenticación.");
        triggerShake();
      }
    } else {
      setError("PIN incorrecto. Intente de nuevo.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setPin('');
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf6f7] p-4 text-[#500732]">
      {/* Brand logo header */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-aesthetic-500 to-aesthetic-400 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md mx-auto">
          E
        </div>
        <h1 className="text-2xl font-black tracking-tight text-aesthetic-900">
          Estheti<span className="text-aesthetic-500">Kare</span>
        </h1>
        <p className="text-xs text-aesthetic-600 font-semibold uppercase tracking-widest">Terminal de Acceso Seguro</p>
      </div>

      {/* Lock Panel */}
      <div className={`w-full max-w-sm glass-panel p-6 rounded-3xl shadow-xl space-y-6 ${shaking ? 'animate-bounce' : ''}`}>
        <div className="flex items-center space-x-2.5 pb-3 border-b border-aesthetic-200/20">
          <Lock className="w-4 h-4 text-aesthetic-500" />
          <span className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Identificación de Especialista</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200/50 text-rose-600 text-[11px] font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Professional selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Selecciona tu Perfil</label>
          <select
            value={selectedProfId}
            onChange={(e) => {
              setSelectedProfId(e.target.value);
              handleClear();
            }}
            className="w-full px-4 py-3 rounded-xl border border-aesthetic-200/30 text-sm font-bold bg-white focus:outline-none text-[#332724]"
          >
            {activeProfessionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role === 'admin' ? 'Administrador' : p.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* PIN display boxes */}
        <div className="flex justify-center space-x-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl border flex items-center justify-center text-xl font-black transition-all ${
                  hasDigit 
                    ? 'border-aesthetic-500 bg-aesthetic-100/50 text-aesthetic-800 scale-105 shadow-inner' 
                    : 'border-aesthetic-200/30 bg-white/50 text-aesthetic-300'
                }`}
              >
                {hasDigit ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3.5 rounded-2xl bg-white hover:bg-aesthetic-100/40 active:scale-95 border border-aesthetic-200/10 text-lg font-bold text-aesthetic-900 transition-all cursor-pointer shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-aesthetic-100/30 hover:bg-aesthetic-200/30 active:scale-95 border border-aesthetic-200/10 text-xs font-bold text-aesthetic-700 transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3.5 rounded-2xl bg-white hover:bg-aesthetic-100/40 active:scale-95 border border-aesthetic-200/10 text-lg font-bold text-aesthetic-900 transition-all cursor-pointer shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-aesthetic-100/30 hover:bg-aesthetic-200/30 active:scale-95 border border-aesthetic-200/10 flex items-center justify-center text-aesthetic-700 transition-all cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-1.5 text-aesthetic-400 font-semibold text-[10px] tracking-wide uppercase">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Encriptación de Sesión de Terminal Activa</span>
      </div>
    </div>
  );
};
