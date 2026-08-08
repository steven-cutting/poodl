// Poodl is served as static files, so every route is rendered at build time.
// There is no server to render on demand and nothing to defer.
export const prerender = true;
export const ssr = true;
export const trailingSlash = 'always';
