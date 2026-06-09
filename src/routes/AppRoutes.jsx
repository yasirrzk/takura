import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MaterialStockPage from '../pages/raw-material/MaterialStockPage';
import ProductionPlanPage from '../pages/ppic/ProductionPlanPage';
import ProductionMonitorPage from '../pages/production-qc/ProductionMonitorPage';
import ProductStockPage from '../pages/finished-goods/ProductStockPage';
import useAuthStore from '../store/useAuthStore';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
      />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/raw-material" element={<MaterialStockPage />} />
          <Route path="/ppic" element={<ProductionPlanPage />} />
          <Route path="/production-qc" element={<ProductionMonitorPage />} />
          <Route path="/finished-goods" element={<ProductStockPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
