const fs = require('fs');
let code = fs.readFileSync('src/components/SchoolDirectory.tsx', 'utf8');

// 1. Add createPortal import
if (!code.includes('createPortal')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

// 2. Wrap AnimatePresence with createPortal
const oldModal = `      {/* School Detail Modal */}
      <AnimatePresence>
        {selectedSchool && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-8">`;
const newModal = `      {/* School Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedSchool && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8">`;

code = code.replace(oldModal, newModal);

const oldFooter = `        )}
      </AnimatePresence>
    </div>
  );
};`;
const newFooter = `          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/SchoolDirectory.tsx', code);
