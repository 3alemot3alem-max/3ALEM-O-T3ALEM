const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(
  "import { LayoutGrid, GraduationCap, User, LogOut, Bot, WifiOff, Loader2, Menu, X, Bell } from 'lucide-react';",
  "import { LayoutGrid, GraduationCap, User, LogOut, Bot, WifiOff, Loader2, Menu, X, Bell, Newspaper } from 'lucide-react';"
);

code = code.replace(
  "import { SchoolDirectory } from './components/SchoolDirectory';",
  "import { SchoolDirectory } from './components/SchoolDirectory';\nimport { NetworkNews } from './components/NetworkNews';"
);

// Drawer Navigation Menu
const oldDrawerNav = `                  {[
                    { id: 'feed', icon: LayoutGrid, label: 'Fil d\\'actualité' },
                    { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
                    { id: 'ai', icon: Bot, label: 'Assistant IA' },
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'profile', icon: User, label: 'Mon Profil' }
                  ].map((tab) => (`;
const newDrawerNav = `                  {[
                    { id: 'feed', icon: LayoutGrid, label: 'Fil d\\'actualité' },
                    { id: 'news', icon: Newspaper, label: 'Actualités' },
                    { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
                    { id: 'ai', icon: Bot, label: 'Assistant IA' },
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'profile', icon: User, label: 'Mon Profil' }
                  ].map((tab) => (`;
code = code.replace(oldDrawerNav, newDrawerNav);

// Desktop Header Navigation Menu
const oldDesktopNav = `            {[
              { id: 'feed', icon: LayoutGrid, label: 'Fil d\\'actualité' },
              { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
              { id: 'ai', icon: Bot, label: 'Assistant IA' },
              { id: 'notifications', icon: Bell, label: 'Notifications' }
            ].map((tab) => (`;
// We might not add it to Desktop Header, but let's check if the user said "just dans le telephone".
// User said "dans le telephone la place actualite doit etre ici c'est pas avec les actualite just dans le telephone".
// Meaning: "in the phone, the actualité place should be here [in the drawer menu], it's not with the feed, just in the phone".
// This implies they want it only in the phone menu, OR they don't care about desktop, but "just dans le telephone" means on mobile it shouldn't be in the feed, it should be in the menu.
// Let's add it to Desktop too, or wait, if we add it to Desktop, we should remove it from the Feed sidebar on Desktop too.
// The user explicitly wrote: "just dans le telephone" meaning "only on the phone". So on desktop, they want to keep it in the Feed!
// Okay, let's keep the desktop nav as is, and only add it to the mobile drawer (already done above) and mobile bottom nav.

// Mobile Bottom Nav
const oldBottomNav = `            {[
              { id: 'feed', icon: LayoutGrid, label: 'Accueil' },
              { id: 'schools', icon: GraduationCap, label: 'Écoles' },
              { id: 'ai', icon: Bot, label: 'IA' },
              { id: 'notifications', icon: Bell, label: 'Notifs' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map((tab) => (`;
const newBottomNav = `            {[
              { id: 'feed', icon: LayoutGrid, label: 'Accueil' },
              { id: 'news', icon: Newspaper, label: 'Actualités' },
              { id: 'schools', icon: GraduationCap, label: 'Écoles' },
              { id: 'ai', icon: Bot, label: 'IA' },
              { id: 'notifications', icon: Bell, label: 'Notifs' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map((tab) => (`;
code = code.replace(oldBottomNav, newBottomNav);

// Routing
const oldRoutes = `              {activeTab === 'notifications' && <Notifications onViewProfile={viewUserProfile} />}
            </motion.div>`;
const newRoutes = `              {activeTab === 'notifications' && <Notifications onViewProfile={viewUserProfile} />}
              {activeTab === 'news' && <NetworkNews onViewProfile={viewUserProfile} />}
            </motion.div>`;
code = code.replace(oldRoutes, newRoutes);

fs.writeFileSync('src/App.tsx', code);
