/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimize images from Supabase storage
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },

    // Prevent bcryptjs from being bundled into serverless functions
    serverExternalPackages: ["bcryptjs"],
};

module.exports = nextConfig;
