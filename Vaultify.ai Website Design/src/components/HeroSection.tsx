import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-purple-950/20 to-black"></div>
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
          <span className="text-white/60 text-sm">Powered by Advanced AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl text-white mb-6 tracking-tight">
          The AI concierge that
          <br />
          unlocks the extraordinary
        </h1>
        
        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto">
          A Vaultfy membership gives you access to the world's finest restaurants, 
          unforgettable travel experiences, exclusive events, and luxury goods—all at your fingertips.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6">
            Apply for Membership
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6">
            For Business
          </Button>
        </div>
      </div>

      <button className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/60 transition-colors animate-bounce">
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
