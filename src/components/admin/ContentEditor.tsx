import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import type { Country, MenuItem } from '../../types';
import { fetchCountries, fetchContent, saveContent } from '../../services/api';
import { invalidateCache } from '../../services/cache';
import { LoadingSpinner } from '../common/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || '';

export function ContentEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry && selectedItem) {
      if (selectedItem.contentType === 'pdf') {
        // Check if PDF exists
        checkPdfExists();
      } else {
        loadContent();
      }
    }
  }, [selectedCountry, selectedItem]);

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

  const checkPdfExists = async () => {
    if (!selectedCountry || !selectedItem) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/pdf/${selectedCountry.slug}/${selectedItem.contentPath}`,
        { method: 'HEAD' }
      );
      if (response.ok) {
        setUploadedPdf(`${API_URL}/pdf/${selectedCountry.slug}/${selectedItem.contentPath}`);
      } else {
        setUploadedPdf(null);
      }
    } catch {
      setUploadedPdf(null);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    if (!selectedCountry || !selectedItem) return;

    setLoading(true);
    try {
      const data = await fetchContent(selectedCountry.slug, selectedItem.contentPath);
      setContent(data.markdown);
      setHasChanges(false);
    } catch {
      setContent('# ' + selectedItem.title + '\n\nStart writing your content here...');
      setHasChanges(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCountry || !selectedItem) return;

    setSaving(true);
    try {
      await saveContent(selectedCountry.slug, selectedItem.contentPath, content);
      await invalidateCache(selectedCountry.slug, selectedItem.contentPath);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    setContent(value || '');
    setHasChanges(true);
  };

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });

      let markdown = turndownService.turndown(result.value);

      if (!markdown.startsWith('#')) {
        const title = file.name.replace(/\.docx$/i, '').replace(/[-_]/g, ' ');
        markdown = `# ${title}\n\n${markdown}`;
      }

      setContent(markdown);
      setHasChanges(true);

      if (result.messages.length > 0) {
        console.warn('Conversion warnings:', result.messages);
      }
    } catch (error) {
      console.error('Failed to convert docx:', error);
      alert('Failed to convert the document. Please try again.');
    } finally {
      setConverting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCountry || !selectedItem) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${API_URL}/admin/upload/${selectedCountry.slug}/${selectedItem.contentPath}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadedPdf(`${API_URL}/pdf/${selectedCountry.slug}/${selectedItem.contentPath}?t=${Date.now()}`);
      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setSaving(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  if (loading && countries.length === 0) {
    return <LoadingSpinner size="lg" />;
  }

  const isPdfContent = selectedItem?.contentType === 'pdf';

  return (
    <div className="max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-100">Content Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          {selectedItem && !isPdfContent && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleDocxUpload}
                className="hidden"
                id="docx-upload"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={converting}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {converting ? 'Converting...' : 'Upload .docx'}
              </button>
            </>
          )}
          {hasChanges && !isPdfContent && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <select
            value={selectedCountry?.slug || ''}
            onChange={(e) => {
              const country = countries.find((c) => c.slug === e.target.value);
              setSelectedCountry(country || null);
              setSelectedItem(null);
              setContent('');
              setUploadedPdf(null);
            }}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg"
          >
            <option value="">Select country...</option>
            {countries.map((country) => (
              <option key={country.id} value={country.slug}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content Item
          </label>
          <select
            value={selectedItem?.id || ''}
            onChange={(e) => {
              if (e.target.value === '_landing') {
                // Special landing page item
                setSelectedItem({
                  id: '_landing',
                  type: 'region',
                  title: `${selectedCountry?.name} Landing Page`,
                  slug: '_landing',
                  contentType: 'markdown',
                  contentPath: '_landing.md',
                  order: -1,
                } as MenuItem);
              } else {
                const item = selectedCountry?.menuItems.find((i) => i.id === e.target.value);
                setSelectedItem(item || null);
              }
              setContent('');
              setUploadedPdf(null);
            }}
            disabled={!selectedCountry}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg disabled:opacity-50"
          >
            <option value="">Select item...</option>
            {selectedCountry && (
              <option value="_landing">🏠 {selectedCountry.name} Landing Page</option>
            )}
            {selectedCountry?.menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.type === 'region' ? '📍' : item.type === 'city' ? '🏙️' : '🏛️'}{' '}
                {item.title}
                {item.contentType === 'pdf' ? ' [PDF]' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PDF Content Editor */}
      {selectedItem && isPdfContent && (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              PDF Content: {selectedItem.title}
            </h3>

            {uploadedPdf ? (
              <div className="mb-6">
                <p className="text-green-400 mb-4">PDF is uploaded</p>
                <a
                  href={uploadedPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View current PDF
                </a>
              </div>
            ) : (
              <p className="text-gray-400 mb-6">No PDF uploaded yet</p>
            )}

            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handlePdfUpload}
              className="hidden"
              id="pdf-upload"
            />
            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Uploading...' : uploadedPdf ? 'Replace PDF' : 'Upload PDF'}
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Accepts .pdf or .docx files (DOCX will be converted to PDF)
            </p>
          </div>
        </div>
      )}

      {/* Markdown Content Editor */}
      {selectedItem && !isPdfContent && (
        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height={500}
            preview="live"
          />
        </div>
      )}

      {!selectedItem && selectedCountry && (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">Select a content item to start editing</p>
        </div>
      )}

      {!selectedCountry && (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">Select a country to view its content items</p>
        </div>
      )}
    </div>
  );
}
