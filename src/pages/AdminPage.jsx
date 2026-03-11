import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Phone, MapPin, Calendar, MessageCircle, Smartphone, Trash2, Lock } from 'lucide-react';

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [guests, setGuests] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    // NOVO: Stanja za n8n i učitavanje
    const [isLoading, setIsLoading] = useState(false);
    const [sendToN8n, setSendToN8n] = useState(true);

    // FUNKCIJA ZA FORMATIRANJE DATUMA (Iz yyyy-mm-dd u dd.mm.yyyy)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}.`;
        }
        return dateString;
    };

    // Čitanje podataka
    useEffect(() => {
        if (!isAuthenticated) return;
        const q = query(collection(db, "reservations"), orderBy("checkIn", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const guestsArray = [];
            snapshot.forEach((doc) => {
                guestsArray.push({ id: doc.id, ...doc.data() });
            });
            setGuests(guestsArray);
        });
        return () => unsubscribe();
    }, [isAuthenticated]);

    // NOVO: Ažurirani handleSubmit sa n8n integracijom
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const newReservation = {
                name, phone, city, checkIn, checkOut,
                source: "Booking/Ručno",
                createdAt: new Date().toISOString()
            };

            // 1. Čuvanje u Firebase
            await addDoc(collection(db, "reservations"), newReservation);

            // 2. Slanje u n8n (ako je checkbox štikliran)
            if (sendToN8n) {
                // VAZNO: Ovde ubaci svoj n8n Test URL (ili Production URL kasnije)
                const n8nWebhookUrl = "https://lakepalic.app.n8n.cloud/webhook-test/nova-rezervacija";

                await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newReservation)
                });
            }

            // 3. Čišćenje forme
            setName(''); setPhone(''); setCity(''); setCheckIn(''); setCheckOut('');
            alert('Rezervacija uspešno sačuvana!');
        } catch (error) {
            console.error("Greška:", error);
            alert('Došlo je do greške prilikom unosa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')) {
            await deleteDoc(doc(db, "reservations", id));
        }
    };

    const createWhatsAppLink = (guestName, guestPhone, dateIn) => {
        const message = `Poštovani/a ${guestName}, Vaša rezervacija za apartman na Paliću od ${dateIn} je potvrđena. Radujemo se Vašem dolasku!`;
        const cleanPhone = guestPhone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    const createViberLink = (guestPhone) => {
        const cleanPhone = guestPhone.replace(/[^0-9]/g, '');
        return `viber://chat?number=${cleanPhone}`;
    };

    // ==========================================
    // EKRAN ZA LOZINKU (Stakleni dizajn)
    // ==========================================
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/10 text-center mt-16 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-palic-blue/20 rounded-full blur-[40px]"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gray-950/80 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock className="w-8 h-8 text-palic-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Admin Pristup</h2>
                    <p className="text-gray-400 mb-8">Unesite šifru za pristup rezervacijama</p>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (password === "palic2025") setIsAuthenticated(true);
                        else alert("Netačna šifra!");
                    }}>
                        <input
                            type="password"
                            placeholder="Unesite šifru"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-950/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-4 mb-6 focus:outline-none focus:border-palic-blue text-center text-lg tracking-widest"
                        />
                        <button type="submit" className="w-full bg-palic-blue hover:bg-palic-accent text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-palic-blue/25">
                            Pristupi Panelu
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ==========================================
    // GLAVNI ADMIN PANEL (Stakleni dizajn)
    // ==========================================
    return (
        <div className="grid lg:grid-cols-3 gap-8">

            {/* LEVA STRANA: Forma za ručni unos */}
            <div className="lg:col-span-1 bg-gray-900/60 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 h-fit">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="p-2 bg-palic-blue/20 rounded-lg text-palic-blue">✍️</span>
                    Unos sa Booking-a
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Ime i Prezime</label>
                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Broj telefona (npr +3816...)</label>
                        <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mesto / Grad</label>
                        <input required type="text" value={city} onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Od</label>
                            <input required type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full bg-gray-950/80 border border-gray-700 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-palic-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Do</label>
                            <input required type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full bg-gray-950/80 border border-gray-700 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-palic-blue" />
                        </div>
                    </div>

                    {/* NOVO: Checkbox za n8n */}
                    <div className="flex items-center gap-2 pt-2 pb-2">
                        <input
                            type="checkbox"
                            id="sendToN8n"
                            checked={sendToN8n}
                            onChange={(e) => setSendToN8n(e.target.checked)}
                            className="w-4 h-4 text-palic-blue bg-gray-950 border border-gray-700 rounded focus:ring-palic-blue focus:ring-2 cursor-pointer accent-palic-blue"
                        />
                        <label htmlFor="sendToN8n" className="text-sm text-gray-300 cursor-pointer select-none">
                            Pokreni automatizaciju (n8n)
                        </label>
                    </div>

                    {/* NOVO: Izmenjeno dugme sa Loading stanjem */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg mt-4 
                            ${isLoading ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-palic-blue/90 hover:bg-palic-blue text-white'}`}
                    >
                        {isLoading ? 'Čuvanje i slanje...' : 'Sačuvaj gosta'}
                    </button>
                </form>
            </div>

            {/* DESNA STRANA: Prikaz svih gostiju */}
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        📋 Predstojeće rezervacije
                    </h2>
                    <span className="bg-palic-blue/20 text-palic-blue px-3 py-1 rounded-full text-sm font-bold border border-palic-blue/30">
                        Ukupno: {guests.length}
                    </span>
                </div>

                {guests.length === 0 ? (
                    <div className="bg-gray-900/60 backdrop-blur-lg p-10 rounded-3xl border border-white/10 text-center text-gray-400">
                        Trenutno nemate unetih rezervacija.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {guests.map((guest) => (
                            <div key={guest.id} className="bg-gray-900/60 backdrop-blur-lg p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-palic-blue/50 transition-colors">

                                {/* Info o gostu */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white mb-1">{guest.name}</h3>
                                    <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                        <Phone className="w-3.5 h-3.5" /> {guest.phone}
                                    </div>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> {guest.city}
                                    </div>
                                </div>

                                {/* Info o datumima */}
                                <div className="flex-1">
                                    <div className="bg-gray-950/80 px-4 py-2.5 rounded-xl border border-gray-800">
                                        <div className="text-xs text-gray-500 mb-1 uppercase font-semibold">Period boravka</div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                                            <Calendar className="w-4 h-4 text-palic-blue" />
                                            {formatDate(guest.checkIn)} — {formatDate(guest.checkOut)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-right mt-1.5 text-gray-500 pr-1">
                                        Izvor: {guest.source}
                                    </div>
                                </div>

                                {/* Akcije */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <a href={createWhatsAppLink(guest.name, guest.phone, guest.checkIn)} target="_blank" rel="noreferrer"
                                        className="p-3 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-xl transition-all" title="WhatsApp">
                                        <MessageCircle className="w-5 h-5" />
                                    </a>

                                    <a href={createViberLink(guest.phone)} target="_blank" rel="noreferrer"
                                        className="p-3 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/20 rounded-xl transition-all" title="Viber">
                                        <Smartphone className="w-5 h-5" />
                                    </a>

                                    <div className="w-px h-8 bg-gray-700 mx-1"></div>

                                    <button onClick={() => handleDelete(guest.id)}
                                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all" title="Obriši">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminPage;
