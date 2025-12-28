import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';

export function Header() {
  const { isAdmin, logout } = useAuth();
  const { selectedCountry, clearSelection } = useCountry();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={clearSelection}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            🌍 Travel Guide
          </Link>

          {selectedCountry && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-lg font-medium text-gray-700">
                {selectedCountry.name}
              </span>
            </>
          )}
        </div>

        <nav className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Admin Panel
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
