import { useState, useEffect } from 'react';
import { DEFAULT_PALETTE } from '../../types';
import type { Country, ColorPalette } from '../../types';
import { fetchCountries, updateCountry } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function PaletteEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [palette, setPalette] = useState<ColorPalette>(DEFAULT_PALETTE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setPalette(selectedCountry.palette || DEFAULT_PALETTE);
      setHasChanges(false);
    }
  }, [selectedCountry]);

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

  const handleSave = async () => {
    if (!selectedCountry) return;

    setSaving(true);
    try {
      const updated = await updateCountry(selectedCountry.slug, { palette });
      setCountries(countries.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCountry(updated);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save palette:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    setPalette({ ...palette, [key]: value });
    setHasChanges(true);
  };

  const handleReset = () => {
    setPalette(DEFAULT_PALETTE);
    setHasChanges(true);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const colorFields: { key: keyof ColorPalette; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'text', label: 'Text' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Color Palettes</h1>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Country
        </label>
        <select
          value={selectedCountry?.slug || ''}
          onChange={(e) => {
            const country = countries.find((c) => c.slug === e.target.value);
            setSelectedCountry(country || null);
          }}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select country...</option>
          {countries.map((country) => (
            <option key={country.id} value={country.slug}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Colors</h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset to Default
              </button>
            </div>

            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                </div>
                <input
                  type="color"
                  value={palette[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={palette[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div
              className="rounded-lg p-4 border border-gray-200"
              style={{ backgroundColor: palette.background }}
            >
              <div
                className="rounded-lg p-4 mb-3"
                style={{ backgroundColor: palette.primary }}
              >
                <span className="text-white font-medium">Primary Header</span>
              </div>

              <div
                className="rounded-lg p-4 mb-3"
                style={{ backgroundColor: palette.secondary }}
              >
                <span className="text-white font-medium">Secondary Element</span>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: palette.accent }}
                >
                  Accent Button
                </button>
              </div>

              <p style={{ color: palette.text }}>
                This is sample text content that would appear in the navigation
                menu for {selectedCountry.name}.
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedCountry && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a country to edit its color palette</p>
        </div>
      )}
    </div>
  );
}
