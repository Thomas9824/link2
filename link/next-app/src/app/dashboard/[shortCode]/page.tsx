import Link from 'next/link'
import { getClickStats } from '@/lib/analytics'
import { notFound } from 'next/navigation'
import StatsCard from '@/components/StatsCard'

interface Props {
  params: Promise<{ shortCode: string }>
}

export default async function LinkDashboard({ params }: Props) {
  const { shortCode } = await params

  const stats = await getClickStats(shortCode)

  if (!stats) {
    notFound()
  }

  const { link, recentClicks, dailyStats, topReferers } = stats

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Statistiques du lien
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <code className="bg-gray-200 px-2 py-1 rounded font-mono">
                  /{shortCode}
                </code>
                <span>→</span>
                <a
                  href={link.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 truncate max-w-md"
                >
                  {link.originalUrl}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total des clics"
            value={link.clickCount}
            icon="👆"
            color="bg-blue-500"
          />
          <StatsCard
            title="Clics aujourd&apos;hui"
            value={dailyStats[new Date().toISOString().split('T')[0]] || 0}
            icon="📅"
            color="bg-green-500"
          />
          <StatsCard
            title="Sources de trafic"
            value={topReferers.length}
            icon="🌐"
            color="bg-purple-500"
          />
          <StatsCard
            title="Jours actifs"
            value={Object.keys(dailyStats).length}
            icon="📊"
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Clicks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Clics récents
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentClicks.length > 0 ? (
                recentClicks.map((click, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(click.timestamp).toLocaleString()}
                        </p>
                        {click.referer && (
                          <p className="text-xs text-gray-500 mt-1">
                            Depuis: {click.referer}
                          </p>
                        )}
                        {click.userAgent && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {click.userAgent.slice(0, 80)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucun clic enregistré
                </div>
              )}
            </div>
          </div>

          {/* Top Referers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Sources principales
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {topReferers.length > 0 ? (
                topReferers.map((referer, index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {referer.referer || 'Accès direct'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {referer.count} {referer.count === 1 ? 'clic' : 'clics'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucune source de trafic
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Stats */}
        {Object.keys(dailyStats).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Clics par jour (7 derniers jours)
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {Object.entries(dailyStats).map(([date, count]) => (
                  <div key={date} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="bg-blue-100 rounded p-2">
                      <div className="text-lg font-bold text-blue-800">
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}