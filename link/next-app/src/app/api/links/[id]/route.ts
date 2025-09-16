import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const linkId = params.id

    // Vérifier que le lien existe et appartient à l'utilisateur
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    if (link.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own links' },
        { status: 403 }
      )
    }

    // Supprimer les clics associés puis le lien
    await prisma.$transaction(async (tx) => {
      // Supprimer tous les clics du lien
      await tx.click.deleteMany({
        where: { linkId }
      })

      // Supprimer le lien
      await tx.link.delete({
        where: { id: linkId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}