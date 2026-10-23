import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import {AuthProvider} from './context/AuthContext.tsx';
import {DataProvider} from './context/DataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </AuthProvider>
);
