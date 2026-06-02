import React, { useState, useEffect } from "react";
import { 
  Presentation, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  UserCheck, 
  LogOut, 
  Monitor, 
  Sliders, 
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Plus
} from "lucide-react";
import { initAuth, googleSignIn, logout } from "../lib/firebase";
import type { User } from "firebase/auth";

interface SlideData {
  title: string;
  subtitle: string;
  bullets: string[];
}

export default function HackathonSlides() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [deckTitle, setDeckTitle] = useState("Titan HealthConnect - Hackathon Pitch");
  const [projectPrompt, setProjectPrompt] = useState(
    "Titan HealthConnect: A campus medical ecosystem featuring smart symptom triage, interactive 3D WebGL cardiac monitors, geolocated paramedics coordinate dispatches, and secure payment logs."
  );

  const [slides, setSlides] = useState<SlideData[]>([
    {
      title: "Titan HealthConnect",
      subtitle: "Bridging the Gap in Campus Telemedicine & Emergency Logistics",
      bullets: [
        "Patient-to-practitioner secure consulting portal with online digital records.",
        "WebGL-powered 3D Cardiac active tracker for remote anatomical diagnostics.",
        "Localized SOS dispatches coordinate ambulance transit paths to campus blocks."
      ]
    },
    {
      title: "The Problem",
      subtitle: "Segmented Health Services & Stalled Emergency Response",
      bullets: [
        "Traditional campus health services suffer from slow consulting routing.",
        "Emergency responders lack precise room location guides, losing critical seconds.",
        "Anxiety grows as patients lack instant clinical risk assessment logs."
      ]
    },
    {
      title: "The Solution",
      subtitle: "Real-Time 3D Twins & Instant Critical Triage",
      bullets: [
        "24/7 on-demand Clinical Triage through server-side AI evaluation.",
        "3D real-time anatomical simulations responsive to diagnostic inputs.",
        "Emergency SOS coordinator dispatches with precise building and room tags."
      ]
    },
    {
      title: "Core Technology",
      subtitle: "Dual-Tier Framework Built for Infinite High-Availability",
      bullets: [
        "React-powered responsive interfaces coupled with modern Tailwind CSS animations.",
        "Server-side Gemini 3.5 Flash engine rendering clinical triage diagnostics.",
        "Direct local JSON synchronization layer maintaining continuous offline operation."
      ]
    },
    {
      title: "Market & Impact",
      subtitle: "Shaving Administrative Delay Saves Human Lives",
      bullets: [
        "Targets 5,000+ higher educational institutes globally and student networks.",
        "SaaS model for campus safety monitors and administration analytics.",
        "Secures patient directories, lowering critical diagnostics delays."
      ]
    },
    {
      title: "Milestones & Future",
      subtitle: "Redefining Campus Health with Continuous Monitoring",
      bullets: [
        "Working prototype featuring complete 3D interactive heart visualization.",
        "Future goal: Integrating real-time IoT wearables telemetry syncs.",
        "Deploying clinical decision support micro-services with regional credentials."
      ]
    }
  ]);

  const [selectedTheme, setSelectedTheme] = useState<"midnight" | "alpine" | "editorial">("midnight");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Load auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLogStatus("Starting Secure Sign In via Google...");
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setLogStatus("Authenticated successfully! Ready to generate deck.");
      }
    } catch (err: any) {
      console.error(err);
      setLogStatus(`Sign In Failed: ${err.message || err.toString()}`);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setLogStatus("Signed out successfully.");
  };

  // Run AI Rewrite with Gemini
  const handleAIGenerateCopy = async () => {
    setIsRevising(true);
    setLogStatus("Consulting server-side Gemini 3.5 Flash for pitch deck layout...");
    try {
      const res = await fetch("/api/gemini/pitch-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: projectPrompt })
      });
      if (!res.ok) throw new Error("Could not compute AI copy.");
      const data = await res.json();
      if (data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setLogStatus("Gemini successfully generated premium pitch deck copy below!");
      } else {
        throw new Error("No slide configurations returned.");
      }
    } catch (err: any) {
      alert(`AI computation delayed: Using pre-structured template content. (${err.message})`);
      setLogStatus("Fallback template initialized.");
    } finally {
      setIsRevising(false);
    }
  };

  // Form input checkers
  const handleSlideChange = (slideIdx: number, field: keyof SlideData, value: string) => {
    const updated = [...slides];
    if (field === "bullets") {
      // Bullets has fixed count, but can be updated
    } else {
      (updated[slideIdx] as any)[field] = value;
    }
    setSlides(updated);
  };

  const handleBulletChange = (slideIdx: number, bulletIdx: number, value: string) => {
    const updated = [...slides];
    updated[slideIdx].bullets[bulletIdx] = value;
    setSlides(updated);
  };

  // Create Google Slides
  const generateGoogleDeck = async () => {
    if (!accessToken) {
      alert("Please authenticate using your Google account to authorize slides creation.");
      return;
    }

    setIsGenerating(true);
    setGeneratedUrl(null);
    setLogStatus("Declaring Presentation Title in Google Workspace...");

    try {
      // 1. Create a presentation
      const createRes = await fetch("https://slides.googleapis.com/v1/presentations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: deckTitle
        })
      });

      if (!createRes.ok) {
        const errDetails = await createRes.json().catch(() => ({}));
        throw new Error(errDetails.error?.message || "Google Workspace creation request rejected.");
      }

      const presentation = await createRes.json();
      const presentationId = presentation.presentationId;
      const defaultSlideId = presentation.slides?.[0]?.objectId;

      setLogStatus(`Presentation ID allocated: ${presentationId}. Building 6 slides...`);

      // 2. Define colors and font choices based on theme selection
      const themeConfigs = {
        midnight: {
          bg: { rgbColor: { red: 0.06, green: 0.09, blue: 0.16 } }, // #0f172a
          titleRgb: { red: 1.0, green: 1.0, blue: 1.0 }, // #ffffff
          subtitleRgb: { red: 0.12, green: 0.8, blue: 0.6 }, // #10b981 (emerald)
          bulletsRgb: { red: 0.6, green: 0.65, blue: 0.75 }, // #94a3b8
          accentRgb: { red: 0.12, green: 0.8, blue: 0.6 }, // #10b981
          fonts: { title: "Trebuchet MS", body: "Arial" }
        },
        alpine: {
          bg: { rgbColor: { red: 0.95, green: 0.97, blue: 0.99 } }, // #f0f9ff
          titleRgb: { red: 0.06, green: 0.09, blue: 0.16 }, // #0f172a
          subtitleRgb: { red: 0.14, green: 0.45, blue: 0.85 }, // #2563eb (brand royal blue)
          bulletsRgb: { red: 0.25, green: 0.32, blue: 0.44 }, // #374151
          accentRgb: { red: 0.14, green: 0.45, blue: 0.85 }, 
          fonts: { title: "Arial", body: "Calibri" }
        },
        editorial: {
          bg: { rgbColor: { red: 0.98, green: 0.97, blue: 0.96 } }, // #faf8f5
          titleRgb: { red: 0.16, green: 0.15, blue: 0.14 }, // #292524
          subtitleRgb: { red: 0.76, green: 0.3, blue: 0.1 }, // #c2410c terracotta
          bulletsRgb: { red: 0.35, green: 0.33, blue: 0.3 }, // #57534e
          accentRgb: { red: 0.76, green: 0.3, blue: 0.1 },
          fonts: { title: "Georgia", body: "Georgia" }
        }
      };

      const theme = themeConfigs[selectedTheme];

      // 3. Construct individual slide component requests
      const requests: any[] = [];

      slides.forEach((slide, idx) => {
        const slideId = `slide_deck_${idx}_${Date.now()}`;
        const titleId = `title_box_${idx}_${Date.now()}`;
        const subtitleId = `sub_box_${idx}_${Date.now()}`;
        const bulletsId = `bullet_box_${idx}_${Date.now()}`;
        const accentId = `decor_banner_${idx}_${Date.now()}`;

        // Create the slide
        requests.push({
          createSlide: {
            objectId: slideId,
            insertionIndex: idx,
            slideLayoutReference: { predefinedLayout: "BLANK" }
          }
        });

        // Set slide background color property
        requests.push({
          updatePageProperties: {
            objectId: slideId,
            pageProperties: {
              pageBackgroundFill: {
                solidFill: { color: theme.bg }
              }
            },
            fields: "pageBackgroundFill"
          }
        });

        // Add a design accent banner shape
        requests.push({
          createShape: {
            objectId: accentId,
            shapeType: "RECTANGLE",
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 720, unit: "PT" },
                height: { magnitude: 8, unit: "PT" }
              },
              transform: {
                scaleX: 1, scaleY: 1,
                translateX: 0, translateY: 0,
                unit: "PT"
              }
            }
          }
        });

        // Color the banner outline and fill
        requests.push({
          updateShapeProperties: {
            objectId: accentId,
            shapeProperties: {
              shapeBackgroundFill: {
                solidFill: { color: { opaqueColor: { rgbColor: theme.accentRgb } } }
              },
              outline: {
                outlineFill: {
                  solidFill: { color: { opaqueColor: { rgbColor: theme.accentRgb } } }
                }
              }
            },
            fields: "shapeBackgroundFill,outline"
          }
        });

        // Create Title Text Box
        requests.push({
          createShape: {
            objectId: titleId,
            shapeType: "TEXT_BOX",
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 620, unit: "PT" },
                height: { magnitude: 80, unit: "PT" }
              },
              transform: {
                scaleX: 1, scaleY: 1,
                translateX: 50, translateY: 45,
                unit: "PT"
              }
            }
          }
        });

        // Fill Title Text Content
        requests.push({
          insertText: {
            objectId: titleId,
            text: slide.title,
            insertionIndex: 0
          }
        });

        // Style Title Font Typography
        requests.push({
          updateTextStyle: {
            objectId: titleId,
            style: {
              fontFamily: theme.fonts.title,
              fontSize: { magnitude: 26, unit: "PT" },
              bold: true,
              foregroundColor: { opaqueColor: { rgbColor: theme.titleRgb } }
            },
            fields: "fontFamily,fontSize,bold,foregroundColor"
          }
        });

        // Create Subtitle Box
        requests.push({
          createShape: {
            objectId: subtitleId,
            shapeType: "TEXT_BOX",
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 620, unit: "PT" },
                height: { magnitude: 45, unit: "PT" }
              },
              transform: {
                scaleX: 1, scaleY: 1,
                translateX: 50, translateY: 120,
                unit: "PT"
              }
            }
          }
        });

        // Write Subtitle content
        requests.push({
          insertText: {
            objectId: subtitleId,
            text: slide.subtitle,
            insertionIndex: 0
          }
        });

        // Style Subtitle properties
        requests.push({
          updateTextStyle: {
            objectId: subtitleId,
            style: {
              fontFamily: theme.fonts.body,
              fontSize: { magnitude: 13, unit: "PT" },
              italic: true,
              foregroundColor: { opaqueColor: { rgbColor: theme.subtitleRgb } }
            },
            fields: "fontFamily,fontSize,italic,foregroundColor"
          }
        });

        // Create Bullet Points Text Box
        requests.push({
          createShape: {
            objectId: bulletsId,
            shapeType: "TEXT_BOX",
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 620, unit: "PT" },
                height: { magnitude: 200, unit: "PT" }
              },
              transform: {
                scaleX: 1, scaleY: 1,
                translateX: 50, translateY: 175,
                unit: "PT"
              }
            }
          }
        });

        // Merge bullet points text
        const bulletsText = slide.bullets.map(b => `•  ${b}`).join("\n\n");

        requests.push({
          insertText: {
            objectId: bulletsId,
            text: bulletsText,
            insertionIndex: 0
          }
        });

        // Format bullet point typography
        requests.push({
          updateTextStyle: {
            objectId: bulletsId,
            style: {
              fontFamily: theme.fonts.body,
              fontSize: { magnitude: 14, unit: "PT" },
              foregroundColor: { opaqueColor: { rgbColor: theme.bulletsRgb } }
            },
            fields: "fontFamily,fontSize,foregroundColor"
          }
        });
      });

      // 4. Delete the initial blank first slide that Google creates automatically
      if (defaultSlideId) {
        requests.push({
          deleteObject: { objectId: defaultSlideId }
        });
      }

      setLogStatus("Uploading layout operations and executing vector updates...");

      const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requests })
      });

      if (!updateRes.ok) {
        const errDetails = await updateRes.json().catch(() => ({}));
        throw new Error(errDetails.error?.message || "Slides custom layout update rejected.");
      }

      setLogStatus("Presentation rendered successfully! Connecting cloud URL...");
      setGeneratedUrl(`https://docs.google.com/presentation/d/${presentationId}/edit`);
      alert("Success! Your professional Hackathon Slide deck has been compiled directly in your Google Slides workspace.");

    } catch (err: any) {
      console.error(err);
      alert(`Slides Generation Failed: ${err.message || err.toString()}`);
      setLogStatus(`Failed during compiling sequence: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-205/65 dark:border-slate-800 p-6 md:p-8 shadow-xl space-y-8 animate-fade-in" id="hackathon-slides-root">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-600 dark:text-blue-400">
              <Presentation className="h-6 w-6" id="presentation-icon-header" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-950 dark:text-white tracking-tight">
                Hackathon Slide Deck Generator
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Assemble structured, high-quality Pitch Slides directly in Google Slides for your project
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Google Authorization Pill */}
        <div className="flex items-center gap-3">
          {isAuthLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Verifying authorization status...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-2xl text-xs font-semibold text-emerald-850 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
              <span>Drive Connected ({user.email})</span>
              <button 
                onClick={handleSignOut} 
                className="ml-2 hover:text-red-500 transition-colors uppercase text-[9px] font-bold"
                title="Disconnect Workspace Account"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSignIn}
              className="bg-slate-905 hover:bg-black text-white dark:bg-blue-600 dark:hover:bg-blue-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Presentation className="h-4 w-4" />
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Main interactive grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL DECK & DESIGN SETTINGS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 1: AI Prompt parameters */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>AI Content Generation Panel</span>
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Project Summary / Hackathon Prompt
              </label>
              <textarea
                value={projectPrompt}
                onChange={(e) => setProjectPrompt(e.target.value)}
                placeholder="Describe your hackathon project, goals, key tech stack features..."
                rows={4}
                className="w-full text-xs sm:text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
              />
              <button
                onClick={handleAIGenerateCopy}
                disabled={isRevising}
                className="w-full bg-blue-650 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
              >
                {isRevising ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Stack with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                    <span>Re-Write Presentation with Gemini AI</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 italic">
                Our server-side Gemini 3.5 Flash automatically restructures slide summaries into high-impact key slides.
              </p>
            </div>
          </div>

          {/* Section 2: File configurations & Selected Theme */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-5">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-500" />
              <span>Slides Theme & Title Setup</span>
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Google Presentation Document Title
              </label>
              <input 
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g., Cool Project Pitch"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-205 rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Select Design Preset
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedTheme("midnight")}
                  className={`border rounded-xl p-3 text-center transition-all cursor-pointer ${
                    selectedTheme === "midnight" 
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 bg-slate-950 mx-auto rounded-full mb-1 border border-white/20" />
                  <span className="text-[10px] font-bold block">Midnight Tech</span>
                </button>

                <button
                  onClick={() => setSelectedTheme("alpine")}
                  className={`border rounded-xl p-3 text-center transition-all cursor-pointer ${
                    selectedTheme === "alpine" 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 bg-sky-200 mx-auto rounded-full mb-1 border border-blue-400/20" />
                  <span className="text-[10px] font-bold block">Alpine Blue</span>
                </button>

                <button
                  onClick={() => setSelectedTheme("editorial")}
                  className={`border rounded-xl p-3 text-center transition-all cursor-pointer ${
                    selectedTheme === "editorial" 
                      ? 'bg-amber-100 border-yellow-700 text-amber-950 shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 bg-amber-50 mx-auto rounded-full mb-1 border border-yellow-750/30" />
                  <span className="text-[10px] font-bold block">Editorial Cream</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Google slides trigger dispatch */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Presentation className="h-4 w-4 text-blue-500 animate-pulse" />
              <span>Compile Action Console</span>
            </h4>
            
            <p className="text-[11px] text-slate-500 leading-normal">
              Clicking below will send structured API build patterns, and instantiate your presentation file directly inside your Google Drive.
            </p>

            {user ? (
              <button
                onClick={generateGoogleDeck}
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg tracking-wider uppercase cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Uploading Pitch Slides...</span>
                  </>
                ) : (
                  <>
                    <Presentation className="h-4 w-4" />
                    <span>Generate Presentation Deck</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full bg-slate-900 hover:bg-black text-white text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer font-bold"
              >
                <Presentation className="h-4 w-4" />
                <span>Connect Google to Compile Slides</span>
              </button>
            )}

            {/* Sync Progress log status string */}
            {logStatus && (
              <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex items-center gap-1.5 leading-snug">
                <span className="w-1.5 h-1.5 bg-blue-550 rounded-full animate-ping shrink-0" />
                <span>{logStatus}</span>
              </div>
            )}

            {/* URL output frame */}
            {generatedUrl && (
              <div className="bg-emerald-100/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-850 space-y-2.5 animate-bounce">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Interactive Slide Deck is Live!</span>
                </p>
                <a 
                  href={generatedUrl} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Open Deck in Google Slides</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE SLIDES CHRONICLE & EDIT VIEW */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Slide Pitch Deck Preview ({slides.length} Slides)</span>
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 dark:text-slate-400 font-mono py-0.5 px-2 rounded-lg">
              Editable Workspace
            </span>
          </div>

          <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
            
            {slides.map((slide, sIdx) => (
              <div 
                key={sIdx}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative group"
              >
                
                {/* Decorative header identifier matching theme */}
                <div className="bg-slate-100 dark:bg-slate-900 py-2.5 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    SLIDE {sIdx + 1} OF 6
                  </span>
                  <span className="text-[10px] bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {sIdx === 0 ? "Title slide" : sIdx === 1 ? "The problem" : sIdx === 2 ? "The solution" : sIdx === 3 ? "Under the hood" : sIdx === 4 ? "Growth strategy" : "Roadmap / Call to action"}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Title editor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Slide Title
                      </label>
                      <input 
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(sIdx, "title", e.target.value)}
                        className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-201 rounded-lg p-2 focus:outline-none"
                      />
                    </div>

                    {/* Subtitle editor */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Slide Subtitle / Captions
                      </label>
                      <input 
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleSlideChange(sIdx, "subtitle", e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-201 rounded-lg p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bullets block editor */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">
                      Slide Bullets (Max 3 paragraphs for optimal slide display densities)
                    </label>
                    
                    {slide.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-blue-500 font-bold shrink-0">
                          #{bIdx + 1}
                        </span>
                        <input 
                          type="text"
                          value={bullet}
                          onChange={(e) => handleBulletChange(sIdx, bIdx, e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-201 rounded-lg p-2 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
