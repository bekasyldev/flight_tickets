import { Heart, Plane } from "lucide-react";

interface TabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }
  
const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
    return (
      <div className="flex justify-center gap-2 mb-8 bg-blue-700 max-w-sm py-2 rounded-full">
        <button
          onClick={() => onTabChange('flights')}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            activeTab === 'flights'
              ? 'bg-white text-black shadow-md'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Plane className="w-5 h-5 inline mr-2" />
          Авиабилеты
        </button>
        <button 
          onClick={() => onTabChange('favorites')}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            activeTab === 'favorites'
              ? 'bg-white text-black shadow-md'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5 inline mr-2" />
          Избранное
        </button>
      </div>
    );
  };

export default Tabs;