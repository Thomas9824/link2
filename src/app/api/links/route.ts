import { NextRequest, NextResponse } from 'next/server';
import { generateShortCode, validateUrl } from '@/lib/utils';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const { url, customAlias, title, description } = await request.json();
    
    // Validation de l'URL
    if (!url || !validateUrl(url)) {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Génération d'un code court unique ou utilisation de l'alias personnalisé
    let shortCode: string;
    if (customAlias) {
      // Vérifier si l'alias est disponible
      const exists = await DatabaseLinksService.linkExists(customAlias);
      if (exists) {
        return NextResponse.json(
          { error: 'Cet alias est déjà utilisé' },
          { status: 400 }
        );
      }
      shortCode = customAlias;
    } else {
      do {
        shortCode = generateShortCode();
      } while (await DatabaseLinksService.linkExists(shortCode));
    }

    // Création du lien
    const linkData = await DatabaseLinksService.createLink(session.user.id, {
      originalUrl: url,
      shortCode,
      customAlias,
      title,
      description
    });

    return NextResponse.json({
      success: true,
      data: {
        id: linkData.id,
        originalUrl: linkData.originalUrl,
        shortUrl: `${request.nextUrl.origin}/${shortCode}`,
        shortCode: linkData.shortCode,
        createdAt: linkData.createdAt,
        title: linkData.title,
        description: linkData.description
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du lien:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer tous les liens de l'utilisateur
    const links = await DatabaseLinksService.getUserLinks(session.user.id);
    
    const formattedLinks = links.map(link => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${link.shortCode}`,
      createdAt: link.createdAt,
      clicks: link.clicks,
      title: link.title,
      description: link.description,
      isActive: link.isActive
    }));

    return NextResponse.json({
      success: true,
      data: formattedLinks
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des liens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
