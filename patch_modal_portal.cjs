const fs = require('fs');
let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const modalStartCode = `      {/* Post Modal (Questions) */}
      <AnimatePresence>
        {expandedComments && posts.find(p => p.id === expandedComments) && (`;

const newModalStartCode = `      {/* Post Modal (Questions) */}
      {createPortal(
        <AnimatePresence>
          {expandedComments && posts.find(p => p.id === expandedComments) && (`;

code = code.replace(modalStartCode, newModalStartCode);

const modalEndCode = `                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}`;

const newModalEndCode = `                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Registration Modal */}`;

code = code.replace(modalEndCode, newModalEndCode);

fs.writeFileSync('src/components/Feed.tsx', code);
