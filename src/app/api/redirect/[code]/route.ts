import { NextRequest, NextResponse } from 'next/server';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { extractClientIP } from '@/lib/geolocation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Rechercher le lien dans la base de données
    const linkData = await DatabaseLinksService.getLink(code);

    if (!linkData) {
      // Si le code n'existe pas, retourner une erreur 404
      return NextResponse.json(
        { error: 'Lien introuvable' },
        { status: 404 }
      );
    }

    // Collecter les données de clic
    const clickData = {
      userAgent: request.headers.get('user-agent') || undefined,
      referer: request.headers.get('referer') || undefined,
      ip: extractClientIP(request)
    };

    // Incrémenter le compteur de clics avec les données collectées (asynchrone)
    await DatabaseLinksService.incrementClicks(code, clickData);

    // Retourner l'URL de redirection
    return NextResponse.json({
      success: true,
      redirectUrl: linkData.originalUrl,
      clicks: linkData.clicks + 1 // +1 car on vient de l'incrémenter
    });

  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
