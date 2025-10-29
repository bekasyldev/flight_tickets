'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, className }) => {
  const { locale } = useTranslation();
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getMaskInfo = () => {
    switch (locale) {
      case 'en':
        return { mask: 'DD.MM.YYYY', placeholder: 'DD.MM.YYYY' };
      case 'ru':
        return { mask: 'ДД.ММ.ГГГГ', placeholder: 'ДД.ММ.ГГГГ' };
      case 'ua':
        return { mask: 'ДД.ММ.ГГГГ', placeholder: 'ДД.ММ.ГГГГ' };
      case 'md':
        return { mask: 'ZZ.LL.AAAA', placeholder: 'ZZ.LL.AAAA' };
      default:
        return { mask: 'DD.MM.YYYY', placeholder: 'DD.MM.YYYY' };
    }
  };

  const { placeholder } = getMaskInfo();

  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate || isoDate.length !== 10) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const formatDateForISO = (displayDate: string) => {
    if (!displayDate || displayDate.length !== 10) return '';
    const [day, month, year] = displayDate.split('.');
    if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
    
    if (inputValue.length > 8) {
      inputValue = inputValue.slice(0, 8);
    }

    let formattedValue = '';
    for (let i = 0; i < inputValue.length; i++) {
      if (i === 2 || i === 4) {
        formattedValue += '.';
      }
      formattedValue += inputValue[i];
    }

    setDisplayValue(formattedValue);

    if (formattedValue.length === 10) {
      const [day, month, year] = formattedValue.split('.');
      
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      const currentYear = new Date().getFullYear();
      const minYear = 1920; // Reasonable minimum birth year
      const maxYear = currentYear; // Cannot be born in the future
      
      if (
        dayNum >= 1 && dayNum <= 31 &&
        monthNum >= 1 && monthNum <= 12 &&
        yearNum >= minYear && yearNum <= maxYear
      ) {
        const testDate = new Date(yearNum, monthNum - 1, dayNum);
        if (
          testDate.getFullYear() === yearNum &&
          testDate.getMonth() === monthNum - 1 &&
          testDate.getDate() === dayNum
        ) {
          onChange(formatDateForISO(formattedValue));
          return;
        }
      }
    }
    
    // If incomplete or invalid, clear the value
    if (formattedValue.length < 10) {
      onChange(''); // Clear the value if incomplete
    } else {
      // If complete but invalid, also clear
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const numbers = paste.replace(/[^\d]/g, '');
    
    if (numbers.length === 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      const formatted = `${day}.${month}.${year}`;
      
      setDisplayValue(formatted);
      
      // Validate and convert to ISO
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      const currentYear = new Date().getFullYear();
      const minYear = 1920; // Reasonable minimum birth year
      const maxYear = currentYear; // Cannot be born in the future
      
      if (
        dayNum >= 1 && dayNum <= 31 &&
        monthNum >= 1 && monthNum <= 12 &&
        yearNum >= minYear && yearNum <= maxYear
      ) {
        const testDate = new Date(yearNum, monthNum - 1, dayNum);
        if (
          testDate.getFullYear() === yearNum &&
          testDate.getMonth() === monthNum - 1 &&
          testDate.getDate() === dayNum
        ) {
          onChange(formatDateForISO(formatted));
        }
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={className}
      maxLength={10}
    />
  );
};

export default DateInput;