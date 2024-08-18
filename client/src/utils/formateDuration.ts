function formatDuration(seconds: number): string {
    // Calculate hours, minutes, and seconds
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Format hours, minutes, and seconds
    const hrsStr = hrs > 0 ? `${hrs}:` : '';
    const minsStr = (hrs > 0 || mins > 0) ? `${String(mins).padStart(2, '0')}:` : `${mins}:`;
    const secsStr = String(secs).padStart(2, '0');

    // Return formatted string
    return `${hrsStr}${minsStr}${secsStr}`;
}

export default formatDuration;
