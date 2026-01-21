import { ImageWithFallback } from './figma/ImageWithFallback';

interface GalleryItem {
  image: string;
  title: string;
}

interface ScrollingGalleryProps {
  items: GalleryItem[];
  direction?: 'left' | 'right';
}

export function ScrollingGallery({ items, direction = 'left' }: ScrollingGalleryProps) {
  const animationDirection = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right';
  
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className={`flex gap-6 ${animationDirection}`}>
        {/* First set */}
        {items.map((item, index) => (
          <div key={`first-${index}`} className="flex-shrink-0 w-[400px] h-[300px] relative group">
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl flex items-end p-6">
              <p className="text-white">{item.title}</p>
            </div>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {items.map((item, index) => (
          <div key={`second-${index}`} className="flex-shrink-0 w-[400px] h-[300px] relative group">
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl flex items-end p-6">
              <p className="text-white">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
