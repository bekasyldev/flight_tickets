import React from 'react';
import { Plane, User, HelpCircle, Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <Plane className="w-5 h-5 text-blue-600" strokeWidth={2} />
        </div>
        <span className="text-xl font-semibold">Ticket Sales</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <User className="w-5 h-5" strokeWidth={2.5} />
          <span className='font-semibold'>Профиль</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <HelpCircle className="w-5 h-5" strokeWidth={2.5} />
          <span className='font-semibold'>Поддержка</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <Globe className="w-5 h-5" strokeWidth={2.5} />
          <span className='font-semibold'>RUB</span>
        </div>
      </div>
    </header>
  );
};

export default Header;