import { Metadata } from 'next';
import CancelButtons from './components/CancelButtons';

export const metadata: Metadata = {
  title: 'Платеж отменен | Flight Tickets',
  description: 'Платеж был отменен',
};

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Платеж отменен
          </h1>
          <p className="text-gray-600">
            Ваш платеж был отменен. Деньги не были списаны с вашей карты.
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Что произошло?</h3>
          <ul className="text-sm text-gray-600 space-y-1 text-center">
            <li>Платеж был отменен до завершения</li>
            <li>Средства не были списаны</li>
            <li>Билет не был забронирован</li>
            <li>Можете попробовать снова</li>
          </ul>
        </div>

        <CancelButtons />
      </div>
    </div>
  );
}
