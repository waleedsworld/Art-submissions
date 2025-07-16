import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Frame } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 Not Found - Art Submissions";
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <div className="glass rounded-2xl p-10 md:p-14 text-center max-w-md">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Frame className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-lg text-gray-300 mb-2">This canvas is blank.</p>
        <p className="text-sm text-gray-400 mb-8">
          The page you're looking for isn't hanging in our gallery.
        </p>
        <Link to="/">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Home className="mr-2 h-4 w-4" />
            Back to the Gallery
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
