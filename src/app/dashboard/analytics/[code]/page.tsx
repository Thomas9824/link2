'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  clickHistory: ClickEvent[];
}

interface ClickEvent {
  timestamp: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: string;
  browser?: string;
  ip?: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const CHART_COLORS = ['#B696E3', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'];

export default function AnalyticsPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLinkData = useCallback(async () => {
    try {
      const response = await fetch(`/api/links/${code}`);
      const data = await response.json();

      if (response.ok) {
        // S'assurer que clickHistory existe
        const linkData = data.data;
        if (!linkData.clickHistory) {
          linkData.clickHistory = [];
        }
        setLinkData(linkData);
      } else {
        setError(data.error || 'Lien introuvable');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchLinkData();
  }, [fetchLinkData]);

  const getClicksOverTime = () => {
    if (!linkData?.clickHistory || !Array.isArray(linkData.clickHistory)) return [];
    
    const clicksByDate: { [key: string]: number } = {};
    
    linkData.clickHistory.forEach(click => {
      const date = new Date(click.timestamp).toLocaleDateString('fr-FR');
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    return Object.entries(clicksByDate)
      .map(([date, clicks]) => ({ name: date, clics: clicks }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  };

  const getDeviceStats = (): ChartData[] => {
    if (!linkData?.clickHistory || !Array.isArray(linkData.clickHistory)) return [];
    
    const deviceCounts: { [key: string]: number } = {};
    
    linkData.clickHistory.forEach(click => {
      const device = click.device || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    return Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
  };

  const getBrowserStats = (): ChartData[] => {
    if (!linkData?.clickHistory || !Array.isArray(linkData.clickHistory)) return [];
    
    const browserCounts: { [key: string]: number } = {};
    
    linkData.clickHistory.forEach(click => {
      const browser = click.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    return Object.entries(browserCounts).map(([name, value]) => ({ name, value }));
  };

  const getRefererStats = (): ChartData[] => {
    if (!linkData?.clickHistory || !Array.isArray(linkData.clickHistory)) return [];

    const refererCounts: { [key: string]: number } = {};

    linkData.clickHistory.forEach(click => {
      let referer = 'Direct';
      if (click.referer) {
        try {
          const url = new URL(click.referer);
          referer = url.hostname;
        } catch {
          referer = 'Other';
        }
      }
      refererCounts[referer] = (refererCounts[referer] || 0) + 1;
    });

    return Object.entries(refererCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  };

  const getCountryStats = (): ChartData[] => {
    if (!linkData?.clickHistory || !Array.isArray(linkData.clickHistory)) return [];

    const countryCounts: { [key: string]: number } = {};

    linkData.clickHistory.forEach(click => {
      const country = click.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400 font-[200]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-[200] text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-6 font-[200]">{error}</p>
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white text-black py-4 px-8 font-[200] hover:bg-gray-100 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const clicksOverTime = getClicksOverTime();
  const deviceStats = getDeviceStats();
  const browserStats = getBrowserStats();
  const refererStats = getRefererStats();
  const countryStats = getCountryStats();

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/dashboard"
              className="text-violet-400 hover:text-violet-300 font-[200] mb-2 inline-block"
            >
              ← Back to dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-[200] text-white mb-4 leading-tight">
              Advanced <span style={{ fontFamily: 'OffBit, monospace' }}>Analytics</span>
            </h1>
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
              <p className="text-lg text-gray-300 mb-1 font-[200]">
                <strong>Short link:</strong> {linkData.shortUrl}
              </p>
              <p className="text-sm text-gray-400 break-all font-[200]">
                <strong>Original URL:</strong> {linkData.originalUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-[200] text-gray-400 mb-2">Total Clicks</h3>
            <p className="text-3xl font-[200] text-violet-400">{linkData.clicks}</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-[200] text-gray-400 mb-2">Created</h3>
            <p className="text-sm text-white font-[200]">
              {new Date(linkData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-[200] text-gray-400 mb-2">Last Click</h3>
            <p className="text-sm text-white font-[200]">
              {linkData.clickHistory && Array.isArray(linkData.clickHistory) && linkData.clickHistory.length > 0
                ? new Date(linkData.clickHistory[linkData.clickHistory.length - 1].timestamp).toLocaleDateString('en-US')
                : 'No clicks'
              }
            </p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-[200] text-gray-400 mb-2">Main Device</h3>
            <p className="text-sm text-white font-[200]">
              {deviceStats.length > 0
                ? deviceStats.sort((a, b) => b.value - a.value)[0].name
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="space-y-8">
          {/* Première ligne - Graphique principal */}
          {clicksOverTime.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
              <h3 className="text-xl font-[200] text-white mb-4">Clicks Over Time</h3>
              <div className="h-80">
                <LineChart
                  dataset={clicksOverTime}
                  xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                  series={[{ dataKey: 'clics', color: '#B696E3', label: 'Clicks', curve: 'catmullRom' }]}
                  width={undefined}
                  height={300}
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

          {/* Graphiques secondaires - LineCharts pleine largeur */}

          {/* Navigateurs */}
          {browserStats.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h3 className="text-xl font-[200] text-white mb-4">Browsers</h3>
              <div className="h-80">
                <LineChart
                  dataset={browserStats}
                  xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                  series={[{ dataKey: 'value', color: '#B696E3', label: 'Usage', curve: 'catmullRom' }]}
                  width={undefined}
                  height={300}
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

          {/* Sources de trafic */}
          {refererStats.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h3 className="text-xl font-[200] text-white mb-4">Traffic Sources</h3>
              <div className="h-80">
                <LineChart
                  dataset={refererStats}
                  xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                  series={[{ dataKey: 'value', color: '#B696E3', label: 'Clicks', curve: 'catmullRom' }]}
                  width={undefined}
                  height={300}
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

          {/* Graphiques en grille pour les PieCharts */}
          <div className="grid lg:grid-cols-2 gap-6">

          {/* Appareils */}
          {deviceStats.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
              <h3 className="text-xl font-[200] text-white mb-4">Device Breakdown</h3>
              <div className="h-80">
                <PieChart
                  series={[
                    {
                      data: deviceStats.map((item, index) => ({
                        id: index,
                        value: item.value,
                        label: item.name,
                        color: CHART_COLORS[index % CHART_COLORS.length]
                      })),
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  width={undefined}
                  height={300}
                  margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  sx={{
                    '& .MuiChartsLegend-series text': { fill: '#F9FAFB !important', fontSize: '12px' },
                    '& .MuiChartsTooltip-paper': { backgroundColor: '#1F2937', color: '#F9FAFB' },
                  }}
                />
              </div>
            </div>
          )}


          {/* Répartition par pays */}
          {countryStats.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm p-6">
              <h3 className="text-xl font-[200] text-white mb-4">Country Breakdown</h3>
              <div className="h-80">
                <PieChart
                  series={[
                    {
                      data: countryStats.slice(0, 8).map((item, index) => ({
                        id: index,
                        value: item.value,
                        label: item.name,
                        color: CHART_COLORS[index % CHART_COLORS.length]
                      })),
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  width={undefined}
                  height={300}
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

        {/* Historique détaillé */}
        {linkData.clickHistory && Array.isArray(linkData.clickHistory) && linkData.clickHistory.length > 0 && (
          <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm mt-8">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-[200] text-white">Click History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-400 uppercase tracking-wider">
                      Browser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-[200] text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(linkData.clickHistory || []).slice().reverse().slice(0, 50).map((click, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-[200]">
                        {new Date(click.timestamp).toLocaleString('en-US')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-[200]">
                        {click.device || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-[200]">
                        {click.browser || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-[200]">
                        {click.referer ? new URL(click.referer).hostname : 'Direct'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-[200]">
                        {click.country || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {linkData.clickHistory && linkData.clickHistory.length > 50 && (
                <div className="px-6 py-4 text-center text-sm text-gray-400 font-[200]">
                  Showing last 50 clicks out of {linkData.clickHistory.length} total
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
