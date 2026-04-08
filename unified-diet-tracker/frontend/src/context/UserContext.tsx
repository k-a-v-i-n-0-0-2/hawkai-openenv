import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  age: string;
  setAge: (age: string) => void;
  streak: number;
  setStreak: (streak: number) => void;
  getInitials: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string>(() => {
    try {
      return localStorage.getItem('fitpro-username') || '';
    } catch (e) {
      return '';
    }
  });

  const [age, setAgeState] = useState<string>(() => {
    try {
      return localStorage.getItem('fitpro-age') || '';
    } catch (e) {
      return '';
    }
  });

  const [streak, setStreakState] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('fitpro-streak')) || 15; // Default 15 as per example
    } catch (e) {
      return 15;
    }
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    try {
      localStorage.setItem('fitpro-username', name);
    } catch (e) {
      console.error('Failed to save username to localStorage', e);
    }
  };

  const setAge = (age: string) => {
    setAgeState(age);
    try {
      localStorage.setItem('fitpro-age', age);
    } catch (e) {
      console.error('Failed to save age to localStorage', e);
    }
  };

  const setStreak = (streak: number) => {
    setStreakState(streak);
    try {
      localStorage.setItem('fitpro-streak', streak.toString());
    } catch (e) {
      console.error('Failed to save streak to localStorage', e);
    }
  };

  const getInitials = () => {
    if (!userName) return 'AR'; // Default
    const names = userName.trim().split(/\s+/);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0].slice(0, 2).toUpperCase();
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, age, setAge, streak, setStreak, getInitials }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
