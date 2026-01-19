
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
  iconClassName?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  className = "",
  iconClassName = ""
}) => {
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';
  
  return (
    <div className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 hover-scale animate-slide-up ${delayClass} ${className}`}>
      <div className={`feature-icon mb-4 text-coral-600 ${iconClassName}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
