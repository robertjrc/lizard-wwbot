export function relativeTime(time, type) {
    let diffEmMiliseconds;
    let result;

    switch (type) {
        case "future": diffEmMiliseconds = time - Date.now(); break;
        case "past": diffEmMiliseconds = Date.now() - time; break;
        default: diffEmMiliseconds = time - Date.now(); break;
    }

    const diffInSeconds = diffEmMiliseconds / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    const diffInMonths = diffInDays / 30;
    const diffInYears = diffInMonths / 12;

    if (diffInYears >= 1) {
        result = `${Math.floor(diffInYears)} an${Math.floor(diffInMonths) == 1 ? "o" : "os"}`;
    } else if (diffInMonths >= 1) {
        result = `${Math.floor(diffInMonths)} m${Math.floor(diffInMonths) == 1 ? "ês" : "eses"}`;
    } else if (diffInDays >= 1) {
        result = `${Math.floor(diffInDays)} di${Math.floor(diffInDays) == 1 ? "a" : "as"}`;
    } else if (diffInHours >= 1) {
        result = `${Math.floor(diffInHours)} hor${Math.floor(diffInHours) == 1 ? "a" : "as"}`;
    } else if (diffInMinutes >= 1) {
        result = `${Math.floor(diffInMinutes)} minut${Math.floor(diffInMinutes) == 1 ? "o" : "os"}`;
    } else {
        result = `${Math.floor(diffInSeconds)} segund${(Math.floor(diffInSeconds) == 1) ? "o" : "os"}`
    }

    return result;
}

