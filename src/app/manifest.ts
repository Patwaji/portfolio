import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arc Reactor Portfolio | Suryansh',
    short_name: 'Arc Portfolio',
    description: 'Interactive portfolio powered by Arc Reactor technology',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00E6FF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Add more icon sizes as needed
      // {
      //   src: '/icons/icon-192x192.png',
      //   sizes: '192x192',
      //   type: 'image/png',
      // },
      // {
      //   src: '/icons/icon-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      // },
    ],
  }
}
