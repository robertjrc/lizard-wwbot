export function timeDuration(date, type) {
    let diffInMillis;
    let result;

    switch (type) {
        case "future": diffInMillis = date - Date.now(); break;
        case "past": diffInMillis = Date.now() - date; break;
        default: diffInMillis = date - Date.now(); break;
    }

    const diffSeconds = Math.floor(diffInMillis / 1000);
    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    if (days > 0) {
        result = (hours > 0) ? `${days}d ${hours}h` : `${days}d`;
    } else if (hours > 0) {
        result = (minutes > 0) ? `${hours}h ${minutes}m` : `${hours}h`;
    } else if (minutes > 0) {
        result = (seconds > 0) ? `${minutes}m ${seconds}s` : `${minutes}m`
    } else {
        result = `${seconds}s`;
    }

    return result;
}
