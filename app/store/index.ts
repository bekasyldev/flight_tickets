import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'EUR';

interface CurrencyState {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'USD',
            setCurrency: (currency: Currency) => set({ currency }),
        }),
        {
            name: 'flight-tickets-currency',
        }
    )
);