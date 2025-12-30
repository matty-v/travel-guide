import { useEffect } from 'react';
import { useCountry } from '../../context/CountryContext';
import { useContent } from '../../hooks/useContent';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { PDFViewer } from './PDFViewer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || '';

export function ContentView() {
  const { selectedCountry, selectedMenuItem } = useCountry();
  const { content, loading, error, loadContent } = useContent();

  useEffect(() => {
    if (selectedCountry && !selectedMenuItem) {
      // Load landing page content
      loadContent(selectedCountry.slug, '_landing.md');
    } else if (selectedCountry && selectedMenuItem && selectedMenuItem.contentType !== 'pdf') {
      // Load regular menu item content
      loadContent(selectedCountry.slug, selectedMenuItem.contentPath);
    }
  }, [selectedCountry, selectedMenuItem, loadContent]);

  // Show country landing page if no menu item selected
  if (!selectedMenuItem) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        {selectedCountry ? (
          content ? (
            <MarkdownRenderer content={content.markdown} />
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                Welcome to {selectedCountry.name}
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                Select a location from the menu to explore.
              </p>

              {selectedCountry.menuItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCountry.menuItems
                    .filter((item) => item.type === 'region')
                    .sort((a, b) => a.order - b.order)
                    .map((region) => (
                      <div
                        key={region.id}
                        className="p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700"
                      >
                        <h3 className="font-semibold text-gray-100">{region.title}</h3>
                        {region.children && region.children.length > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            {region.children.length} cities
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )
        ) : (
          <p className="text-gray-400">Loading country information...</p>
        )}
      </div>
    );
  }

  // PDF Content
  if (selectedMenuItem.contentType === 'pdf') {
    const pdfUrl = `${API_URL}/pdf/${selectedCountry?.slug}/${selectedMenuItem.contentPath}`;

    return (
      <div className="w-full">
        <div className="mb-6">
          <span className="text-sm text-gray-400 uppercase tracking-wide">
            {selectedMenuItem.type}
          </span>
          <h1 className="text-3xl font-bold text-gray-100">{selectedMenuItem.title}</h1>
        </div>

        <PDFViewer url={pdfUrl} />
      </div>
    );
  }

  // Markdown Content
  if (loading) {
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
          onClick={() =>
            selectedCountry &&
            loadContent(selectedCountry.slug, selectedMenuItem.contentPath)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {content ? (
        <MarkdownRenderer content={content.markdown} />
      ) : (
        <p className="text-gray-400">No content available for this location.</p>
      )}
    </div>
  );
}
