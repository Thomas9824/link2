import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen relative">
      {/* Carrés blancs dans les coins */}
      <div className="absolute top-4 left-4 w-4 h-4 bg-white"></div>
      <div className="absolute top-4 right-4 w-4 h-4 bg-white"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-white"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 bg-white"></div>

      {/* Zone haute */}
      <div className="h-1/2 relative">
        {/* Partie gauche noire */}
        <div className="absolute left-0 top-0 w-1/2 h-full bg-black"></div>
        {/* Partie droite noire aussi */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-black"></div>

        {/* Logo centré entre les deux zones */}
        <div className="absolute left-8 bottom-0 transform translate-y-1/2">
          <h1 className="text-[10rem] font-thin text-white leading-none tracking-wide">
            link2
          </h1>
        </div>
      </div>

      {/* Zone basse */}
      <div className="h-1/2 relative">
        {/* Partie gauche grise */}
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gray-300"></div>
        {/* Partie droite noire */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-black"></div>

        {/* Contenu dans la partie droite noire */}
        <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center">
          <div className="text-center max-w-lg px-8">
            <h2 className="text-4xl font-normal text-white mb-4 leading-tight">
              Manage, track & analyze<br />
              traffic on your links.
            </h2>

            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Import your links, shorten them, and analyze the traffic.
            </p>

            {/* Ligne horizontale */}
            <div className="w-full h-px bg-gray-500 mb-8"></div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/creation-link"
                className="text-black font-medium py-3 px-6 transition-colors"
                style={{ backgroundColor: '#A6FF00' }}
              >
                create a link
              </Link>
              <Link
                href="/connexion"
                className="text-black font-medium py-3 px-6 transition-colors"
                style={{ backgroundColor: '#F1ADC2' }}
              >
                login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
