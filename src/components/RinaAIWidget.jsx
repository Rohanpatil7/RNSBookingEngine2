import React, { useState, useRef, useEffect } from "react";
// 1. Import the new SDK
import { createAgentManager } from '@d-id/client-sdk';

const DID_AGENT_CLIENT_KEY = import.meta.env.VITE_DID_AGENT_CLIENT_KEY || "";
const DID_AGENT_ID = import.meta.env.VITE_DID_AGENT_ID || "";

export default function RinaAIWidget({ hotelData, rooms }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [input, setInput] = useState("");
  
  const videoRef = useRef(null);
  const agentManagerRef = useRef(null); // Stores our SDK instance

  // 2. Helper to build our live dynamic context
  const getHotelContext = () => {
    const hotelName = hotelData?.HotelName || "our hotel";
    const roomSummary = (rooms || []).map(r => `${r.title}: ₹${r.pricePerNight}/night`).join(", ");
    return `[SYSTEM CONTEXT: The user is currently viewing ${hotelName}. Today's available rooms and prices are: ${roomSummary}. Use this data to answer questions accurately.]`;
  };

  // 3. The new streamlined connection using the SDK
  const connectAgent = async () => {
    if (!DID_AGENT_CLIENT_KEY || !DID_AGENT_ID) return setStatus("error: missing keys");
    
    try {
      setStatus("connecting...");
      
      const callbacks = {
        onSrcObjectReady: (stream) => {
          // The SDK handles WebRTC; we just attach the stream to your video tag
          if (videoRef.current) videoRef.current.srcObject = stream;
        },
        onVideoStateChange: (state) => {
          if (state === "PLAYING") setStatus("connected");
        }
      };

      // Initialize the SDK
      const agentManager = await createAgentManager(DID_AGENT_ID, {
        auth: { type: 'key', clientKey: DID_AGENT_CLIENT_KEY },
        callbacks
      });

      agentManagerRef.current = agentManager;
      await agentManager.connect();

      // 4. Inject the live data and trigger her greeting
      agentManager.chat(`${getHotelContext()} Hello! Please briefly introduce yourself to the guest.`);

    } catch (error) {
      console.error("D-ID Connection failed:", error);
      setStatus("error");
    }
  };

  // 5. Clean, simple chat function
  const sendMessage = () => {
    if (!input.trim() || !agentManagerRef.current) return;
    
    // The SDK handles sending this straight to the Agent's internal LLM
    agentManagerRef.current.chat(input);
    setInput("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentManagerRef.current) agentManagerRef.current.disconnect();
    };
}, []);

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, width: 300, padding: 10, backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      <video ref={videoRef} autoPlay muted style={{ width: "100%", borderRadius: 8 }} />
      <div style={{ marginTop: 10 }}>
        {status === "idle" && <button onClick={connectAgent} style={{ width: "100%", padding: 10, backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}>Chat with Rina</button>}
        {status === "connecting..." && <p>Connecting to Rina...</p>}
        {status === "connected" && (
          <div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
