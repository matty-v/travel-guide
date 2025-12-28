import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCountry } from '../../context/CountryContext';
import { ContentView } from './ContentView';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function CountryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { selectedCountry, loading, error, selectCountry } = useCountry();

  useEffect(() => {
    if (slug && (!selectedCountry || selectedCountry.slug !== slug)) {
      selectCountry(slug);
    }
  }, [slug, selectedCountry, selectCountry]);

  if (loading && !selectedCountry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => slug && selectCountry(slug)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedCountry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Country not found</p>
      </div>
    );
  }

  return <ContentView />;
}
