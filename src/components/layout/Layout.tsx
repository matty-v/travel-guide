import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useCountry } from '../../context/CountryContext';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedCountry } = useCountry();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const showSidebar = !!selectedCountry && !isAdminRoute;

  return (
    <div className="min-h-screen bg-gray-900">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}

      <div
        className={`transition-all duration-300 min-w-0 ${
          showSidebar ? (sidebarOpen ? 'ml-72' : 'ml-16') : 'ml-0'
        }`}
      >
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
