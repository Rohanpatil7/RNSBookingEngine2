import React, { useState } from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css"; // Ensure you have rsuite styles imported in your project

const DateRangePickerComponent = ({ onDateChange }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [nights, setNights] = useState(0);

  const handleDateChange = (value) => {
    setDateRange(value);

    if (value && value[0] && value[1]) {
      const checkIn = new Date(value[0]);
      const checkOut = new Date(value[1]);
      const diffTime = Math.abs(checkOut - checkIn);
      const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(totalNights);

      if (onDateChange) {
        onDateChange({
          checkIn: checkIn.toLocaleDateString(),
          checkOut: checkOut.toLocaleDateString(),
          nights: totalNights,
        });
      }
    } else {
      setNights(0);
    }
  };

  return (
    // This container is already responsive.
    // `w-full` makes it take the full width on small screens.
    // `max-w-lg` prevents it from becoming too wide on large screens.
    // `mx-auto` is added to center it within its parent on larger screens.
    <div className="flex flex-col items-start gap-6 p-4 border rounded-2xl shadow-md w-full max-w-lg mx-auto sm:max-w-full">
      <h2 className="text-lg font-bold text-gray-700">Select Dates</h2>
      <DateRangePicker
        placeholder="Select Check-in and Check-out"
        onChange={handleDateChange}
        format="dd-MM-yyyy"
        // CHANGE: Removed the problematic inline style and replaced it with a responsive Tailwind class.
        // `w-full` makes the picker adapt to the width of its parent container.
        className="w-full"
      />
      {dateRange[0] && dateRange[1] && (
        <div className="mt-2 text-sm text-gray-600"> {/* Added a little top margin for spacing */}
          <p>
            <span className="font-semibold">Check-in:</span>{" "}
            {dateRange[0].toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Check-out:</span>{" "}
            {dateRange[1].toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Nights:</span> {nights}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerComponent;