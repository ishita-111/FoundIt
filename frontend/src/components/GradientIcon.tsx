import { LucideIcon } from 'lucide-react';

export default function GradientIcon({ 
  Icon, 
  size = 24, 
  className = "" 
}: { 
  Icon: LucideIcon; 
  size?: number; 
  className?: string; 
}) {
  return (
    <Icon 
      size={size} 
      className={className} 
      style={{ stroke: "url(#iconGradient)" }} 
    />
  );
}
