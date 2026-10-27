import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import {AuthProvider} from './context/AuthContext.tsx';
import {DataProvider} from './context/DataContext.tsx';
import {LanguageProvider} from './context/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <AuthProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AuthProvider>
  </LanguageProvider>
);
