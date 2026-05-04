import React from 'react';

// Your JSON data from the payment gateway (no changes here)
const transactionData = [
  {
    "status": "success",
    "txnid": "EBZTXN0000357",
    "amount": "2.0",
    "addedon": "2022-05-20 07:15:07",
    "payment_source": "Easebuzz",
    "easepayid": "E220520TZ7VGC2",
    "error_Message": "Successful Transaction"
  },
//   {
//     "status": "failure",
//     "txnid": "EBZTXN0000351",
//     "amount": "20.0",
//     "addedon": "2022-05-20 06:35:40",
//     "payment_source": "Easebuzz",
//     "easepayid": "E220520SIWNB81",
//     "error_Message": "!ERROR!-GV00004-PARes status not sucessful."
//   }
];

// Helper to get status-specific colors
const statusStyles = {
  success: {
    pill: 'bg-green-100 text-green-800',
    row: 'bg-green-50'
  },
  failure: {
    pill: 'bg-red-100 text-red-800',
    row: 'bg-red-50'
  }
};

const PaymentResponse = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Payment Transaction Details</h1>
        <p className="text-slate-500 text-center mb-8">Here is a summary of the recent transactions.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Transaction ID</th>
                <th className="p-4 font-semibold text-slate-600">Easebuzz ID</th>
                <th className="p-4 font-semibold text-slate-600">Amount</th>
                <th className="p-4 font-semibold text-slate-600">Timestamp</th>
                <th className="p-4 font-semibold text-slate-600">Message</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.map((tx) => (
                <tr key={tx.txnid} className={`border-b border-slate-200 hover:${statusStyles[tx.status].row}`}>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusStyles[tx.status].pill}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-mono text-sm">{tx.txnid}</td>
                  <td className="p-4 text-slate-700 font-mono text-sm">{tx.easepayid}</td>
                  <td className="p-4 text-slate-800 font-semibold">₹{parseFloat(tx.amount).toFixed(2)}</td>
                  <td className="p-4 text-slate-500">{tx.addedon}</td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">{tx.error_Message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-center mt-8">
            <button 
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200" 
              onClick={() => alert('Redirecting to homepage...')}
            >
              Return to Home
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResponse;