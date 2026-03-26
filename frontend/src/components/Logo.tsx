export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" /> 
          <stop offset="50%" stopColor="#818cf8" /> 
          <stop offset="100%" stopColor="#c084fc" /> 
        </linearGradient>
      </defs>

      <path 
        d="M 37 25 L 82 25 C 84 25, 85 26.5, 84 28 L 78 40 C 77 41.5, 75.5 42, 74 42 L 33 42 C 31 42, 30 40.5, 31 39 L 35 27 C 35.5 25.5, 37 25, 37 25 Z" 
        fill="url(#logoGradient)" 
      />

      <path 
        d="M 33 46 L 61 46 L 73 53 L 56 65 L 56 59 L 26 59 C 24 59, 23 57.5, 24 56 L 29 48 C 30 46.5, 31.5 46, 33 46 Z" 
        fill="url(#logoGradient)" 
      />

      <path 
        d="M 28 64 L 50 64 C 52 64, 53 65.5, 52 67 L 46 79 C 45 80.5, 43.5 81, 42 81 L 20 81 C 18 81, 17 79.5, 18 78 L 24 66 C 25 64.5, 26.5 64, 28 64 Z" 
        fill="url(#logoGradient)" 
      />
    </svg>
  );
}
