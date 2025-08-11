import { Plane } from "lucide-react";
import { useTranslation } from "../lib/i18n";

interface TabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();
    
    return (
      <div className="flex justify-center mb-8 bg-blue-700 max-w-3xs py-4 rounded-full">
        <button
          onClick={() => onTabChange('flights')}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            activeTab === 'flights'
              ? 'bg-white text-black shadow-md'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Plane className="w-5 h-5 inline mr-2" />
          {t('mainPage.flights')}
        </button>
      </div>
    );
  };

export default Tabs;