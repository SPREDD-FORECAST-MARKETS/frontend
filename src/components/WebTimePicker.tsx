import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface WebTimePickerProps {
  date: string;
  time: string;
  onChange: (date: string, time: string) => void;
  onClose: () => void;
  timezone?: string;
}

const WebTimePicker: React.FC<WebTimePickerProps> = ({
  date,
  time,
  onChange,
  onClose,
  timezone
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (date && time) {
      return new Date(`${date}T${time}`);
    }
    return new Date();
  });
  
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (date) {
      return new Date(`${date}T00:00:00`);
    }
    return new Date();
  });

  const [timeInput, setTimeInput] = useState({
    hours: '12',
    minutes: '00',
    period: 'PM'
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize time input from props
  useEffect(() => {
    if (time) {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      
      setTimeInput({
        hours: hour12.toString().padStart(2, '0'),
        minutes: minutes,
        period
      });
    }
  }, [time]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleTimeChange = (field: 'hours' | 'minutes' | 'period', value: string) => {
    const newTimeInput = { ...timeInput, [field]: value };
    setTimeInput(newTimeInput);

    // Convert to 24-hour format
    let hours24 = parseInt(newTimeInput.hours);
    if (newTimeInput.period === 'AM' && hours24 === 12) {
      hours24 = 0;
    } else if (newTimeInput.period === 'PM' && hours24 !== 12) {
      hours24 += 12;
    }

    const timeString = `${hours24.toString().padStart(2, '0')}:${newTimeInput.minutes}`;
    const dateString = selectedDate.toISOString().split('T')[0];
    
    onChange(dateString, timeString);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    // Convert current time to 24-hour format for onChange
    let hours24 = parseInt(timeInput.hours);
    if (timeInput.period === 'AM' && hours24 === 12) {
      hours24 = 0;
    } else if (timeInput.period === 'PM' && hours24 !== 12) {
      hours24 += 12;
    }
    
    const timeString = `${hours24.toString().padStart(2, '0')}:${timeInput.minutes}`;
    const dateString = newDate.toISOString().split('T')[0];
    
    onChange(dateString, timeString);
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

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl p-6 max-w-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={18} className="text-orange-500" />
          Select Date & Time
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Calendar Section */}
      <div className="mb-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-zinc-800/50 text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <h4 className="text-white font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-zinc-800/50 text-gray-400 hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const disabled = isPastDate(day);
            return (
              <motion.button
                key={index}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && handleDateSelect(day.getDate())}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                className={`
                  aspect-square text-sm font-medium rounded-lg transition-all relative
                  ${!isCurrentMonth(day) 
                    ? 'text-gray-600 hover:text-gray-500' 
                    : disabled
                    ? 'text-gray-700 cursor-not-allowed'
                    : isSelected(day)
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : isToday(day)
                    ? 'bg-zinc-800/50 text-orange-400 border border-orange-500/30'
                    : 'text-gray-300 hover:bg-zinc-800/50 hover:text-white'
                  }
                `}
              >
                {day.getDate()}
                {isToday(day) && !isSelected(day) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Section */}
      <div className="border-t border-zinc-800 pt-6">
        <div className="flex items-center justify-center gap-3">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-2">Hours</label>
            <select
              value={timeInput.hours}
              onChange={(e) => handleTimeChange('hours', e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i + 1;
                const hourStr = hour.toString().padStart(2, '0');
                return (
                  <option key={hour} value={hourStr}>
                    {hourStr}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-white text-xl font-bold mt-6">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-2">Minutes</label>
            <select
              value={timeInput.minutes}
              onChange={(e) => handleTimeChange('minutes', e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all"
            >
              {Array.from({ length: 60 }, (_, i) => {
                const minute = i.toString().padStart(2, '0');
                return (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                );
              })}
            </select>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-2">Period</label>
            <div className="flex bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              {['AM', 'PM'].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handleTimeChange('period', period)}
                  className={`px-3 py-2 text-sm font-medium transition-all ${
                    timeInput.period === period
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected DateTime Display */}
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Selected Time</div>
            <div className="text-white font-medium">
              {selectedDate.toLocaleDateString(undefined, {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })} at {timeInput.hours}:{timeInput.minutes} {timeInput.period}
            </div>
            {timezone && (
              <div className="text-xs text-gray-500 mt-1">
                {timezone}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebTimePicker;