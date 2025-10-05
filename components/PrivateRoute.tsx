
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AppProvider';
import { User } from '../types';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { loggedInUser, currentUser, activeRole } = useAuth();
  const location = useLocation();
  const user = currentUser as User | null;

  if (!loggedInUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If the user is logged in, but not fully loaded yet (e.g. currentUser is null), show a loading state or similar
  // For now, we'll let it pass, but in a real app, a loading spinner might be better.
  if (!user) {
    // This could happen briefly during a refresh.
    // Or if loggedInUser exists but user data is somehow missing.
    // Redirecting to login is a safe fallback.
     return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has multiple roles and has NOT selected one yet, redirect to role selection
  if (user.roles.length > 1 && !activeRole) {
      return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
