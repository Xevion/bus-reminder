const colors = require('tailwindcss/colors');
const Color = require('color');
const colorString = require('color-string');

const range = (lower, upper, step) => {
    return Array.from(
        new Array(Math.floor(upper / step - lower / step) + 1),
        (_, i) => lower / step + i
    ).map((x) => x * step);
};

function generateColor(base, noun, max, min, step) {
    const baseMax = Math.max(...Object.keys(base).map((v) => parseInt(v)));
    console.log(baseMax);
    const generated = range(min, max, step)
        .filter((v) => base[v] === undefined)
        .map((weight) => {
            const isHighWeight = weight + step > baseMax;
            // if (isHighWeight) return [weight, '???'];
            if (isHighWeight) return null;

            const lighter = Color(base[weight - step]);
            const darker = Color(base[weight + step]);
            return [weight, lighter.mix(darker).hex()];
        });

    return Object.fromEntries(generated.filter((v) => v != null));
}

const generatedColors = Object.fromEntries(
    Object.entries(colors).map(([colorKey, value]) => {
        return [colorKey, generateColor(value, colorKey, 1100, 150, 50)];
    })
);

// const generatedColors = {
//     yellow: generateColor(colors.yellow, 'yellow', 1100, 150, 50)
// };

console.log({ ...generatedColors });
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                ...generatedColors
            }
        }
    },
    plugins: [require('@tailwindcss/forms')]
};
