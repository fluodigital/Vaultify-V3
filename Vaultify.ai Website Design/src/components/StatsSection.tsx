interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '24/7/365', label: 'AI Concierge Available' },
  { value: 'Instant', label: 'Response Time' },
  { value: '500+', label: 'Partner Restaurants' },
  { value: '150+', label: 'Countries Served' },
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl md:text-5xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            {stat.value}
          </div>
          <div className="text-white/60">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
