/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Login from './pages/Login';
import NameInput from './pages/NameInput';
import DetailsInput from './pages/DetailsInput';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import Streaks from './pages/Streaks';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider } from './context/NavigationContext';
import { UserProvider } from './context/UserContext';
import AppLayout from './components/AppLayout';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* @ts-expect-error key is required for AnimatePresence */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/name" element={<NameInput />} />
        <Route path="/details" element={<DetailsInput />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/streaks" element={<Streaks />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <BrowserRouter>
          <NavigationProvider>
            <AppLayout>
              <AnimatedRoutes />
            </AppLayout>
          </NavigationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </UserProvider>
  );
}
