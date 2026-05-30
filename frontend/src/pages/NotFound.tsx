import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '../components/ui/Button';
import { Home, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-white to-slate-50">
      <div className="text-9xl font-bold text-emerald-200">404</div>
      <h1 className="text-2xl font-bold text-slate-900 mt-4">Page not found</h1>
      <p className="text-slate-600 mt-2 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <div className="flex gap-3 mt-6">
        <Link to={isAuthenticated ? '/marketplace' : '/'}>
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            <Home className="h-4 w-4 mr-2" />
            {isAuthenticated ? 'Go to Marketplace' : 'Go Home'}
          </Button>
        </Link>
        {!isAuthenticated && (
          <Link to="/marketplace">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Search className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Search className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};