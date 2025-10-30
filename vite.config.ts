import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath, URL } from 'url'; // This is needed for the path alias

// This is the main function that configures Vite
export default defineConfig(({ mode }) => {
    
    // 1. Load environment variables (like your API key)
    const env = loadEnv(mode, '.', ''); 

    // 2. Return ONE configuration object
    return {
        
        // Use the Svelte plugin (not React)
        plugins: [svelte()],

        // Your base path for GitHub Pages
        base: '/CS102025/', 

        // Server settings
        server: {
          port: 3000,
          host: '0.0.0.0',
        },

        // Make the API key available in your app's code
        define: {
          'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
          'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        // Set up the '@' path alias correctly
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('.', import.meta.url))A
          }
        }
    };
});
