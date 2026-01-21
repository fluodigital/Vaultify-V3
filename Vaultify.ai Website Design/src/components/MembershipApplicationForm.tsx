import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface MembershipApplicationFormProps {
  onClose: () => void;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Location
  primaryResidence: string;
  additionalResidences: string;
  
  // Financial Profile
  netWorth: string;
  
  // Investment Interests
  investmentInterests: string[];
  
  // Lifestyle & Preferences
  luxuryInterests: string[];
  travelFrequency: string;
  preferredDestinations: string;
  
  // Vaultfy Interest
  heardAboutUs: string;
  referralSource: string;
}

const steps = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Let\'s begin your journey' },
  { id: 'personal', title: 'Personal Information', subtitle: 'Tell us about yourself' },
  { id: 'location', title: 'Location', subtitle: 'Where do you reside?' },
  { id: 'financial', title: 'Financial Profile', subtitle: 'This information is confidential' },
  { id: 'investments', title: 'Investment Interests', subtitle: 'What interests you?' },
  { id: 'lifestyle', title: 'Lifestyle Preferences', subtitle: 'Your luxury interests' },
  { id: 'goals', title: 'How Did You Find Us?', subtitle: 'We\'d love to know' },
  { id: 'submit', title: 'Review & Submit', subtitle: 'Confirm your application' },
];

export function MembershipApplicationForm({ onClose }: MembershipApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    primaryResidence: '',
    additionalResidences: '',
    netWorth: '',
    investmentInterests: [],
    luxuryInterests: [],
    travelFrequency: '',
    preferredDestinations: '',
    heardAboutUs: '',
    referralSource: '',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call - Replace with actual Firebase call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form Data:', formData);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Close after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Personal
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2: // Location
        return formData.primaryResidence;
      case 3: // Financial
        return formData.netWorth;
      case 4: // Investments
        return formData.investmentInterests.length > 0;
      case 5: // Lifestyle
        return formData.luxuryInterests.length > 0;
      case 6: // Goals
        return formData.heardAboutUs;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
            >
              <Check size={48} className="text-[#000000]" />
            </motion.div>
            <div>
              <h2 className="text-3xl text-[#F5F5F0] mb-3">Welcome to Vaultfy</h2>
              <p className="text-[#F5F5F0]/60 max-w-md mx-auto">
                You're about to join an exclusive community of high-net-worth individuals. 
                This application takes approximately 3 minutes to complete.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-[#F5F5F0]/50 max-w-md mx-auto text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,122,0.2)' }}>
                  <Check size={14} className="text-[#D4AF7A]" />
                </div>
                <span>All information is kept strictly confidential</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,122,0.2)' }}>
                  <Check size={14} className="text-[#D4AF7A]" />
                </div>
                <span>Our team reviews each application personally</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,122,0.2)' }}>
                  <Check size={14} className="text-[#D4AF7A]" />
                </div>
                <span>You'll hear back within 48 hours</span>
              </div>
            </div>
          </div>
        );

      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#F5F5F0]/80 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                  style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[#F5F5F0]/80 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Smith"
                  className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                  style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
              />
            </div>
          </div>
        );

      case 2: // Location
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Primary Residence *</label>
              <input
                type="text"
                value={formData.primaryResidence}
                onChange={(e) => updateField('primaryResidence', e.target.value)}
                placeholder="London, United Kingdom"
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Additional Residences</label>
              <textarea
                value={formData.additionalResidences}
                onChange={(e) => updateField('additionalResidences', e.target.value)}
                placeholder="Monaco, Dubai, New York..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none resize-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
              />
              <p className="text-xs text-[#F5F5F0]/40 mt-2">Separate multiple locations with commas</p>
            </div>
          </div>
        );

      case 3: // Financial Profile
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(212,175,122,0.1)', border: '1px solid rgba(212,175,122,0.2)' }}>
              <p className="text-xs text-[#F5F5F0]/60">
                <span className="text-[#D4AF7A]">Confidential:</span> This information is encrypted and only accessible to our leadership team.
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Estimated Net Worth *</label>
              <select
                value={formData.netWorth}
                onChange={(e) => updateField('netWorth', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] outline-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                autoFocus
              >
                <option value="">Select range</option>
                <option value="1-5m">$1M - $5M</option>
                <option value="5-10m">$5M - $10M</option>
                <option value="10-25m">$10M - $25M</option>
                <option value="25-50m">$25M - $50M</option>
                <option value="50-100m">$50M - $100M</option>
                <option value="100m+">$100M+</option>
              </select>
            </div>
          </div>
        );

      case 4: // Investment Interests
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-3">Investment Interests * (Select all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {['Private Equity', 'Real Estate', 'Venture Capital', 'Crypto/Web3', 'Art & Collectibles', 'Hedge Funds', 'Public Markets', 'Alternative Assets'].map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleArrayField('investmentInterests', interest)}
                    className="px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.investmentInterests.includes(interest)
                        ? 'linear-gradient(135deg, rgba(184,147,94,0.3), rgba(212,175,122,0.2))'
                        : 'rgba(45,45,45,0.6)',
                      border: formData.investmentInterests.includes(interest)
                        ? '1px solid rgba(212,175,122,0.5)'
                        : '1px solid rgba(212,175,122,0.2)',
                      color: '#F5F5F0',
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Lifestyle Preferences
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-3">Luxury Interests * (Select all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {['Private Aviation', 'Superyachts', 'Luxury Real Estate', 'Fine Dining', 'Exotic Cars', 'Art & Culture', 'Exclusive Events', 'Wellness & Spa'].map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleArrayField('luxuryInterests', interest)}
                    className="px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.luxuryInterests.includes(interest)
                        ? 'linear-gradient(135deg, rgba(184,147,94,0.3), rgba(212,175,122,0.2))'
                        : 'rgba(45,45,45,0.6)',
                      border: formData.luxuryInterests.includes(interest)
                        ? '1px solid rgba(212,175,122,0.5)'
                        : '1px solid rgba(212,175,122,0.2)',
                      color: '#F5F5F0',
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-3">Travel Frequency</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'frequent', label: 'Frequent' },
                  { value: 'occasional', label: 'Occasional' },
                  { value: 'rare', label: 'Rare' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('travelFrequency', option.value)}
                    className="px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.travelFrequency === option.value
                        ? 'linear-gradient(135deg, rgba(184,147,94,0.3), rgba(212,175,122,0.2))'
                        : 'rgba(45,45,45,0.6)',
                      border: formData.travelFrequency === option.value
                        ? '1px solid rgba(212,175,122,0.5)'
                        : '1px solid rgba(212,175,122,0.2)',
                      color: '#F5F5F0',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">Preferred Destinations</label>
              <textarea
                value={formData.preferredDestinations}
                onChange={(e) => updateField('preferredDestinations', e.target.value)}
                placeholder="Monaco, Maldives, Aspen, St. Barts..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none resize-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
              />
            </div>
          </div>
        );

      case 6: // How Did You Find Us
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">How did you hear about Vaultfy? *</label>
              <select
                value={formData.heardAboutUs}
                onChange={(e) => updateField('heardAboutUs', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] outline-none"
                style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                autoFocus
              >
                <option value="">Select source</option>
                <option value="referral">Personal Referral</option>
                <option value="social">Social Media</option>
                <option value="search">Search Engine</option>
                <option value="press">Press/Media</option>
                <option value="event">Event/Conference</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.heardAboutUs === 'referral' && (
              <div>
                <label className="block text-sm text-[#F5F5F0]/80 mb-2">Referral Source</label>
                <input
                  type="text"
                  value={formData.referralSource}
                  onChange={(e) => updateField('referralSource', e.target.value)}
                  placeholder="Name of person who referred you"
                  className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none"
                  style={{ border: '1px solid rgba(212,175,122,0.2)' }}
                />
              </div>
            )}
          </div>
        );

      case 7: // Submit
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-lg" style={{ background: 'rgba(212,175,122,0.1)', border: '1px solid rgba(212,175,122,0.2)' }}>
              <h3 className="text-lg text-[#F5F5F0] mb-3">Application Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#F5F5F0]/60">Name:</span>
                  <span className="text-[#F5F5F0]">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F0]/60">Email:</span>
                  <span className="text-[#F5F5F0]">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F0]/60">Location:</span>
                  <span className="text-[#F5F5F0]">{formData.primaryResidence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F0]/60">Investment Interests:</span>
                  <span className="text-[#F5F5F0]">{formData.investmentInterests.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F0]/60">Luxury Interests:</span>
                  <span className="text-[#F5F5F0]">{formData.luxuryInterests.length} selected</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(212,175,122,0.05)', border: '1px solid rgba(212,175,122,0.1)' }}>
              <p className="text-xs text-[#F5F5F0]/60 text-center">
                By submitting this application, you agree to our Terms of Service and Privacy Policy. 
                Your information will be reviewed by our membership team.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
            }}
          >
            <Check size={48} className="text-[#000000]" />
          </motion.div>
          <div>
            <h2 className="text-3xl text-[#F5F5F0] mb-3">Application Submitted!</h2>
            <p className="text-[#F5F5F0]/60 max-w-md">
              Thank you for your application. Our team will review it and get back to you within 48 hours.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-[100] overflow-y-auto"
    >
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'rgba(245,245,240,0.1)',
              border: '1px solid rgba(245,245,240,0.2)',
            }}
          >
            <X size={18} className="text-[#F5F5F0]" />
          </button>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#F5F5F0]/60">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-xs text-[#F5F5F0]/60">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'rgba(212,175,122,0.2)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(45,45,45,0.95), rgba(31,31,31,0.95))',
              border: '1px solid rgba(212,175,122,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Step header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl text-[#F5F5F0] mb-2">{steps[currentStep].title}</h2>
                <p className="text-sm text-[#F5F5F0]/60">{steps[currentStep].subtitle}</p>
              </motion.div>
            </AnimatePresence>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'rgba(212,175,122,0.1)' }}>
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-[#F5F5F0] transition-all"
                  style={{
                    background: 'rgba(45,45,45,0.8)',
                    border: '1px solid rgba(212,175,122,0.2)',
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-lg flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    color: '#2D2D2D',
                  }}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-5 h-5 border-2 border-[#2D2D2D] border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Check size={18} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentStep > 0 && !canProceed()}
                  className="px-8 py-3 rounded-lg flex items-center gap-2 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    color: '#2D2D2D',
                    opacity: currentStep > 0 && !canProceed() ? 0.5 : 1,
                  }}
                >
                  <span>{currentStep === 0 ? 'Get Started' : 'Continue'}</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
