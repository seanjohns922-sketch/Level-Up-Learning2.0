type WeightedItem = {
  weight: number;
};

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function buildBag(items: WeightedItem[]) {
  const bag: number[] = [];
  items.forEach((item, index) => {
    const count = Math.max(1, Math.floor(item.weight));
    for (let occurrence = 0; occurrence < count; occurrence += 1) {
      bag.push(index);
    }
  });
  return shuffle(bag);
}

export function pickWeightedIndex<T extends WeightedItem>(
  items: T[],
  currentBag: number[],
  lastIndex: number | null
) {
  if (items.length === 0) {
    return { index: -1, bag: [] };
  }

  let bag = currentBag.length > 0 ? [...currentBag] : buildBag(items);
  let nextIndex = bag.pop() ?? 0;

  if (lastIndex !== null && nextIndex === lastIndex && bag.length > 0) {
    const alternative = bag.findIndex((value) => value !== lastIndex);
    if (alternative >= 0) {
      const swapped = bag[alternative];
      bag[alternative] = nextIndex;
      nextIndex = swapped;
    }
  }

  return { index: nextIndex, bag };
}
