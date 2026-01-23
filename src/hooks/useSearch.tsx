import { useState, useMemo, useCallback } from 'react';

interface SearchableItem {
  id: string;
  [key: string]: any;
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  searchFields: (keyof T)[]
) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(query)
          );
        }
        return false;
      });
    });
  }, [items, searchQuery, searchFields]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery: handleSearch,
    clearSearch,
    filteredItems,
    hasResults: filteredItems.length > 0,
    totalResults: filteredItems.length,
  };
}
