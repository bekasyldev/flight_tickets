import React from 'react';
import { useTranslation } from '../lib/i18n';

interface Segment {
  arriving_at: string;
  departing_at: string;
}

interface Slice {
  segments: Segment[];
}

interface Offer {
  slices: Slice[];
}

interface TicketFiltersProps {
  filters: {
    noStops: boolean;
    maxOneStop: boolean;
    maxTwoStops: boolean;
    excludeNightTransfers: boolean;
  };
  onFilterChange: (filterName: keyof TicketFiltersProps['filters']) => void;
  offers?: Offer[]; // Add offers prop to calculate counts
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ filters, onFilterChange, offers = [] }) => {
  const { t } = useTranslation();
  
  const getFilterCounts = () => {
    if (offers.length === 0) return { noStops: 0, oneStop: 0, twoStops: 0, withoutNightTransfers: 0 };
    
    const isNightTransfer = (segment: Segment) => {
      const arrivalTime = new Date(segment.arriving_at);
      const hours = arrivalTime.getHours();
      return hours >= 0 && hours < 6;
    };
    
    const counts = {
      noStops: 0,
      oneStop: 0, 
      twoStops: 0,
      withoutNightTransfers: 0
    };
    
    offers.forEach(offer => {
      const maxConnections = Math.max(...offer.slices.map((slice: Slice) => slice.segments.length - 1));
      const hasNightTransfer = offer.slices.some((slice: Slice) => 
        slice.segments.some((segment: Segment) => isNightTransfer(segment))
      );
      
      if (maxConnections === 0) counts.noStops++;
      if (maxConnections <= 1) counts.oneStop++;
      if (maxConnections <= 2) counts.twoStops++;
      if (!hasNightTransfer) counts.withoutNightTransfers++;
    });
    
    return counts;
  };
  
  const counts = getFilterCounts();

  return (
    <div className="w-full lg:w-72">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 lg:px-6 py-3 lg:py-4">
          <h3 className="text-base lg:text-lg font-semibold text-white">{t('filters.filters')}</h3>
        </div>

        {/* Filter Options */}
        <div className="p-4 lg:p-6">
          {/* Stops Section */}
          <div className="mb-4 lg:mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2 lg:mb-3">{t('filters.stops')}</h4>
            <div className="space-y-2 lg:space-y-3">
              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 lg:p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.noStops}
                      onChange={() => onFilterChange('noStops')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-2 h-2 lg:w-3 lg:h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm lg:text-base text-gray-700 ml-2 lg:ml-3 group-hover:text-gray-900">{t('filters.noStops')}</span>
                </div>
                <span className="text-xs lg:text-sm text-gray-400">{counts.noStops}</span>
              </label>

              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 lg:p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.maxOneStop}
                      onChange={() => onFilterChange('maxOneStop')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-2 h-2 lg:w-3 lg:h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm lg:text-base text-gray-700 ml-2 lg:ml-3 group-hover:text-gray-900">{t('filters.maxOneStop')}</span>
                </div>
                <span className="text-xs lg:text-sm text-gray-400">{counts.oneStop}</span>
              </label>

              <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 lg:p-2 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 relative">
                    <input
                      type="checkbox"
                      checked={filters.maxTwoStops}
                      onChange={() => onFilterChange('maxTwoStops')}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg className="w-2 h-2 lg:w-3 lg:h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm lg:text-base text-gray-700 ml-2 lg:ml-3 group-hover:text-gray-900">{t('filters.maxTwoStops')}</span>
                </div>
                <span className="text-xs lg:text-sm text-gray-400">{counts.twoStops}</span>
              </label>
            </div>
          </div>

          {/* Additional Options Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2 lg:mb-3">{t('filters.additional')}</h4>
            <label className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 lg:p-2 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="w-4 h-4 lg:w-5 lg:h-5 relative">
                  <input
                    type="checkbox"
                    checked={filters.excludeNightTransfers}
                    onChange={() => onFilterChange('excludeNightTransfers')}
                    className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full h-full border-2 border-gray-300 rounded transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg className="w-2 h-2 lg:w-3 lg:h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-sm lg:text-base text-gray-700 ml-2 lg:ml-3 group-hover:text-gray-900">{t('filters.excludeNightTransfers')}</span>
              </div>
              <span className="text-xs lg:text-sm text-gray-400">{counts.withoutNightTransfers}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters; 