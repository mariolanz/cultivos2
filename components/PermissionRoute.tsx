import React from 'react';
import { useAuth } from '../context/AppProvider';
import { UserRole, AppPermission, User } from '../types';
import PermissionDenied from './PermissionDenied';

interface PermissionRouteProps {
  children: React.ReactElement;
  permission: AppPermission;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, permission }) => {
  const { currentUser } = useAuth();
  const user = currentUser as User | null;

  const hasPermission = () => {
    if (!user) return false;
    // Admins have access to everything, regardless of their permission flags
    if (user.roles.includes(UserRole.ADMIN)) {
      return true;
    }
    return user.permissions[permission] || false;
  };

  if (!hasPermission()) {
    return <PermissionDenied />;
  }

  return children;
};

export default PermissionRoute;
