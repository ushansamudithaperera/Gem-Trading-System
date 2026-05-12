import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setLoading, setUser } from './store/slices/authSlice';
import { getCurrentUser } from './services/auth.service';
import './App-Light.css';  // Global light theme styles

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Landing } from './pages/Landing';
import { NotFound } from './pages/NotFound';
import { MarketplaceList } from './pages/Marketplace/MarketplaceList';
import { GemDetails } from './pages/Marketplace/GemDetails';
import { CutterList } from './pages/ServiceHub/CutterList';
import { CuttingJobs } from './pages/ServiceHub/CuttingJobs';
import { MyOrders } from './pages/Orders/MyOrders';
import { OrderDetails } from './pages/Orders/OrderDetails';
import { DisputeCenter } from './pages/Disputes/DisputeCenter';
import { BuyerDashboard } from './pages/Dashboard/BuyerDashboard';
import { SellerDashboard } from './pages/Dashboard/SellerDashboard';
import { CutterDashboard } from './pages/Dashboard/CutterDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

// Common Components
import { PrivateRoute } from './components/common/PrivateRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await getCurrentUser();
          dispatch(setUser(user));
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      dispatch(setLoading(false));
    };
    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Show landing page for unauthenticated users on root path
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<MarketplaceList />} />
        <Route path="/gems/:id" element={<GemDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-slate-50 to-teal-100">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 flex flex-col ${isAuthenticated ? 'md:ml-64' : ''}`}>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* Public Routes */}

                <Route path="/gems/:id" element={<GemDetails />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<MarketplaceList />} />
                  <Route path="/dashboard" element={
                    user?.roles.includes('ADMIN') ? <AdminDashboard /> :
                    user?.roles.includes('SELLER') ? <SellerDashboard /> :
                    user?.roles.includes('CUTTER') ? <CutterDashboard /> :
                    <BuyerDashboard />
                  } />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/disputes" element={<DisputeCenter />} />
                </Route>

                {/* Buyer + Seller + Cutter mixed routes */}
                <Route element={<PrivateRoute allowedRoles={['BUYER', 'CUTTER']} />}>
                  <Route path="/service-hub" element={<CutterList />} />
                  <Route path="/service-hub/jobs" element={<CuttingJobs />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;