import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import { Layout } from './components/layout/Layout';
import { CountryList } from './components/viewer/CountryList';
import { CountryPage } from './components/viewer/CountryPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CountryManager } from './components/admin/CountryManager';
import { MenuEditor } from './components/admin/MenuEditor';
import { ContentEditor } from './components/admin/ContentEditor';
import { PaletteEditor } from './components/admin/PaletteEditor';
import './index.css';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CountryProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CountryList />} />
              <Route path="country/:slug" element={<CountryPage />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/countries" element={<CountryManager />} />
              <Route path="admin/menu" element={<MenuEditor />} />
              <Route path="admin/content" element={<ContentEditor />} />
              <Route path="admin/palette" element={<PaletteEditor />} />
            </Route>
          </Routes>
        </CountryProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
