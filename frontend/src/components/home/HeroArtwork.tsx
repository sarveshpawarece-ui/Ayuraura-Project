"use client";

export default function HeroArtwork() {
  return (
    <div className="relative w-full max-w-[640px] lg:max-w-[700px] xl:max-w-[740px] flex items-center justify-center">
      {/* Ambient Golden Glowing Halo & Sunburst Aura behind the 3D illustration */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] bg-gradient-to-tr from-[#c08238]/30 via-[#f0c379]/25 to-transparent rounded-full blur-[70px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] bg-[#225e3d]/20 rounded-full blur-[50px] pointer-events-none" />

      {/* Floating Botanical Leaf Accents */}
      <div className="absolute -top-2 left-6 text-emerald-800/35 text-2xl animate-float select-none pointer-events-none hidden sm:block">
        🍃
      </div>
      <div className="absolute top-12 -right-1 text-emerald-700/25 text-xl animate-float select-none pointer-events-none hidden sm:block" style={{ animationDelay: "1.5s" }}>
        🌿
      </div>
      <div className="absolute bottom-12 left-6 text-amber-700/30 text-lg animate-float select-none pointer-events-none hidden sm:block" style={{ animationDelay: "2.8s" }}>
        🍂
      </div>

      {/* 3D Masterpiece Hero Artwork */}
      <div className="relative z-10 w-full transition-transform duration-700 hover:scale-[1.015] flex justify-center items-center">
        <img
          src="/ayursetu-hero.png"
          alt="AyurSetu 3D Ayurvedic Ecosystem Artwork"
          className="w-full max-h-[500px] sm:max-h-[540px] lg:max-h-[580px] xl:max-h-[620px] object-contain drop-shadow-[0_25px_50px_rgba(20,51,34,0.16)]"
          loading="eager"
        />
      </div>
    </div>
  );
}

