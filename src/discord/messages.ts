
export function truncate(str: string, maxChars: number, trail: string = "...") {
  let maxLength = maxChars - trail.length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength) + trail;
  }
  
  return str;
}