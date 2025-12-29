import { useState } from 'react';
import { DEFAULT_PALETTE } from '../../types';
import type { MenuItem, ColorPalette } from '../../types';
import { useCountry } from '../../context/CountryContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const COLLAPSED_WIDTH = 'w-16';
const EXPANDED_WIDTH = 'w-72';

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { selectedCountry, selectedMenuItem, selectMenuItem, clearSelection } = useCountry();

  const palette = selectedCountry?.palette || DEFAULT_PALETTE;

  const typeIcons: Record<string, string> = {
    region: '📍',
    city: '🏙️',
    sight: '🏛️',
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 flex flex-col border-r border-gray-700 ${
        isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH
      }`}
      style={{ backgroundColor: palette.background }}
    >
      {/* Header with toggle button */}
      <div
        className="h-14 flex items-center border-b border-gray-200 shrink-0"
        style={{ borderColor: `${palette.text}15` }}
      >
        <button
          onClick={onToggle}
          className="w-16 h-full flex items-center justify-center text-gray-600 hover:bg-black hover:bg-opacity-5 transition-colors"
          style={{ color: palette.text }}
          title={isOpen ? 'Collapse menu' : 'Expand menu'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
        {isOpen && selectedCountry && (
          <div
            className="flex-1 font-bold text-lg truncate pr-4"
            style={{ color: palette.text }}
          >
            {selectedCountry.name}
          </div>
        )}
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={isOpen ? 'p-3' : 'py-3'}>
          {/* Menu items */}
          {selectedCountry && (
            <nav>
              <MiniMenuItemList
                items={selectedCountry.menuItems}
                palette={palette}
                selectedId={selectedMenuItem?.id}
                onSelect={selectMenuItem}
                isOpen={isOpen}
                typeIcons={typeIcons}
              />
            </nav>
          )}
        </div>
      </div>

      {/* Home link at bottom */}
      <div
        className={`shrink-0 border-t ${isOpen ? 'p-3' : 'py-3'}`}
        style={{ borderColor: `${palette.text}15` }}
      >
        <button
          onClick={() => {
            clearSelection();
            window.location.hash = '#/';
          }}
          className={`w-full flex items-center rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors ${
            isOpen ? 'gap-3 px-3 py-2' : 'justify-center py-3'
          }`}
          style={{ color: palette.text }}
          title="Home"
        >
          <span className="text-xl">🏠</span>
          {isOpen && <span className="font-medium">Home</span>}
        </button>
      </div>
    </aside>
  );
}

interface MiniMenuItemListProps {
  items: MenuItem[];
  palette: ColorPalette;
  selectedId?: string;
  onSelect: (item: MenuItem) => void;
  isOpen: boolean;
  typeIcons: Record<string, string>;
  depth?: number;
}

function MiniMenuItemList({
  items,
  palette,
  selectedId,
  onSelect,
  isOpen,
  typeIcons,
  depth = 0,
}: MiniMenuItemListProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <ul className={depth > 0 && isOpen ? 'ml-4 mt-1' : ''}>
      {sortedItems.map((item) => (
        <MiniMenuItemComponent
          key={item.id}
          item={item}
          palette={palette}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          isOpen={isOpen}
          typeIcons={typeIcons}
          depth={depth}
        />
      ))}
    </ul>
  );
}

interface MiniMenuItemComponentProps {
  item: MenuItem;
  palette: ColorPalette;
  isSelected: boolean;
  onSelect: (item: MenuItem) => void;
  isOpen: boolean;
  typeIcons: Record<string, string>;
  depth: number;
}

function MiniMenuItemComponent({
  item,
  palette,
  isSelected,
  onSelect,
  isOpen,
  typeIcons,
  depth,
}: MiniMenuItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const icon = typeIcons[item.type] || '📄';

  if (!isOpen) {
    // Collapsed: show only icons
    return (
      <li className="my-1">
        <button
          onClick={() => onSelect(item)}
          className="w-full flex items-center justify-center py-3 rounded-lg transition-colors"
          style={{
            backgroundColor: isSelected ? palette.primary : 'transparent',
            color: isSelected ? '#ffffff' : palette.text,
          }}
          title={item.title}
        >
          <span className="text-xl">{icon}</span>
        </button>
      </li>
    );
  }

  // Expanded: show full menu
  return (
    <li className="my-1">
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 mr-1 rounded hover:bg-black hover:bg-opacity-10"
            style={{ color: palette.text }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}

        <button
          onClick={() => onSelect(item)}
          className="flex-1 text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            backgroundColor: isSelected ? palette.primary : 'transparent',
            color: isSelected ? '#ffffff' : palette.text,
          }}
        >
          <span>{icon}</span>
          <span className="truncate">{item.title}</span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <MiniMenuItemList
          items={item.children!}
          palette={palette}
          selectedId={isSelected ? item.id : undefined}
          onSelect={onSelect}
          isOpen={isOpen}
          typeIcons={typeIcons}
          depth={depth + 1}
        />
      )}
    </li>
  );
}
