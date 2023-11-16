const colors = require('tailwindcss/colors');
const Color = require('color');

// Range generation function
const range = (lower, upper, step) => {
    return Array.from(
        new Array(Math.floor(upper / step - lower / step) + 1),
        (_, i) => lower / step + i
    ).map((x) => x * step);
};

function generateColor(base, max, min, step) {
    // The heaviest weight color defined in the base palette
    const baseMax = Math.max(...Object.keys(base).map((v) => parseInt(v)));
    // Color object of baseMax
    const baseMaxColor = Color(base[baseMax]);
    // Total number of steps from baseMax to max by step
    const totalSteps = (max - baseMax) / step;

    // Generate step colors, or for colors beyond baseMax, a darkened color
    const generated = range(min, max, step)
        // Don't try to redefine colors or anything
        .filter((v) => base[v] === undefined)
        .map((weight) => {
            // Determine if we're mixing or darkening
            const isHighWeight = weight + step > baseMax;
            if (isHighWeight) {
                // The Nth step from baseMax on the way to max
                const baseMaxStep = (weight - baseMax) / step;
                const darkened = baseMaxColor.darken(baseMaxStep / totalSteps);
                return [weight, darkened.hex()];
            }

            // Get lighter and darker colors, then mix the two for an intermediary color
            const lighter = Color(base[weight - step]);
            const darker = Color(base[weight + step]);
            return [weight, lighter.mix(darker).hex()];
        });

    // Build a new object, skip null entries
    return Object.fromEntries(generated.filter((v) => v != null));
}

// Colors that only have one value, or are special/meta. We don't want to try and generate them.
const skipColors = new Set([
    'inherit',
    'transparent',
    'current',
    'black',
    'white',
    'lightBlue',
    'warmGray',
    'trueGray',
    'coolGray',
    'blueGray'
]);

// Invoke color generation on each color that isn't meta/singular
const generatedColors = Object.fromEntries(
    Object.entries(colors)
        .filter(([key, _]) => !skipColors.has(key))
        .map(([colorKey, value]) => {
            return [colorKey, generateColor(value, 1300, 150, 50)];
        })
);

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Expand, allow for custom colors to be mixed with generated ones
                ...generatedColors
            }
        }
    },
    plugins: [require('@tailwindcss/forms')]
};
