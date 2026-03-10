import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CalendarDays, MapPin, CheckCircle2, User, Phone } from 'lucide-react';

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    checkIn: '',
    checkOut: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, "reservations"), {
        ...formData,
        source: "Direktno sa sajta",
        createdAt: new Date()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Greška:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden mt-6">

        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Hvala na rezervaciji!</h2>
        <p className="text-gray-400 mb-8 text-lg">
          Vaš zahtev za apartman na Paliću je uspešno poslat. <br/>
          Kontaktiraćemo vas uskoro putem WhatsApp-a ili Vibera za potvrdu.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', phone: '', city: '', checkIn: '', checkOut: '' });
          }}
          className="bg-gray-800 text-white border border-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-700 hover:border-gray-600 transition-all"
        >
          Zakaži novi termin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mt-6">
      
      {/* HEADER FORME */}
      <div className="bg-gray-950/40 border-b border-white/10 p-10 text-center">
        <div className="w-16 h-16 bg-palic-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <MapPin className="w-8 h-8 text-palic-blue -rotate-3" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
          Rezervišite Vaš Odmor
        </h1>
        <p className="text-gray-400 font-medium">Uživajte u lepoti Palićkog jezera</p>
      </div>

      {/* TELO FORME */}
      <div className="p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ime */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" /> Ime i Prezime *
              </label>
              <input 
                required type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 focus:outline-none focus:border-palic-blue focus:ring-1 focus:ring-palic-blue transition-colors"
                placeholder="Npr. Petar Petrović"
              />
            </div>
            
            {/* Telefon */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" /> Broj telefona *
              </label>
              <input 
                required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 focus:outline-none focus:border-palic-blue focus:ring-1 focus:ring-palic-blue transition-colors"
                placeholder="+381 60 123 4567"
              />
              <p className="text-xs text-gray-500">Za Viber / WhatsApp</p>
            </div>
          </div>

          {/* Grad */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Mesto / Država</label>
            <input 
              required type="text" name="city" value={formData.city} onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 focus:outline-none focus:border-palic-blue focus:ring-1 focus:ring-palic-blue transition-colors"
              placeholder="Odakle dolazite? (Npr. Beograd, Srbija)"
            />
          </div>

          {/* Datumi */}
          <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 mt-8">
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-palic-blue" />
              Period boravka
            </h3>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Check-in (Od)</label>
                <input 
                  required type="date" name="checkIn" value={formData.checkIn} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-palic-blue custom-date-input" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Check-out (Do)</label>
                <input 
                  required type="date" name="checkOut" value={formData.checkOut} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-palic-blue custom-date-input" 
                />
              </div>
            </div>
          </div>

          {/* Dugme za slanje */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-palic-blue hover:bg-palic-accent text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-palic-blue/20 disabled:opacity-50 text-lg mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Slanje u toku...</span>
            ) : (
              'Pošalji zahtev za rezervaciju'
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4 flex justify-center gap-4">
            <span>🔒 Siguran prenos</span>
            <span>💳 Plaćanje po dolasku</span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default HomePage;
