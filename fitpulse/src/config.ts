/// <reference types="vite/client" />
/**
 * HawkAI Configuration
 */

// Connect to Local Backend
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000';
console.log('HawkAI API Base URL:', API_BASE_URL);
