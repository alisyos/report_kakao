'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DateFilter } from '../lib/types';

interface DateRangePickerProps {
  onChange: (dates: DateFilter) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DateRangePicker = ({ 
  onChange, 
  initialStartDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  initialEndDate = format(new Date(), 'yyyy-MM-dd')
}: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // 날짜 변경 핸들러
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      onChange({ startDate: value, endDate });
    } else {
      setEndDate(value);
      onChange({ startDate, endDate: value });
    }
  };

  // 미리 정의된 기간 선택
  const handlePredefinedRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const formattedStart = format(start, 'yyyy-MM-dd');
    const formattedEnd = format(end, 'yyyy-MM-dd');
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    onChange({ startDate: formattedStart, endDate: formattedEnd });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1">시작일</label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => handleDateChange('start', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          max={endDate}
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1">종료일</label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => handleDateChange('end', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={startDate}
        />
      </div>
      
      <div className="flex items-end space-x-2">
        <button
          onClick={() => handlePredefinedRange(7)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
        >
          최근 7일
        </button>
        <button
          onClick={() => handlePredefinedRange(30)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
        >
          최근 30일
        </button>
        <button
          onClick={() => handlePredefinedRange(90)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
        >
          최근 90일
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker; 