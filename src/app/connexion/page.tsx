"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dithering } from "@paper-design/shaders-react";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
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
          setError('Incorrect email or password');
        } else {
          const session = await getSession();
          if (session) {
            router.push('/dashboard');
            router.refresh();
          }
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleResetPassword = () => {
    // TODO: Implement password reset functionality
    console.log('Password reset functionality to be implemented');
  }

  const handleCreateAccount = () => {
    router.push('/inscription');
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw] bg-black text-white relative">
      {/* Back arrow */}
      <div className="absolute top-4 left-4 z-20">
        <a href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 12H5m0 0l7 7m-7-7l7-7" />
          </svg>
        </a>
      </div>

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-[200] leading-tight">
              <span className="font-[200] text-white tracking-tighter">Welcome</span>
            </h1>
            <p className="animate-element animate-delay-200 text-gray-400 font-[200]">
              Access your account and continue your journey with us
            </p>

            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-[200] text-gray-400">Email Address</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                  />
                </GlassInputWrapper>
                {emailError && (
                  <p className="text-red-400 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-[200] text-gray-400">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!passwordError}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="custom-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-gray-300">Keep me signed in</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); handleResetPassword(); }} className="hover:underline text-white transition-colors">
                  Reset password
                </a>
              </div>

              <button type="submit" disabled={loading} className="animate-element animate-delay-600 w-full rounded-2xl bg-white text-black py-4 font-[200] hover:bg-gray-100 transition-colors">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-gray-700"></span>
              <span className="px-4 text-sm text-gray-400 bg-black absolute font-[200]">Or continue with</span>
            </div>

            <button onClick={handleGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-gray-700 rounded-2xl py-4 hover:bg-gray-900 transition-colors font-[200]">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-gray-400 font-[200]">
              New to our platform? <a href="#" onClick={(e) => { e.preventDefault(); handleCreateAccount(); }} className="text-white hover:underline transition-colors font-[200]">Create Account</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero with dithering effect */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-2xl overflow-hidden">
          <Dithering
            style={{ height: "100%", width: "100%" }}
            colorBack="#342C40"
            colorFront="#B696E3"
            shape="swirl"
            type="4x4"
            pxSize={4}
            offsetX={0}
            offsetY={0}
            scale={0.8}
            rotation={0}
            speed={0.3}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className= "text-center p-8" style={{ color: '#B696E3' }} >
            <h1 className="leading-none tracking-wide">
          <span className="text-9xl" style={{ fontFamily: 'OffBit, monospace' }}>link</span><span className="font-sans font-[300] text-2xl">®</span>
        </h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
