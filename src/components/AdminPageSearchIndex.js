import appSource from '../App.jsx?raw';

const pageSources = import.meta.glob('../pages/**/*.jsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const importMap = new Map();

for (const match of appSource.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+['"]\.\/pages\/([^'"]+)['"]/g)) {
  const [, component, filePath] = match;
  const normalizedPath = filePath.endsWith('.jsx') ? filePath : `${filePath}.jsx`;
  importMap.set(component, `../pages/${normalizedPath}`);
}

const humanize = component =>
  component
    .replace(/^Admin/, '')
    .replace(/Page$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

const routeItems = [];

for (const match of appSource.matchAll(/<Route\b[\s\S]*?\/>/g)) {
  const routeTag = match[0];
  const pathMatch = routeTag.match(/path="([^"]+)"/);
  const componentMatch = routeTag.match(/<ProtectedPage><([A-Za-z0-9_]+)/);

  if (!pathMatch || !componentMatch) continue;

  const path = pathMatch[1];
  const component = componentMatch[1];
  const sourceKey = importMap.get(component);
  const source = sourceKey ? pageSources[sourceKey] : '';

  if (!source) continue;

  routeItems.push({
    path,
    label: humanize(component),
    section: 'Admin Page',
    searchText: source.toLowerCase(),
  });
}

export const adminPageSearchItems = Array.from(
  new Map(routeItems.map(item => [item.path, item])).values()
);
