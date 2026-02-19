import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toolApi, type CopingTool } from '../services/api';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

/* ---------------- SPEAK ---------------- */

function speak(text: string) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  window.speechSynthesis.speak(msg);
}

/* -------------------------------------- */

export default function ToolDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tool, setTool] = useState<CopingTool | null>(null);
  const [loading, setLoading] = useState(true);

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);

  const [minutes, setMinutes] = useState(3); // ⭐ USER TIME
  const [totalSeconds, setTotalSeconds] = useState(180);

  /* ---------- LOAD TOOL ---------- */

  useEffect(() => {
    if (id) {
      toolApi.getById(id).then(setTool).finally(() => setLoading(false));
    }
  }, [id]);

  /* ---------- MAIN TIMER ---------- */

  useEffect(() => {
    if (!isActive) return;

    speak(getPhaseText());

    const timer = setInterval(() => {
      setCount((c) => c - 1);
      setTotalSeconds((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isActive]);

  /* ---------- HANDLE ZERO ---------- */

  useEffect(() => {
    if (count === 0 && isActive) nextPhase();
  }, [count]);

  useEffect(() => {
    if (totalSeconds <= 0 && isActive) {
      speak("Session complete");
      stop();
    }
  }, [totalSeconds]);

  /* ---------- PHASE LOGIC ---------- */

  function nextPhase() {
    if (phase === 'inhale') {
      setPhase('hold');
      setCount(7);
    } else if (phase === 'hold') {
      setPhase('exhale');
      setCount(8);
    } else {
      setPhase('inhale');
      setCount(4);
    }
  }

  function getPhaseText() {
    if (phase === 'inhale') return 'Inhale';
    if (phase === 'hold') return 'Hold';
    return 'Exhale';
  }

  /* ---------- CONTROLS ---------- */

  function start() {
    setIsActive(true);
    setPhase('inhale');
    setCount(4);
    setTotalSeconds(minutes * 60);
  }

  function stop() {
    setIsActive(false);
    window.speechSynthesis.cancel();
  }

  function reset() {
    stop();
    setCount(4);
    setPhase('inhale');
    setTotalSeconds(minutes * 60);
  }

  /* ---------- UI ---------- */

  if (loading) return <p className="text-center">Loading...</p>;
  if (!tool) return <p>Tool not found</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tools')}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">{tool.title}</h1>
      </div>

      {/* Time Selector */}
      <div className="seren-card p-4">
        <p className="mb-2 font-medium">Session Duration</p>
        <select
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="border p-2 rounded w-full"
          disabled={isActive}
        >
          <option value={1}>1 minute</option>
          <option value={3}>3 minutes</option>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
        </select>
      </div>

      {/* Breathing Circle */}
      <div className="seren-card p-8 text-center">

        <h2 className="text-xl font-bold mb-2">
          {getPhaseText()}
        </h2>

        <p className="mb-4 text-gray-500">
          Time Left: {Math.floor(totalSeconds / 60)}:
          {(totalSeconds % 60).toString().padStart(2, '0')}
        </p>

        <div
          className="w-48 h-48 rounded-full mx-auto flex items-center justify-center text-5xl font-bold transition-all"
          style={{
            background:
              phase === 'inhale'
                ? '#86efac'
                : phase === 'hold'
                ? '#fde047'
                : '#93c5fd',
            transform:
              phase === 'inhale'
                ? 'scale(1.2)'
                : phase === 'exhale'
                ? 'scale(0.8)'
                : 'scale(1)',
          }}
        >
          {count}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">

          {!isActive ? (
            <button className="seren-button-primary" onClick={start}>
              <Play /> Start
            </button>
          ) : (
            <button className="seren-button" onClick={stop}>
              <Pause /> Pause
            </button>
          )}

          <button className="seren-button" onClick={reset}>
            <RotateCcw /> Reset
          </button>

        </div>

      </div>

    </div>
  );
}
