import { redirect } from 'next/navigation';

interface RedirectPageProps {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;

  console.log(`🔄 Tentative de redirection pour le code: ${code}`);

  // Version temporaire sans base de données pour tester le déploiement
  if (code === 'test') {
    redirect('https://google.com');
  }

  // Si le code n'existe pas, rediriger vers la page d'accueil
  console.log(`❌ Code ${code} non trouvé, redirection vers la page d'accueil`);
  redirect('/');
}

// Générer des métadonnées pour le SEO
export async function generateMetadata({ params }: RedirectPageProps) {
  const { code } = await params;

  return {
    title: 'Redirection en cours...',
    description: `Redirection pour le code ${code}`,
    robots: 'noindex, nofollow'
  };
}
