import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Country, MenuItem } from '../types';

interface CountryContextType {
  countries: Country[];
  selectedCountry: Country | null;
  selectedMenuItem: MenuItem | null;
  loading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
  selectCountry: (slug: string) => Promise<void>;
  selectMenuItem: (item: MenuItem) => void;
  clearMenuItem: () => void;
  clearSelection: () => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCountry = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    setSelectedMenuItem(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/countries/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch country');
      const data = await response.json();
      setSelectedCountry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectMenuItem = useCallback((item: MenuItem) => {
    setSelectedMenuItem(item);
  }, []);

  const clearMenuItem = useCallback(() => {
    setSelectedMenuItem(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCountry(null);
    setSelectedMenuItem(null);
  }, []);

  return (
    <CountryContext.Provider
      value={{
        countries,
        selectedCountry,
        selectedMenuItem,
        loading,
        error,
        fetchCountries,
        selectCountry,
        selectMenuItem,
        clearMenuItem,
        clearSelection,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
