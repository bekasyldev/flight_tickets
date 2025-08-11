import React, { useEffect, useState } from 'react';
import { Plane, User, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
        <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          onClick={() => router.push('/')}
        >
          <Plane className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 hidden md:block">FlightTickets</span>
        </div>
      
      <div className="flex items-center md:gap-6 gap-2">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <User className="w-5 h-5" strokeWidth={2.5} />
          <span className='font-semibold'>
            {isMobile ? '' : 'Профиль'}
          </span>
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          onClick={() => router.push('/support')}
        >
          <HelpCircle className="w-5 h-5" strokeWidth={2.5} />
          <span className='font-semibold'>
            {isMobile ? '' : t('header.support')}
          </span>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
    </header>
  );
};

export default Header;