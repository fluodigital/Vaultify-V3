import { Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import { VaultfyLogo } from './VaultfyLogo';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 blur-lg opacity-60" style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}></div>
                <VaultfyLogo size={32} className="relative" />
              </div>
              <span className="text-white text-xl">Vaultfy</span>
            </div>
            <p className="text-white/60 text-sm">
              Luxury that listens. Intelligence that acts.
            </p>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-white/60 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#security" className="text-white/60 hover:text-white transition-colors text-sm">Security</a></li>
              <li><a href="#enterprise" className="text-white/60 hover:text-white transition-colors text-sm">Enterprise</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-white/60 hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="#careers" className="text-white/60 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#press" className="text-white/60 hover:text-white transition-colors text-sm">Press</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#terms" className="text-white/60 hover:text-white transition-colors text-sm">Terms</a></li>
              <li><a href="#privacy" className="text-white/60 hover:text-white transition-colors text-sm">Privacy</a></li>
              <li><a href="#security" className="text-white/60 hover:text-white transition-colors text-sm">Security</a></li>
              <li><a href="#cookies" className="text-white/60 hover:text-white transition-colors text-sm">Cookie Preferences</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm mb-4 md:mb-0">
            © 2025 Vaultfy Inc. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
