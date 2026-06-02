import React from "react";

interface DoctorPatientIllustrationProps {
  className?: string;
}

export default function DoctorPatientIllustration({ className = "w-full h-full" }: DoctorPatientIllustrationProps) {
  return (
    <svg
      viewBox="0 0 800 570"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      referrerPolicy="no-referrer"
    >
      {/* Group wrapper with responsive transition */}
      <g className="transition-all duration-300">
        
        {/* 1. Main background decorative wave (soft sky blue) */}
        <path
          d="M 50 150 
             C 100 80, 200 40, 400 60 
             C 600 80, 700 120, 750 180 
             C 780 220, 770 320, 750 420 
             C 720 500, 600 540, 400 520 
             C 200 500, 800 480, 70 420 
             C 40 380, 20 220, 50 150 Z"
          fill="#D6EFFF"
          fillOpacity="0.85"
        />

        {/* 2. Abstract background foliage/leaf patterns (organic soft teal/blue color) */}
        <g id="foliage-background" opacity="0.45">
          {/* Left bottom corner leaves */}
          <path
            d="M 60 480 C 40 430, 80 400, 110 430 C 120 440, 100 470, 60 480 Z"
            fill="#80C9FF"
          />
          <path
            d="M 80 460 C 60 410, 105 380, 130 415 C 140 430, 115 450, 80 460 Z"
            fill="#64BAFF"
          />
          <path
            d="M 100 430 C 80 370, 130 350, 150 385 C 160 400, 135 420, 100 430 Z"
            fill="#80C9FF"
          />
          <path
            d="M 120 380 C 100 320, 150 300, 175 335 C 185 350, 155 370, 120 380 Z"
            fill="#4AA8FF"
          />
          
          {/* Stem left */}
          <path
            d="M 65 480 Q 120 400 150 330"
            stroke="#4AA8FF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right bottom / middle leaves */}
          <path
            d="M 450 490 C 430 450, 460 420, 480 445 C 490 460, 470 480, 450 490 Z"
            fill="#80C9FF"
          />
          <path
            d="M 480 470 C 460 420, 500 390, 520 420 C 530 435, 500 460, 480 470 Z"
            fill="#64BAFF"
          />
          <path
            d="M 520 440 C 500 380, 550 360, 570 395 C 580 410, 550 430, 520 440 Z"
            fill="#80C9FF"
          />
          
          {/* Stem right */}
          <path
            d="M 450 495 Q 520 440 560 380"
            stroke="#4AA8FF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Additional background leaves on far right */}
          <path
            d="M 720 430 C 740 380, 780 410, 760 445 C 750 460, 730 450, 720 430 Z"
            fill="#64BAFF"
          />
          <path
            d="M 740 380 C 760 330, 795 360, 780 395 C 770 410, 750 400, 740 380 Z"
            fill="#80C9FF"
          />
        </g>

        {/* 3. Floating Interactive Speech/Consultation Bubbles */}
        <g id="speech-bubbles">
          {/* Bubble 1 (Left) */}
          <g transform="translate(300, 115)">
            <path
              d="M 10 10 
                 H 110 
                 A 15 15 0 0 1 125 25 
                 V 55 
                 A 15 15 0 0 1 110 70 
                 H 40 
                 L 25 85 
                 V 70 
                 H 10 
                 A 15 15 0 0 1 -5 55 
                 V 25 
                 A 15 15 0 0 1 10 10 Z"
              fill="#9BD1FF"
              fillOpacity="0.9"
            />
            {/* Dots inside bubble */}
            <circle cx="35" cy="40" r="4.5" fill="#FFFFFF" />
            <circle cx="60" cy="40" r="4.5" fill="#FFFFFF" />
            <circle cx="85" cy="40" r="4.5" fill="#FFFFFF" />
          </g>

          {/* Bubble 2 (Right) */}
          <g transform="translate(365, 185)">
            <path
              d="M 10 10 
                 H 110 
                 A 15 15 0 0 1 125 25 
                 V 55 
                 A 15 15 0 0 1 110 70 
                 H 25 
                 L 12 82 
                 V 70 
                 H 10 
                 A 15 15 0 0 1 -5 55 
                 V 25 
                 A 15 15 0 0 1 10 10 Z"
              fill="#9BD1FF"
              fillOpacity="0.9"
            />
            {/* Dots inside bubble */}
            <circle cx="35" cy="40" r="4.5" fill="#FFFFFF" />
            <circle cx="60" cy="40" r="4.5" fill="#FFFFFF" />
            <circle cx="85" cy="40" r="4.5" fill="#FFFFFF" />
          </g>
        </g>


        {/* 4. PREGNANT WOMAN PATIENT (LEFT SIDE OF ILLUSTRATION) */}
        <g id="pregnant-patient">
          {/* A. Body Skin / Neck and Torso Base */}
          <path
            d="M 195 240 L 235 240 L 230 265 L 195 265 Z"
            fill="#9E6148" /* Darker/rich medium-brown skin tone matching illustration */
          />
          
          {/* B. Elegant Topknot Bun Hair */}
          {/* Main Hair Bun */}
          <circle cx="270" cy="180" r="32" fill="#1C1816" />
          <circle cx="270" cy="148" r="24" fill="#1C1816" />
          <circle cx="282" cy="140" r="14" fill="#1C1816" />
          
          {/* C. Beautiful Head & Face Profile */}
          <path
            d="M 230 185 
               C 230 170, 240 160, 255 160 
               C 270 160, 285 170, 285 185 
               C 285 200, 275 220, 255 220 
               C 235 220, 230 200, 230 185 Z"
            fill="#9E6148"
          />
          {/* Ear */}
          <circle cx="282" cy="188" r="7" fill="#9E6148" />

          {/* Simple Facial Features */}
          {/* Eye */}
          <path d="M 242 182 Q 248 178 252 183" stroke="#1C1816" strokeWidth="2.5" strokeLinecap="round" />
          {/* Eyebrow */}
          <path d="M 239 176 Q 248 171 254 176" stroke="#1C1816" strokeWidth="2" strokeLinecap="round" />
          {/* Nose */}
          <path d="M 231 188 L 227 194 L 234 195" stroke="#9E6148" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Warm Smile */}
          <path d="M 242 201 Q 248 206 254 200" stroke="#1C1816" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* D. Beautiful Pregnant Torso and Teal Dress */}
          {/* Left sleeve/shoulder */}
          <path
            d="M 183 250
               C 170 250, 155 260, 150 280
               C 145 300, 155 315, 170 315
               C 180 315, 195 295, 195 270 Z"
            fill="#009BD6" /* Highly vibrant teal dress */
          />
          {/* Right shoulder top */}
          <path
            d="M 235 240 C 255 240, 280 255, 290 275"
            stroke="#009BD6"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Main dress block & pregnant belly */}
          <path
            d="M 191 262 
               C 195 248, 225 248, 232 262 
               C 255 285, 305 290, 312 320 
               C 325 350, 335 385, 330 420 
               C 325 460, 290 515, 220 520 
               C 170 520, 160 480, 165 420
               C 170 360, 185 300, 191 262 Z"
            fill="#009BD6"
          />

          {/* Baby bump styling/shadow */}
          <path
            d="M 242 485
               C 285 470, 315 440, 322 410
               C 328 380, 320 350, 310 330
               C 282 355, 245 420, 242 485 Z"
            fill="#0086BA"
            opacity="0.4"
          />

          {/* Left arm resting on bump */}
          <g id="patient-left-arm">
            {/* Upper arm curving forward */}
            <path
              d="M 160 295
                 C 140 330, 135 365, 165 410
                 C 175 425, 210 445, 252 445"
              stroke="#9E6148"
              strokeWidth="19"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sleeve edge */}
            <path
              d="M 160 295 Q 155 315 168 318"
              stroke="#009BD6"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Hand resting on pregnant belly */}
            <path
              d="M 252 445
                 C 265 445, 295 440, 310 425
                 C 312 410, 290 405, 275 410
                 C 260 415, 250 435, 252 445 Z"
              fill="#9E6148"
            />
            {/* Delicate finger lines details */}
            <path d="M 283 411 C 295 414, 305 419, 309 423" stroke="#874D36" strokeWidth="2" strokeLinecap="round" />
            <path d="M 280 418 C 290 422, 298 427, 302 431" stroke="#874D36" strokeWidth="2" strokeLinecap="round" />
            <path d="M 276 424 C 284 428, 290 433, 293 437" stroke="#874D36" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right arm resting on upper breast/belly level */}
          <g id="patient-right-arm">
            <path
              d="M 245 285
                 C 275 285, 310 320, 320 340
                 C 325 350, 310 365, 295 365
                 C 275 365, 240 345, 222 320"
              stroke="#9E6148"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Hand */}
            <path
              d="M 292 364
                 C 305 365, 318 360, 325 350
                 C 334 340, 310 330, 295 338"
              fill="#9E6148"
            />
            {/* Fingers right */}
            <path d="M 308 340 Q 320 344 324 348" stroke="#874D36" strokeWidth="2" strokeLinecap="round" />
            <path d="M 305 348 Q 315 352 318 356" stroke="#874D36" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Breast overlay line details */}
          <path
            d="M 235 315 C 248 322, 268 330, 278 335"
            stroke="#0086BA"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>


        {/* 5. GENTLE CLINICAL DOCTOR (RIGHT SIDE OF ILLUSTRATION) */}
        <g id="clinical-doctor">
          {/* A. Body Skin & Voluminous Curly Hair */}
          <path
            d="M 525 240 L 565 240 L 560 268 L 525 268 Z"
            fill="#723D26" /* Dark curly-haired doctor skin tone */
          />
          
          {/* Beautiful Curly Black Hair Structure */}
          <g id="doctor-curly-hair">
            <circle cx="560" cy="180" r="42" fill="#201511" />
            <circle cx="530" cy="155" r="28" fill="#201511" />
            <circle cx="590" cy="155" r="28" fill="#201511" />
            <circle cx="510" cy="190" r="26" fill="#201511" />
            <circle cx="610" cy="190" r="26" fill="#201511" />
            <circle cx="520" cy="225" r="26" fill="#201511" />
            <circle cx="600" cy="225" r="26" fill="#201511" />
            {/* Added texture/curls locks overlay */}
            <circle cx="545" cy="140" r="16" fill="#201511" />
            <circle cx="575" cy="140" r="16" fill="#201511" />
          </g>

          {/* B. Head & Face Profile */}
          <path
            d="M 524 185 
               C 524 170, 534 160, 549 160 
               C 564 160, 574 170, 574 185 
               C 574 200, 564 216, 549 216 
               C 534 216, 524 200, 524 185 Z"
            fill="#723D26"
          />
          {/* Big Stylish Earring */}
          <circle cx="574" cy="188" r="7" fill="#723D26" />
          <circle cx="576" cy="195" r="8" fill="#FFFFFF" /> {/* Elegant white hoop pearl earring */}

          {/* Facial Features */}
          <path d="M 533 182 Q 539 178 543 183" stroke="#201511" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 530 176 Q 539 171 545 176" stroke="#201511" strokeWidth="2" strokeLinecap="round" />
          <path d="M 533 201 Q 539 205 545 200" stroke="#201511" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* C. Clean White Medical Lab Coat and Inner Blue Apparel */}
          {/* Inner turquoise shirt */}
          <path
            d="M 525 240 L 565 240 L 555 310 L 530 310 Z"
            fill="#0D86C2"
          />
          {/* Stethoscope neck tubes (drape behind lab coat) */}
          <path
            d="M 515 245
               C 505 285, 520 340, 545 340
               C 570 340, 585 285, 580 245"
            fill="none"
            stroke="#475569"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Doctor main white jacket torso */}
          <path
            d="M 480 340 
               C 485 295, 510 260, 525 255 
               C 535 250, 545 260, 550 270 
               C 555 260, 565 250, 575 255 
               C 590 260, 615 295, 620 340 
               L 630 460 
               C 630 500, 610 520, 550 520 
               C 490 520, 480 500, 480 460 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2"
          />

          {/* Elegant Jacket collars (Left & Right detailed flaps) */}
          <path
            d="M 520 255 L 532 290 L 515 320"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M 580 255 L 568 290 L 585 320"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner blue neck tie/decor */}
          <path d="M 545 290 L 555 290 L 550 350 Z" fill="#0E7EB6" />

          {/* D. Elegant Stethoscope Details */}
          <g id="stethoscope-chestpiece">
            {/* Silver metal connector and diaphragm */}
            <circle cx="560" cy="318" r="8.5" fill="#64748B" />
            <circle cx="560" cy="318" r="5.5" fill="#94A3B8" />
            {/* Tube branch connecting to diaphragm */}
            <path
              d="M 545 315 Q 552 318 560 318"
              stroke="#475569"
              strokeWidth="4"
              fill="none"
            />
          </g>

          {/* E. Hand holding medical document / book (Right arm structure) */}
          <g id="doctor-right-arm-and-book">
            {/* White Coat Sleeve */}
            <path
              d="M 590 295
                 C 625 310, 650 345, 640 405"
              stroke="#FFFFFF"
              strokeWidth="19"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sleeve shadow cuff */}
            <path
              d="M 640 380 Q 645 392 630 398"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            
            {/* Hand skin */}
            <path
              d="M 625 400 C 625 415, 645 425, 655 420"
              stroke="#723D26"
              strokeWidth="15"
              strokeLinecap="round"
            />

            {/* OPENED MEDICAL BOOK (Visual focal element) */}
            <g id="medical-book" transform="translate(520, 332) rotate(-8)">
              {/* Cover (Ocean blue) */}
              <path
                d="M 120 40 
                   Q 150 48, 180 32 
                   V 92 
                   Q 150 108, 120 100 
                   V 40 Z"
                fill="#009BD6"
                stroke="#0086BA"
                strokeWidth="1.5"
              />
              <path
                d="M 120 40 
                   Q 90 48, 60 32 
                   V 92 
                   Q 90 108, 120 100 
                   V 40 Z"
                fill="#009BD6"
                stroke="#0086BA"
                strokeWidth="1.5"
              />

              {/* White pages layers */}
              <path
                d="M 120 37 
                   Q 148 44, 177 29 
                   V 86 
                   Q 148 101, 120 94 
                   V 37 Z"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
              <path
                d="M 120 37 
                   Q 92 44, 63 29 
                   V 86 
                   Q 92 101, 120 94 
                   V 37 Z"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />

              {/* Text lines/prescription charts on pages */}
              <path d="M 75 42 H 105" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 70 52 H 110" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <path d="M 70 62 H 100" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <path d="M 72 72 H 95" stroke="#009BD6" strokeWidth="2" strokeLinecap="round" />

              <path d="M 135 42 H 165" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 130 52 H 170" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <path d="M 130 62 H 160" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <path d="M 132 72 H 168" stroke="#0E7EB6" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Doctor's thumb holding page down */}
            <path
              d="M 648 402 C 642 402, 634 398, 634 393 C 634 388, 646 388, 648 393 Z"
              fill="#723D26"
            />
          </g>

          {/* F. Explaining/Gesturing Arm structure (Left arm structure) */}
          <g id="doctor-left-arm-gesture">
            {/* Upper white sleeve extending leftwards */}
            <path
              d="M 505 305
                 C 460 320, 410 330, 370 300"
              stroke="#FFFFFF"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Gesture Hand skin pointing gently to patient */}
            <path
              d="M 370 300
                 C 358 290, 335 270, 325 285
                 C 315 295, 335 315, 350 315
                 C 358 315, 365 310, 370 300 Z"
              fill="#723D26"
            />

            {/* Raised pointing explanation fingers */}
            {/* Index finger */}
            <path
              d="M 334 278
                 Q 322 265 320 268
                 Q 318 272 330 282"
              stroke="#723D26"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Middle finger */}
            <path
              d="M 338 281
                 Q 325 271 323 275
                 Q 320 280 332 288"
              stroke="#723D26"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Ring finger */}
            <path
              d="M 342 286
                 Q 330 278 328 282
                 Q 325 286 336 294"
              stroke="#723D26"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </g>

      </g>
    </svg>
  );
}
