import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import { usePno, useAuth, useConfirmation } from '../context/AppProvider';
import { UserRole, PnoProcedure } from '../types';
import { useLocation } from 'react-router-dom';

const PnoModal: React.FC<{
    pno: PnoProcedure | null;
    onSave: (pno: PnoProcedure) => void;
    onClose: () => void;
}> = ({ pno, onSave, onClose }) => {
    
    const initialFormState = { title: '', sections: [{ title: '', content: '' }] };
    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        if (pno) {
            setForm({
                title: pno.title,
                sections: pno.sections.length > 0 ? pno.sections : [{ title: '', content: '' }]
            });
        } else {
            setForm(initialFormState);
        }
    }, [pno]);
    
    const handleFormChange = (field: 'title', value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
        const newSections = [...form.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setForm(prev => ({ ...prev, sections: newSections }));
    };
    
    const addSection = () => {
        setForm(prev => ({...prev, sections: [...prev.sections, { title: '', content: '' }]}));
    };

    const removeSection = (index: number) => {
        if (form.sections.length > 1) {
            setForm(prev => ({...prev, sections: prev.sections.filter((_, i) => i !== index)}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: pno?.id || `pno-${Date.now()}`,
            title: form.title,
            sections: form.sections
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" aria-label="Cerrar">&times;</button>
                <h3 className="text-lg font-bold mb-4 text-text-primary">{pno ? 'Editar' : 'Crear'} PNO</h3>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Título del Procedimiento</label>
                        <input type="text" value={form.title} onChange={e => handleFormChange('title', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                    </div>
                    
                    <h4 className="text-md font-semibold text-text-secondary pt-2 border-t border-border-color">Secciones</h4>
                    {form.sections.map((section, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-border-color space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-text-secondary">Sección {index + 1}</label>
                                <button type="button" onClick={() => removeSection(index)} disabled={form.sections.length <= 1} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">Eliminar</button>
                            </div>
                            <input type="text" placeholder="Título de la sección" value={section.title} onChange={e => handleSectionChange(index, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border border-border-color rounded-md" required />
                            <textarea placeholder="Contenido de la sección..." value={section.content} onChange={e => handleSectionChange(index, 'content', e.target.value)} rows={5} className="w-full px-3 py-2 bg-white border border-border-color rounded-md" required />
                        </div>
                    ))}
                     <button type="button" onClick={addSection} className="text-sm py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-md">+ Añadir Sección</button>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">{pno ? 'Guardar Cambios' : 'Crear Procedimiento'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const PnoLibrary: React.FC = () => {
    const { pnoProcedures, savePnoProcedure, deletePnoProcedure } = usePno();
    const { currentUser } = useAuth();
    const { showConfirmation } = useConfirmation();
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPno, setEditingPno] = useState<PnoProcedure | null>(null);
    const [openPnoId, setOpenPnoId] = useState<string | null>(null);

    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

    useEffect(() => {
        if (location.state?.openPnoId) {
            setOpenPnoId(location.state.openPnoId);
        }
    }, [location.state]);

    const handleOpenModal = (pno: PnoProcedure | null) => {
        setEditingPno(pno);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPno(null);
    };

    const handleSave = (pno: PnoProcedure) => {
        savePnoProcedure(pno);
        handleCloseModal();
    };

    const handleDelete = (pno: PnoProcedure) => {
        showConfirmation(`¿Estás seguro que quieres eliminar el PNO "${pno.title}"?`, () => {
            deletePnoProcedure(pno.id);
        });
    };
    
    const togglePno = (pnoId: string) => {
        setOpenPnoId(prevId => (prevId === pnoId ? null : pnoId));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Biblioteca PNO</h1>
                {isAdmin && (
                    <button onClick={() => handleOpenModal(null)} className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                        + Añadir PNO
                    </button>
                )}
            </div>
            
            <p className="text-text-secondary">
                Manual de referencia para los procedimientos operativos estándar. Haz clic en un PNO para expandir su contenido.
            </p>

            <div className="space-y-2">
                {pnoProcedures.map((procedure) => {
                    const isOpen = openPnoId === procedure.id;
                    return (
                        <div key={procedure.id} className="border border-border-color rounded-lg bg-surface">
                            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => togglePno(procedure.id)}>
                                <h2 className="text-xl font-semibold text-primary flex-1">{procedure.title}</h2>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                {isAdmin && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(procedure); }} className="text-sm text-yellow-600 hover:underline">Editar</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(procedure); }} className="text-sm text-red-500 hover:underline">Eliminar</button>
                                    </>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            {isOpen && (
                                <div className="p-4 border-t border-border-color">
                                    {procedure.sections.map((section, index) => (
                                        <div key={index} className="mb-4">
                                            <h3 className="text-lg font-bold text-text-primary mb-2">{section.title}</h3>
                                            <div className="prose prose-sm max-w-none text-text-secondary">
                                                {section.content.split('\n').map((paragraph, pIndex) => (
                                                    <p key={pIndex}>{paragraph}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {isModalOpen && (
                <PnoModal pno={editingPno} onSave={handleSave} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default PnoLibrary;