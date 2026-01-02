import { ArrowLeft, Info, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthService } from '../services/auth';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const user = AuthService.getUser();

  useEffect(() => {
    fetch(`http://localhost:5000/api/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) navigate('/'); // Jei nerasta, grąžinam į pradžią
        else setListing(data);
      })
      .catch(err => console.error("Klaida:", err));
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) return navigate('/login');
    
    const res = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        listing_id: id, 
        user_email: user.email, 
        date: new Date().toLocaleDateString() 
      })
    });
    
    if (res.ok) { 
      alert('Rezervacija sėkminga!'); 
      navigate('/dashboard'); 
    }
  };

  if (!listing) return <div className="p-20 text-center font-bold text-slate-300">Kraunama...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Greita navigacija atgal */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Grįžti atgal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Nuotraukos blokas */}
        <div className="rounded-[3rem] overflow-hidden shadow-xl h-[500px] bg-slate-100">
          <img 
            src={listing.image} 
            alt={listing.title} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Informacijos blokas */}
        <div className="flex flex-col justify-between py-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {listing.category}
              </span>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                {listing.title}
              </h1>
              <p className="flex items-center gap-1 text-slate-400 font-bold text-sm">
                <MapPin size={16}/> {listing.location}
              </p>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <h3 className="flex items-center gap-2 font-black mb-3 text-slate-800">
                <Info size={18} className="text-rose-500" /> Apie būstą
              </h3>
              <p className="text-slate-600 italic leading-relaxed">
                "{listing.description || 'Šis šeimininkas dar nepateikė išsamaus aprašymo.'}"
              </p>
            </div>
          </div>

          {/* Rezervacijos skydelis */}
          <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Kaina už naktį</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-rose-500">{listing.price}€</span>
                <span className="text-slate-400 text-sm font-bold">/ naktis</span>
              </div>
            </div>
            <button 
              onClick={handleBooking} 
              className="bg-rose-500 hover:bg-rose-600 px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-rose-500/20"
            >
              Rezervuoti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;