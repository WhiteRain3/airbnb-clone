import { AlignLeft, Euro, Home, Image as ImageIcon, MapPin, PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AuthService } from '../services/auth';

const HostDashboard = () => {
  const user = AuthService.getUser();
  const [myListings, setMyListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: 'Miestas',
    image: ''
  });

  // Gauname tik šio šeimininko skelbimus
  const fetchMyListings = async () => {
    const res = await fetch('http://localhost:5000/api/listings');
    const data = await res.json();
    setMyListings(data.filter(l => l.host_email === user.email));
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const listingToSave = {
      ...newListing,
      host_email: user.email,
      price: Number(newListing.price)
    };

    const res = await fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingToSave)
    });

    if (res.ok) {
      alert('Skelbimas sėkmingai pridėtas!');
      setNewListing({ title: '', description: '', price: '', location: '', category: 'Miestas', image: '' });
      fetchMyListings();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-in fade-in duration-500">
      {/* Antraštė */}
      <div className="flex items-center gap-4 p-8 bg-slate-900 text-white rounded-[3rem] shadow-xl">
        <div className="p-4 bg-rose-500 rounded-2xl">
          <PlusCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black italic tracking-tight">Šeimininko Skydas</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Valdykite savo nekilnojamąjį turtą</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* FORMA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Home size={20} className="text-rose-500" /> Pridėti naują
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Pavadinimas</label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-rose-500 outline-none transition font-bold text-sm"
                  placeholder="pvz. Vila Nidoje"
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Aprašymas</label>
                <textarea
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-rose-500 outline-none transition font-medium text-sm h-32 resize-none"
                  placeholder="Papasakokite apie būstą..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Kaina (€)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-rose-500 outline-none transition font-bold text-sm"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Kategorija</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-rose-500 outline-none transition font-bold text-sm appearance-none"
                    value={newListing.category}
                    onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                  >
                    <option>Miestas</option>
                    <option>Gamta</option>
                    <option>Pajūris</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nuotraukos URL</label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-rose-500 outline-none transition font-medium text-sm"
                  placeholder="https://images.unsplash.com/..."
                  value={newListing.image}
                  onChange={(e) => setNewListing({...newListing, image: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black hover:bg-rose-600 transition shadow-lg shadow-rose-200 mt-4">
                Sukurti skelbimą
              </button>
            </form>
          </div>
        </div>

        {/* MANO SKELBIMAI */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-800">Mano aktyvūs būstai ({myListings.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myListings.map(l => (
              <div key={l.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 flex gap-4 shadow-sm items-center">
                <img src={l.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-black text-slate-900 leading-tight">{l.title}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase">{l.location}</p>
                  <p className="text-rose-500 font-black mt-1">{l.price}€</p>
                </div>
              </div>
            ))}
            {myListings.length === 0 && (
              <div className="col-span-2 p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black">
                Jūs dar neturite įkeltų būstų
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;