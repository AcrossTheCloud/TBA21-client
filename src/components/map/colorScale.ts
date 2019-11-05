import chroma from 'chroma-js';

/**
 * Returns a object which holds the Hex based on the ZLevel in the colourScale
 *
 * @param zLevel, zLevel number from the map feature.
 * @param domain an array of numbers, [0, 10, 100, 5000]
 */
export function colourScale (zLevel: number, domain: number[] = [0, 100, 1000, 2000, 3000, 4000, 5000]): { colour: string, outline: string } {
  const postitiveZLevel = Math.abs(zLevel);
  const scale = chroma.scale(['#D5E3FF', '#003171']).domain(domain);
  const colour: string = scale(postitiveZLevel).hex();
  const outline: string = scale(postitiveZLevel).darken().hex();

  return { colour, outline };
}
