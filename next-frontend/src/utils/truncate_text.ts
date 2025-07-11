function truncateText(title: string, maxLength: number): string {
    if (title.length <= maxLength) {
        return title;
    }

    return title.slice(0, maxLength - 3) + '...'; // Subtract 3 for the ellipsis
}

export default truncateText;
