import { useState } from "react";
import { Calendar } from "lucide-react";
import PassengerDropdown from "./PassengerDropdown";

interface SearchFormData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tripType: 'one-way' | 'round-trip';
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

interface LocationSelection {
  countryName: string;
  airportCode: string;
  airportName: string;
}

interface BookingFormProps {
  formData: SearchFormData;
  setFormData: (data: SearchFormData) => void;
  originSelection: LocationSelection | null;
  destinationSelection: LocationSelection | null;
  onOriginClick: () => void;
  onDestinationClick: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  setFormData,
  originSelection,
  destinationSelection,
  onOriginClick,
  onDestinationClick,
  onSubmit,
  loading
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePassengersChange = (adults: number, childrens: number, infants: number) => {
    const totalPassengers = adults + childrens + infants;
    setFormData({ ...formData, passengers: totalPassengers });
  };

  const handleClassChange = (serviceClass: string) => {
    const cabinClassMap: Record<string, 'economy' | 'premium_economy' | 'business' | 'first'> = {
      'economy': 'economy',
      'comfort': 'premium_economy',
      'business': 'business',
      'first': 'first'
    };
    setFormData({ ...formData, cabinClass: cabinClassMap[serviceClass] || 'economy' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap items-center gap-0">
        {/* From City */}
        <div className="flex-1 min-w-48 px-4 border-r border-gray-200">
          <button
            type="button"
            onClick={onOriginClick}
            className="w-full text-left py-2"
          >
            {originSelection ? (
              <>
                <div className="text-lg font-medium text-gray-800">
                  {originSelection.airportName}
                </div>
                <div className="text-sm text-gray-400 mt-1">{originSelection.airportCode}</div>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-400">Откуда</div>
                <div className="text-sm text-gray-400 mt-1">Выберите страну</div>
              </>
            )}
          </button>
        </div>

        {/* To City */}
        <div className="flex-1 min-w-48 px-4 border-r border-gray-200">
          <button
            type="button"
            onClick={onDestinationClick}
            className="w-full text-left py-2"
          >
            {destinationSelection ? (
              <>
                <div className="text-lg font-medium text-gray-800">
                  {destinationSelection.airportName}
                </div>
                <div className="text-sm text-gray-400 mt-1">{destinationSelection.airportCode}</div>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-400">Куда</div>
                <div className="text-sm text-gray-400 mt-1">Выберите страну</div>
              </>
            )}
          </button>
        </div>

        {/* Departure Date */}
        <div className="flex-1 min-w-48 px-4 border-r border-gray-200">
          <div className="relative">
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              className={`w-full text-lg font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer ${!formData.departureDate ? 'text-transparent' : ''}`}
              style={{ colorScheme: 'light' }}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker();
              }}
            />
            {!formData.departureDate && (
              <>
                <div className="absolute top-0 left-0 pointer-events-none text-lg font-medium text-gray-400">
                  Когда
                </div>
                <div className="absolute top-1 right-0 pointer-events-none text-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Return Date */}
        <div className="flex-1 min-w-48 px-4 border-r border-gray-200">
          <div className="relative">
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className={`w-full text-lg font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer ${!formData.returnDate ? 'text-transparent' : ''}`}
              style={{ colorScheme: 'light' }}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker();
              }}
            />
            {!formData.returnDate && (
              <>
                <div className="absolute top-0 left-0 pointer-events-none text-lg font-medium text-gray-400">
                  Обратно
                </div>
                <div className="absolute top-1 right-0 pointer-events-none text-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Passengers Dropdown */}
        <div className="flex-1 min-w-48 px-4 relative">
          <PassengerDropdown
            adults={Math.max(1, formData.passengers - 0)} // Simplified for now
            childrens={0}
            infants={0}
            serviceClass={formData.cabinClass === 'premium_economy' ? 'comfort' : formData.cabinClass}
            onPassengersChange={handlePassengersChange}
            onClassChange={handleClassChange}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-12 py-4 rounded-2xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Поиск...
            </>
          ) : (
            'Найти билеты'
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;