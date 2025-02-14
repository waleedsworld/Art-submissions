
import axios from "axios";

const API_BASE_URL = "https://imageprocessing.applytocollege.pk";

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
);

export const api = {
  uploadImage: async (formData: FormData) => {
    // Remove Content-Type header to let the browser set it with the boundary
    const response = await axiosInstance.post("/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUnmarkedImage: async () => {
    const response = await axiosInstance.get("/unmarked");
    return response.data;
  },

  getImageById: (id: string) => `${API_BASE_URL}/image/${id}`,

  markImage: async (id: string, marking: boolean) => {
    const response = await axiosInstance.put(`/mark/${id}`, { marking });
    return response.data;
  },

  getImages: async (marking?: 'true' | 'false' | 'unmarked') => {
    try {
      console.log('Fetching images with params:', { marking });
      
      // Only add marking parameter if it's specified
      const params = marking ? { marking } : undefined;
      
      const response = await axiosInstance.get("/images", { params });
      
      // API always returns an array of image records
      const data = response.data;
      console.log('Received images:', data);
      
      // Type check the response
      if (!Array.isArray(data)) {
        console.warn('API did not return an array:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Failed to fetch images:", error);
      throw error;
    }
  }
};
