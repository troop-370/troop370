import Color from 'color';

/**
 * Creates a lighter variant of an input color by mixing it with white.
 *
 * @param color the color to be lightened
 * @param strength stength between 0 and 1
 */
function lighten(color: string, strength: number): string {
  const col = Color(color)
    .mix(Color('#ffffff'), strength) // mix in white on top of the color
    .hex() // convert to hex
    .toLowerCase(); // make letters lowercase for consistency
  return col;
}

/**
 * Creates a darker variant of an input color by mixing it with black.
 *
 * @param color the color to be darkened
 * @param strength stength between 0 and 1
 */
function darken(color: string, strength: number): string {
  const col = Color(color)
    .mix(Color('#000000'), strength) // mix in black on top of the colorString
    .hex() // convert to hex
    .toLowerCase(); // make letters lowercase for consistency
  return col;
}

/**
 * Generates array of color shades for the specified color
 *
 * @param color the color
 * @param steps number of steps as an integer
 */
function getColorShadesArray(color: string, steps = 15) {
  steps = Math.floor(steps); // remove any decimal places
  const middle = (steps + 1) / 2; // get the midpoint in the number of steps
  const shades = Array.from({ length: steps }) // array length = steps
    .map((shade, index) => {
      const step = index + 1;
      if (step < middle) {
        // lighten for lower steps
        return lighten(color, (middle - step) / middle);
      } else if (step === middle) {
        // keep same for middle step
        return lighten(color, 0); // use `lighten()` for consistent format
      } else {
        // darken for higher steps
        return darken(color, (step - middle) / middle);
      }
    });
  return shades;
}

/**
 * Generates an object of color shades
 *
 * @param color the color
 * @param steps the number of steps as an integer
 */
function getColorShades(color: string, steps = 15): { [key: number]: string } {
  const shadesArray = getColorShadesArray(color, steps);
  const shades: { [key: number]: string } = {};
  shadesArray.forEach((shade, index) => {
    const shadeNum = (index + 1) * 100;
    shades[shadeNum] = shade;
  });
  return shades;
}

export { darken, getColorShades, lighten };
