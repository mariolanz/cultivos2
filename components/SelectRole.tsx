
import React, { useEffect } from 'react';
import { useAuth } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import { UserRole, User } from '../types';

const SelectRole: React.FC = () => {
    const { loggedInUser, currentUser, activeRole, setActiveRole } = useAuth();
    const navigate = useNavigate();
    const user = currentUser as User | null;

    useEffect(() => {
        // If no user is logged in at all, go to login
        if (!loggedInUser) {
            navigate('/login');
            return;
        }

        // If user data is loaded...
        if (user) {
            // If user has only one role, set it automatically and redirect.
            if (user.roles.length === 1) {
                if (!activeRole) {
                    setActiveRole(user.roles[0]);
                }
                navigate('/');
                return;
            }
            
            // If a role is already active, they shouldn't be here. Redirect.
            if (activeRole) {
                navigate('/');
                return;
            }
        }
        
    }, [user, activeRole, setActiveRole, navigate, loggedInUser]);

    if (!user || activeRole || user.roles.length <= 1) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p>Cargando...</p>
            </div>
        );
    }

    const handleRoleSelection = (role: UserRole) => {
        setActiveRole(role);
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Bienvenido, {user.username}</h1>
                <p className="text-text-secondary mb-8">Tienes múltiples roles. ¿Cómo quieres trabajar hoy?</p>
                <div className="space-y-4">
                    {user.roles.map((role) => (
                        <button
                            key={role}
                            onClick={() => handleRoleSelection(role)}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors text-lg"
                        >
                            Entrar como {role}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SelectRole;
