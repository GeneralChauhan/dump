
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    setIsLoggedIn(localStorage.getItem('isAuthenticated') === 'true');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-coral-50 bg-mesh-pattern">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Floating action button for creating dates - only shown when logged in */}
      {isLoggedIn && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Link to="/create-date">
            <Button size="icon" className="h-14 w-14 rounded-full bg-coral-500 hover:bg-coral-600 text-white shadow-lg">
              <Plus size={24} />
            </Button>
          </Link>
        </div>
      )}
      
      <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-gray-500">© 2023 DatePay. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-coral-500 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-coral-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-coral-500 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
