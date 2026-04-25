export interface School {
  id: string;
  name: string;
  city: string;
  type: string;
  duration: string;
  diploma: string;
  thresholds: {
    sm: string | number;
    pc: string | number;
    svt: string | number;
    eco: string | number;
  };
  entrance: string;
  specialties: string;
  sector: string;
  logoUrl: string;
}

const getPlaceholderImg = (type: string) => {
  if (type.includes('Médecine') || type.includes('Santé') || type.includes('Infirmier')) 
    return "https://images.unsplash.com/photo-1505751172107-573225a9405b?auto=format&fit=crop&q=80&w=600";
  if (type.includes('Commerce') || type.includes('Business')) 
    return "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=600";
  if (type.includes('Art') || type.includes('Beaux-Arts') || type.includes('Artisanat')) 
    return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600";
  if (type.includes('Militaire') || type.includes('Gendarmerie') || type.includes('Air')) 
    return "https://images.unsplash.com/photo-1508101413813-ac05267b140c?auto=format&fit=crop&q=80&w=600";
  return "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";
};

export const SCHOOLS_DATA: School[] = [
  {
    "id": "emi",
    "name": "EMI (École Mohammadia d'Ingénieurs)",
    "type": "École d'Ingénieur",
    "city": "Rabat",
    "duration": "5 ans total",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 16.5, "pc": 17, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "CNC après CPGE",
    "specialties": "Analyse, Algèbre, Mécanique solides, Thermodynamique, Informatique, Électronique, Génie Civil, Béton armé, Gestion projet, Stage",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensias",
    "name": "ENSIAS",
    "type": "École d'Ingénieur",
    "city": "Rabat",
    "duration": "5 ans total",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 16, "pc": 16.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "CNC après CPGE",
    "specialties": "Algorithmique avancée, IA, Machine Learning, Big Data, Cybersécurité, Cloud Computing, Réseaux, Génie Logiciel, Base données",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ehtp",
    "name": "EHTP (École Hassania des Travaux Publics)",
    "type": "École d'Ingénieur",
    "city": "Casablanca",
    "duration": "5 ans total",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 15.8, "pc": 16.3, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "CNC après CPGE",
    "specialties": "Résistance matériaux, Béton armé, Routes, Hydraulique, Géotechnique, Topographie, BIM, Management projet",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "inpt",
    "name": "INPT",
    "type": "École d'Ingénieur",
    "city": "Rabat",
    "duration": "5 ans total",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 15.5, "pc": 16, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "CNC après CPGE",
    "specialties": "Traitement signal, Télécoms mobiles 4G/5G, Fibre optique, Antennes, Réseaux IP, Électronique RF",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensem",
    "name": "ENSEM",
    "type": "École d'Ingénieur",
    "city": "Casablanca",
    "duration": "5 ans total",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 15, "pc": 15.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "CNC après CPGE",
    "specialties": "Électrotechnique, Machines électriques, Automatisme, API, Électronique puissance, Énergies renouvelables",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensam-casablanca",
    "name": "ENSAM Casablanca",
    "type": "École d'Ingénieur",
    "city": "Casablanca",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 14.5, "pc": 15, "svt": 15.5, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Maths, Physique, Chimie, Dessin indus, Mécanique, CAO, Automobile, Aéronautique, Productique",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensam-meknes",
    "name": "ENSAM Meknès",
    "type": "École d'Ingénieur",
    "city": "Meknès",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 14, "pc": 14.5, "svt": 15, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Productique, Fabrication mécanique, Énergétique, Méca fluides, Maintenance industrielle",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensa-tanger",
    "name": "ENSA Tanger",
    "type": "École d'Ingénieur",
    "city": "Tanger",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 13.8, "pc": 14.2, "svt": 14.8, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Automobile, Aéronautique, Mécatronique, Systèmes embarqués, Énergétique, Robotique",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensa-marrakech",
    "name": "ENSA Marrakech",
    "type": "École d'Ingénieur",
    "city": "Marrakech",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 13.8, "pc": 14.3, "svt": 14.9, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Génie Industriel, Logistique, Supply Chain, Data Science, Énergies renouvelables, IA",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensa-agadir",
    "name": "ENSA Agadir",
    "type": "École d'Ingénieur",
    "city": "Agadir",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 13.5, "pc": 14, "svt": 14.5, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Génie Industriel, Agroalimentaire, Génie des procédés, Énergétique, Environnement",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "encg-casablanca",
    "name": "ENCG Casablanca",
    "type": "École de Commerce",
    "city": "Casablanca",
    "duration": "5 ans",
    "diploma": "Master ENCG",
    "thresholds": { "sm": 13.3, "pc": 13.8, "svt": 14.3, "eco": 12.3 },
    "entrance": "TAFEM",
    "specialties": "Comptabilité, Marketing Digital, Finance entreprise, Commerce International, Audit, RH, Droit affaires",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Commerce")
  },
  {
    "id": "iscae-casa",
    "name": "ISCAE Casablanca",
    "type": "École de Commerce",
    "city": "Casablanca",
    "duration": "5 ans",
    "diploma": "Diplôme ISCAE",
    "thresholds": { "sm": 15.5, "pc": 16, "svt": "Non éligible", "eco": 14.5 },
    "entrance": "National",
    "specialties": "Finance marché, Marketing stratégique, Audit, Contrôle gestion, Leadership, Business Plan",
    "sector": "Semi-public",
    "logoUrl": getPlaceholderImg("Commerce")
  },
  {
    "id": "insea-rabat",
    "name": "INSEA",
    "type": "École d'Ingénieur",
    "city": "Rabat",
    "duration": "3 ans après DEUG",
    "diploma": "Ingénieur Statisticien",
    "thresholds": { "sm": "DEUG 14.00", "pc": "DEUG 14.00", "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "National",
    "specialties": "Statistiques, Économétrie, Actuariat, Data Science, Recherche Opérationnelle, Sondage",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "era-marrakech",
    "name": "ERA - École Royale de l'Air",
    "type": "École Militaire",
    "city": "Marrakech",
    "duration": "4 ans",
    "diploma": "Officier Pilote + Licence",
    "thresholds": { "sm": 12, "pc": 12, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "National + Médical + Sport",
    "specialties": "Pilotage, Aérodynamique, Navigation aérienne, Météorologie, Anglais aéronautique",
    "sector": "Public Militaire",
    "logoUrl": getPlaceholderImg("Militaire")
  },
  {
    "id": "ern-casa",
    "name": "ERN - École Royale Navale",
    "type": "École Militaire",
    "city": "Casablanca",
    "duration": "4 ans",
    "diploma": "Officier Marine + Licence",
    "thresholds": { "sm": 12, "pc": 12, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "National + Médical + Sport",
    "specialties": "Navigation maritime, Mécanique navale, Électronique, Télécoms, Anglais maritime",
    "sector": "Public Militaire",
    "logoUrl": getPlaceholderImg("Militaire")
  },
  {
    "id": "arm-meknes",
    "name": "ARM - Académie Royale Militaire",
    "type": "École Militaire",
    "city": "Meknès",
    "duration": "4 ans",
    "diploma": "Officier FAR + Licence",
    "thresholds": { "sm": 12, "pc": 12, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "National + Médical + Sport",
    "specialties": "Tactique militaire, Topographie, Armement, Commandement",
    "sector": "Public Militaire",
    "logoUrl": getPlaceholderImg("Militaire")
  },
  {
    "id": "aiac-casa",
    "name": "AIAC Aviation Civile",
    "type": "École Aviation",
    "city": "Casablanca",
    "duration": "3 ans",
    "diploma": "Ingénieur / Licence Pro",
    "thresholds": { "sm": 13.5, "pc": 13.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "National + Médical",
    "specialties": "Pilotage, Contrôle aérien, Maintenance aéronautique",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Air")
  },
  {
    "id": "ispits-national",
    "name": "ISPITS (Infirmier)",
    "type": "Santé",
    "city": "National",
    "duration": "3 ans",
    "diploma": "Licence Pro",
    "thresholds": { "sm": 12, "pc": 12.5, "svt": 13, "eco": "Non éligible" },
    "entrance": "National",
    "specialties": "Soins infirmiers, Anatomie, Pharmacologie, Urgence",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Médecine")
  },
  {
    "id": "fmp-rabat",
    "name": "FMP Rabat (Médecine)",
    "type": "Médecine",
    "city": "Rabat",
    "duration": "7 ans",
    "diploma": "Doctorat Médecine",
    "thresholds": { "sm": 16.2, "pc": 16.7, "svt": 17, "eco": "Non éligible" },
    "entrance": "National",
    "specialties": "Anatomie, Morphologie, Chirurgie, Pédiatrie",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Médecine")
  },
  {
    "id": "fmd-rabat",
    "name": "FMD Rabat (Dentaire)",
    "type": "Médecine",
    "city": "Rabat",
    "duration": "6 ans",
    "diploma": "Doctorat Dentaire",
    "thresholds": { "sm": 16.5, "pc": 17, "svt": 17.3, "eco": "Non éligible" },
    "entrance": "National",
    "specialties": "Chirurgie buccale, Orthodontie, Prothèse",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Médecine")
  },
  {
    "id": "fst-tanger",
    "name": "FST Tanger",
    "type": "Faculté Sciences Techniques",
    "city": "Tanger",
    "duration": "3 ans",
    "diploma": "Licence LST",
    "thresholds": { "sm": 12, "pc": 12, "svt": 12.5, "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Logistique, Info, Énergétique, Automobile",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Faculté")
  },
  {
    "id": "bts-mi-casa",
    "name": "BTS Maintenance Industrielle",
    "type": "BTS",
    "city": "Casablanca",
    "duration": "2 ans",
    "diploma": "BTS",
    "thresholds": { "sm": 11.5, "pc": 11.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Hydraulique, Pneumatique, Automatisme",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Technique")
  },
  {
    "id": "bts-compta-casa",
    "name": "BTS Comptabilité Gestion",
    "type": "BTS",
    "city": "Casablanca",
    "duration": "2 ans",
    "diploma": "BTS",
    "thresholds": { "sm": 10.5, "pc": 10.5, "svt": 10.5, "eco": 10 },
    "entrance": "Dossier",
    "specialties": "Comptabilité, Fiscalité, Sage, Droit",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Commerce")
  },
  {
    "id": "cpge-mpsi-rabat",
    "name": "CPGE MPSI (Moulay Youssef)",
    "type": "Prépas",
    "city": "Rabat",
    "duration": "2 ans",
    "diploma": "Accès Grandes Écoles",
    "thresholds": { "sm": 14, "pc": 14.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Maths, Physique, Sciences Ingénieur",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Préparatoire")
  },
  {
    "id": "isic-rabat",
    "name": "ISIC (Journalisme)",
    "type": "Institut",
    "city": "Rabat",
    "duration": "4 ans",
    "diploma": "Licence Pro",
    "thresholds": { "sm": 12, "pc": 12, "svt": 12, "eco": 12 },
    "entrance": "Concours + Oral",
    "specialties": "Rédaction, Audiovisuel, Montage, Droit presse",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Université")
  },
  {
    "id": "ensa-tetouan",
    "name": "ENSA Tétouan",
    "type": "École d'Ingénieur",
    "city": "Tétouan",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 12.5, "pc": 13, "svt": 13.5, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Génie Civil, Mécatronique, Logistique, Systèmes d'information",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "ensa-el-jadida",
    "name": "ENSA El Jadida",
    "type": "École d'Ingénieur",
    "city": "El Jadida",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 13, "pc": 13.5, "svt": 14, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Génie Énergétique, Génie Industriel, Environnement",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Ingénieur")
  },
  {
    "id": "fst-settat",
    "name": "FST Settat",
    "type": "Faculté Sciences Techniques",
    "city": "Settat",
    "duration": "3 ans",
    "diploma": "Licence LST",
    "thresholds": { "sm": 11.5, "pc": 11.5, "svt": 12, "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Génie Industriel, Procédés, Environnement, Info",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Faculté")
  },
  {
    "id": "est-casablanca",
    "name": "EST Casablanca",
    "type": "École Supérieure Technologie",
    "city": "Casablanca",
    "duration": "2 ans",
    "diploma": "DUT",
    "thresholds": { "sm": 11.5, "pc": 11.5, "svt": 12, "eco": 11.5 },
    "entrance": "Dossier",
    "specialties": "Génie Électrique, Génie Mécanique, Info, Gestion",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Technique")
  },
  {
    "id": "ista-gc-casa",
    "name": "ISTA Génie Civil (Casablanca)",
    "type": "OFPPT",
    "city": "Casablanca",
    "duration": "2 ans",
    "diploma": "Technicien Spécialisé",
    "thresholds": { "sm": 10.5, "pc": 10.5, "svt": "Non éligible", "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Béton armé, Topographie, Métré, Conducteur travaux",
    "sector": "Public",
    "logoUrl": getPlaceholderImg("Technique")
  }
];
