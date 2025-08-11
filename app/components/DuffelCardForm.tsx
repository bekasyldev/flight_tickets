'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';

interface CardData {
  id: string;
  last_four_digits?: string;
  brand?: string;
  cardholder_name?: string;
  unavailable_at?: string;
  live_mode?: boolean;
}

interface DuffelCardFormProps {
  clientKey: string;
  onValidateSuccess?: () => void;
  onValidateFailure?: (error: object) => void;
  onCreateCardForTemporaryUseSuccess?: (card: CardData) => void;
  onCreateCardForTemporaryUseFailure?: (error: object) => void;
}

export interface DuffelCardFormRef {
  createCardForTemporaryUse: () => void;
}

// Dynamic imports to prevent SSR issues
const DuffelCardFormWithActions = dynamic(
  () => import('@duffel/components').then(mod => {
    const { DuffelCardForm, useDuffelCardFormActions } = mod;
    
    const Component = forwardRef<DuffelCardFormRef, DuffelCardFormProps>(({
      clientKey,
      onValidateSuccess,
      onValidateFailure,
      onCreateCardForTemporaryUseSuccess,
      onCreateCardForTemporaryUseFailure
    }, ref) => {
      const { ref: duffelRef, createCardForTemporaryUse } = useDuffelCardFormActions();
      
      useImperativeHandle(ref, () => ({
        createCardForTemporaryUse
      }));

      return (
        <DuffelCardForm
          ref={duffelRef}
          clientKey={clientKey}
          intent="to-create-card-for-temporary-use"
          onValidateSuccess={onValidateSuccess}
          onValidateFailure={() => onValidateFailure && onValidateFailure({})}
          onCreateCardForTemporaryUseSuccess={onCreateCardForTemporaryUseSuccess}
          onCreateCardForTemporaryUseFailure={() => onCreateCardForTemporaryUseFailure && onCreateCardForTemporaryUseFailure({})}
        />
      );
    });
    
    Component.displayName = 'DuffelCardFormWithActions';
    return { default: Component };
  }),
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

const DuffelCardFormWrapper = forwardRef<DuffelCardFormRef, DuffelCardFormProps>(({
  clientKey,
  onValidateSuccess,
  onValidateFailure,
  onCreateCardForTemporaryUseSuccess,
  onCreateCardForTemporaryUseFailure
}, ref) => {
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
        <DuffelCardFormWithActions
          ref={ref}
          clientKey={clientKey}
          onValidateSuccess={onValidateSuccess}
          onValidateFailure={onValidateFailure}
          onCreateCardForTemporaryUseSuccess={onCreateCardForTemporaryUseSuccess}
          onCreateCardForTemporaryUseFailure={onCreateCardForTemporaryUseFailure}
        />
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">💡 Тестирование платежей</h4>
        <div className="text-sm text-blue-700">
          <p className="mb-1"><strong>Для тестирования 3DS:</strong> 4242424242424242</p>
          <p className="mb-1"><strong>Без 3DS:</strong> 4111110116638870</p>
          <p className="mb-1"><strong>CVC:</strong> любые 3 цифры, <strong>Дата:</strong> любая будущая</p>
          <p className="text-xs text-blue-600 mt-2">
            💡 Нажмите кнопку &quot;Оплатить&quot; после валидации формы
          </p>
        </div>
      </div>
    </div>
  );
});

DuffelCardFormWrapper.displayName = 'DuffelCardFormWrapper';

export default DuffelCardFormWrapper;