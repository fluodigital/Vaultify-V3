import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';

export function Disclosures() {
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
              Disclosures
            </h1>
            
            <p className="text-sm text-[#F5F5F0]/40">Important information about our services</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {[
            {
              title: 'Not a Registered Investment Advisor',
              content: 'Vaultfy Inc. is not a registered investment advisor with the SEC or any state securities regulator. The investment opportunities presented on our platform are for informational purposes only and do not constitute investment advice. Members should consult with their own financial advisors before making investment decisions.'
            },
            {
              title: 'Investment Risks',
              content: 'All investments carry risk, including the potential loss of principal. Private investments offered through Vaultfy may be illiquid, speculative, and suitable only for sophisticated investors who can afford to lose their entire investment. Past performance is not indicative of future results.'
            },
            {
              title: 'Accredited Investor Status',
              content: 'Many investment opportunities on our platform are available only to accredited investors as defined by the SEC. By participating, you represent that you meet the accredited investor requirements or have received advice from a licensed professional.'
            },
            {
              title: 'No FDIC Insurance',
              content: 'Funds held with Vaultfy or invested through our platform are not FDIC insured, not bank guaranteed, and may lose value. Cryptocurrency holdings are especially volatile and carry significant risk.'
            },
            {
              title: 'Third-Party Services',
              content: 'Luxury booking services (jets, yachts, hotels, vehicles) are provided by third-party vendors. Vaultfy acts as a facilitator and is not responsible for the quality, safety, or legality of services provided by these vendors. Each vendor has their own terms and conditions.'
            },
            {
              title: 'AI and Automation',
              content: 'Alfred, our AI concierge, uses machine learning and natural language processing. While we strive for accuracy, AI systems can make errors. All recommendations should be reviewed carefully before taking action. Human support is available for complex requests.'
            },
            {
              title: 'Cryptocurrency Risks',
              content: 'Cryptocurrency transactions are irreversible and may be subject to significant volatility, regulatory changes, and security risks. Vaultfy is not responsible for losses due to price fluctuations, network failures, or user error in cryptocurrency transactions.'
            },
            {
              title: 'International Transactions',
              content: 'Services may involve international transactions subject to foreign laws, currency exchange risks, and potential delays. Members are responsible for understanding and complying with local laws in their jurisdiction.'
            },
            {
              title: 'Data and Analytics',
              content: 'Portfolio intelligence and analytics are based on data you provide and third-party sources. While we use sophisticated algorithms, we cannot guarantee the accuracy or completeness of all data. Investment decisions should not rely solely on our analytics.'
            },
            {
              title: 'Fees and Commissions',
              content: 'Vaultfy may receive compensation from service providers for bookings and transactions. This compensation does not affect the price you pay. We may also charge platform fees for certain services, which will be disclosed at the time of transaction.'
            },
            {
              title: 'Tax Implications',
              content: 'You are responsible for all tax obligations related to your Vaultfy membership, investments, and transactions. We recommend consulting with a tax professional. Vaultfy does not provide tax advice.'
            },
            {
              title: 'Regulatory Compliance',
              content: 'Vaultfy complies with applicable anti-money laundering (AML) and know-your-customer (KYC) regulations. We reserve the right to request additional documentation and may report suspicious activity to authorities as required by law.'
            },
            {
              title: 'Forward-Looking Statements',
              content: 'Any projections, forecasts, or estimates on our platform are forward-looking statements that involve risks and uncertainties. Actual results may differ materially from these statements.'
            },
            {
              title: 'Changes to Services',
              content: 'Vaultfy reserves the right to modify, suspend, or discontinue any service at any time without liability. We will provide reasonable notice of material changes when possible.'
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

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-[#F5F5F0]/60 mb-6">
              Questions about these disclosures?
            </p>
            <p className="text-[#F5F5F0]/80">
              Contact our legal team at <span style={{ color: '#D4AF7A' }}>legal@vaultfy.com</span>
            </p>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
