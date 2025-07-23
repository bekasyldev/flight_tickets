import { Calendar } from "lucide-react";

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
                  <div className="text-xl font-medium text-gray-400">Откуда</div>
                  <div className="text-sm text-gray-400 mt-1">Выберите страну отправления</div>
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
                  <div className="text-xl font-medium text-gray-400">Куда</div>
                  <div className="text-sm text-gray-400 mt-1">Выберите страну назначения</div>
                </>
              )}
            </button>
          </div>

          {/* Departure Date */}
          <div className="relative py-3 border-b border-gray-200">
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              className={`w-full text-xl font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer ${!formData.departureDate ? 'text-transparent' : ''}`}
              style={{ colorScheme: 'light' }}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker();
              }}
            />
            {!formData.departureDate && (
              <>
                <div className="absolute top-3 left-0 pointer-events-none text-xl font-medium text-gray-400">
                  Дата отправления
                </div>
                <div className="absolute top-3 right-0 pointer-events-none text-gray-400">
                  <Calendar className="w-6 h-6" />
                </div>
              </>
            )}
          </div>

          {/* Return Date */}
          <div className="relative py-3 border-b border-gray-200">
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className={`w-full text-xl font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer ${!formData.returnDate ? 'text-transparent' : ''}`}
              style={{ colorScheme: 'light' }}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker();
              }}
            />
            {!formData.returnDate && (
              <>
                <div className="absolute top-3 left-0 pointer-events-none text-xl font-medium text-gray-400">
                  Дата возвращения
                </div>
                <div className="absolute top-3 right-0 pointer-events-none text-gray-400">
                  <Calendar className="w-6 h-6" />
                </div>
              </>
            )}
          </div>

          {/* Passengers */}
          <div className="py-3">
            <div className="text-xl font-medium text-gray-800">
              {formData.passengers} пассажир{formData.passengers > 1 ? (formData.passengers < 5 ? 'а' : 'ов') : ''}
            </div>
            <div className="text-sm text-gray-400 mt-1 capitalize">
              {formData.cabinClass === 'premium_economy' ? 'Премиум эконом' : 
               formData.cabinClass === 'business' ? 'Бизнес' :
               formData.cabinClass === 'first' ? 'Первый класс' : 'Эконом'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xl py-4 rounded-2xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Поиск...
          </>
        ) : (
          'Найти билеты'
        )}
      </button>
    </div>
  );
};

export default MobileBookingForm;