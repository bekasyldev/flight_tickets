'use client';

export default function CancelButtons() {
  const handleTryAgain = () => {
    window.history.back();
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={handleTryAgain}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Попробовать снова
      </button>
      
      <button 
        onClick={handleBackToHome}
        className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Найти новые рейсы
      </button>
      
      <p className="text-xs text-gray-500">
        При возникновении проблем обратитесь в службу поддержки <a href="mailto:avelrusimport@gmail.com" className="text-orange-500">avelrusimport@gmail.com</a>
      </p>  
    </div>
  );
}
