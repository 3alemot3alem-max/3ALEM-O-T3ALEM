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
  const t = type.toLowerCase();
  if (t.includes('médecine') || t.includes('santé') || t.includes('infirmier') || t.includes('dentaire')) 
    return "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=600";
  if (t.includes('commerce') || t.includes('business') || t.includes('iscae') || t.includes('encg')) 
    return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600";
  if (t.includes('ingénieur') || t.includes('ensi') || t.includes('ensa') || t.includes('emi') || t.includes('ehtp')) 
    return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600";
  if (t.includes('art') || t.includes('beaux-arts') || t.includes('artisanat')) 
    return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600";
  if (t.includes('militaire') || t.includes('gendarmerie') || t.includes('air') || t.includes('navale')) 
    return "https://images.unsplash.com/photo-1508101413813-ac05267b140c?auto=format&fit=crop&q=80&w=600";
  if (t.includes('aviation') || t.includes('aiac'))
    return "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=600";
  if (t.includes('faculté') || t.includes('fst') || t.includes('université'))
    return "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=600";
  if (t.includes('bts') || t.includes('technique') || t.includes('est') || t.includes('ofppt'))
    return "https://images.unsplash.com/photo-1581092918056-0c4c3acd378e?auto=format&fit=crop&q=80&w=600";
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
    "logoUrl": "https://upload.wikimedia.org/wikipedia/fr/0/05/EMI.PNG"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfn5Yl-KZFjJHICitFmd29kSTNHFeXKUhKcg&s"
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
    "logoUrl": "https://www.ehtp.ac.ma/wp-content/uploads/2025/02/logo-wide.jpg"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-8gAATYCsIsCYrpE0bQFQ50psQOq215IyZA&s"
  },
  {
    "id": "ensam-national",
    "name": "ENSAM (Réseau)",
    "type": "École d'Ingénieur",
    "city": "Casablanca, Meknès, Rabat...",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 14, "pc": 14.5, "svt": 15, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Mécanique, Automobile, Aéronautique, Productique, Énergétique, Maintenance industrielle",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBETqRTwuRitB0q-b0bYw0-YY_6hnRjtjtvg&s"
  },
  {
    "id": "ensa-national",
    "name": "ENSA (Réseau)",
    "type": "École d'Ingénieur",
    "city": "Tanger, Marrakech, Agadir, Tétouan...",
    "duration": "5 ans",
    "diploma": "Ingénieur d'État",
    "thresholds": { "sm": 13.5, "pc": 14, "svt": 14.5, "eco": "Non éligible" },
    "entrance": "National Post-Bac",
    "specialties": "Automobile, Aéronautique, Mécatronique, Systèmes embarqués, Énergétique, Robotique, Génie Industriel, IA",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlC0dLhH_WguGxnzLOEQuiCP_DuT7ENWQNKQ&s"
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
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUDVL5HqKF3YNfs8MNbmhsL8bpE-FGtErWDw&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-kM0CodOXM0iDZL2FNKtcrKhmwWVkir0fvQ&s"
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
    "logoUrl": "https://api.dicebear.com/7.x/initials/svg?seed=ERA&backgroundColor=159c52"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_3-mfO7sYxygeONqkD9pfT45qQ3YYn4RZvQ&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1fz_3LFCESfA_wWrEBmezi-j4YQVnnLz5Fw&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3D-HxICvW3pwQ0okEaj5IPzkRm34XJHdYZg&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpcoDF8QCwC1ooRENjzJEbfB6O2WywdGXOdA&s"
  },
  {
    "id": "fmp-fmd-national",
    "name": "FMP & FMD (Réseau)",
    "type": "Médecine & Dentaire",
    "city": "Rabat, Casablanca, Fès, Marrakech, Oujda...",
    "duration": "7 ans (Médecine) / 6 ans (Dentaire)",
    "diploma": "Doctorat (Médecine ou Dentaire)",
    "thresholds": { "sm": "16.2+", "pc": "16.7+", "svt": "17.0+", "eco": "Non éligible" },
    "entrance": "National Commun",
    "specialties": "Différence majeure: La FMP dure 7 ans pour la médecine générale (Pédiatrie, Chirurgie, etc.) via résidanat, tandis que la FMD dure 6 ans pour la chirurgie dentaire (Orthodontie, Prothèse). Le seuil et concours sont désormais communs.",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgx6Wf3HLfapHtePu7Mf0RjW8YmDKmfas0eQ&s"
  },
  {
    "id": "fst-national",
    "name": "FST (Réseau)",
    "type": "Faculté Sciences Techniques",
    "city": "Tanger, Settat, Marrakech, Fès...",
    "duration": "3 ans (LST)",
    "diploma": "Licence LST",
    "thresholds": { "sm": "11.5 - 12", "pc": "11.5 - 12", "svt": "12 - 12.5", "eco": "Non éligible" },
    "entrance": "Dossier",
    "specialties": "Contrairement aux facultés classiques, la FST offre une formation technique et appliquée (Logistique, Info, Énergétique, MIP, BCG), avec un accès possible au cycle Ingénieur après Bac+2.",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi4N13joSjZISYOIi_bh8lwZDRSktsALRbWQ&s"
  },
  {
    "id": "bts-national",
    "name": "BTS (Réseau)",
    "type": "BTS",
    "city": "Plusieurs Villes",
    "duration": "2 ans",
    "diploma": "BTS",
    "thresholds": { "sm": 10.5, "pc": 10.5, "svt": 10.5, "eco": 10 },
    "entrance": "Dossier",
    "specialties": "Comptabilité, Gestion, Maintenance Industrielle, Automatisme...",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbC6osKBPM-2xLdPlu5OqV_unfaAk8xkmk-g&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRji51fPRA2v1JMydbbkQoisSkSJwUvd7hhQw&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkZfNDWxbt23DdGzUdpDmsv8fmvWD4zzB2Yg&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8-Kr2kNbHr61FTy6SqZeTN79uAGUi6gf83g&s"
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ7pefXUppPgJSumNE9TfG3HJqpEs6NfAUkw&s"
  }
];

export const SCHOOL_ACRONYMS = [
  "BTS", "CPGE", "ENSA", "ENCG", "ENS", "ENSET", "ENSAM", "FST", "EST", "FMP", "FMD", 
  "ISPITS", "EMI", "ENSIAS", "EHTP", "INPT", "ENSEM", "INSEA", "ENFI", "ESITH", "IAV", 
  "ISPM", "ERA", "ERN", "ARM", "FRA", "AIAC", "ESMA", "CFPNC", "ISMA", "IFA", "ENA", 
  "EAC", "ISTA", "ITA", "FS", "FLSH", "FSJES", "UM6P", "UIR", "UIC", "UPM", "HEM", 
  "ESCA", "IGA", "SUPMTI", "ECC", "TBS", "SUPINFO", "EPSI", "INAS", "ISITT", "ISIC", 
  "INSAP", "IRFCJS", "ISADAC", "ESBAC", "ESAV", "INBA", "IFMIA", "ISCAE", "IAP", "EMSI"
];
