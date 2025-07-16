import { Link } from "react-router-dom";
import { Palette } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
                <Palette className="w-5 h-5 text-primary" />
              </span>
              <span className="text-lg font-semibold text-white">Art Submissions</span>
            </Link>
            <p className="text-sm text-gray-400">
              A student art gallery for showcasing hand-drawn and AI-generated work.
              Made with care for young artists everywhere.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-gray-500 uppercase tracking-wide text-xs mb-1">Explore</span>
              <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link to="/upload?type=handdrawn" className="text-gray-300 hover:text-primary transition-colors">
                Submit Artwork
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-500 uppercase tracking-wide text-xs mb-1">Curate</span>
              <Link to="/check" className="text-gray-300 hover:text-primary transition-colors">
                Review Dashboard
              </Link>
              <Link to="/api-test" className="text-gray-300 hover:text-primary transition-colors">
                API Playground
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
          © {year} Art Submissions · Crafted by Waleed Ajmal
        </div>
      </div>
    </footer>
  );
};

export default Footer;
