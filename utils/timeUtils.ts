export const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
};

export const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getStandardTapeLength = (totalSeconds: number): number => {
    const minutes = Math.ceil(totalSeconds / 60);
    if (minutes <= 30) return 30; // C60 (30 mins per side)
    if (minutes <= 45) return 45; // C90 (45 mins per side)
    if (minutes <= 60) return 60; // C120 (60 mins per side)
    return minutes; // Custom length if longer
};
