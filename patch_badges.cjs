const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For mobile drawer
code = code.replace(
`                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>`,
`                    >
                      <div className="relative">
                        <tab.icon size={20} />
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-moroccan-red text-[8px] font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {tab.label}
                    </button>`
);

// For desktop header
code = code.replace(
`              >
                <tab.icon size={18} />
                {tab.label}
              </button>`,
`              >
                <div className="relative flex items-center justify-center">
                  <tab.icon size={18} />
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-moroccan-red text-[8px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {tab.label}
              </button>`
);

// For mobile bottom navigation
code = code.replace(
`                {activeTab === 'ai' && tab.id === 'ai' && (
                  <div className="absolute top-1 right-3 w-2 h-2 bg-moroccan-green rounded-full animate-ping"></div>
                )}
                <tab.icon size={22} className={activeTab === tab.id ? 'fill-current' : ''} />
                <span className="text-[10px] font-semibold">{tab.label}</span>`,
`                {activeTab === 'ai' && tab.id === 'ai' && (
                  <div className="absolute top-1 right-3 w-2 h-2 bg-moroccan-green rounded-full animate-ping"></div>
                )}
                <div className="relative flex items-center justify-center">
                  <tab.icon size={22} className={activeTab === tab.id ? 'fill-current' : ''} />
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-moroccan-red border-2 border-[#e1d4d4] text-[8px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{tab.label}</span>`
);

fs.writeFileSync('src/App.tsx', code);
