'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface CardData {
  id: string;
  last_four_digits: string;
  brand: string;
  cardholder_name: string;
  unavailable_at?: string;
}

interface DuffelCardFormProps {
  clientKey: string;
  intent: 'to-create-card-for-temporary-use' | 'to-save-card' | 'to-use-saved-card';
  onValidateSuccess?: () => void;
  onValidateFailure?: (error: object) => void;
  onSaveCardSuccess?: (card: CardData) => void;
  onSaveCardFailure?: (error: object) => void;
  onCreateCardForTemporaryUseSuccess?: (card: CardData) => void;
  onCreateCardForTemporaryUseFailure?: (error: object) => void;
}

// Dynamic imports to prevent SSR issues
const DuffelCardFormComponent = dynamic(
  () => import('@duffel/components').then(mod => mod.DuffelCardForm),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка формы оплаты...</div>
        <div className="text-sm text-gray-400">Инициализация компонента...</div>
      </div>
    )
  }
);

export default function DuffelCardFormWrapper({
  clientKey,
  intent,
  onValidateSuccess,
  onValidateFailure,
  onSaveCardSuccess,
  onSaveCardFailure,
  onCreateCardForTemporaryUseSuccess,
  onCreateCardForTemporaryUseFailure
}: DuffelCardFormProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка формы оплаты...</div>
        <div className="text-sm text-gray-400">Инициализация...</div>
      </div>
    );
  }

  if (!clientKey) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-2">Загрузка формы оплаты...</div>
        <div className="text-sm text-gray-400">
          Требуется настройка Duffel API
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <DuffelCardFormComponent
          clientKey={clientKey}
          intent={intent}
          onValidateSuccess={onValidateSuccess as unknown as never}
          onValidateFailure={onValidateFailure as unknown as never}
          onSaveCardSuccess={onSaveCardSuccess as unknown as never}
          onSaveCardFailure={onSaveCardFailure as unknown as never}
          onCreateCardForTemporaryUseSuccess={onCreateCardForTemporaryUseSuccess as unknown as never}
          onCreateCardForTemporaryUseFailure={onCreateCardForTemporaryUseFailure as unknown as never}
        />
      </div>
    </div>
  );
} 