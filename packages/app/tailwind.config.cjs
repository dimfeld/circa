const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');
const { autoDarkPlugin, autoDarkColors } = require('./tailwind-autodark.cjs');

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: colors.orange,
        ...autoDarkColors({ colors: ['gray', 'accent'] }),
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    autoDarkPlugin({
      mainElement: 'body',
      colors: ['gray', 'accent'],
    }),
  ],
};

module.exports = config;
