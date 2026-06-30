import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MaterialStockPage from '../pages/raw-material/MaterialStockPage';
import ProductionPlanPage from '../pages/ppic/ProductionPlanPage';
import ProductionOutputPage from '../pages/production/ProductionOutputPage';
import DeliveryPage from '../pages/delivery/DeliveryPage';
import QCMainPage from '../pages/qc-repair/QCMainPage';
import RepairWorkshopPage from '../pages/qc-repair/RepairWorkshopPage';
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
          <Route path="/production" element={<ProductionOutputPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/qc-repair" element={<QCMainPage />} />
          <Route path="/repair-workshop" element={<RepairWorkshopPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
