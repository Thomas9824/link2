import { NextRequest, NextResponse } from 'next/server';
import { DatabaseLinksService } from '@/lib/database-links-service';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Valider la période
    if (!['week', 'month', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Période invalide' },
        { status: 400 }
      );
    }

    const analytics = await DatabaseLinksService.getUserAnalyticsByPeriod(session.user.id, period as 'week' | 'month' | 'year');

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics par période:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}