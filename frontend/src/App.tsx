import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ServiceHub } from './pages/ServiceHub/ServiceHub';
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
  const { theme, sidebarOpen } = useSelector((state: RootState) => state.ui);
  const location = useLocation();

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

  const isMarketplacePage = location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/gems/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1 w-full">
        {isAuthenticated ? <Sidebar /> : null}
        <main
          className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${
            isMarketplacePage ? 'bg-gradient-to-br from-blue-100 via-slate-50 to-teal-100' : ''
          } ${
            isAuthenticated ? (sidebarOpen ? 'md:ml-64' : 'md:ml-20') : ''
          }`}
        >
          <div className="flex-1 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {isAuthenticated ? (
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
                  </Route>

                  {/* Buyer + Cutter routes */}
                  <Route element={<PrivateRoute allowedRoles={['BUYER', 'CUTTER']} />}>
                    <Route path="/service-hub" element={<ServiceHub />} />
                    <Route path="/service-hub/jobs" element={<ServiceHub />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/marketplace" element={<MarketplaceList />} />
                  <Route path="/gems/:id" element={<GemDetails />} />

                  {/* Redirect any protected route to login */}
                  <Route path="/dashboard" element={<Navigate to="/login" state={{ from: { pathname: '/dashboard' } }} replace />} />
                  <Route path="/orders" element={<Navigate to="/login" state={{ from: { pathname: '/orders' } }} replace />} />
                  <Route path="/orders/:id" element={<Navigate to="/login" replace />} />
                  <Route path="/disputes" element={<Navigate to="/login" state={{ from: { pathname: '/disputes' } }} replace />} />
                  <Route path="/service-hub" element={<Navigate to="/login" state={{ from: { pathname: '/service-hub' } }} replace />} />
                  <Route path="/service-hub/jobs" element={<Navigate to="/login" state={{ from: { pathname: '/service-hub/jobs' } }} replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
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