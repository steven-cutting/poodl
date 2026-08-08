import eslint from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.svelte-kit/', 'build/', 'coverage/', 'node_modules/']
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
        projectService: true
      }
    }
  },
  {
    rules: {
      // Poodl's vocabulary is five lowercase letters of the English alphabet,
      // an obligation `docs/specs/words.allium` states and `tests/words.test.ts`
      // checks. Code-point iteration is therefore exactly right, and the
      // grapheme-cluster hazard this rule guards against cannot arise.
      '@typescript-eslint/no-misused-spread': [
        'error',
        { allow: [{ from: 'lib', name: 'string' }] }
      ],
      // Attempt numbers and letter positions are interpolated into accessible
      // names. A number has one unambiguous string form, so requiring an
      // explicit String() around each would add noise and no safety.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }]
    }
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.js', '*.config.ts']
  }
);
