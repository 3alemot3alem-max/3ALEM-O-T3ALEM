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
  details?: string;
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
    "logoUrl": "https://upload.wikimedia.org/wikipedia/fr/0/05/EMI.PNG",
    "details": `🎓 EMI — École Mohammadia d'Ingénieurs

Type : École d’ingénieurs publique  
Ville : Rabat (Agdal) 🇲🇦  
Université : Université Mohammed V de Rabat  
Création : 1959  
Diplôme : Diplôme d’Ingénieur d’État  
Durée de formation : 5 ans après le Bac (ou cycle ingénieur selon voie d’accès)

EMI est considérée comme une des grandes écoles d’ingénieurs les plus prestigieuses du Maroc. Elle forme des ingénieurs polyvalents avec une forte base scientifique, technique et managériale.

### 📌 Admission

**1) Après CPGE (2 ans)**
Accès après :
- CPGE MP
- CPGE PSI
- CPGE TSI

➡️ Passage par le Concours National Commun (CNC).

**2) Après FST / Faculté des Sciences**
Possible aussi pour les étudiants titulaires de :
- DEUG / DEUST
- Licence

Filières acceptées selon les concours :
- Mathématiques
- Mathématiques-Informatique
- Physique
- MIP (Mathématiques Informatique Physique) pour FST

Admission par concours spécifique / sélection selon conditions.

### 🏫 Organisation des études
**Cycle ingénieur (3 ans)**

*1ère année* - Formation générale :
- Mathématiques avancées
- Physique
- Informatique
- Sciences de l’ingénieur
- Management
- Communication

*2ème et 3ème année*
Spécialisation dans une filière.

### 🚀 Les filières de l'EMI

EMI propose plusieurs grandes filières d'ingénierie :

**💻 1) Génie Informatique (GI)**  
*Formation dans* : Programmation, Algorithmique, Bases de données, Intelligence artificielle, Machine Learning, Cybersécurité, Réseaux, Systèmes d'information, Développement logiciel.  
*Métiers* : Ingénieur logiciel, Data Engineer, Ingénieur IA, Architecte systèmes, Chef de projet IT.

**🏗️ 2) Génie Civil (GC)**  
*Formation* : Structures, Béton armé, Résistance des matériaux, Construction, Routes, Hydraulique, Gestion des projets.  
*Métiers* : Ingénieur BTP, Ingénieur structures, Chef de chantier, Responsable projets.

**⚡ 3) Génie Électrique (GE)**  
*Formation* : Électronique, Automatique, Électricité, Énergies, Systèmes embarqués.  
*Métiers* : Ingénieur électrique, Ingénieur énergie, Ingénieur systèmes.

**⚙️ 4) Génie Mécanique (GM)**  
*Formation* : Mécanique des solides, Conception mécanique, Machines, Matériaux, Thermodynamique.  
*Métiers* : Ingénieur mécanique, Ingénieur automobile, Ingénieur industriel.

**🏭 5) Génie Industriel (GI)**  
*Formation* : Production, Logistique, Qualité, Management industriel, Optimisation.  
*Métiers* : Ingénieur industriel, Supply chain manager, Chef de production.

**🧪 6) Génie des Procédés**  
*Formation* : Chimie industrielle, Thermodynamique, Transfert de matière, Procédés industriels.  
*Métiers* : Ingénieur procédés, Industrie chimique, Énergie.

**⛏️ 7) Génie Minéral**  
*Formation* : Mines, Géologie, Matériaux, Exploitation minière.  
*Métiers* : Ingénieur mines, Ingénieur matériaux.

**📊 8) Modélisation et Informatique Scientifique**  
*Formation* : Mathématiques appliquées, Simulation, Calcul scientifique, Modélisation.  
*Métiers* : Ingénieur simulation, Data scientist, Recherche.

### 🌍 Stages
Pendant la formation :
- Stage découverte
- Stage technique
- Projet de fin d'études (PFE)

Les étudiants peuvent travailler avec : Entreprises industrielles, Banques, Sociétés IT, Bureaux d’études.

### ⭐ Points forts de EMI
- ✅ Grande école publique
- ✅ Diplôme d’État reconnu
- ✅ Très bonne réputation au Maroc
- ✅ Formation polyvalente
- ✅ Réseau important d’anciens élèves
- ✅ Opportunités internationales`
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
    "name": "ENSAM",
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
    "name": "ENSA",
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
    "logoUrl": "https://uploads.9rayti.com/2012/07/logo-era-marrakech.png"
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
    "name": "FMP & FMD",
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
    "name": "FST",
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
    "name": "BTS",
    "type": "BTS",
    "city": "Plusieurs Villes",
    "duration": "2 ans",
    "diploma": "BTS",
    "thresholds": { "sm": 10.5, "pc": 10.5, "svt": 10.5, "eco": 10 },
    "entrance": "Dossier",
    "specialties": "Comptabilité, Gestion, Maintenance Industrielle, Automatisme...",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbC6osKBPM-2xLdPlu5OqV_unfaAk8xkmk-g&s",
    "details": `
---

# 🎓 BTS — Brevet de Technicien Supérieur

**Type :** Formation supérieure publique  
**Ville :** Plusieurs villes du Maroc 🇲🇦  
**Tutelle :** Ministère de l'Éducation Nationale, du Préscolaire et des Sports  
**Diplôme :** Brevet de Technicien Supérieur (BTS)  
**Durée de formation :** 2 ans après le Baccalauréat  

Le **BTS** est une formation supérieure professionnalisante qui prépare les étudiants à une insertion rapide dans le monde du travail ou à la poursuite des études. La formation est axée sur la pratique, les stages et les compétences techniques dans plusieurs domaines.

---

## 📌 Admission

### Après le Baccalauréat

Accès après :
* Bac Sciences Mathématiques
* Bac Sciences Physiques
* Bac Sciences de la Vie et de la Terre
* Bac Sciences Économiques
* Bac Sciences et Technologies
* Bac Professionnel (selon la filière)

➡️ Admission sur étude du dossier scolaire selon les critères de sélection.

---

## 🏫 Organisation des études

Formation de **2 ans**.

### 1ère année
Acquisition des bases scientifiques, techniques et professionnelles de la spécialité.

### 2ème année
Approfondissement de la spécialité, réalisation de projets et stage en entreprise.

---

# 🚀 Les filières du BTS

Le BTS propose plusieurs spécialités adaptées aux besoins du marché du travail :

### 💻 1) Développement des Systèmes d'Information (DSI)
Formation dans le développement d'applications, le développement web, les bases de données et le génie logiciel.  
**Métiers :** Développeur Web, Développeur Logiciel, Analyste Programmeur, Intégrateur Web.

---

### 🤖 2) Développement de l'Intelligence Artificielle (DIA)
Formation dans l'intelligence artificielle, le Machine Learning, la Data Science, le Deep Learning et les technologies intelligentes.  
**Métiers :** Développeur IA, Data Analyst, Ingénieur Machine Learning Junior, Assistant Data Scientist.

---

### 🌐 3) Réseaux et Systèmes Informatiques (RSI)
Formation dans les réseaux informatiques, l'administration système, le cloud computing et la cybersécurité.  
**Métiers :** Administrateur Réseau, Administrateur Système, Technicien Réseau, Technicien Cloud.

---

### 🔒 4) Cybersécurité
Formation dans la sécurité informatique, la protection des réseaux et la sécurité des systèmes d'information.  
**Métiers :** Analyste Cybersécurité, Consultant Sécurité, Technicien SOC.

---

### 📱 5) Développement Mobile
Formation dans la conception et le développement d'applications Android et iOS.  
**Métiers :** Développeur Android, Développeur iOS, Développeur Mobile.

---

### 📊 6) Comptabilité et Gestion (CG)
Formation dans la comptabilité, la gestion financière, la fiscalité et l'administration des entreprises.  
**Métiers :** Comptable, Gestionnaire Comptable, Assistant Contrôleur de Gestion.

---

### 💰 7) Commerce International (CI)
Formation dans le commerce, le marketing, l'import-export et la négociation commerciale.  
**Métiers :** Commercial International, Responsable Export, Assistant Marketing.

---

### ⚡ 8) Électrotechnique
Formation dans les installations électriques, les automatismes et les systèmes industriels.  
**Métiers :** Technicien Électrique, Automaticien, Responsable Maintenance.

---

### 🏗️ 9) Génie Civil
Formation dans les travaux publics, la construction, le bâtiment et les infrastructures.  
**Métiers :** Conducteur de Travaux, Technicien Génie Civil, Dessinateur BTP.

---

### 🏭 10) Maintenance Industrielle
Formation dans la maintenance des équipements industriels, l'automatisme et les systèmes de production.  
**Métiers :** Technicien Maintenance, Responsable Maintenance Industrielle.

---

## 🌍 Stages

Pendant la formation :
* Stage d'initiation
* Stage technique
* Projet de fin d'études (PFE)

Les étudiants peuvent effectuer leurs stages dans des entreprises industrielles, des sociétés informatiques, des banques, des administrations publiques, des bureaux d'études ou des startups.

---

# ⭐ Points forts du BTS

✅ Diplôme reconnu par l'État  
✅ Formation professionnalisante en 2 ans  
✅ Nombreuses spécialités dans les domaines du numérique, de l'industrie et de la gestion  
✅ Stages obligatoires en entreprise  
✅ Possibilité de poursuivre ses études (Licence Professionnelle, Écoles d'Ingénieurs, ENCG, FST, etc.)  
✅ Bonne insertion sur le marché du travail  

> **Remarque :** Certaines filières (comme *Développement de l'Intelligence Artificielle* ou *Développement Mobile*) ne sont pas proposées dans tous les établissements BTS au Maroc. Elles dépendent de l'établissement qui dispense la formation. Si vous préparez un guide officiel, il est préférable de présenter uniquement les filières effectivement offertes par les BTS que vous référencez.
`
  },
  {
    "id": "cpge-national",
    "name": "CPGE (Classes Préparatoires)",
    "type": "Prépas",
    "city": "Plusieurs Villes",
    "duration": "2 ans",
    "diploma": "Accès Grandes Écoles",
    "thresholds": { "sm": 14, "pc": 15, "svt": 16, "eco": 14 },
    "entrance": "Dossier",
    "specialties": "MP, PSI, TSI, ECS, ECT",
    "sector": "Public",
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRji51fPRA2v1JMydbbkQoisSkSJwUvd7hhQw&s",
    "details": `
---

# 🎓 CPGE — Classes Préparatoires aux Grandes Écoles

**Type :** Formation supérieure publique (et privée)  
**Ville :** Plusieurs villes du Maroc 🇲🇦  
**Tutelle :** Ministère de l'Éducation Nationale, du Préscolaire et des Sports  
**Diplôme :** Attestation de fin de CPGE (préparation aux concours)  
**Durée de formation :** 2 ans après le Baccalauréat  

Les **CPGE** sont des formations d'excellence destinées aux étudiants souhaitant intégrer les grandes écoles d'ingénieurs ou de commerce. Elles offrent une formation scientifique, technique ou économique de haut niveau et préparent principalement aux concours nationaux et internationaux.

---

## 📌 Admission

### Après le Baccalauréat

Accès après :
* Bac Sciences Mathématiques (A ou B)
* Bac Sciences Physiques
* Bac Sciences et Technologies Électriques
* Bac Sciences et Technologies Mécaniques
* Bac Sciences Économiques (pour les filières commerciales)

➡️ Admission sur étude du dossier scolaire (notes de 1ère année et du Bac), selon les places disponibles.

---

## 🏫 Organisation des études

Formation de **2 ans**.

### 1ère année
Acquisition des bases scientifiques, techniques ou économiques selon la filière choisie.

### 2ème année
Approfondissement des connaissances et préparation intensive aux concours nationaux et internationaux.

---

# 🚀 Les filières des CPGE

Les CPGE sont organisées en deux grands pôles : **Scientifique et Technologique** et **Économique et Commercial**.

### 📐 1) MP — Mathématiques et Physique
Formation dans les mathématiques avancées, la physique et les sciences de l'ingénieur.  
**Débouchés :** EMI, ENSIAS, INPT, EHTP, ENSAM, ENSEM, Écoles Centrales, Mines, Polytechnique et autres grandes écoles.

---

### ⚙️ 2) PSI — Physique et Sciences de l'Ingénieur
Formation en physique, mécanique, électronique, automatique et sciences industrielles.  
**Débouchés :** EMI, ENSIAS, ENSAM, INPT, ENSEM, EHTP et grandes écoles d'ingénieurs.

---

### 🏭 3) TSI — Technologie et Sciences Industrielles
Formation destinée principalement aux bacheliers technologiques, axée sur les sciences industrielles et l'ingénierie.  
**Débouchés :** EMI, ENSAM, EHTP, ENSEM, INPT et autres écoles d'ingénieurs.

---

### 💼 4) ECS — Économique et Commerciale, option Scientifique
Formation en mathématiques, économie, culture générale et langues.  
**Débouchés :** ISCAE, ENCG (admissions spécifiques), écoles de commerce marocaines et internationales.

---

### 📊 5) ECT — Économique et Commerciale, option Technologique
Formation destinée aux étudiants souhaitant poursuivre dans les domaines du commerce, de la gestion et du management.  
**Débouchés :** ISCAE, ENCG, écoles de commerce et de management.

---

## 🌍 Concours

À la fin des deux années, les étudiants peuvent passer :
* **Concours National Commun (CNC)** pour les écoles d'ingénieurs marocaines.
* **Concours d'accès aux grandes écoles françaises.**
* **Concours des écoles de commerce** selon la filière suivie.

---

# ⭐ Points forts des CPGE

✅ Formation d'excellence reconnue au Maroc  
✅ Préparation intensive aux concours des grandes écoles  
✅ Niveau scientifique et technique très élevé  
✅ Accès aux meilleures écoles d'ingénieurs et de commerce  
✅ Possibilités de poursuivre des études au Maroc ou à l'international  
✅ Développement de l'autonomie, de la rigueur et des capacités d'analyse
`
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
