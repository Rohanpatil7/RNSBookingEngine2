// src/utils/easebuzz.js

const initiatePayment = (accessKey, onResponse) => {
  if (!accessKey) {
    console.error("Access Key is required to initiate payment.");
    return;
  }
  
  // Replace with your Merchant Key from the Easebuzz dashboard
  // It's best to store this in an environment variable
  const merchantKey = import.meta.env.VITE_EASEBUZZ_MERCHANT_KEY;

    // Add a check to make sure the key was loaded
  if (!merchantKey) {
    console.error("Easebuzz Merchant Key is missing. Make sure VITE_EASEBUZZ_MERCHANT_KEY is set in your .env file.");
    alert("Payment system is not configured correctly. Please contact support.");
    return;
  }
  
  const easebuzzCheckout = new window.EasebuzzCheckout(merchantKey, "prod");
  const options = {
    access_key: accessKey, // The access_key received from your server
    onResponse: onResponse, // A callback function to handle the response
    theme: "indigo", // Your brand color
  };

  easebuzzCheckout.initiatePayment(options);
};

export default initiatePayment;