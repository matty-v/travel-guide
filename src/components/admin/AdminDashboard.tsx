import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">You need to be logged in as admin.</p>
        <Link
          to="/admin/login"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/countries"
          className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all"
        >
          <div className="text-3xl mb-3">🌍</div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Manage Countries
          </h2>
          <p className="text-gray-400">
            Add, edit, or remove countries from the travel guide.
          </p>
        </Link>

        <Link
          to="/admin/content"
          className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all"
        >
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Edit Content
          </h2>
          <p className="text-gray-400">
            Create and manage markdown content for locations.
          </p>
        </Link>

        <Link
          to="/admin/menu"
          className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Menu Structure
          </h2>
          <p className="text-gray-400">
            Organize regions, cities, and sights in the navigation menu.
          </p>
        </Link>

        <Link
          to="/admin/palette"
          className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all"
        >
          <div className="text-3xl mb-3">🎨</div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Color Palettes
          </h2>
          <p className="text-gray-400">
            Customize the look and feel for each country.
          </p>
        </Link>
      </div>
    </div>
  );
}
