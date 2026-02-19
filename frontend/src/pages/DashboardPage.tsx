import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { moodApi, type Mood, type MoodStats } from '../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  CalendarPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Flame,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  MoreHorizontal,
  Smile,
  Frown,
  Meh,
  Zap,
  Wind,
} from 'lucide-react';
import { format, subDays, isSameDay, startOfMonth, isAfter, subMonths } from 'date-fns';

/* ✅ BULLETPROOF Date Converter */
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

const emotionEmojis: Record<string, string> = {
  joyful: '😄',
  happy: '😊',
  excited: '🤩',
  calm: '😌',
  neutral: '😐',
  anxious: '😰',
  sad: '😔',
  angry: '😠',
  stressed: '😫',
  tired: '😴',
};

const emotionColors: Record<string, string> = {
  joyful: '#FFD93D',
  happy: '#6BCF7F',
  excited: '#FF6B9D',
  calm: '#4D96FF',
  neutral: '#A0A0A0',
  anxious: '#FF9F43',
  sad: '#5DADE2',
  angry: '#E74C3C',
  stressed: '#9B59B6',
  tired: '#95A5A6',
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

type TimeRange = '7days' | '30days' | 'month' | '3months' | 'all';
type ChartType = 'area' | 'line' | 'bar' | 'pie';

interface TimeChartData {
  date: string;
  score: number | null;
  count: number;
  fullDate: string;
}

interface PieChartData {
  name: string;
  value: number;
  emoji: string;
  color: string;
}

export default function DashboardPage(): JSX.Element {
  const { userProfile } = useAuth();

  const [moods, setMoods] = useState<Mood[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [chartType, setChartType] = useState<ChartType>('area');

  useEffect(() => {
    if (userProfile) loadData();
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moodsData, statsData] = await Promise.all([
        moodApi.getAll(365),
        moodApi.getStats(30),
      ]);
      setMoods(moodsData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMoods = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return moods.filter(m => isAfter(toDate(m.createdAt), subDays(now, 7)));
      case '30days':
        return moods.filter(m => isAfter(toDate(m.createdAt), subDays(now, 30)));
      case 'month':
        return moods.filter(m => isAfter(toDate(m.createdAt), startOfMonth(now)));
      case '3months':
        return moods.filter(m => isAfter(toDate(m.createdAt), subMonths(now, 3)));
      case 'all':
      default:
        return moods;
    }
  };

  const filteredMoods = getFilteredMoods();

  const getChartData = (): TimeChartData[] | PieChartData[] => {
    const now = new Date();
    
    if (chartType === 'pie') {
      const emotionCounts = filteredMoods.reduce((acc, m) => {
        acc[m.emotion] = (acc[m.emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(emotionCounts).map(([emotion, count]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: count,
        emoji: emotionEmojis[emotion] || '😐',
        color: emotionColors[emotion] || '#999',
      }));
    }

    let days: Date[] = [];
    let dateFormat = 'EEE';

    switch (timeRange) {
      case '7days':
        days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
        break;
      case '30days':
        days = Array.from({ length: 10 }, (_, i) => subDays(now, 9 - i * 3));
        dateFormat = 'MMM d';
        break;
      case 'month':
        const daysInMonth = now.getDate();
        const interval = Math.ceil(daysInMonth / 10);
        days = Array.from({ length: Math.ceil(daysInMonth / interval) }, (_, i) => 
          subDays(now, daysInMonth - 1 - (i * interval))
        );
        dateFormat = 'MMM d';
        break;
      case '3months':
        days = Array.from({ length: 12 }, (_, i) => subDays(now, 11 - i * 7));
        dateFormat = 'MMM d';
        break;
      case 'all':
        const uniqueMonths = [...new Set(filteredMoods.map(m => 
          format(toDate(m.createdAt), 'yyyy-MM')
        ))].sort().slice(-12);
        
        return uniqueMonths.map(monthKey => {
          const monthMoods = filteredMoods.filter(m => 
            format(toDate(m.createdAt), 'yyyy-MM') === monthKey
          );
          const avg = monthMoods.length > 0
            ? monthMoods.reduce((s, m) => s + m.score, 0) / monthMoods.length
            : null;
          
          return {
            date: format(new Date(monthKey + '-01'), 'MMM yyyy'),
            score: avg,
            count: monthMoods.length,
            fullDate: monthKey,
          };
        });
    }

    return days.map(date => {
      const dayMoods = filteredMoods.filter(m => isSameDay(toDate(m.createdAt), date));
      const avg = dayMoods.length > 0
        ? dayMoods.reduce((s, m) => s + m.score, 0) / dayMoods.length
        : null;

      return {
        date: format(date, dateFormat),
        score: avg,
        count: dayMoods.length,
        fullDate: date.toISOString(),
      };
    });
  };

  const chartData = getChartData();

  const recentMoods = [...moods]
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 5);

  const todayMood = moods.find(m => isSameDay(toDate(m.createdAt), new Date()));

  const getFilteredStats = () => {
    if (filteredMoods.length === 0) return null;
    const avgScore = filteredMoods.reduce((s, m) => s + m.score, 0) / filteredMoods.length;
    const emotionCounts = filteredMoods.reduce((acc, m) => {
      acc[m.emotion] = (acc[m.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return { avgScore: avgScore.toFixed(1), topEmotion, count: filteredMoods.length };
  };

  const filteredStats = getFilteredStats();

  const getTrendIcon = () => {
    if (!stats) return null;
    if (stats.trend === 'improving') return <TrendingUp size={20} className="text-green-500" />;
    if (stats.trend === 'declining') return <TrendingDown size={20} className="text-orange-500" />;
    return <Minus size={20} className="text-gray-400" />;
  };

  const getMoodIcon = (score: number) => {
    if (score >= 8) return <Zap className="text-yellow-500" size={20} />;
    if (score >= 6) return <Smile className="text-green-500" size={20} />;
    if (score >= 4) return <Meh className="text-gray-500" size={20} />;
    return <Frown className="text-red-500" size={20} />;
  };

  const isTimeChartData = (data: TimeChartData[] | PieChartData[]): data is TimeChartData[] => {
    return chartType !== 'pie' && data.length > 0 && 'score' in data[0];
  };

  const hasChartData = chartType === 'pie' 
    ? chartData.length > 0 
    : isTimeChartData(chartData) && chartData.some(d => d.score !== null);

  const renderChart = () => {
    if (!hasChartData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[250px]">
          <Activity size={48} className="mb-3 opacity-50" />
          <p className="font-medium">No mood data for this period</p>
          <p className="text-sm mt-1">Check in to start tracking your journey!</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(chartData as PieChartData[]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} fill="url(#colorScore)" dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, {userProfile?.displayName || 'Friend'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Track your emotional wellness journey</p>
        </div>

        <Link to="/check-in" className="seren-button-primary inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
          <CalendarPlus size={20} className="mr-2" />
          {todayMood ? 'Update Today\'s Mood' : 'Check In Now'}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Day Streak" 
          value={userProfile?.streakDays || 0} 
          icon={<Flame className="text-orange-500" size={24} />}
          subtitle="Keep it up!"
          trend="up"
        />
        <StatCard 
          title="Avg Mood" 
          value={filteredStats?.avgScore || '-'} 
          icon={getTrendIcon() || <Activity className="text-blue-500" size={24} />}
          subtitle={filteredStats ? `Based on ${filteredStats.count} entries` : 'No data'}
        />
        <StatCard 
          title="Total Check-ins" 
          value={userProfile?.totalCheckIns || 0} 
          icon={<CalendarPlus className="text-purple-500" size={24} />}
          subtitle="All time"
        />
        <StatCard 
          title="Top Emotion" 
          value={filteredStats?.topEmotion ? filteredStats.topEmotion.charAt(0).toUpperCase() + filteredStats.topEmotion.slice(1) : '-'} 
          icon={<span className="text-2xl">{emotionEmojis[filteredStats?.topEmotion || 'neutral']}</span>}
          subtitle="Most frequent"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mood History</h2>
            <p className="text-sm text-gray-500 mt-1">
              {chartType === 'pie' ? 'Emotion distribution' : 'Mood score over time'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium min-w-[140px]"
              >
                <option value="area">Area Chart</option>
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                {chartType === 'area' && <Activity size={16} />}
                {chartType === 'line' && <LineChartIcon size={16} />}
                {chartType === 'bar' && <BarChart3 size={16} />}
                {chartType === 'pie' && <PieChartIcon size={16} />}
              </div>
            </div>

            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium min-w-[140px]"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="all">All Time</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <Calendar size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {renderChart()}
        </div>

        {filteredStats && chartType !== 'pie' && isTimeChartData(chartData) && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredStats.avgScore}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Average</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...chartData.filter(d => d.score !== null).map(d => d.score as number))}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Highest</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {Math.min(...chartData.filter(d => d.score !== null).map(d => d.score as number))}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Lowest</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Check-ins</h2>
            <Link to="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {recentMoods.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Wind size={40} className="mx-auto mb-3 opacity-50" />
              <p>No check-ins yet</p>
              <Link to="/check-in" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                Start your first check-in
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMoods.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group cursor-pointer border border-transparent hover:border-blue-100"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="text-3xl transform group-hover:scale-110 transition-transform">
                    {emotionEmojis[m.emotion] || '😐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 capitalize">{m.emotion}</span>
                      <span className="text-sm text-gray-500">({m.score}/10)</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {format(toDate(m.createdAt), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                    {getMoodIcon(m.score)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <QuickCard 
            title="Coping Tools" 
            desc="Breathing exercises, grounding techniques, and more to help you find calm" 
            link="/tools"
            icon={<Wind className="text-teal-500" size={24} />}
            color="teal"
          />
          <QuickCard 
            title="Insights & Patterns" 
            desc="Discover trends in your mood and understand your emotional patterns" 
            link="/insights"
            icon={<BarChart3 className="text-purple-500" size={24} />}
            color="purple"
          />
          <QuickCard 
            title="Community" 
            desc="Connect with others and share your wellness journey" 
            link="/community"
            icon={<MoreHorizontal className="text-pink-500" size={24} />}
            color="pink"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, trend }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        {trend === 'up' && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            +2 days
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function QuickCard({ title, desc, link, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    teal: 'hover:border-teal-200 hover:bg-teal-50',
    purple: 'hover:border-purple-200 hover:bg-purple-50',
    pink: 'hover:border-pink-200 hover:bg-pink-50',
  };

  return (
    <Link 
      to={link} 
      className={`block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all group ${colorClasses[color] || 'hover:border-blue-200 hover:bg-blue-50'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1" />
      </div>
    </Link>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TimeChartData;
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <p className="text-blue-600 font-bold text-lg">
            {data.score ? `${data.score.toFixed(1)}/10` : 'No data'}
          </p>
        </div>
        {data.count > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {data.count} check-in{data.count !== 1 ? 's' : ''} on this day
          </p>
        )}
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PieChartData;
    
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.emoji}</span>
          <span className="font-semibold text-gray-900 capitalize">{data.name}</span>
        </div>
        <p className="text-2xl font-bold" style={{ color: data.color }}>{data.value}</p>
        <p className="text-xs text-gray-500">times recorded</p>
      </div>
    );
  }
  return null;
}