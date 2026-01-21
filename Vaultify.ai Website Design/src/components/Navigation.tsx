import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { VaultfyLogo } from './VaultfyLogo';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VaultfyLogo size={32} />
          <span className="text-white text-xl tracking-wider">Vaultfy</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-white/80 hover:text-white transition-colors">
            Home
          </a>
          <a href="#about" className="text-white/80 hover:text-white transition-colors">
            About Us
          </a>
          <a href="#membership" className="text-white/80 hover:text-white transition-colors">
            Membership
          </a>
          <a href="#contact" className="text-white/80 hover:text-white transition-colors">
            Contact
          </a>
          <a href="#business" className="text-white/80 hover:text-white transition-colors">
            For Business
          </a>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            Apply for Membership
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <div className="flex flex-col gap-4 px-6 py-4">
            <a href="#home" className="text-white/80 hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors">
              About Us
            </a>
            <a href="#membership" className="text-white/80 hover:text-white transition-colors">
              Membership
            </a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors">
              Contact
            </a>
            <a href="#business" className="text-white/80 hover:text-white transition-colors">
              For Business
            </a>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full">
              Apply for Membership
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
