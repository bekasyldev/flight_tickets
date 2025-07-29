import { createContext, useContext } from 'react';

export type Locale = 'en' | 'ru' | 'ua' | 'md';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, fallback?: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}

// Translation function that gets nested values
export function getNestedTranslation(obj: Record<string, unknown>, path: string): string {
    return path.split('.').reduce((current: unknown, key: string) => {
        return current && typeof current === 'object' && current !== null && key in current
            ? (current as Record<string, unknown>)[key]
            : undefined;
    }, obj) as string;
}

// Load translations dynamically
export async function loadTranslations(locale: Locale) {
    try {
        const response = await fetch(`/locales/${locale}/common.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${locale}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading translations for ${locale}:`, error);
        // Fallback to Russian if the requested locale fails
        if (locale !== 'ru') {
            try {
                const fallbackResponse = await fetch('/locales/ru/common.json');
                return await fallbackResponse.json();
            } catch (fallbackError) {
                console.error('Failed to load fallback translations:', fallbackError);
                return {};
            }
        }
        return {};
    }
} 