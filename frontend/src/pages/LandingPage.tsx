import { Link } from 'react-router-dom';
import { Heart, TrendingUp, Sparkles, Shield, Users, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Track Your Mood',
    description: 'Log how you feel daily and spot patterns over time.',
  },
  {
    icon: Sparkles,
    title: 'Coping Tools',
    description: 'Access breathing exercises, grounding techniques, and more.',
  },
  {
    icon: Heart,
    title: 'Personal Insights',
    description: 'Get personalized insights based on your mood patterns.',
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'Connect with others who understand what you\'re going through.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your data is encrypted and never sold to third parties.',
  },
];

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--seren-accent)]/20 text-sm font-medium">
                <span>✨</span>
                <span>Free to use, no credit card required</span>
              </div>
              
              <h1 
                className="text-4xl lg:text-6xl font-bold leading-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Your daily space to{' '}
                <span className="text-[var(--seren-accent)]">feel better</span>
              </h1>
              
              <p className="text-lg text-[var(--seren-text-secondary)] max-w-lg">
                Check in, track your mood, and find calm—without pressure. 
                SerenSpace helps you understand your emotions and build healthier habits.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="seren-button-primary text-lg px-8 py-4">
                  Get started
                  <ArrowRight size={20} className="ml-2" />
                </Link>
                <Link to="/login" className="seren-button text-lg px-8 py-4">
                  Sign in
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-[var(--seren-text-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>10,000+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>100% free</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--seren-accent)] rounded-3xl transform rotate-3 opacity-50"></div>
              <div className="relative seren-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--seren-text-secondary)]">Daily Check-in</span>
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-lg mb-6">How are you feeling today?</p>
                    <div className="flex justify-center gap-4">
                      {['😊', '😐', '😔', '😰'].map((emoji, i) => (
                        <button
                          key={i}
                          className="w-14 h-14 rounded-2xl bg-gray-50 hover:bg-[var(--seren-accent)] transition-colors text-2xl flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">This week</span>
                      <span className="text-sm text-[var(--seren-text-secondary)]">Avg: 6.5</span>
                    </div>
                    <div className="flex items-end gap-1 h-20">
                      {[4, 6, 5, 7, 6, 8, 7].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[var(--seren-accent)] rounded-t"
                          style={{ height: `${h * 10}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Everything you need to feel better
            </h2>
            <p className="text-lg text-[var(--seren-text-secondary)] max-w-2xl mx-auto">
              SerenSpace combines mood tracking, coping tools, and community support 
              in one simple app.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="seren-card p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[var(--seren-accent)]/20 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-[var(--seren-text)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-[var(--seren-text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              How SerenSpace works
            </h2>
            <p className="text-lg text-[var(--seren-text-secondary)]">
              Three simple steps to better mental wellness
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Check in',
                description: 'Log how you feel in seconds. No pressure, just honest reflection.',
              },
              {
                step: '2',
                title: 'Explore',
                description: 'Get insights and tools matched to your mood and patterns.',
              },
              {
                step: '3',
                title: 'Grow',
                description: 'Build habits that help over time. Small steps, big changes.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--seren-accent)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {item.title}
                </h3>
                <p className="text-[var(--seren-text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8 bg-[var(--seren-bg-secondary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-3xl lg:text-4xl font-bold mb-6"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Start your journey today
          </h2>
          <p className="text-lg text-[var(--seren-text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of people who are taking control of their mental wellness. 
            It's free, private, and takes less than a minute to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="seren-button-primary text-lg px-8 py-4">
              Create free account
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--seren-accent)] flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                SerenSpace
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-[var(--seren-text-secondary)]">
              <Link to="/login" className="hover:text-[var(--seren-text)] transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-[var(--seren-text)] transition-colors">Sign up</Link>
              <a href="#" className="hover:text-[var(--seren-text)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--seren-text)] transition-colors">Terms</a>
            </div>
            
            <p className="text-sm text-[var(--seren-text-secondary)]">
              © 2026 SerenSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
