const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

// Fixing the missing closing div for the extra wrapper if user is not author
const oldCode2 = \`                          </div>
                        )}
                      </div>
                      {/* Body */}\`;

const newCode2 = \`                          </div>
                        )}
                        </div>
                      </div>
                      {/* Body */}\`;

code = code.replace(oldCode2, newCode2);

fs.writeFileSync('src/components/Feed.tsx', code);
