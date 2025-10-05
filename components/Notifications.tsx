
import React, { useState, useMemo } from 'react';
import { useNotifications, useAnnouncements, useAuth, useLocations } from '../context/AppProvider';
import Card from './ui/Card';
import { UserRole, Notification, Announcement } from '../types';

type FeedItem = {
    id: string;
    type: 'notification' | 'announcement';
    data: Notification | Announcement;
    createdAt: string;
    isRead: boolean;
};

const AdminAnnouncements: React.FC = () => {
    const { addAnnouncement } = useAnnouncements();
    const { locations } = useLocations();
    const [message, setMessage] = useState('');
    const [targetLocation, setTargetLocation] = useState('global');

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    const handleSend = () => {
        if (message.trim()) {
            addAnnouncement(message, targetLocation === 'global' ? undefined : targetLocation);
            setMessage('');
            setTargetLocation('global');
            alert('Anuncio enviado.');
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Enviar Anuncio</h2>
            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full p-2 bg-gray-50 border border-border-color rounded-md"
                placeholder="Escribe tu anuncio aquí. Aparecerá en una ventana emergente para los usuarios seleccionados."
            />
            <div className="mt-4">
                <label htmlFor="location-select" className="block text-sm font-medium text-text-secondary">Enviar a Ubicación</label>
                <select id="location-select" value={targetLocation} onChange={e => setTargetLocation(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md">
                    <option value="global">Global (Todos los usuarios)</option>
                    {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            </div>
            <button onClick={handleSend} className="mt-4 w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                Enviar Anuncio
            </button>
        </Card>
    );
};

const Notifications: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
    const { announcements, markAnnouncementAsRead, markAllAsRead: markAllAnnouncementsAsRead, unreadCount: unreadAnnouncementsCount } = useAnnouncements();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

    const combinedFeed = useMemo(() => {
        const notifItems: FeedItem[] = notifications.map(n => ({ id: n.id, type: 'notification', data: n, createdAt: n.createdAt, isRead: n.read }));
        const annItems: FeedItem[] = announcements.map(a => ({ id: a.id, type: 'announcement', data: a, createdAt: a.createdAt, isRead: a.read }));
        
        return [...notifItems, ...annItems]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [notifications, announcements]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Centro de Notificaciones</h1>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead} 
                            className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md text-sm transition-colors"
                        >
                            Marcar Notificaciones como leídas
                        </button>
                    )}
                    {isAdmin && unreadAnnouncementsCount > 0 && (
                         <button 
                            onClick={markAllAnnouncementsAsRead} 
                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-sm transition-colors"
                        >
                            Marcar Anuncios como leídos
                        </button>
                    )}
                </div>
            </div>

            {isAdmin && <AdminAnnouncements />}

            <Card>
                <div className="space-y-2 max-h-[80vh] overflow-y-auto">
                    {combinedFeed.length > 0 ? (
                        combinedFeed.map(item => {
                            const handleClick = () => {
                                if (item.type === 'notification') {
                                    markAsRead(item.id);
                                } else {
                                    markAnnouncementAsRead(item.id);
                                }
                            };

                            const isWarning = item.type === 'notification' && (item.data as Notification).type === 'warning';
                            
                            return (
                                <div 
                                    key={`${item.type}-${item.id}`}
                                    onClick={handleClick} 
                                    className={`p-4 rounded-lg cursor-pointer transition-colors border-l-4 ${
                                        item.type === 'announcement' ? 'border-blue-500' : (isWarning ? 'border-yellow-500' : 'border-primary')
                                    } ${!item.isRead ? 'bg-gray-50' : 'bg-white opacity-80'}`}
                                >
                                    {item.type === 'notification' ? (
                                         <p className={`font-semibold ${isWarning ? 'text-yellow-600' : 'text-primary'}`}>{isWarning ? 'Alerta' : 'Información'}</p>
                                    ) : (
                                         <p className="font-semibold text-blue-500">Anuncio</p>
                                    )}
                                    <p className="text-text-secondary my-1">{item.data.message}</p>
                                    <p className="text-xs text-muted mt-1">{new Date(item.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-muted py-8">No tienes notificaciones o anuncios.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Notifications;
