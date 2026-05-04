// src/components/Guestinfo.jsx

import React, { useState, useEffect } from 'react';

// The component now takes an onGuestInfoChange prop to lift its state up.
const Guestinfo = ({ guestInfoData, onGuestInfoChange }) => {
    const [guestDetails, setGuestDetails] = useState({});
    const [primaryContactName, setPrimaryContactName] = useState('');
    const [applyToAll, setApplyToAll] = useState(false);
    const [specialRequests, setSpecialRequests] = useState('');

    // Initializes the state when guestInfoData is available.
    useEffect(() => {
        const initialState = {};
        if (guestInfoData) {
            guestInfoData.forEach(({ instanceId }) => {
                initialState[instanceId] = { guestName: '' };
            });
        }
        setGuestDetails(initialState);
    }, [guestInfoData]);

    // +++ NEW: Auto-submits data on change +++
    // This useEffect hook calls the onGuestInfoChange callback whenever the
    // guest details or special requests are updated, effectively "auto-submitting"
    // the data to the parent component.
    useEffect(() => {
        if (onGuestInfoChange) {
            onGuestInfoChange({ guestDetails, specialRequests });
        }
    }, [guestDetails, specialRequests, onGuestInfoChange]);


    // Effect for "Apply to All" checkbox.
    useEffect(() => {
        if (applyToAll) {
            setGuestDetails(prevDetails => {
                const newDetails = { ...prevDetails };
                for (const instanceId in newDetails) {
                    newDetails[instanceId] = { guestName: primaryContactName };
                }
                return newDetails;
            });
        }
    }, [primaryContactName, applyToAll]);

    const handleNameChange = (instanceId, value) => {
        setGuestDetails(prevDetails => ({
            ...prevDetails,
            [instanceId]: { ...prevDetails[instanceId], guestName: value },
        }));
    };
    
    const handleApplyToAllChange = (e) => {
        setApplyToAll(e.target.checked);
    };

    if (!guestInfoData || guestInfoData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-2 text-center bg-white rounded-2xl shadow-md mt-2 max-w-2xl ">
                <h3 className="text-md font-bold text-gray-800">Guest Information</h3>
                <p className="mt-0.5 text-gray-500">Guest data not found. Please specify the number of guests first.</p>
            </div>
        );
    }
    
    return (
        // --- REMOVED: <form> and onSubmit handler ---
        <div className="w-full max-w-3xl p-1 font-semibold font-Rubik">
            <div className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-4 space-y-2">
                {/* Primary Contact Section */}
                <div>
                    <h1 className="text-md sm:text-2xl font-bold text-gray-900 text-center">Guest Information</h1>
                    <p className="text-sm  text-gray-500 mt-0.5 text-center">Please provide one guest name for each room.</p>
                </div>
                <div className="p-2.5 border border-gray-200 rounded-xl bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">Primary Booking Contact</h2>
                    <div className="mb-4">
                        <label htmlFor="primaryContact" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="primaryContact"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., Jane Doe"
                            value={primaryContactName}
                            onChange={(e) => setPrimaryContactName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="applyToAllRooms"
                            className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={applyToAll}
                            onChange={handleApplyToAllChange}
                        />
                        <label htmlFor="applyToAllRooms" className="ml-2 block text-xs text-gray-800 font-medium">
                            Use this name for all rooms.
                        </label>
                    </div>
                </div>

                {/* Guest Name Inputs */}
                <div className="space-y-4">
                    {guestInfoData.map(({ instanceId, title, counts, childrenAges }) => {
                        const lastUnderscoreIndex = instanceId.lastIndexOf('_');
                        const instanceNum = instanceId.slice(lastUnderscoreIndex + 1);

                        return (
                            <div key={instanceId} className="p-2.5 border border-gray-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-1">
                                    {title} #{parseInt(instanceNum) + 1}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor={`guest-name-${instanceId}`} className="block text-xs font-medium text-gray-700 mb-1">
                                            Guest Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id={`guest-name-${instanceId}`}
                                            className=" block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Full Name"
                                            value={guestDetails[instanceId]?.guestName || ''}
                                            onChange={(e) => handleNameChange(instanceId, e.target.value)}
                                            disabled={applyToAll}
                                            required
                                        />
                                    </div>

                                    {counts.children > 0 && (
                                        <div className="">
                                            <p className="block text-sm font-medium text-gray-700">
                                                Guest Count: {counts.adults} Adult{counts.adults > 1 ? 's' : ''} & {counts.children} Child{counts.children > 1 ? 'ren' : ''}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                (Children's Ages: {childrenAges?.join(', ') || 'N/A'})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Special Requests */}
                <div>
                    <label htmlFor="specialRequests" className="block text-sm font-semibold text-gray-800 mb-2">
                        Special Requests (Optional)
                    </label>
                    <textarea
                        id="specialRequests"
                        rows="4"
                        className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
                        placeholder="e.g., late check-in, room preference, food allergies"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                    ></textarea>
                </div>
                
                {/* --- REMOVED: "Continue to Payment" button --- */}
            </div>
        </div>
    );
};

export default Guestinfo;