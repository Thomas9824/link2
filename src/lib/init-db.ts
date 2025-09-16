import { prisma } from './prisma';

export async function initializeDatabase() {
  try {
    // Créer un utilisateur anonyme s'il n'existe pas
    const existingUser = await prisma.user.findUnique({
      where: { id: 'anonymous-user' }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: 'anonymous-user',
          name: 'Utilisateur Anonyme',
          email: null, // Pas d'email pour l'utilisateur anonyme
          plan: 'FREE'
        }
      });
      console.log('✅ Utilisateur anonyme créé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
}

