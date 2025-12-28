import { useState } from 'react';
import { DEFAULT_PALETTE } from '../../types';
import type { MenuItem, ColorPalette } from '../../types';
import { useCountry } from '../../context/CountryContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { selectedCountry, selectedMenuItem, selectMenuItem } = useCountry();

  if (!selectedCountry) return null;

  const palette = selectedCountry.palette || DEFAULT_PALETTE;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: palette.background }}
      >
        <div className="h-full overflow-y-auto pt-16 lg:pt-0">
          <div className="p-4">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: palette.text }}
            >
              Explore {selectedCountry.name}
            </h2>

            <nav>
              <MenuItemList
                items={selectedCountry.menuItems}
                palette={palette}
                selectedId={selectedMenuItem?.id}
                onSelect={selectMenuItem}
              />
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

interface MenuItemListProps {
  items: MenuItem[];
  palette: ColorPalette;
  selectedId?: string;
  onSelect: (item: MenuItem) => void;
  depth?: number;
}

function MenuItemList({
  items,
  palette,
  selectedId,
  onSelect,
  depth = 0,
}: MenuItemListProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <ul className={depth > 0 ? 'ml-4 mt-1' : ''}>
      {sortedItems.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          palette={palette}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </ul>
  );
}

interface MenuItemComponentProps {
  item: MenuItem;
  palette: ColorPalette;
  isSelected: boolean;
  onSelect: (item: MenuItem) => void;
  depth: number;
}

function MenuItemComponent({
  item,
  palette,
  isSelected,
  onSelect,
  depth,
}: MenuItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const typeIcons = {
    region: '📍',
    city: '🏙️',
    sight: '🏛️',
  };

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
          className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
            hasChildren ? '' : 'ml-6'
          }`}
          style={{
            backgroundColor: isSelected ? palette.primary : 'transparent',
            color: isSelected ? '#ffffff' : palette.text,
          }}
        >
          <span className="mr-2">{typeIcons[item.type]}</span>
          {item.title}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <MenuItemList
          items={item.children!}
          palette={palette}
          selectedId={isSelected ? item.id : undefined}
          onSelect={onSelect}
          depth={depth + 1}
        />
      )}
    </li>
  );
}
