const formatHistoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Calculate the difference in time
  const diffTime = now.getTime() - date.getTime();

  // Calculate the difference in days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Days
  const diffMonths = Math.floor(diffDays / 30); // Approximate months
  const diffYears = Math.floor(diffDays / 365); // Years

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    return `Today`;
  }
};

export default formatHistoryDate;
