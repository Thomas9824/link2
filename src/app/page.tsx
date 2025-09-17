"use client";

import Link from "next/link";
import { Dithering } from "@paper-design/shaders-react";

export default function Home() {
  return (
    <div className="h-screen relative">
      {/* Logo en haut à gauche */}
      <div className="absolute top-4 left-4 z-20">
        <h1 className="text-white leading-none tracking-wide">
          <span className="text-6xl" style={{ fontFamily: 'OffBit, monospace' }}>link</span><span className="font-sans font-[300] text-1xl">®</span>
        </h1>
      </div>

      {/* Carrés blancs dans les coins */}
      <div className="absolute top-4 right-4 w-4 h-4 bg-white z-10"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-white z-10"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 bg-white z-10"></div>

      {/* Zone haute noire */}
      <div className="h-1/2 bg-black relative">

        {/* Contenu à droite dans la partie noire */}
        <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-right">
          <div className="text-left max-w-lg">
            <h2 className="text-5xl font-[200] text-white mb-4 leading-tight">
              <span className="whitespace-nowrap">Manage, track & analyze</span><br />
              traffic on your links.
            </h2>

            <p className="text-2xl text-gray-400 mb-4 font-[200] leading-tight">
              Import your links, shorten them, and analyze the traffic.
            </p>


            <div className="w-full h-px justify-right bg-gray-500 mb-4"></div>
 
            <div className="flex gap-4 justify-right">
              <Link
                href="/creation-link"
                className="text-white text-2xl font-[200] transition-colors inline-block relative group"
                style={{ paddingBottom: '0.01rem' }}
              >
                <span className="inline-flex items-center">
                  create a link<svg className="inline w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-px bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href="/connexion"
                className="text-white text-2xl font-[200] transition-colors inline-block relative group"
                style={{ paddingBottom: '0.01rem' }}
              >
                <span className="inline-flex items-center">
                  login<svg className="inline w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-px bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Zone basse grise avec dithering ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"]*/}
      <div className="h-1/2 relative">
        <Dithering
          style={{ height: "100%", width: "100%" }}
          colorBack="#342C40"
          colorFront="#B696E3"
          shape="simplex"
          type="4x4"
          pxSize={4}
          offsetX={0}
          offsetY={0}
          scale={0.8}
          rotation={0}
          speed={0.3}
        />
      </div>
    </div>
  );
}
