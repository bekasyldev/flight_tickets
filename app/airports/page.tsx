'use client'

import React, { useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BookingForm from "../components/BookingForm";
import MobileBookingForm from "../components/MobileBookingForm";

const AviasalesApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700">
      {!isMobile && <Header />}
      
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Тут покупают дешёвые авиабилеты
          </h1>
          <div className="max-w-sm mx-auto">
            {!isMobile && (
              <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}
          </div>
          
          
          {isMobile && (
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur rounded-full px-6 py-3 inline-block">
                <span className="text-white font-medium">Авиабилеты</span>
              </div>
            </div>
          )}
        </div>

        {isMobile ? <MobileBookingForm /> : <BookingForm />}
      </main>
    </div>
  );
};

export default AviasalesApp;