"use client";
 
import { SunIcon as Sunburst } from "lucide-react";
import { useState } from "react";
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 6;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setError('');
 
    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    if (valid) {
      setLoading(true);
      
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Email ou mot de passe incorrect');
        } else {
          // Vérifier que la session est bien créée
          const session = await getSession();
          if (session) {
            router.push('/dashboard');
            router.refresh();
          }
        }
      } catch {
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }
 
  return (
    <div className="min-h-screen  flex items-center justify-center overflow-hidden p-4l">
      <div className=" w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl">
        <div className="flex absolute z-2  overflow-hidden backdrop-blur-2xl ">
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30]  opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>
 
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-3xl  overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
            Votre plateforme de raccourcissement de liens moderne et performante.
          </h1>
        </div>
 
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary z-99 text-secondary-foreground ">
          <div className="flex flex-col items-left mb-8">
            <div className="text-orange-500 mb-4">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              Connexion
            </h2>
            <p className="text-left opacity-80">
              Bienvenue sur Link2 — Connectez-vous
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
 
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Votre email
              </label>
              <input
                type="email"
                id="email"
                placeholder="hi@link2.com"
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-orange-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>
 
            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                Votre mot de passe
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-orange-500 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary text-gray-500">Ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
            </div>
 
            <div className="text-center text-gray-600 text-sm">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="text-secondary-foreground font-medium underline">
                Créer un compte
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
