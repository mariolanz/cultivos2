import React, { useState } from 'react';
import { useAuth } from '../context/AppProvider';
import { Task } from '../types';
import Card from './ui/Card';
import { useDailyTasks } from '../hooks/useDailyTasks';

const DayTasksModal: React.FC<{
    date: Date;
    tasks: Task[];
    completedTaskIds: Set<string>;
    onClose: () => void;
    onComplete: (task: Task) => void;
}> = ({ date, tasks, completedTaskIds, onClose, onComplete }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl" aria-label="Cerrar">&times;</button>
                <h3 className="text-lg font-bold mb-4">Tareas para {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {tasks.length > 0 ? tasks.map(task => {
                        const isCompleted = completedTaskIds.has(task.id);
                        return (
                             <div key={task.id} className={`p-3 rounded ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <p className={`font-semibold ${isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{task.title}</p>
                                {task.description && <p className={`text-xs mt-1 ${isCompleted ? 'text-gray-400' : 'text-text-secondary'}`}>{task.description}</p>}
                                {isToday && !isCompleted && (
                                    <button onClick={() => onComplete(task)} className="mt-2 w-full text-center text-xs py-1 px-2 rounded bg-primary/80 hover:bg-primary text-white font-bold transition-colors">
                                        Completar Tarea
                                    </button>
                                )}
                                {isCompleted && <p className="mt-2 text-center text-xs text-green-600 font-bold">Completada</p>}
                            </div>
                        )
                    }) : <p className="text-muted text-center py-4">No hay tareas programadas para este día.</p>}
                </div>
            </Card>
        </div>
    );
};

interface WeeklyTaskCalendarProps {
    onCompleteTask: (task: Task) => void;
    weeklyCompletedTasks: Map<string, Set<string>>;
}


const WeeklyTaskCalendar: React.FC<WeeklyTaskCalendarProps> = ({ onCompleteTask, weeklyCompletedTasks }) => {
    const { dailyTasks } = useDailyTasks(new Date()); 
    const [dayModal, setDayModal] = useState<{ date: Date, tasks: Task[] } | null>(null);

    const today = new Date();
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i); // Start week on Sunday
        return date;
    });

    return (
        <>
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {weekDays.map(date => {
                        const { dailyTasks: dailyTasksForDay } = useDailyTasks(date);
                        const isToday = date.toDateString() === today.toDateString();
                        const completedIdsForDay = weeklyCompletedTasks.get(date.toISOString().split('T')[0]) || new Set<string>();
                        
                        return (
                            <div 
                                key={date.toISOString()} 
                                className={`p-3 rounded-lg border ${isToday ? 'border-primary' : 'border-border-color'} bg-surface cursor-pointer hover:bg-gray-50`}
                                onClick={() => setDayModal({ date, tasks: dailyTasksForDay })}
                            >
                                <p className={`font-bold text-center ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                                    {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                                </p>
                                <p className="text-sm text-center text-text-secondary mb-2">{date.getDate()}</p>
                                <div className="space-y-1">
                                    {dailyTasksForDay.map(task => {
                                        const isCompleted = completedIdsForDay.has(task.id);
                                        return (
                                        <div 
                                            key={task.id}
                                            className={`w-full text-left text-xs p-1 rounded ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-text-primary'}`}
                                        >
                                            {isCompleted && '✓ '}{task.title}
                                        </div>
                                    )})}
                                    {dailyTasksForDay.length === 0 && <p className="text-xs text-center text-muted">Sin tareas</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {dayModal && (
                <DayTasksModal
                    date={dayModal.date}
                    tasks={dayModal.tasks}
                    completedTaskIds={weeklyCompletedTasks.get(dayModal.date.toISOString().split('T')[0]) || new Set()}
                    onClose={() => setDayModal(null)}
                    onComplete={(task) => {
                        onCompleteTask(task);
                        setDayModal(null);
                    }}
                />
            )}
        </>
    );
};

export default WeeklyTaskCalendar;