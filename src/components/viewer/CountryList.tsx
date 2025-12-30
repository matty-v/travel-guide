import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountry } from '../../context/CountryContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function CountryList() {
  const navigate = useNavigate();
  const { countries, loading, error, fetchCountries, selectCountry, clearSelection } = useCountry();

  useEffect(() => {
    clearSelection();
    fetchCountries();
  }, [clearSelection, fetchCountries]);

  const handleCountryClick = async (slug: string) => {
    await selectCountry(slug);
    navigate(`/country/${slug}`);
  };

  if (loading && countries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchCountries}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-2">No Countries Yet</h2>
        <p className="text-gray-400">Check back soon for travel guides!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => handleCountryClick(country.slug)}
            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-gray-800"
          >
            <div
              className="aspect-[4/3] bg-gradient-to-br"
              style={{
                background: `linear-gradient(135deg, ${country.palette.primary}, ${country.palette.secondary})`,
              }}
            >
              {country.imageUrl ? (
                <img
                  src={country.imageUrl}
                  alt={country.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🌍</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                {country.name}
              </h3>
              {country.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {country.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
