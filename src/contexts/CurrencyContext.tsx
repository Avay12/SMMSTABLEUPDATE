import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

const DEFAULT_CURRENCY: Currency = {
  code: 'USD',
  symbol: '$',
  rate: 1,
};

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  formatCurrency: (amountInUsd: number | undefined) => string;
  convert: (amountInUsd: number | undefined) => number;
  loading: boolean;
  refreshCurrencies: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [DEFAULT_CURRENCY],
  currentCurrency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  formatCurrency: (amount) => `$${(amount || 0).toFixed(2)}`,
  convert: (amount) => amount || 0,
  loading: true,
  refreshCurrencies: async () => {},
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([DEFAULT_CURRENCY]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/admin/currencies');
      if (Array.isArray(data) && data.length > 0) {
        setCurrencies(data);
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    // If the user profile has a currency, try to use it.
    // Otherwise fallback to localStorage, then USD.
    const userCurrencyCode = profile?.currency || localStorage.getItem('famestablr_currency') || 'USD';
    const found = currencies.find(c => c.code === userCurrencyCode);
    if (found) {
      setCurrentCurrency(found);
    } else if (currencies.length > 0) {
      const fallback = currencies.find(c => c.code === 'USD') || currencies[0];
      setCurrentCurrency(fallback);
    }
  }, [profile, currencies]);

  const setCurrency = (code: string) => {
    const found = currencies.find(c => c.code === code);
    if (found) {
      setCurrentCurrency(found);
      localStorage.setItem('famestablr_currency', code);
    }
  };

  const convert = (amountInUsd: number | undefined) => {
    if (amountInUsd === undefined || amountInUsd === null) return 0;
    return amountInUsd * currentCurrency.rate;
  };

  const formatCurrency = (amountInUsd: number | undefined) => {
    const converted = convert(amountInUsd);
    return `${currentCurrency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        currentCurrency,
        setCurrency,
        formatCurrency,
        convert,
        loading,
        refreshCurrencies: fetchCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
