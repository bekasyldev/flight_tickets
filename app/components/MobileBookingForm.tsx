import { Calendar } from "lucide-react";
import { useState } from "react";
import { useTranslation } from '../lib/i18n';
import MobileFlightCalendar from "./MobileFlightCalendar";

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

interface MobileBookingFormProps {
  formData: SearchFormData;
  setFormData: (data: SearchFormData) => void;
  originSelection: LocationSelection | null;
  destinationSelection: LocationSelection | null;
  onOriginClick: () => void;
  onDestinationClick: () => void;
  onSubmit: () => void;
  loading: boolean;
}
  
const MobileBookingForm: React.FC<MobileBookingFormProps> = ({
  formData,
  setFormData,
  originSelection,
  destinationSelection,
  onOriginClick,
  onDestinationClick,
  onSubmit,
  loading
}) => {
  const { t } = useTranslation();
  const [calendarType, setCalendarType] = useState<'departure' | 'return' | null>(null);

  const handleDateSelect = (date: string, isReturnTicketNeeded: boolean) => {
    if (calendarType === 'departure') {
      setFormData({ 
        ...formData, 
        departureDate: date,
        returnDate: isReturnTicketNeeded ? formData.returnDate : '',
        tripType: isReturnTicketNeeded ? 'round-trip' : 'one-way'
      });
    } else if (calendarType === 'return') {
      setFormData({ 
        ...formData, 
        returnDate: date,
        tripType: date && isReturnTicketNeeded ? 'round-trip' : 'one-way'
      });
    }
    setCalendarType(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const monthKey = monthKeys[month];
    return `${day} ${t(`calendar.shortMonths.${monthKey}`)}`;
  };

  const getPassengerText = (count: number) => {
    if (count === 1) return `1 ${t('passengers.passenger')}`;
    if (count >= 2 && count <= 4) return `${count} ${t('passengers.passengers2')}`;
    return `${count} ${t('passengers.passengers5')}`;
  };

  const getCabinClassText = (cabinClass: string) => {
    switch (cabinClass) {
      case 'premium_economy':
        return t('cabinClasses.premiumEconomy');
      case 'business':
        return t('cabinClasses.business');
      case 'first':
        return t('cabinClasses.first');
      default:
        return t('cabinClasses.economy');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="space-y-4">
          {/* From */}
          <div>
            <button
              type="button"
              onClick={onOriginClick}
              className="w-full text-left py-3 border-b border-gray-200"
            >
              {originSelection ? (
                <>
                  <div className="text-xl font-medium text-gray-800">
                    {originSelection.airportName}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{originSelection.countryName}</div>
                </>
              ) : (
                <>
                  <div className="text-xl font-medium text-gray-400">{t('search.from')}</div>
                  <div className="text-sm text-gray-400 mt-1">{t('mobileBooking.selectDepartureCountry')}</div>
                </>
              )}
            </button>
          </div>

          {/* To */}
          <div>
            <button
              type="button"
              onClick={onDestinationClick}
              className="w-full text-left py-3 border-b border-gray-200"
            >
              {destinationSelection ? (
                <>
                  <div className="text-xl font-medium text-gray-800">
                    {destinationSelection.airportName}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{destinationSelection.countryName}</div>
                </>
              ) : (
                <>
                  <div className="text-xl font-medium text-gray-400">{t('search.to')}</div>
                  <div className="text-sm text-gray-400 mt-1">{t('mobileBooking.selectDestinationCountry')}</div>
                </>
              )}
            </button>
          </div>

          {/* Departure Date */}
          <div className="relative py-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setCalendarType(calendarType === 'departure' ? null : 'departure')}
              className="w-full text-left"
            >
              {formData.departureDate ? (
                <div className="text-xl font-medium text-gray-800">
                  {formatDate(formData.departureDate)}
                </div>
              ) : (
                <div className="text-xl font-medium text-gray-400">
                  {t('mobileBooking.departureDate')}
                </div>
              )}
              <div className="absolute top-3 right-0 text-gray-400">
                <Calendar className="w-6 h-6" />
              </div>
            </button>
          </div>

          {/* Return Date */}
            <div className="relative py-3 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setCalendarType(calendarType === 'return' ? null : 'return')}
                className="w-full text-left"
              >
                {formData.returnDate ? (
                  <div className="text-xl font-medium text-gray-800">
                    {formatDate(formData.returnDate)}
                  </div>
                ) : (
                  <div className="text-xl font-medium text-gray-400">
                    {formData.tripType === 'round-trip' ? t('mobileBooking.returnDate') : ''}
                  </div>
                )}
                <div className="absolute top-3 right-0 text-gray-400">
                  <Calendar className="w-6 h-6" />
                </div>
              </button>
            </div>

          {/* Passengers */}
          <div className="py-3">
            <div className="text-xl font-medium text-gray-800">
              {getPassengerText(formData.passengers)}
            </div>
            <div className="text-sm text-gray-400 mt-1 capitalize">
              {getCabinClassText(formData.cabinClass)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Calendar Modal */}
      {calendarType && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <MobileFlightCalendar
            type={calendarType}
            onSelect={handleDateSelect}
            onClose={() => setCalendarType(null)}
            selectedDate={calendarType === 'departure' ? formData.departureDate : formData.returnDate}
            minDate={calendarType === 'return' ? formData.departureDate : undefined}
            tripType={formData.tripType}
          />
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xl py-4 rounded-2xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            {t('search.searching')}
          </>
        ) : (
          t('search.searchFlights')
        )}
      </button>
    </div>
  );
};

export default MobileBookingForm;