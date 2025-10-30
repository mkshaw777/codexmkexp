import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './lib/migration';
import { initStorageManagement } from './lib/storage-cleanup';

// Initialize system
console.log('🚀 MK Marketing - Professional Expense Management System');
console.log('💼 Corporate Edition - Firebase Ready');

// Initialize storage management (prevent memory errors)
initStorageManagement();

console.log('✅ System initialized successfully!');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
