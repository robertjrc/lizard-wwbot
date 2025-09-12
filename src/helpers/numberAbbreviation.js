export function numberAbbreviation(number) {
    return new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    }).format(number);
}
