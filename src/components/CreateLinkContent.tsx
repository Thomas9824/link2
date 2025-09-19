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

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-100 transition-colors focus-within:border-violet-400">
    {children}
  </div>
);

export default function CreateLinkContent() {
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
      setError('Please enter a URL');
      return;
    }

    const formattedUrl = formatUrl(url.trim());

    if (!validateUrl(formattedUrl)) {
      setError('Invalid URL. Make sure it starts with http:// or https://');
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
        throw new Error(data.error || 'Error creating link');
      }

      setResult(data.data);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        console.error('Copy error:', err);
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-[200] text-gray-800 mb-4 leading-tight">
            Create a <span style={{ fontFamily: 'OffBit, monospace' }}>short link</span>
          </h1>
          <p className="text-xl text-gray-600 font-[200] leading-tight">
            Transform your long URLs into short, shareable links
          </p>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-[200] text-gray-600 block mb-3">
                URL to shorten
              </label>
              <GlassInputWrapper>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/your-very-long-link"
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-gray-800 placeholder-gray-400 font-[200]"
                  disabled={loading}
                />
              </GlassInputWrapper>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg font-[200]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black text-white py-4 font-[200] hover:bg-gray-800 disabled:bg-gray-600 transition-colors"
            >
              {loading ? 'Creating link...' : 'Shorten link'}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-green-100 border border-green-300 rounded-2xl">
              <h3 className="text-lg font-[200] text-green-700 mb-4">
                Link created successfully!
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-[200] text-gray-600 mb-2">
                    Original link:
                  </label>
                  <p className="text-sm text-gray-700 break-all font-[200]">{result.originalUrl}</p>
                </div>

                <div>
                  <label className="block text-sm font-[200] text-gray-600 mb-2">
                    Short link:
                  </label>
                  <div className="flex items-center gap-3">
                    <GlassInputWrapper>
                      <input
                        type="text"
                        value={result.shortUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm p-3 rounded-2xl focus:outline-none text-gray-800 font-[200]"
                      />
                    </GlassInputWrapper>
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-sm font-[200] rounded-2xl transition-colors whitespace-nowrap"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-600 font-[200]">
                  Created on {new Date(result.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/app/dashboard"
            className="text-gray-800 text-2xl font-[200] transition-colors inline-block relative group"
            style={{ paddingBottom: '0.01rem' }}
          >
            <span className="inline-flex items-center">
              View all my links<svg className="inline w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </span>
            <span className="absolute left-0 bottom-0 w-0 h-px bg-gray-800 transition-all duration-300 ease-out group-hover:w-full"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}