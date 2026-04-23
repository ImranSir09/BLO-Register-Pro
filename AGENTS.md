# Project Custom Instructions

## PWA and Deployment Preservation
The following files and sections are critical for PWA functionality and deployment. Do **NOT** overwrite or remove these during future updates unless specifically requested:

- **index.html**:
  - The PWA manifest link: `<link rel="manifest" href="/manifest.json" />`
  - The apple touch icon: `<link rel="apple-touch-icon" href="/icon-192.png" />`
  - The theme color meta tag: `<meta name="theme-color" content="#4f46e5" />`
  - The Service Worker registration script at the end of the `<body>`.
- **public/manifest.json**: Contains the PWA manifest configuration.
- **public/sw.js**: Contains the Service Worker logic for offline support.
- **public/icon-192.png** and **public/icon-512.png**: These are the application icons.

## Theme Configuration
- The custom indigo/violet theme defined in the Tailwind configuration within `index.html` should be preserved.
