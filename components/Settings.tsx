// FIX: Added missing React import for JSX compatibility.
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { useAuth, useLocations, useGenetics, useConfirmation, useInventory, useFormulas, useTasks, useAppData, useEquipment } from '../context/AppProvider';
import { UserRole, InventoryItem, User, Location, Genetics, Task, Formula, InventoryCategory, InventoryType, Equipment, APP_PERMISSIONS, AppPermission, INVENTORY_CATEGORIES } from '../types';

const UserManagement: React.FC = () => {
    const { users, deleteUser, saveUser, currentUser, createUser } = useAuth();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const initialFormState = { username: '', roles: [] as UserRole[], locationId: '', maintenanceLocationIds: [] as string[], password: '', permissions: {} as User['permissions'] };
    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        if (editingUser) {
            setForm({
                username: editingUser.username,
                roles: editingUser.roles,
                locationId: editingUser.locationId || '',
                maintenanceLocationIds: editingUser.maintenanceLocationIds || [],
                password: '',
                permissions: editingUser.permissions || {}
            });
        } else if (isCreatingUser) {
            setForm(initialFormState);
        }
    }, [editingUser, isCreatingUser]);

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    const handleDelete = (userId: string, username: string) => {
        showConfirmation(`¿Seguro que quieres eliminar al usuario "${username}"?`, () => deleteUser(userId));
    }

    const handleRoleChange = (role: UserRole) => {
        setForm(prev => {
            const newRoles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles: newRoles };
        });
    };
    
    const handleMaintenanceLocationChange = (locationId: string) => {
        setForm(prev => {
            const newLocations = prev.maintenanceLocationIds.includes(locationId)
                ? prev.maintenanceLocationIds.filter(id => id !== locationId)
                : [...prev.maintenanceLocationIds, locationId];
            return { ...prev, maintenanceLocationIds: newLocations };
        });
    }

    const handlePermissionChange = (permission: AppPermission) => {
        setForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: !prev.permissions[permission]
            }
        }));
    };

    const handleOpenCreateModal = () => {
        setIsCreatingUser(true);
        setEditingUser(null);
    };

    const handleCloseModal = () => {
        setIsCreatingUser(false);
        setEditingUser(null);
        setForm(initialFormState);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isCreatingUser) {
            if (!form.username || !form.password) {
                alert('Usuario y contraseña son obligatorios');
                return;
            }
            const newUser = await createUser({
                username: form.username,
                password: form.password,
                roles: form.roles,
                locationId: form.locationId || undefined,
                maintenanceLocationIds: form.maintenanceLocationIds.length > 0 ? form.maintenanceLocationIds : undefined,
                permissions: form.permissions,
            });
            
            if (newUser) {
                alert(`Usuario ${form.username} creado exitosamente`);
                handleCloseModal();
            } else {
                alert('Error al crear el usuario. Por favor, intente nuevamente.');
            }
        } else if (editingUser) {
            const updatedUser: User = {
                ...editingUser,
                roles: form.roles,
                locationId: form.locationId || undefined,
                maintenanceLocationIds: form.maintenanceLocationIds.length > 0 ? form.maintenanceLocationIds : undefined,
                permissions: form.permissions,
            };
            if (form.password) {
                updatedUser.password = form.password;
            }
            const success = await saveUser(updatedUser);
            
            if (success) {
                alert('Usuario actualizado exitosamente');
                handleCloseModal();
            } else {
                alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
            }
        }
    };
    
    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">Gestión de Usuarios y Permisos</h2>
                    <button onClick={handleOpenCreateModal} className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                        + Añadir Usuario
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuario</th><th scope="col" className="px-6 py-3">Roles</th>
                                <th scope="col" className="px-6 py-3">Ubicación Cultivo</th>
                                <th scope="col" className="px-6 py-3">Ubicación Mant.</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b border-border-color">
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4">{user.roles.join(', ')}</td>
                                    <td className="px-6 py-4">{locations.find(l => l.id === user.locationId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{user.maintenanceLocationIds?.join(', ') || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => setEditingUser(user)} className="text-primary hover:underline mr-4">Editar</button>
                                        <button disabled={currentUser?.id === user.id} onClick={() => handleDelete(user.id, user.username)} className="text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {(editingUser || isCreatingUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={handleCloseModal} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl" aria-label="Cerrar">&times;</button>
                        <h3 className="text-lg font-bold mb-4 text-text-primary">
                            {isCreatingUser ? 'Crear Nuevo Usuario' : `Editar Usuario: ${editingUser?.username}`}
                        </h3>
                        <form onSubmit={handleSaveUser} className="space-y-4 overflow-y-auto pr-2">
                            {isCreatingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary">Nombre de Usuario *</label>
                                    <input 
                                        type="text" 
                                        value={form.username} 
                                        onChange={e => setForm(p => ({...p, username: e.target.value}))} 
                                        className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md" 
                                        placeholder="Ej: JUAN"
                                        required 
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Roles</label>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                {Object.values(UserRole).map(role => (
                                    <label key={role} className="flex items-center">
                                        <input type="checkbox" checked={form.roles.includes(role)} onChange={() => handleRoleChange(role)} className="form-checkbox h-5 w-5 bg-gray-50 border-gray-300 text-primary focus:ring-primary rounded" />
                                        <span className="ml-2 text-text-primary">{role}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Ubicación de Cultivo/Trimeado Principal</label>
                                <select value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md">
                                    <option value="">Ninguna</option>
                                    <option value="TODAS">TODAS</option>
                                    {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary">Ubicaciones de Mantenimiento</label>
                                 <div className="mt-2 p-2 bg-gray-50 rounded-md grid grid-cols-2 gap-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={form.maintenanceLocationIds.includes('TODAS')} onChange={() => handleMaintenanceLocationChange('TODAS')} className="form-checkbox h-5 w-5 bg-gray-50 border-gray-300 text-primary focus:ring-primary rounded" />
                                        <span className="ml-2 text-text-primary">TODAS</span>
                                    </label>
                                    {parentLocations.map(loc => (
                                        <label key={loc.id} className="flex items-center">
                                            <input type="checkbox" checked={form.maintenanceLocationIds.includes(loc.id)} onChange={() => handleMaintenanceLocationChange(loc.id)} className="form-checkbox h-5 w-5 bg-gray-50 border-gray-300 text-primary focus:ring-primary rounded" />
                                            <span className="ml-2 text-text-primary">{loc.name}</span>
                                        </label>
                                    ))}
                                 </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Permisos de Módulos</label>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                    {(Object.keys(APP_PERMISSIONS) as AppPermission[]).map(permission => (
                                        <label key={permission} className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={form.permissions[permission] || false} 
                                                onChange={() => handlePermissionChange(permission)}
                                                className="form-checkbox h-4 w-4 bg-white border-gray-300 text-primary focus:ring-primary rounded" 
                                            />
                                            <span className="ml-2 text-text-primary text-sm">{APP_PERMISSIONS[permission]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">
                                    {isCreatingUser ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
                                </label>
                                <input 
                                    type="password" 
                                    value={form.password} 
                                    onChange={e => setForm(p => ({...p, password: e.target.value}))} 
                                    className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md" 
                                    placeholder={isCreatingUser ? "Contraseña del usuario" : "Dejar en blanco para no cambiar"}
                                    required={isCreatingUser}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                                    {isCreatingUser ? 'Crear Usuario' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}

const LocationManagement: React.FC = () => {
    const { locations, saveLocation, deleteLocation } = useLocations();
    const initialFormState = { id: null as string | null, name: '', parentId: '', type: 'ciclo completo' as Location['type'], lightOnTime: '06:00', lightOffTime: '23:50' };
    const [form, setForm] = useState(initialFormState);
    
    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);
    const rooms = useMemo(() => locations.filter(l => l.parentId), [locations]);

    useEffect(() => {
        if (form.parentId && !form.id) { // only for new rooms, not when editing
            if (form.type === 'FLORACION') {
                setForm(p => ({ ...p, lightOnTime: '06:00', lightOffTime: '18:00' }));
            } else { // VEGETACION or ciclo completo
                setForm(p => ({ ...p, lightOnTime: '06:00', lightOffTime: '23:50' }));
            }
        }
    }, [form.type, form.parentId, form.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        const locationData: Location = {
            id: form.id || `loc-${form.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            name: form.name,
            parentId: form.parentId || undefined,
            type: form.parentId ? form.type : undefined,
            lightOnTime: form.parentId ? form.lightOnTime : undefined,
            lightOffTime: form.parentId ? form.lightOffTime : undefined,
        };
        saveLocation(locationData);
        setForm(initialFormState);
    }
    
    const handleEdit = (location: Location) => {
        setForm({
            id: location.id,
            name: location.name,
            parentId: location.parentId || '',
            type: location.type || 'ciclo completo',
            lightOnTime: location.lightOnTime || '06:00',
            lightOffTime: location.lightOffTime || '23:50'
        });
    }

    const handleCancel = () => {
        setForm(initialFormState);
    }

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Ubicaciones y Cuartos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg self-start">
                    <h3 className="font-bold text-text-primary">{form.id ? 'Editar' : 'Añadir Nuevo'}</h3>
                    <div>
                        <label className="text-sm text-text-secondary">Nombre</label>
                        <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ej: SS o SS1" className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" required />
                    </div>
                    <div>
                        <label className="text-sm text-text-secondary">Ubicación Principal (Padre)</label>
                        <select value={form.parentId} onChange={e => setForm(p => ({...p, parentId: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md">
                            <option value="">Ninguna (Es una Ubicación Principal)</option>
                            {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                    {form.parentId && (
                        <>
                            <div>
                                 <label className="text-sm text-text-secondary">Tipo de Cuarto</label>
                                 <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value as Location['type']}))} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md">
                                    <option value="ciclo completo">Ciclo Completo</option>
                                    <option value="VEGETACION">Solo Vegetación</option>
                                    <option value="FLORACION">Solo Floración</option>
                                 </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-secondary">Hora de Encendido</label>
                                    <input type="time" value={form.lightOnTime} onChange={e => setForm(p => ({...p, lightOnTime: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" required />
                                </div>
                                 <div>
                                    <label className="text-sm text-text-secondary">Hora de Apagado</label>
                                    <input type="time" value={form.lightOffTime} onChange={e => setForm(p => ({...p, lightOffTime: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" required />
                                </div>
                            </div>
                        </>
                    )}
                     <div className="flex gap-2 pt-2">
                        <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">{form.id ? 'Guardar' : 'Crear'}</button>
                        {form.id && <button type="button" onClick={handleCancel} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md">Cancelar</button>}
                    </div>
                </form>

                <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto space-y-4">
                    {parentLocations.map(parent => (
                        <div key={parent.id} className="p-3 bg-gray-50/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-text-primary">{parent.name}</h4>
                                <div className="space-x-3">
                                    <button onClick={() => handleEdit(parent)} className="text-primary hover:underline text-xs">Editar</button>
                                    <button onClick={() => deleteLocation(parent.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                </div>
                            </div>
                            <div className="pl-4 mt-2 space-y-2 border-l-2 border-border-color">
                                {rooms.filter(r => r.parentId === parent.id).map(room => (
                                     <div key={room.id} className="flex justify-between items-center p-2 rounded bg-white">
                                         <div>
                                            <p className="text-text-primary">{room.name}</p>
                                            <p className="text-xs text-muted">{room.type} | {room.lightOnTime}-{room.lightOffTime}</p>
                                         </div>
                                         <div className="space-x-3">
                                            <button onClick={() => handleEdit(room)} className="text-primary hover:underline text-xs">Editar</button>
                                            <button onClick={() => deleteLocation(room.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

const GeneticsManagement: React.FC = () => {
    const { genetics, saveGenetic, deleteGenetic } = useGenetics();
    const { showConfirmation } = useConfirmation();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenetic, setEditingGenetic] = useState<Genetics | null>(null);
    const [form, setForm] = useState({ name: '', code: '', description: '' });

    useEffect(() => {
        if (editingGenetic) {
            setForm({
                name: editingGenetic.name,
                code: editingGenetic.code,
                description: editingGenetic.description || ''
            });
        } else {
            setForm({ name: '', code: '', description: '' });
        }
    }, [editingGenetic]);
    
    const handleOpenModal = (genetic: Genetics | null) => {
        setEditingGenetic(genetic);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGenetic(null); // Also clear the editing state
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.code) return;
        saveGenetic({
            id: editingGenetic?.id || `gen-${Date.now()}`,
            name: form.name,
            code: form.code,
            description: form.description
        });
        handleCloseModal();
    };

    const handleDelete = (id: string, name: string) => {
        showConfirmation(`¿Seguro que quieres eliminar la genética "${name}"?`, () => deleteGenetic(id));
    };
    
    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">Librería de Genéticas</h2>
                    <button onClick={() => handleOpenModal(null)} className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                        + Añadir Genética
                    </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    <ul>
                        {genetics.map(gen => (
                            <li key={gen.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                                <div className="flex-1">
                                    <p className="font-semibold text-text-primary">{gen.name} ({gen.code})</p>
                                    {gen.description && <p className="text-xs text-muted truncate">{gen.description}</p>}
                                </div>
                                <div className="space-x-3 ml-4">
                                    <button onClick={() => handleOpenModal(gen)} className="text-primary text-xs hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(gen.id, gen.name)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl" aria-label="Cerrar">&times;</button>
                        <h3 className="text-lg font-bold mb-4 text-text-primary">{editingGenetic ? 'Editar Genética' : 'Crear Genética'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="text-sm">Nombre</label><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md" required /></div>
                            <div><label className="text-sm">Código</label><input type="text" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md" required /></div>
                            <div><label className="text-sm">Observaciones</label><textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={4} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-border-color rounded-md" /></div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">{editingGenetic ? 'Guardar Cambios' : 'Crear'}</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}

const DataManagement: React.FC = () => {
    const { exportFullBackup, importFullBackup, exportNewRecords, importAndMergeRecords } = useAppData();
    const { currentUser } = useAuth();
    const { showConfirmation } = useConfirmation();
    const backupInputRef = useRef<HTMLInputElement>(null);
    const mergeInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, handler: (data: string) => void, confirmationMessage: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        showConfirmation(confirmationMessage, () => {
            const reader = new FileReader();
            reader.onload = e => {
                if (typeof e.target?.result === 'string') {
                    handler(e.target.result);
                }
            };
            reader.readAsText(file);
        });
        event.target.value = ''; // Reset file input
    };
    
    const isAdmin = (currentUser as User | null)?.roles.includes(UserRole.ADMIN);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Datos y Sincronización</h2>
            
            <input type="file" accept=".json" ref={backupInputRef} onChange={e => handleFileChange(e, importFullBackup, "Restaurar desde un respaldo reemplazará TODOS los datos actuales. Esta acción es irreversible. ¿Continuar?")} className="hidden" />
            <input type="file" accept=".json" ref={mergeInputRef} onChange={e => handleFileChange(e, importAndMergeRecords, "¿Quieres combinar los registros de este archivo con tus datos actuales?")} className="hidden" />

            {isAdmin ? (
                <>
                    <h3 className="text-lg font-bold text-text-primary">Acciones de Administrador</h3>
                    <p className="text-text-secondary mb-4 text-sm">Usa estas acciones para gestionar la base de datos maestra.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={exportFullBackup} className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md">Exportar Respaldo Completo</button>
                        <button onClick={() => backupInputRef.current?.click()} className="py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-md">Restaurar desde Respaldo</button>
                        <button onClick={() => mergeInputRef.current?.click()} className="col-span-1 sm:col-span-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md">Importar y Combinar Registros de Colaborador</button>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-bold text-text-primary">Acciones de Colaborador</h3>
                    <p className="text-text-secondary mb-4 text-sm">Al final de tu jornada, exporta tus nuevos registros y envíalos al administrador.</p>
                    <button onClick={exportNewRecords} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md">Exportar Nuevos Registros</button>
                </>
            )}
        </Card>
    );
};

const InventoryManagement: React.FC = () => {
    const { inventory, saveInventoryItem, deleteInventoryItem } = useInventory();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const initialFormState: Omit<InventoryItem, 'id' | 'purchases' | 'currentStock' | 'averageCostPerUnit'> = {
        name: '', category: 'Otro', inventoryType: 'Cultivo', unit: '', locationId: '',
    };
    const [form, setForm] = useState(initialFormState);

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    useEffect(() => {
        if (editingItem) setForm(editingItem);
        else setForm(initialFormState);
    }, [editingItem]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveInventoryItem({
            id: editingItem?.id || `inv-${Date.now()}`,
            ...form,
            purchases: editingItem?.purchases || [],
            currentStock: editingItem?.currentStock || 0,
            averageCostPerUnit: editingItem?.averageCostPerUnit || 0,
        });
        setEditingItem(null);
    };

    const handleDelete = (item: InventoryItem) => showConfirmation(`¿Eliminar "${item.name}"?`, () => deleteInventoryItem(item.id));

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Inventario</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSave} className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg self-start">
                    <h3 className="font-bold">{editingItem ? 'Editar' : 'Añadir'} Insumo</h3>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del Insumo" className="w-full p-2 border rounded" required />
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as InventoryCategory }))} className="w-full p-2 border rounded">
                        {INVENTORY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={form.inventoryType} onChange={e => setForm(p => ({ ...p, inventoryType: e.target.value as InventoryType }))} className="w-full p-2 border rounded">
                        <option value="Cultivo">Cultivo</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                    <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="Unidad (g, ml, pieza)" className="w-full p-2 border rounded" />
                    <select value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))} className="w-full p-2 border rounded" required>
                        <option value="">Ubicación...</option>
                        {parentLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="w-full py-2 bg-primary text-white rounded">{editingItem ? 'Guardar' : 'Añadir'}</button>
                        {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="w-full py-2 bg-gray-200 rounded">Cancelar</button>}
                    </div>
                </form>
                <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left"><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Ubicación</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2">{item.name}</td><td>{item.category}</td><td>{item.currentStock} {item.unit}</td><td>{locations.find(l => l.id === item.locationId)?.name}</td>
                                    <td>
                                        <button onClick={() => setEditingItem(item)} className="text-primary text-xs mr-2">Editar</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-500 text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

const EquipmentManagement: React.FC = () => {
    const { equipment, saveEquipment, deleteEquipment } = useEquipment();
    const { locations } = useLocations();
    const [editingItem, setEditingItem] = useState<Equipment | null>(null);
    const initialFormState: Omit<Equipment, 'id'> = { name: '', locationId: '', category: 'General' };
    const [form, setForm] = useState(initialFormState);
    
    useEffect(() => {
        if (editingItem) setForm(editingItem);
        else setForm(initialFormState);
    }, [editingItem]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveEquipment({ ...form, id: editingItem?.id || `eq-${Date.now()}` });
        setEditingItem(null);
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Equipos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSave} className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg self-start">
                    <h3 className="font-bold">{editingItem ? 'Editar' : 'Añadir'} Equipo</h3>
                    <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Nombre del Equipo" className="w-full p-2 border rounded" required />
                    <select value={form.locationId} onChange={e => setForm(p => ({...p, locationId: e.target.value}))} className="w-full p-2 border rounded" required>
                        <option value="">Ubicación...</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as Equipment['category']}))} className="w-full p-2 border rounded">
                        <option>HVAC</option><option>Riego</option><option>Iluminación</option><option>Sensores</option><option>General</option><option>Ventilación</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="w-full py-2 bg-primary text-white rounded">{editingItem ? 'Guardar' : 'Añadir'}</button>
                        {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="w-full py-2 bg-gray-200 rounded">Cancelar</button>}
                    </div>
                </form>
                 <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left"><th>Nombre</th><th>Categoría</th><th>Ubicación</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {equipment.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2">{item.name}</td><td>{item.category}</td><td>{locations.find(l => l.id === item.locationId)?.name}</td>
                                    <td>
                                        <button onClick={() => setEditingItem(item)} className="text-primary text-xs mr-2">Editar</button>
                                        <button onClick={() => deleteEquipment(item.id)} className="text-red-500 text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

const TaskManagement: React.FC = () => {
    const { tasks, saveTask, deleteTask } = useTasks();
    const [editingItem, setEditingItem] = useState<Task | null>(null);
    const initialFormState: Omit<Task, 'id'> = { title: '', recurrenceType: 'single', assigneeRoles: [], locationId: 'all' };
    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        if (editingItem) setForm(editingItem);
        else setForm(initialFormState);
    }, [editingItem]);
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveTask({ ...form, id: editingItem?.id || `task-${Date.now()}` });
        setEditingItem(null);
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Tareas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSave} className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg self-start">
                    <h3 className="font-bold">{editingItem ? 'Editar' : 'Añadir'} Tarea</h3>
                    <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Título de la Tarea" className="w-full p-2 border rounded" required />
                    <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Descripción" className="w-full p-2 border rounded" />
                    <select value={form.recurrenceType} onChange={e => setForm(p => ({...p, recurrenceType: e.target.value as Task['recurrenceType']}))} className="w-full p-2 border rounded">
                        <option value="daily">Diaria</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option><option value="single">Única vez</option>
                    </select>
                    {/* Simplified for brevity, add conditional day pickers as needed */}
                     <div className="flex gap-2">
                        <button type="submit" className="w-full py-2 bg-primary text-white rounded">{editingItem ? 'Guardar' : 'Añadir'}</button>
                        {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="w-full py-2 bg-gray-200 rounded">Cancelar</button>}
                    </div>
                </form>
                 <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left"><th>Título</th><th>Recurrencia</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {tasks.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2">{item.title}</td><td>{item.recurrenceType}</td>
                                    <td>
                                        <button onClick={() => setEditingItem(item)} className="text-primary text-xs mr-2">Editar</button>
                                        <button onClick={() => deleteTask(item.id)} className="text-red-500 text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

const FormulaManagement: React.FC = () => {
    const { formulas, saveFormula, deleteFormula } = useFormulas();
    const { inventory } = useInventory();
    const [editingItem, setEditingItem] = useState<Formula | null>(null);

    // FIX: Define a type for the form state to handle string inputs for number fields.
    type FormulaFormState = {
        name: string;
        targetPPM: string;
        nutrients: { inventoryItemId: string, amountPerLiter: string }[];
    };

    const initialFormState: FormulaFormState = { 
        name: '', 
        nutrients: [{ inventoryItemId: '', amountPerLiter: '' }],
        targetPPM: '',
    };
    const [form, setForm] = useState(initialFormState);

    const nutrientOptions = useMemo(() => inventory.filter(i => i.inventoryType === 'Cultivo'), [inventory]);

    useEffect(() => {
        if (editingItem) {
            setForm({
                name: editingItem.name,
                targetPPM: editingItem.targetPPM?.toString() ?? '',
                nutrients: editingItem.nutrients.map(n => ({ ...n, amountPerLiter: String(n.amountPerLiter) }))
            });
        } else {
            setForm(initialFormState);
        }
    }, [editingItem]);

    const handleNutrientChange = (index: number, field: 'inventoryItemId' | 'amountPerLiter', value: string) => {
        const newNutrients = [...form.nutrients];
        newNutrients[index] = { ...newNutrients[index], [field]: value };
        setForm(p => ({...p, nutrients: newNutrients}));
    };
    
    const addNutrient = () => setForm(p => ({...p, nutrients: [...p.nutrients, { inventoryItemId: '', amountPerLiter: '' }]}));
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveFormula({
            name: form.name,
            id: editingItem?.id || `formula-${Date.now()}`,
            targetPPM: form.targetPPM ? Number(form.targetPPM) : undefined,
            nutrients: form.nutrients
                .filter(n => n.inventoryItemId && n.amountPerLiter)
                .map(n => ({...n, amountPerLiter: Number(n.amountPerLiter)}))
        });
        setEditingItem(null);
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Gestión de Fórmulas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSave} className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg self-start">
                    <h3 className="font-bold">{editingItem ? 'Editar' : 'Añadir'} Fórmula</h3>
                    <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Nombre de la Fórmula" className="w-full p-2 border rounded" required />
                    <input type="number" value={form.targetPPM} onChange={e => setForm(p => ({...p, targetPPM: e.target.value}))} placeholder="PPM Objetivo" className="w-full p-2 border rounded" />
                    <div className="space-y-2">
                        {form.nutrients.map((n, i) => (
                            <div key={i} className="flex gap-2">
                                <select value={n.inventoryItemId} onChange={e => handleNutrientChange(i, 'inventoryItemId', e.target.value)} className="w-full p-2 border rounded">
                                    <option value="">Nutriente...</option>
                                    {nutrientOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                                <input type="number" step="0.01" value={n.amountPerLiter} onChange={e => handleNutrientChange(i, 'amountPerLiter', e.target.value)} placeholder="g/L" className="w-24 p-2 border rounded" />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addNutrient} className="text-sm py-1 px-2 bg-gray-200 rounded">+ Añadir Nutriente</button>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="w-full py-2 bg-primary text-white rounded">{editingItem ? 'Guardar' : 'Añadir'}</button>
                        {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="w-full py-2 bg-gray-200 rounded">Cancelar</button>}
                    </div>
                </form>
                 <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left"><th>Nombre</th><th>Ingredientes</th><th>PPM</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {formulas.map(item => (
                                <tr key={item.id} className="border-t">
                                    <td className="py-2">{item.name}</td><td>{item.nutrients.length}</td><td>{item.targetPPM || 'N/A'}</td>
                                    <td>
                                        <button onClick={() => setEditingItem(item)} className="text-primary text-xs mr-2">Editar</button>
                                        <button onClick={() => deleteFormula(item.id)} className="text-red-500 text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

type TabDefinition = { label: string; component: React.ReactElement };

const Settings: React.FC = () => {
    const { currentUser } = useAuth();
    const user = currentUser as User | null;

    const tabs = useMemo((): Record<string, TabDefinition> => ({
        'inventory': { label: 'Inventario', component: <InventoryManagement /> },
        'equipment': { label: 'Equipos', component: <EquipmentManagement /> },
        'tasks': { label: 'Tareas', component: <TaskManagement /> },
        'formulas': { label: 'Fórmulas', component: <FormulaManagement /> },
        'users': { label: 'Usuarios y Permisos', component: <UserManagement /> },
        'locations': { label: 'Ubicaciones', component: <LocationManagement /> },
        'genetics': { label: 'Genéticas', component: <GeneticsManagement /> },
        'data': { label: 'Gestión de Datos', component: <DataManagement /> },
    }), []);

    const [activeTab, setActiveTab] = useState('inventory');

    if (!user || !user.roles.includes(UserRole.ADMIN)) {
         return <DataManagement />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Gestión y Ajustes</h1>

            <div className="border-b border-border-color">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {Object.keys(tabs).map(key => {
                        const tab = tabs[key];
                        if (!tab) return null;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`${ activeTab === key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div>
                {tabs[activeTab as keyof typeof tabs]?.component}
            </div>
        </div>
    );
};

export default Settings;
