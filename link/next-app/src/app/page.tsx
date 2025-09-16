'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import UrlShortener from '@/components/UrlShortener'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            {status === 'loading' ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-full shadow-sm"
                >
                  📊 Dashboard ({session.user?.email})
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-600 hover:text-red-800 bg-white px-3 py-1 rounded-full shadow-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-full shadow-sm"
              >
                🔐 Se connecter
              </Link>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Raccourcisseur d&apos;URL
          </h1>
          <p className="text-lg text-gray-600">
            Transformez vos liens longs en liens courts et faciles à partager
          </p>
        </div>

        <UrlShortener />
      </div>
    </div>
  )
}
