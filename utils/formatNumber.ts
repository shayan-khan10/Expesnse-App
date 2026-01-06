export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return "";
  
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "PKR",
    });
  }
  