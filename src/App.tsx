import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Agenda } from './pages/Agenda';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { CashRegister } from './pages/CashRegister';
import { Config } from './pages/Config';
import { Employees } from './pages/Employees';
import { Login } from './components/Login';

function App() {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/caja" element={<CashRegister />} />
          {/* Admin Protected Routes */}
          <Route path="/config" element={isAdmin ? <Config /> : <Navigate to="/" replace />} />
          <Route path="/empleados" element={isAdmin ? <Employees /> : <Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
