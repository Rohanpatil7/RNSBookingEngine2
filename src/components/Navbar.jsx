/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
// import assets from "../assets";
import logo from "/hotelLUx.png";

const Navbar = ({hotelData}) => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/allrooms" },
    { name: "MY Bookings", path: "/booking/:id" },
    { name: "payment", path: "/payment" },
  ];


  // const [isScrolled, setIsScrolled] = useState(false);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


//  useEffect(() => {
//   if (location.pathname === '/') {
//     setIsScrolled(true);
//     return;
//   } else {
//     setIsScrolled(false);
//   }
//   setIsScrolled(prev => location.pathname !== '/' ? true : prev);

//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [location.pathname]);

  return (
    <nav
      className={`sticky h-18 align-baseline top-0  left-0 text-black bg-white w-full flex items-center justify-between sm:px-4 md:px-24 lg:px-32 xl:px-32 transition-all duration-500 z-50 cursor-default border-b border-indigo-50 drop-shadow-md` }
        // ${
      //   isScrolled
      //     ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
      //     : "py-4 md:py-6"
      // }`}
    >
      {/* Logo */}
      <Link to={'/'} className={`size-16 items-center align-baseline `}>
       {/* ${isScrolled && "invert opacity-100 "} */}
        <img
          src={hotelData?.LogoUrl}
          alt="logo"
          className={`size-16  justify-center align-bottom items-center hover:scale-110 transition-all duration-300`}
          //  ${isScrolled && "invert opacity-100 "}
        />
      </Link>

      {/* Desktop Nav */}
      <div className={`flex flex-col items-center gap-0.5 w-full md:w-auto sm:w-auto h-auto md:ml-8 lg:ml-16`}>
        <h2 className={`text-2xl font-bold  `}>{hotelData?.HotelName}</h2>
         {/* ${isScrolled ? 'text-black' : 'text-white'} */}
        <p className={`text-xs justify-center text-center `}>{hotelData?.Address}</p>
        {/* ${isScrolled ? 'text-black' : 'text-white'} */}
      </div>
      <div className="hidden md:flex items-center gap-4 lg:gap-8 ">
        {/* {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            className={`group  flex-col gap-0.5 hidden`}
            //  ${
            //   isScrolled ? "text-gray-700" : "text-white"
            // }
          >
            {link.name}
            <div
              className={` h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              // ${
              //   isScrolled ? "bg-gray-700" : "bg-white"
              // }
            />
          </a>
        ))} */}
        {/* <button
          className={`border px-4 py-1 text-sm font-light rounded-lg scale-120 cursor-pointer hover:bg-amber-50 hover:text-black hover:font-medium  hover:shadow-2xl shadow-fuchsia-200 ${
            isScrolled ? "text-black  hover:text-white hover:bg-indigo-600 hover:font-medium shadow-indigo-200" : "text-white "
          } transition-all`} onClick={() => navigate('/rooms')}>
          Book Now
        </button> */}
      </div>

      {/* Desktop Right */}
       {/* <div className="hidden md:flex items-center gap-4"> */}
        {/* <svg
          className={`h-6 w-6 text-white transition-all duration-500 ${
            isScrolled ? "invert" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg> */}
        {/* <button
          className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
            isScrolled ? "text-white bg-black" : "bg-white text-black"
          }`}
        >
          Login
        </button> */}
      {/* </div>  */}

      {/* Mobile Menu Button */}
      {/* <div className="flex items-center gap-3 md:hidden">
        <svg //replace this with img tag later and src={assets.menuIcon}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-6 w-6 cursor-pointer ${isScrolled ? "invert" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </div> */}

      {/* Mobile Menu
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg //replace this with img tag later and src={assets.menuBtn}
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {navLinks.map((link, i) => (
          <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
            {link.name}
          </a>
        ))}

        <button onClick={() => navigate('/rooms')} className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all  hover:text-black hover:bg-fuchsia-600 hover:font-medium shadow-fuchsia-200">
          Book Now
        </button>

        {/* <button className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
          Login
        </button> */}
      {/* </div> */} 
    </nav>
  );
};

export default Navbar;
