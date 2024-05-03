export function handleStringSize(str) {
    if (!str) return str
    if (str.length >= 24) return str.slice(0, 25) + "...";
    return str;
}