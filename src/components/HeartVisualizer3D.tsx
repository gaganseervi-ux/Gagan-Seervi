import React, { useState, useEffect, useRef } from "react";
import { Heart, Activity, Play, Pause, Zap, Eye, RotateCcw, Volume2, VolumeX, ShieldAlert, BadgeInfo } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  r: number;
  progress: number;
  speed: number;
  type: "oxygenated" | "deoxygenated";
  bezierID: number;
}

export default function HeartVisualizer3D() {
  // Simulator Parameters
  const [bpm, setBpm] = useState<number>(72);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewAngle, setViewAngle] = useState<"anterior" | "posterior" | "interior">("anterior");
  const [showHudOverlay, setShowHudOverlay] = useState<boolean>(true);
  const [bloodVelocity, setBloodVelocity] = useState<number>(1.2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [cardiacCondition, setCardiacCondition] = useState<"healthy" | "tachycardia" | "bradycardia" | "arrhythmia">("healthy");
  const [adrenalineLevel, setAdrenalineLevel] = useState<number>(0);
  const [activeValveState, setActiveValveState] = useState<"open" | "closed">("closed");

  // Canvas Refs
  const heartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation values computed on the fly
  const contractionProgressRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const ecgHistoryRef = useRef<number[]>(new Array(200).fill(100));
  const ecgIndexRef = useRef<number>(0);

  // Sound Synth Generator
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play heart sound
  const playHeartSound = (isLubb: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(isLubb ? 55 : 45, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + (isLubb ? 0.15 : 0.2));

      gainNode.gain.setValueAtTime(isLubb ? 0.25 : 0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isLubb ? 0.15 : 0.2));

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isLubb ? 0.15 : 0.2));
    } catch (e) {
      console.warn("Audio Context could not resolve:", e);
    }
  };

  // Trigger Adrenaline Spike
  const handleAdrenalineBoost = () => {
    setAdrenalineLevel((prev) => Math.min(prev + 40, 100));
    setBpm((prev) => Math.min(prev + 35, 175));
    if (cardiacCondition === "healthy") {
      setCardiacCondition("tachycardia");
    }
    // Slowly decay adrenaline over time
  };

  // Decay loop for Adrenaline
  useEffect(() => {
    const timer = setInterval(() => {
      setAdrenalineLevel((prev) => {
        if (prev <= 1) return 0;
        return prev - 2;
      });
      // Gently drift back default BPM
      setBpm((prev) => {
        if (prev > 75) return Math.max(prev - 0.5, 72);
        if (prev < 68) return Math.min(prev + 0.5, 72);
        return prev;
      });
      // Reset condition if needed
      setCardiacCondition((prevCond) => {
        if (adrenalineLevel < 10 && prevCond === "tachycardia") {
          return "healthy";
        }
        return prevCond;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adrenalineLevel]);

  // Adjust simulator parameters according to chosen diagnostic scenario
  useEffect(() => {
    if (cardiacCondition === "healthy") {
      setBpm(72);
      setBloodVelocity(1.1);
    } else if (cardiacCondition === "tachycardia") {
      setBpm(135);
      setBloodVelocity(2.2);
    } else if (cardiacCondition === "bradycardia") {
      setBpm(42);
      setBloodVelocity(0.65);
    } else if (cardiacCondition === "arrhythmia") {
      setBpm(88);
      setBloodVelocity(1.1);
    }
  }, [cardiacCondition]);

  // Seed Particles on Paths
  // Bezier paths representing pathways through the heart
  // Type 1: Superior/Inferior Vena Cava -> Right Atrium -> Right Ventricle -> Pulmonary Artery (Blue blood, Deoxygenated)
  // Type 2: Pulmonary Veins -> Left Atrium -> Left Ventricle -> Aortic Arch -> Out of System (Red blood, Oxygenated)
  const paths = {
    deoxygenated: [
      // Vena cava -> RA -> RV -> Pulmonary Art
      [
        { x: 140, y: 350 }, // Inferior Vena Cava input
        { x: 150, y: 220 }, // Right Atrium
        { x: 175, y: 240 }, // Right Ventricle
        { x: 185, y: 155 }, // Pulmonary Valve
        { x: 215, y: 100 }, // Pulmonary Artery branch L
      ],
      [
        { x: 155, y: 50 },  // Superior Vena Cava entry
        { x: 150, y: 200 }, // Right Atrium
        { x: 180, y: 260 }, // Right Ventricle
        { x: 190, y: 130 }, // Pulmonary Trunk
        { x: 110, y: 105 }, // Pulmonary Artery branch R
      ]
    ],
    oxygenated: [
      // Pulmonary veins -> LA -> LV -> Aorta
      [
        { x: 260, y: 185 }, // Pulmonary Vein
        { x: 250, y: 215 }, // Left Atrium
        { x: 225, y: 285 }, // Left Ventricle
        { x: 215, y: 180 }, // Aortic Valve
        { x: 200, y: 65 },  // Top of Aortic Arch
        { x: 190, y: 5 },   // Carotid Branch Out
      ],
      [
        { x: 280, y: 205 }, // PV 2
        { x: 250, y: 215 }, // Left Atrium
        { x: 220, y: 300 }, // Left Ventricle
        { x: 215, y: 180 }, // Aortic Valve
        { x: 220, y: 65 },  // Aortic peak L
        { x: 265, y: 70 },  // Subclavian Branch Out
      ]
    ]
  };

  // Helper to interpolate Bezier curves for smooth animation
  const getBezierPoint = (pts: { x: number; y: number }[], t: number) => {
    if (pts.length === 5) {
      // 4th order Bezier calculation
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const mt4 = mt3 * mt;
      const t2 = t * t;
      const t3 = t2 * t;
      const t4 = t3 * t;

      return {
        x: mt4 * pts[0].x + 4 * mt3 * t * pts[1].x + 6 * mt2 * t2 * pts[2].x + 4 * mt * t3 * pts[3].x + t4 * pts[4].x,
        y: mt4 * pts[0].y + 4 * mt3 * t * pts[1].y + 6 * mt2 * t2 * pts[2].y + 4 * mt * t3 * pts[3].y + t4 * pts[4].y,
      };
    } else {
      // 5th order/General Fallback split
      const n = pts.length - 1;
      let x = 0;
      let y = 0;
      const bernstein = (i: number, n: number, t: number) => {
        const fact = (num: number): number => (num <= 1 ? 1 : num * fact(num - 1));
        const comb = fact(n) / (fact(i) * fact(n - i));
        return comb * Math.pow(t, i) * Math.pow(1 - t, n - i);
      };

      for (let i = 0; i <= n; i++) {
        const b = bernstein(i, n, t);
        x += pts[i].x * b;
        y += pts[i].y * b;
      }
      return { x, y };
    }
  };

  // Simulation and Rendering loops
  useEffect(() => {
    const canvas = heartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Rescale to fit high DPI displays crispness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();
    let beatTimer = 0;
    let isContractionTriggered = false;

    // Initialize initial particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 45; i++) {
        const isOxygenated = Math.random() > 0.45;
        const type = isOxygenated ? "oxygenated" : "deoxygenated";
        const matchedPaths = paths[type];
        const pathIndex = Math.floor(Math.random() * matchedPaths.length);
        particlesRef.current.push({
          x: 0,
          y: 0,
          r: Math.random() * 2.2 + 1.8,
          progress: Math.random(), // disperse along curve
          speed: (Math.random() * 0.003 + 0.002) * bloodVelocity,
          type,
          bezierID: pathIndex,
        });
      }
    }

    const drawSimulation = (time: number) => {
      if (!isPlaying) {
        lastTime = time;
        animationFrameId.current = requestAnimationFrame(drawSimulation);
        return;
      }

      const delta = time - lastTime;
      lastTime = time;

      // Handle the beating cycle
      const cycleLengthMs = (60 / bpm) * 1000;
      beatTimer += delta;

      // Pulse calculations (Systole & Diastole cycles)
      if (beatTimer >= cycleLengthMs) {
        beatTimer = 0;
        isContractionTriggered = false;
      }

      // Systole starts mid cycle
      const phaseRatio = beatTimer / cycleLengthMs;
      let scaleOffset = 1.0;
      let pulseIntensity = 0;

      // Cardiac rhythm modeling
      if (phaseRatio < 0.2) {
        // Atrial systole (minor squeeze)
        scaleOffset = 1.0 - phaseRatio * 0.12;
        pulseIntensity = phaseRatio * 5;
        setActiveValveState("closed");
      } else if (phaseRatio >= 0.25 && phaseRatio < 0.5) {
        // Ventricular systole (major contraction stroke - LUBB)
        const systoleRatio = (phaseRatio - 0.25) / 0.25;
        scaleOffset = 0.88 + systoleRatio * 0.14;
        pulseIntensity = (1.0 - systoleRatio) * 16;
        setActiveValveState("open");

        if (!isContractionTriggered && systoleRatio > 0.05) {
          isContractionTriggered = true;
          playHeartSound(true); // LUBB sound
          // dispatch a pulse of particles
          particlesRef.current.forEach((p) => {
            if (p.progress < 0.3) {
              p.progress += 0.15; // fast boost
            }
          });
        }
      } else if (phaseRatio >= 0.5 && phaseRatio < 0.65) {
        // Isovolumetric relaxation - DUPP
        const diastoleRatio = (phaseRatio - 0.5) / 0.15;
        scaleOffset = 1.02 - diastoleRatio * 0.02;
        pulseIntensity = diastoleRatio * 6;
        if (isContractionTriggered && diastoleRatio > 0.05 && diastoleRatio < 0.25) {
          playHeartSound(false); // DUPP sound
        }
      } else {
        // Diastole (filling phase)
        scaleOffset = 1.0;
        pulseIntensity = 0;
        setActiveValveState("closed");
      }

      contractionProgressRef.current = scaleOffset;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save view context
      ctx.save();
      
      // Center and fit simulation scale coordinates
      const scaleX = canvas.clientWidth / 400;
      const scaleY = canvas.clientHeight / 400;
      ctx.scale(scaleX, scaleY);

      // Rotate slightly based on viewing state to model genuine 3D spatial rotation
      ctx.translate(200, 200);
      if (viewAngle === "posterior") {
        ctx.scale(-1, 1); // Flip posterior horizontally for real back-side perspective
        ctx.rotate(-0.06);
      } else if (viewAngle === "interior") {
        ctx.rotate(0.04);
      } else {
        ctx.rotate(-0.04);
      }
      ctx.translate(-200, -200);

      // Apply pulsing dynamic scale around heart anatomical centroid (200, 240)
      ctx.translate(200, 240);
      ctx.scale(scaleOffset, scaleOffset);
      ctx.translate(-200, -240);

      // Draw Anatomical Elements with custom shader-style linear/radial gradients
      // 1. Pulmonary Artery trunk & Pulmonary Veins (Background structural layers)
      const blueTrunkGrad = ctx.createLinearGradient(120, 80, 240, 180);
      blueTrunkGrad.addColorStop(0, "#1E3A8A");
      blueTrunkGrad.addColorStop(0.5, "#0D9488");
      blueTrunkGrad.addColorStop(1, "#111827");

      ctx.beginPath();
      ctx.moveTo(150, 140);
      ctx.bezierCurveTo(150, 80, 200, 70, 220, 110);
      ctx.bezierCurveTo(230, 130, 235, 150, 200, 180);
      ctx.bezierCurveTo(170, 160, 160, 150, 150, 140);
      ctx.fillStyle = blueTrunkGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.stroke();

      // Horizontal branches of Pulmonary Artery
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(80, 100, 100, 16);
      ctx.fillRect(220, 105, 90, 16);

      // 2. Aorta Arch (Deep Red/Crimson curves flowing back to down)
      const aortaGrad = ctx.createLinearGradient(170, 30, 260, 200);
      aortaGrad.addColorStop(0, "#EF4444");
      aortaGrad.addColorStop(0.3, "#B91C1C);"); // darker red
      aortaGrad.addColorStop(1, "#310505");

      ctx.beginPath();
      ctx.moveTo(170, 160);
      ctx.bezierCurveTo(160, 90, 180, 40, 220, 40);
      ctx.bezierCurveTo(255, 40, 270, 80, 265, 140);
      ctx.bezierCurveTo(255, 140, 240, 110, 225, 95);
      ctx.bezierCurveTo(210, 80, 190, 90, 190, 160);
      ctx.closePath();
      ctx.fillStyle = aortaGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.stroke();

      // Top carotid arteries issuing from aorta (3 glowing pipes at the crest)
      const drawPipes = (x: number, y: number, r: number) => {
        ctx.fillStyle = "#DC2626";
        ctx.fillRect(x, y, 10, -50);
        ctx.beginPath();
        ctx.arc(x + 5, y - 50, 5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawPipes(192, 45, -45);
      drawPipes(212, 41, -47);
      drawPipes(230, 45, -43);

      // 3. Right & Left Atrium (Upper heart chambers)
      const raGrad = ctx.createRadialGradient(150, 190, 15, 140, 210, 50);
      raGrad.addColorStop(0, "#3B82F6");
      raGrad.addColorStop(0.6, "#1D4ED8");
      raGrad.addColorStop(1, "#1E1B4B");

      ctx.beginPath();
      ctx.arc(145, 205, 36, 0, Math.PI * 2);
      ctx.fillStyle = raGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();

      const laGrad = ctx.createRadialGradient(250, 190, 15, 255, 210, 45);
      laGrad.addColorStop(0, "#EF4444");
      laGrad.addColorStop(0.6, "#991B1B");
      laGrad.addColorStop(1, "#450A0A");

      ctx.beginPath();
      ctx.arc(252, 205, 34, 0, Math.PI * 2);
      ctx.fillStyle = laGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();

      // 4. Ventricles (Primary anatomical heart mass block)
      const ventricleGrad = ctx.createRadialGradient(195, 290, 20, 200, 310, 110);
      if (viewAngle === "interior") {
        // Show inner chambers, valves and cardiac septum
        ventricleGrad.addColorStop(0, "#451A03"); // woody interior tissue
        ventricleGrad.addColorStop(0.5, "#B45309"); // orange brown
        ventricleGrad.addColorStop(1, "#1E1B4B");
      } else {
        ventricleGrad.addColorStop(0, "#EF4444");
        ventricleGrad.addColorStop(0.4, "#991B1B");
        ventricleGrad.addColorStop(0.8, "#450A0A");
        ventricleGrad.addColorStop(1, "#030712");
      }

      ctx.beginPath();
      // Muscle structure / pear shape representing the ventricles meeting at the apex
      ctx.moveTo(130, 220);
      ctx.bezierCurveTo(80, 240, 110, 380, 195, 395); // Apex of the heart (tip pointing down)
      ctx.bezierCurveTo(250, 385, 310, 330, 275, 220);
      ctx.bezierCurveTo(240, 240, 160, 240, 130, 220);
      ctx.closePath();
      ctx.fillStyle = ventricleGrad;
      ctx.fill();
      
      // Outer light glowing anatomical outlines simulating 3D specular highlight
      const apexOutlineGrad = ctx.createLinearGradient(100, 240, 280, 395);
      apexOutlineGrad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
      apexOutlineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
      apexOutlineGrad.addColorStop(1, "rgba(79, 70, 229, 0.15)");
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = apexOutlineGrad;
      ctx.stroke();

      // 5. Coronary blood vessels (The dynamic branch tree across the surface of the heart)
      if (viewAngle !== "interior") {
        ctx.beginPath();
        // Main left coronary artery (shining crimson/gold)
        ctx.moveTo(205, 235);
        ctx.bezierCurveTo(195, 270, 205, 310, 192, 345);
        ctx.bezierCurveTo(190, 355, 196, 370, 195, 390);
        ctx.strokeStyle = "#F59E0B"; // bright orange gold
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Right coronary artery branches
        ctx.beginPath();
        ctx.moveTo(170, 232);
        ctx.bezierCurveTo(155, 255, 140, 270, 125, 290);
        ctx.moveTo(150, 262);
        ctx.bezierCurveTo(140, 290, 130, 305, 112, 330);
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Left anterior descending capillaries
        ctx.beginPath();
        ctx.moveTo(200, 260);
        ctx.bezierCurveTo(215, 280, 240, 295, 255, 315);
        ctx.moveTo(212, 300);
        ctx.bezierCurveTo(225, 318, 235, 340, 242, 362);
        ctx.strokeStyle = "#3B82F6"; // deoxygenated veins overlay
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      // 6. Draw Valve status & Septum if view is interior
      if (viewAngle === "interior") {
        // Septum wall down the middle
        ctx.beginPath();
        ctx.moveTo(195, 238);
        ctx.bezierCurveTo(205, 270, 200, 340, 195, 395);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(100,20,20,0.85)";
        ctx.stroke();

        // VALVULAR SIMULATION MECHANICS overlay
        // Tricuspid Valve (L) & Mitral Valve (R) lines
        ctx.beginPath();
        if (activeValveState === "open") {
          // Open leaves vertical representation
          ctx.moveTo(145, 230); ctx.lineTo(145, 245);
          ctx.moveTo(252, 230); ctx.lineTo(252, 245);
        } else {
          // Horizontal sealing line representation
          ctx.moveTo(125, 236); ctx.lineTo(165, 236);
          ctx.moveTo(232, 236); ctx.lineTo(272, 236);
        }
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#FCD34D"; // glowing valve fiber
        ctx.stroke();

        // Mitral / Tricuspid annotations
        if (showHudOverlay) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.font = "bold 7px monospace";
          ctx.fillText("TRICUSPID VALVE", 110, 226);
          ctx.fillText("MITRAL VALVE", 225, 226);
        }
      }

      // Reset dynamic translation
      ctx.restore();

      // 7. Render flowing Blood Particles along preset paths
      particlesRef.current.forEach((p) => {
        // Speed scaling
        p.progress += p.speed * bloodVelocity;
        if (p.progress >= 1.0) {
          p.progress = 0; // restart curve loop
          // Randomize branch trajectory slightly to keep look varied
          const matchedPaths = paths[p.type];
          p.bezierID = Math.floor(Math.random() * matchedPaths.length);
        }

        const pts = paths[p.type][p.bezierID];
        const coord = getBezierPoint(pts, p.progress);

        // Render point with custom oxygen status colors
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, p.r, 0, Math.PI * 2);
        
        if (p.type === "oxygenated") {
          const particleGrad = ctx.createRadialGradient(coord.x, coord.y, 0, coord.x, coord.y, p.r);
          particleGrad.addColorStop(0, "#FFFFFF");
          particleGrad.addColorStop(0.3, "#F87171"); // glowing red
          particleGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
          ctx.fillStyle = particleGrad;
        } else {
          const particleGrad = ctx.createRadialGradient(coord.x, coord.y, 0, coord.x, coord.y, p.r);
          particleGrad.addColorStop(0, "#FFFFFF");
          particleGrad.addColorStop(0.3, "#60A5FA"); // glowing blue
          particleGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
          ctx.fillStyle = particleGrad;
        }
        ctx.fill();

        // Specular glow ring for high-velocity blood flow cells
        if (bloodVelocity > 1.4) {
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, p.r * 1.8, 0, Math.PI * 2);
          ctx.strokeStyle = p.type === "oxygenated" ? "rgba(239, 68, 68, 0.15)" : "rgba(37, 99, 235, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 8. HUD Overlay elements (Glow grid, tags, labels, and mechanical values)
      if (showHudOverlay) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        // Drawing Grid Lines
        for (let x = 0; x < 400; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
        }
        for (let y = 0; y < 400; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(400, y); ctx.stroke();
        }

        // Draw crosshair/reticle focusing center anatomical coordinates
        ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
        ctx.beginPath();
        ctx.arc(200, 240, 160, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
        ctx.beginPath();
        ctx.arc(200, 240, 164, 0, Math.PI * 2);
        ctx.stroke();

        // Angle Corner Marks
        const drawAngleCorner = (x: number, y: number, length: number, sx: number, sy: number) => {
          ctx.beginPath();
          ctx.moveTo(x, y + length * sy);
          ctx.lineTo(x, y);
          ctx.lineTo(x + length * sx, y);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        };
        drawAngleCorner(10, 10, 15, 1, 1);
        drawAngleCorner(390, 10, 15, -1, 1);
        drawAngleCorner(10, 390, 15, 1, -1);
        drawAngleCorner(390, 390, 15, -1, -1);

        // Display current angle HUD text
        ctx.fillStyle = "#A7F3D0"; // soft lime green
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillText(`CAM_FEED: ${viewAngle.toUpperCase()} VIEW`, 20, 28);
        ctx.fillText(`C_BOOST: ${adrenalineLevel > 0 ? `ZAP ${adrenalineLevel}%` : "OFFLINE"}`, 20, 42);

        // Interactive status variables inside graphics
        ctx.fillStyle = "rgba(156, 163, 175, 0.75)";
        ctx.fillText(`APEX_CONTRACTION: ${(1 - contractionProgressRef.current).toFixed(3)} V_PULSE`, 245, 375);
        ctx.fillText(`VALVE_GATE: ${activeValveState === "open" ? "SYSTOLE" : "DIASTOLE"}`, 245, 387);

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(drawSimulation);
    };

    animationFrameId.current = requestAnimationFrame(drawSimulation);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [bpm, isPlaying, viewAngle, bloodVelocity, soundEnabled, showHudOverlay, cardiacCondition, adrenalineLevel, activeValveState]);

  // Synchronous Electrocardiogram (ECG) waveform logic
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fix high DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    let sweepIndex = 0;
    const history = ecgHistoryRef.current;

    const drawEcg = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint background grid
      ctx.strokeStyle = "rgba(244, 63, 94, 0.04)"; // soft pink grids
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.clientWidth; x += 15) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.clientHeight); ctx.stroke();
      }
      for (let y = 0; y < canvas.clientHeight; y += 15) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.clientWidth, y); ctx.stroke();
      }

      // Compute dynamic ECG points representing real cardiac sequence:
      // P wave (atrial squeeze) -> QRS complex (ventricular firing) -> T wave (relaxation)
      const bpmInterval = Math.floor(3600 / bpm); // sweep speeds
      const pulsePhase = sweepIndex % bpmInterval;

      let baseline = canvas.clientHeight / 2;
      let targetValue = baseline;

      // ECG wave structures formula modeling
      if (pulsePhase > 0 && pulsePhase <= 6) {
        // P-wave (auricular contraction)
        const progress = pulsePhase / 6;
        targetValue = baseline - Math.sin(progress * Math.PI) * 7;
      } else if (pulsePhase > 12 && pulsePhase <= 15) {
        // Q-wave (minimal dip)
        targetValue = baseline + 6;
      } else if (pulsePhase > 15 && pulsePhase <= 20) {
        // R-wave (Tall peak QRS!)
        const progress = (pulsePhase - 15) / 5;
        targetValue = baseline - Math.sin(progress * Math.PI) * 58;
      } else if (pulsePhase > 20 && pulsePhase <= 24) {
        // S-wave (Deep drop)
        const progress = (pulsePhase - 20) / 4;
        targetValue = baseline + Math.sin(progress * Math.PI) * 16;
      } else if (pulsePhase > 30 && pulsePhase <= 42) {
        // T-wave (slow recovery bump)
        const progress = (pulsePhase - 30) / 12;
        targetValue = baseline - Math.sin(progress * Math.PI) * 11;
      } else if (cardiacCondition === "arrhythmia" && pulsePhase > 50 && pulsePhase < 58) {
        // Premature ventricular contraction (PVC) twitch for arrhythmia diagnostics
        const progress = (pulsePhase - 50) / 8;
        targetValue = baseline - Math.sin(progress * Math.PI) * 18;
      }

      // Push and shift history array
      history.push(targetValue);
      if (history.length > canvas.clientWidth) {
        history.shift();
      }

      // Draw Wave Path
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = cardiacCondition === "healthy" 
        ? "#10B981" // emerald green
        : cardiacCondition === "arrhythmia" 
        ? "#F59E0B" // caution amber
        : "#EF4444"; // extreme red tachycardia / warning bradycardia
      
      // Dynamic neon shadows
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.strokeStyle as string;

      for (let i = 0; i < history.length; i++) {
        if (i === 0) {
          ctx.moveTo(i, history[i]);
        } else {
          ctx.lineTo(i, history[i]);
        }
      }
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw sweeping dot cursor representing heart rate telemetry sweeps
      const currentX = history.length - 1;
      ctx.beginPath();
      ctx.arc(currentX, history[currentX], 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      sweepIndex++;
      requestAnimationFrame(drawEcg);
    };

    const animId = requestAnimationFrame(drawEcg);
    return () => cancelAnimationFrame(animId);
  }, [bpm, cardiacCondition]);

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-5 lg:p-7 shadow-2xl border border-slate-850 space-y-6 relative overflow-hidden font-sans">
      
      {/* 1. Header Information & HUD Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <h3 className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              3D Cardiac Diagnostic Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans font-medium">
            Real-time anatomical heart modeling, hemodynamic blood flow, and ECG wave telemetry metrics.
          </p>
        </div>

        {/* Diagnostic Simulator Pre-sets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCardiacCondition("healthy")}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] sm:text-xs transition-all uppercase tracking-wide cursor-pointer ${cardiacCondition === "healthy" ? "bg-emerald-600 text-white shadow shadow-emerald-500/20" : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850"}`}
          >
            Healthy Core
          </button>
          <button
            onClick={() => setCardiacCondition("tachycardia")}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] sm:text-xs transition-all uppercase tracking-wide cursor-pointer ${cardiacCondition === "tachycardia" ? "bg-rose-600 text-white shadow shadow-rose-500/20" : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850"}`}
          >
            Tachycardia
          </button>
          <button
            onClick={() => setCardiacCondition("bradycardia")}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] sm:text-xs transition-all uppercase tracking-wide cursor-pointer ${cardiacCondition === "bradycardia" ? "bg-cyan-600 text-white shadow shadow-cyan-500/20" : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850"}`}
          >
            Bradycardia
          </button>
          <button
            onClick={() => setCardiacCondition("arrhythmia")}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] sm:text-xs transition-all uppercase tracking-wide cursor-pointer ${cardiacCondition === "arrhythmia" ? "bg-amber-600 text-white shadow shadow-amber-500/20" : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850"}`}
          >
            Arrhythmia
          </button>
        </div>
      </div>

      {/* 2. Primary 3D Canvas Screen Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: 3D Visualization Area */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-900 p-4 relative flex flex-col items-center justify-center min-h-[420px] select-none shadow-inner group">
          
          {/* Speckled high-tech HUD grid markings */}
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 flex gap-4">
            <span>AZIMUTH: +34°</span>
            <span>ELEVATION: -12°</span>
            <span>ZOOM: 1.0X</span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowHudOverlay(!showHudOverlay)}
              className="p-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 text-[10px] font-mono font-bold uppercase transition-all"
              title="Toggle Telemetry Grid Overlay"
            >
              {showHudOverlay ? "HUD ON" : "HUD OFF"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded border text-[10px] font-mono font-bold uppercase transition-all ${soundEnabled ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-slate-950 border-slate-850 text-slate-400"}`}
              title="Generate contraction audio"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* THE 3D CANVAS */}
          <canvas
            ref={heartCanvasRef}
            className="w-full max-w-[360px] h-[360px] cursor-grab active:cursor-grabbing transform group-hover:scale-[1.01] transition-transform duration-500"
          />

          {/* Quick Perspective Views Floating Pill */}
          <div className="absolute bottom-4 bg-slate-950/90 border border-slate-850 rounded-xl p-1 flex items-center gap-1 z-10 backdrop-blur">
            <button
              onClick={() => setViewAngle("anterior")}
              className={`px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold transition-all ${viewAngle === "anterior" ? "bg-slate-850 text-white" : "text-slate-400 hover:text-white"}`}
            >
              ANTERIOR
            </button>
            <button
              onClick={() => setViewAngle("posterior")}
              className={`px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold transition-all ${viewAngle === "posterior" ? "bg-slate-850 text-white" : "text-slate-400 hover:text-white"}`}
            >
              POSTERIOR
            </button>
            <button
              onClick={() => setViewAngle("interior")}
              className={`px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold transition-all ${viewAngle === "interior" ? "bg-amber-600/20 text-amber-500 border border-amber-500/20" : "text-slate-400 hover:text-white"}`}
            >
              CHAMBERS (X-RAY)
            </button>
          </div>
        </div>

        {/* Right Side: Electrocardiogram Monitor, Health metrics info, sliders */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          
          {/* Real-time Scrolling ECG Waveform Telemetry Panel */}
          <div className="bg-slate-955 border border-slate-900 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                ECG Channel I Telemetry
              </span>
              <span className="text-[10px] font-mono bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-300">
                Sweep Mode: 25mm/s
              </span>
            </div>

            <canvas
              ref={ecgCanvasRef}
              className="w-full h-24 bg-slate-950 rounded-xl border border-slate-900 shadow-inner"
            />
          </div>

          {/* Quick Cardiac Telemetry Diagnostics Info Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-1">
              <p className="text-[10px] text-slate-450 font-bold font-mono">CARDIAC OUTPUT</p>
              <p className="font-display font-extrabold text-base text-white">
                {((72 * bpm) / 1000).toFixed(2)} <span className="text-xs font-medium text-slate-400">L / min</span>
              </p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-1">
              <p className="text-[10px] text-slate-455 font-bold font-mono">STROKE VOLUME</p>
              <p className="font-display font-extrabold text-base text-white">
                {adrenalineLevel > 0 ? (72 + adrenalineLevel * 0.2).toFixed(1) : "72.0"}{" "}
                <span className="text-xs font-medium text-slate-400">mL/beat</span>
              </p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-1">
              <p className="text-[10px] text-slate-457 font-bold font-mono">EJECTION FRACTION</p>
              <p className="font-display font-extrabold text-base text-white">
                {cardiacCondition === "healthy" ? "61" : cardiacCondition === "tachycardia" ? "54" : "63"}{" "}
                <span className="text-xs font-medium text-slate-400">%</span>
              </p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-1">
              <p className="text-[10px] text-slate-459 font-bold font-mono">CHAMBER VALVE STATS</p>
              <p className="font-display font-extrabold text-base uppercase text-emerald-400">
                {activeValveState === "open" ? "Systolic Flow" : "Diastolic Fill"}
              </p>
            </div>
          </div>

          {/* Control sliders for interactivity */}
          <div className="space-y-4 bg-slate-900/20 p-4 border border-slate-900 rounded-xl">
            {/* Heart Rate Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Adjust Heart Rate (Myocardial Pulse)</span>
                <span className="text-rose-400 font-mono font-bold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="185"
                value={bpm}
                onChange={(e) => {
                  setBpm(parseInt(e.target.value));
                  if (parseInt(e.target.value) >= 115) {
                    setCardiacCondition("tachycardia");
                  } else if (parseInt(e.target.value) <= 50) {
                    setCardiacCondition("bradycardia");
                  } else {
                    setCardiacCondition("healthy");
                  }
                }}
                className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blood Flow velocity speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Hemodynamic Velocity Ratio</span>
                <span className="text-blue-405 font-mono font-bold">{bloodVelocity.toFixed(2)}x speed</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={bloodVelocity}
                onChange={(e) => setBloodVelocity(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Live Action Simulators: Adrenaline Shot & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdrenalineBoost}
              className="flex-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider relative overflow-hidden active:scale-[0.98] transition-transform shadow-lg shadow-rose-900/20"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Administer Adrenaline Boost</span>
              {adrenalineLevel > 0 && (
                <span className="absolute right-3 bg-black/40 text-[9px] font-mono px-1.5 py-0.5 rounded">
                  {adrenalineLevel}% Active
                </span>
              )}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${isPlaying ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750" : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"}`}
              title={isPlaying ? "Pause cardiological simulation" : "Resume simulation loop"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </button>
          </div>

        </div>

      </div>

      {/* Extreme BPM Warnings banner based on live statistics slider value */}
      {bpm >= 120 && (
        <div className="bg-rose-950/50 border border-rose-900/60 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-rose-300 uppercase tracking-wide">Tachycardia Alert Identified</p>
            <p className="text-slate-400 font-medium">Myocardial firing is elevated beyond threshold limits. Continuous dynamic stroke output requires emergency clinical triage diagnostics.</p>
          </div>
        </div>
      )}

      {bpm <= 48 && (
        <div className="bg-cyan-950/50 border border-cyan-900/60 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <ShieldAlert className="h-5 w-5 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-cyan-300 uppercase tracking-wide">Bradycardia Hazard Detected</p>
            <p className="text-slate-400 font-medium">Slowing cardiac node frequency limits adequate cerebral perfusion coordinates. Administering simulated adrenaline is recommended.</p>
          </div>
        </div>
      )}

    </div>
  );
}
