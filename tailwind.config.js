/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./kids/*.html",
    "./quiz/*.html",
    "./*.js",
    "./quiz/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
  safelist: [
    { pattern: /bg-(red|green|blue|yellow|purple|pink|indigo|gray)-(100|200|300|400|500|600|700)/ },
    { pattern: /text-(red|green|blue|yellow|purple|pink|indigo|gray)-(500|600|700|800|900)/ },
    { pattern: /border-(red|green|blue|yellow|purple|pink|indigo|gray)-(300|400|500)/ },
    { pattern: /^(flex|grid|hidden|block|inline|inline-block)$/ },
    { pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/ },
    { pattern: /^rounded-(none|sm|md|lg|xl|2xl|full)$/ },
    { pattern: /^shadow-(none|sm|md|lg|xl|2xl)$/ },
    { pattern: /^hover:(bg|text|border)-/ },
    { pattern: /^focus:(bg|text|border)-/ },
    { pattern: /^active:(bg|text|border)-/ },
  ]
}
