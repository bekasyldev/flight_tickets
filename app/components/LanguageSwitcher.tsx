import { Globe, Check, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTranslation, Locale } from "../lib/i18n"
import { useCurrencyStore, Currency } from "../store"

type TabType = 'language' | 'currency';

interface LanguageOption {
  code: Locale;
  name: string;
  flag: string;
}

interface CurrencyOption {
  code: Currency;
  name: string;
  fullName: string;
  symbol: string;
}

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation()
  const { currency, setCurrency } = useCurrencyStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('language')
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ua', name: 'Українська', flag: '🇺🇦' },
    { code: 'md', name: 'Română', flag: '🇲🇩' },
  ]

  const currencies: CurrencyOption[] = [
    { code: 'EUR', name: 'EUR', fullName: t('currencies.EUR'), symbol: '€' },
    { code: 'USD', name: 'USD', fullName: t('currencies.USD'), symbol: '$' },
  ]

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isMobile])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleLanguageChange = (language: Locale) => {
    setLocale(language)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const selectedLanguageData = languages.find(lang => lang.code === locale)

  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={toggleOpen}>
          <Globe className="w-5 h-5" strokeWidth={2.5} />
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-blue-600 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">{t('header.settings')}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-100 p-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Tabs */}
                <div className="flex bg-gray-50">
                  <button
                    onClick={() => setActiveTab('language')}
                    className={`flex-1 p-4 text-center font-semibold transition-colors ${
                      activeTab === 'language'
                        ? 'bg-white text-black border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {t('languageSwitcher.language')}
                  </button>
                  <button
                    onClick={() => setActiveTab('currency')}
                    className={`flex-1 p-4 text-center font-semibold transition-colors ${
                      activeTab === 'currency'
                        ? 'bg-white text-black border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {t('languageSwitcher.currency')}
                  </button>
                </div>

                {/* Options */}
                <div className="p-4">
                  {activeTab === 'language' ? (
                    <div className="space-y-3">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{language.flag}</span>
                            <span className="text-black font-medium">{language.name}</span>
                          </div>
                          {locale === language.code && (
                            <Check className="w-6 h-6 text-blue-800" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currencies.map((currencyOption) => (
                        <button
                          key={currencyOption.code}
                          onClick={() => handleCurrencyChange(currencyOption.code)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{currencyOption.symbol}</span>
                            </div>
                            <div className="text-left">
                              <div className="text-black font-medium">{currencyOption.code} {currencyOption.fullName}</div>
                            </div>
                          </div>
                          {currency === currencyOption.code && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop Dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80" 
        onClick={toggleOpen}
      >
        <Globe className="w-5 h-5" strokeWidth={2.5} />
        <span className='font-semibold'>
                {currency} • {selectedLanguageData?.code.toUpperCase()}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 p-2">
          {/* Tabs */}
          <div className="flex bg-gray-200 p-2 rounded-2xl">
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 p-3 rounded-2xl text-center text-black font-semibold transition-colors ${
                activeTab === 'language'
                  ? 'bg-white'
                  : ''
              }`}
                          >
                {t('languageSwitcher.language')}
              </button>
              <button
                onClick={() => setActiveTab('currency')}
                className={`flex-1 p-3 rounded-2xl text-center text-black font-semibold transition-colors ${
                  activeTab === 'currency'
                    ? 'bg-white '
                    : ''
                }`}
              >
                {t('languageSwitcher.currency')}
            </button>
          </div>

          {/* Options */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'language' ? (
              <div className="space-y-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{language.flag}</span>
                      <span className={`text-black
                        ${locale === language.code ? 'font-semibold' : 'font-medium'}`
                        }>{language.name}</span>
                    </div>
                    {locale === language.code && (
                      <Check className="w-6 h-6 text-blue-800" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {currencies.map((currencyOption) => (
                  <button
                    key={currencyOption.code}
                    onClick={() => handleCurrencyChange(currencyOption.code)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left flex items-center gap-1">
                        <div className={`text-black text-sm
                          ${currency === currencyOption.code ? 'font-semibold' : 'font-medium'}`
                          }>{currencyOption.code} {currencyOption.fullName}</div>
                          <span className="text-lg text-black">·</span>
                        <div className="text-sm text-black ">{currencyOption.symbol}</div>
                      </div>
                    </div>
                    {currency === currencyOption.code && (
                      <Check className="w-6 h-6 text-blue-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}