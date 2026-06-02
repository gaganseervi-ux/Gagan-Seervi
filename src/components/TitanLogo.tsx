import React from "react";

interface TitanLogoProps {
  className?: string;
  size?: number; // width and height as physical pixels if needed
  showText?: boolean;
}

export default function TitanLogo({ className = "w-12 h-12", size, showText = true }: TitanLogoProps) {
  // We design the logo in a 400x400 viewBox to ensure pixel-perfect vector scalability.
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Solid Black Base Plate */}
      <circle cx="200" cy="200" r="192" fill="#000000" />

      {/* 2. Concentric Sketch Elements / Outer Handcrafted Circles */}
      <circle cx="200" cy="200" r="186" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.4" />
      <circle cx="200" cy="200" r="182" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.15" />
      
      {/* Stylized custom sketchy brush outline path */}
      <path
        d="M 200 10 A 190 190 0 1 1 199.9 10"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.75"
        strokeDasharray="400 12 150 8 300 15"
      />

      {/* 3. Curved Typography Paths */}
      {/* Top text arc path (Clockwise from ~210 degrees around to ~330 degrees, centered at top) */}
      <path
        id="titan-logo-top-text-path"
        d="M 54 200 A 146 146 0 1 1 346 200"
        fill="none"
        stroke="none"
      />

      {/* Bottom text arc path (Counter-Clockwise to ensure "CONNECT" is upright) */}
      <path
        id="titan-logo-bottom-text-path"
        d="M 346 200 A 146 146 0 0 1 54 200"
        fill="none"
        stroke="none"
      />

      {/* 4. Display Curved Text */}
      {showText && (
        <>
          <text
            fill="#FFFFFF"
            fontSize="26px"
            fontWeight="bold"
            fontFamily="'Courier New', Courier, monospace, system-ui"
            letterSpacing="11px"
            dy="-4"
          >
            {/* We offset by 50% with text-anchor middle to center the lettering perfectly */}
            <textPath href="#titan-logo-top-text-path" startOffset="50%" textAnchor="middle">
              TITAN HEALTH
            </textPath>
          </text>

          <text
            fill="#FFFFFF"
            fontSize="26px"
            fontWeight="bold"
            fontFamily="'Courier New', Courier, monospace, system-ui"
            letterSpacing="11px"
            dy="26"
          >
            <textPath href="#titan-logo-bottom-text-path" startOffset="50%" textAnchor="middle">
              CONNECT
            </textPath>
          </text>
        </>
      )}

      {/* 5. Central Golden Caduceus Symbol */}
      <g id="titan-logo-caduceus" transform="translate(133, 138) scale(0.67)">
        {/* A. Central Caduceus Staff/Rod (Gold: #E6B022) */}
        <line
          x1="100"
          y1="25"
          x2="100"
          y2="195"
          stroke="#eab308"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        {/* Sphere/Ball at the top of the rod */}
        <circle cx="100" cy="18" r="12" fill="#eab308" />

        {/* B. Symmetrical Golden Wings */}
        {/* Left Wing (Feathered structure, fully filled vectors) */}
        <path
          d="M 100 32 
             C 80 14, 25 10, 5 36 
             C 18 48, 55 48, 72 49 
             C 52 56, 32 60, 20 58 
             C 38 68, 68 64, 82 61 
             C 70 74, 58 77, 45 77 
             C 62 84, 90 77, 100 66 Z"
          fill="#eab308"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Right Wing (Mirror of the Left Wing coords) */}
        <path
          d="M 100 32 
             C 120 14, 175 10, 195 36 
             C 182 48, 145 48, 128 49 
             C 148 56, 168 60, 180 58 
             C 162 68, 132 64, 118 61 
             C 130 74, 142 77, 155 77 
             C 138 84, 110 77, 100 66 Z"
          fill="#eab308"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* C. Coiled Twin Snakes */}
        {/* Symmetrical winding snake profiles with detailed head elements */}
        
        {/* Left Snake: Head at Top Left, coiling down behind and over the rod */}
        <path
          d="M 80 77
             C 65 77, 50 87, 55 105
             C 60 125, 95 125, 115 135
             C 145 150, 145 168, 120 182
             C 105 190, 100 193, 100 195"
          fill="none"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left Snake Under-crossing coil */}
        <path
          d="M 100 112
             C 125 122, 145 130, 135 145
             C 120 165, 80 155, 75 178
             C 72 190, 90 193, 100 195"
          fill="none"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left Snake Head */}
        <path
          d="M 80 77 Q 85 75 88 80 Q 85 85 80 82 Z"
          fill="#eab308"
          stroke="#d97706"
          strokeWidth="1"
        />
        <circle cx="84" cy="78" r="1.5" fill="#000000" /> {/* Eye */}

        {/* Right Snake: Head at Top Right, mirroring the coiling system */}
        <path
          d="M 120 77
             C 135 77, 150 87, 145 105
             C 140 125, 105 125, 85 135
             C 55 150, 55 168, 80 182
             C 95 190, 100 193, 100 195"
          fill="none"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Snake Under-crossing coil */}
        <path
          d="M 100 112
             C 75 122, 55 130, 65 145
             C 80 165, 120 155, 125 178
             C 128 190, 110 193, 100 195"
          fill="none"
          stroke="#eab308"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Snake Head */}
        <path
          d="M 120 77 Q 115 75 112 80 Q 115 85 120 82 Z"
          fill="#eab308"
          stroke="#d97706"
          strokeWidth="1"
        />
        <circle cx="116" cy="78" r="1.5" fill="#000000" /> {/* Eye */}

        {/* Supporting serpent tail coil base detail */}
        <path
          d="M 97 195 L 103 195"
          stroke="#eab308"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
