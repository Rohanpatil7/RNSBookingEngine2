import React from 'react'

function Imageslider() {
  return (
    <div className="flex items-center">

        <button id="prev" className="md:p-2 p-1 bg-black/30 md:mr-6 mr-2 rounded-full hover:bg-black/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    

        <div className="hidden md:block">
            <div className="w-full max-w-3xl overflow-hidden relative">
                <div className="flex transition-transform duration-500 ease-in-out" id="slider">
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide1.png" className="w-full flex-shrink-0" alt="Slide 1"/>
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide2.png" className="w-full flex-shrink-0" alt="Slide 2"/>
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide3.png" className="w-full flex-shrink-0" alt="Slide 3"/>
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide4.png" className="w-full flex-shrink-0" alt="Slide 4"/>
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide5.png" className="w-full flex-shrink-0" alt="Slide 5"/>
                </div>
            </div>
        </div>

        <button id="next" className="p-1 md:p-2 bg-black/30 md:ml-6 ml-2 rounded-full hover:bg-black/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>


  )
}

export default Imageslider;

