/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    basePath: '',
    output: 'export',
    
    // Disable image optimization for static export
    images: {
        unoptimized: true
    },
    devIndicators: false,
    // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
    // trailingSlash: true,

    // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
    // skipTrailingSlashRedirect: true,

    // Optional: Change the output directory `out` -> `dist`
    // distDir: 'dist',
}

module.exports = nextConfig