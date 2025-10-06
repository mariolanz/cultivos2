import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useSessionStorage from '../hooks/useSessionStorage';
import { User, Crop, PlantBatch, Location, InventoryItem, Formula, FormulaSchedule, Genetics, Notification, Expense, UserRole, Task, Announcement, PlantBatchStatus, LogEntry, MaintenanceLog, MotherPlant, Equipment, TrimmingSession, PnoProcedure, Infographic } from '../types';
import * as D from '../constants';
import { getStageInfo, getFormulaForWeek, getParentLocationId, getPnoParametersForWeek, isOutOfRange } from '../services/nutritionService';

// --- Type Definitions for Contexts ---

interface AuthContextType {
  users: User[];
  loggedInUser: User | null; // The real user session
  currentUser: User | null; // The user currently being viewed (can be simulated)
  simulatedUserId: string | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  createUser: (user: Omit<User, 'id' | 'roles'>) => void;
  deleteUser: (userId: string) => void;
  saveUser: (user: User) => void;
  simulateUser: (userId: string | null) => void;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
}
interface CropContextType {
  allCrops: Crop[];
  activeCropId: string | null;
  activeCrop: Crop | null;
  saveCrop: (crop: Crop) => void;
  deleteCrop: (cropId: string) => void;
  setActiveCropId: (id: string | null) => void;
  archiveCrop: (cropId: string) => void;
  restoreCrop: (cropId: string) => void;
}
interface PlantBatchContextType {
  plantBatches: PlantBatch[];
  activeBatchId: string | null;
  activeBatch: PlantBatch | null;
  savePlantBatch: (batch: PlantBatch, sourceMotherPlantId?: string) => void;
  deletePlantBatch: (batchId: string) => boolean;
  setActiveBatchId: (id: string | null) => void;
}
interface MotherPlantContextType {
  motherPlants: MotherPlant[];
  activeMotherPlantId: string | null;
  activeMotherPlant: MotherPlant | null;
  saveMotherPlant: (plant: MotherPlant) => void;
  deleteMotherPlant: (plantId: string) => void;
  setActiveMotherPlantId: (id: string | null) => void;
  archiveMotherPlant: (plantId: string) => void;
  restoreMotherPlant: (plantId: string) => void;
  saveLogForAllActiveMotherPlants: (logEntry: Omit<LogEntry, 'id'>) => void;
}
interface GeneticsContextType {
  genetics: Genetics[];
  saveGenetic: (genetic: Genetics) => void;
  deleteGenetic: (geneticId: string) => void;
}
interface LocationContextType {
  locations: Location[];
  saveLocation: (location: Location) => void;
  deleteLocation: (locationId: string) => void;
}
interface TaskContextType {
    tasks: Task[];
    saveTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    completeTaskForCrop: (taskId: string, cropId: string, userId: string) => void;
    completeMaintenanceTask: (task: Task, userId: string, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => void;
}
interface MaintenanceLogContextType {
  maintenanceLogs: MaintenanceLog[];
}
interface InventoryContextType {
    inventory: InventoryItem[];
    saveInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (itemId: string) => void;
    addPurchaseToItem: (itemId: string, purchaseQuantity: number, totalCost: number) => void;
}
interface EquipmentContextType {
    equipment: Equipment[];
    saveEquipment: (equipment: Equipment) => void;
    deleteEquipment: (equipmentId: string) => void;
}
interface TrimmingContextType {
    trimmingSessions: TrimmingSession[];
    saveTrimmingSession: (session: TrimmingSession) => void;
}
interface FormulaContextType {
    formulas: Formula[];
    formulaSchedule: FormulaSchedule;
    saveFormula: (formula: Formula) => void;
    deleteFormula: (formulaId: string) => void;
}
interface ExpenseContextType {
    expenses: Expense[];
    saveExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
}
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}
interface AnnouncementContextType {
  announcements: Announcement[];
  addAnnouncement: (message: string, locationId?: string) => void;
  markAnnouncementAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}
interface ConfirmationContextType {
  showConfirmation: (message: string, onConfirm: () => void) => void;
}
interface AppDataContextType {
    exportFullBackup: () => void;
    importFullBackup: (jsonData: string) => void;
    exportNewRecords: () => void;
    importAndMergeRecords: (jsonData: string) => void;
}
interface PnoContextType {
    pnoProcedures: PnoProcedure[];
    savePnoProcedure: (pno: PnoProcedure) => void;
    deletePnoProcedure: (pnoId: string) => void;
}
interface InfographicContextType {
    infographics: Infographic[];
    saveInfographic: (infographic: Infographic) => void;
    deleteInfographic: (infographicId: string) => void;
}


// --- Context Creation ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CropContext = createContext<CropContextType | undefined>(undefined);
const PlantBatchContext = createContext<PlantBatchContextType | undefined>(undefined);
const MotherPlantContext = createContext<MotherPlantContextType | undefined>(undefined);
const GeneticsContext = createContext<GeneticsContextType | undefined>(undefined);
const LocationContext = createContext<LocationContextType | undefined>(undefined);
const TaskContext = createContext<TaskContextType | undefined>(undefined);
const MaintenanceLogContext = createContext<MaintenanceLogContextType | undefined>(undefined);
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);
const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);
const TrimmingContext = createContext<TrimmingContextType | undefined>(undefined);
const FormulaContext = createContext<FormulaContextType | undefined>(undefined);
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);
const PnoContext = createContext<PnoContextType | undefined>(undefined);
const InfographicContext = createContext<InfographicContextType | undefined>(undefined);


// --- Hooks for Consuming Contexts ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
export const useCrops = () => {
  const context = useContext(CropContext);
  if (!context) throw new Error("useCrops must be used within a CropProvider");
  return context;
}
export const usePlantBatches = () => {
  const context = useContext(PlantBatchContext);
  if (!context) throw new Error("usePlantBatches must be used within a PlantBatchProvider");
  return context;
}
export const useMotherPlants = () => {
  const context = useContext(MotherPlantContext);
  if (!context) throw new Error("useMotherPlants must be used within a MotherPlantProvider");
  return context;
}
export const useGenetics = () => {
  const context = useContext(GeneticsContext);
  if (!context) throw new Error("useGenetics must be used within a GeneticsProvider");
  return context;
}
export const useLocations = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocations must be used within a LocationProvider");
  return context;
}
export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("useTasks must be used within a TaskProvider");
    return context;
}
export const useMaintenanceLogs = () => {
    const context = useContext(MaintenanceLogContext);
    if (!context) throw new Error("useMaintenanceLogs must be used within a MaintenanceLogProvider");
    return context;
}
export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error("useInventory must be used within an InventoryProvider");
    return context;
}
export const useEquipment = () => {
    const context = useContext(EquipmentContext);
    if (!context) throw new Error("useEquipment must be used within an EquipmentProvider");
    return context;
};
export const useTrimming = () => {
    const context = useContext(TrimmingContext);
    if (!context) throw new Error("useTrimming must be used within a TrimmingProvider");
    return context;
};
export const useFormulas = () => {
    const context = useContext(FormulaContext);
    if (!context) throw new Error("useFormulas must be used within a FormulaProvider");
    return context;
}
export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error("useExpenses must be used within an ExpenseProvider");
    return context;
}
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  return context;
};
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirmation must be used within a ConfirmationProvider");
  return context;
};
export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error("useAppData must be used within an AppProvider");
    return context;
}
export const usePno = () => {
    const context = useContext(PnoContext);
    if (!context) throw new Error("usePno must be used within an AppProvider");
    return context;
}
export const useInfographics = () => {
    const context = useContext(InfographicContext);
    if (!context) throw new Error("useInfographics must be used within an AppProvider");
    return context;
}


// --- Combined Provider Component ---
interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Initializations ---
  const [users, setUsers] = useLocalStorage<User[]>('users', D.USERS);
  const [loggedInUser, setLoggedInUser] = useSessionStorage<User>('loggedInUser', null);
  const [simulatedUserId, setSimulatedUserId] = useSessionStorage<string | null>('simulatedUserId', null);
  const [activeRole, setActiveRole] = useSessionStorage<UserRole | null>('activeRole', null);
  const [allCrops, setAllCrops] = useLocalStorage<Crop[]>('crops', D.CROPS);
  const [activeCropId, setActiveCropId] = useSessionStorage<string | null>('activeCropId', null);
  const [plantBatches, setPlantBatches] = useLocalStorage<PlantBatch[]>('plantBatches', D.PLANT_BATCHES);
  const [activeBatchId, setActiveBatchId] = useSessionStorage<string | null>('activeBatchId', null);
  const [motherPlants, setMotherPlants] = useLocalStorage<MotherPlant[]>('motherPlants', D.MOTHER_PLANTS);
  const [activeMotherPlantId, setActiveMotherPlantId] = useSessionStorage<string | null>('activeMotherPlantId', null);
  const [genetics, setGenetics] = useLocalStorage<Genetics[]>('genetics', D.GENETICS);
  const [locations, setLocations] = useLocalStorage<Location[]>('locations', D.LOCATIONS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', D.TASKS);
  const [maintenanceLogs, setMaintenanceLogs] = useLocalStorage<MaintenanceLog[]>('maintenanceLogs', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', D.INVENTORY_ITEMS);
  const [equipment, setEquipment] = useLocalStorage<Equipment[]>('equipment', D.EQUIPMENT);
  const [trimmingSessions, setTrimmingSessions] = useLocalStorage<TrimmingSession[]>('trimmingSessions', D.TRIMMING_SESSIONS);
  const [formulas, setFormulas] = useLocalStorage<Formula[]>('formulas', D.FORMULAS);
  const [formulaSchedule, setFormulaSchedule] = useLocalStorage<FormulaSchedule>('formulaSchedule', D.FORMULA_SCHEDULE);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', D.EXPENSES);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('announcements', []);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: null });
  const [pnoProcedures, setPnoProcedures] = useLocalStorage<PnoProcedure[]>('pnoProcedures', D.INITIAL_PNO_PROCEDURES);
  const [infographics, setInfographics] = useLocalStorage<Infographic[]>('infographics', D.INITIAL_INFOGRAPHICS);

    // Derived state for the currently active user (real or simulated)
    const currentUser = useMemo(() => {
        if (simulatedUserId) {
            // If the simulated user is deleted, it will return undefined.
            // In that case, fall back to the loggedInUser to prevent crashes.
            return users.find(u => u.id === simulatedUserId) || loggedInUser;
        }
        return loggedInUser;
    }, [loggedInUser, simulatedUserId, users]);
  
  // --- Generic CRUD Logic ---
  const createSave = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (item: T) => {
    setter(prev => {
      const index = prev.findIndex(i => i.id === item.id);
      if (index > -1) {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      }
      return [...prev, item];
    });
  };

  const createDelete = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  // --- Auth Logic ---
  const login = (username: string, password: string): User | null => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setLoggedInUser(user);
      setSimulatedUserId(null);
      setActiveRole(null);
      setActiveCropId(null);
      setActiveBatchId(null);
      setActiveMotherPlantId(null);
      return user;
    }
    return null;
  };

  const logout = () => {
    setLoggedInUser(null);
    setSimulatedUserId(null);
    setActiveRole(null);
    setActiveCropId(null);
    setActiveBatchId(null);
    setActiveMotherPlantId(null);
  };

  const simulateUser = (userId: string | null) => {
      setSimulatedUserId(userId);
      setActiveRole(null); // Force role re-selection for the simulated user
      setActiveCropId(null);
      setActiveBatchId(null);
      setActiveMotherPlantId(null);
  };

  const createUser = (user: Omit<User, 'id' | 'roles'>) => {
    const newUser: User = { ...user, id: `user-${Date.now()}`, roles: [UserRole.GROWER] };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (userId: string) => {
      if (loggedInUser?.id === userId) {
          alert("No puedes eliminarte a ti mismo.");
          return;
      }
      // If the user being deleted is the one currently being simulated, stop the simulation.
      if (simulatedUserId === userId) {
          setSimulatedUserId(null);
          setActiveRole(null);
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  };
  const saveUser = createSave(setUsers);

  // --- Notification and Announcement Logic ---
    const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, [setNotifications]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => (n.read ? n : { ...n, read: true })));
    };

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const addAnnouncement = (message: string, locationId?: string) => {
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            message,
            createdAt: new Date().toISOString(),
            read: false,
            locationId: locationId || undefined,
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    };

    const markAnnouncementAsRead = (id: string) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const unreadAnnouncementsCount = useMemo(() => announcements.filter(a =>
        !a.read &&
        (!a.locationId || a.locationId === currentUser?.locationId || currentUser?.locationId === 'TODAS')
    ).length, [announcements, currentUser]);

    const markAllAnnouncementsAsRead = () => {
        setAnnouncements(prev => prev.map(a => (a.read ? a : { ...a, read: true })));
    };

  // --- Confirmation Logic ---
  const showConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, message, onConfirm });
  };
  const handleConfirm = () => {
    if (confirmation.onConfirm) confirmation.onConfirm();
    setConfirmation({ isOpen: false, message: '', onConfirm: null });
  };
  const handleCancel = () => {
    setConfirmation({ isOpen: false, message: '', onConfirm: null });
  };

  // --- Data Management Logic ---
    const exportFullBackup = () => {
        try {
            const appState = {
                users, allCrops, plantBatches, motherPlants, genetics, locations, tasks, inventory, formulas, formulaSchedule, expenses, notifications, announcements, maintenanceLogs, equipment, trimmingSessions, pnoProcedures, infographics
            };
            const jsonString = JSON.stringify(appState, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `torus-ac-backup-completo-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("¡Exportación de respaldo completo finalizada!");
        } catch (error) {
            console.error("Error exporting app state:", error);
            alert("Error al exportar los datos.");
        }
    };

    const importFullBackup = (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.dataType === 'TorusAC_IncrementalExport') {
                throw new Error("Este es un archivo de registros incrementales. Por favor, usa el botón 'Importar y Combinar Registros' para importarlo.");
            }
            if (!data.users || !data.allCrops) {
                throw new Error("El archivo JSON no tiene el formato esperado para un respaldo completo.");
            }
            setUsers(data.users ?? D.USERS);
            setAllCrops(data.allCrops ?? D.CROPS);
            setPlantBatches(data.plantBatches ?? D.PLANT_BATCHES);
            setMotherPlants(data.motherPlants ?? D.MOTHER_PLANTS);
            setGenetics(data.genetics ?? D.GENETICS);
            setLocations(data.locations ?? D.LOCATIONS);
            setTasks(data.tasks ?? D.TASKS);
            setInventory(data.inventory ?? D.INVENTORY_ITEMS);
            setEquipment(data.equipment ?? D.EQUIPMENT);
            setTrimmingSessions(data.trimmingSessions ?? D.TRIMMING_SESSIONS);
            setFormulas(data.formulas ?? D.FORMULAS);
            setFormulaSchedule(data.formulaSchedule ?? D.FORMULA_SCHEDULE);
            setExpenses(data.expenses ?? D.EXPENSES);
            setNotifications(data.notifications ?? []);
            setAnnouncements(data.announcements ?? []);
            setMaintenanceLogs(data.maintenanceLogs ?? []);
            setPnoProcedures(data.pnoProcedures ?? D.INITIAL_PNO_PROCEDURES);
            setInfographics(data.infographics ?? D.INITIAL_INFOGRAPHICS);
            alert("¡Restauración completada! La página se recargará.");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error("Error importing app state:", error);
            alert(`Error al importar los datos: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const exportNewRecords = () => {
        try {
            const lastExportTimestamp = localStorage.getItem('lastExportTimestamp');
            const now = new Date();
            const lastExportDate = lastExportTimestamp ? new Date(lastExportTimestamp) : new Date(0);

            const newLogEntriesByCrop: { cropId: string, logs: LogEntry[] }[] = [];
            allCrops.forEach(crop => {
                const newLogs = crop.logEntries.filter(log => new Date(log.date) > lastExportDate);
                if (newLogs.length > 0) newLogEntriesByCrop.push({ cropId: crop.id, logs: newLogs });
            });

            const newExpenses = expenses.filter(exp => new Date(exp.date) > lastExportDate);
            const newPlantBatches = plantBatches.filter(b => new Date(b.creationDate) > lastExportDate);
            const newMaintenanceLogs = maintenanceLogs.filter(log => new Date(log.completedAt) > lastExportDate);
            
            const exportData = {
                dataType: 'TorusAC_IncrementalExport',
                exportedBy: currentUser?.username,
                exportedAt: now.toISOString(),
                data: { newLogEntriesByCrop, newExpenses, newPlantBatches, newMaintenanceLogs }
            };

            if (newLogEntriesByCrop.length === 0 && newExpenses.length === 0 && newPlantBatches.length === 0 && newMaintenanceLogs.length === 0) {
                alert("No hay nuevos registros para exportar desde la última vez.");
                return;
            }

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `torus-ac-registros-${currentUser?.username}-${now.toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            localStorage.setItem('lastExportTimestamp', now.toISOString());
            alert("Exportación de nuevos registros completada.");
        } catch (error) {
            console.error("Error exporting new records:", error);
            alert("Error al exportar nuevos registros.");
        }
    };

    const importAndMergeRecords = (jsonData: string) => {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.dataType !== 'TorusAC_IncrementalExport') {
                if (importData.users && importData.allCrops) { // Heuristic check for full backup
                    throw new Error("Este parece ser un archivo de respaldo completo. Por favor, usa el botón 'Restaurar desde Respaldo' para importarlo.");
                }
                throw new Error("El archivo no es una exportación de registros válida.");
            }

            // Merge log entries
            setAllCrops(prevCrops => {
                const newCrops = JSON.parse(JSON.stringify(prevCrops)); // Deep copy
                importData.data.newLogEntriesByCrop?.forEach((cropLogs: { cropId: string; logs: LogEntry[] }) => {
                    const cropIndex = newCrops.findIndex((c: Crop) => c.id === cropLogs.cropId);
                    if (cropIndex !== -1) {
                        const existingLogIds = new Set(newCrops[cropIndex].logEntries.map((l: LogEntry) => l.id));
                        const uniqueNewLogs = cropLogs.logs.filter(l => !existingLogIds.has(l.id));
                        newCrops[cropIndex].logEntries.push(...uniqueNewLogs);
                    }
                });
                return newCrops;
            });

            // Merge expenses
            setExpenses(prev => {
                const existingIds = new Set(prev.map(e => e.id));
                const uniqueNew = importData.data.newExpenses?.filter((e: Expense) => !existingIds.has(e.id)) || [];
                return [...prev, ...uniqueNew];
            });

            // Merge plant batches
            setPlantBatches(prev => {
                const existingIds = new Set(prev.map(b => b.id));
                const uniqueNew = importData.data.newPlantBatches?.filter((b: PlantBatch) => !existingIds.has(b.id)) || [];
                return [...prev, ...uniqueNew];
            });

            // Merge maintenance logs
            setMaintenanceLogs(prev => {
                const existingIds = new Set(prev.map(l => l.id));
                const uniqueNew = importData.data.newMaintenanceLogs?.filter((l: MaintenanceLog) => !existingIds.has(l.id)) || [];
                return [...prev, ...uniqueNew];
            });
            
            alert(`Registros de "${importData.exportedBy}" combinados exitosamente.`);
        } catch (error) {
            console.error("Error merging records:", error);
            alert(`Error al combinar los registros: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

  // --- Context-Specific Logic ---
  const saveLocation = createSave(setLocations);

  const saveCrop = (crop: Crop) => {
    const oldCrop = allCrops.find(c => c.id === crop.id);
    const oldLogIds = oldCrop ? new Set(oldCrop.logEntries.map(l => l.id)) : new Set();
    const newLogEntries = crop.logEntries.filter(log => !oldLogIds.has(log.id));
    const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;
    
    if (!oldCrop) { // This is a new crop
        let batchLogs: LogEntry[] = [];
        crop.plantCounts.forEach(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            if (batch && batch.logEntries) {
                batchLogs = [...batchLogs, ...batch.logEntries];
            }
        });
        batchLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        crop.logEntries = [...batchLogs, ...crop.logEntries];
    }

    newLogEntries.forEach(log => {
        // Auto-calculate irrigation cost
        if (log.irrigation && !log.irrigation.cost && log.irrigation.volume > 0) {
            const stageInfo = getStageInfo(crop, new Date(log.date));
            const formulaTemplate = getFormulaForWeek(stageInfo.stage, stageInfo.weekInStage, formulaSchedule, formulas);
            if (formulaTemplate) {
                const parentLocationId = getParentLocationId(crop.locationId, locations);
                if (parentLocationId) {
                    let totalCost = 0;
                    formulaTemplate.nutrients.forEach(nutrient => {
                        const locationSpecificItemId = `${nutrient.inventoryItemId}-${parentLocationId}`;
                        const inventoryItem = inventory.find(i => i.id === locationSpecificItemId);
                        if (inventoryItem && inventoryItem.averageCostPerUnit > 0) {
                            const amountUsed = nutrient.amountPerLiter * log.irrigation!.volume;
                            totalCost += amountUsed * inventoryItem.averageCostPerUnit;
                        }
                    });
                    log.irrigation!.cost = totalCost;
                }
            }
        }

        // Auto-complete foliar task
        if (log.foliarSpray && log.foliarSpray.length > 0 && currentUser) {
            const today = new Date(log.date);
            const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
            
            const foliarTask = tasks.find(t => 
                t.title.toLowerCase().includes('aplicación foliar') && t.dayOfWeek === dayOfWeek
            );

            if (foliarTask) {
                const isAlreadyCompleted = log.completedTasks?.some(ct => ct.taskId === foliarTask.id);
                if (!isAlreadyCompleted) {
                    const completedTaskEntry = {
                        taskId: foliarTask.id,
                        taskTitle: foliarTask.title,
                        completedBy: currentUser.username,
                        completedAt: new Date().toISOString(),
                    };
                    if (!log.completedTasks) {
                        log.completedTasks = [];
                    }
                    log.completedTasks.push(completedTaskEntry);
                }
            }
        }
        
        // Intelligent PNO Notifications
        const stageInfo = getStageInfo(crop, new Date(log.date));
        const pnoParams = getPnoParametersForWeek(stageInfo.stage, stageInfo.weekInStage);
        
        if (pnoParams) {
            const checkAndNotify = (value: number | undefined, range: (typeof pnoParams)[keyof typeof pnoParams], paramName: string, unit: string, tolerance: number = 0) => {
                if (value === undefined) return;
                if (isOutOfRange(value, range as any, tolerance)) {
                    const rangeStr = Array.isArray(range) ? `${range[0]}-${range[1]}` : range;
                    addNotification(`Alerta en "${cropName}": ${paramName} de ${value}${unit} está fuera del rango PNO (${rangeStr}${unit}).`, 'warning');
                }
            };
            
            if(log.environmental) {
                checkAndNotify(log.environmental.temp, pnoParams.tempDay, 'Temperatura', '°C', 2);
                checkAndNotify(log.environmental.humidity, pnoParams.humidityDay, 'Humedad', '%', 5);
                checkAndNotify(log.environmental.vpd, pnoParams.vpd, 'VPD', 'kPa', 0.2);
                checkAndNotify(log.environmental.co2, pnoParams.co2, 'CO₂', 'ppm', 200);
            }
            if(log.irrigation) {
                checkAndNotify(log.irrigation.ph, pnoParams.ph, 'pH de Entrada', '', 0.2);
                if (typeof pnoParams.ppm === 'number' && isOutOfRange(log.irrigation.ppm, pnoParams.ppm, 0.1)) {
                     addNotification(`Alerta en "${cropName}": PPM de entrada de ${log.irrigation.ppm} está fuera del 10% del objetivo PNO (${pnoParams.ppm}).`, 'warning');
                }
            }
        }

        // Other existing notifications
        if (log.irrigation?.ppmOut && log.irrigation?.ppm && log.irrigation.ppmOut > log.irrigation.ppm * 1.25) {
            addNotification(`PPM de salida alto en "${cropName}": ${log.irrigation.ppmOut}. Considera lavado de raíz o suplementos.`, 'warning');
        }
        if (log.plantHealth && log.plantHealth.length > 0) {
            const isProblem = log.plantHealth.some(status => !D.PLANT_HEALTH_OPTIONS['Estado Positivo'].includes(status));
            if (isProblem) {
                addNotification(`¡Atención! Problema de salud en "${cropName}": ${log.plantHealth.join(', ')}`, 'warning');
            }
        }
    });

    setAllCrops(prev => {
        const index = prev.findIndex(c => c.id === crop.id);
        if (index > -1) {
            const newCrops = [...prev];
            newCrops[index] = crop;
            return newCrops;
        }
        return [...prev, crop];
    });
};

  const deleteCrop = (cropId: string) => {
    setAllCrops(prev => prev.filter(c => c.id !== cropId));
    if (activeCropId === cropId) setActiveCropId(null);
  };

  const archiveCrop = (cropId: string) => {
    const cropToArchive = allCrops.find(c => c.id === cropId);
    if (!cropToArchive) return;
    
    // Reset room to default veg schedule if it's a full cycle room
    const room = locations.find(l => l.id === cropToArchive.locationId);
    if (room && room.type === 'ciclo completo') {
        const updatedRoom: Location = { ...room, lightOnTime: '06:00', lightOffTime: '23:50' };
        saveLocation(updatedRoom);
    }

    // Update coco coir reuse count
    setInventory(prevInventory => {
        const newInventory = [...prevInventory];
        const cocoItemIndex = newInventory.findIndex(i => i.locationId === cropToArchive.locationId && i.category === 'Sustrato');
        
        if (cocoItemIndex > -1) {
            const cocoItem = { ...newInventory[cocoItemIndex] };
            cocoItem.reuseCount = (cocoItem.reuseCount || 0) + 1;
            cocoItem.currentStock = 1; // Reset stock to 1 "cycle" ready
            newInventory[cocoItemIndex] = cocoItem;
        }
        return newInventory;
    });

    // Archive the crop and set harvest date if not present
    setAllCrops(prev => prev.map(c => 
        c.id === cropId 
        ? { 
            ...c, 
            isArchived: true,
            // Ensure harvestDate is set, making it officially HARVESTED
            harvestDate: c.harvestDate || new Date().toISOString() 
          } 
        : c
    ));
    
    // If the archived crop was the active one, clear it.
    if (activeCropId === cropId) {
        setActiveCropId(null);
    }
  };


  const restoreCrop = (cropId: string) => {
    setAllCrops(prev => prev.map(c => c.id === cropId ? { ...c, isArchived: false } : c));
  };

  const activeCrop = allCrops.find(c => c.id === activeCropId && !c.isArchived) || null;
  const activeBatch = plantBatches.find(b => b.id === activeBatchId) || null;
  const activeMotherPlant = motherPlants.find(p => p.id === activeMotherPlantId) || null;
  
  const savePlantBatch = (batch: PlantBatch, sourceMotherPlantId?: string) => {
    const oldBatch = plantBatches.find(b => b.id === batch.id);

    if (!oldBatch && sourceMotherPlantId && sourceMotherPlantId.startsWith('mp-')) {
        setMotherPlants(prevPlants => {
            const plantIndex = prevPlants.findIndex(p => p.id === sourceMotherPlantId);
            if (plantIndex > -1) {
                const updatedPlants = [...prevPlants];
                const plantToUpdate = { ...updatedPlants[plantIndex] };
                plantToUpdate.cloneCount += batch.initialPlantCount;
                updatedPlants[plantIndex] = plantToUpdate;
                return updatedPlants;
            }
            return prevPlants;
        });
    }

    if(oldBatch && batch.logEntries.length > oldBatch.logEntries.length){
        const newLog = batch.logEntries[batch.logEntries.length-1];
        if (newLog.irrigation) {
            if (newLog.irrigation.ph < 5.7 || newLog.irrigation.ph > 6.4) {
                addNotification(`Alerta de pH en Lote "${batch.name}": ${newLog.irrigation.ph} está fuera del rango ideal (5.7-6.4).`, 'warning');
            }
        }
    }
    createSave(setPlantBatches)(batch);
  };

  const deletePlantBatch = (batchId: string): boolean => {
    const batch = plantBatches.find(b => b.id === batchId);
    if (batch && (batch.status === PlantBatchStatus.IN_USE || batch.status === PlantBatchStatus.DEPLETED)) {
      alert("No se puede eliminar el lote: se está utilizando o se ha utilizado en un cultivo. Primero archiva el cultivo asociado.");
      return false;
    }
    setPlantBatches(prev => prev.filter(b => b.id !== batchId));
    return true;
  };
  
  const saveMotherPlant = createSave(setMotherPlants);
  const deleteMotherPlant = createDelete(setMotherPlants);
  const archiveMotherPlant = (plantId: string) => {
    setMotherPlants(prev => prev.map(p => p.id === plantId ? { ...p, isArchived: true } : p));
  };
  const restoreMotherPlant = (plantId: string) => {
    setMotherPlants(prev => prev.map(p => p.id === plantId ? { ...p, isArchived: false } : p));
  };
  const saveLogForAllActiveMotherPlants = useCallback((logEntry: Omit<LogEntry, 'id'>) => {
    setMotherPlants(prevPlants => {
        return prevPlants.map(plant => {
            if (!plant.isArchived) {
                const newLog: LogEntry = {...logEntry, id: `log-${plant.id}-${Date.now()}`};
                if(newLog.irrigation && (newLog.irrigation.ph < 5.7 || newLog.irrigation.ph > 6.4)) {
                    addNotification(`Alerta de pH en "${plant.name}": ${newLog.irrigation.ph} está fuera del rango ideal (5.7-6.4).`, 'warning');
                }
                return {
                    ...plant,
                    logEntries: [...plant.logEntries, newLog]
                };
            }
            return plant;
        });
    });
  }, [setMotherPlants, addNotification]);

  
  const saveGenetic = createSave(setGenetics);
  const deleteGenetic = createDelete(setGenetics);

  const deleteLocation = (locationId: string) => {
    const locationToDelete = locations.find(l => l.id === locationId);
    if (!locationToDelete) return;

    const hasChildren = !locationToDelete.parentId && locations.some(l => l.parentId === locationId);
    if (hasChildren) {
        alert("No se puede eliminar una ubicación principal que tiene cuartos asignados. Primero elimina o reasigna los cuartos.");
        return;
    }

    const isRoomInUse = allCrops.some(c => c.locationId === locationId) || motherPlants.some(m => m.locationId === locationId);
    if(isRoomInUse) {
        alert("No se puede eliminar un cuarto que está siendo utilizado por un cultivo o planta madre. Archiva o elimina el cultivo primero.");
        return;
    }

    showConfirmation(`¿Estás seguro de que quieres eliminar "${locationToDelete.name}"?`, () => {
        setLocations(prev => prev.filter(l => l.id !== locationId));
        setExpenses(prev => prev.filter(e => e.locationId !== locationId));
    });
  };

  const saveTask = createSave(setTasks);
  const deleteTask = createDelete(setTasks);
  const completeTaskForCrop = (taskId: string, cropId: string, userId: string) => {
        const cropToUpdate = allCrops.find(c => c.id === cropId);
        const task = tasks.find(t => t.id === taskId);
        const user = users.find(u => u.id === userId);

        if (!cropToUpdate || !task || !user) {
            console.error("No se pudo completar la tarea: cultivo, tarea o usuario no encontrado.");
            return;
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        const logEntries = [...cropToUpdate.logEntries];
        let todayLog = logEntries.find(log => log.date.startsWith(todayStr));
        
        const completedTaskEntry = {
            taskId: task.id,
            taskTitle: task.title,
            completedBy: user.username,
            completedAt: new Date().toISOString(),
        };

        if (todayLog) {
            todayLog.completedTasks = [...(todayLog.completedTasks || []), completedTaskEntry];
        } else {
            todayLog = {
                id: `log-${Date.now()}`,
                date: new Date().toISOString(),
                completedTasks: [completedTaskEntry],
                notes: `Tarea completada: ${task.title}`
            };
            logEntries.push(todayLog);
        }
        
        saveCrop({ ...cropToUpdate, logEntries });
    };

    const completeMaintenanceTask = (task: Task, userId: string, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newLog: MaintenanceLog = {
            id: `mlog-${Date.now()}`,
            taskId: task.id,
            taskTitle: task.title,
            userId: user.id,
            userUsername: user.username,
            locationId: task.locationId,
            completedAt: new Date().toISOString(),
            notes,
            photoEvidence: photo,
            partsUsed
        };

        setMaintenanceLogs(prev => [...prev, newLog]);
        addNotification(`Tarea de mantenimiento "${task.title}" completada.`);

        // Deduct from inventory
        setInventory(prevInv => {
            const newInv = [...prevInv];
            partsUsed.forEach(part => {
                const itemIndex = newInv.findIndex(i => i.id.startsWith(part.inventoryItemId) && i.locationId === task.locationId);
                if (itemIndex > -1) {
                    newInv[itemIndex] = { ...newInv[itemIndex], currentStock: newInv[itemIndex].currentStock - part.quantity };
                }
            });
            return newInv;
        });
    };
  
  const saveInventoryItem = createSave(setInventory);
  const deleteInventoryItem = createDelete(setInventory);
  const saveEquipment = createSave(setEquipment);
  const deleteEquipment = createDelete(setEquipment);
  
  const saveTrimmingSession = (session: TrimmingSession) => {
    // 1. Update the crop with new trimming data
    setAllCrops(prevCrops => {
        const cropIndex = prevCrops.findIndex(c => c.id === session.cropId);
        if (cropIndex === -1) {
            console.error("Crop not found for trimming session");
            return prevCrops;
        }

        const newCrops = [...prevCrops];
        const cropToUpdate = { ...newCrops[cropIndex] };
        
        let harvestData = cropToUpdate.harvestData ? JSON.parse(JSON.stringify(cropToUpdate.harvestData)) : { geneticHarvests: [], totalWetWeight: 0, totalDryWeight: 0, totalTrimWeight: 0, totalTrimWaste: 0, curingLog: [] };
        
        let geneticHarvest = harvestData.geneticHarvests.find((gh: any) => gh.geneticsId === session.geneticsId);

        if (geneticHarvest) {
            geneticHarvest.trimmedFlowerWeight = (geneticHarvest.trimmedFlowerWeight || 0) + session.trimmedWeight;
            geneticHarvest.trimWasteWeight = (geneticHarvest.trimWasteWeight || 0) + session.trimWasteWeight;
        } else {
            harvestData.geneticHarvests.push({
                geneticsId: session.geneticsId,
                wetWeight: 0,
                trimmedFlowerWeight: session.trimmedWeight,
                trimWasteWeight: session.trimWasteWeight,
            });
        }
        
        harvestData.totalTrimWeight = harvestData.geneticHarvests.reduce((sum: number, gh: any) => sum + (gh.trimmedFlowerWeight || 0), 0);
        harvestData.totalTrimWaste = harvestData.geneticHarvests.reduce((sum: number, gh: any) => sum + (gh.trimWasteWeight || 0), 0);
        
        cropToUpdate.harvestData = harvestData;
        newCrops[cropIndex] = cropToUpdate;

        return newCrops;
    });

    // 2. Save the trimming session itself
    setTrimmingSessions(prev => [...prev, session]);
  };


  const addPurchaseToItem = (itemId: string, purchaseQuantity: number, totalCost: number) => {
    setInventory(prev => {
        const index = prev.findIndex(i => i.id === itemId);
        if (index === -1) return prev;
        
        const newItems = [...prev];
        const item = { ...newItems[index] };

        const conversionFactor = item.purchaseUnitConversion || 1;
        const quantityInStockUnits = purchaseQuantity * conversionFactor;

        const newPurchase = { 
            date: new Date().toISOString(), 
            quantity: quantityInStockUnits,
            totalCost: totalCost 
        };
        item.purchases = [...item.purchases, newPurchase];
        
        const totalQuantityInStock = item.purchases.reduce((acc, p) => acc + p.quantity, 0);
        const totalCostSum = item.purchases.reduce((acc, p) => acc + p.totalCost, 0);
        
        item.currentStock = totalQuantityInStock;
        item.averageCostPerUnit = totalQuantityInStock > 0 ? parseFloat((totalCostSum / totalQuantityInStock).toPrecision(5)) : 0;
        
        newItems[index] = item;
        return newItems;
    });
  };

  const saveFormula = createSave(setFormulas);
  const deleteFormula = createDelete(setFormulas);

  const saveExpense = createSave(setExpenses);
  const deleteExpense = createDelete(setExpenses);
  
  const savePnoProcedure = createSave(setPnoProcedures);
  const deletePnoProcedure = createDelete(setPnoProcedures);

  const saveInfographic = createSave(setInfographics);
  const deleteInfographic = createDelete(setInfographics);


  // --- Value Objects for Providers ---
  const authValue = { users, loggedInUser, currentUser, simulatedUserId, login, logout, createUser, deleteUser, saveUser, simulateUser, activeRole, setActiveRole };
  const cropValue = { allCrops, activeCropId, activeCrop, saveCrop, deleteCrop, setActiveCropId, archiveCrop, restoreCrop };
  const plantBatchValue = { plantBatches, activeBatchId, activeBatch, savePlantBatch, deletePlantBatch, setActiveBatchId };
  const motherPlantValue = { motherPlants, activeMotherPlantId, activeMotherPlant, saveMotherPlant, deleteMotherPlant, setActiveMotherPlantId, archiveMotherPlant, restoreMotherPlant, saveLogForAllActiveMotherPlants };
  const geneticsValue = { genetics, saveGenetic, deleteGenetic };
  const locationValue = { locations, saveLocation, deleteLocation };
  const taskValue = { tasks, saveTask, deleteTask, completeTaskForCrop, completeMaintenanceTask };
  const maintenanceLogValue = { maintenanceLogs };
  const inventoryValue = { inventory, saveInventoryItem, deleteInventoryItem, addPurchaseToItem };
  const equipmentValue = { equipment, saveEquipment, deleteEquipment };
  const trimmingValue = { trimmingSessions, saveTrimmingSession };
  const formulaValue = { formulas, formulaSchedule, saveFormula, deleteFormula };
  const expenseValue = { expenses, saveExpense, deleteExpense };
  const notificationValue = { notifications, addNotification, markAsRead, unreadCount, markAllAsRead };
  const announcementValue = { announcements, addAnnouncement, markAnnouncementAsRead, unreadCount: unreadAnnouncementsCount, markAllAsRead: markAllAnnouncementsAsRead };
  const confirmationValue = { showConfirmation };
  const appDataValue = { exportFullBackup, importFullBackup, exportNewRecords, importAndMergeRecords };
  const pnoValue = { pnoProcedures, savePnoProcedure, deletePnoProcedure };
  const infographicValue = { infographics, saveInfographic, deleteInfographic };


  return (
    <AuthContext.Provider value={authValue}>
      <AppDataContext.Provider value={appDataValue}>
        <CropContext.Provider value={cropValue}>
            <PlantBatchContext.Provider value={plantBatchValue}>
              <MotherPlantContext.Provider value={motherPlantValue}>
                <GeneticsContext.Provider value={geneticsValue}>
                    <LocationContext.Provider value={locationValue}>
                        <TaskContext.Provider value={taskValue}>
                            <MaintenanceLogContext.Provider value={maintenanceLogValue}>
                                <InventoryContext.Provider value={inventoryValue}>
                                    <EquipmentContext.Provider value={equipmentValue}>
                                        <TrimmingContext.Provider value={trimmingValue}>
                                            <FormulaContext.Provider value={formulaValue}>
                                                <ExpenseContext.Provider value={expenseValue}>
                                                    <NotificationContext.Provider value={notificationValue}>
                                                        <AnnouncementContext.Provider value={announcementValue}>
                                                            <ConfirmationContext.Provider value={confirmationValue}>
                                                                <PnoContext.Provider value={pnoValue}>
                                                                  <InfographicContext.Provider value={infographicValue}>
                                                                    {children}
                                                                    {confirmation.isOpen && (
                                                                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                                                                            <div className="bg-surface rounded-lg p-6 shadow-xl max-w-sm mx-auto">
                                                                                <h3 className="text-lg font-bold mb-4 text-text-primary">Confirmar Acción</h3>
                                                                                <p className="text-text-secondary mb-6">{confirmation.message}</p>
                                                                                <div className="flex justify-end gap-4">
                                                                                    <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-text-primary">Cancelar</button>
                                                                                    <button onClick={handleConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Confirmar</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                  </InfographicContext.Provider>
                                                                </PnoContext.Provider>
                                                            </ConfirmationContext.Provider>
                                                        </AnnouncementContext.Provider>
                                                    </NotificationContext.Provider>
                                                </ExpenseContext.Provider>
                                            </FormulaContext.Provider>
                                        </TrimmingContext.Provider>
                                    </EquipmentContext.Provider>
                                </InventoryContext.Provider>
                            </MaintenanceLogContext.Provider>
                        </TaskContext.Provider>
                    </LocationContext.Provider>
                </GeneticsContext.Provider>
              </MotherPlantContext.Provider>
            </PlantBatchContext.Provider>
        </CropContext.Provider>
      </AppDataContext.Provider>
    </AuthContext.Provider>
  );
};