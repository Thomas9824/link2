import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { extractClientIPFromHeaders } from '@/lib/geolocation';

interface RedirectPageProps {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;
  const headersList = await headers();

  console.log(`🔄 Tentative de redirection pour le code: ${code}`);

  try {
    // Rechercher le lien dans la base de données
    const linkData = await prisma.link.findUnique({
      where: { shortCode: code, isActive: true },
      select: {
        id: true,
        originalUrl: true,
        expiresAt: true
      }
    });

    if (!linkData) {
      console.log(`❌ Code ${code} non trouvé, redirection vers la page d'accueil`);
      redirect('/');
    }

    // Vérifier si le lien a expiré
    if (linkData.expiresAt && linkData.expiresAt < new Date()) {
      console.log(`❌ Code ${code} a expiré, redirection vers la page d'accueil`);
      redirect('/');
    }

    console.log(`✅ Code ${code} trouvé, redirection vers: ${linkData.originalUrl}`);

    // Capturer les données de tracking en parallèle
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;
    const ip = extractClientIPFromHeaders(headersList);

    // Incrémenter le compteur de clics avec les données de tracking (asynchrone, sans attendre)
    prisma.click.create({
      data: {
        linkId: linkData.id,
        ipAddress: ip,
        userAgent,
        referer
      }
    }).catch(console.error); // Log l'erreur mais ne bloque pas la redirection

    // Rediriger vers l'URL originale
    redirect(linkData.originalUrl);
  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    redirect('/');
  }
}

// Générer des métadonnées pour le SEO
export async function generateMetadata({ params }: RedirectPageProps) {
  const { code } = await params;

  try {
    const linkData = await prisma.link.findUnique({
      where: { shortCode: code, isActive: true },
      select: { originalUrl: true, title: true, description: true }
    });

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
