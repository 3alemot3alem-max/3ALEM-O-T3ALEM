const fs = require('fs');

let schoolsContent = fs.readFileSync('src/data/schools.ts', 'utf8');

const btsDetails = `
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
`;

const oldBlock = `  {
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
    "logoUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbC6osKBPM-2xLdPlu5OqV_unfaAk8xkmk-g&s"
  },`;

const newBlock = `  {
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
    "details": \`${btsDetails}\`
  },`;

schoolsContent = schoolsContent.replace(oldBlock, newBlock);

fs.writeFileSync('src/data/schools.ts', schoolsContent);

