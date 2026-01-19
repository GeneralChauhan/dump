
import React, { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Heart, MessageCircle, Users } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

const AppLayout = ({ children, hideNavigation = false }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only apply keyboard navigation when not in an input field
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'r':
          navigate('/');
          break;
        case 'm':
          navigate('/matches');
          break;
        case 'h':
          navigate('/referrals');
          break;
        case 'c':
          navigate('/chat');
          break;
        case 'p':
          navigate('/profile');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-bloom-gray">
      <main className="flex-grow pb-20">
        <div className="page-transition-enter">{children}</div>
      </main>

      {!hideNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white glass shadow-lg border-t border-gray-100 z-50">
          <div className="max-w-md mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              <NavItem to="/" icon={<Home />} isActive={isActive("/")} label="Home" accessKey="h" />
              <NavItem to="/matches" icon={<Heart />} isActive={isActive("/matches")} label="Matches" accessKey="m" />
              <NavItem to="/referrals" icon={<Users />} isActive={isActive("/referrals")} label="Referrals" accessKey="r" />
              <NavItem to="/chat" icon={<MessageCircle />} isActive={isActive("/chat")} label="Chat" accessKey="c" />
              <NavItem to="/profile" icon={<User />} isActive={isActive("/profile")} label="Profile" accessKey="p" />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: ReactNode;
  isActive: boolean;
  label: string;
  accessKey: string;
}

const NavItem = ({ to, icon, isActive, label, accessKey }: NavItemProps) => (
  <Link
    to={to}
    accessKey={accessKey}
    className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
      isActive ? "text-bloom-yellow" : "text-bloom-dark-gray"
    }`}
  >
    <div className={`w-6 h-6 mb-1 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
    <span className="sr-only">Press {accessKey} to navigate</span>
  </Link>
);

export default AppLayout;
