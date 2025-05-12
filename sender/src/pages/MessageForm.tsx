import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { createMessage } from '../services/api'; // adapte le chemin si nécessaire

interface FormState {
  pseudo: string;
  contenu: string;
}

type Status = {
  type: 'success' | 'error';
  message: string;
} | null;

const MessageForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({ pseudo: '', contenu: '' });
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pseudo.trim() || !form.contenu.trim()) {
      setStatus({ type: 'error', message: 'Tous les champs sont requis.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await createMessage({ pseudo: form.pseudo, contenu: form.contenu });
      setStatus({ type: 'success', message: 'Message envoyé avec succès ! 🎉' });
      setForm({ pseudo: '', contenu: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: "Impossible d'envoyer le message." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <Link to="/" className="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
        <Home size={32} />
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-extrabold text-gray-800 text-center">
          📬 Poster un message
        </h2>

        {status && (
          <div
            className={`flex items-center p-4 rounded-md ${
              status.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <span className="mr-2 text-xl">
              {status.type === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        <div>
          <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">
            Pseudo
          </label>
          <input
            id="pseudo"
            name="pseudo"
            type="text"
            value={form.pseudo}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                       focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="contenu" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="contenu"
            name="contenu"
            rows={4}
            value={form.contenu}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                       focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center py-3 font-semibold rounded-md shadow
            ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
            text-white transition`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
          )}
          {loading ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  );
};

export default MessageForm;
