import React, { useState, useEffect, useRef } from 'react';

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return '';
  // Ensure we are working with a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
};


// SVG Icon Components (no changes here)
const CalendarIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-black">
    <path d="m15 18-6-6 6-6"></path>
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-black">
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);


// Main Application Component
// MODIFIED: Added initialCheckIn and initialCheckOut to props
export default function DatePricePicker({
  onDateChange = () => {},
  initialCheckIn,
  initialCheckOut,
}) {
  const getInitialCheckInDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getInitialCheckOutDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // MODIFIED: Use props for initial state if they exist, otherwise use the default functions.
  // Also, ensure string dates from storage are converted to Date objects.
  const [checkInDate, setCheckInDate] = useState(
    initialCheckIn ? new Date(initialCheckIn) : getInitialCheckInDate()
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialCheckOut ? new Date(initialCheckOut) : getInitialCheckOutDate()
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [pricingData, setPricingData] = useState({});

  const pickerRef = useRef(null);

  const numberOfNights =
    checkInDate && checkOutDate ?
    Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) :
    0;

  // Effect to sync state with parent component
  useEffect(() => {
    onDateChange({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: numberOfNights,
    });
  }, [checkInDate, checkOutDate, numberOfNights, onDateChange]);


  // Effect to fetch pricing data when the month changes
  useEffect(() => {
    // Mock data generation
    const mockData = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      const basePrice = 3000;
      let price = basePrice + (i % 10) * 4;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        price += 40;
      }
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      mockData[dateString] = price;
    }
    // setPricingData(mockData);
  }, [currentMonth]);


  // Effect to handle clicks outside the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const handleDateClick = (day) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(day);
      setCheckOutDate(null);
    } else if (day > checkInDate) {
      setCheckOutDate(day);
      setIsCalendarOpen(false);
    } else {
      setCheckInDate(day);
      setCheckOutDate(null);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push( <div key = {`empty-${i}`}> </div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);

      let classes = "aspect-square flex flex-col items-center justify-center rounded-md cursor-pointer transition-colors duration-200 text-sm sm:text-sm sm:w-auto h-8 text-black ";
      const isPast = day < today;
      const isToday = day.getTime() === today.getTime();
      const isCheckIn = checkInDate && day.getTime() === new Date(checkInDate).getTime();
      const isCheckOut = checkOutDate && day.getTime() === new Date(checkOutDate).getTime();
      const isInRange = checkInDate && checkOutDate && day > new Date(checkInDate) && day < new Date(checkOutDate);
      
      if (isPast) {
        classes += " text-gray-300 cursor-not-allowed";
      } else {
        if (isCheckIn || isCheckOut) {
          classes += " w-full bg-indigo-600 text-white"; // Changed text to white for better contrast
        } else if (isInRange) {
          classes += " w-full bg-indigo-300 text-indigo-700";
        } else if (isToday) {
          classes += "w-full bg-gray-200 text-gray-800";
        } else {
          classes += " hover:bg-indigo-300";
        }
      }
      
      days.push(
        <div key={i} className={classes} onClick={() => !isPast && handleDateClick(day)}>
          <span>{i}</span>
          {/* MODIFIED: The price display logic has been removed from here */}
        </div>
      );
    }
    
    return (
      <div className="absolute top-20 mt-2 w-full max-w-12xl sm:w-8xl left-1/2 -translate-x-1/2 md:w-12xl md:max-w-full md:left-0 md:translate-x-0 bg-white p-4 rounded-md shadow-xl shadow-indigo-200 border border-gray-600 sm:w-full z-50">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon />
          </button>
          <div className="font-semibold text-lg text-gray-800">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRightIcon />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-8 sm:gap-6 text-center text-xs sm:text-sm text-gray-500 mb-2">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-4 text-center items-center">{days}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => { setCheckInDate(null); setCheckOutDate(null); }} className="text-sm font-semibold text-gray-600 hover:text-indigo-900 px-4 py-2  hover:bg-indigo-300">
            Clear Dates
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full  flex items-start justify-center px-2 sm:px-1 font-Rubik ">
      <div ref={pickerRef} className="relative w-full  max-w-3xl">
        <div className="bg-white rounded-md md:rounded-md shadow-lg flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-1 w-full border border-gray-200">
          
          {/* Check-in */}
          <div onClick={() => { setIsCalendarOpen(true);  }} className="flex-1 w-full p-2 rounded-md  cursor-pointer text-left hover:bg-indigo-100">
            <label className="text-xs font-bold text-gray-700 px-2">Check-in</label>
            <div className="flex items-center space-x-2 px-2">
              <CalendarIcon />
              <span className={`text-md font-semibold ${checkInDate ? 'text-gray-800' : 'text-gray-400'}`}>
                {checkInDate ? formatDate(checkInDate) : 'Add date'}
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 md:h-8 md:w-px"></div>

          {/* Check-out */}
          <div onClick={() => { setIsCalendarOpen(true);  }} className="flex-1 w-full p-2 rounded-md hover:bg-indigo-100 cursor-pointer text-left">
            <label className="text-xs font-bold text-gray-700 px-2">Check-out</label>
            <div className="flex items-center space-x-2 px-2">
              <CalendarIcon />
              <span className={`text-md font-semibold ${checkOutDate ? 'text-gray-800' : 'text-gray-400'}`}>
                {checkOutDate ? formatDate(checkOutDate) : 'Add date'}
              </span>
            </div>
          </div>
        </div>
        {isCalendarOpen && renderCalendar()}
      </div>
    </div>
  );
}