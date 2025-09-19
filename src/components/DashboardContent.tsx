'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';

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

const CHART_COLORS = ['#B696E3', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'];

export default function DashboardContent() {
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
      // Récupérer les liens et les analytics en parallèle
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
      // Vous pourriez ajouter une notification ici
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-[200]">Loading your links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-[200] text-gray-800 mb-4 leading-tight">
            <span style={{ fontFamily: 'OffBit, monospace' }}>Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 font-[200] leading-tight">
            Manage all your shortened links
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl mb-6 font-[200]">
            {error}
          </div>
        )}

        {/* Analytics utilisateur */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-3xl font-[200] text-gray-800 mb-6">My Analytics</h2>

            {/* Statistiques principales */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                <h3 className="text-lg font-[200] text-gray-600 mb-2">Total Links</h3>
                <p className="text-3xl font-[200] text-violet-600">{analytics.totalLinks}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                <h3 className="text-lg font-[200] text-gray-600 mb-2">Total Clicks</h3>
                <p className="text-3xl font-[200] text-violet-600">{analytics.totalClicks}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                <h3 className="text-lg font-[200] text-gray-600 mb-2">Active Countries</h3>
                <p className="text-3xl font-[200] text-violet-600">{analytics.topCountries.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                <h3 className="text-lg font-[200] text-gray-600 mb-2">Top Country</h3>
                <p className="text-lg font-[200] text-gray-800">
                  {analytics.topCountries.length > 0 ? analytics.topCountries[0].country : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 font-[200]">
                  {analytics.topCountries.length > 0 ? `${analytics.topCountries[0].clicks} clicks` : ''}
                </p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Activité récente */}
              {analytics.recentActivity.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                  <h3 className="text-xl font-[200] text-gray-800 mb-4">Last 7 days activity</h3>
                  <div className="h-64">
                    <LineChart
                      dataset={analytics.recentActivity}
                      xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                      series={[{ dataKey: 'clicks', color: '#B696E3', label: 'Clicks', curve: 'catmullRom' }]}
                      width={undefined}
                      height={250}
                      margin={{ left: 10, right: 10, top: 10, bottom: 40 }}
                      sx={{
                        '& .MuiChartsAxis-line': { stroke: '#374151' },
                        '& .MuiChartsAxis-tick': { stroke: '#374151' },
                        '& .MuiChartsAxis-tickLabel': { fill: '#9CA3AF', fontSize: '12px' },
                        '& .MuiChartsGrid-line': { stroke: '#374151', strokeDasharray: '3 3' },
                        '& .MuiChartsTooltip-paper': { backgroundColor: '#1F2937', color: '#F9FAFB' },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Top pays */}
              {analytics.topCountries.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
                  <h3 className="text-xl font-[200] text-gray-800 mb-4">Top countries by clicks</h3>
                  <div className="h-64">
                    <PieChart
                      series={[
                        {
                          data: analytics.topCountries.slice(0, 5).map((item, index) => ({
                            id: index,
                            value: item.clicks,
                            label: item.country,
                            color: CHART_COLORS[index % CHART_COLORS.length]
                          })),
                          highlightScope: { fade: 'global', highlight: 'item' },
                        },
                      ]}
                      width={undefined}
                      height={250}
                      margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      sx={{
                        '& .MuiChartsLegend-series text': { fill: '#F9FAFB !important', fontSize: '12px' },
                        '& .MuiChartsTooltip-paper': { backgroundColor: '#1F2937', color: '#F9FAFB' },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tableau détaillé des pays */}
            {analytics.topCountries.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-gray-100 mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-[200] text-gray-800">Details by country</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                          Affected Links
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.topCountries.map((country, index) => (
                        <tr key={country.country} className="hover:bg-gray-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2`}
                                   style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                              <span className="text-sm font-[200] text-gray-800">
                                {country.country}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-800 font-[200]">{country.clicks}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-[200]">{country.links}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-[200]">
                              {((country.clicks / analytics.totalClicks) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {links.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-[200] text-gray-800 mb-2">
              No links created
            </h3>
            <p className="text-gray-600 mb-6 font-[200]">
              Start by creating your first shortened link
            </p>
            <Link
              href="/app/creation-link"
              className="rounded-2xl bg-black text-white py-4 px-8 font-[200] hover:bg-gray-800 transition-colors"
            >
              Create my first link
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-[200] text-gray-800">
                My Links ({links.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                      Original Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                      Short Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 truncate block font-[200]"
                            title={link.originalUrl}
                          >
                            {link.originalUrl}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-300 px-2 py-1 rounded text-sm text-gray-800 font-[200]">
                            {link.shortUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Copy"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-[200] bg-violet-100 text-violet-600">
                          {link.clicks} clicks
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-[200]">
                        {new Date(link.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/analytics/${link.shortCode}`}
                            className="text-violet-600 hover:text-violet-700"
                            title="Analytics"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteLink(link.shortCode)}
                            className="text-red-600 hover:text-red-700"
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
          </div>
        )}
      </div>
    </div>
  );
}