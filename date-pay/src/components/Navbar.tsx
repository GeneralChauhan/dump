
import { useState, useEffect } from 'react';
import { MenuIcon, X, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check authentication status
    setIsLoggedIn(localStorage.getItem('isAuthenticated') === 'true');
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-coral-500 to-coral-600 bg-clip-text text-transparent">DatePay</span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-8">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={`text-sm font-medium ${location.pathname === '/dashboard' ? 'text-coral-500' : 'text-gray-700 hover:text-coral-500'} transition-colors`}>
                  Dashboard
                </Link>
                <Link to="/browse" className={`text-sm font-medium ${location.pathname === '/browse' ? 'text-coral-500' : 'text-gray-700 hover:text-coral-500'} transition-colors`}>
                  Browse
                </Link>
                <Link to="/referrals" className={`text-sm font-medium ${location.pathname === '/referrals' ? 'text-coral-500' : 'text-gray-700 hover:text-coral-500'} transition-colors`}>
                  Referrals
                </Link>
              </>
            ) : (
              <>
                <a href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-coral-500 transition-colors">
                  How It Works
                </a>
                <a href="/about" className="text-sm font-medium text-gray-700 hover:text-coral-500 transition-colors">
                  About Us
                </a>
              </>
            )}
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <>
                <Link to="/create-date">
                  <Button className="bg-coral-500 hover:bg-coral-600 text-white">
                    <Plus size={16} className="mr-1" /> Create Date
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="border-coral-200 text-coral-600 hover:bg-coral-50">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-coral-500 hover:bg-coral-600 text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              className="text-gray-700 hover:text-coral-500 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in">
          <div className="container mx-auto px-4 pt-2 pb-4 space-y-1">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-coral-50 hover:text-coral-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-coral-50 hover:text-coral-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link
                  to="/referrals"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-coral-50 hover:text-coral-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Referrals
                </Link>
                <Link
                  to="/create-date"
                  className="block px-3 py-2 rounded-md text-base font-medium text-coral-600 hover:bg-coral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Date
                </Link>
              </>
            ) : (
              <>
                <a
                  href="/how-it-works"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-coral-50 hover:text-coral-500"
                >
                  How It Works
                </a>
                <a
                  href="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-coral-50 hover:text-coral-500"
                >
                  About Us
                </a>
                <div className="pt-4 flex flex-col space-y-2">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-coral-200 text-coral-600 hover:bg-coral-50">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-coral-500 hover:bg-coral-600 text-white">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
