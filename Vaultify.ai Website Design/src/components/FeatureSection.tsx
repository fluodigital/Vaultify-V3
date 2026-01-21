import { ImageWithFallback } from './figma/ImageWithFallback';
import { LucideIcon } from 'lucide-react';

interface FeatureSectionProps {
  badge?: string;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
  icon?: LucideIcon;
}

export function FeatureSection({ 
  badge, 
  title, 
  description, 
  image, 
  reverse = false,
  icon: Icon 
}: FeatureSectionProps) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}>
      <div className="flex-1">
        {badge && (
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-400 text-sm uppercase tracking-wider">{badge}</span>
          </div>
        )}
        
        {Icon && (
          <div className="mb-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon className="text-white" size={24} />
          </div>
        )}
        
        <h2 className="text-4xl md:text-5xl text-white mb-6">{title}</h2>
        <p className="text-xl text-white/60 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex-1 w-full">
        <div className="relative rounded-2xl overflow-hidden group">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
