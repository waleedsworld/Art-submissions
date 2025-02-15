
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const Upload = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") as "ai" | "handdrawn" | null;

  useEffect(() => {
    document.title = "Upload Artwork - LGS JTI ART SUBMISSIONS";
  }, []);

  const [image, setImage] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submissionType] = useState<"ai" | "handdrawn" | null>(initialType);
  const [aiGenerator, setAiGenerator] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialType) {
      navigate('/');
    }
  }, [initialType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !studentName || !grade || !title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select an image",
        variant: "destructive",
      });
      return;
    }

    if (submissionType === "ai" && (!aiGenerator || !aiPrompt)) {
      toast({
        title: "Missing AI Information",
        description: "Please provide the AI generator name and prompt used",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("datefield", JSON.stringify({
      studentName,
      grade,
      title,
      type: submissionType,
      ...(submissionType === "ai" ? { aiGenerator, aiPrompt } : {})
    }));

    try {
      console.log('Uploading file:', image.name, 'Type:', image.type, 'Size:', image.size);
      await api.uploadImage(formData);
      toast({
        title: "Success!",
        description: "Your artwork has been uploaded successfully",
      });
      navigate("/");
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your artwork. Please ensure it's a valid image file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      setImage(selectedFile);
    }
  };

  if (!submissionType) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 -z-10" />
      
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-white hover:text-gray-300 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-8">
            Submit {submissionType === "ai" ? "AI Generated" : "Hand Drawn"} Artwork
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Student Name
              </label>
              <Input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Grade
              </label>
              <Input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full"
                placeholder="e.g. Grade 11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Artwork Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                placeholder="Give your artwork a title"
              />
            </div>

            {submissionType === "ai" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    AI Generator Used
                  </label>
                  <Input
                    type="text"
                    value={aiGenerator}
                    onChange={(e) => setAiGenerator(e.target.value)}
                    className="w-full"
                    placeholder="e.g. DALL-E, Midjourney"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Prompt Used
                  </label>
                  <Input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full"
                    placeholder="Enter the prompt used to generate the image"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Upload Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || !image}
            >
              {isUploading ? "Uploading..." : "Submit Artwork"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
