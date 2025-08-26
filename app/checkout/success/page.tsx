import { Suspense } from 'react';
import { Metadata } from 'next';
import SuccessButtons from './components/SuccessButtons';
import TicketPurchaseHandler from './components/TicketPurchaseHandler';

export const metadata: Metadata = {
  title: 'Платеж успешен | Flight Tickets',
  description: 'Ваш платеж прошел успешно',
};

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Платеж успешен!
          </h1>
          <p className="text-gray-600">
            Обрабатываем ваш заказ и отправляем билет на email.
          </p>
        </div>

        <TicketPurchaseHandler />

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Что дальше?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Платеж обработан через Stripe</li>
            <li>🎫 Билет автоматически оформляется</li>
            <li>📧 Email с билетом будет отправлен</li>
            <li>📱 Проверьте папку &quot;Спам&quot;</li>
          </ul>
        </div>

        <SuccessButtons />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Обработка результата...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
