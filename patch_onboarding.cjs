const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingTour.tsx', 'utf8');

const oldImport = "import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';";
const newImport = "import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';";

code = code.replace(oldImport, newImport);

// Also need to use Joyride as component
// <Joyride ... /> is correct if we imported Joyride
fs.writeFileSync('src/components/OnboardingTour.tsx', code);
