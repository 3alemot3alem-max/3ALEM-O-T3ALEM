import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { School } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ExternalLink, X, Info, GraduationCap, Clock, Award, Users, Search } from 'lucide-react';
import { SCHOOLS_DATA } from '../data/schools';

export const SchoolDirectory: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    // Merge remote and local for now, prioritizing current request's rich data
    const q = query(collection(db, 'schools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // For this applet, the local SCHOOLS_DATA is the source of truth for the list
      setSchools(SCHOOLS_DATA as School[]);
    });
    return () => unsubscribe();
  }, []);

  const filteredSchools = schools.filter(s => 
    s.city.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.specialties?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Magnificent Header */}
      <div className="relative h-80 rounded-[48px] overflow-hidden mb-16 group shadow-2xl shadow-moroccan-green/20">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
          alt="University" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-moroccan-green/90 via-moroccan-green/40 to-transparent"></div>
        <div className="absolute inset-0 zellij-pattern opacity-10"></div>
        
        <div className="relative h-full flex flex-col justify-center px-12 md:px-20 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="backdrop-blur-md bg-white/10 p-8 md:p-12 rounded-[32px] border border-white/20 shadow-2xl">
              <span className="bg-moroccan-red text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl mb-6 inline-block">
                Annuaire 2024
              </span>
              <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl">
                &Eacute;COLE
              </h1>
              <p className="text-white/90 font-serif italic text-xl md:text-2xl leading-relaxed max-w-xl drop-shadow-lg">
                D&eacute;couvrez les seuils de pr&eacute;s&eacute;lection, les sp&eacute;cialit&eacute;s et forgez votre avenir acad&eacute;mique.
              </p>
            </div>
          </motion.div>
        </div>
      </div>


      <div className="mb-12 flex justify-center">
        <div className="maroccan-card p-2 flex gap-3 w-full max-w-xl group">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text"
              placeholder="Ecole, ville, seuil, informatique..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 outline-none font-serif italic text-lg text-slate-700 bg-transparent"
            />
          </div>
          <div className="bg-moroccan-green p-4 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-moroccan-green/20">
            <MapPin size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredSchools.length === 0 ? (
          <div className="col-span-full py-32 text-center maroccan-card bg-ivory/50 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <MapPin size={32} />
            </div>
            <p className="text-slate-400 font-serif italic text-xl">Aucune institution ne correspond &agrave; votre recherche.</p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <motion.div 
              key={school.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedSchool(school)}
              className="maroccan-card overflow-hidden flex flex-col group transition-all duration-500 cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img src={school.logoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={school.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-moroccan-green shadow-xl">
                  {school.type}
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                  <MapPin size={14} className="text-moroccan-red" />
                  {school.city}
                </div>
                {school.sector && (
                  <div className="absolute bottom-6 right-6 text-[10px] bg-moroccan-red text-white p-2 rounded-xl font-black uppercase tracking-widest">
                    {school.sector}
                  </div>
                )}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-serif italic font-bold text-slate-900 mb-3 leading-tight group-hover:text-moroccan-green transition-colors line-clamp-2">{school.name}</h3>
                
                {school.thresholds && (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 whitespace-nowrap">Seuil SM</p>
                      <p className="text-sm font-bold text-moroccan-green">{school.thresholds.sm}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 whitespace-nowrap">Seuil PC</p>
                      <p className="text-sm font-bold text-moroccan-green">{school.thresholds.pc}</p>
                    </div>
                  </div>
                )}

                <p className="text-slate-500 font-serif italic text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {school.specialties || school.description}
                </p>
                
                <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] group-hover:bg-moroccan-green group-hover:text-white transition-all duration-300 flex items-center justify-center gap-3 active:scale-95">
                  D&eacute;tails & Seuils
                  <Info size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* School Detail Modal */}
      <AnimatePresence>
        {selectedSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSchool(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="maroccan-card w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white"
            >
              <div className="h-72 relative">
                <img src={selectedSchool.logoUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
                <button 
                  onClick={() => setSelectedSchool(null)}
                  className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 hover:text-moroccan-red transition-colors shadow-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 sm:px-10 pb-12 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-moroccan-green text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-moroccan-green/20">
                        {selectedSchool.type}
                      </span>
                      <span className="bg-moroccan-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-moroccan-red/20">
                        {selectedSchool.sector}
                      </span>
                    </div>
                    <h2 className="text-4xl font-serif italic font-bold text-slate-900 leading-tight mb-4">{selectedSchool.name}</h2>
                    <div className="flex items-center gap-2 text-slate-400 font-serif italic text-lg">
                      <MapPin size={20} className="text-moroccan-red" />
                      {selectedSchool.city}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <section>
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <Award size={18} className="text-moroccan-green" />
                        Seuils de Pr&eacute;s&eacute;lection 2024
                      </h3>
                      {selectedSchool.thresholds ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Sciences Maths</p>
                            <p className="text-3xl font-serif italic font-bold text-moroccan-green">{selectedSchool.thresholds.sm}</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Physique Chimie</p>
                            <p className="text-3xl font-serif italic font-bold text-moroccan-green">{selectedSchool.thresholds.pc}</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">SVT</p>
                            <p className="text-3xl font-serif italic font-bold text-moroccan-green">{selectedSchool.thresholds.svt}</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Economie</p>
                            <p className="text-3xl font-serif italic font-bold text-moroccan-green">{selectedSchool.thresholds.eco}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Donn&eacute;es de seuils non disponibles.</p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <Users size={18} className="text-moroccan-green" />
                        Concours & Admission
                      </h3>
                      <div className="bg-ivory/50 p-6 rounded-[24px] border border-moroccan-red/10">
                        <p className="text-slate-700 font-serif italic text-lg leading-relaxed">
                          {selectedSchool.entrance || "Admission sur concours national ou s&eacute;lection sur dossier."}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                        <Clock className="text-moroccan-red mb-3" size={24} />
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Dur&eacute;e</p>
                        <p className="font-bold text-slate-900">{selectedSchool.duration || "N/A"}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                        <GraduationCap className="text-moroccan-green mb-3" size={24} />
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Dipl&ocirc;me</p>
                        <p className="font-bold text-slate-900">{selectedSchool.diploma || "Ing&eacute;nieur d&apos;Etat"}</p>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <Info size={18} className="text-moroccan-green" />
                        Sp&eacute;cialit&eacute;s & Modules
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {(selectedSchool.specialties || "").split(',').map((spec, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-medium text-sm">
                            <div className="w-1.5 h-1.5 bg-moroccan-red rounded-full"></div>
                            {spec.trim()}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
