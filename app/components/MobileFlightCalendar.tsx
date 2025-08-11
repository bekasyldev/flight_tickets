import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface MobileFlightCalendarProps {
  type: 'departure' | 'return';
  onSelect: (date: string, isReturnTicketNeeded: boolean) => void;
  onClose: () => void;
  selectedDate?: string;
  minDate?: string;
  tripType?: 'one-way' | 'round-trip';
}

const MobileFlightCalendar: React.FC<MobileFlightCalendarProps> = ({
  type,
  onSelect,
  onClose,
  selectedDate = '',
  minDate = '',
  tripType = 'round-trip'
}) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Use a stable date to avoid hydration mismatch
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isReturnTicketNeeded, setIsReturnTicketNeeded] = useState(tripType === 'round-trip');

  const monthNames = [
    t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'), 
    t('calendar.months.april'), t('calendar.months.may'), t('calendar.months.june'),
    t('calendar.months.july'), t('calendar.months.august'), t('calendar.months.september'), 
    t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
  ];

  const dayNames = [
    t('calendar.days.monday'), t('calendar.days.tuesday'), t('calendar.days.wednesday'), 
    t('calendar.days.thursday'), t('calendar.days.friday'), t('calendar.days.saturday'), t('calendar.days.sunday')
  ];

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (type === 'return' && minDate) {
      const minDateTime = new Date(minDate);
      return date <= minDateTime;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onSelect(dateString, isReturnTicketNeeded);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  const isPrevDisabled = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  })();

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-black w-full max-w-sm mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 bg-gray-100 text-gray-800 rounded-full"
            disabled={isPrevDisabled}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-semibold min-w-32 text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 bg-gray-100 text-gray-800 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Return ticket toggle */}
      {type === 'return' && (
        <div className="mb-4 text-center">
          <button
            onClick={() => {
              if (isReturnTicketNeeded) {
                setIsReturnTicketNeeded(false);
                onSelect('', false);
                onClose();
              } else {
                setIsReturnTicketNeeded(true);
              }
            }}
            className={`text-sm px-4 py-2 rounded-full border transition-colors duration-150 font-semibold
              ${isReturnTicketNeeded 
                ? 'bg-gray-100 border-gray-200 text-gray-500' 
                : 'bg-orange-500 border-orange-500 text-white'}
            `}
            title="Если не нужен обратный билет, выберите эту опцию"
          >
            {t('calendar.returnNotNeeded')}
          </button>
        </div>
      )}
      
      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isDisabled = isDateDisabled(day);
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                h-12 w-full rounded text-sm font-medium transition-all touch-manipulation
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer active:bg-blue-100'}
                ${isSelected ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFlightCalendar; 