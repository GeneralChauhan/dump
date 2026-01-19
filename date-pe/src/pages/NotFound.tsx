
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloom-gray p-4">
      <div className="text-center max-w-md glass p-8 rounded-2xl animate-fade-in">
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-bloom-dark-gray mb-8">
          Oops! This page hasn't bloomed yet.
        </p>
        <Link
          to="/"
          className="px-8 py-3 rounded-full bg-bloom-blue text-white font-medium shadow-lg shadow-bloom-blue/30 transition-transform hover:translate-y-[-2px] inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
