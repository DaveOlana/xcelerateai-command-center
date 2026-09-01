import {
  AlertCircle,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Shield,
  Target,
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
    sidebarPrimary: true,
    mobileBottom: true,
    mobileOrder: 1,
    commandPalette: true,
    tourTarget: 'sidebar-dashboard',
  },
  {
    id: 'missions',
    label: 'Missions',
    pageTitle: 'Missions',
    route: '/missions',
    icon: Calendar,
    aliases: ['/mission'],
    sidebarPrimary: true,
    mobileBottom: true,
    mobileOrder: 3,
    commandPalette: true,
    tourTarget: 'sidebar-missions',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    pageTitle: 'Workspace',
    route: '/workspace',
    icon: FolderKanban,
    aliases: ['/projects', '/notes', '/blockers', '/proof'],
    sidebarPrimary: true,
    moreMenu: true,
    moreMenuOrder: 1,
    commandPalette: true,
    tourTarget: 'sidebar-projects',
    description: 'Projects, notes, problems, and proof',
  },
  {
    id: 'progress',
    label: 'Progress',
    pageTitle: 'Progress',
    route: '/progress',
    icon: BarChart2,
    aliases: ['/checkpoints'],
    sidebarPrimary: true,
    mobileBottom: true,
    mobileOrder: 4,
    commandPalette: true,
    tourTarget: 'sidebar-progress',
  },
  {
    id: 'settings',
    label: 'Settings',
    pageTitle: 'Settings',
    route: '/settings',
    icon: Settings,
    aliases: [],
    sidebarPrimary: true,
    moreMenu: true,
    moreMenuOrder: 6,
    commandPalette: true,
    tourTarget: 'sidebar-settings',
    description: 'Configure setup and backups',
  },
  {
    id: 'today',
    label: 'Today',
    pageTitle: "Today's Focus",
    route: '/today',
    icon: Target,
    aliases: [],
    sidebarTransition: true,
    mobileBottom: true,
    mobileOrder: 2,
    commandPalette: true,
    tourTarget: 'sidebar-today',
  },
  {
    id: 'projects',
    label: 'Projects',
    pageTitle: 'Workspace · Projects',
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
    pageTitle: 'Workspace · Notes',
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
    pageTitle: 'Workspace · Problems',
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
    pageTitle: 'Workspace · Proof',
    route: '/workspace/proof',
    icon: Award,
    aliases: ['/proof'],
    workspace: true,
    commandPalette: true,
    description: 'Manage proof of work',
  },
  {
    id: 'resources',
    label: 'Resource Library',
    pageTitle: 'Resource Library',
    route: '/resources',
    icon: BookOpen,
    aliases: [],
    moreMenu: true,
    moreMenuOrder: 2,
    commandPalette: true,
    description: 'Search all learning resources',
  },
  {
    id: 'checkpoints',
    label: 'Checkpoints',
    pageTitle: 'Checkpoints',
    route: '/checkpoints',
    icon: CheckSquare,
    aliases: [],
    moreMenu: true,
    moreMenuOrder: 4,
    commandPalette: true,
    description: 'Review skill confidence',
  },
  {
    id: 'side-quests',
    label: 'Side Quests',
    pageTitle: 'Side Quests',
    route: '/side-quests',
    icon: Shield,
    aliases: [],
    sidebarTransition: true,
    moreMenu: true,
    moreMenuOrder: 5,
    commandPalette: true,
    description: 'Review optional learning paths',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    pageTitle: 'Timeline',
    route: '/timeline',
    icon: Clock,
    aliases: [],
    moreMenu: true,
    moreMenuOrder: 3,
    description: 'View the curriculum path',
  },
  {
    id: 'import',
    label: 'Import Roadmap',
    pageTitle: 'Import Roadmap',
    route: '/import',
    aliases: [],
  },
  {
    id: 'more',
    label: 'More',
    pageTitle: 'More',
    route: '/more',
    icon: MoreHorizontal,
    aliases: ['/workspace', '/resources', '/timeline', '/side-quests', '/settings'],
    mobileBottom: true,
    mobileOrder: 5,
  },
];

export const primaryNavigationItems = navigationItems.filter((item) => item.sidebarPrimary);
export const transitionNavigationItems = navigationItems.filter((item) => item.sidebarTransition);
export const mobileBottomNavigationItems = navigationItems
  .filter((item) => item.mobileBottom)
  .sort((a, b) => a.mobileOrder - b.mobileOrder);
export const moreMenuItems = navigationItems
  .filter((item) => item.moreMenu)
  .sort((a, b) => a.moreMenuOrder - b.moreMenuOrder);
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
