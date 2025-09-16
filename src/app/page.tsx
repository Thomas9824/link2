import Link from "next/link";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Raccourcisseur de liens
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transformez vos liens longs en liens courts, élégants et faciles à partager. 
            Suivez les statistiques de clics en temps réel.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/creation-link"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
            >
              Créer un lien court
            </Link>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-8 rounded-lg border-2 border-blue-600 transition-colors text-lg"
            >
              Voir mes liens
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Raccourcissement rapide</h3>
            <p className="text-gray-600">
              Créez des liens courts en quelques secondes. Simple et efficace.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Statistiques détaillées</h3>
            <p className="text-gray-600">
              Suivez le nombre de clics et l&apos;engagement de vos liens.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sécurisé et fiable</h3>
            <p className="text-gray-600">
              Vos liens sont protégés et disponibles 24h/24, 7j/7.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-gray-500">
        <p>&copy; 2024 Raccourcisseur de liens. Créé avec Next.js</p>
      </footer>
    </div>
  );
}
