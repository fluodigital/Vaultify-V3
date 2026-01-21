import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AccessForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl text-white mb-4 text-center">Apply for Membership</h2>
      <p className="text-white/60 text-center mb-8">
        Request membership and begin experiencing the extraordinary, today.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
            />
          </div>
          <div>
            <Input
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
            />
          </div>
        </div>
        
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          required
        />
        
        <Input
          placeholder="Company (optional)"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
        
        <p className="text-white/40 text-sm">
          By providing your email, you consent to receiving updates about Vaultfy. 
          You may opt out at any time by contacting privacy@vaultfy.com.
        </p>
        
        <Button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6"
        >
          Submit Application
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="#business" className="text-white/60 hover:text-white transition-colors text-sm">
          I'm looking for a concierge for my clients
        </a>
      </div>
    </div>
  );
}
