interface Testimonial {
  quote: string;
  source: string;
  logo?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Vaultfy redefines luxury lifestyle services. The AI-powered concierge delivers experiences I never knew existed.",
    source: "Forbes"
  },
  {
    quote: "From impossible restaurant reservations to bespoke travel itineraries, Vaultfy has become indispensable to our executive team.",
    source: "The Robb Report"
  },
  {
    quote: "The future of luxury concierge. Vaultfy combines white-glove service with the intelligence of AI.",
    source: "Bloomberg"
  }
];

export function TestimonialSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div 
          key={index} 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
        >
          <p className="text-white/80 text-lg mb-6 italic">"{testimonial.quote}"</p>
          <p className="text-white/60">— {testimonial.source}</p>
        </div>
      ))}
    </div>
  );
}
