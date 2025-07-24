import { useState } from "react";
import { Calendar } from "lucide-react";
import PassengerDropdown from "./PassengerDropdown";
import FlightCalendar from "./FlightCalendar";

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
  const [calendarType, setCalendarType] = useState<'departure' | 'return' | null>(null);

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

  const handleDateSelect = (date: string, isReturnTicketNeeded: boolean) => {
    if (calendarType === 'departure') {
      setFormData({ 
        ...formData, 
        departureDate: date,
        returnDate: isReturnTicketNeeded ? formData.returnDate : ''
      });
    } else if (calendarType === 'return') {
      setFormData({ 
        ...formData, 
        returnDate: date
      });
    }
    setCalendarType(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-1 sticky top-16 z-20 shadow-md bg-transparent">
        {/* From City */}
        <div className="flex-1 min-w-32 px-2 bg-white rounded-l-2xl">
          <button
            type="button"
            onClick={onOriginClick}
            className="w-full text-left py-2"
          >
            {originSelection ? (
              <>
                <div className="text-md font-medium text-gray-800 py-3 px-2">
                  {originSelection.airportName}
                </div>
              </>
            ) : (
              <>
                <div className="text-md font-medium text-gray-400 py-3 px-2">Откуда</div>
              </>
            )}
          </button>
        </div>

        {/* To City */}
        <div className="flex-1 min-w-32 px-2 bg-white ">
          <button
            type="button"
            onClick={onDestinationClick}
            className="w-full text-left py-2"
          >
            {destinationSelection ? (
              <>
                <div className="text-md font-medium text-gray-800 py-3 px-2">
                  {destinationSelection.airportName}
                </div>
              </>
            ) : (
              <>
                <div className="text-md font-medium text-gray-400 py-3 px-2">Куда</div>
              </>
            )}
          </button>
        </div>

        {/* Dates (shared wrapper) */}
        <div className="relative flex gap-1">
          {/* Departure Date */}
          <div className="min-w-42 px-2 bg-white">
            <button
              type="button"
              onClick={() => setCalendarType(calendarType === 'departure' ? null : 'departure')}
              className="w-full text-left py-2 relative"
            >
              {formData.departureDate ? (
                <>
                  <div className="text-md font-medium text-gray-800 py-3 px-2">
                    {formatDate(formData.departureDate)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-md font-medium text-gray-400 py-3 px-2">Когда</div>
                </>
              )}
              <div className="absolute top-1/3 right-0 text-gray-400">
                <Calendar className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Return Date */}
          <div className="min-w-42 px-2 bg-white">
            <button
              type="button"
              onClick={() => setCalendarType(calendarType === 'return' ? null : 'return')}
              className="text-left py-2 min-w-32 relative"
            >
              {formData.returnDate ? (
                <>
                  <div className="text-md font-medium text-gray-800 py-3 px-2">
                    {formatDate(formData.returnDate)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-md font-medium text-gray-400 py-3 px-2">Обратно</div>
                </>
              )}
              <div className="absolute top-1/3 right-0 text-gray-400">
                <Calendar className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Shared Calendar Dropdown */}
          {calendarType && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2">
              <FlightCalendar
                type={calendarType}
                onSelect={handleDateSelect}
                onClose={() => setCalendarType(null)}
                selectedDate={calendarType === 'departure' ? formData.departureDate : formData.returnDate}
                minDate={calendarType === 'return' ? formData.departureDate : undefined}
              />
            </div>
          )}
        </div>

        {/* Passengers Dropdown */}
        <div className="flex-1 min-w-32 px-2 py-[6px] relative bg-white rounded-r-2xl">
          <PassengerDropdown
            adults={Math.max(1, formData.passengers - 0)}
            childrens={0}
            infants={0}
            serviceClass={formData.cabinClass === 'premium_economy' ? 'comfort' : formData.cabinClass}
            onPassengersChange={handlePassengersChange}
            onClassChange={handleClassChange}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
          />
        </div>

        {/* Search Button */}
        <div className="px-2">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-6 py-5 rounded-2xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-full"
            style={{ minWidth: 140 }}
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
    </div>
  );
};

export default BookingForm;