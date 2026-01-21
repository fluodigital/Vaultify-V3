import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

interface ContactProps {
  onMembershipClick: () => void;
}

export function Contact({ onMembershipClick }: ContactProps) {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={onMembershipClick} />
      
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
                Company
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-6 tracking-tight">
              Contact Us
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Our team is here to answer your questions about membership, partnerships, or press inquiries.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: 'Email Us',
                content: 'membership@vaultfy.com',
                description: 'For membership inquiries and general questions'
              },
              {
                icon: MessageCircle,
                title: 'Live Support',
                content: '24/7 Available',
                description: 'Members have access to instant support through Alfred'
              },
              {
                icon: MapPin,
                title: 'Headquarters',
                content: 'New York, NY',
                description: 'Additional offices in London, Dubai, and Singapore'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg border border-[#D4AF7A]/10"
              >
                <item.icon 
                  className="w-10 h-10 mx-auto mb-4"
                  style={{ color: '#D4AF7A' }}
                />
                <h3 className="text-xl text-[#F5F5F0] mb-2">{item.title}</h3>
                <p 
                  className="mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {item.content}
                </p>
                <p className="text-sm text-[#F5F5F0]/60">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto p-8 rounded-lg border border-[#D4AF7A]/20 bg-[#D4AF7A]/5"
          >
            <h2 className="text-2xl text-[#F5F5F0] mb-6 text-center">Send Us a Message</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-[#F5F5F0]/80 mb-2 text-sm">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#D4AF7A]/20 text-[#F5F5F0] focus:outline-none focus:border-[#D4AF7A]/50"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-[#F5F5F0]/80 mb-2 text-sm">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#D4AF7A]/20 text-[#F5F5F0] focus:outline-none focus:border-[#D4AF7A]/50"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-[#F5F5F0]/80 mb-2 text-sm">Subject</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#D4AF7A]/20 text-[#F5F5F0] focus:outline-none focus:border-[#D4AF7A]/50"
                  placeholder="What can we help with?"
                />
              </div>
              
              <div>
                <label className="block text-[#F5F5F0]/80 mb-2 text-sm">Message</label>
                <textarea 
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#D4AF7A]/20 text-[#F5F5F0] focus:outline-none focus:border-[#D4AF7A]/50 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
