"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Plus, Settings, User, BarChart, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/app/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Create Link",
      href: "/app/creation-link",
      icon: (
        <Plus className="text-neutral-700 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Analytics",
      href: "/app/dashboard",
      icon: (
        <BarChart className="text-neutral-700 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Rediriger si pas connecté
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/connexion');
      return;
    }
  }, [session, status, router]);

  // Mettre à jour le nom affiché quand la session change
  useEffect(() => {
    if (session?.user) {
      const displayName = session.user.name || session.user.email || "User";
      setUserDisplayName(displayName);
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Fallback: redirection manuelle
      window.location.href = '/';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
            <p className="text-gray-600 font-[200]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const Logo = () => {
    return (
      <Link
        href="/app/dashboard"
        className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium text-black whitespace-pre"
        >
          Link2
        </motion.span>
      </Link>
    );
  };

  const LogoIcon = () => {
    return (
      <Link
        href="/app/dashboard"
        className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 border border-neutral-200 overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col h-screen justify-between">
          <div className="flex flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 pb-4">
            <SidebarLink
              link={{
                label: userDisplayName,
                href: "#",
                icon: session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ) : (
                  <User className="text-neutral-700 h-7 w-7 flex-shrink-0" />
                ),
              }}
            />
            <div className="mt-2 px-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left text-red-600 hover:text-red-700 py-2 text-sm transition-colors group/sidebar hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-sm transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  Log out
                </motion.span>
              </button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}