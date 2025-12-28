import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useCountry } from '../../context/CountryContext';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedCountry } = useCountry();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {selectedCountry && (
          <>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed bottom-4 left-4 z-40 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>

            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
          </>
        )}

        <main className={`flex-1 ${selectedCountry ? 'lg:ml-0' : ''}`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
