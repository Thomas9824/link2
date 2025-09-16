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

  console.log(`🔄 Tentative de redirection pour le code: ${code}`);

  try {
    // Rechercher le lien dans la base de données avec le service
    const linkData = await DatabaseLinksService.getLink(code);

    console.log(`📊 Résultat de la recherche:`, linkData ? 'Trouvé' : 'Non trouvé');

    if (!linkData) {
      console.log(`❌ Code ${code} non trouvé dans la base de données`);
      redirect('/');
    }

    // S'assurer que l'URL a un protocole
    let targetUrl = linkData.originalUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    console.log(`✅ Code ${code} trouvé, redirection vers: ${targetUrl}`);

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
      console.log(`📊 Clic enregistré pour ${code}`);
    }).catch((error) => {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    });

    // Rediriger immédiatement vers l'URL cible
    redirect(targetUrl);
  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
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
