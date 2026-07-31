const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingTour.tsx', 'utf8');

const oldSteps = code.substring(code.indexOf('const steps: Step[] = ['), code.indexOf('  ];') + 4);

const newSteps = `const steps: Step[] = [
    {
      target: 'body',
      content: "Bienvenue sur 3alem o t3alem ! Faisons un petit tour pour vous montrer comment utiliser l'application.",
      placement: 'center',
    },
    {
      target: \`\${prefix}feed\`,
      content: "C'est ici que vous trouverez le fil d'actualités avec les publications et les questions de la communauté.",
      placement: 'bottom',
    },
    {
      target: '.tour-profile-views',
      content: "Suivez le nombre de personnes qui ont visité votre profil. C'est un excellent moyen de mesurer votre visibilité.",
      placement: 'bottom',
    },
    {
      target: '.tour-share-post',
      content: "Partagez des articles, des images ou posez des questions à la communauté pour échanger et apprendre ensemble.",
      placement: 'bottom',
    },
    {
      target: '.tour-first-post',
      content: "Voici une publication typique. Vous pouvez consulter son contenu, les médias partagés, et interagir avec l'auteur.",
      placement: 'bottom',
    },
    {
      target: '.tour-post-questions',
      content: "Si vous avez une interrogation ou souhaitez répondre à l'auteur, utilisez ce bouton pour accéder à l'espace Q&A spécifique à l'article.",
      placement: 'bottom',
    },
    {
      target: '.tour-news-sidebar',
      content: "Restez informé des dernières actualités officielles du réseau ou des annonces des établissements.",
      placement: 'bottom',
    },
    {
      target: '.tour-offers-sidebar',
      content: "Découvrez nos offres d'accompagnement exclusives (Packs GOLD et STANDARD) pour maximiser vos chances de réussite.",
      placement: 'bottom',
    },
    {
      target: \`\${prefix}schools\`,
      content: "Découvrez notre annuaire complet des écoles et établissements éducatifs.",
      placement: 'bottom',
    },
    {
      target: \`\${prefix}ai\`,
      content: "Notre assistant IA est là pour répondre à toutes vos questions académiques et vous accompagner !",
      placement: 'bottom',
    },
    {
      target: \`\${prefix}notifications\`,
      content: "Restez informé en temps réel de l'activité sur vos publications et de vos interactions avec les autres membres.",
      placement: 'bottom',
    },
    {
      target: \`\${prefix}profile\`,
      content: "Gérez votre profil, mettez à jour vos informations et suivez toutes vos statistiques d'un coup d'œil.",
      placement: 'bottom',
    },
  ];`;

code = code.replace(oldSteps, newSteps);

fs.writeFileSync('src/components/OnboardingTour.tsx', code);
