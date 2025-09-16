import { NextResponse } from 'next/server';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { auth } from '@/auth';

// Les interfaces sont maintenant utilisées dans le service

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    // Utiliser la nouvelle méthode du service de base de données
    const analytics = await DatabaseLinksService.getGlobalAnalytics();

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics globales:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
