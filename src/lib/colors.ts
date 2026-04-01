/**
 * Global Rank Color Mapping for Ignitera OS
 * Z-A career ladder thematic progression
 */

export const RANK_COLORS: Record<string, string> = {
    // Initial/General (Z-W)
    'Z': '#94a3b8', 'Y': '#94a3b8', 'X': '#94a3b8', 'W': '#94a3b8',
    // Junior (V-T)
    'V': '#22d3ee', 'U': '#22d3ee', 'T': '#22d3ee',
    // Standard (S-P)
    'S': '#6366f1', 'R': '#6366f1', 'Q': '#6366f1', 'P': '#6366f1',
    // Expert (O-L)
    'O': '#a855f7', 'N': '#a855f7', 'M': '#a855f7', 'L': '#a855f7',
    // Elite (K-H)
    'K': '#ec4899', 'J': '#ec4899', 'I': '#ec4899', 'H': '#ec4899',
    // Senior (G-E)
    'G': '#f97316', 'F': '#f97316', 'E': '#f97316',
    // Master (D-C)
    'D': '#10b981', 'C': '#10b981',
    // Grandmaster (B-A)
    'B': '#ffcc00', 'A': '#ef4444' 
};

export const getRankColor = (rank: string) => {
    return RANK_COLORS[rank.toUpperCase()] || '#6366f1';
};

export const getRankGradient = (rank: string) => {
    const color = getRankColor(rank);
    return `linear-gradient(135deg, ${color}, rgba(0,0,0,0))`;
};
