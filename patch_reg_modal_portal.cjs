const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const regModalStart = `      {/* Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (`;

const newRegModalStart = `      {/* Registration Modal */}
      {createPortal(
        <AnimatePresence>
          {showRegisterModal && (`;

code = code.replace(regModalStart, newRegModalStart);

const regModalEnd = `              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}`;

const newRegModalEnd = `              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Fullscreen Image Modal */}`;

code = code.replace(regModalEnd, newRegModalEnd);

fs.writeFileSync('src/components/Feed.tsx', code);
