import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { extractClientIPFromHeaders } from '@/lib/geolocation';

interface RedirectPageProps {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;
  const headersList = await headers();

  console.log(`🔄 [REDIRECT] Tentative de redirection pour le code: ${code}`);

  try {
    // Rechercher le lien dans la base de données avec le service
    console.log(`🔍 [REDIRECT] Recherche du lien ${code} dans la base...`);
    const linkData = await DatabaseLinksService.getLink(code);

    if (!linkData) {
      console.log(`❌ [REDIRECT] Code ${code} non trouvé, redirection vers /`);
      redirect('/');
    }

    console.log(`📋 [REDIRECT] Données du lien:`, {
      id: linkData.id,
      originalUrl: linkData.originalUrl,
      shortCode: linkData.shortCode,
      isActive: linkData.isActive,
      expiresAt: linkData.expiresAt
    });

    // S'assurer que l'URL a un protocole
    let targetUrl = linkData.originalUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      console.log(`🔧 [REDIRECT] Protocole ajouté: ${targetUrl}`);
    }

    console.log(`✅ [REDIRECT] Redirection imminente vers: ${targetUrl}`);

    // Capturer les données de tracking
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;
    const ip = extractClientIPFromHeaders(headersList);

    // Enregistrer le clic de façon asynchrone (sans bloquer la redirection)
    DatabaseLinksService.incrementClicks(code, {
      userAgent,
      referer,
      ip
    }).then(() => {
      console.log(`📊 [REDIRECT] Clic enregistré pour ${code}`);
    }).catch((error) => {
      console.error('❌ [REDIRECT] Erreur lors de l\'enregistrement du clic:', error);
    });

    // Rediriger immédiatement vers l'URL cible
    console.log(`🚀 [REDIRECT] REDIRECTION MAINTENANT vers: ${targetUrl}`);
    redirect(targetUrl);
  } catch (error) {
    console.error('💥 [REDIRECT] Erreur critique lors de la redirection:', error);
    redirect('/');
  }
}

// Générer des métadonnées pour le SEO
export async function generateMetadata({ params }: RedirectPageProps) {
  const { code } = await params;

  try {
    const linkData = await DatabaseLinksService.getLink(code);

    if (!linkData) {
      return {
        title: 'Lien introuvable',
        description: 'Ce lien raccourci n\'existe pas ou a expiré.',
        robots: 'noindex, nofollow'
      };
    }

    return {
      title: linkData.title || 'Redirection en cours...',
      description: linkData.description || `Redirection vers ${linkData.originalUrl}`,
      robots: 'noindex, nofollow'
    };
  } catch {
    return {
      title: 'Redirection en cours...',
      description: `Redirection pour le code ${code}`,
      robots: 'noindex, nofollow'
    };
  }
}
