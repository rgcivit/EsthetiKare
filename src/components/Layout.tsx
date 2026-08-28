import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Package, ShoppingCart,
  Wallet, Menu, X, User, AlertTriangle, Settings, UserCheck, LogOut,
  KeyRound, HardDrive, Zap, BookOpen
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cashSessions, products, currentUser, logout, updateProfessional } = useStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // States for PIN changing
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (!currentUser) return;

    if (currentPin !== currentUser.pin) {
      setPinError("El PIN actual es incorrecto.");
      return;
    }

    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setPinError("El nuevo PIN debe tener exactamente 4 dígitos numéricos.");
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinError("La confirmación del nuevo PIN no coincide.");
      return;
    }

    if (newPin === currentUser.pin) {
      setPinError("El nuevo PIN debe ser diferente al actual.");
      return;
    }

    updateProfessional(currentUser.id, { pin: newPin });
    setPinSuccess("¡PIN actualizado con éxito!");
    
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');

    setTimeout(() => {
      setIsChangingPin(false);
      setPinSuccess(null);
    }, 1500);
  };

  const handleLogoutAttempt = () => {
    const isRegisterOpen = cashSessions.some((s) => s.status === 'open');

    if (isRegisterOpen) {
      const confirmArqueo = window.confirm(
        "¡ATENCIÓN! La Caja Diaria se encuentra ABIERTA.\n\nSe recomienda realizar el arqueo y cierre de caja para que el próximo especialista pueda iniciar su turno con un balance limpio.\n\n¿Deseas ir al módulo de Caja para realizar el arqueo y cierre ahora?\n\n- ACEPTAR: Sí, ir a Caja a hacer Arqueo.\n- CANCELAR: Cerrar sesión de todos modos sin cerrar caja."
      );

      if (confirmArqueo) {
        navigate('/caja');
        return;
      }
    } else {
      if (!window.confirm("¿Deseas cerrar tu sesión y bloquear la terminal?")) {
        return;
      }
    }

    logout();
  };

  const activeSession = cashSessions.find((s) => s.status === 'open');
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  const isAdmin = currentUser?.role === 'admin';

  // 10 minutes of inactivity auto-logout (Auto-suspension)
  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      // 10 minutes = 10 * 60 * 1000 ms
      timeoutId = window.setTimeout(() => {
        logout();
        alert("Sesión suspendida por inactividad. Ingrese su PIN de nuevo.");
      }, 10 * 60 * 1000);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup listeners
    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Fichas', href: '/clientes', icon: Users },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Equipos', href: '/equipos', icon: HardDrive },
    { name: 'Reactivación', href: '/marketing', icon: Zap },
    { name: 'Inventario', href: '/inventario', icon: Package },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Manual', href: '/MANUAL_DE_USUARIO.html', icon: BookOpen, external: true },
    { name: 'Caja', href: '/caja', icon: Wallet },
    ...(isAdmin ? [
      { name: 'Especialistas', href: '/empleados', icon: UserCheck },
      { name: 'Ajustes', href: '/config', icon: Settings },
    ] : []),
  ];

  return (
    <div className="min-h-screen flex bg-[#faf6f7] text-[#500732]">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-aesthetic-100/40 border-r border-aesthetic-200/30 shrink-0 backdrop-blur-md">
        {/* Logo / Brand */}
        <div className="h-16 flex items-center px-6 border-b border-aesthetic-200/20">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="EsthetiKare Logo"
              className="w-9 h-9 rounded-lg shadow-sm object-contain bg-white p-0.5"
            />
            <span className="text-lg font-bold tracking-tight text-aesthetic-900">
              Estheti<span className="text-aesthetic-500 font-black">Kare</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item: any) => {
            const isActive = location.pathname === item.href;
            if (item.external) {
              return (
                <button
                  key={item.name}
                  onClick={() => window.location.href = item.href}
                  className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-aesthetic-700/80 hover:bg-aesthetic-100/50 hover:text-aesthetic-900 border-none bg-transparent cursor-pointer text-left"
                >
                  <item.icon className="w-5 h-5 text-aesthetic-400/80" />
                  <span>{item.name}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-aesthetic-200/40 text-aesthetic-800 shadow-sm border-l-4 border-aesthetic-500'
                    : 'text-aesthetic-700/80 hover:bg-aesthetic-100/50 hover:text-aesthetic-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-aesthetic-500' : 'text-aesthetic-400/80'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Manual Lock/Logout Button in Desktop Sidebar */}
        <div className="px-4 py-2 border-t border-aesthetic-200/10">
          <button
            onClick={handleLogoutAttempt}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-100/50 cursor-pointer text-left"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>Cerrar Sesión / Bloquear</span>
          </button>
        </div>

        {/* Footer Area with Cash Register Indicator */}
        <div className="p-4 border-t border-aesthetic-200/20 bg-aesthetic-100/10">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-aesthetic-200/20 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-bold text-aesthetic-800">Caja Diaria</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
              activeSession 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                : 'bg-amber-50 text-amber-600 border border-amber-100/50'
            }`}>
              {activeSession ? 'ABIERTA' : 'CERRADA'}
            </span>
          </div>
        </div>

        {/* Author & Copyright Footer */}
        <div className="px-6 py-4 border-t border-aesthetic-200/20 bg-aesthetic-100/20 text-center">
          <p className="text-[10px] text-aesthetic-600 font-semibold">
            Desarrollado por: <span className="font-bold text-aesthetic-800">Rodrigo Guevara Civit</span>
          </p>
          <p className="text-[9px] text-aesthetic-400/80 font-medium mt-0.5">
            © 2026 Todos los derechos reservados
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0"> 
        {/* pb-16 ensures mobile content doesn't get hidden behind bottom bar */}
        
        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 bg-aesthetic-50/70 border-b border-aesthetic-200/20 flex items-center justify-between px-4 shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="EsthetiKare Logo"
              className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 shadow-sm"
            />
            <span className="text-lg font-bold text-aesthetic-900">EsthetiKare</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Low stock indicators */}
            {lowStockItems.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-100/50 text-rose-600 px-2 py-1 rounded-full text-[10px] font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Stock ({lowStockItems.length})</span>
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-aesthetic-700 hover:bg-aesthetic-100/50 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* DESKTOP HEADER (Optional breadcrumbs/profile view) */}
        <header className="hidden md:flex h-16 bg-aesthetic-50/70 border-b border-aesthetic-200/20 items-center justify-between px-8 shrink-0 z-10 backdrop-blur-md">
           <div className="flex items-center space-x-1 text-xs text-aesthetic-400 font-bold uppercase tracking-wider">
              <span>Módulo</span>
              <span>/</span>
              <span className="text-aesthetic-600">
                {navigation.find((n) => n.href === location.pathname)?.name || 'Detalle'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {lowStockItems.length > 0 && (
                <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-100/50 text-rose-600 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stock Bajo ({lowStockItems.length})</span>
                </div>
              )}
              
              {/* Dynamic User Profile from currentUser store with interactive dropdown */}
              <div className="relative pl-2 border-l border-aesthetic-200/20">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-left hover:bg-aesthetic-100/40 p-1.5 rounded-xl transition-all cursor-pointer focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-aesthetic-100 border border-aesthetic-200/50 flex items-center justify-center text-aesthetic-600 font-semibold text-sm shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-aesthetic-800 leading-tight">{currentUser?.name || 'Invitado'}</p>
                    <p className="text-[9px] text-aesthetic-500 font-bold uppercase tracking-wide leading-tight">
                      {currentUser?.role === 'admin' ? 'Administrador' : currentUser?.specialty}
                    </p>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Absolute overlay for clicking outside */}
                    <div 
                      className="fixed inset-0 z-30 cursor-default" 
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-[#faf6f7] border border-aesthetic-200/30 rounded-2xl shadow-xl z-40 py-2 animate-slide-in">
                      <div className="px-4 py-2 border-b border-aesthetic-100/50">
                        <p className="text-[9px] font-bold text-aesthetic-500 uppercase tracking-wider">Mi Cuenta</p>
                        <p className="text-xs font-bold text-aesthetic-800 truncate">{currentUser?.name}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsChangingPin(true);
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-aesthetic-700 hover:bg-aesthetic-200/40 hover:text-aesthetic-900 transition-colors cursor-pointer border-none text-left"
                      >
                        <KeyRound className="w-4 h-4 text-aesthetic-500" />
                        <span>Cambiar PIN</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogoutAttempt();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-aesthetic-100/30 border-none text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión / Bloquear</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-aesthetic-200/30 flex items-center justify-around px-2 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navigation.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-aesthetic-600' : 'text-aesthetic-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-aesthetic-500 fill-aesthetic-100' : ''}`} />
              <span className={`text-[9px] font-bold ${isActive ? 'text-aesthetic-600' : 'text-aesthetic-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* MOBILE FULL MENU DRAWER (For extra links like Settings, Employees & Caja) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#500732]/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 w-64 bg-aesthetic-50 shadow-2xl flex flex-col p-6 animate-slide-in border-l border-aesthetic-200/20">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-aesthetic-400 hover:bg-aesthetic-100"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-aesthetic-900">Menú</span>
              </div>
            </div>

            {/* Current Mobile Profile */}
            <div className="mb-6 p-4 rounded-2xl bg-white/70 border border-aesthetic-200/10 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-aesthetic-100 flex items-center justify-center text-aesthetic-600 font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#332724] truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-aesthetic-500 font-medium truncate uppercase">{currentUser?.role === 'admin' ? 'Administrador' : currentUser?.specialty}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsChangingPin(true);
                }}
                className="p-2 rounded-xl bg-aesthetic-100 text-aesthetic-600 hover:bg-aesthetic-200 transition-colors cursor-pointer border-none"
                title="Cambiar PIN"
              >
                <KeyRound className="w-4 h-4 text-aesthetic-500" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navigation.map((item: any) => {
                const isActive = location.pathname === item.href;
                if (item.external) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.href = item.href;
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-aesthetic-700/80 hover:bg-aesthetic-100/50 border-none bg-transparent cursor-pointer text-left"
                    >
                      <item.icon className="w-5 h-5 text-aesthetic-400" />
                      <span>{item.name}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-aesthetic-200/40 text-aesthetic-800'
                        : 'text-aesthetic-700/80 hover:bg-aesthetic-100/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-aesthetic-500' : 'text-aesthetic-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile LogOut Button */}
            <div className="my-4 pt-3 border-t border-aesthetic-200/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogoutAttempt();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent cursor-pointer text-left"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                <span>Cerrar Sesión / Bloquear</span>
              </button>
            </div>

            <div className="pt-4 border-t border-aesthetic-200/20">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-aesthetic-200/20 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${activeSession ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-xs font-bold text-aesthetic-800">Caja Diaria</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  activeSession ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {activeSession ? 'ABIERTA' : 'CERRADA'}
                </span>
              </div>
            </div>

            {/* Author & Copyright Mobile Footer */}
            <div className="mt-4 pt-3 border-t border-aesthetic-200/20 text-center">
              <p className="text-[10px] text-aesthetic-600 font-semibold">
                Desarrollado por: <span className="font-bold text-aesthetic-800">Rodrigo Guevara Civit</span>
              </p>
              <p className="text-[9px] text-aesthetic-400/80 font-medium mt-0.5">
                © 2026 Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PIN CHANGE MODAL */}
      {isChangingPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#500732]/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-aesthetic-200/20 space-y-5 animate-slide-in">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-aesthetic-200/10">
              <KeyRound className="w-5 h-5 text-aesthetic-500" />
              <h3 className="font-bold text-[#332724] text-sm uppercase tracking-wider">Cambiar PIN de Acceso</h3>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200/50 text-rose-600 text-xs font-bold rounded-xl text-center">
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/50 text-emerald-600 text-xs font-bold rounded-xl text-center">
                {pinSuccess}
              </div>
            )}

            <form onSubmit={handlePinChangeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">PIN Actual (4 dígitos)</label>
                <input
                  type="password"
                  pattern="\d*"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCurrentPin(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm font-bold bg-[#faf6f7] text-center tracking-[0.5em] focus:outline-none focus:border-aesthetic-400 text-[#332724]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Nuevo PIN (4 dígitos)</label>
                <input
                  type="password"
                  pattern="\d*"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setNewPin(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm font-bold bg-[#faf6f7] text-center tracking-[0.5em] focus:outline-none focus:border-aesthetic-400 text-[#332724]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Confirmar Nuevo PIN (4 dígitos)</label>
                <input
                  type="password"
                  pattern="\d*"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setConfirmNewPin(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm font-bold bg-[#faf6f7] text-center tracking-[0.5em] focus:outline-none focus:border-aesthetic-400 text-[#332724]"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setCurrentPin('');
                    setNewPin('');
                    setConfirmNewPin('');
                    setPinError(null);
                    setPinSuccess(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#faf6f7] text-aesthetic-600 hover:bg-aesthetic-100 rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-aesthetic-500 hover:bg-aesthetic-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-none"
                >
                  Actualizar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
