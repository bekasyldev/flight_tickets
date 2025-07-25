import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FlightCalendarProps {
  type: 'departure' | 'return';
  onSelect: (date: string, isReturnTicketNeeded: boolean) => void;
  onClose: () => void;
  selectedDate?: string;
  minDate?: string;
  tripType?: 'one-way' | 'round-trip';
}

const FlightCalendar: React.FC<FlightCalendarProps> = ({
  type,
  onSelect,
  onClose,
  selectedDate = '',
  minDate = '',
  tripType = 'round-trip'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isReturnTicketNeeded, setIsReturnTicketNeeded] = useState(tripType === 'round-trip');

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (type === 'return' && minDate) {
      const minDateTime = new Date(minDate);
      return date <= minDateTime;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
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

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);

  const daysCurrent = getDaysInMonth(currentMonth);
  const daysNext = getDaysInMonth(nextMonth);

  const isPrevDisabled = (() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  })();

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-black w-160 max-w-2xl min-h-[420px] h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-end mb-4">
        {/* Return ticket toggle and close button */}
        <div className="flex items-center gap-2 ml-4">
          {type === 'return' && (
            <button
              onClick={() => {
                if (isReturnTicketNeeded) {
                  setIsReturnTicketNeeded(false);
                  onSelect('', false);
                  onClose();
                  console.log('isReturnTicketNeeded', isReturnTicketNeeded);
                } else {
                  setIsReturnTicketNeeded(true);
                }
              }}
              className={`text-sm px-4 py-1 rounded-full border transition-colors duration-150 font-semibold
                ${isReturnTicketNeeded 
                  ? 'bg-gray-100 border-gray-200 text-gray-500' 
                  : 'bg-orange-500 border-orange-500 text-white'}
              `}
              title="Если не нужен обратный билет, выберите эту опцию"
            >
              Обратный билет не нужен
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two months side by side */}
      <div className="flex gap-8">
        {/* First month */}
        <div className="flex-1">
          <div className="relative flex items-center mb-2 h-10">
            <button
              onClick={() => navigateMonth('prev')}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 bg-gray-100 text-gray-800 rounded-full"
              disabled={isPrevDisabled}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center font-semibold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-base font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysCurrent.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isDisabled = isDateDisabled(day);
              const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`
                    h-10 w-10 rounded text-base font-medium transition-all
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                    ${isSelected ? 'bg-orange-500 text-white' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        {/* Second month */}
        <div className="flex-1">
          <div className="relative flex items-center mb-2 h-10">
            <div className="flex-1 text-center font-semibold text-lg">
              {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 bg-gray-100 text-gray-800 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-base font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysNext.map((day, index) => {
              const isCurrentMonth = day.getMonth() === nextMonth.getMonth();
              const isDisabled = isDateDisabled(day);
              const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`
                    h-10 w-10 rounded text-base font-medium transition-all
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                    ${isSelected ? 'bg-orange-500 text-white' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCalendar;