export function replaceLast(str: string, find: string, replace: string) {
  const lastIndex = str.lastIndexOf(find);

  if (lastIndex === -1) {
    return str;
  }

  const beginString = str.substring(0, lastIndex);
  const endString = str.substring(lastIndex + find.length);

  return beginString + replace + endString;
}
