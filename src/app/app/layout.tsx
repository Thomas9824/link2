"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Plus, Settings, User, BarChart } from "lucide-react";
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
    <div className={cn(
      "flex flex-col md:flex-row bg-gray-100 w-full flex-1 min-h-screen border border-neutral-200 overflow-hidden"
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
                  <User className="text-neutral-700 h-7 w-7 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 bg-white text-gray-800 overflow-auto p-2 md:p-10 rounded-tl-2xl border border-neutral-200">
        {children}
      </div>
    </div>
  );
}