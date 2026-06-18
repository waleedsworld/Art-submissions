import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Image, Star, Award, Rocket, CheckCircle, Wand2, ChevronLeft, ChevronRight, ArrowRight, Loader2, Search, X, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { parseImageData } from "@/lib/utils";
import type { ImageRecord } from "@/types/api";
import Footer from "@/components/Footer";
import useEmblaCarousel from 'embla-carousel-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const inspirationArtworks = [{
  id: 1,
  title: "Innocence Under Siege",
  artist: "Waleed Ajmal",
  grade: "Grade IS2A",
  imageUrl: "https://i.ibb.co/Fk1fHsXF/0-0.jpg"
}, {
  id: 2,
  title: "Duty and Destruction",
  artist: "Shaheer Afzal",
  grade: "Grade IS2A",
  imageUrl: "https://i.ibb.co/m5JPMRGm/0-3-3.jpg"
}, {
  id: 3,
  title: "Honor in the Arena",
  artist: "Mansoor Ahmed Toor",
  grade: "Grade IS2A",
  imageUrl: "https://i.ibb.co/vv1LQqZw/0-1.jpg"
}];

const features = [{
  icon: <Image className="w-6 h-6 text-primary" />,
  title: "Showcase Your Art",
  description: "Share your creative work with the school community"
}, {
  icon: <Star className="w-6 h-6 text-primary" />,
  title: "Get Recognition",
  description: "Have your artwork featured in our curated gallery"
}, {
  icon: <Award className="w-6 h-6 text-primary" />,
  title: "Win Awards",
  description: "Outstanding artworks receive special recognition"
}, {
  icon: <Rocket className="w-6 h-6 text-primary" />,
  title: "Inspire Others",
  description: "Your art can inspire fellow students to create"
}];

// Feature: gallery search. Match a submission against a free-text query by
// looking across its title, student name, grade and (for AI pieces) the
// generator/prompt metadata so visitors can find a specific artwork fast.
const submissionMatchesQuery = (submission: ImageRecord, query: string): boolean => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const details = parseImageData(submission.datefield);
  const haystack = [
    details.title,
    details.studentName,
    details.grade,
    details.aiGenerator,
    details.aiPrompt,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(trimmed);
};

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-white text-lg">Loading Art Gallery...</p>
    </div>
  </div>
);

const ArtworkGrid = ({ submissions, title }: { submissions: ImageRecord[], title: string }) => {
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const displayedSubmissions = showAll ? submissions : submissions.slice(0, 6);

  const handleImageSelect = (submission: ImageRecord) => {
    const index = submissions.findIndex(s => s.id === submission.id);
    setSelectedIndex(index);
    setSelectedImage(submission);
  };

  const handleNext = () => {
    if (selectedIndex < submissions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedImage(submissions[selectedIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedImage(submissions[selectedIndex - 1]);
    }
  };

  // Feature: keyboard navigation for the lightbox. Left/right arrows step
  // through the currently open collection; the Dialog itself handles Escape.
  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // handleNext/handlePrevious close over selectedIndex, so re-bind on change.
  }, [selectedImage, selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Feature: let visitors save the artwork they are viewing. We fetch the image
  // as a blob so the download works cross-origin instead of just navigating.
  const handleDownload = async (submission: ImageRecord) => {
    const details = parseImageData(submission.datefield);
    try {
      const response = await fetch(api.getImageById(submission.id));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${details.title || "artwork"}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download artwork:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        {submissions.length > 6 && (
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/90"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'View All'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayedSubmissions.map((submission) => {
            const details = parseImageData(submission.datefield);
            return (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative cursor-pointer flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 first:pl-0"
                onClick={() => handleImageSelect(submission)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={api.getImageById(submission.id)}
                    alt={details.title}
                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <p className="text-sm text-primary">{details.grade}</p>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">{details.title}</h3>
                      <p className="text-gray-300">{details.studentName}</p>
                      {details.type === "ai" && (
                        <div className="mt-2 text-sm text-gray-400">
                          <p>AI: {details.aiGenerator}</p>
                          <p className="truncate">Prompt: {details.aiPrompt}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {!showAll && submissions.length > 3 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => {
              if (emblaApi) emblaApi.scrollPrev();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => {
              if (emblaApi) emblaApi.scrollNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-black/90">
          {selectedImage && (
            <div className="relative">
              <img
                src={api.getImageById(selectedImage.id)}
                alt={parseImageData(selectedImage.datefield).title}
                className="w-full h-full object-contain max-h-[80vh]"
              />
              
              {/* Download the currently viewed artwork */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedImage);
                }}
                title="Download artwork"
              >
                <Download className="h-5 w-5" />
              </Button>

              {/* Navigation Buttons */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={selectedIndex === submissions.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {parseImageData(selectedImage.datefield).title}
                </h3>
                <p className="text-gray-300">
                  {parseImageData(selectedImage.datefield).studentName} - {parseImageData(selectedImage.datefield).grade}
                </p>
                {parseImageData(selectedImage.datefield).type === "ai" && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>AI: {parseImageData(selectedImage.datefield).aiGenerator}</p>
                    <p>Prompt: {parseImageData(selectedImage.datefield).aiPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index = () => {
  const [aiSubmissions, setAiSubmissions] = useState<ImageRecord[]>([]);
  const [handDrawnSubmissions, setHandDrawnSubmissions] = useState<ImageRecord[]>([]);
  const [competitionWinners, setCompetitionWinners] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Feature: derive the visible collections from the live search query so every
  // gallery section reacts to the same search box.
  const filteredWinners = competitionWinners.filter((s) => submissionMatchesQuery(s, searchQuery));
  const filteredAi = aiSubmissions.filter((s) => submissionMatchesQuery(s, searchQuery));
  const filteredHandDrawn = handDrawnSubmissions.filter((s) => submissionMatchesQuery(s, searchQuery));
  const hasSearch = searchQuery.trim().length > 0;
  const totalMatches = filteredWinners.length + filteredAi.length + filteredHandDrawn.length;

  useEffect(() => {
    document.title = "Art Submissions";
  }, []);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await api.getImages('true');
        console.log('Received approved submissions:', data);
        
        const sortedSubmissions = data.reduce((acc: { ai: ImageRecord[], handDrawn: ImageRecord[], winners: ImageRecord[] }, submission: ImageRecord) => {
          try {
            const details = parseImageData(submission.datefield);
            if (details.type === "ai") {
              acc.ai.push(submission);
            } else {
              acc.handDrawn.push(submission);
            }
            if (details.fromCheckDashboard) {
              acc.winners.push(submission);
            }
          } catch (error) {
            console.error('Error parsing submission data:', error, submission);
          }
          return acc;
        }, { ai: [], handDrawn: [], winners: [] });

        console.log('Sorted submissions:', sortedSubmissions);
        setAiSubmissions(sortedSubmissions.ai);
        setHandDrawnSubmissions(sortedSubmissions.handDrawn);
        setCompetitionWinners(sortedSubmissions.winners);
      } catch (error) {
        console.error('Failed to load submissions:', error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadSubmissions();
  }, []);

  const handleTypeSelection = (type: "ai" | "handdrawn") => {
    setShowTypeDialog(false);
    navigate(`/upload?type=${type}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 -z-10" />
      
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-6 py-16 md:py-24 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Student Art Gallery
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover and celebrate the artistic talent of our students through their creative expressions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowTypeDialog(true)}
            >
              <Plus className="mr-2" />
              Submit Your Artwork
            </Button>
            <a href="https://www.writecream.com/ai-image-generator-free-no-sign-up/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Wand2 className="mr-2" />
                Try AI Art Generator
              </Button>
            </a>
          </div>
        </motion.div>
      </motion.header>

      {/* Type Selection Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Select Artwork Type</DialogTitle>
          <DialogDescription>
            Please specify the type of artwork you're submitting
          </DialogDescription>
          
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => handleTypeSelection("ai")}
              variant="outline"
              className="w-full"
            >
              AI Generated Art
            </Button>
            <Button
              onClick={() => handleTypeSelection("handdrawn")}
              variant="outline"
              className="w-full"
            >
              Hand Drawn Art
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 px-6 py-16 bg-black/30"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Submit Your Art?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass p-6 rounded-xl text-center"
              >
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Inspiration Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 px-6 py-16"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Featured Inspirational Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inspirationArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <p className="text-sm text-primary">{artwork.grade}</p>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">{artwork.title}</h3>
                      <p className="text-gray-300">{artwork.artist}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Gallery Search Bar — filters every live gallery section below */}
      {(aiSubmissions.length > 0 || handDrawnSubmissions.length > 0) && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 px-6 pt-16 pb-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks by title, artist, grade or prompt…"
                aria-label="Search artworks"
                className="pl-12 pr-12 h-12 bg-black/40 border-white/15 text-white placeholder:text-gray-500"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {hasSearch && (
              <p className="mt-3 text-sm text-gray-400">
                {totalMatches === 0
                  ? "No artworks match your search."
                  : `Showing ${totalMatches} matching ${totalMatches === 1 ? "artwork" : "artworks"}.`}
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* Competition Winners Section */}
      {filteredWinners.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 px-6 py-16"
        >
          <ArtworkGrid
            submissions={filteredWinners}
            title="Competition Winners"
          />
        </motion.section>
      )}

      {/* AI Submissions Section */}
      {filteredAi.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 px-6 py-16 bg-black/30"
        >
          <ArtworkGrid
            submissions={filteredAi}
            title="AI Generated Artworks"
          />
        </motion.section>
      )}

      {/* Hand Drawn Submissions Section */}
      {filteredHandDrawn.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="relative z-10 px-6 py-16"
        >
          <ArtworkGrid
            submissions={filteredHandDrawn}
            title="Hand Drawn Artworks"
          />
        </motion.section>
      )}

      {/* No Submissions Message */}
      {!loading && aiSubmissions.length === 0 && handDrawnSubmissions.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p>No approved submissions yet. Be the first to submit your artwork!</p>
          <Button 
            variant="outline"
            onClick={() => setShowTypeDialog(true)}
            className="inline-flex mt-4"
          >
            <Plus className="mr-2" />
            Submit Artwork
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Index;
