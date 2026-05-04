import React, { useState } from "react";

const Filters = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("Select");

    const types = ["Germany", "Canada", "United States", "Russia", "India"];

    const handleSelect = (type) => {
        setSelected(type);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col w-44 text-sm relative overflow-hidden ">
            <button type="button" onClick={() => setIsOpen(!isOpen)}
                className="w-full rounded-full text-left px-4 pr-2 py-2 border  bg-white text-gray-800 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
                <span className="rounded-full">{selected}</span>
                <svg className={`w-5 h-5 inline float-right  rounded transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul className="w-full bg-white border border-gray-300 shadow-md mt-1 py-2 rounded">
                    {types.map((type) => (
                        <li key={type} className="px-4 py-2 rounded-full hover:bg-indigo-500 hover:text-white cursor-pointer" onClick={() => handleSelect(type)} >
                            {type}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Filters;