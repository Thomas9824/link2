import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PersistentLinksService } from '@/lib/persistent-links-service';
import { extractClientIPFromHeaders } from '@/lib/geolocation';

interface RedirectPageProps {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;
  const headersList = await headers();

  console.log(`🔄 Tentative de redirection pour le code: ${code}`);
  PersistentLinksService.debug();

  // Rechercher le lien dans la base de données
  const linkData = PersistentLinksService.getLink(code);

  if (!linkData) {
    console.log(`❌ Code ${code} non trouvé, redirection vers la page d'accueil`);
    // Si le code n'existe pas, rediriger vers la page d'accueil
    redirect('/');
  }

  console.log(`✅ Code ${code} trouvé, redirection vers: ${linkData.originalUrl}`);

  // Capturer les données de tracking
  const userAgent = headersList.get('user-agent') || undefined;
  const referer = headersList.get('referer') || undefined;
  const ip = extractClientIPFromHeaders(headersList);

  // Incrémenter le compteur de clics avec les données de tracking incluant l'IP (asynchrone)
  await PersistentLinksService.incrementClicks(code, {
    userAgent,
    referer,
    ip
  });

  // Rediriger vers l'URL originale
  redirect(linkData.originalUrl);
}

// Générer des métadonnées pour le SEO
export async function generateMetadata({ params }: RedirectPageProps) {
  const { code } = await params;
  const linkData = PersistentLinksService.getLink(code);
  
  if (!linkData) {
    return {
      title: 'Lien introuvable',
      description: 'Ce lien raccourci n\'existe pas ou a expiré.'
    };
  }
  
  return {
    title: 'Redirection en cours...',
    description: `Redirection vers ${linkData.originalUrl}`,
    robots: 'noindex, nofollow'
  };
}
