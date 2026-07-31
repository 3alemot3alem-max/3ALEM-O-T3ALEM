const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingTour.tsx', 'utf8');

const stepsDecl = `  const steps: Step[] = [`;
const newStepsDecl = `  const isMobile = window.innerWidth < 768;
  const prefix = isMobile ? '.mobile-tour-nav-' : '.desktop-tour-nav-';

  const steps: Step[] = [`;
code = code.replace(stepsDecl, newStepsDecl);

code = code.replace(/\.tour-nav-/g, '${prefix}');

// Wait, the steps array has single quotes for targets. I need to make them template literals or use prefix + 'feed'
// Let's just fix it by replacing `{ target: '${prefix}feed',` because it was `{ target: '.tour-nav-feed',` and now is `{ target: '${prefix}feed',` which is a string literal '${prefix}feed' instead of template literal unless I use backticks.

fs.writeFileSync('src/components/OnboardingTour.tsx', code);
