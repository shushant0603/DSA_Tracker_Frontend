import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = React.memo(({ onSearch, placeholder = "Search questions..." }) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    onSearch(value);
  }, [value, onSearch]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="input-field pl-10"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        className="btn-primary flex items-center px-4"
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </button>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
