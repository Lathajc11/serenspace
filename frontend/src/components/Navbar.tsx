import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  CalendarPlus,
  Sparkles,
  Users,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/check-in', label: 'Check In', icon: CalendarPlus },
  { path: '/tools', label: 'Tools', icon: Sparkles },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Navbar(): JSX.Element {
  const { currentUser, logout, userProfile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--seren-accent)] flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
              SerenSpace
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--seren-accent)] text-[var(--seren-text)]'
                    : 'text-[var(--seren-text-secondary)] hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[var(--seren-accent)] flex items-center justify-center">
              <span className="text-sm font-medium">
                {userProfile?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-[var(--seren-text-secondary)] truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-[var(--seren-text-secondary)] hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 lg:hidden z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--seren-accent)] flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
              SerenSpace
            </span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--seren-accent)] text-[var(--seren-text)]'
                        : 'text-[var(--seren-text-secondary)] hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-[var(--seren-text-secondary)] hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
}
