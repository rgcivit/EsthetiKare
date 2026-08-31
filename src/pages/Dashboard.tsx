import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Package, Wallet, Plus, 
  ShoppingCart, ArrowUpRight, Activity, Clock, CheckCircle 
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    clients, appointments, products, sales, cashSessions, 
    treatmentTypes, professionals, updateAppointmentStatus, currentUser
  } = useStore();

  // Active Cash Session
  const activeSession = cashSessions.find(s => s.status === 'open');
  
  // Calculate stats
  const activeClientsCount = clients.filter(c => c.active).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.dateTime.startsWith(todayStr));
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Cash Register balance
  let cashBalance = 0;
  if (activeSession) {
    const cashIn = activeSession.transactions
      .filter(t => t.type === 'income' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
    const cashOut = activeSession.transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
    cashBalance = activeSession.openingAmount + cashIn - cashOut;
  }

  // Treatment sales volume calculations
  const treatmentVolumes = treatmentTypes.map(t => {
    // Count completions in appointments
    const completedCount = appointments.filter(a => a.treatmentTypeId === t.id && a.status === 'completed').length;
    // Count sales in POS
    const posSalesCount = sales.reduce((sum, s) => {
      const item = s.items.find(i => i.id === t.id && (i.type === 'treatment' || i.type === 'pack'));
      return sum + (item ? item.quantity : 0);
    }, 0);
    return {
      name: t.name,
      total: completedCount + posSalesCount,
      revenue: (completedCount + posSalesCount) * t.price
    };
  }).sort((a, b) => b.total - a.total);

  const maxVolume = Math.max(...treatmentVolumes.map(t => t.total), 1);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-aesthetic-100/40 p-6 md:p-10 rounded-[2.5rem] border border-aesthetic-200/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden text-[#500732]">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-aesthetic-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-aesthetic-400/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div className="flex flex-col items-center relative z-10 w-full mb-4">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-2xl shadow-aesthetic-500/20 border-2 border-white/50">
            <img
              src="/logo.png"
              alt="EsthetiKare Pro"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center mt-6 flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
              ¡Hola, {currentUser?.name || 'Especialista'}!
            </h1>
            <p className="text-sm md:text-lg opacity-80 mt-2 font-semibold">
              Bienvenido de nuevo. Esto es lo que ocurre hoy, <br className="sm:hidden" />
              <span className="bg-white/40 px-3 py-1 rounded-full border border-white/50 inline-block mt-2 sm:mt-0">
                {new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/agenda')}
            className="inline-flex items-center space-x-2 bg-aesthetic-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-aesthetic-600 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Turno</span>
          </button>
          <button 
            onClick={() => navigate('/pos')}
            className="inline-flex items-center space-x-2 bg-sage-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-sage-600 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-aesthetic-600 uppercase tracking-wider">Turnos Hoy</span>
            <div className="p-2.5 rounded-xl bg-aesthetic-100/60 text-aesthetic-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight text-[#332724]">{todayAppointments.length}</h3>
            <p className="text-xs text-aesthetic-700/70 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-bold">{todayAppointments.filter(a => a.status === 'completed').length}</span>
              <span>completados hoy</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">Clientes Activos</span>
            <div className="p-2.5 rounded-xl bg-sage-100/60 text-sage-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight text-[#332724]">{activeClientsCount}</h3>
            <p className="text-xs text-sage-700/80 mt-1 flex items-center space-x-1">
              <span>De</span>
              <span className="font-bold text-sage-800">{clients.length}</span>
              <span>registrados totales</span>
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Stock Crítico</span>
            <div className={`p-2.5 rounded-xl ${lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-500' : 'bg-aesthetic-100/50 text-aesthetic-400'}`}>
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight text-[#332724]">{lowStockProducts.length}</h3>
            <p className="text-xs mt-1">
              {lowStockProducts.length > 0 ? (
                <span className="text-rose-500 font-bold">Requieren reposición</span>
              ) : (
                <span className="text-emerald-600 font-bold">Inventario al día</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#332724]/70 uppercase tracking-wider">Caja (Efectivo)</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-[#332724]">
              {activeSession ? `$${cashBalance.toLocaleString()}` : '$0.00'}
            </h3>
            <p className="text-xs mt-1 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${activeSession ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
              <span className="text-[#332724]/60">{activeSession ? 'Caja abierta' : 'Caja cerrada'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Queue (Main panel - 2/3 width) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-aesthetic-200/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-aesthetic-500" />
              <h2 className="text-lg font-bold text-[#332724]">Cola de Turnos (Hoy)</h2>
            </div>
            <button 
              onClick={() => navigate('/agenda')}
              className="text-xs font-bold text-aesthetic-600 hover:text-aesthetic-700 flex items-center space-x-1"
            >
              <span>Ver Agenda</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-aesthetic-200/20 flex-1 overflow-y-auto max-h-[420px]">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center text-aesthetic-500/70 flex flex-col items-center justify-center h-full">
                <Calendar className="w-12 h-12 text-aesthetic-200 mb-2" />
                <p className="text-sm font-semibold">No hay turnos registrados para hoy.</p>
              </div>
            ) : (
              todayAppointments.map((appt) => {
                const client = clients.find(c => c.id === appt.clientId);
                const prof = professionals.find(p => p.id === appt.professionalId);
                const treat = treatmentTypes.find(t => t.id === appt.treatmentTypeId);
                
                const timeStr = appt.dateTime.substring(11, 16);

                const statusColorMap = {
                  pending: 'bg-amber-50 text-amber-600 border-amber-200/60',
                  confirmed: 'bg-sky-50 text-sky-600 border-sky-200/60',
                  'in-progress': 'bg-purple-50 text-purple-600 border-purple-200/60 animate-pulse',
                  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
                  cancelled: 'bg-aesthetic-100/50 text-aesthetic-400 border-aesthetic-200/20 line-through',
                  'no-show': 'bg-rose-50 text-rose-500 border-rose-200/60'
                };

                const statusLabelMap = {
                  pending: 'Pendiente',
                  confirmed: 'Confirmado',
                  'in-progress': 'En Proceso',
                  completed: 'Completado',
                  cancelled: 'Cancelado',
                  'no-show': 'Ausente'
                };

                return (
                  <div key={appt.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-aesthetic-100/20 transition-colors">
                    <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                      <div className="text-sm font-extrabold text-aesthetic-800 bg-aesthetic-100/60 px-3 py-1.5 rounded-xl border border-aesthetic-200/30 shrink-0">
                        {timeStr} hs
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#332724]">
                          {client ? `${client.firstName} ${client.lastName}` : 'Cliente Anónimo'}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-aesthetic-600 font-semibold">
                          <span className="text-aesthetic-800">{treat?.name || 'Tratamiento'}</span>
                          <span>•</span>
                          <span>{prof?.name || 'Profesional'}</span>
                          {appt.cabinetId && (
                            <>
                              <span>•</span>
                              <span className="text-aesthetic-500 font-bold bg-aesthetic-100/30 px-2 py-0.5 rounded-md">Cabina asignada</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColorMap[appt.status]}`}>
                        {statusLabelMap[appt.status]}
                      </span>
                      
                      {/* State transitions inside Dashboard for convenience */}
                      {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                        <div className="flex items-center space-x-1">
                          {appt.status === 'pending' || appt.status === 'confirmed' ? (
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, 'in-progress')}
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100/50 cursor-pointer"
                              title="Iniciar Sesión"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          ) : appt.status === 'in-progress' ? (
                            <button
                              onClick={() => {
                                updateAppointmentStatus(appt.id, 'completed');
                                navigate('/clientes'); // Redirect to clinical record to fill params
                              }}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100/50 cursor-pointer"
                              title="Completar y Registrar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Treatments (Sidebar panel - 1/3 width) */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-aesthetic-500" />
            <h2 className="text-lg font-bold text-[#332724]">Tratamientos Más Vendidos</h2>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-[420px]">
            {treatmentVolumes.slice(0, 5).map((t, idx) => {
              const percentage = Math.round((t.total / maxVolume) * 100);
              return (
                <div key={t.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-aesthetic-700">
                    <span className="truncate max-w-[180px]">
                      {idx + 1}. {t.name}
                    </span>
                    <span className="text-aesthetic-500">
                      {t.total} {t.total === 1 ? 'vta' : 'vtas'}
                    </span>
                  </div>
                  {/* Custom CSS Bar Chart */}
                  <div className="w-full h-2 rounded-full bg-aesthetic-100/60 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-aesthetic-300 to-aesthetic-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
