import eslint from '@eslint/js';
import globals from 'globals';
import storybook from 'eslint-plugin-storybook';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // `eslint .` walks the filesystem and does not read .gitignore, so the
    // workshop's build output has to be named here as well as there.
    ignores: ['.svelte-kit/', 'build/', 'coverage/', 'node_modules/', 'site/', 'storybook-static/']
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...svelte.configs.recommended,
  // Reaches `.storybook/main.ts` and nothing else here: the plugin's globs carry
  // no `.svelte`, so the stories get their safety from svelte-check and
  // typescript-eslint instead. Its react-hooks and import-x entries are all
  // severity 0, which ESLint never resolves, so neither plugin is needed.
  ...storybook.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true }
    }
  },
  {
    // `.svelte.ts` is a rune module rather than a component, and
    // eslint-plugin-svelte hands both to svelte-eslint-parser. That parser only
    // reads TypeScript when it is given one, so the glob has to name the rune
    // modules as well as the components or `src/lib/app/store.svelte.ts` fails
    // to parse at its first `import type`.
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
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
