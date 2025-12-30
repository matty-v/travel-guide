import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_PALETTE } from '../../types';
import type { Country } from '../../types';
import { fetchCountries, createCountry, updateCountry, deleteCountry } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function CountryManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await fetchCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Country>) => {
    try {
      const newCountry = await createCountry({
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        imageUrl: data.imageUrl,
        palette: DEFAULT_PALETTE,
        menuItems: [],
      });
      setCountries([...countries, newCountry]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create country:', error);
    }
  };

  const handleUpdate = async (data: Partial<Country>) => {
    if (!editingCountry) return;
    try {
      const updated = await updateCountry(editingCountry.slug, data);
      setCountries(countries.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCountry(null);
    } catch (error) {
      console.error('Failed to update country:', error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;
    try {
      await deleteCountry(slug);
      setCountries(countries.filter((c) => c.slug !== slug));
    } catch (error) {
      console.error('Failed to delete country:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            title="Back to Admin Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-100">Manage Countries</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Country
        </button>
      </div>

      {(isCreating || editingCountry) && (
        <CountryForm
          country={editingCountry || undefined}
          onSubmit={editingCountry ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsCreating(false);
            setEditingCountry(null);
          }}
        />
      )}

      <div className="space-y-4">
        {countries.map((country) => (
          <div
            key={country.id}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700"
          >
            <div>
              <h3 className="font-semibold text-gray-100">{country.name}</h3>
              <p className="text-sm text-gray-400">/{country.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCountry(country)}
                className="px-3 py-1 text-sm text-blue-400 hover:bg-gray-700 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(country.slug)}
                className="px-3 py-1 text-sm text-red-400 hover:bg-gray-700 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CountryFormProps {
  country?: Country;
  onSubmit: (data: Partial<Country>) => void;
  onCancel: () => void;
}

function CountryForm({ country, onSubmit, onCancel }: CountryFormProps) {
  const [name, setName] = useState(country?.name || '');
  const [slug, setSlug] = useState(country?.slug || '');
  const [description, setDescription] = useState(country?.description || '');
  const [imageUrl, setImageUrl] = useState(country?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug, description, imageUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        {country ? 'Edit Country' : 'Add New Country'}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            required
            disabled={!!country}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {country ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-gray-100 rounded-lg hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
