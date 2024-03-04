import { nounSuffixes, properNouns } from "./nouns";

export const checkNoun = (word: string) => {
  // Check if the word is a noun by checking if it ends with a noun suffix or is a proper noun
  return (
    nounSuffixes.some((suffix) => word.endsWith(suffix)) ||
    properNouns.includes(word)
  );
};
