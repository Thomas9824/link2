'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rediriger si pas connecté
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/connexion');
      return;
    }
  }, [session, status, router]);

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos liens...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Le useEffect redirige déjà
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Gérez tous vos liens raccourcis
            </p>
          </div>
          
          <Link
            href="/creation-link"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Créer un nouveau lien
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Analytics globales */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics globales</h2>
            
            {/* Statistiques principales */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total des liens</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalLinks}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total des clics</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.totalClicks}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pays actifs</h3>
                <p className="text-3xl font-bold text-purple-600">{analytics.topCountries.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pays principal</h3>
                <p className="text-lg font-semibold text-orange-600">
                  {analytics.topCountries.length > 0 ? analytics.topCountries[0].country : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.topCountries.length > 0 ? `${analytics.topCountries[0].clicks} clics` : ''}
                </p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Activité récente */}
              {analytics.recentActivity.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Activité des 7 derniers jours</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.recentActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top pays */}
              {analytics.topCountries.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Top des pays par clics</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.topCountries.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="clicks"
                      >
                        {analytics.topCountries.slice(0, 5).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Tableau détaillé des pays */}
            {analytics.topCountries.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg mt-6">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Détail par pays</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pays
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Liens concernés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pourcentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.topCountries.map((country, index) => (
                        <tr key={country.country} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2`} 
                                   style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-sm font-medium text-gray-900">
                                {country.country}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{country.clicks}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{country.links}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
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
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun lien créé
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier lien raccourci
            </p>
            <Link
              href="/creation-link"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Créer mon premier lien
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Mes liens ({links.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lien original
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lien court
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate block"
                            title={link.originalUrl}
                          >
                            {link.originalUrl}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {link.shortUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {link.clicks} clics
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(link.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/analytics/${link.shortCode}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Analytics"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteLink(link.shortCode)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
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
    </div>
  );
}
