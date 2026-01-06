import axios from 'axios';

// Use Vercel API in production, localhost in development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const pagesAPI = {
  // Get all pages
  getAll: async () => {
    try {
      const response = await api.get('/pages');
      return response.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  // Get single page by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/pages?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  },

  // Create new page
  create: async (pageData) => {
    try {
      const response = await api.post('/pages', {
        ...pageData,
        createdAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  },

  // Update existing page
  update: async (id, pageData) => {
    try {
      const response = await api.put(`/pages?id=${id}`, {
        ...pageData,
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  },

  // Delete page
  delete: async (id) => {
    try {
      await api.delete(`/pages?id=${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  },
};

// Image utilities with security enhancements
export const imageUtils = {
  // Convert file to Base64 (for storage)
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Validate image file with security checks
  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // Reduced to 2MB for better performance

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.');
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Please upload images smaller than 2MB.');
    }

    // Additional security: Check file signature
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target.result).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        
        // Check magic numbers for common image formats
        const validHeaders = [
          'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8', // JPEG
          '89504e47', // PNG
          '47494638', // GIF
          '52494646', // WebP
        ];
        
        if (validHeaders.some(validHeader => header.startsWith(validHeader))) {
          resolve(true);
        } else {
          reject(new Error('Invalid image file format detected.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to validate image.'));
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  },

  // Compress image before upload
  compressImage: (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },
};

export default api;