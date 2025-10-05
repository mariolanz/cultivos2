

import { useMemo } from 'react';
import { useTasks, useAuth, useMaintenanceLogs } from '../context/AppProvider';
import { Task, UserRole } from '../types';

export const useDailyTasks = (date: Date) => {
    const { tasks } = useTasks();
    const { currentUser } = useAuth();
    const { maintenanceLogs } = useMaintenanceLogs();

    const dailyTasks = useMemo<Task[]>(() => {
        if (!currentUser) return [];
        const dateStr = date.toISOString().split('T')[0];
        
        return tasks.filter(task => {
            // Role check
            const roleMatch = task.assigneeRoles.some(role => currentUser.roles.includes(role));
            if (!roleMatch) return false;

            // Location check
            let locationMatch = false;
            if (currentUser.roles.includes(UserRole.MAINTENANCE)) {
                 locationMatch = task.locationId === 'all' 
                    || (currentUser.maintenanceLocationIds && currentUser.maintenanceLocationIds.includes('TODAS'))
                    || (currentUser.maintenanceLocationIds && task.locationId !== 'all' && currentUser.maintenanceLocationIds.includes(task.locationId));
            } else { // Grower, Trimmer, Admin (who can have any role active)
                locationMatch = task.locationId === 'all' 
                    || currentUser.locationId === 'TODAS' 
                    || (currentUser.locationId && task.locationId === currentUser.locationId);
            }
            if (!locationMatch) return false;

            // Date check
            const month = date.getMonth(); // 0-11
            switch (task.recurrenceType) {
                case 'daily': return true;
                case 'weekly': return task.dayOfWeek === date.getDay();
                case 'monthly': return task.dayOfMonth === date.getDate();
                case 'bimonthly': return task.dayOfMonth === date.getDate() && month % 2 === 0;
                case 'quarterly': return task.dayOfMonth === date.getDate() && month % 3 === 0;
                case 'semiannually': return task.dayOfMonth === date.getDate() && month % 6 === 0;
                case 'single':
                    if (!task.date) return false;
                    const taskDate = new Date(task.date);
                    const taskDateStr = `${taskDate.getUTCFullYear()}-${(taskDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${taskDate.getUTCDate().toString().padStart(2, '0')}`;
                    return dateStr === taskDateStr;
                default: return false;
            }
        });
    }, [tasks, date, currentUser]);

    const completedTaskIds = useMemo(() => {
        const dateStr = date.toISOString().split('T')[0];
        const completedLogsForDay = maintenanceLogs.filter(log => log.completedAt.startsWith(dateStr));
        return new Set(completedLogsForDay.map(log => log.taskId));
    }, [maintenanceLogs, date]);
    
    const pendingTasks = useMemo(() => {
        return dailyTasks.filter(task => !completedTaskIds.has(task.id));
    }, [dailyTasks, completedTaskIds]);

    return { dailyTasks, completedTaskIds, pendingTasks };
};