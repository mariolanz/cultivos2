
// FIX: Added missing React import for JSX compatibility.
import React, { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDailyTasks } from '../../hooks/useDailyTasks';
import { useNotifications, useAuth } from '../../context/AppProvider';
import { UserRole } from '../../types';


const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHudDismissed, setIsHudDismissed] = useState(false);
  
  const { pendingTasks } = useDailyTasks(new Date());
  const { notifications } = useNotifications();
  const { currentUser, activeRole } = useAuth();
  const navigate = useNavigate();

  const urgentNotificationsCount = useMemo(() => {
      return notifications.filter(n => !n.read && (n.type === 'warning' || n.type === 'urgent')).length;
  }, [notifications]);
  
  const showHud = !isHudDismissed && (pendingTasks.length > 0 || urgentNotificationsCount > 0);

  const handleTasksClick = () => {
    setIsHudDismissed(true);

    const effectiveRole = activeRole || (currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles[0] : null);

    const hasGrowerTasks = pendingTasks.some(task => task.assigneeRoles.includes(UserRole.GROWER));

    if (effectiveRole === UserRole.MAINTENANCE) {
      navigate('/maintenance-calendar');
    } else if (hasGrowerTasks) {
      // For grower tasks like 'Aplicación Foliar', navigate directly to the log entry page.
      navigate('/log');
    } else {
      // Default fallback for other roles or non-grower tasks
      navigate('/');
    }
  };

  const handleAlertsClick = () => {
    setIsHudDismissed(true);
    navigate('/notifications');
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setIsMobileMenuOpen(true)} />
        {showHud && (
            <div className="bg-surface border-b border-border-color p-3 text-center text-sm text-text-primary flex items-center justify-center gap-x-6 gap-y-2 relative flex-wrap shadow-sm">
                <span className="font-bold uppercase text-xs text-text-secondary hidden sm:inline">Avisos del Día:</span>
                {pendingTasks.length > 0 && (
                  <button onClick={handleTasksClick} className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-md transition-colors">
                     <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>
                     <span>{pendingTasks.length} Tarea{pendingTasks.length > 1 ? 's' : ''} Pendiente{pendingTasks.length > 1 ? 's' : ''}</span>
                  </button>
                )}
                 {urgentNotificationsCount > 0 && (
                  <button onClick={handleAlertsClick} className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-md transition-colors">
                     <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>
                     <span>{urgentNotificationsCount} Alerta{urgentNotificationsCount > 1 ? 's' : ''} Urgente{urgentNotificationsCount > 1 ? 's' : ''}</span>
                  </button>
                )}
                <button onClick={() => setIsHudDismissed(true)} className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl text-text-secondary hover:text-text-primary" aria-label="Cerrar avisos">&times;</button>
            </div>
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
