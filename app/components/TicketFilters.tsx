import React from 'react';

interface TicketFiltersProps {
  filters: {
    noStops: boolean;
    maxOneStop: boolean;
    maxTwoStops: boolean;
    excludeNightTransfers: boolean;
  };
  onFilterChange: (filterName: keyof TicketFiltersProps['filters']) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="sticky top-24 w-72">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Фильтры</h3>
        </div>

        {/* Filter Options */}
        <div className="p-6">
          {/* Stops Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Пересадки</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-5 h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.noStops}
                      onChange={() => onFilterChange('noStops')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 ml-3 group-hover:text-gray-900">Без пересадок</span>
                </div>
                <span className="text-sm text-gray-400">0</span>
              </label>

              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-5 h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.maxOneStop}
                      onChange={() => onFilterChange('maxOneStop')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 ml-3 group-hover:text-gray-900">1 пересадка</span>
                </div>
                <span className="text-sm text-gray-400">1</span>
              </label>

              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-5 h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.maxTwoStops}
                      onChange={() => onFilterChange('maxTwoStops')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 ml-3 group-hover:text-gray-900">2 пересадки</span>
                </div>
                <span className="text-sm text-gray-400">2</span>
              </label>
            </div>
          </div>

          {/* Additional Options Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Дополнительно</h4>
            <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="w-5 h-5 relative">
                  <input
                    type="checkbox"
                    checked={filters.excludeNightTransfers}
                    onChange={() => onFilterChange('excludeNightTransfers')}
                    className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-gray-700 ml-3 group-hover:text-gray-900">Без ночных пересадок</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters; 