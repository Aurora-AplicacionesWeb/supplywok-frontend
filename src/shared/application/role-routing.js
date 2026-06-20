export const normalizeRole = (role) => role?.toString().trim().toLowerCase() ?? null;


const ROLE_SECTION_PATHS = {
  restaurant: {
    dashboard: '/operations/dashboard',
    kitchen: '/operations/kitchen',
    tables: '/operations/tables',
    alerts: '/iot/alerts',
    reports: '/operations/reports',
    configuration: '/operations/configuration',
    subscription: '/operations/subscription',
    inventory: '/inventory/items',
    orders: '/purchasing/orders',
    suppliers: '/purchasing/suppliers'
  },
  supplier: {
    dashboard: '/supplier/dashboard',
    orders: '/supplier/orders',
    clients: '/supplier/clients',
    delivery: '/supplier/delivery',
    forecast: '/supplier/forecast',
    catalog: '/supplier/catalog',
    alerts: '/supplier/alerts',
    configuration: '/supplier/configuration',
    subscription: '/supplier/subscription'
  }
};

export const getHomeByRole = (role) => {
  const normalizedRole = normalizeRole(role) ?? 'restaurant';
  return ROLE_SECTION_PATHS[normalizedRole]?.dashboard ?? '/operations/dashboard';
};

export const getScopedPathByRole = (role, section) => {
  const normalizedRole = normalizeRole(role) ?? 'restaurant';
  return ROLE_SECTION_PATHS[normalizedRole]?.[section] ?? getHomeByRole(normalizedRole);
};

export const getRoleFromPath = (path) => {
  if (path.startsWith('/supplier')) return 'supplier';
  if (
    path.startsWith('/operations')
    || path.startsWith('/inventory')
    || path.startsWith('/purchasing')
    || path.startsWith('/iot')
    || path.startsWith('/restaurant')
  ) return 'restaurant';
  return null;
};
