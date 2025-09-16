'use client'

import { useState, useEffect } from 'react'

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent')
    if (consent) {
      setAnalyticsConsent(JSON.parse(consent).analytics)
    } else {
      setShowBanner(true)
    }
  }, [])

  const setCookieConsent = (consent: { analytics: boolean; timestamp: number }) => {
    // Sauvegarder dans localStorage pour le client
    localStorage.setItem('cookieConsent', JSON.stringify(consent))

    // Sauvegarder dans les cookies pour le serveur
    document.cookie = `cookieConsent=${JSON.stringify(consent)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
  }

  const handleAcceptAll = () => {
    const consent = {
      analytics: true,
      timestamp: Date.now()
    }
    setCookieConsent(consent)
    setAnalyticsConsent(true)
    setShowBanner(false)
  }

  const handleRejectAnalytics = () => {
    const consent = {
      analytics: false,
      timestamp: Date.now()
    }
    setCookieConsent(consent)
    setAnalyticsConsent(false)
    setShowBanner(false)
  }

  const handleCustomize = () => {
    // Pour l'instant, simple toggle
    const newConsent = !analyticsConsent
    const consent = {
      analytics: newConsent,
      timestamp: Date.now()
    }
    setCookieConsent(consent)
    setAnalyticsConsent(newConsent)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestion des cookies 🍪
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de notre service.
              Les cookies techniques sont nécessaires au fonctionnement du site et sont toujours activés.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Cookies d'analytics :</strong> Nous collectons des données anonymisées sur les clics
              (pays, type d'appareil, navigateur) pour améliorer notre service. Votre IP est hachée pour
              préserver votre confidentialité.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <button
              onClick={handleRejectAnalytics}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refuser analytics
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tout accepter
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Conformité RGPD • Données anonymisées après 30 jours
            </span>
            <button
              onClick={handleCustomize}
              className="underline hover:text-gray-700"
            >
              Personnaliser les paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook pour vérifier le consentement
export function useAnalyticsConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (consent) {
      const parsed = JSON.parse(consent)
      setHasConsent(parsed.analytics === true)
    }
  }, [])

  return hasConsent
}