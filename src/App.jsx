import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
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
          <nav className="border-b border-gray-800/50 p-4 mb-8 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
            {/* 
              Koristimo flex-col za mobilne (elementi jedan ispod drugog), 
              a md:flex-row za velike ekrane (logotipi levo, linkovi desno).
            */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* LOGOI (Ovo će sada biti na vrhu na mobilnom, ili levo na kompjuteru) */}
              <div className="flex items-center justify-center gap-4 w-full md:w-auto">
                <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <img src="/moj-logo1.png" alt="Logo 1" className="h-32 w-auto object-contain drop-shadow-md" />
                  <img src="/moj-logo2.png" alt="Logo 2" className="h-32 w-auto object-contain drop-shadow-md" />
                </Link>
              </div>

              {/* LINKOVI (Sada se slažu jedan ispod drugog, centrirani) */}
              <div className="flex flex-col items-center justify-center gap-3 w-full md:w-auto">
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
                >
                  Rezervacija
                </Link>
                <Link 
                  to="/admin" 
                  className="bg-palic-blue/20 border border-palic-blue/50 text-white px-5 py-2 rounded-full hover:bg-palic-blue transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                >
                  Zaposleni
                </Link>
              </div>

            </div>
          </nav>


          {/* GLAVNI KONTEJNER ZA STRANICE */}
          <main className="max-w-6xl mx-auto p-4 pb-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

        </div>
      </div>
    </Router>
  );
}

export default App;
