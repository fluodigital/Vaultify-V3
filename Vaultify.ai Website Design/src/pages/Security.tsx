import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Shield, Lock, Eye, Server } from 'lucide-react';

export function Security() {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} />
      
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
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
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-6 tracking-tight">
              Security
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Your security is our highest priority. We employ military-grade encryption and 
              industry-leading practices to protect your wealth and privacy.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Lock,
                title: 'Bank-Grade Encryption',
                description: 'All data is encrypted using AES-256 encryption at rest and TLS 1.3 in transit. The same encryption standard used by major financial institutions and government agencies.'
              },
              {
                icon: Shield,
                title: 'Multi-Factor Authentication',
                description: 'Every account is protected with multi-factor authentication. We support biometric authentication, hardware security keys, and time-based one-time passwords (TOTP).'
              },
              {
                icon: Eye,
                title: 'Zero-Knowledge Architecture',
                description: 'Sensitive data is encrypted on your device before transmission. Even Vaultfy employees cannot access your private information without explicit authorization.'
              },
              {
                icon: Server,
                title: 'SOC 2 Compliant Infrastructure',
                description: 'Our infrastructure is hosted on SOC 2 Type II certified providers with regular third-party audits, ensuring the highest security and operational standards.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-lg border border-[#D4AF7A]/10 bg-[#D4AF7A]/5"
              >
                <feature.icon 
                  className="w-12 h-12 mb-4"
                  style={{ color: '#D4AF7A' }}
                />
                <h3 className="text-2xl text-[#F5F5F0] mb-3">{feature.title}</h3>
                <p className="text-[#F5F5F0]/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#F5F5F0] mb-6">Security Practices</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Regular Audits',
                description: 'Quarterly security audits and penetration testing by leading cybersecurity firms'
              },
              {
                title: 'Continuous Monitoring',
                description: '24/7 security operations center monitoring all systems for suspicious activity'
              },
              {
                title: 'Incident Response',
                description: 'Dedicated security team with rapid incident response protocols'
              },
              {
                title: 'Data Segregation',
                description: 'Member data is segregated and isolated with strict access controls'
              },
              {
                title: 'Secure Development',
                description: 'Security-first development practices with regular code reviews'
              },
              {
                title: 'Employee Training',
                description: 'All employees undergo comprehensive security and privacy training'
              }
            ].map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg border border-[#D4AF7A]/10 text-center"
              >
                <h3 className="text-xl text-[#F5F5F0] mb-3">{practice.title}</h3>
                <p className="text-[#F5F5F0]/60 text-sm">{practice.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl text-[#F5F5F0] mb-8">Compliance & Certifications</h2>
            
            <div className="space-y-6 text-lg text-[#F5F5F0]/70 leading-relaxed">
              <p>
                Vaultfy is committed to maintaining the highest security and compliance standards:
              </p>
              
              <ul className="space-y-4 ml-6">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF7A] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#F5F5F0]">SOC 2 Type II:</strong> Independently audited security, availability, and confidentiality controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF7A] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#F5F5F0]">PCI DSS:</strong> Payment Card Industry Data Security Standard compliance for credit card processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF7A] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#F5F5F0]">GDPR:</strong> Full compliance with European data protection regulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF7A] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#F5F5F0]">AML/KYC:</strong> Comprehensive anti-money laundering and know-your-customer procedures</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Report a Security Issue
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8">
              If you discover a security vulnerability, please report it immediately to our security team
            </p>
            <p className="text-[#F5F5F0]/80">
              Email: <span style={{ color: '#D4AF7A' }}>security@vaultfy.com</span>
            </p>
            <p className="text-sm text-[#F5F5F0]/40 mt-4">
              We appreciate responsible disclosure and will respond within 24 hours
            </p>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
