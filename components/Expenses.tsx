import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { useExpenses, useAuth, useLocations, useConfirmation } from '../context/AppProvider';
import { UserRole, Expense, User } from '../types';

const Expenses: React.FC = () => {
    const { expenses, saveExpense, deleteExpense } = useExpenses();
    const { currentUser } = useAuth();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();

    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        category: 'Servicios',
        amount: '',
        description: '',
        locationId: currentUser?.locationId || ''
    };
    
    const [form, setForm] = useState(initialFormState);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.date || !form.category || !form.amount || !form.description || !form.locationId) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const newExpense: Expense = {
            id: editingExpense?.id || `exp-${Date.now()}`,
            date: new Date(form.date).toISOString(),
            category: form.category,
            amount: parseFloat(form.amount),
            description: form.description,
            locationId: form.locationId
        };
        
        saveExpense(newExpense);
        setEditingExpense(null);
        setForm(initialFormState);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setForm({
            ...expense,
            date: new Date(expense.date).toISOString().split('T')[0],
            amount: expense.amount.toString(),
        });
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
        setForm(initialFormState);
    };

    const handleDelete = (expenseId: string, description: string) => {
        showConfirmation(`¿Estás seguro de que quieres eliminar el gasto "${description}"?`, () => {
            deleteExpense(expenseId);
        });
    };

    const user = currentUser as User | null;

    const visibleExpenses = useMemo(() => {
        if (user && user.roles.includes(UserRole.ADMIN)) {
            return expenses;
        }
        return expenses.filter(e => e.locationId === user?.locationId);
    }, [expenses, user]);
    
    const parentLocations = locations.filter(l => !l.parentId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <h2 className="text-xl font-semibold text-primary mb-4">
                        {editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="date" className="block text-sm text-text-secondary">Fecha</label>
                            <input type="date" id="date" name="date" value={form.date} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="category" className="block text-sm text-text-secondary">Categoría</label>
                            <select id="category" name="category" value={form.category} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required>
                                <option>Servicios</option>
                                <option>Renta</option>
                                <option>Suministros</option>
                                <option>Nómina</option>
                                <option>Mantenimiento</option>
                                <option>Otro</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm text-text-secondary">Monto ($)</label>
                            <input type="number" step="0.01" id="amount" name="amount" value={form.amount} onChange={handleInputChange} placeholder="0.00" className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm text-text-secondary">Descripción</label>
                            <textarea id="description" name="description" value={form.description} onChange={handleInputChange} rows={3} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                        </div>
                        {user && user.roles.includes(UserRole.ADMIN) && (
                            <div>
                                <label htmlFor="locationId" className="block text-sm text-text-secondary">Ubicación</label>
                                <select id="locationId" name="locationId" value={form.locationId} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required>
                                     <option value="">Seleccionar ubicación...</option>
                                     {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                             {editingExpense && <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md">Cancelar</button>}
                            <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                                {editingExpense ? 'Guardar Cambios' : 'Añadir Gasto'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-xl font-semibold text-primary mb-4">Historial de Gastos</h2>
                    <div className="overflow-x-auto max-h-[70vh]">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs text-text-secondary uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Fecha</th>
                                    <th scope="col" className="px-6 py-3">Descripción</th>
                                    <th scope="col" className="px-6 py-3">Monto</th>
                                    {user && user.roles.includes(UserRole.ADMIN) && <th scope="col" className="px-6 py-3">Ubicación</th>}
                                    <th scope="col" className="px-6 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                    <tr key={exp.id} className="bg-white border-b border-border-color hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(exp.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-text-primary">{exp.description} <span className="block text-xs text-muted">{exp.category}</span></td>
                                        <td className="px-6 py-4">${exp.amount.toFixed(2)}</td>
                                        {user && user.roles.includes(UserRole.ADMIN) && <td className="px-6 py-4">{locations.find(l=>l.id === exp.locationId)?.name || 'N/A'}</td>}
                                        <td className="px-6 py-4 flex gap-4">
                                            <button onClick={() => handleEdit(exp)} className="text-primary hover:underline">Editar</button>
                                            <button onClick={() => handleDelete(exp.id, exp.description)} className="text-red-500 hover:underline">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Expenses;
