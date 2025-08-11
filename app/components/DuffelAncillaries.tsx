'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface PassengerInfo {
  given_name: string;
  family_name: string;
  gender: 'M' | 'F';
  title: string;
  born_on: string;
  email: string;
  phone_number: string;
}

interface DuffelAncillariesProps {
  clientKey: string;
  offerId: string;
  passengers: PassengerInfo[];
  onPayloadReady: (payload: { 
    data: { 
      passengers: PassengerInfo[]; 
      services: { id: string; quantity: number }[] 
    } 
  }) => void;
}

// Dynamic import to prevent SSR issues
const DuffelAncillariesComponent = dynamic(
  () => import('@duffel/components').then(mod => ({ default: mod.DuffelAncillaries })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка дополнительных услуг...</div>
        <div className="text-sm text-gray-400">Инициализация компонента...</div>
      </div>
    )
  }
);

export default function DuffelAncillariesWrapper({ 
  clientKey, 
  offerId, 
  passengers, 
  onPayloadReady 
}: DuffelAncillariesProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка дополнительных услуг...</div>
        <div className="text-sm text-gray-400">Инициализация...</div>
      </div>
    );
  }

  if (!clientKey || !offerId) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка дополнительных услуг...</div>
        <div className="text-sm text-gray-400">
          Требуется настройка Duffel API
        </div>
      </div>
    );
  }

  // Transform passengers to match Duffel expected format
  const duffelPassengers = passengers.map((passenger, index) => ({
    id: `pas_${index}_${Date.now()}`,
    given_name: passenger.given_name,
    family_name: passenger.family_name,
    gender: passenger.gender.toLowerCase(),
    title: passenger.title,
    born_on: passenger.born_on,
    email: passenger.email,
    phone_number: passenger.phone_number
  }));

  const handlePayloadReady = (data: unknown) => {
    const typedData = data as { passengers: PassengerInfo[]; services: { id: string; quantity: number }[] };
    onPayloadReady({ data: typedData });
  };

  return (
    <div className="w-full">
      <DuffelAncillariesComponent
        styles={{
          accentColor: "249,115,22",
          buttonCornerRadius: "12px",
        }}
        client_key={clientKey}
        offer_id={offerId}
        services={['bags', 'seats']}
        passengers={duffelPassengers as unknown as never}
        markup={{
          bags: { amount: 0, rate: 0.05 }
        }}
        onPayloadReady={handlePayloadReady as unknown as never}
      />
    </div>
  );
} 