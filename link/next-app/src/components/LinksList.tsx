'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LinkData {
  id: string
  shortCode: string
  originalUrl: string
  clickCount: number
  createdAt: Date
}

interface LinksListProps {
  links: LinkData[]
}

export default function LinksList({ links }: LinksListProps) {
  const [deletingLinks, setDeletingLinks] = useState<Set<string>>(new Set())
  const router = useRouter()

  const handleDeleteLink = async (linkId: string, shortCode: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le lien /${shortCode} ?`)) {
      return
    }

    setDeletingLinks(prev => new Set([...prev, linkId]))

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Erreur lors de la suppression: ${error.error}`)
      }
    } catch (error) {
      alert('Une erreur est survenue lors de la suppression')
    } finally {
      setDeletingLinks(prev => {
        const newSet = new Set(prev)
        newSet.delete(linkId)
        return newSet
      })
    }
  }
  if (links.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Aucun lien créé pour le moment
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {links.map((link) => (
        <div key={link.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {link.clickCount}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      /{link.shortCode}
                    </code>
                    <span className="text-xs text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {link.originalUrl}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {link.clickCount} {link.clickCount === 1 ? 'clic' : 'clics'}
              </span>
              <Link
                href={`/dashboard/${link.shortCode}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Détails →
              </Link>
              <button
                onClick={() => handleDeleteLink(link.id, link.shortCode)}
                disabled={deletingLinks.has(link.id)}
                className="text-red-600 hover:text-red-800 disabled:text-red-400 text-sm font-medium px-2 py-1 rounded transition-colors"
                title="Supprimer ce lien"
              >
                {deletingLinks.has(link.id) ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}