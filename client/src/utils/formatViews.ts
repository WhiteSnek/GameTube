function formatViews(views: number): string {
    if (views >= 1_000_000_000) {
        return (views / 1_000_000_000).toFixed(1) + 'B'; // Billions
    } else if (views >= 1_000_000) {
        return (views / 1_000_000).toFixed(1) + 'M'; // Millions
    } else if (views >= 1_000) {
        return (views / 1_000).toFixed(1) + 'K'; // Thousands
    } else {
        return views.toString(); // Less than a thousand
    }
}

export default formatViews;
