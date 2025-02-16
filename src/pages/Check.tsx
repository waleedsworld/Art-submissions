import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Upload, Filter, Image, Eye } from "lucide-react";
import { parseImageData, formatDate } from "@/lib/utils";

interface ImageDisplay {
  id: string;
  studentName: string;
  grade: string;
  title: string;
  timestamp: string;
  marking: boolean | null;
  url?: string;
}

const Check = () => {
  useEffect(() => {
    document.title = "Check Submissions - LGS JTI ART SUBMISSIONS";
  }, []);

  const [displayedImages, setDisplayedImages] = useState<ImageDisplay[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [imageId, setImageId] = useState("");
  const [viewImageId, setViewImageId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const processImageData = (data: any) => {
    if (Array.isArray(data)) {
      return data.map(img => ({
        id: img.id,
        ...parseImageData(img.datefield),
        timestamp: formatDate(img.timestamp),
        marking: img.marking,
        url: api.getImageById(img.id)
      }));
    } else if (data.id) {
      return [{
        id: data.id,
        ...parseImageData(data.datefield),
        timestamp: formatDate(data.timestamp),
        marking: data.marking,
        url: api.getImageById(data.id)
      }];
    }
    return [];
  };

  const getImages = async (filter?: 'true' | 'false' | 'unmarked') => {
    try {
      setLoading('getImages');
      const result = await api.getImages(filter);
      setDisplayedImages(processImageData(result));
      toast({
        title: "Success",
        description: "Retrieved images successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get images",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getUnmarkedImage = async () => {
    try {
      setLoading('getUnmarked');
      const result = await api.getUnmarkedImage();
      setDisplayedImages(processImageData([result]));
      toast({
        title: "Success",
        description: "Retrieved unmarked image successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get unmarked image",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const markImage = async (id: string, marking: boolean) => {
    try {
      setLoading('markImage');
      await api.markImage(id, marking);
      // Update the local state
      setDisplayedImages(prev => 
        prev.map(img => 
          img.id === id ? { ...img, marking } : img
        )
      );
      toast({
        title: "Success",
        description: `Image marked as ${marking ? 'approved' : 'rejected'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark image",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const uploadImage = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading('uploadImage');
      const formData = new FormData();
      formData.append('image', file);
      const result = await api.uploadImage(formData);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      // Refresh the image list after upload
      getImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Review Dashboard</h1>

        <div className="grid gap-8">
          {/* Controls Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Filter Images</h2>
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => getImages()}
                  disabled={loading === 'getImages'}
                  variant="outline"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  All Images
                </Button>
                <Button
                  onClick={() => getImages('unmarked')}
                  disabled={loading === 'getImages'}
                  variant="outline"
                >
                  Unmarked
                </Button>
                <Button
                  onClick={() => getImages('true')}
                  disabled={loading === 'getImages'}
                  variant="outline"
                >
                  Approved
                </Button>
                <Button
                  onClick={() => getImages('false')}
                  disabled={loading === 'getImages'}
                  variant="outline"
                >
                  Rejected
                </Button>
                <Button
                  onClick={getUnmarkedImage}
                  disabled={loading === 'getUnmarked'}
                  variant="outline"
                >
                  <Image className="mr-2 h-4 w-4" />
                  Next Unmarked
                </Button>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="bg-gray-700 border-gray-600"
                    accept="image/*"
                  />
                </div>
                <Button
                  onClick={uploadImage}
                  disabled={loading === 'uploadImage'}
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Images Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedImages.map((image) => (
              <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Image Preview */}
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'placeholder.svg';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    {image.marking === true && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                        Approved
                      </span>
                    )}
                    {image.marking === false && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Image Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{image.title}</h3>
                  <p className="text-gray-400">Student: {image.studentName}</p>
                  <p className="text-gray-400">Grade: {image.grade}</p>
                  <p className="text-gray-400 text-sm">{image.timestamp}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => markImage(image.id, true)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading === 'markImage'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => markImage(image.id, false)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading === 'markImage'}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {displayedImages.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400">
                  No images to display. Use the controls above to load images.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;
