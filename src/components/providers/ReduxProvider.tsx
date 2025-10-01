'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import PageLoader from '@/components/ui/PageLoader';

interface IReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: IReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PageLoader message="Initializing application..." />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
