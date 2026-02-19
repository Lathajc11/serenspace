import { useState, useEffect } from 'react';
import { insightApi, type Insight } from '../services/api';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Award,
  AlertCircle,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/* ✅ SAFE DATE CONVERTER */
function toDate(value: any): Date {
  try {
    if (!value) return new Date();

    if (typeof value === 'object' && value.seconds) {
      return new Date(value.seconds * 1000);
    }

    const d = new Date(value);
    if (isNaN(d.getTime())) return new Date();

    return d;
  } catch {
    return new Date();
  }
}

const insightIcons: Record<string, React.ElementType> = {
  pattern: Lightbulb,
  trend: TrendingUp,
  suggestion: Sparkles,
  milestone: Award,
  alert: AlertCircle,
};

const insightColors: Record<string, string> = {
  pattern: 'bg-purple-100 text-purple-700',
  trend: 'bg-blue-100 text-blue-700',
  suggestion: 'bg-green-100 text-green-700',
  milestone: 'bg-yellow-100 text-yellow-700',
  alert: 'bg-orange-100 text-orange-700',
};

export default function InsightsPage(): JSX.Element {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightApi.getAll();
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newInsights = await insightApi.generate();
      setInsights([...newInsights, ...insights]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await insightApi.markRead(id);
      setInsights(
        insights.map(i =>
          i.id === id ? { ...i, isRead: true } : i
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const unreadCount = insights.filter(i => !i.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--seren-accent)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Insights</h1>
          <p className="text-[var(--seren-text-secondary)] mt-1">
            Discover patterns and trends in your mood data
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="seren-button-primary disabled:opacity-50"
        >
          {generating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Generate New Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Unread Count */}
      {unreadCount > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--seren-accent)]/30 text-sm font-medium">
          ✨ {unreadCount} new insight{unreadCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="seren-card p-12 text-center">
            <Sparkles size={48} className="mx-auto mb-4 text-[var(--seren-accent)]" />
            <h3 className="text-xl font-bold mb-2">No insights yet</h3>
            <p className="text-gray-500 mb-6">
              Keep checking in daily to generate insights.
            </p>
            <button onClick={handleGenerate} className="seren-button-primary">
              Generate Insights
            </button>
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = insightIcons[insight.type] || Lightbulb;
            const colorClass =
              insightColors[insight.type] ||
              'bg-gray-100 text-gray-700';

            return (
              <div
                key={insight.id}
                className={`seren-card p-6 ${
                  !insight.isRead ? 'ring-2 ring-[var(--seren-accent)]' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
                  >
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs uppercase">
                        {insight.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          toDate(insight.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>

                    <h3 className="font-bold mb-1">{insight.title}</h3>
                    <p className="text-gray-500 mb-3">
                      {insight.description}
                    </p>

                    {insight.data && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="badge">
                          Avg: {insight.data.averageMood}/10
                        </span>
                        <span className="badge">
                          Trend: {insight.data.moodTrend}
                        </span>
                      </div>
                    )}

                    {!insight.isRead && (
                      <button
                        onClick={() => handleMarkRead(insight.id)}
                        className="flex items-center gap-1 text-sm text-gray-500"
                      >
                        <Check size={16} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
