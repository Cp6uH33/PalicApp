/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palic: {
          blue: '#3b82f6',      // Zadržavamo plavu za dugmiće i akcente
          light: '#111827',     // OVO JE SADA TAMNA (Tamno siva/crna)
          dark: '#f8fafc',      // OVO JE SADA SVETLA (Bela za tekst)
          accent: '#2563eb',    // Tamnija plava za hover
          card: '#1f2937'       // Boja za same kartice/forme (malo svetlija crna)
        }
      }
    },
  },
  plugins: [],
}
