import { useRef, useEffect } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useTranslation } from "../lib/i18n";

interface PassengerDropdownProps {
  adults: number;
  childrens: number;
  infants: number;
  serviceClass: string;
  onPassengersChange: (adults: number, childrens: number, infants: number) => void;
  onClassChange: (serviceClass: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const PassengerDropdown: React.FC<PassengerDropdownProps> = ({
  adults,
  childrens,
  infants,
  serviceClass,
  onPassengersChange,
  onClassChange,
  isOpen,
  onToggle
}) => {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const updateAdults = (delta: number) => {
    const newAdults = Math.max(1, adults + delta);
    onPassengersChange(newAdults, childrens, infants);
  };

  const updateChildren = (delta: number) => {
    const newChildrens = Math.max(0, childrens + delta);
    onPassengersChange(adults, newChildrens, infants);
  };

  const updateInfants = (delta: number) => {
    const newInfants = Math.max(0, infants + delta);
    onPassengersChange(adults, childrens, newInfants);
  };

  const getTotalPassengers = () => {
    const total = adults + childrens + infants;
    if (total === 1) return `1 ${t('passengers.passenger')}`;
    if (total >= 2 && total <= 4) return `${total} ${t('passengers.passengers2')}`;
    return `${total} ${t('passengers.passengers5')}`;
  };

  const getClassLabel = () => {
    switch (serviceClass) {
      case 'economy': return t('cabinClasses.economy');
      case 'comfort': return t('cabinClasses.premiumEconomy');
      case 'business': return t('cabinClasses.business');
      case 'first': return t('cabinClasses.first');
      default: return t('cabinClasses.economy');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={onToggle}
        className="flex items-center justify-between cursor-pointer w-full h-full"
      >
        <div>
          <div className="text-lg font-medium text-gray-800">
            {getTotalPassengers()}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {getClassLabel()}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('passengers.passengerCount')}</h3>
              
              {/* Adults */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">{t('passengers.adults')}</div>
                  <div className="text-sm text-gray-500">{t('passengers.adultsAge')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateAdults(-1)}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{adults}</span>
                  <button
                    onClick={() => updateAdults(1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">{t('passengers.children')}</div>
                  <div className="text-sm text-gray-500">{t('passengers.childrenAge')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateChildren(-1)}
                    disabled={childrens <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{childrens}</span>
                  <button
                    onClick={() => updateChildren(1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">{t('passengers.infants')}</div>
                  <div className="text-sm text-gray-500">{t('passengers.infantsAge')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInfants(-1)}
                    disabled={infants <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{infants}</span>
                  <button
                    onClick={() => updateInfants(1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('passengers.serviceClass')}</h3>
              <select
                value={serviceClass}
                onChange={(e) => onClassChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="economy">{t('cabinClasses.economy')}</option>
                <option value="comfort">{t('cabinClasses.premiumEconomy')}</option>
                <option value="business">{t('cabinClasses.business')}</option>
                <option value="first">{t('cabinClasses.first')}</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDropdown;