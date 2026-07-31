const fs = require('fs');

let schoolsContent = fs.readFileSync('src/data/schools.ts', 'utf8');

const cpgeDetails = `
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
`;

const oldBlock = `  {
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
  },`;

const newBlock = `  {
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
    "details": \`${cpgeDetails}\`
  },`;

schoolsContent = schoolsContent.replace(oldBlock, newBlock);

fs.writeFileSync('src/data/schools.ts', schoolsContent);
