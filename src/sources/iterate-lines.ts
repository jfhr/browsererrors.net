export function *iterateLines(text: string): Generator<string> {
  let previousIndex = 0;
  let index;
  while (true) {
    index = text.indexOf('\n', previousIndex);
    if (index === -1) {
      return;
    }
    yield text.substring(previousIndex, index);
    previousIndex = index + 1;
  }
}
