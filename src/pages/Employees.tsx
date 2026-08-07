import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Users, Plus, Trash2, ShieldAlert, ToggleLeft, ToggleRight, UserPlus, Users2
} from 'lucide-react';

export const Employees: React.FC = () => {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useStore();

  // Form state for new professional
  const [newProf, setNewProf] = useState({
    name: '',
    specialty: '',
    role: 'specialist' as 'admin' | 'specialist',
    pin: ''
  });

  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProf.name || !newProf.specialty || !newProf.pin) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (newProf.pin.length !== 4 || isNaN(parseInt(newProf.pin))) {
      alert("La contraseña PIN debe constar exactamente de 4 dígitos numéricos.");
      return;
    }

    // Check if PIN is already taken
    const pinExists = professionals.some(p => p.pin === newProf.pin);
    if (pinExists) {
      alert("Este PIN ya está asignado a otro especialista. Use otro código para asegurar trazabilidad.");
      return;
    }

    addProfessional(newProf);
    setNewProf({ name: '', specialty: '', role: 'specialist', pin: '' });
    alert("¡Especialista registrado correctamente!");
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateProfessional(id, { active: !currentStatus });
  };

  const handleDeleteProf = (id: string, name: string) => {
    if (window.confirm(`¿Estás completamente seguro de eliminar a ${name}? Esto podría afectar el historial de comisiones.`)) {
      deleteProfessional(id);
      alert("Empleado eliminado de la base de datos.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center space-x-3.5 glass-panel p-6 rounded-2xl shadow-sm">
        <Users2 className="w-6 h-6 text-aesthetic-500" />
        <div>
          <h2 className="text-xl font-extrabold text-[#332724]">Gestión de Personal</h2>
          <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Administrador de empleados, altas, suspensiones de especialistas y control de actividad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* List of Employees (Takes 2/3) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-aesthetic-200/20 bg-aesthetic-100/10 flex items-center justify-between">
            <span className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Especialistas & Empleados Registrados ({professionals.length})</span>
          </div>

          <div className="divide-y divide-aesthetic-200/10">
            {professionals.length === 0 ? (
              <div className="p-12 text-center text-aesthetic-500/70 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-aesthetic-200 mb-2" />
                <p className="text-sm font-semibold">No hay empleados registrados en la base de datos.</p>
              </div>
            ) : (
              professionals.map((prof) => (
                <div key={prof.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-aesthetic-100/10 transition-all">
                  <div>
                    <h4 className="font-extrabold text-[#332724] text-sm">{prof.name}</h4>
                    <p className="text-xs text-aesthetic-600 font-semibold mt-0.5">{prof.specialty}</p>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 sm:mt-0 self-end sm:self-auto">
                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleStatus(prof.id, prof.active)}
                      className={`flex items-center space-x-1.5 text-xs font-bold py-1.5 px-3 rounded-xl border transition-colors cursor-pointer ${
                        prof.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                          : 'bg-rose-50 text-rose-700 border-rose-100/50'
                      }`}
                      title={prof.active ? 'Haga click para suspender / desactivar' : 'Haga click para activar'}
                    >
                      {prof.active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-rose-500" />}
                      <span>{prof.active ? 'Activo' : 'Suspendido'}</span>
                    </button>

                    {/* Delete employee */}
                    <button
                      onClick={() => handleDeleteProf(prof.id, prof.name)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl cursor-pointer"
                      title="Eliminar Empleado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form to Create Employees (Takes 1/3) */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-aesthetic-200/20">
            <UserPlus className="w-5 h-5 text-aesthetic-500" />
            <h3 className="font-bold text-[#332724] text-sm">Registrar Nuevo Empleado</h3>
          </div>

          <form onSubmit={handleCreateProfessional} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Nombre Completo *</label>
              <input 
                type="text" 
                value={newProf.name}
                onChange={e => setNewProf({...newProf, name: e.target.value})}
                placeholder="Ej. Dra. Mariana Juárez"
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]" 
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Especialidad / Cargo *</label>
              <input 
                type="text" 
                value={newProf.specialty}
                onChange={e => setNewProf({...newProf, specialty: e.target.value})}
                placeholder="Ej. Kinesióloga"
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]" 
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Rol de Acceso *</label>
              <select 
                value={newProf.role}
                onChange={e => setNewProf({...newProf, role: e.target.value as 'admin' | 'specialist'})}
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
              >
                <option value="specialist">Especialista (Solo operar)</option>
                <option value="admin">Administrador (Acceso total)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Contraseña PIN (4 dígitos) *</label>
              <input 
                type="password" 
                pattern="[0-9]{4}"
                maxLength={4}
                value={newProf.pin}
                onChange={e => setNewProf({...newProf, pin: e.target.value.replace(/\D/g, '')})}
                placeholder="Ej. 1234"
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724] tracking-widest text-center font-bold" 
                required
              />
            </div>

            <div className="p-4 bg-aesthetic-100/20 rounded-xl border border-aesthetic-200/10 text-[10px] text-aesthetic-600 font-semibold leading-relaxed flex items-start space-x-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-aesthetic-500 mt-0.5" />
              <p>Al agregar un nuevo empleado, estará disponible inmediatamente para ser asignado en la agenda de turnos, comisionar ventas directas y registrar firmas en fichas de tratamientos.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#332724] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Especialista</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
