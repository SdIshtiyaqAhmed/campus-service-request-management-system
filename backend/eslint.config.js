const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'coverage/**'
        ]
    },

    js.configs.recommended,

    {
        files: ['**/*.js'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },

        rules: {
            'no-console': 'off',

            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],

            'no-undef': 'error',
            'eqeqeq': 'error',

            'semi': [
                'error',
                'always'
            ],

            'quotes': [
                'error',
                'single'
            ]
        }
    }
];
