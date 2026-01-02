import { Calendar, Gamepad2, LayoutDashboard, LogOut, PlusCircle, ShieldCheck, User } from 'lucide-react'; // Pridėta Gamepad2 ikona
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const role = AuthService.getRole();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-rose-500 hover:opacity-80 transition">
          <div className="bg-rose-500 text-white p-1.5 rounded-lg">
            <User size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-tighter">marbnb</span>
        </Link>

        {/* Dešinė pusė */}
        <div className="flex items-center gap-4">
          {/* IŠSKIRTINĖ FUNKCIJA: Žaidimas (matomas visiems prisijungusiems) */}
          {user && role === 'guest' && (
            <Link to="/game" className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 transition animate-pulse hover:animate-none">
              <Gamepad2 size={18} /> Žaidimas 🎁
            </Link>
          )}

          {user ? (
            <>
              {/* Admin nuoroda */}
              {role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 transition">
                  <LayoutDashboard size={18} /> Admin Skydas
                </Link>
              )}

              {role === 'host' && (
                <Link to="/host" className="text-sm font-bold text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 transition">
                  <PlusCircle size={18} /> Nuomoti
                </Link>
              )}

              <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 transition">
                <Calendar size={18} /> Rezervacijos
              </Link>

              {/* User Menu Dropdown */}
              <div 
                className="relative py-2" 
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3 border border-slate-200 rounded-full py-1.5 px-3 hover:shadow-md transition cursor-pointer bg-white">
                  <div className={`p-1 rounded-full ${role === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {role === 'admin' ? <ShieldCheck size={20} /> : <User size={20} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700">Mano paskyra</span>
                </div>

                {isOpen && (
                  <div className="absolute right-0 top-full pt-2 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prisijungta kaip</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                          role === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {role === 'admin' ? 'Administratorius' : role === 'host' ? 'Šeimininkas' : 'Keliautojas'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-4 text-sm text-rose-600 font-bold hover:bg-rose-50 flex items-center gap-3 transition"
                      >
                        <LogOut size={18} /> Atsijungti
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-2">Prisijungti</Link>
              <Link to="/register" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition">Registruotis</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;