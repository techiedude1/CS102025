import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'; // 👈 Use Svelte, not React
import { fileURLToPath, URL } from 'url'; // 👈 Import this to fix the path alias

export default defineConfig(({ mode }) => {
    // 👇 Load env variables INSIDE the function
    const env = loadEnv(mode, '.', ''); 

    return {
        // 👇 All config options go INSIDE this 'return' object
      
        plugins: [svelte()], // 👈 Use the Svelte plugin

        base: '/CS102025/', // 👈 Your GitHub Pages path

        server: {
          port: 3000,
          host: '0.0.0.0',
        },

        define: {
          'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
          'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        resolve: {
          alias: {
            // 👇 This is the correct way to set an alias in an ES Module
              '@': fileURLToPath(new URL('.', import.meta.url)) 
          }
        }
    };
});
