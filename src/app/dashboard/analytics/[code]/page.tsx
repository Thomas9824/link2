'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

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
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Retour au dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
            >
              ← Retour au dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics avancées
            </h1>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-lg text-gray-600 mb-1">
                <strong>Lien court :</strong> {linkData.shortUrl}
              </p>
              <p className="text-sm text-gray-500 break-all">
                <strong>URL originale :</strong> {linkData.originalUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total des clics</h3>
            <p className="text-3xl font-bold text-blue-600">{linkData.clicks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Créé le</h3>
            <p className="text-sm text-gray-600">
              {new Date(linkData.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dernier clic</h3>
            <p className="text-sm text-gray-600">
              {linkData.clickHistory && Array.isArray(linkData.clickHistory) && linkData.clickHistory.length > 0 
                ? new Date(linkData.clickHistory[linkData.clickHistory.length - 1].timestamp).toLocaleDateString('fr-FR')
                : 'Aucun clic'
              }
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Appareil principal</h3>
            <p className="text-sm text-gray-600">
              {deviceStats.length > 0 
                ? deviceStats.sort((a, b) => b.value - a.value)[0].name
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Clics dans le temps */}
          {clicksOverTime.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Clics dans le temps</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clics" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Appareils */}
          {deviceStats.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Répartition par appareil</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceStats.map(item => ({ name: item.name, value: item.value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceStats.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Navigateurs */}
          {browserStats.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Navigateurs</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browserStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sources de trafic */}
          {refererStats.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sources de trafic</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={refererStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Répartition par pays */}
          {countryStats.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Répartition par pays</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryStats.map(item => ({ name: item.name, value: item.value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {countryStats.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Historique détaillé */}
        {linkData.clickHistory && Array.isArray(linkData.clickHistory) && linkData.clickHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mt-8">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Historique des clics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date et heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appareil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Navigateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pays
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(linkData.clickHistory || []).slice().reverse().slice(0, 50).map((click, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(click.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {click.device || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {click.browser || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {click.referer ? new URL(click.referer).hostname : 'Direct'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {click.country || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {linkData.clickHistory && linkData.clickHistory.length > 50 && (
                <div className="px-6 py-4 text-center text-sm text-gray-500">
                  Affichage des 50 derniers clics sur {linkData.clickHistory.length} au total
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
