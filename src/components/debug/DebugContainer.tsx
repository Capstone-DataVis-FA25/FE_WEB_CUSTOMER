import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteByPath, getRoutesByRole, UserRole as RouteUserRole } from '@/config/routes';
import { useDebug, useDebugShortcut } from '@/hooks/useDebug';
import { useAuth } from '@/features/auth/useAuth';
import { UserRole as AuthUserRole } from '@/features/auth/authType';
import { ChevronUp, ChevronDown, Bug, Route, User, List } from 'lucide-react';

interface DebugContainerProps {
  showInProduction?: boolean;
}

// Map auth roles to route roles
const mapAuthRoleToRouteRole = (authRole: AuthUserRole): RouteUserRole => {
  switch (authRole) {
    case AuthUserRole.Admin:
      return RouteUserRole.ADMIN;
    case AuthUserRole.Customer:
      return RouteUserRole.CUSTOMER;
    case AuthUserRole.Guest:
    default:
      return RouteUserRole.GUEST;
  }
};

const DebugContainer: React.FC<DebugContainerProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'routes' | 'user' | 'system'>('current');

  const location = useLocation();
  const { user, isAuthenticated, userRole: authUserRole } = useAuth();
  const { shouldShow, toggleDebug } = useDebug();

  // Thiết lập shortcut để toggle debug
  useDebugShortcut(toggleDebug);

  // Không hiển thị nếu debug bị tắt
  if (!shouldShow) {
    return null;
  }

  const currentRoute = getRouteByPath(location.pathname);
  const routeUserRole = mapAuthRoleToRouteRole(authUserRole);
  const availableRoutes = getRoutesByRole(routeUserRole);

  const getCurrentRouteInfo = () => {
    if (!currentRoute) {
      return {
        path: location.pathname,
        name: 'Unknown Route',
        component: 'N/A',
        layout: 'N/A',
        isProtected: false,
        roles: [],
        permissions: [],
      };
    }
    return currentRoute;
  };

  const routeInfo = getCurrentRouteInfo();

  const tabs = [
    { id: 'current' as const, label: 'Current', icon: Route },
    { id: 'routes' as const, label: 'Routes', icon: List },
    { id: 'user' as const, label: 'User', icon: User },
    { id: 'system' as const, label: 'System', icon: Bug },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono">
      {/* Toggle Button */}
      <div
        className={`bg-gray-900 text-white rounded-t-lg px-3 py-2 cursor-pointer flex items-center gap-2 border border-gray-700 ${
          isExpanded ? '' : 'rounded-b-lg'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={16} />
        <span className="text-xs font-medium">Debug</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="bg-gray-900 text-white border border-gray-700 border-t-0 rounded-b-lg shadow-lg max-h-96 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-xs border-r border-gray-700 last:border-r-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-3 text-xs overflow-y-auto max-h-80">
            {activeTab === 'current' && (
              <div className="space-y-2">
                <div className="text-yellow-400 font-semibold">Current Route</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-blue-400">Path:</span> {routeInfo.path}
                  </div>
                  <div>
                    <span className="text-blue-400">Name:</span> {routeInfo.name}
                  </div>
                  <div>
                    <span className="text-blue-400">Component:</span> {routeInfo.component}
                  </div>
                  <div>
                    <span className="text-blue-400">Layout:</span> {routeInfo.layout}
                  </div>
                  <div>
                    <span className="text-blue-400">Protected:</span>
                    <span className={routeInfo.isProtected ? 'text-red-400' : 'text-green-400'}>
                      {routeInfo.isProtected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {routeInfo.roles && routeInfo.roles.length > 0 && (
                    <div>
                      <span className="text-blue-400">Roles:</span> {routeInfo.roles.join(', ')}
                    </div>
                  )}
                  {routeInfo.permissions && routeInfo.permissions.length > 0 && (
                    <div>
                      <span className="text-blue-400">Permissions:</span>{' '}
                      {routeInfo.permissions.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'routes' && (
              <div className="space-y-2">
                <div className="text-yellow-400 font-semibold">
                  Available Routes ({authUserRole})
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {availableRoutes.map(route => (
                    <div
                      key={route.path}
                      className={`p-1 rounded ${
                        route.path === location.pathname ? 'bg-blue-600' : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-green-400">{route.path}</div>
                      <div className="text-gray-400 text-[10px]">
                        {route.name} | {route.layout}
                        {route.isProtected && ' | Protected'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'user' && (
              <div className="space-y-2">
                <div className="text-yellow-400 font-semibold">User Info</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-blue-400">Authenticated:</span>
                    <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                      {isAuthenticated ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Role:</span>
                    <span className="text-yellow-300">{authUserRole}</span>
                  </div>
                  {user && (
                    <>
                      <div>
                        <span className="text-blue-400">ID:</span> {user._id}
                      </div>
                      <div>
                        <span className="text-blue-400">Name:</span> {user.fullName}
                      </div>
                      <div>
                        <span className="text-blue-400">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="text-blue-400">Active:</span>
                        <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                          {user.isActive ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">Status:</span>
                        <span
                          className={user.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}
                        >
                          {user.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-2">
                <div className="text-yellow-400 font-semibold">System Info</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-blue-400">Environment:</span>
                    <span className={import.meta.env.DEV ? 'text-green-400' : 'text-orange-400'}>
                      {import.meta.env.MODE}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Base URL:</span>{' '}
                    {import.meta.env.VITE_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT}
                  </div>
                  <div>
                    <span className="text-blue-400">Dev Mode:</span>
                    <span className={import.meta.env.DEV ? 'text-green-400' : 'text-red-400'}>
                      {import.meta.env.DEV ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Prod Mode:</span>
                    <span className={import.meta.env.PROD ? 'text-green-400' : 'text-red-400'}>
                      {import.meta.env.PROD ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">User Agent:</span>
                    <div className="text-gray-300 text-[10px] break-all mt-1">
                      {navigator.userAgent}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-400">URL:</span>
                    <div className="text-gray-300 text-[10px] break-all mt-1">
                      {window.location.href}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-400">Shortcut:</span>
                    <span className="text-yellow-300">Ctrl/Cmd + Shift + D</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugContainer;
