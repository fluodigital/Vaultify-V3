import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';

export function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            
            <p className="text-sm text-[#F5F5F0]/40">Last updated: January 2025</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {[
            {
              title: 'Our Commitment to Privacy',
              content: 'At Vaultfy, privacy is not just a policy—it\'s a core principle. We understand that our members expect the highest level of discretion and security. Your financial information, transactions, and personal data are protected with bank-grade encryption and security measures.'
            },
            {
              title: 'Information We Collect',
              content: 'We collect information necessary to provide our services, including: identity verification data (name, address, date of birth), financial information (bank accounts, portfolio holdings), transaction history, and usage data. All data collection is limited to what is necessary to deliver exceptional service.'
            },
            {
              title: 'How We Use Your Information',
              content: 'Your information is used solely to: provide and improve our services, verify your identity and comply with regulations, process transactions and bookings, offer personalized recommendations through AI, and protect against fraud and unauthorized access. We never sell your data to third parties.'
            },
            {
              title: 'Data Security',
              content: 'We employ military-grade encryption (AES-256) for all data at rest and in transit. Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 Type II compliance. Access to member data is strictly limited and audited. We conduct regular security audits and penetration testing.'
            },
            {
              title: 'Data Sharing',
              content: 'We only share your data when: required by law or regulation, necessary to process a transaction you initiated (e.g., booking a private jet), or with service providers under strict confidentiality agreements. We never share your data for marketing purposes or with data brokers.'
            },
            {
              title: 'Your Rights',
              content: 'You have the right to: access all data we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal requirements), opt-out of certain data uses, and export your data in a portable format. Contact our privacy team at privacy@vaultfy.com to exercise these rights.'
            },
            {
              title: 'Cookies and Tracking',
              content: 'We use essential cookies to provide our services and analytics cookies to improve performance. You can control cookie preferences through your browser settings. We do not use advertising cookies or share data with ad networks.'
            },
            {
              title: 'International Transfers',
              content: 'Vaultfy operates globally. Your data may be processed in the United States, European Union, or other jurisdictions where we or our service providers operate. We ensure appropriate safeguards are in place for international data transfers.'
            },
            {
              title: 'Changes to This Policy',
              content: 'We may update this privacy policy periodically. Material changes will be communicated to members via email. Continued use of Vaultfy after changes constitutes acceptance of the updated policy.'
            },
            {
              title: 'Contact Us',
              content: 'Questions about this privacy policy? Contact our privacy team at privacy@vaultfy.com or write to us at: Vaultfy Inc., Privacy Team, New York, NY 10001.'
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
