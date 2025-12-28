import { useState, useEffect } from 'react';
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Countries</h1>
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
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{country.name}</h3>
              <p className="text-sm text-gray-500">/{country.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCountry(country)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(country.slug)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
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
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">
        {country ? 'Edit Country' : 'Add New Country'}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
            disabled={!!country}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={2}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
