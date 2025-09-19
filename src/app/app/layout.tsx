"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Plus, Settings, LogOut, User, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/app/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Create Link",
      href: "/app/creation-link",
      icon: (
        <Plus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Analytics",
      href: "/app/dashboard",
      icon: (
        <BarChart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
            <p className="text-gray-400 font-[200]">Loading...</p>
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
        className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-violet-500 dark:bg-violet-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium text-black dark:text-white whitespace-pre"
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
        className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-violet-500 dark:bg-violet-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      </Link>
    );
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row bg-black w-full flex-1 min-h-screen border-neutral-200 dark:border-neutral-700 overflow-hidden"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session?.user?.name || "User",
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
                  <User className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
                ),
              }}
            />
            <div className="mt-2">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 w-full text-left text-red-400 hover:text-red-300 py-2 text-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className={open ? "inline" : "hidden"}>Log out</span>
              </button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 bg-black text-white overflow-auto">
        {children}
      </div>
    </div>
  );
}