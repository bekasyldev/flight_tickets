'use client';

export default function SuccessButtons() {
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={handleBackToHome}
        className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Найти новые рейсы
      </button>
      
      <p className="text-xs text-gray-500">
        При возникновении проблем обратитесь в службу поддержки <a href="mailto:avelrusimport@gmail.com" className="text-orange-500">avelrusimport@gmail.com</a>
      </p>
    </div>
  );
}
