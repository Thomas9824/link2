import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Section gauche avec le logo */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-left">
          <h1 className="text-[12rem] font-thin text-white leading-none tracking-wider">
            link2
          </h1>
        </div>
      </div>

      {/* Section droite avec le contenu */}
      <div className="flex-1 flex items-center justify-center bg-gray-300 text-black">
        <div className="max-w-md text-center px-8">
          <h2 className="text-4xl font-light mb-4 leading-tight">
            Manage, track & analyze<br />
            traffic on your links.
          </h2>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Import your links, shorten them, and analyze the traffic.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/creation-link"
              className="bg-green-400 hover:bg-green-500 text-black font-medium py-3 px-6 rounded transition-colors"
            >
              create a link
            </Link>
            <Link
              href="/connexion"
              className="bg-purple-400 hover:bg-purple-500 text-black font-medium py-3 px-6 rounded transition-colors"
            >
              login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
