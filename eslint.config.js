import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import html from 'eslint-plugin-html'
import importPlugin from 'eslint-plugin-import'

export default [
    js.configs.recommended,
    prettier,
    {
        plugins: {
            import: importPlugin,
            html,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'always',
                },
            ],
        },
    },
    {
        ignores: ['node_modules/'],
    },
]
