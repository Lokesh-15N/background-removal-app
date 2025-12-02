"use client"

import { BackgroundRemover } from "@/components/background-remover"
import { BackgroundChanger } from "@/components/background-changer"
import { Scene3D } from "@/components/scene-3d"

import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"remove" | "change">("remove")
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Scene3D />
      {/* Main content wrapper with padding for fixed navbar */}
          <header className="fixed top-0 left-0 w-full z-20 p-6 md:p-8 bg-transparent backdrop-blur-none border-b border-[#A3C9A8]/10">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="block text-3xl font-medium text-[#C7E8C5] text-center relative" style={{ letterSpacing: '-0.02em' }}>
                <span className="inline-block relative pb-2">
                  BG Remover
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-[#C7E8C5] rounded" />
                </span>
              </span>
            </div>
            {/* Navigation links removed as requested */}
            <div className="hidden md:flex items-center gap-8 text-muted-foreground"></div>
          </nav>
        </header>
        <div className="relative z-10 min-h-screen flex flex-col pt-28">

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">
              Snap. Zap. Done.
              <br />
              <span className="bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite]">
                No bg? No prob.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Upload. Chill. Get magic.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveTab("remove")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "remove"
                  ? "bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] text-[#23422a] shadow-lg"
                  : "border-2 border-[#A3C9A8]/30 text-[#A3C9A8] hover:border-[#A3C9A8]/60"
              }`}
            >
              Remove Background
            </button>
            <button
              onClick={() => setActiveTab("change")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "change"
                  ? "bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] text-[#23422a] shadow-lg"
                  : "border-2 border-[#A3C9A8]/30 text-[#A3C9A8] hover:border-[#A3C9A8]/60"
              }`}
            >
              Change Background
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "remove" ? <BackgroundRemover /> : <BackgroundChanger />}
        </div>

        {/* Footer removed as requested */}
      </div>
    </main>
  )
}
