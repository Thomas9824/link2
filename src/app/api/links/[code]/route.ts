import { NextRequest, NextResponse } from 'next/server';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { code } = await params;
    const linkData = await DatabaseLinksService.getLinkByUser(session.user.id, code);

    if (!linkData) {
      return NextResponse.json(
        { error: 'Lien introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: linkData.id,
        originalUrl: linkData.originalUrl,
        shortCode: linkData.shortCode,
        shortUrl: `${request.nextUrl.origin}/${linkData.shortCode}`,
        createdAt: linkData.createdAt,
        clicks: linkData.clicks,
        clickHistory: linkData.clickHistory || [],
        title: linkData.title,
        description: linkData.description,
        isActive: linkData.isActive
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du lien:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { code } = await params;
    
    const success = await DatabaseLinksService.deleteLink(session.user.id, code);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Lien introuvable ou vous n\'avez pas les permissions' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lien supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du lien:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
