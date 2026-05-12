import { useState, useRef } from 'react';
import { 
  Upload, 
  History, 
  ShieldAlert, 
  Search, 
  LockOpen, 
  AlertTriangle, 
  FileWarning, 
  Home, 
  FolderOpen, 
  Trophy, 
  User,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { analyzeMeal, RoastVerdict } from './services/geminiService';

export default function App() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState<RoastVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        processImage(reader.result as string, selectedFile.type);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const processImage = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setVerdict(null);
    setError(null);
    
    try {
      const result = await analyzeMeal(base64, mimeType);
      // Simulate analysis delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 3000));
      setVerdict(result);
    } catch (err) {
      console.error(err);
      setError("FAILED TO RETRIEVE EVIDENCE. TRY AGAIN, AMATEUR.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const reset = () => {
    setPreview(null);
    setVerdict(null);
    setError(null);
  };

  return (
    <div className="min-h-screen font-work-sans pb-24 md:pb-12 bg-brand-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 h-20 bg-brand-red border-b-4 border-brand-black shadow-brutal flex justify-between items-center px-6">
        <h1 className="font-anton text-2xl md:text-5xl text-brand-white italic uppercase tracking-tighter">
          IS YOUR MEAL A CRIME?
        </h1>
        <div className="flex gap-4">
          <button className="p-2 text-brand-white hover:bg-brand-white hover:text-brand-red border-2 border-transparent hover:border-brand-black transition-all">
            <History className="w-6 h-6" />
          </button>
          <button className="p-2 text-brand-white hover:bg-brand-white hover:text-brand-red border-2 border-transparent hover:border-brand-black transition-all">
            <ShieldAlert className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="mt-28 px-4 md:px-10 max-w-7xl mx-auto space-y-12 pb-16">
        {/* Hero */}
        {!verdict && !isAnalyzing && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-block bg-brand-yellow text-brand-black font-mono text-sm px-4 py-2 border-4 border-brand-black shadow-brutal-small uppercase font-bold">
                Department of Culinary Justice
              </div>
              <h2 className="font-anton text-6xl md:text-8xl uppercase text-brand-red leading-none">
                SEND US YOUR <br /> CULINARY CRIMES
              </h2>
              <p className="text-xl font-medium max-w-xl">
                Upload your recipe or food photo for a professional roasting. Our algorithms are tuned to detect dry chicken, soggy pastas, and plating disasters from 5 miles away.
              </p>
            </div>
            <div className="md:col-span-5 relative hidden md:block">
              <div className="bg-white border-4 border-brand-black shadow-[12px_12px_0px_0px_#CC0000] p-4 rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60" 
                  alt="Sample Evidence" 
                  className="w-full h-80 object-cover border-2 border-brand-black grayscale contrast-125"
                />
                <div className="mt-2 font-mono text-xs uppercase text-center font-bold">EXHIBIT A: CRIME SCENE PHOTO</div>
              </div>
            </div>
          </section>
        )}

        {/* Caution Divider */}
        {!verdict && !isAnalyzing && (
          <div className="h-10 caution-pattern border-y-4 border-brand-black w-full" />
        )}

        {/* Evidence Locker / Upload */}
        <AnimatePresence mode="wait">
          {!verdict && !isAnalyzing && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <LockOpen className="w-10 h-10" />
                <h3 className="font-anton text-4xl uppercase">EVIDENCE LOCKER</h3>
              </div>
              
              <div 
                onClick={triggerUpload}
                className="bg-brand-white border-4 border-brand-black border-dashed p-10 md:p-20 text-center cursor-pointer hover:bg-neutral-50 transition-colors shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Upload className="w-24 h-24 text-brand-red" />
                  </div>
                  <p className="font-anton text-3xl md:text-5xl uppercase">DROP THE EVIDENCE HERE</p>
                  <p className="font-mono text-sm italic font-bold uppercase">Accepted formats: JPG, PNG, WEBP (Max payload: 10MB)</p>
                  <button className="bg-brand-red text-brand-white px-8 py-4 font-anton text-2xl uppercase border-4 border-brand-black shadow-brutal-small active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-red-700 transition-colors">
                    OPEN CASE FILE
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <motion.section 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-brand-black text-brand-white p-8 border-4 border-brand-red shadow-[8px_8px_0px_0px_#FFD700] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
              <div className="flex-shrink-0 relative">
                <div className="w-32 h-32 bg-brand-yellow border-4 border-brand-black flex items-center justify-center">
                  <Search className="w-16 h-16 text-brand-black animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 bg-brand-red text-brand-white px-2 py-1 font-mono text-xs border-2 border-brand-white font-bold animate-pulse">LIVE FEED</div>
              </div>
              <div className="space-y-4 text-center md:text-left flex-grow">
                <h4 className="font-anton text-4xl text-brand-yellow uppercase">ANALYZING THE CRIME SCENE...</h4>
                <div className="flex gap-2 justify-center md:justify-start">
                  <div className="h-3 w-20 bg-brand-red animate-pulse" />
                  <div className="h-3 w-16 bg-brand-red/40 animate-pulse delay-75" />
                  <div className="h-3 w-12 bg-brand-red/20 animate-pulse delay-150" />
                </div>
                <p className="font-mono text-sm italic">"Is that ketchup on a ribeye? The audacity." — Head Investigator Pierre</p>
              </div>
            </motion.section>
          )}

          {/* Result Card */}
          {verdict && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 bg-white border-4 border-brand-black shadow-brutal flex flex-col">
                <div className="bg-brand-black text-brand-white p-4 flex justify-between items-center">
                  <span className="font-mono font-bold text-sm uppercase">CASE NO. {(Math.random() * 10000).toFixed(0)}-ALPHA</span>
                  <div className="bg-brand-red px-4 py-1 font-anton text-xl uppercase italic">
                    {verdict.verdict_title}
                  </div>
                </div>

                <div className="p-8 space-y-8 flex-grow">
                  {/* weirdness-o-meter */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <h5 className="font-anton text-3xl uppercase">WEIRDNESS-O-METER</h5>
                      <span className={cn(
                        "font-anton text-6xl",
                        verdict.weirdness_score > 70 ? "text-brand-red" : "text-brand-yellow"
                      )}>
                        {verdict.weirdness_score}%
                      </span>
                    </div>
                    <div className="h-12 border-4 border-brand-black bg-neutral-100 p-1 relative overflow-hidden">
                      <div 
                        className="h-full bg-brand-red transition-all duration-1000 ease-out" 
                        style={{ width: `${verdict.weirdness_score}%` }}
                      />
                      <div className="absolute inset-0 caution-pattern opacity-10 pointer-events-none" />
                    </div>
                  </div>

                  {/* Verdict Box */}
                  <div className="bg-brand-black text-brand-white p-6 border-l-[16px] border-brand-red shadow-brutal-small">
                    <h6 className="font-mono text-brand-red font-bold uppercase mb-2">CHEF'S VERDICT</h6>
                    <p className="font-anton text-2xl leading-tight uppercase">
                      "{verdict.roast_comment}"
                    </p>
                  </div>

                  {/* Criminal Violations */}
                  <div className="space-y-4">
                    <h6 className="font-anton text-3xl uppercase border-b-4 border-brand-black pb-2 flex items-center gap-2">
                       <ShieldAlert className="w-8 h-8 text-brand-red" />
                      CRIMINAL VIOLATIONS:
                    </h6>
                    <ul className="space-y-6">
                      {verdict.crimes.map((crime, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                          <div className="p-2 bg-brand-red text-brand-white border-2 border-brand-black">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <p className="text-xl font-bold uppercase leading-snug">{crime}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 border-t-4 border-brand-black bg-brand-yellow">
                  <button 
                    onClick={reset}
                    className="w-full bg-brand-black text-brand-white py-5 font-anton text-3xl uppercase hover:bg-brand-red transition-all border-4 border-brand-black shadow-brutal-small active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    APPEAL VERDICT (RE-UPLOAD)
                  </button>
                </div>
              </div>

              {/* Sidebar Evidence */}
              <div className="space-y-8">
                <div className="bg-neutral-100 border-4 border-brand-black p-6 shadow-brutal">
                  <h5 className="font-anton text-3xl uppercase mb-4 flex items-center gap-2">
                    <Camera className="w-7 h-7" />
                    EVIDENCE RECON
                  </h5>
                  <div className="aspect-square bg-white border-4 border-brand-black mb-4 overflow-hidden relative">
                    {preview && (
                      <img 
                        src={preview} 
                        alt="Crime Scene" 
                        className="w-full h-full object-cover grayscale contrast-125 brightness-75"
                      />
                    )}
                    <div className="absolute inset-0 border-[20px] border-transparent border-t-brand-red/20 pointer-events-none" />
                  </div>
                  <div className="font-mono text-xs font-bold uppercase space-y-3">
                    <div className="flex justify-between border-b border-brand-black/20 pb-1">
                      <span>LOCATION:</span>
                      <span>UNK_KITCHEN_99</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-black/20 pb-1">
                      <span>TIME:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-black/20 pb-1">
                      <span>TEMPERATURE:</span>
                      <span>DISASTER</span>
                    </div>
                  </div>
                </div>

                {/* Penalty */}
                <motion.div 
                  initial={{ rotate: 1 }}
                  animate={{ rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="bg-brand-red text-brand-white p-6 border-4 border-brand-black shadow-brutal"
                >
                  <h5 className="font-anton text-3xl uppercase mb-2 underline decoration-4 flex items-center gap-2">
                    <FileWarning className="w-8 h-8" />
                    PENALTY:
                  </h5>
                  <p className="font-anton text-xl uppercase leading-relaxed">
                    SENTENCED TO 12 HOURS OF WATCHING RERUNS OF GORDON RAMSAY SHOUTING AT PEOPLE UNTIL YOUR SELF-ESTEEM DISSOLVES LIKE THAT CHEAP MARGARINE YOU ALMOST CERTAINLY USED.
                  </p>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-brand-red text-brand-white p-6 border-4 border-brand-black shadow-brutal flex items-center gap-4">
            <AlertTriangle className="w-12 h-12 flex-shrink-0" />
            <p className="font-anton text-2xl uppercase">{error}</p>
          </div>
        )}
      </main>

      {/* Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-brand-white border-t-4 border-brand-black z-50 flex justify-around items-stretch md:hidden">
        <NavButton icon={<Home />} label="EVIDENCE" active />
        <NavButton icon={<FolderOpen />} label="DOSSIER" />
        <NavButton icon={<Trophy />} label="RANKINGS" />
        <NavButton icon={<User />} label="PROFILE" />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center justify-center flex-1 transition-all border-x-2 border-brand-black",
      active ? "bg-brand-yellow shadow-inner" : "hover:bg-neutral-100"
    )}>
      {icon}
      <span className="font-mono text-[10px] font-bold mt-1 uppercase">{label}</span>
    </button>
  );
}

