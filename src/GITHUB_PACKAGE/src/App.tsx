import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import '@/lib/migration';
import { initializeDemoData } from '@/lib/data';
import { initializeDefaultUsers } from '@/lib/auth';
import '@/lib/debug-helper'; // Load debug utilities

// Initialize users first, then demo data
console.log('🚀 App Starting - Initializing system...');
initializeDefaultUsers();
initializeDemoData();
console.log('✅ System initialized successfully!');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
