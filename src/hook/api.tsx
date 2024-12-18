export const isErr = (state: unknown): state is Err => {
  return "error" in (state as any);
};

export const makeDateList = (videos: Video[]) => {
  const dateList: string[] = videos
    .map((e) => {
      const date = e.directory.find((el) => /^[0-9]{6}$/.test(el));
      return date || undefined;
    })
    .filter((v): v is string => !!v);

  const sortDateList = dateList.sort((a, b) => {
    return Number(b) - Number(a);
  });

  return Array.from(new Set(sortDateList));
};

export const Filter = (List: Video[], Filter: Filter): Video[] => {
  console.log(Filter);
  const filteredList = List.filter((e) => {
    const date = e.directory.includes(Filter.date) || Filter.date === "all";
    const check =
      e.directory.includes(Filter.check) ||
      (!e.directory.includes("_r") &&
        !e.directory.includes("_ok") &&
        Filter.check === "no") ||
      Filter.check === "all";
    const words = includeWords(e.name, Filter.wordList);
    console.log(date && check && words);
    return date && check && words;
  });

  return filteredList;
};

const includeWords = (name: string, words: string[]): boolean => {
  if (words.length === 0) {
    return true;
  }
  return words.every((e) => name.includes(e));
};

export const num2date = (num: string): string => {
  if (!num || num.length !== 6) {
    return "unknown";
  }

  const year = 2000 + parseInt(num.substring(0, 2));
  const month = parseInt(num.substring(2, 4));
  const day = parseInt(num.substring(4, 6));

  return `${year} / ${month} / ${day}`;
};
