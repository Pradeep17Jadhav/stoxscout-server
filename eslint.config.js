import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ['**/*.{js,mjs,cjs,ts}']},
    {languageOptions: {globals: globals.browser}},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'no-console': 'warn',
            'no-unused-vars': 'error',
            'no-debugger': 'warn',
            '@typescript-eslint/no-unused-vars': 'error', // TypeScript-specific rule
            '@typescript-eslint/explicit-module-boundary-types': 'off', // Optional: Disable explicit return types for functions
            '@typescript-eslint/no-explicit-any': 'warn' // Optional: Warn when `any` is used
        }
    }
];
