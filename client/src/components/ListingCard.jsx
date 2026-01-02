import { ArrowRight, MapPin } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
    >
      {/* Nuotrauka */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          {listing.category}
        </div>
      </div>
      
      {/* Turinys */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-500 transition-colors">
              {listing.title}
            </h3>
            <p className="flex items-center gap-1 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <MapPin size={14} /> {listing.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 leading-none">{listing.price}€</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">naktis</p>
          </div>
        </div>
        
        {/* Aprašymo ištrauka (line-clamp-2 paslepia tekstą po 2 eilučių) */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic">
          "{listing.description || 'Šis šeimininkas dar nepridėjo aprašymo.'}"
        </p>

        <div className="pt-2">
          <div className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black group-hover:bg-rose-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
            Peržiūrėti <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;