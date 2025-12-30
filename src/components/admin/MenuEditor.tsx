import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Country, MenuItem, ContentType } from '../../types';
import { fetchCountries, updateMenuItem } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function MenuEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await fetchCountries();
      setCountries(data);
      if (data.length > 0) {
        setSelectedCountry(data[0]);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !selectedCountry) return;

    const items = [...selectedCountry.menuItems];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSelectedCountry({ ...selectedCountry, menuItems: updatedItems });

    setSaving(true);
    try {
      await updateMenuItem(selectedCountry.slug, updatedItems);
    } catch (error) {
      console.error('Failed to update menu:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async (item: Omit<MenuItem, 'id' | 'order'>) => {
    if (!selectedCountry) return;

    const newItem: MenuItem = {
      ...item,
      id: crypto.randomUUID(),
      order: selectedCountry.menuItems.length,
    };

    const updatedItems = [...selectedCountry.menuItems, newItem];
    setSelectedCountry({ ...selectedCountry, menuItems: updatedItems });
    setIsAddingItem(false);

    try {
      await updateMenuItem(selectedCountry.slug, updatedItems);
    } catch (error) {
      console.error('Failed to add menu item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedCountry || !confirm('Delete this menu item?')) return;

    const updatedItems = selectedCountry.menuItems.filter((i) => i.id !== itemId);
    setSelectedCountry({ ...selectedCountry, menuItems: updatedItems });

    try {
      await updateMenuItem(selectedCountry.slug, updatedItems);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
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
          <h1 className="text-2xl font-bold text-gray-100">Menu Structure</h1>
        </div>
        {saving && <span className="text-sm text-gray-400">Saving...</span>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Country
        </label>
        <select
          value={selectedCountry?.slug || ''}
          onChange={(e) => {
            const country = countries.find((c) => c.slug === e.target.value);
            setSelectedCountry(country || null);
          }}
          className="w-full max-w-xs px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
        >
          {countries.map((country) => (
            <option key={country.id} value={country.slug}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <>
          <button
            onClick={() => setIsAddingItem(true)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Menu Item
          </button>

          {isAddingItem && (
            <MenuItemForm
              onSubmit={handleAddItem}
              onCancel={() => setIsAddingItem(false)}
            />
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {selectedCountry.menuItems
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 mb-2 bg-gray-800 rounded-lg shadow-sm border border-gray-700 ${
                              snapshot.isDragging ? 'shadow-lg border-gray-600' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 cursor-grab">⠿</span>
                                <span className="text-lg">
                                  {item.type === 'region'
                                    ? '📍'
                                    : item.type === 'city'
                                    ? '🏙️'
                                    : '🏛️'}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-100">
                                    {item.title}
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                      item.contentType === 'pdf'
                                        ? 'bg-red-900 text-red-300'
                                        : 'bg-green-900 text-green-300'
                                    }`}>
                                      {item.contentType || 'markdown'}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-400">{item.contentPath}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  );
}

interface MenuItemFormProps {
  onSubmit: (item: Omit<MenuItem, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function MenuItemForm({ onSubmit, onCancel }: MenuItemFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'region' | 'city' | 'sight'>('region');
  const [slug, setSlug] = useState('');
  const [contentType, setContentType] = useState<ContentType>('markdown');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extension = contentType === 'pdf' ? '.pdf' : '.md';
    onSubmit({
      title,
      type,
      slug,
      contentType,
      contentPath: `${slug}${extension}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'region' | 'city' | 'sight')}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
          >
            <option value="region">Region</option>
            <option value="city">City</option>
            <option value="sight">Sight</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
          >
            <option value="markdown">Markdown</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-gray-100 rounded-lg hover:bg-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
