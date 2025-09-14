import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllLinksStats } from '@/lib/analytics'
import StatsCard from '@/components/StatsCard'
import LinksList from '@/components/LinksList'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as any).id : undefined
  const stats = await getAllLinksStats(userId)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Analytics
              </h1>
              <p className="text-gray-600">
                Suivi des performances de vos liens raccourcis
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un nouveau lien
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total des liens"
            value={stats.totalLinks}
            icon="🔗"
            color="bg-blue-500"
          />
          <StatsCard
            title="Total des clics"
            value={stats.totalClicks}
            icon="👆"
            color="bg-green-500"
          />
          <StatsCard
            title="Clics moyens par lien"
            value={stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0}
            icon="📊"
            color="bg-purple-500"
          />
        </div>

        {/* Top Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Liens les plus populaires
            </h2>
          </div>
          <LinksList links={stats.topLinks} />
        </div>
      </div>
    </div>
  )
}