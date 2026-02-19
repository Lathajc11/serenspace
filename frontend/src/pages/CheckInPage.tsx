import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moodApi, type EmotionType } from '../services/api';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';

const emotions: { type: EmotionType; emoji: string; label: string; score: number }[] = [
  { type: 'joyful', emoji: '😄', label: 'Joyful', score: 10 },
  { type: 'happy', emoji: '😊', label: 'Happy', score: 8 },
  { type: 'calm', emoji: '😌', label: 'Calm', score: 7 },
  { type: 'neutral', emoji: '😐', label: 'Neutral', score: 5 },
  { type: 'anxious', emoji: '😰', label: 'Anxious', score: 3 },
  { type: 'sad', emoji: '😔', label: 'Sad', score: 2 },
  { type: 'angry', emoji: '😠', label: 'Angry', score: 2 },
  { type: 'stressed', emoji: '😫', label: 'Stressed', score: 3 },
];

const commonTags = [
  'Work',
  'Family',
  'Sleep',
  'Exercise',
  'Social',
  'Health',
  'Weather',
  'Finances',
];

export default function CheckInPage(): JSX.Element {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [score, setScore] = useState<number>(5);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmotionSelect = (emotion: typeof emotions[0]) => {
    setSelectedEmotion(emotion.type);
    setScore(emotion.score);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmotion) return;

    setLoading(true);
    try {
      await moodApi.create({
        score,
        emotion: selectedEmotion,
        note: note.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to save mood:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check size={40} className="text-green-500" />
        </div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Check-in saved!
        </h2>
        <p className="text-[var(--seren-text-secondary)]">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Daily Check-in
          </h1>
          <p className="text-[var(--seren-text-secondary)] text-sm">
            How are you feeling right now?
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Emotion Selection */}
        <div className="seren-card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Select your emotion
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {emotions.map((emotion) => (
              <button
                key={emotion.type}
                onClick={() => handleEmotionSelect(emotion)}
                className={`emotion-btn p-4 ${selectedEmotion === emotion.type ? 'selected' : ''}`}
              >
                <span className="text-3xl mb-2">{emotion.emoji}</span>
                <span className="text-xs font-medium">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Score Slider */}
        {selectedEmotion && (
          <div className="seren-card p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              How intense is this feeling?
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-[var(--seren-text-secondary)]">
                <span>Mild</span>
                <span>Intense</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--seren-accent)]"
              />
              <div className="text-center">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-[var(--seren-text-secondary)]">/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {selectedEmotion && (
          <div className="seren-card p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              What influenced your mood? <span className="text-sm font-normal text-[var(--seren-text-secondary)]">(Optional)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-[var(--seren-accent)] text-[var(--seren-text)]'
                      : 'bg-gray-100 text-[var(--seren-text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        {selectedEmotion && (
          <div className="seren-card p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Add a note <span className="text-sm font-normal text-[var(--seren-text-secondary)]">(Optional)</span>
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? How did your day go?"
              className="seren-input min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-right text-xs text-[var(--seren-text-secondary)] mt-2">
              {note.length}/500
            </p>
          </div>
        )}

        {/* Submit Button */}
        {selectedEmotion && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="seren-button-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Check size={24} className="mr-2" />
                Save Check-in
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
