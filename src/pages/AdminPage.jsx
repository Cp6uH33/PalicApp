import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Phone, MapPin, Calendar, MessageCircle, Smartphone, Trash2, Lock, Home, Globe, Pencil, X, ChevronDown } from 'lucide-react';

const SERBIAN_MONTHS = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
const APARTMENTS = ['Lake Palic Apartman', 'Apartman Rakanovic'];

const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (yyyyMM) => {
    const [year, month] = yyyyMM.split('-');
    return `${SERBIAN_MONTHS[parseInt(month) - 1]} ${year}`;
};

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [guests, setGuests] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth());

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [apartment, setApartment] = useState('Lake Palic Apartman');
    const [price, setPrice] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}.`;
        return dateString;
    };

    const calcNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return null;
        const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : null;
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        const q = query(collection(db, "reservations"), orderBy("checkIn", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const arr = [];
            snapshot.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setGuests(arr);
            setError(null);
        }, (err) => {
            setError(err.message);
        });
        return () => unsubscribe();
    }, [isAuthenticated]);

    // Svi dostupni meseci iz podataka, sortirani od najnovijeg
    const availableMonths = useMemo(() => {
        const months = new Set(guests.map(g => g.checkIn?.slice(0, 7)).filter(Boolean));
        return [...months].sort((a, b) => b.localeCompare(a));
    }, [guests]);

    // Gosti filtrirani po mesecu, grupisani po apartmanu
    const guestsByApartment = useMemo(() => {
        const filtered = guests.filter(g => g.checkIn?.startsWith(selectedMonth));
        const grouped = {};
        APARTMENTS.forEach(apt => {
            const list = filtered.filter(g => g.apartment === apt);
            if (list.length > 0) grouped[apt] = list;
        });
        // Gosti bez apartmana ili sa nepoznatim apartmanom
        const others = filtered.filter(g => !APARTMENTS.includes(g.apartment));
        if (others.length > 0) grouped['Ostalo'] = others;
        return grouped;
    }, [guests, selectedMonth]);

    const totalForMonth = useMemo(() =>
        Object.values(guestsByApartment).flat().length,
    [guestsByApartment]);

    const resetForm = () => {
        setName(''); setPhone(''); setCity(''); setCountry('');
        setApartment('Lake Palic Apartman');
        setCheckIn(''); setCheckOut(''); setPrice('');
        setEditingId(null);
    };

    const handleEdit = (guest) => {
        setEditingId(guest.id);
        setName(guest.name || '');
        setPhone(guest.phone || '');
        setCity(guest.city || '');
        setCountry(guest.country || '');
        setApartment(guest.apartment || 'Lake Palic Apartman');
        setPrice(guest.price || '');
        setCheckIn(guest.checkIn || '');
        setCheckOut(guest.checkOut || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = { name, phone, city, country, apartment, checkIn, checkOut, price };
            if (editingId) {
                await updateDoc(doc(db, "reservations", editingId), data);
                alert('Rezervacija uspešno izmenjena!');
            } else {
                await addDoc(collection(db, "reservations"), {
                    ...data,
                    source: "Booking/Ručno",
                    createdAt: new Date().toISOString()
                });
                alert('Rezervacija uspešno sačuvana!');
            }
            resetForm();
        } catch (err) {
            console.error("Greška:", err);
            alert('Došlo je do greške.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')) {
            await deleteDoc(doc(db, "reservations", id));
            if (editingId === id) resetForm();
        }
    };

    const createWhatsAppLink = (guestName, guestPhone, dateIn) => {
        const message = `Poštovani/a ${guestName}, Vaša rezervacija za apartman na Paliću od ${dateIn} je potvrđena. Radujemo se Vašem dolasku!`;
        return `https://wa.me/${guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    };

    const createViberLink = (guestPhone) =>
        `viber://chat?number=${guestPhone.replace(/[^0-9]/g, '')}`;

    // ── Ekran za lozinku ──
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/10 text-center mt-16 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-palic-blue/20 rounded-full blur-2xl"></div>
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
                        <button type="submit" className="w-full bg-palic-blue hover:bg-palic-accent text-white font-bold py-4 rounded-xl transition shadow-lg">
                            Pristupi Panelu
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Glavni panel ──
    return (
        <div className="grid lg:grid-cols-3 gap-8">

            {/* LEVA STRANA: Forma */}
            <div className="lg:col-span-1 bg-gray-900/60 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 h-fit">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="p-2 bg-palic-blue/20 rounded-lg text-palic-blue">
                        {editingId ? <Pencil className="w-4 h-4" /> : '✍️'}
                    </span>
                    {editingId ? 'Izmena rezervacije' : 'Unos rezervacije'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
                            <Home className="w-4 h-4" /> Apartman
                        </label>
                        <select required value={apartment} onChange={(e) => setApartment(e.target.value)}
                            className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue">
                            {APARTMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Grad</label>
                            <input required type="text" value={city} onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue" />
                        </div>
                        <div>
                            <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-1.5">
                                <Globe className="w-3.5 h-3.5" /> Država
                            </label>
                            <input required type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                                className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-palic-blue" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Ukupna Cena (€)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                            <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-gray-950/80 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-palic-blue" />
                        </div>
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg mt-4
                            ${isLoading ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-palic-blue/90 hover:bg-palic-blue text-white'}`}
                    >
                        {isLoading ? 'Čuvanje...' : editingId ? 'Sačuvaj izmene' : 'Sačuvaj gosta'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all"
                        >
                            <X className="w-4 h-4" /> Otkaži izmenu
                        </button>
                    )}
                </form>
            </div>

            {/* DESNA STRANA: Lista */}
            <div className="lg:col-span-2">

                {/* Header sa dropdown za mesec */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        📋 Rezervacije
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="appearance-none bg-gray-900/80 border border-gray-700 text-white rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:border-palic-blue cursor-pointer"
                            >
                                {availableMonths.length === 0 && (
                                    <option value={currentMonth()}>{formatMonthLabel(currentMonth())}</option>
                                )}
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{formatMonthLabel(m)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <span className="bg-palic-blue/20 text-palic-blue px-3 py-1 rounded-full text-sm font-bold border border-palic-blue/30 whitespace-nowrap">
                            Ukupno: {totalForMonth}
                        </span>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-900/40 backdrop-blur-lg p-10 rounded-3xl border border-red-500/30 text-center text-red-400">
                        <p className="font-bold mb-2">Greška pri učitavanju podataka:</p>
                        <p className="text-sm font-mono">{error}</p>
                    </div>
                ) : Object.keys(guestsByApartment).length === 0 ? (
                    <div className="bg-gray-900/60 backdrop-blur-lg p-10 rounded-3xl border border-white/10 text-center text-gray-400">
                        Nema rezervacija za {formatMonthLabel(selectedMonth)}.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(guestsByApartment).map(([aptName, aptGuests]) => (
                            <div key={aptName}>
                                {/* Sekcija po apartmanu */}
                                <div className="flex items-center gap-3 mb-3">
                                    <Home className="w-4 h-4 text-palic-blue" />
                                    <h3 className="text-sm font-bold text-palic-blue uppercase tracking-wider">{aptName}</h3>
                                    <div className="flex-1 h-px bg-palic-blue/20"></div>
                                    <span className="text-xs text-gray-500">{aptGuests.length} gost/a</span>
                                </div>

                                <div className="grid gap-3">
                                    {aptGuests.map((guest) => (
                                        <div key={guest.id} className="bg-gray-900/60 backdrop-blur-lg p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-palic-blue/50 transition-colors">

                                            {/* Info o gostu */}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-white mb-1">{guest.name}</h3>
                                                <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                                                    <Phone className="w-3.5 h-3.5" /> {guest.phone}
                                                </div>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {guest.city}{guest.country ? `, ${guest.country}` : ''}
                                                    <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs font-semibold">
                                                        €{guest.price}
                                                    </span>
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
                                                    {calcNights(guest.checkIn, guest.checkOut) && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {calcNights(guest.checkIn, guest.checkOut)} {calcNights(guest.checkIn, guest.checkOut) === 1 ? 'noć' : 'noći'}
                                                        </div>
                                                    )}
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
                                                <button onClick={() => handleEdit(guest)}
                                                    className="p-3 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-white border border-yellow-500/20 rounded-xl transition-all" title="Izmeni">
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(guest.id)}
                                                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all" title="Obriši">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                        </div>
                                    ))}
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
