import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import MaterialStockPage from '../pages/raw-material/MaterialStockPage';
import ProductionPlanPage from '../pages/ppic/ProductionPlanPage';
import ProductionMonitorPage from '../pages/production-qc/ProductionMonitorPage';
import ProductStockPage from '../pages/finished-goods/ProductStockPage';
import useAuthStore from '../store/useAuthStore';

const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      
      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/raw-material" element={<MaterialStockPage />} />
        <Route path="/ppic" element={<ProductionPlanPage />} />
        <Route path="/production-qc" element={<ProductionMonitorPage />} />
        <Route path="/finished-goods" element={<ProductStockPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
