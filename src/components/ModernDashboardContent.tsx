'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronDown, TrendingUp } from 'lucide-react';
import RotatingEarth from './RotatingEarth';

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
}

interface CountryStats {
  country: string;
  clicks: number;
  links: number;
}

interface GlobalAnalytics {
  totalClicks: number;
  totalLinks: number;
  topCountries: CountryStats[];
  recentActivity: {
    date: string;
    clicks: number;
  }[];
}

export default function ModernDashboardContent() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksResponse, analyticsResponse] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/analytics/global')
      ]);

      const linksData = await linksResponse.json();
      const analyticsData = await analyticsResponse.json();

      if (linksResponse.ok) {
        setLinks(linksData.data);
      } else {
        setError(linksData.error || 'Erreur lors du chargement des liens');
      }

      if (analyticsResponse.ok) {
        setAnalytics(analyticsData.data);
      }

    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (code: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(links.filter(link => link.shortCode !== code));
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur de connexion');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400 font-[200]">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto">

          {/* Total Clicks - Purple gradient card */}
          <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6">
            <div className="absolute top-4 right-4">
              <span className="bg-black/20 text-white text-xs px-2 py-1 rounded-full">
                +10%
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-white/80 text-sm font-medium">Total Clicks</h3>
              <p className="text-4xl font-bold text-white">
                {analytics?.totalClicks || 11203}
              </p>
            </div>
          </div>

          {/* Active Country */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium">Active Country</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <p className="text-3xl font-bold text-white">
                  {analytics?.topCountries?.length || 24}
                </p>
              </div>
            </div>
          </div>

          {/* Traffic Distribution - Globe */}
          <div className="bg-gray-800 rounded-2xl p-6 md:col-span-1 lg:row-span-2">
            <div className="space-y-4">
              <h3 className="text-white text-lg font-medium">Traffic Distribution</h3>
              <div className="h-80">
                <RotatingEarth
                  width={300}
                  height={300}
                  className="w-full h-full"
                  countryData={analytics?.topCountries || []}
                />
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-gray-800 rounded-2xl p-6 md:col-span-2 lg:row-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-medium">Analytics</h3>
              <div className="flex items-center gap-2 bg-black rounded-full px-3 py-1">
                <span className="text-white text-sm">last 7 days</span>
                <ChevronDown className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="h-48 bg-gray-900/50 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Chart Placeholder</span>
            </div>
          </div>

          {/* Details by country */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-2xl p-6">
            <h3 className="text-white text-lg font-medium mb-4">Details by country</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Country</span>
                <span className="text-gray-400">Clicks</span>
                <span className="text-gray-400">Percentage</span>
              </div>
              {analytics?.topCountries?.slice(0, 3).map((country, index) => (
                <div key={country.country} className="flex justify-between text-sm">
                  <span className="text-white">{country.country}</span>
                  <span className="text-white">{country.clicks}</span>
                  <span className="text-gray-300">
                    {((country.clicks / (analytics?.totalClicks || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">No data available</div>
              )}
            </div>
          </div>

        </div>

        {/* My Links Table */}
        <div className="mt-6">
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-white text-lg font-medium">My Links</h3>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {links.length}
              </span>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No links created
                </h3>
                <p className="text-gray-400 mb-6">
                  Start by creating your first shortened link
                </p>
                <Link
                  href="/app/creation-link"
                  className="rounded-2xl bg-purple-600 text-white py-3 px-6 hover:bg-purple-700 transition-colors"
                >
                  Create my first link
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-gray-400 text-sm font-medium">Original Link</th>
                      <th className="text-left py-3 text-gray-400 text-sm font-medium">Short link</th>
                      <th className="text-left py-3 text-gray-400 text-sm font-medium">Clicks</th>
                      <th className="text-left py-3 text-gray-400 text-sm font-medium">Created</th>
                      <th className="text-left py-3 text-gray-400 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {links.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-700/50">
                        <td className="py-4">
                          <div className="max-w-xs">
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 truncate block"
                              title={link.originalUrl}
                            >
                              {link.originalUrl}
                            </a>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-700 px-2 py-1 rounded text-sm text-white">
                              {link.shortUrl}
                            </code>
                            <button
                              onClick={() => copyToClipboard(link.shortUrl)}
                              className="text-gray-400 hover:text-gray-300"
                              title="Copy"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-purple-900/30 text-purple-400">
                            {link.clicks} clicks
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-400">
                          {new Date(link.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/analytics/${link.shortCode}`}
                              className="text-blue-400 hover:text-blue-300"
                              title="Analytics"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => deleteLink(link.shortCode)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}