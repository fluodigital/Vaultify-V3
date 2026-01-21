import { useState } from 'react';
import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { StunningHero } from '../components/StunningHero';
import { CaseStudySection } from '../components/CaseStudySection';
import { InfrastructureSection } from '../components/InfrastructureSection';
import { AlfredSection } from '../components/AlfredSection';
import { ExclusiveMembershipSection } from '../components/ExclusiveMembershipSection';
import { PartnersSection } from '../components/PartnersSection';
import { RequestAccessSection } from '../components/RequestAccessSection';
import { ModernFooter } from '../components/ModernFooter';
import { LoginModal } from '../components/LoginModal';
import { ChevronRight } from 'lucide-react';

interface HomeProps {
  onLoginClick: () => void;
  onMembershipClick: () => void;
}

export function Home({ onLoginClick, onMembershipClick }: HomeProps) {
  return (
    <div className="bg-[#000000] min-h-screen overflow-x-hidden">
      <ModernNavigation onLoginClick={onLoginClick} onMembershipClick={onMembershipClick} />
      
      <StunningHero onMembershipClick={onMembershipClick} />
      
      <section id="about">
        <CaseStudySection />
      </section>
      
      <InfrastructureSection />
      
      <section id="alfred">
        <AlfredSection />
      </section>
      
      <section id="membership">
        <ExclusiveMembershipSection onMembershipClick={onMembershipClick} />
      </section>
      
      <PartnersSection />
      
      <RequestAccessSection />
      
      <ModernFooter onMembershipClick={onMembershipClick} />

      {/* Floating Request Access Button - Mobile Only */}
      <motion.button
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={() => {
          document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="fixed bottom-6 right-6 z-40 lg:hidden px-6 py-4 rounded-full shadow-2xl flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
          color: '#000000',
        }}
      >
        <span className="uppercase tracking-wider">Apply</span>
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
}
