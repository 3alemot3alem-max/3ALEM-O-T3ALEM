const fs = require('fs');
let code = fs.readFileSync('src/useNotifications.ts', 'utf8');

code = code.replace(
`            }
          }
        }
        });
      }`,
`            }
          }
        });
      }`
);

fs.writeFileSync('src/useNotifications.ts', code);
