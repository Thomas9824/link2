'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatUrl, validateUrl } from '@/lib/utils';

interface LinkResult {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: string;
}

export default function CreateLinkPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    const formattedUrl = formatUrl(url.trim());
    
    if (!validateUrl(formattedUrl)) {
      setError('URL invalide. Assurez-vous qu\'elle commence par http:// ou https://');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du lien');
      }

      setResult(data.data);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Raccourcir un lien
          </h1>
          <p className="text-lg text-gray-600">
            Transformez vos liens longs en liens courts et faciles à partager
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL à raccourcir
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com/mon-lien-tres-long"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Création en cours...' : 'Raccourcir le lien'}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Lien créé avec succès !
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien original :
                  </label>
                  <p className="text-sm text-gray-600 break-all">{result.originalUrl}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien raccourci :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={result.shortUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Créé le {new Date(result.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir tous mes liens →
          </Link>
        </div>
      </div>
    </div>
  );
}
