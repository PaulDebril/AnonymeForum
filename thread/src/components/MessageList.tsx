import React, { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMessages } from '../services/api';

export interface Message {
  id: number;
  pseudo: string;
  contenu: string;
  date: string;
}

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les messages.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 py-12 px-4">
      <Link to={import.meta.env.VITE_SENDER_URL || "http://localhost:8080/"} className="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
        <Home size={32} />
      </Link>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          💬 Tous les Messages
        </h1>

        {loading && <p className="text-center text-gray-600">⏳ Chargement des messages...</p>}
        {error && <p className="text-center text-red-600 font-medium">❌ {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">{msg.pseudo}</h2>
                  <span className="text-sm text-gray-500">
                    {new Date(msg.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-700 mt-4">{msg.contenu}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
