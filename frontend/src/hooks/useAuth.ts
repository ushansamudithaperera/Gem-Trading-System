import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/Toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const logoutUser = () => {
    dispatch(logout());
    sessionStorage.removeItem('token');
    toast.success('Logged out', 'You have been successfully logged out.');
    navigate('/login');
  };

  const checkRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const required = Array.isArray(roles) ? roles : [roles];
    return required.some(role => user.roles.includes(role));
  };

  return {
    user,
    isAuthenticated,
    loading,
    logoutUser,
    checkRole,
    isAdmin: user?.roles.includes('ADMIN') || false,
    isBuyer: user?.roles.includes('BUYER') || false,
    isSeller: user?.roles.includes('SELLER') || false,
    isCutter: user?.roles.includes('CUTTER') || false,
  };
};