import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      {/* OVDE DODAJEMO SLIKU ZA POZADINU CELE APLIKACIJE */}
      <div
        className="min-h-screen font-sans text-gray-100 selection:bg-palic-blue selection:text-white relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-palic1.jpg')",
        }}

      >
        {/* ZATAMNJENI PREKOJ (Overlay) - Da bi se tekst i forme bolje videli */}
        <div className="absolute inset-0 bg-gray-950/50"></div>

        {/* Sadržaj aplikacije mora da ide PREKO zatamnjenog sloja */}
        <div className="relative z-10">

          {/* NAVIGACIJA - Sada je malo providna (Stakleni efekat) */}
                    {/* NAVIGACIJA - Poboljšan dizajn za sve ekrane */}
          <nav className="border-b border-gray-700/50 p-4 mb-8 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-center">
              <div className="flex items-center justify-center gap-6">
                <img src="/moj-logo1.png" alt="Logo 1" className="h-32 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
                <div className="w-px h-16 bg-gray-600"></div>
                <img src="/moj-logo2.png" alt="Logo 2" className="h-32 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
              </div>
            </div>
          </nav>


          {/* GLAVNI KONTEJNER ZA STRANICE */}
          <main className="max-w-6xl mx-auto p-4 pb-20">
            <Routes>
              <Route path="/" element={<AdminPage />} />
            </Routes>
          </main>

        </div>
      </div>
    </Router>
  );
}

export default App;
