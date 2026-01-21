import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';

export function TermsOfService() {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} />
      
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-[#D4AF7A]/20 bg-[#D4AF7A]/5">
              <span 
                className="text-sm uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Legal
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-4 tracking-tight">
              Terms of Service
            </h1>
            
            <p className="text-sm text-[#F5F5F0]/40">Last updated: January 2025</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {[
            {
              title: 'Acceptance of Terms',
              content: 'By accessing or using Vaultfy, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. These terms constitute a legally binding agreement between you and Vaultfy Inc.'
            },
            {
              title: 'Membership Eligibility',
              content: 'Vaultfy membership is by invitation only and limited to individuals who: are at least 21 years of age, meet our net worth or income requirements, successfully complete identity verification, and are not prohibited from using our services under applicable laws.'
            },
            {
              title: 'Account Registration',
              content: 'You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us of any unauthorized access to your account.'
            },
            {
              title: 'Membership Fees',
              content: 'Membership fees are charged annually and are non-refundable. We reserve the right to modify fees with 30 days notice to members. Failure to pay fees may result in suspension or termination of your membership.'
            },
            {
              title: 'Services Provided',
              content: 'Vaultfy provides access to: exclusive investment opportunities, portfolio intelligence and analytics, luxury booking services, AI concierge (Alfred), and member networking. Services are subject to availability and may be modified or discontinued at our discretion.'
            },
            {
              title: 'Investment Disclaimer',
              content: 'Vaultfy is not a registered investment advisor. Deal flow and investment opportunities are informational only. Members are responsible for their own investment decisions and due diligence. Past performance does not guarantee future results.'
            },
            {
              title: 'Booking Services',
              content: 'Luxury bookings (jets, yachts, hotels, etc.) are subject to availability and the terms of the service providers. Vaultfy acts as a facilitator and is not responsible for service provider performance. Cancellation policies vary by provider.'
            },
            {
              title: 'Payment Terms',
              content: 'We accept card, wire transfer, and stablecoin payments. All transactions are final unless otherwise specified. You are responsible for any taxes, fees, or charges related to your transactions.'
            },
            {
              title: 'Prohibited Activities',
              content: 'You may not: use Vaultfy for illegal purposes, attempt to gain unauthorized access to our systems, share your account with others, scrape or copy our content, harass other members, or violate any applicable laws or regulations.'
            },
            {
              title: 'Intellectual Property',
              content: 'All content, trademarks, and intellectual property on Vaultfy are owned by Vaultfy Inc. or our licensors. You may not copy, modify, or distribute our content without written permission.'
            },
            {
              title: 'Limitation of Liability',
              content: 'Vaultfy is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount of membership fees you paid in the preceding 12 months.'
            },
            {
              title: 'Termination',
              content: 'We may suspend or terminate your membership at any time for violation of these terms or at our discretion. You may terminate your membership by contacting support. Termination does not entitle you to a refund.'
            },
            {
              title: 'Governing Law',
              content: 'These terms are governed by the laws of the State of New York, USA. Disputes will be resolved through binding arbitration in New York, NY.'
            },
            {
              title: 'Changes to Terms',
              content: 'We reserve the right to modify these terms at any time. Material changes will be communicated to members. Continued use after changes constitutes acceptance of the updated terms.'
            },
            {
              title: 'Contact Information',
              content: 'Questions about these terms? Contact us at legal@vaultfy.com or write to: Vaultfy Inc., Legal Department, New York, NY 10001.'
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl text-[#F5F5F0] mb-4">{section.title}</h2>
              <p className="text-[#F5F5F0]/70 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
