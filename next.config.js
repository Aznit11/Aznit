/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com', 
      'source.unsplash.com',
      'drive.google.com',
      'lh3.googleusercontent.com', // For Google Drive direct links
      'drive.googleusercontent.com' // Another possible Google Drive domain
    ],
  },
};

module.exports = nextConfig; 