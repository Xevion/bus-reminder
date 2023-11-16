const colors = require('tailwindcss/colors');
const Color = require('color');

const range = (lower, upper, step) => {
    return Array.from(
        new Array(Math.floor(upper / step - lower / step) + 1),
        (_, i) => lower / step + i
    ).map((x) => x * step);
};

function generateColor(base, max, min, step) {
    const baseMax = Math.max(...Object.keys(base).map((v) => parseInt(v)));
    const generated = range(min, max, step)
        .filter((v) => base[v] === undefined)
        .map((weight) => {
            const isHighWeight = weight + step > baseMax;
            if (isHighWeight) {
                const baseDarkest = Color(base[baseMax]);
                const weightDifference = weight - baseMax;
                const darkened = baseDarkest.darken(0.005 * weightDifference);
                // console.log({
                //     dark: baseDarkest.hex(),
                //     darkLight: baseDarkest.luminosity(),
                //     weightDifference,
                //     darkened: darkened.hex()
                // });
                return [weight, darkened.hex()];
            }

            const lighter = Color(base[weight - step]);
            const darker = Color(base[weight + step]);
            return [weight, lighter.mix(darker).hex()];
        });

    return Object.fromEntries(generated.filter((v) => v != null));
}

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

const generatedColors = Object.fromEntries(
    Object.entries(colors)
        .filter(([key, _]) => !skipColors.has(key))
        .map(([colorKey, value]) => {
            return [colorKey, generateColor(value, 1300, 150, 50)];
        })
);

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
