// ============================================================
// IPL Team Configurations - colors, short names, logos emoji
// ============================================================

export const IPL_TEAMS = {
  'Mumbai Indians': {
    short: 'MI',
    color: '#004BA0',
    accent: '#D1AB3E',
    logo: '🔵',
    bg: 'linear-gradient(135deg, #003380 0%, #0066CC 100%)',
  },
  'Chennai Super Kings': {
    short: 'CSK',
    color: '#F9CD05',
    accent: '#F9CD05',
    logo: '🦁',
    bg: 'linear-gradient(135deg, #d4a800 0%, #F9CD05 100%)',
  },
  'Royal Challengers Bangalore': {
    short: 'RCB',
    color: '#EC1C24',
    accent: '#D4AF37',
    logo: '🔴',
    bg: 'linear-gradient(135deg, #8B0000 0%, #EC1C24 100%)',
  },
  'Royal Challengers Bengaluru': {
    short: 'RCB',
    color: '#EC1C24',
    accent: '#D4AF37',
    logo: '🔴',
    bg: 'linear-gradient(135deg, #8B0000 0%, #EC1C24 100%)',
  },
  'Kolkata Knight Riders': {
    short: 'KKR',
    color: '#3A225D',
    accent: '#B5902A',
    logo: '⚡',
    bg: 'linear-gradient(135deg, #2D1A4E 0%, #5B2C8D 100%)',
  },
  'Sunrisers Hyderabad': {
    short: 'SRH',
    color: '#F7A721',
    accent: '#FF6B00',
    logo: '🌅',
    bg: 'linear-gradient(135deg, #E05200 0%, #F7A721 100%)',
  },
  'Rajasthan Royals': {
    short: 'RR',
    color: '#EA1A85',
    accent: '#254AA5',
    logo: '👑',
    bg: 'linear-gradient(135deg, #C00060 0%, #EA1A85 100%)',
  },
  'Delhi Capitals': {
    short: 'DC',
    color: '#0078BC',
    accent: '#EF1C25',
    logo: '⚡',
    bg: 'linear-gradient(135deg, #004C8C 0%, #0078BC 100%)',
  },
  'Punjab Kings': {
    short: 'PBKS',
    color: '#AA4545',
    accent: '#DCDDDD',
    logo: '🦁',
    bg: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)',
  },
  'Lucknow Super Giants': {
    short: 'LSG',
    color: '#A72056',
    accent: '#FBCE07',
    logo: '🦅',
    bg: 'linear-gradient(135deg, #0A2240 0%, #1A4B8C 100%)',
  },
  'Gujarat Titans': {
    short: 'GT',
    color: '#1B2133',
    accent: '#1B6FB5',
    logo: '🦁',
    bg: 'linear-gradient(135deg, #071327 0%, #1B2133 100%)',
  },
};

export const getTeamConfig = (teamName) => {
  if (!teamName) return null;
  const key = Object.keys(IPL_TEAMS).find(k =>
    teamName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? { name: key, ...IPL_TEAMS[key] } : {
    short: teamName?.slice(0, 3).toUpperCase() || '???',
    color: '#4a9eff',
    accent: '#8b5cf6',
    logo: '🏏',
    bg: 'linear-gradient(135deg, #0f1628, #141c2e)',
  };
};
