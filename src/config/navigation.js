import {
  AlertCircle,
  Award,
  BarChart2,
  Calendar,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    pageTitle: 'Dashboard',
    route: '/',
    icon: LayoutDashboard,
    exact: true,
    aliases: [],
    sidebarSection: 'core',
    mobileBottom: true,
    mobileOrder: 1,
    commandPalette: true,
  },
  {
    id: 'missions',
    label: 'Missions',
    pageTitle: 'Missions',
    route: '/missions',
    icon: Calendar,
    aliases: ['/mission'],
    sidebarSection: 'core',
    mobileBottom: true,
    mobileOrder: 2,
    commandPalette: true,
  },
  {
    id: 'workspace',
    label: 'Workspace',
    pageTitle: 'Workspace',
    route: '/workspace',
    icon: FolderKanban,
    aliases: ['/projects', '/notes', '/blockers', '/proof'],
    sidebarSection: 'core',
    mobileBottom: true,
    mobileOrder: 3,
    commandPalette: true,
    description: 'Projects, notes, problems, and proof',
  },
  {
    id: 'progress',
    label: 'Progress',
    pageTitle: 'Progress',
    route: '/progress',
    icon: BarChart2,
    aliases: ['/checkpoints'],
    sidebarSection: 'core',
    mobileBottom: true,
    mobileOrder: 4,
    commandPalette: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    pageTitle: 'Settings',
    route: '/settings',
    icon: Settings,
    aliases: [],
    sidebarSection: 'utility',
    mobileBottom: true,
    mobileOrder: 5,
    commandPalette: true,
    description: 'Configure setup and backups',
  },
  {
    id: 'projects',
    label: 'Projects',
    pageTitle: 'Workspace: Projects',
    route: '/workspace/projects',
    icon: FolderKanban,
    aliases: ['/projects'],
    workspace: true,
    commandPalette: true,
    description: 'Track builds and milestones',
  },
  {
    id: 'notes',
    label: 'Notes',
    pageTitle: 'Workspace: Notes',
    route: '/workspace/notes',
    icon: FileText,
    aliases: ['/notes'],
    workspace: true,
    commandPalette: true,
    description: 'Review learning notes',
  },
  {
    id: 'problems',
    label: 'Problems',
    pageTitle: 'Workspace: Problems',
    route: '/workspace/problems',
    icon: AlertCircle,
    aliases: ['/blockers'],
    workspace: true,
    commandPalette: true,
    description: 'Review open and solved problems',
  },
  {
    id: 'proof',
    label: 'Proof',
    pageTitle: 'Workspace: Proof',
    route: '/workspace/proof',
    icon: Award,
    aliases: ['/proof'],
    workspace: true,
    commandPalette: true,
    description: 'Manage proof of work',
  },
  {
    id: 'import',
    label: 'Import Roadmap',
    pageTitle: 'Import Roadmap',
    route: '/import',
    aliases: [],
  },
];

export const coreSidebarItems = navigationItems.filter((item) => item.sidebarSection === 'core');
export const temporarySidebarItems = navigationItems.filter((item) => item.sidebarSection === 'temporary');
export const utilitySidebarItems = navigationItems.filter((item) => item.sidebarSection === 'utility');
export const mobileBottomNavigationItems = navigationItems
  .filter((item) => item.mobileBottom)
  .sort((a, b) => a.mobileOrder - b.mobileOrder);
export const workspaceNavigationItems = navigationItems.filter((item) => item.workspace);
export const commandPaletteNavigationItems = navigationItems.filter((item) => item.commandPalette);

function routeMatches(pathname, route, exact = false) {
  if (route === '/') return pathname === '/';
  if (exact) return pathname === route;
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isNavigationItemActive(item, pathname) {
  if (routeMatches(pathname, item.route, item.exact)) return true;
  return (item.aliases || []).some((alias) => routeMatches(pathname, alias));
}

export function getNavigationItemForPath(pathname) {
  const workspaceItem = workspaceNavigationItems.find((item) =>
    isNavigationItemActive(item, pathname)
  );
  if (workspaceItem) return workspaceItem;

  const exactRouteItem = navigationItems.find((item) =>
    routeMatches(pathname, item.route, item.exact)
  );
  if (exactRouteItem) return exactRouteItem;

  return navigationItems.find((item) =>
    (item.aliases || []).some((alias) => routeMatches(pathname, alias))
  );
}
