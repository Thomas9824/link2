import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { getLink } from '@/lib/links'
import { recordClick } from '@/lib/analytics'

interface Props {
  params: Promise<{ code: string }>
}

export default async function RedirectPage({ params }: Props) {
  const { code } = await params
  const headersList = await headers()
  const cookieStore = await cookies()

  const link = await getLink(code)

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Lien introuvable</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  // Vérifier le consentement analytics depuis les cookies
  let analyticsConsent = true // Par défaut accepté pour la rétrocompatibilité

  const consentCookie = cookieStore.get('cookieConsent')
  if (consentCookie) {
    try {
      const consent = JSON.parse(consentCookie.value)
      analyticsConsent = consent.analytics === true
    } catch (error) {
      console.error('Error parsing consent cookie:', error)
    }
  }

  // Enregistrer le clic de manière asynchrone avec respect du consentement
  try {
    await recordClick(code, {
      userAgent: headersList.get('user-agent') || undefined,
      referer: headersList.get('referer') || undefined,
      ip: headersList.get('x-forwarded-for') ||
          headersList.get('x-real-ip') ||
          'unknown'
    }, analyticsConsent)
  } catch (error) {
    // Log l'erreur mais ne bloque pas la redirection
    console.error('Failed to record click:', error)
  }

  redirect(link.originalUrl)
}