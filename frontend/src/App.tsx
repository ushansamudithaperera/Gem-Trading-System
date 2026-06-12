import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setLoading, setUser, logout } from './store/slices/authSlice';
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
import { ServiceHub } from './pages/ServiceHub/ServiceHub';
import { MyOrders } from './pages/Orders/MyOrders';
import { OrderDetails } from './pages/Orders/OrderDetails';
import { DisputeCenter } from './pages/Disputes/DisputeCenter';
import { BuyerDashboard } from './pages/Dashboard/BuyerDashboard';
import { SellerDashboard } from './pages/Dashboard/SellerDashboard';
import { CutterDashboard } from './pages/Dashboard/CutterDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import { Bids } from './pages/Bids/Bids';
import { Settings } from './pages/Settings/Settings';
import { AdminKYC } from './pages/Admin/AdminKYC';
import { UserManagement } from './pages/Admin/UserManagement';
import { AllSystemOrders } from './pages/Admin/AllSystemOrders';
import { Wallet } from './pages/Wallet/Wallet';

// Common Components
import { PrivateRoute } from './components/common/PrivateRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { theme, sidebarOpen } = useSelector((state: RootState) => state.ui);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const user = await getCurrentUser();
          dispatch(setUser(user));
        } catch (error) {
          sessionStorage.removeItem('token');
          dispatch(logout());
        }
      } else {
        dispatch(logout());
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

  // Unauthenticated layout
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col">
              <Landing />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Marketplace - Sticky Wrapper (No Footer) */}
        <Route path="/marketplace" element={
          <div className="min-h-screen flex flex-col premium-bg">
            <Header />
            <main className="flex-1 flex flex-col">
              <div className="flex-1 p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                  <MarketplaceList />
                </div>
              </div>
            </main>
          </div>
        } />

        {/* Public Gem Details - Sticky Wrapper (No Footer) */}
        <Route path="/gems/:id" element={
          <div className="min-h-screen flex flex-col premium-bg">
            <Header />
            <main className="flex-1 flex flex-col">
              <div className="flex-1 p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                  <GemDetails />
                </div>
              </div>
            </main>
          </div>
        } />

        {/* Redirect any protected route to login */}
        <Route path="/dashboard" element={<Navigate to="/login" state={{ from: { pathname: '/dashboard' } }} replace />} />
        <Route path="/orders" element={<Navigate to="/login" state={{ from: { pathname: '/orders' } }} replace />} />
        <Route path="/orders/:id" element={<Navigate to="/login" replace />} />
        <Route path="/disputes" element={<Navigate to="/login" state={{ from: { pathname: '/disputes' } }} replace />} />
        <Route path="/bids" element={<Navigate to="/login" state={{ from: { pathname: '/bids' } }} replace />} />
        <Route path="/service-hub" element={<Navigate to="/login" state={{ from: { pathname: '/service-hub' } }} replace />} />
        <Route path="/service-hub/jobs" element={<Navigate to="/login" state={{ from: { pathname: '/service-hub/jobs' } }} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Authenticated layout
  return (
    <div className="h-screen flex flex-col overflow-hidden premium-bg">
      {!isAuthPage && <Header />}
      <div className="flex flex-1 overflow-hidden w-full relative">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="flex-1 p-6 md:p-8 animate-contentReveal">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* Home redirects to marketplace when logged in */}
                <Route path="/" element={<Navigate to="/marketplace" replace />} />

                {/* Public routes accessible when logged in too */}
                <Route path="/marketplace" element={<MarketplaceList />} />
                <Route path="/gems/:id" element={<GemDetails />} />

                {/* Auth routes redirect to dashboard when already logged in */}
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/register" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={
                    user?.roles.includes('ADMIN') ? <AdminDashboard /> :
                      user?.roles.includes('SELLER') ? <SellerDashboard /> :
                        user?.roles.includes('CUTTER') ? <CutterDashboard /> :
                          <BuyerDashboard />
                  } />
                   <Route path="/orders" element={<MyOrders />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/disputes" element={<DisputeCenter />} />
                  <Route path="/bids" element={<Bids />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/:tab" element={<Settings />} />
                </Route>

                {/* Admin-only routes */}
                <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/kyc" element={<AdminKYC />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/orders" element={<AllSystemOrders />} />
                </Route>

                {/* Buyer + Seller + Cutter routes */}
                <Route element={<PrivateRoute allowedRoles={['BUYER', 'SELLER', 'CUTTER']} />}>
                  <Route path="/service-hub" element={<ServiceHub />} />
                  <Route path="/service-hub/jobs" element={<ServiceHub />} />
                </Route>

                {/* Seller + Cutter routes */}
                <Route element={<PrivateRoute allowedRoles={['SELLER', 'CUTTER']} />}>
                  <Route path="/wallet" element={<Wallet />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
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