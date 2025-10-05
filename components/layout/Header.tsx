


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth, useCrops, useConfirmation, useNotifications, useAnnouncements, useLocations } from '../../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import { Notification, Announcement, UserRole } from '../../types';

type FeedItem = {
    id: string;
    type: 'notification' | 'announcement';
    data: Notification | Announcement;
    createdAt: string;
};

const NotificationCenter: React.FC = () => {
    const { notifications, unreadCount: unreadNotifications, markAsRead } = useNotifications();
    const { announcements, unreadCount: unreadAnnouncements, markAnnouncementAsRead } = useAnnouncements();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = unreadNotifications + unreadAnnouncements;

    const combinedFeed = useMemo(() => {
        const notifItems: FeedItem[] = notifications.map(n => ({ id: n.id, type: 'notification', data: n, createdAt: n.createdAt }));
        const annItems: FeedItem[] = announcements.map(a => ({ id: a.id, type: 'announcement', data: a, createdAt: a.createdAt }));
        
        return [...notifItems, ...annItems]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    }, [notifications, announcements]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleItemClick = (item: FeedItem) => {
        if (item.type === 'notification') {
            markAsRead(item.id);
        } else {
            markAnnouncementAsRead(item.id);
        }
    };

    const handleViewAllClick = () => {
        setIsOpen(false);
        navigate('/notifications');
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 text-text-secondary rounded-full hover:bg-gray-100 hover:text-text-primary focus:outline-none" aria-label="Abrir notificaciones">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-surface"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border-color rounded-lg shadow-xl z-50">
                    <div className="p-3 font-bold text-text-primary border-b border-border-color">Notificaciones</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {combinedFeed.length > 0 ? combinedFeed.map(item => (
                            <li key={`${item.type}-${item.id}`} onClick={() => handleItemClick(item)} className={`border-b border-border-color last:border-b-0 hover:bg-gray-100 cursor-pointer ${!item.data.read ? 'bg-primary/10' : ''}`}>
                                <div className="p-3 text-sm text-text-secondary">
                                    {item.type === 'notification' ? (
                                        <>
                                            <p className={`font-semibold ${(item.data as Notification).type === 'warning' ? 'text-yellow-600' : 'text-primary'}`}>{(item.data as Notification).type === 'warning' ? 'Alerta' : 'Información'}</p>
                                            <p>{item.data.message}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-blue-500">Anuncio</p>
                                            <p>{item.data.message}</p>
                                        </>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                                </div>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-gray-400">No hay notificaciones.</li>
                        )}
                    </ul>
                    <div className="p-2 border-t border-border-color">
                        <button onClick={handleViewAllClick} className="w-full text-center text-sm font-semibold text-primary hover:text-primary-dark">
                            Ver Todas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
  onMenuButtonClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { loggedInUser, currentUser, users, logout, simulateUser, simulatedUserId } = useAuth();
  const { activeCrop } = useCrops();
  const { locations } = useLocations();
  const { showConfirmation } = useConfirmation();
  const navigate = useNavigate();
  const isAdmin = loggedInUser?.roles.includes(UserRole.ADMIN);


  const handleLogout = () => {
      showConfirmation("¿Estás seguro de que quieres cerrar sesión?", () => {
          logout();
          navigate('/login');
      });
  };

  const cropName = useMemo(() => {
    if (!activeCrop) return 'Panel';
    const location = locations.find(l => l.id === activeCrop.locationId);
    return location ? `Cultivo: ${location.name}` : 'Panel';
  }, [activeCrop, locations]);

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-surface border-b border-border-color flex-shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuButtonClick}
          className="p-2 mr-2 text-text-secondary rounded-md hover:text-text-primary hover:bg-gray-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold truncate">
          {cropName}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationCenter />
        <span className="hidden sm:inline text-text-secondary text-right truncate">Bienvenido, {loggedInUser?.username}</span>
        {isAdmin && (
            <div className="relative">
                <select
                    value={simulatedUserId || ''}
                    onChange={(e) => simulateUser(e.target.value || null)}
                    className="pl-3 pr-8 py-2 text-sm bg-gray-100 border border-border-color rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Simular usuario"
                >
                    <option value="">Dejar de Simular</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        )}
        {simulatedUserId && loggedInUser?.id !== simulatedUserId && (
            <span className="hidden sm:inline text-yellow-800 text-xs font-bold ring-1 ring-yellow-500/50 bg-yellow-400/20 px-2 py-1 rounded-full">
                Viendo como {currentUser?.username}
            </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-red-500"
          aria-label="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export default Header;