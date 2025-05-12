import React, { useEffect, useState } from 'react';
import { fetchHello, checkHealth } from '../services/api'; // adapte le chemin si besoin

type StatusType = 'loading' | 'success' | 'error';

const statusConfig: Record<StatusType, { label: string; bg: string; text: string; icon: string }> = {
  loading: { label: 'Chargement...', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '⏳' },
  success: { label: 'OK',         bg: 'bg-green-100',  text: 'text-green-600',  icon: '✅' },
  error:   { label: 'Erreur',     bg: 'bg-red-100',    text: 'text-red-600',    icon: '❌' },
};

const Status: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<StatusType>('loading');
  const [dbStatus, setDbStatus] = useState<StatusType>('loading');

  useEffect(() => {
    (async () => {
      try {
        await fetchHello();
        setApiStatus('success');
      } catch {
        setApiStatus('error');
      }
    })();

    (async () => {
      try {
        await checkHealth();
        setDbStatus('success');
      } catch {
        setDbStatus('error');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          État des services
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte API */}
          <div className="p-6 bg-white rounded-xl shadow flex items-center">
            <div
              className={`p-3 rounded-full ${statusConfig[apiStatus].bg}`}
            >
              <span className="text-2xl">{statusConfig[apiStatus].icon}</span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700">API</h2>
              <p className={`mt-1 text-lg font-medium ${statusConfig[apiStatus].text}`}>
                {statusConfig[apiStatus].label}
              </p>
            </div>
          </div>

          {/* Carte Base de données */}
          <div className="p-6 bg-white rounded-xl shadow flex items-center">
            <div
              className={`p-3 rounded-full ${statusConfig[dbStatus].bg}`}
            >
              <span className="text-2xl">{statusConfig[dbStatus].icon}</span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Base de données
              </h2>
              <p className={`mt-1 text-lg font-medium ${statusConfig[dbStatus].text}`}>
                {statusConfig[dbStatus].label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
