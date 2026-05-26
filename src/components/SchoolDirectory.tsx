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
    <div className="w-full max-w-7xl mx-auto py-4 md:py-8 px-2 md:px-4">
      <div className="bg-[#FAF8F5] border border-[#821316]/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] rounded-[32px] md:rounded-[40px] relative isolate min-h-[80vh] px-4 py-8 md:p-14">
        {/* Background Zellij */}
        <div className="absolute inset-0 zellij-pattern opacity-[0.03] pointer-events-none rounded-[32px] md:rounded-[40px]"></div>

        {/* Ornate corners */}
        <div className="absolute top-4 left-4 w-16 h-16 md:w-24 md:h-24 pointer-events-none z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5,5 L95,5 L95,12 L12,12 L12,95 L5,95 Z\' fill=\'%231EBA64\'/%3E%3Cpath d=\'M20,20 L75,20 L75,24 L24,24 L24,75 L20,75 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M0,0 L100,0 L100,2 L2,2 L2,100 L0,100 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M32,32 L60,32 L60,35 L35,35 L35,60 L32,60 Z\' fill=\'%231EBA64\'/%3E%3C/svg%3E")', backgroundSize: '100% 100%' }}></div>
        <div className="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 pointer-events-none z-10 transform scale-x-[-1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5,5 L95,5 L95,12 L12,12 L12,95 L5,95 Z\' fill=\'%231EBA64\'/%3E%3Cpath d=\'M20,20 L75,20 L75,24 L24,24 L24,75 L20,75 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M0,0 L100,0 L100,2 L2,2 L2,100 L0,100 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M32,32 L60,32 L60,35 L35,35 L35,60 L32,60 Z\' fill=\'%231EBA64\'/%3E%3C/svg%3E")', backgroundSize: '100% 100%' }}></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 md:w-24 md:h-24 pointer-events-none z-10 transform scale-y-[-1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5,5 L95,5 L95,12 L12,12 L12,95 L5,95 Z\' fill=\'%231EBA64\'/%3E%3Cpath d=\'M20,20 L75,20 L75,24 L24,24 L24,75 L20,75 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M0,0 L100,0 L100,2 L2,2 L2,100 L0,100 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M32,32 L60,32 L60,35 L35,35 L35,60 L32,60 Z\' fill=\'%231EBA64\'/%3E%3C/svg%3E")', backgroundSize: '100% 100%' }}></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 md:w-24 md:h-24 pointer-events-none z-10 transform scale-x-[-1] scale-y-[-1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5,5 L95,5 L95,12 L12,12 L12,95 L5,95 Z\' fill=\'%231EBA64\'/%3E%3Cpath d=\'M20,20 L75,20 L75,24 L24,24 L24,75 L20,75 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M0,0 L100,0 L100,2 L2,2 L2,100 L0,100 Z\' fill=\'%23821316\'/%3E%3Cpath d=\'M32,32 L60,32 L60,35 L35,35 L35,60 L32,60 Z\' fill=\'%231EBA64\'/%3E%3C/svg%3E")', backgroundSize: '100% 100%' }}></div>

        <div className="relative z-20">
          <div className="text-center relative pb-8 md:pb-12">
            <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#4A0404] mb-5 tracking-tight leading-tight">Annuaire des Écoles</h1>
            <div className="flex justify-center items-center gap-4 mb-5">
              <div className="h-[1px] w-20 bg-[#1EBA64]"></div>
              <div className="w-2.5 h-2.5 rotate-45 border-[1.5px] border-[#4A0404]"></div>
              <div className="h-[1px] w-20 bg-[#1EBA64]"></div>
            </div>
            <p className="mt-4 text-slate-700 font-serif italic text-base md:text-xl leading-relaxed max-w-xl mx-auto px-4">Découvrez les seuils de présélection, les spécialités et forgez votre avenir académique.</p>
          </div>

          <div className="mb-10 md:mb-12 flex justify-center">
        <div className="maroccan-card p-1.5 md:p-2 flex flex-col sm:flex-row gap-2 md:gap-3 w-full max-w-xl group">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Ecole, ville, seuil..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 md:py-4 outline-none font-serif italic text-base md:text-lg text-slate-700 bg-transparent"
            />
          </div>
          <button className="bg-moroccan-green p-4 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-moroccan-green/20 shrink-0">
            <MapPin size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {filteredSchools.length === 0 ? (
          <div className="col-span-full py-32 text-center maroccan-card bg-ivory/50 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <MapPin size={32} />
            </div>
            <p className="text-slate-400 font-serif italic text-xl">Aucune institution ne correspond à votre recherche.</p>
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
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-serif italic font-bold text-slate-900 mb-2 md:mb-3 leading-tight group-hover:text-moroccan-green transition-colors line-clamp-2">{school.name}</h3>
        
        {school.thresholds && (
          <div className="grid grid-cols-2 gap-2 mb-4 md:mb-6">
            <div className="bg-slate-50 p-2 md:p-2.5 rounded-xl border border-slate-100">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 whitespace-nowrap">Seuil SM</p>
              <p className="text-xs md:text-sm font-bold text-moroccan-green">{school.thresholds.sm}</p>
            </div>
            <div className="bg-slate-50 p-2 md:p-2.5 rounded-xl border border-slate-100">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 whitespace-nowrap">Seuil PC</p>
              <p className="text-xs md:text-sm font-bold text-moroccan-green">{school.thresholds.pc}</p>
            </div>
          </div>
        )}

        <p className="text-slate-500 font-serif italic text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 flex-1">
          {school.specialties || school.description}
        </p>
        
        <button className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] group-hover:bg-moroccan-green group-hover:text-white transition-all duration-300 flex items-center justify-center gap-3 active:scale-95">
          Détails & Seuils
          <Info size={14} />
        </button>
      </div>
            </motion.div>
          ))
        )}
      </div>
      </div>
      </div>

      {/* School Detail Modal */}
      <AnimatePresence>
        {selectedSchool && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSchool(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-[32px] md:rounded-[48px] w-full max-w-4xl h-[94vh] md:h-auto md:max-h-[90vh] overflow-y-auto relative z-10 shadow-3xl"
            >
              <div className="h-40 md:h-72 relative">
                <img src={selectedSchool.logoUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                <button 
                  onClick={() => setSelectedSchool(null)}
                  className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-slate-900 shadow-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 md:px-10 pb-12 -mt-8 md:-mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 md:gap-8 mb-8 text-center md:text-left">
                  <div className="flex-1 w-full bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-xl shadow-black/5 md:shadow-none">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="bg-moroccan-green text-white px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-md">
                        {selectedSchool.type}
                      </span>
                      <span className="bg-moroccan-red text-white px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-md">
                        {selectedSchool.sector}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-4xl font-serif italic font-bold text-slate-900 leading-tight mb-2">{selectedSchool.name}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-400 font-serif italic text-sm md:text-lg">
                      <MapPin size={16} className="text-moroccan-red" />
                      {selectedSchool.city}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-8 md:space-y-10">
                    <section>
                      <h3 className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-widest md:tracking-[0.3em] mb-4 md:mb-6 flex items-center justify-center md:justify-start gap-3">
                        <Award size={18} className="text-moroccan-green shrink-0" />
                        Seuils de Présélection 2024
                      </h3>
                      {selectedSchool.thresholds ? (
                        <div className="grid grid-cols-2 gap-3 md:gap-4 font-sans">
                          {[
                            { label: 'Sciences Maths', val: selectedSchool.thresholds.sm },
                            { label: 'Physique Chimie', val: selectedSchool.thresholds.pc },
                            { label: 'SVT', val: selectedSchool.thresholds.svt },
                            { label: 'Economie', val: selectedSchool.thresholds.eco }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 md:p-6 rounded-[20px] md:rounded-[24px] border border-slate-100 flex flex-col items-center md:items-start">
                              <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 leading-none">{t.label}</p>
                              <p className="text-xl md:text-3xl font-serif italic font-bold text-moroccan-green leading-none">{t.val}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-sm text-center md:text-left">Données de seuils non disponibles.</p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-widest md:tracking-[0.3em] mb-4 md:mb-6 flex items-center justify-center md:justify-start gap-3">
                        <Users size={18} className="text-moroccan-green shrink-0" />
                        Admission
                      </h3>
                      <div className="bg-ivory/50 p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-moroccan-red/10 text-center md:text-left">
                        <p className="text-slate-700 font-serif italic text-sm md:text-lg leading-relaxed">
                          {selectedSchool.entrance || "Admission sur concours ou sélection sur dossier."}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8 md:space-y-10">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="p-4 md:p-6 bg-slate-50 rounded-[20px] md:rounded-[28px] border border-slate-100 text-center md:text-left">
                        <Clock className="text-moroccan-red mx-auto md:mx-0 mb-2 md:mb-3 md:w-6 md:h-6" size={20} />
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-0.5">Durée</p>
                        <p className="font-bold text-slate-900 text-xs md:text-base">{selectedSchool.duration || "N/A"}</p>
                      </div>
                      <div className="p-4 md:p-6 bg-slate-50 rounded-[20px] md:rounded-[28px] border border-slate-100 text-center md:text-left">
                        <GraduationCap className="text-moroccan-green mx-auto md:mx-0 mb-2 md:mb-3 md:w-6 md:h-6" size={20} />
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-0.5">Diplôme</p>
                        <p className="font-bold text-slate-900 text-xs md:text-base truncate px-1">Diplôme d'Etat</p>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-widest md:tracking-[0.3em] mb-4 md:mb-6 flex items-center justify-center md:justify-start gap-3">
                        <Info size={18} className="text-moroccan-green shrink-0" />
                        Spécialités
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {(selectedSchool.specialties || "").split(',').map((spec, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-[10px] md:text-sm">
                            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-moroccan-red rounded-full"></div>
                            {spec.trim()}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
                {/* Mobile spacer */}
                <div className="h-10 md:hidden"></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
