import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Clock,
  ChevronRight,
  Wind,
  Brain,
  BookOpen,
  Activity,
  Lightbulb,
  X,
  Play,
  RotateCcw,
  Check,
  // Volume2,  // REMOVED - unused
  // VolumeX,  // REMOVED - unused
  Pause,
  Settings,
  Bell
} from 'lucide-react';

/* ---------------- TYPES ---------------- */

export type ToolCategory =
  | "breathing"
  | "meditation"
  | "grounding"
  | "journaling"
  | "movement"
  | "cognitive";

export type CopingTool = {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  steps: string[];
};

/* ---------------- ICON MAP ---------------- */

const categoryIcons: Record<ToolCategory, any> = {
  breathing: Wind,
  meditation: Sparkles,
  grounding: Brain,
  journaling: BookOpen,
  movement: Activity,
  cognitive: Lightbulb,
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700',
};

/* ---------------- FREE TOOLS ---------------- */

const FREE_TOOLS: CopingTool[] = [
  {
    id: "b1",
    title: "Box Breathing",
    description: "4-4-4-4 breathing technique for calm and focus",
    category: "breathing",
    duration: 3,
    difficulty: "easy",
    steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds"]
  },
  {
    id: "b2",
    title: "Pursed Lips Breathing",
    description: "Slow breathing to reduce shortness of breath",
    category: "breathing",
    duration: 5,
    difficulty: "easy",
    steps: ["Inhale through nose for 2 seconds", "Purse lips", "Exhale slowly for 4 seconds"]
  },
  {
    id: "m1",
    title: "Mindfulness Meditation",
    description: "Focus on present moment awareness",
    category: "meditation",
    duration: 5,
    difficulty: "easy",
    steps: ["Sit comfortably", "Focus on breath", "Observe thoughts without judgment", "Return to breath when distracted"]
  },
  {
    id: "g1",
    title: "5-4-3-2-1 Grounding",
    description: "Use your senses to ground in the present",
    category: "grounding",
    duration: 5,
    difficulty: "easy",
    steps: [
      "5 things you see",
      "4 things you feel",
      "3 things you hear",
      "2 things you smell",
      "1 thing you taste"
    ]
  },
  {
    id: "j1",
    title: "Gratitude Journal",
    description: "Write 3 things you're grateful for today",
    category: "journaling",
    duration: 5,
    difficulty: "easy",
    steps: ["Think of 3 things you appreciate", "Write them down", "Reflect on why they matter"]
  },
  {
    id: "mv1",
    title: "Gentle Stretch Flow",
    description: "Simple body stretches to release tension",
    category: "movement",
    duration: 5,
    difficulty: "easy",
    steps: ["Neck rolls", "Shoulder shrugs", "Arm stretches", "Gentle twists"]
  },
  {
    id: "c1",
    title: "Positive Reframing",
    description: "Transform negative thoughts into balanced perspectives",
    category: "cognitive",
    duration: 5,
    difficulty: "medium",
    steps: ["Identify negative thought", "Challenge its validity", "Create balanced alternative", "Practice the new thought"]
  }
];

/* ---------------- AUDIO NOTIFICATION ---------------- */

function useAudioNotification() {
  const playNotification = useCallback(() => {
    // Create a pleasant chime using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = type;
      
      gain.gain.setValueAtTime(0, audioContext.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + duration);
      
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };

    // Play a gentle chime (C major chord arpeggio)
    playNote(523.25, 0, 0.4); // C5
    playNote(659.25, 0.15, 0.4); // E5
    playNote(783.99, 0.3, 0.6); // G5
  }, []);

  return { playNotification };
}

/* ---------------- BREATHING CIRCLE COMPONENT ---------------- */

function BreathingCircle({ 
  phase, 
  secondsLeft, 
  totalTime,
  isActive,
  variant = "box"
}: { 
  phase: string; 
  secondsLeft: number; 
  totalTime: number;
  isActive: boolean;
  variant?: "box" | "pursed";
}) {
  const progress = ((totalTime - secondsLeft) / totalTime) * 100;
  
  const getScale = () => {
    if (!isActive) return 1;
    
    // Normalize the phase display
    const normalizedPhase = phase.toLowerCase();
    
    if (variant === "pursed") {
      if (normalizedPhase.includes("inhale")) return 1 + (progress / 100) * 0.3;
      if (normalizedPhase.includes("exhale")) return 1.3 - (progress / 100) * 0.3;
      // Hold phases - keep medium size
      return 1.15;
    }
    
    // Box breathing
    if (normalizedPhase.includes("inhale")) return 1 + (progress / 100) * 0.4;
    if (normalizedPhase.includes("exhale")) return 1.4 - (progress / 100) * 0.4;
    // Hold phases
    return 1.4;
  };

  const getColor = () => {
    const normalizedPhase = phase.toLowerCase();
    if (normalizedPhase.includes("inhale")) return "from-blue-400 to-blue-600";
    if (normalizedPhase.includes("hold")) return "from-purple-400 to-purple-600";
    if (normalizedPhase.includes("exhale")) return "from-teal-400 to-teal-600";
    return "from-blue-400 to-blue-600";
  };

  const getTextColor = () => {
    const normalizedPhase = phase.toLowerCase();
    if (normalizedPhase.includes("inhale")) return "text-blue-600";
    if (normalizedPhase.includes("hold")) return "text-purple-600";
    if (normalizedPhase.includes("exhale")) return "text-teal-600";
    return "text-blue-600";
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${getColor()} opacity-20 blur-xl transition-all duration-1000`} 
        style={{ transform: `scale(${getScale()})` }} 
      />
      
      {/* Main circle */}
      <div 
        className={`absolute inset-4 rounded-full bg-gradient-to-br ${getColor()} shadow-2xl flex flex-col items-center justify-center transition-all duration-1000 ease-in-out`}
        style={{ 
          transform: `scale(${getScale()})`,
          boxShadow: isActive ? `0 25px 80px -20px rgba(0, 0, 0, 0.3)` : 'none'
        }}
      >
        <span className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">
          {phase}
        </span>
        <span className="text-white text-5xl font-light">
          {secondsLeft}
        </span>
      </div>

      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 46}`}
          strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Phase indicator dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {['Inhale', 'Hold', 'Exhale', 'Hold'].map((p, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              phase === p ? getTextColor().replace('text-', 'bg-') : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- BREATHING EXERCISE COMPONENT ---------------- */

function BreathingExercise({ 
  tool, 
  onComplete 
}: { 
  tool: CopingTool; 
  onComplete: () => void;
}) {
  const { playNotification } = useAudioNotification();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(tool.duration);
  const [timeLeft, setTimeLeft] = useState(tool.duration * 60);
  const [phase, setPhase] = useState("Inhale");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isBoxBreathing = tool.title.includes("Box");
  
  // Define sequences
  const boxSequence = [
    { label: "Inhale", time: 4 },
    { label: "Hold", time: 4 },
    { label: "Exhale", time: 4 },
    { label: "Hold", time: 4 }
  ];

  const pursedSequence = [
    { label: "Inhale", time: 2 },
    { label: "Hold", time: 1 },
    { label: "Exhale", time: 4 },
    { label: "Hold", time: 1 }
  ];

  const sequence = isBoxBreathing ? boxSequence : pursedSequence;
  const phaseIndexRef = useRef(0);
  // REMOVED: totalTimeRef was declared but never used

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Exercise complete
          if (soundEnabled) playNotification();
          setIsActive(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });

      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          phaseIndexRef.current = (phaseIndexRef.current + 1) % sequence.length;
          const nextPhase = sequence[phaseIndexRef.current];
          setPhase(nextPhase.label);
          return nextPhase.time;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, soundEnabled, onComplete, playNotification, sequence]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    phaseIndexRef.current = 0;
    setPhase(sequence[0].label);
    setPhaseTimeLeft(sequence[0].time);
    setShowSettings(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    phaseIndexRef.current = 0;
    setPhase("Inhale");
    setPhaseTimeLeft(4);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhaseDuration = sequence.find(s => s.label === phase)?.time || 4;

  if (showSettings) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            Exercise Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-blue-900 border-2 border-blue-200">
                  {duration}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Completion Sound</p>
                  <p className="text-sm text-gray-500">Play chime when finished</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">How it works:</h4>
          <ul className="space-y-2">
            {tool.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 text-white py-4 rounded-full hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <Play size={20} />
          Start {duration} Minute{duration > 1 ? 's' : ''}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isActive ? (
        <div className="text-center space-y-6">
          <p className="text-gray-600">{tool.description}</p>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-6xl mb-4">🫁</div>
            <h4 className="font-bold text-gray-800 mb-2">Ready to breathe?</h4>
            <p className="text-gray-600 mb-4">Set your preferred duration and begin</p>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-blue-600 font-medium shadow-sm">
              <Clock size={16} />
              Default: {tool.duration} min
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg flex items-center gap-2 mx-auto"
          >
            <Settings size={20} />
            Configure & Start
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timer display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-600 mb-4">
              <Clock size={16} />
              {formatTime(timeLeft)} remaining
            </div>
          </div>

          {/* Breathing Circle */}
          <BreathingCircle 
            phase={phase}
            secondsLeft={phaseTimeLeft}
            totalTime={currentPhaseDuration}
            isActive={isActive && !isPaused}
            variant={isBoxBreathing ? "box" : "pursed"}
          />

          {/* Current phase text */}
          <div className="text-center pt-4">
            <p className={`text-2xl font-bold transition-colors ${
              phase === "Inhale" ? "text-blue-600" :
              phase === "Hold" ? "text-purple-600" :
              "text-teal-600"
            }`}>
              {phase}
            </p>
            <p className="text-gray-500 mt-1">
              {isBoxBreathing 
                ? "4-4-4-4 rhythm" 
                : "Inhale 2s • Hold 1s • Exhale 4s • Hold 1s"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors font-medium"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-full hover:bg-red-200 transition-colors font-medium"
            >
              <RotateCcw size={18} />
              Stop
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000"
              style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- MEDITATION COMPONENT ---------------- */

function MeditationTool({ 
  tool,
  onComplete 
}: { 
  tool: CopingTool;
  onComplete: () => void;
}) {
  const { playNotification } = useAudioNotification();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(tool.duration);
  const [timeLeft, setTimeLeft] = useState(tool.duration * 60);
  const [showSettings, setShowSettings] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    "Breathe in peace, breathe out tension",
    "You are exactly where you need to be",
    "Let thoughts pass like clouds",
    "Return to your breath",
    "Peace begins with a smile",
    "Be present in this moment",
    "You are doing great"
  ];

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && isActive) {
        if (soundEnabled) playNotification();
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime % 15 === 0) {
          setCurrentQuote(Math.floor(Math.random() * quotes.length));
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, soundEnabled, onComplete, playNotification, quotes.length]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSettings) {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 rounded-2xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            Meditation Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-900 border-2 border-indigo-200">
                  {duration}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Completion Sound</p>
                  <p className="text-sm text-gray-500">Play chime when finished</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-indigo-600 text-white py-4 rounded-full hover:bg-indigo-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <Play size={20} />
          Begin {duration} Minute{duration > 1 ? 's' : ''}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ambient background */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className={`absolute inset-0 opacity-30 transition-all duration-4000 ${isActive && !isPaused ? 'scale-150' : 'scale-100'}`}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white blur-3xl animate-pulse"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`,
                animationDelay: `${i * 1}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
          <Sparkles className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-lg font-medium italic text-center">"{quotes[currentQuote]}"</p>
        </div>
      </div>

      {/* Timer */}
      <div className="text-6xl font-light text-gray-800 tracking-wider text-center">
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors font-medium"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => {
            setIsActive(false);
            setShowSettings(true);
          }}
          className="flex items-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-full hover:bg-red-200 transition-colors font-medium"
        >
          <RotateCcw size={18} />
          End
        </button>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-1000"
          style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- GROUNDING COMPONENT ---------------- */

function GroundingTool({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isActive, setIsActive] = useState(false);

  const steps = [
    { sense: "See", count: 5, icon: "👁️", color: "bg-blue-500", prompt: "Name 5 things you can see right now" },
    { sense: "Touch", count: 4, icon: "✋", color: "bg-green-500", prompt: "Name 4 things you can feel right now" },
    { sense: "Hear", count: 3, icon: "👂", color: "bg-purple-500", prompt: "Name 3 things you can hear right now" },
    { sense: "Smell", count: 2, icon: "👃", color: "bg-orange-500", prompt: "Name 2 things you can smell right now" },
    { sense: "Taste", count: 1, icon: "👅", color: "bg-red-500", prompt: "Name 1 thing you can taste right now" }
  ];

  const currentSense = steps[currentStep];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setItems([...items, inputValue]);
    setInputValue("");
    
    if (items.length + 1 >= currentSense.count) {
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setItems([]);
        } else {
          onComplete();
        }
      }, 500);
    }
  };

  if (!isActive) {
    return (
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-5xl shadow-xl">
          🧠
        </div>
        <p className="text-gray-600">Use your senses to ground yourself in the present moment</p>
        <button
          onClick={() => setIsActive(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Grounding Exercise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex gap-2">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={`flex-1 h-2 rounded-full transition-colors ${idx <= currentStep ? step.color : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Current sense card */}
      <div className={`${currentSense.color} text-white rounded-2xl p-6 text-center transition-all duration-500`}>
        <div className="text-6xl mb-4">{currentSense.icon}</div>
        <h3 className="text-2xl font-bold mb-2">{currentSense.sense} ({items.length}/{currentSense.count})</h3>
        <p className="opacity-90">{currentSense.prompt}</p>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type and press Enter..."
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          autoFocus
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Check size={24} />
        </button>
      </form>

      {/* Collected items */}
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm animate-in fade-in slide-in-from-bottom-2"
          >
            {idx + 1}. {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- JOURNALING COMPONENT ---------------- */

function JournalingTool({ onComplete }: { onComplete: () => void }) {
  const [entries, setEntries] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const prompts = [
    "What made you smile today?",
    "Who are you grateful for right now?",
    "What's something beautiful you noticed?",
    "What achievement are you proud of?",
    "What comforted you recently?"
  ];

  const handleSubmit = () => {
    if (!currentInput.trim()) return;
    setEntries([...entries, currentInput]);
    setCurrentInput("");
    
    if (entries.length >= 2) {
      setTimeout(onComplete, 500);
    } else {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
    }
  };

  if (!isActive) {
    return (
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-5xl shadow-xl">
          📝
        </div>
        <p className="text-gray-600">Write down 3 things you're grateful for today</p>
        <button
          onClick={() => setIsActive(true)}
          className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
        >
          Open Journal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-orange-500" size={24} />
          <span className="text-orange-600 font-medium">Entry {entries.length + 1} of 3</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{prompts[currentPrompt]}</h3>
        
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full h-32 p-4 rounded-xl border-2 border-yellow-200 focus:border-orange-400 focus:outline-none resize-none transition-colors"
          autoFocus
        />
        
        <button
          onClick={handleSubmit}
          disabled={!currentInput.trim()}
          className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {entries.length >= 2 ? "Complete Journal" : "Next Entry"}
        </button>
      </div>

      {/* Previous entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Your entries:</h4>
          {entries.map((entry, idx) => (
            <div key={idx} className="bg-white border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
              <p className="text-gray-700 italic">"{entry}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- MOVEMENT COMPONENT ---------------- */

function MovementTool({ onComplete }: { onComplete: () => void }) {
  const [currentPose, setCurrentPose] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [completedPoses, setCompletedPoses] = useState<number[]>([]);

  const poses = [
    { name: "Neck Rolls", icon: "🧘", instruction: "Slowly roll your head in circles, 5 times each direction", duration: 30 },
    { name: "Shoulder Shrugs", icon: "💪", instruction: "Lift shoulders to ears, hold 3 seconds, release. Repeat 10 times", duration: 30 },
    { name: "Arm Stretches", icon: "🙆", instruction: "Reach arms overhead, interlace fingers, stretch upward", duration: 30 },
    { name: "Gentle Twists", icon: "🔄", instruction: "Twist torso slowly left and right, breathing deeply", duration: 30 }
  ];

  useEffect(() => {
    if (!isActive || timer <= 0) {
      if (timer <= 0 && isActive) {
        handleNext();
      }
      return;
    }

    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleNext = () => {
    setCompletedPoses([...completedPoses, currentPose]);
    if (currentPose < poses.length - 1) {
      setCurrentPose(currentPose + 1);
      setTimer(poses[currentPose + 1].duration);
    } else {
      onComplete();
    }
  };

  if (!isActive) {
    return (
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white text-5xl shadow-xl">
          🏃
        </div>
        <p className="text-gray-600">4 gentle stretches to release tension</p>
        <button
          onClick={() => {
            setIsActive(true);
            setTimer(poses[0].duration);
          }}
          className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors shadow-lg"
        >
          Start Stretching
        </button>
      </div>
    );
  }

  const pose = poses[currentPose];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {poses.map((_, idx) => (
          <div 
            key={idx}
            className={`flex-1 h-2 rounded-full transition-colors ${completedPoses.includes(idx) ? 'bg-green-500' : idx === currentPose ? 'bg-green-400' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Current pose */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 text-center border-2 border-green-200">
        <div className="text-8xl mb-4 animate-bounce">{pose.icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{pose.name}</h3>
        <p className="text-gray-600 mb-6">{pose.instruction}</p>
        
        {/* Timer circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - timer / pose.duration)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">
            {timer}s
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleNext}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COGNITIVE COMPONENT ---------------- */

function CognitiveTool({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [negativeThought, setNegativeThought] = useState("");
  const [evidence, setEvidence] = useState("");
  const [reframe, setReframe] = useState("");
  const [isActive, setIsActive] = useState(false);

  const steps = [
    {
      title: "Identify",
      description: "What's the negative thought troubling you?",
      placeholder: "I always mess everything up...",
      value: negativeThought,
      onChange: setNegativeThought,
      color: "bg-red-500"
    },
    {
      title: "Challenge",
      description: "What evidence contradicts this thought?",
      placeholder: "Actually, I succeeded at...",
      value: evidence,
      onChange: setEvidence,
      color: "bg-yellow-500"
    },
    {
      title: "Reframe",
      description: "What's a more balanced perspective?",
      placeholder: "A more helpful way to see this is...",
      value: reframe,
      onChange: setReframe,
      color: "bg-green-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  if (!isActive) {
    return (
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-5xl shadow-xl">
          💡
        </div>
        <p className="text-gray-600">Transform negative thoughts into balanced perspectives</p>
        <button
          onClick={() => setIsActive(true)}
          className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
        >
          Start Reframing
        </button>
      </div>
    );
  }

  const currentStep = steps[step];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {steps.map((s, idx) => (
          <div key={idx} className="flex-1">
            <div className={`h-2 rounded-full transition-colors ${idx <= step ? s.color : 'bg-gray-200'}`} />
            <p className={`text-xs mt-1 text-center ${idx <= step ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {s.title}
            </p>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className={`${currentStep.color} rounded-2xl p-6 text-white transition-all duration-500`}>
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6" />
          <h3 className="text-xl font-bold">Step {step + 1}: {currentStep.title}</h3>
        </div>
        <p className="mb-4 opacity-90">{currentStep.description}</p>
        
        <textarea
          value={currentStep.value}
          onChange={(e) => currentStep.onChange(e.target.value)}
          placeholder={currentStep.placeholder}
          className="w-full h-32 p-4 rounded-xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-white/30"
          autoFocus
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!currentStep.value.trim()}
        className="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {step === steps.length - 1 ? "Complete Exercise" : "Next Step"}
      </button>

      {/* Summary if complete */}
      {step === steps.length - 1 && negativeThought && evidence && reframe && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="text-red-500 font-bold">Before:</span>
            <span className="text-gray-600 italic">"{negativeThought}"</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-500 font-bold">After:</span>
            <span className="text-gray-800 font-medium">"{reframe}"</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function ToolsPage(): JSX.Element {
  const [tools] = useState<CopingTool[]>(FREE_TOOLS);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [activeTool, setActiveTool] = useState<CopingTool | null>(null);
  const [completedTools, setCompletedTools] = useState<string[]>([]);

  const handleToolComplete = () => {
    if (activeTool && !completedTools.includes(activeTool.id)) {
      setCompletedTools([...completedTools, activeTool.id]);
    }
    setTimeout(() => {
      setActiveTool(null);
    }, 1500);
  };

  const filteredTools = selectedCategory
    ? tools.filter(t => t.category === selectedCategory)
    : tools;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Coping Tools</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Interactive wellness exercises for your mental health journey
        </p>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm
          ${!selectedCategory ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          All Tools
        </button>

        {Object.keys(categoryIcons).map((cat) => {
          const Icon = categoryIcons[cat as ToolCategory];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as ToolCategory)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm capitalize
              ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <Icon size={18} />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = categoryIcons[tool.category];
          const isCompleted = completedTools.includes(tool.id);

          return (
            <div
              key={tool.id}
              onClick={() => setActiveTool(tool)}
              className={`group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 border-2 
              ${isCompleted ? 'border-green-400 bg-green-50/30' : 'border-transparent hover:border-blue-200'}`}
            >
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                  ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
                  {isCompleted ? <Check size={28} /> : <Icon size={28} />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                  </div>

                  <p className="text-sm text-gray-500 mt-1 mb-3 line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock size={14} />
                      {tool.duration} min
                    </span>
                    <span className={`px-3 py-1 rounded-full font-medium ${difficultyColors[tool.difficulty]}`}>
                      {tool.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Check size={14} /> Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {activeTool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  {(() => {
                    const Icon = categoryIcons[activeTool.category];
                    return <Icon size={20} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeTool.title}</h2>
                  <p className="text-sm text-gray-500">{activeTool.category} • {activeTool.difficulty}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTool(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* BREATHING TOOLS */}
              {activeTool.category === "breathing" && (
                <BreathingExercise 
                  tool={activeTool}
                  onComplete={handleToolComplete}
                />
              )}

              {/* MEDITATION TOOL */}
              {activeTool.category === "meditation" && (
                <MeditationTool 
                  tool={activeTool}
                  onComplete={handleToolComplete}
                />
              )}

              {/* GROUNDING TOOL */}
              {activeTool.category === "grounding" && (
                <GroundingTool onComplete={handleToolComplete} />
              )}

              {/* JOURNALING TOOL */}
              {activeTool.category === "journaling" && (
                <JournalingTool onComplete={handleToolComplete} />
              )}

              {/* MOVEMENT TOOL */}
              {activeTool.category === "movement" && (
                <MovementTool onComplete={handleToolComplete} />
              )}

              {/* COGNITIVE TOOL */}
              {activeTool.category === "cognitive" && (
                <CognitiveTool onComplete={handleToolComplete} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}