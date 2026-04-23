import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { School } from '../types';
import { motion } from 'motion/react';
import { MapPin, ExternalLink } from 'lucide-react';

export const SchoolDirectory: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => {
    // Basic initialization if schools collection is empty could be done here, 
    // but we'll focus on the data for this demo.
    const initialSchools = [
      {
        id: 'ensa',
        name: 'ENSA (École Nationale des Sciences Appliquées)',
        type: 'Ingénierie',
        city: 'Agadir, Al Hoceima, El Jadida...',
        description: 'Réseau d\'écoles d\'ingénieurs au Maroc offrant des formations spécialisées en génie informatique, civil, industriel, etc.',
        logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      },
      {
        id: 'ensam',
        name: 'ENSAM (École Nationale Supérieure d\'Arts et Métiers)',
        type: 'Ingénierie',
        city: 'Meknès, Casablanca, Rabat',
        description: 'Grande école d\'ingénieurs spécialisée dans les métiers de l\'industrie et de la technologie au Maroc.',
        logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      },
      {
        id: 'ensias',
        name: 'ENSIAS (École Nationale Supérieure d\'Informatique)',
        type: 'Informatique',
        city: 'Rabat',
        description: 'Référence au Maroc pour la formation d\'ingénieurs en informatique et analyse des systèmes.',
        logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      },
      {
        id: 'emi',
        name: 'EMI (École Mohammadia d\'Ingénieurs)',
        type: 'Ingénierie',
        city: 'Rabat',
        description: 'La plus ancienne école d\'ingénieurs au Maroc, formation militaire et civile de haut niveau.',
        logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      },
      {
        id: 'bts',
        name: 'BTS (Brevet de Technicien Supérieur)',
        type: 'Technique',
        city: 'Plusieurs villes',
        description: 'Formation de deux ans après le baccalauréat pour devenir technicien supérieur dans divers domaines.',
        logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      },
      {
        id: 'cpge',
        name: 'CPGE (Classes Préparatoires aux Grandes Écoles)',
        type: 'Préparatoire',
        city: 'Plusieurs villes',
        description: 'Filière d\'excellence préparant aux concours des grandes écoles d\'ingénieurs et de commerce.',
        logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400',
        whatsappNumber: '212709793474'
      }
    ];

    const q = query(collection(db, 'schools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSchools(initialSchools as School[]);
      } else {
        setSchools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredSchools = schools.filter(s => 
    s.city.toLowerCase().includes(filterCity.toLowerCase()) ||
    s.name.toLowerCase().includes(filterCity.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Annuaire des Écoles</h2>
        <p className="text-gray-500 max-w-xl mx-auto">Consultez les informations sur les meilleures institutions et écoles au Maroc.</p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="bg-white p-2 rounded-2xl shadow-sm flex gap-2 w-full max-w-md">
          <input 
            type="text"
            placeholder="Filtrer par ville ou nom..."
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="flex-1 px-4 py-2 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSchools.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 italic">Aucune école trouvée pour le moment.</p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <motion.div 
              key={school.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative">
                <img src={school.logoUrl} className="w-full h-full object-cover" alt={school.name} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                  {school.type}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  <MapPin size={14} />
                  {school.city}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{school.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">{school.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
