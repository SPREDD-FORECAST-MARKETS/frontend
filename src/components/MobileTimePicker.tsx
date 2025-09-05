import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Clock, Check } from 'lucide-react';

interface MobileTimePickerProps {
  date: string;
  time: string;
  onChange: (date: string, time: string) => void;
  onClose: () => void;
  timezone?: string;
}

interface WheelOption {
  value: string;
  label: string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const MobileTimePicker: React.FC<MobileTimePickerProps> = ({
  date,
  time,
  onChange,
  onClose,
  timezone
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (date) {
      return new Date(`${date}T00:00:00`);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  // Initialize from props
  useEffect(() => {
    if (time) {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12.toString());
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
    }
  }, [time]);

  // Generate date options (next 365 days)
  const generateDateOptions = (): WheelOption[] => {
    const options: WheelOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const optionDate = new Date(today);
      optionDate.setDate(today.getDate() + i);
      
      const value = optionDate.toISOString().split('T')[0];
      let label = optionDate.toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit'
      });
      
      if (i === 0) label = `Today, ${label}`;
      if (i === 1) label = `Tomorrow, ${label}`;
      
      options.push({ value, label });
    }
    
    return options;
  };

  const generateTimeOptions = (max: number, step: number = 1): WheelOption[] => {
    const options: WheelOption[] = [];
    for (let i = (max === 12 ? 1 : 0); i <= max; i += step) {
      const value = i.toString().padStart(2, '0');
      options.push({ value, label: value });
    }
    return options;
  };

  const dateOptions = generateDateOptions();
  const hourOptions = generateTimeOptions(12);
  const minuteOptions = generateTimeOptions(59);
  const periodOptions: WheelOption[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
  ];

  const handleConfirm = () => {
    // Convert to 24-hour format
    let hours24 = parseInt(selectedHour);
    if (selectedPeriod === 'AM' && hours24 === 12) {
      hours24 = 0;
    } else if (selectedPeriod === 'PM' && hours24 !== 12) {
      hours24 += 12;
    }

    const timeString = `${hours24.toString().padStart(2, '0')}:${selectedMinute}`;
    const dateString = selectedDate.toISOString().split('T')[0];
    
    onChange(dateString, timeString);
    onClose();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-gradient-to-t from-[#111] to-[#1a1a1a] rounded-t-3xl shadow-2xl border-t border-zinc-800 min-h-[60vh] max-h-[80vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-orange-500" />
          <h3 className="text-lg font-semibold text-white">Select Time</h3>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Check size={16} />
          Done
        </button>
      </div>

      {/* Time Wheels Container */}
      <div className="flex-1 p-6 overflow-hidden">
        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-gray-300 font-medium mb-3 text-sm">Date</label>
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <ScrollWheel
              options={dateOptions}
              selectedValue={selectedDate.toISOString().split('T')[0]}
              onValueChange={(value) => setSelectedDate(new Date(`${value}T00:00:00`))}
              height={ITEM_HEIGHT * VISIBLE_ITEMS}
            />
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-gray-300 font-medium mb-3 text-sm">Time</label>
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <div className="flex justify-center items-center gap-4">
              {/* Hours */}
              <div className="flex-1">
                <div className="text-center text-xs text-gray-400 mb-2">Hours</div>
                <ScrollWheel
                  options={hourOptions}
                  selectedValue={selectedHour}
                  onValueChange={setSelectedHour}
                  height={ITEM_HEIGHT * VISIBLE_ITEMS}
                />
              </div>

              <div className="text-white text-2xl font-bold self-center">:</div>

              {/* Minutes */}
              <div className="flex-1">
                <div className="text-center text-xs text-gray-400 mb-2">Minutes</div>
                <ScrollWheel
                  options={minuteOptions}
                  selectedValue={selectedMinute}
                  onValueChange={setSelectedMinute}
                  height={ITEM_HEIGHT * VISIBLE_ITEMS}
                />
              </div>

              {/* AM/PM */}
              <div className="flex-1">
                <div className="text-center text-xs text-gray-400 mb-2">Period</div>
                <ScrollWheel
                  options={periodOptions}
                  selectedValue={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                  height={ITEM_HEIGHT * VISIBLE_ITEMS}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Time Display */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">Selected Time</div>
            <div className="text-white font-semibold text-lg">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: '2-digit'
              })} at {selectedHour}:{selectedMinute} {selectedPeriod}
            </div>
            {timezone && (
              <div className="text-xs text-gray-500 mt-1">
                {timezone}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ScrollWheel Component for iOS-style picker
const ScrollWheel: React.FC<{
  options: WheelOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  height: number;
}> = ({ options, selectedValue, onValueChange, height }) => {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find initial selected index
  useEffect(() => {
    const index = options.findIndex(option => option.value === selectedValue);
    setSelectedIndex(Math.max(0, index));
    y.set(-index * ITEM_HEIGHT);
  }, [selectedValue, options, y]);

  const handleDrag = useCallback((_event: any, info: PanInfo) => {
    // Constrain dragging within bounds
    const maxY = 0;
    const minY = -(options.length - 1) * ITEM_HEIGHT;
    const newY = Math.max(minY, Math.min(maxY, info.offset.y));
    y.set(newY);
  }, [options.length, y]);

  const handleDragEnd = useCallback((_event: any, _info: PanInfo) => {
    // Snap to nearest item
    const currentY = y.get();
    const targetIndex = Math.round(-currentY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, targetIndex));
    const snapY = -clampedIndex * ITEM_HEIGHT;
    
    y.set(snapY);
    setSelectedIndex(clampedIndex);
    onValueChange(options[clampedIndex].value);
  }, [options, onValueChange, y]);

  // Transform for opacity based on distance from center
  const opacity = useTransform(y, (_latest) => {
    return (index: number) => {
      const distance = Math.abs(index - selectedIndex);
      return Math.max(0.3, 1 - distance * 0.3);
    };
  });

  const scale = useTransform(y, (_latest) => {
    return (index: number) => {
      const distance = Math.abs(index - selectedIndex);
      return Math.max(0.8, 1 - distance * 0.1);
    };
  });

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height }}
    >
      {/* Center highlight */}
      <div 
        className="absolute left-0 right-0 bg-orange-500/10 border-y border-orange-500/20 pointer-events-none z-10"
        style={{
          top: CENTER_INDEX * ITEM_HEIGHT,
          height: ITEM_HEIGHT
        }}
      />
      
      <motion.div
        drag="y"
        dragElastic={0.1}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="cursor-grab active:cursor-grabbing"
      >
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            className="flex items-center justify-center text-white font-medium select-none"
            style={{
              height: ITEM_HEIGHT,
              opacity: opacity.get()(index),
              scale: scale.get()(index),
            }}
          >
            <span className={`transition-colors ${
              index === selectedIndex 
                ? 'text-white' 
                : 'text-gray-400'
            }`}>
              {option.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MobileTimePicker;