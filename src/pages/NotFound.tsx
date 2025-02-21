
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from '@/components/Header';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-gray-400 mb-4">Página no encontrada</p>
          <a href="/" className="text-blue-500 hover:text-blue-400 underline">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
