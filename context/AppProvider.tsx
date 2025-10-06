import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import useSessionStorage from '../hooks/useSessionStorage';
import { User, Crop, PlantBatch, Location, InventoryItem, Formula, FormulaSchedule, Genetics, Notification, Expense, UserRole, Task, Announcement, PlantBatchStatus, LogEntry, MaintenanceLog, MotherPlant, Equipment, TrimmingSession, PnoProcedure, Infographic, AppPermission } from '../types';
import * as D from '../constants';
import { getStageInfo, getFormulaForWeek, getParentLocationId, getPnoParametersForWeek, isOutOfRange } from '../services/nutritionService';
import * as authService from '../services/authService';
import { apiService } from '../services/apiService';
import {
  geneticsService,
  locationsService,
  motherPlantsService,
  cropsService,
  plantBatchesService,
  tasksService,
  inventoryService,
  formulasService,
  equipmentService,
  trimmingSessionsService,
  expensesService,
  pnoProceduresService,
  infographicsService,
  notificationsService,
  announcementsService,
  maintenanceLogsService
} from '../services/dataService';

interface AuthContextType {
  users: User[];
  loggedInUser: User | null;
  currentUser: User | null;
  simulatedUserId: string | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  createUser: (userData: {
    username: string;
    password: string;
    roles: UserRole[];
    locationId?: string;
    maintenanceLocationIds?: string[];
    permissions: { [key in AppPermission]?: boolean };
  }) => Promise<User | null>;
  deleteUser: (userId: string) => void;
  saveUser: (user: User) => Promise<boolean>;
  simulateUser: (userId: string | null) => void;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
  isLoading: boolean;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const useCrops = () => {
  const context = useContext(CropContext);
  if (!context) throw new Error("useCrops must be used within a CropProvider");
  return context;
};

export const usePlantBatches = () => {
  const context = useContext(PlantBatchContext);
  if (!context) throw new Error("usePlantBatches must be used within a PlantBatchProvider");
  return context;
};

export const useMotherPlants = () => {
  const context = useContext(MotherPlantContext);
  if (!context) throw new Error("useMotherPlants must be used within a MotherPlantProvider");
  return context;
};

export const useGenetics = () => {
  const context = useContext(GeneticsContext);
  if (!context) throw new Error("useGenetics must be used within a GeneticsProvider");
  return context;
};

export const useLocations = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocations must be used within a LocationProvider");
  return context;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export const useMaintenanceLogs = () => {
  const context = useContext(MaintenanceLogContext);
  if (!context) throw new Error("useMaintenanceLogs must be used within a MaintenanceLogProvider");
  return context;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within an InventoryProvider");
  return context;
};

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
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error("useExpenses must be used within an ExpenseProvider");
  return context;
};

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
};

export const usePno = () => {
  const context = useContext(PnoContext);
  if (!context) throw new Error("usePno must be used within an AppProvider");
  return context;
};

export const useInfographics = () => {
  const context = useContext(InfographicContext);
  if (!context) throw new Error("useInfographics must be used within an AppProvider");
  return context;
};

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useSessionStorage<User | null>('loggedInUser', null);
  const [simulatedUserId, setSimulatedUserId] = useSessionStorage<string | null>('simulatedUserId', null);
  const [activeRole, setActiveRole] = useSessionStorage<UserRole | null>('activeRole', null);
  const [allCrops, setAllCrops] = useState<Crop[]>([]);
  const [activeCropId, setActiveCropId] = useSessionStorage<string | null>('activeCropId', null);
  const [plantBatches, setPlantBatches] = useState<PlantBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useSessionStorage<string | null>('activeBatchId', null);
  const [motherPlants, setMotherPlants] = useState<MotherPlant[]>([]);
  const [activeMotherPlantId, setActiveMotherPlantId] = useSessionStorage<string | null>('activeMotherPlantId', null);
  const [genetics, setGenetics] = useState<Genetics[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [trimmingSessions, setTrimmingSessions] = useState<TrimmingSession[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [formulaSchedule, setFormulaSchedule] = useState<FormulaSchedule>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: null });
  const [pnoProcedures, setPnoProcedures] = useState<PnoProcedure[]>([]);
  const [infographics, setInfographics] = useState<Infographic[]>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando usuarios para login...');
        
        const usersData = await authService.getAllUsers().catch(e => { 
          console.error('❌ Error cargando users:', e); 
          return []; 
        });
        
        setUsers(usersData as User[]);
        console.log('✅ Usuarios cargados');
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadUserData() {
      if (!loggedInUser) return;
      
      try {
        console.log('🔄 Usuario autenticado, cargando datos del sistema...');
        
        const [
          geneticsData,
          locationsData,
          tasksData,
          inventoryData,
          formulasData,
          equipmentData,
          expensesData,
          pnoData,
          infographicsData,
          motherPlantsData,
          cropsData,
          batchesData,
          trimmingData,
          maintenanceData,
          notificationsData,
          announcementsData
        ] = await Promise.all([
          geneticsService.getAll().catch(e => { console.error('❌ Error cargando genetics:', e); return []; }),
          locationsService.getAll().catch(e => { console.error('❌ Error cargando locations:', e); return []; }),
          tasksService.getAll().catch(e => { console.error('❌ Error cargando tasks:', e); return []; }),
          inventoryService.getAll().catch(e => { console.error('❌ Error cargando inventory:', e); return []; }),
          formulasService.getAll().catch(e => { console.error('❌ Error cargando formulas:', e); return []; }),
          equipmentService.getAll().catch(e => { console.error('❌ Error cargando equipment:', e); return []; }),
          expensesService.getAll().catch(e => { console.error('❌ Error cargando expenses:', e); return []; }),
          pnoProceduresService.getAll().catch(e => { console.error('❌ Error cargando PNO:', e); return []; }),
          infographicsService.getAll().catch(e => { console.error('❌ Error cargando infographics:', e); return []; }),
          motherPlantsService.getAll().catch(e => { console.error('❌ Error cargando mother plants:', e); return []; }),
          cropsService.getAll().catch(e => { console.error('❌ Error cargando crops:', e); return []; }),
          plantBatchesService.getAll().catch(e => { console.error('❌ Error cargando batches:', e); return []; }),
          trimmingSessionsService.getAll().catch(e => { console.error('❌ Error cargando trimming:', e); return []; }),
          maintenanceLogsService.getAll().catch(e => { console.error('❌ Error cargando maintenance:', e); return []; }),
          notificationsService.getAll().catch(e => { console.error('❌ Error cargando notifications:', e); return []; }),
          announcementsService.getAll().catch(e => { console.error('❌ Error cargando announcements:', e); return []; })
        ]);

        setGenetics(geneticsData as Genetics[]);
        setLocations(locationsData);
        setTasks(tasksData as Task[]);
        setInventory(inventoryData as InventoryItem[]);
        setFormulas(formulasData as Formula[]);
        setEquipment(equipmentData as Equipment[]);
        setExpenses(expensesData as Expense[]);
        setPnoProcedures(pnoData as PnoProcedure[]);
        setInfographics(infographicsData as Infographic[]);
        setMotherPlants(motherPlantsData as MotherPlant[]);
        setAllCrops(cropsData as Crop[]);
        setPlantBatches(batchesData as PlantBatch[]);
        setTrimmingSessions(trimmingData as TrimmingSession[]);
        setMaintenanceLogs(maintenanceData as MaintenanceLog[]);
        setNotifications(notificationsData as Notification[]);
        setAnnouncements(announcementsData as Announcement[]);
        
        console.log('✅ Datos del sistema cargados');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      }
    }

    loadUserData();
  }, [loggedInUser]);

  const currentUser = useMemo(() => {
    if (simulatedUserId) {
      return users.find(u => u.id === simulatedUserId) || loggedInUser;
    }
    return loggedInUser;
  }, [loggedInUser, simulatedUserId, users]);

  const login = async (username: string, password: string): Promise<User | null> => {
    const authUser = await authService.login(username, password);
    if (authUser) {
      const user: User = {
        id: authUser.id,
        username: authUser.username,
        password: '',
        roles: authUser.roles,
        locationId: authUser.locationId,
        maintenanceLocationIds: authUser.maintenanceLocationIds,
        permissions: authUser.permissions
      };
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
    setActiveRole(null);
    setActiveCropId(null);
    setActiveBatchId(null);
    setActiveMotherPlantId(null);
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    roles: UserRole[];
    locationId?: string;
    maintenanceLocationIds?: string[];
    permissions: { [key in AppPermission]?: boolean };
  }): Promise<User | null> => {
    if (!loggedInUser?.id) {
      console.error('No logged in user');
      return null;
    }
    const newUser = await apiService.createUser(userData, loggedInUser.id);
    if (newUser) {
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
    return null;
  };

  const deleteUser = async (userId: string) => {
    if (loggedInUser?.id === userId) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }
    if (!loggedInUser?.id) {
      console.error('No logged in user');
      return;
    }
    if (simulatedUserId === userId) {
      setSimulatedUserId(null);
      setActiveRole(null);
    }
    const success = await apiService.deleteUser(userId, loggedInUser.id);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const saveUser = async (user: User): Promise<boolean> => {
    if (!loggedInUser?.id) {
      console.error('No logged in user');
      return false;
    }
    
    const updatedUser = await apiService.updateUser(user.id, {
      username: user.username,
      password: user.password,
      roles: user.roles,
      locationId: user.locationId,
      maintenanceLocationIds: user.maintenanceLocationIds,
      permissions: user.permissions
    }, loggedInUser.id);
    
    if (updatedUser) {
      setUsers(prev => {
        const index = prev.findIndex(u => u.id === user.id);
        if (index > -1) {
          const newUsers = [...prev];
          newUsers[index] = updatedUser;
          return newUsers;
        }
        return [...prev, updatedUser];
      });
      return true;
    }
    return false;
  };

  const createSaveFunction = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    service: any
  ) => async (item: T) => {
    const result = await service.upsert(item);
    if (result) {
      setter(prev => {
        const index = prev.findIndex(i => i.id === item.id);
        if (index > -1) {
          const newItems = [...prev];
          newItems[index] = result;
          return newItems;
        }
        return [...prev, result];
      });
    }
  };

  const createDeleteFunction = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    service: any
  ) => async (id: string) => {
    const success = await service.delete(id);
    if (success) {
      setter(prev => prev.filter(i => i.id !== id));
    }
    return success;
  };

  const saveGenetic = createSaveFunction(setGenetics, geneticsService);
  const deleteGenetic = (id: string) => createDeleteFunction(setGenetics, geneticsService)(id);

  const saveLocation = createSaveFunction(setLocations, locationsService);
  const deleteLocation = (id: string) => createDeleteFunction(setLocations, locationsService)(id);

  const saveMotherPlant = createSaveFunction(setMotherPlants, motherPlantsService);
  const deleteMotherPlant = (id: string) => createDeleteFunction(setMotherPlants, motherPlantsService)(id);

  const saveCrop = createSaveFunction(setAllCrops, cropsService);
  const deleteCrop = (id: string) => createDeleteFunction(setAllCrops, cropsService)(id);
  
  const savePlantBatch = createSaveFunction(setPlantBatches, plantBatchesService);
  const deletePlantBatch = (id: string) => createDeleteFunction(setPlantBatches, plantBatchesService)(id);

  const saveTask = createSaveFunction(setTasks, tasksService);
  const deleteTask = (id: string) => createDeleteFunction(setTasks, tasksService)(id);

  const saveInventoryItem = createSaveFunction(setInventory, inventoryService);
  const deleteInventoryItem = (id: string) => createDeleteFunction(setInventory, inventoryService)(id);

  const saveEquipment = createSaveFunction(setEquipment, equipmentService);
  const deleteEquipment = (id: string) => createDeleteFunction(setEquipment, equipmentService)(id);

  const saveTrimmingSession = createSaveFunction(setTrimmingSessions, trimmingSessionsService);

  const saveFormula = createSaveFunction(setFormulas, formulasService);
  const deleteFormula = (id: string) => createDeleteFunction(setFormulas, formulasService)(id);

  const saveExpense = createSaveFunction(setExpenses, expensesService);
  const deleteExpense = (id: string) => createDeleteFunction(setExpenses, expensesService)(id);

  const savePnoProcedure = createSaveFunction(setPnoProcedures, pnoProceduresService);
  const deletePnoProcedure = (id: string) => createDeleteFunction(setPnoProcedures, pnoProceduresService)(id);

  const saveInfographic = createSaveFunction(setInfographics, infographicsService);
  const deleteInfographic = (id: string) => createDeleteFunction(setInfographics, infographicsService)(id);

  const activeCrop = useMemo(() => allCrops.find(c => c.id === activeCropId) || null, [allCrops, activeCropId]);
  const activeBatch = useMemo(() => plantBatches.find(b => b.id === activeBatchId) || null, [plantBatches, activeBatchId]);
  const activeMotherPlant = useMemo(() => motherPlants.find(m => m.id === activeMotherPlantId) || null, [motherPlants, activeMotherPlantId]);

  const archiveCrop = async (cropId: string) => {
    const crop = allCrops.find(c => c.id === cropId);
    if (crop) {
      await saveCrop({ ...crop, isArchived: true });
    }
  };

  const restoreCrop = async (cropId: string) => {
    const crop = allCrops.find(c => c.id === cropId);
    if (crop) {
      await saveCrop({ ...crop, isArchived: false });
    }
  };

  const archiveMotherPlant = async (plantId: string) => {
    const plant = motherPlants.find(p => p.id === plantId);
    if (plant) {
      await saveMotherPlant({ ...plant, isArchived: true });
    }
  };

  const restoreMotherPlant = async (plantId: string) => {
    const plant = motherPlants.find(p => p.id === plantId);
    if (plant) {
      await saveMotherPlant({ ...plant, isArchived: false });
    }
  };

  const saveLogForAllActiveMotherPlants = (logEntry: Omit<LogEntry, 'id'>) => {
    console.log('saveLogForAllActiveMotherPlants not yet implemented with Supabase');
  };

  const completeTaskForCrop = (taskId: string, cropId: string, userId: string) => {
    console.log('completeTaskForCrop not yet implemented with Supabase');
  };

  const completeMaintenanceTask = (task: Task, userId: string, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => {
    console.log('completeMaintenanceTask not yet implemented with Supabase');
  };

  const addPurchaseToItem = (itemId: string, purchaseQuantity: number, totalCost: number) => {
    console.log('addPurchaseToItem not yet implemented with Supabase');
  };

  const addNotification = useCallback(async (message: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      recipientId: currentUser?.id,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const result = await notificationsService.upsert(newNotification);
    if (result) {
      setNotifications(prev => [result as Notification, ...prev]);
    }
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      const result = await notificationsService.update(id, { read: true });
      if (result) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    }
  };

  const markAllAsRead = async () => {
    for (const notification of notifications.filter(n => !n.read)) {
      await notificationsService.update(notification.id, { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addAnnouncement = async (message: string, locationId?: string) => {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      locationId: locationId || undefined,
    };
    const result = await announcementsService.upsert(newAnnouncement);
    if (result) {
      setAnnouncements(prev => [result as Announcement, ...prev]);
    }
  };

  const markAnnouncementAsRead = async (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      const result = await announcementsService.update(id, { read: true });
      if (result) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
      }
    }
  };

  const unreadAnnouncementsCount = useMemo(() => announcements.filter(a =>
    !a.read &&
    (!a.locationId || a.locationId === currentUser?.locationId || currentUser?.locationId === 'TODAS')
  ).length, [announcements, currentUser]);

  const markAllAnnouncementsAsRead = async () => {
    for (const announcement of announcements.filter(a => !a.read)) {
      await announcementsService.update(announcement.id, { read: true });
    }
    setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
  };

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

  const exportFullBackup = () => {
    console.log('exportFullBackup not yet implemented');
  };

  const importFullBackup = (jsonData: string) => {
    console.log('importFullBackup not yet implemented');
  };

  const exportNewRecords = () => {
    console.log('exportNewRecords not yet implemented');
  };

  const importAndMergeRecords = (jsonData: string) => {
    console.log('importAndMergeRecords not yet implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      users,
      loggedInUser,
      currentUser,
      simulatedUserId,
      login,
      logout,
      createUser,
      deleteUser,
      saveUser,
      simulateUser,
      activeRole,
      setActiveRole,
      isLoading
    }}>
      <CropContext.Provider value={{
        allCrops,
        activeCropId,
        activeCrop,
        saveCrop,
        deleteCrop,
        setActiveCropId,
        archiveCrop,
        restoreCrop
      }}>
        <PlantBatchContext.Provider value={{
          plantBatches,
          activeBatchId,
          activeBatch,
          savePlantBatch,
          deletePlantBatch,
          setActiveBatchId
        }}>
          <MotherPlantContext.Provider value={{
            motherPlants,
            activeMotherPlantId,
            activeMotherPlant,
            saveMotherPlant,
            deleteMotherPlant,
            setActiveMotherPlantId,
            archiveMotherPlant,
            restoreMotherPlant,
            saveLogForAllActiveMotherPlants
          }}>
            <GeneticsContext.Provider value={{
              genetics,
              saveGenetic,
              deleteGenetic
            }}>
              <LocationContext.Provider value={{
                locations,
                saveLocation,
                deleteLocation
              }}>
                <TaskContext.Provider value={{
                  tasks,
                  saveTask,
                  deleteTask,
                  completeTaskForCrop,
                  completeMaintenanceTask
                }}>
                  <MaintenanceLogContext.Provider value={{ maintenanceLogs }}>
                    <InventoryContext.Provider value={{
                      inventory,
                      saveInventoryItem,
                      deleteInventoryItem,
                      addPurchaseToItem
                    }}>
                      <EquipmentContext.Provider value={{
                        equipment,
                        saveEquipment,
                        deleteEquipment
                      }}>
                        <TrimmingContext.Provider value={{
                          trimmingSessions,
                          saveTrimmingSession
                        }}>
                          <FormulaContext.Provider value={{
                            formulas,
                            formulaSchedule,
                            saveFormula,
                            deleteFormula
                          }}>
                            <ExpenseContext.Provider value={{
                              expenses,
                              saveExpense,
                              deleteExpense
                            }}>
                              <NotificationContext.Provider value={{
                                notifications,
                                addNotification,
                                markAsRead,
                                markAllAsRead,
                                unreadCount
                              }}>
                                <AnnouncementContext.Provider value={{
                                  announcements,
                                  addAnnouncement,
                                  markAnnouncementAsRead,
                                  markAllAsRead: markAllAnnouncementsAsRead,
                                  unreadCount: unreadAnnouncementsCount
                                }}>
                                  <ConfirmationContext.Provider value={{ showConfirmation }}>
                                    <AppDataContext.Provider value={{
                                      exportFullBackup,
                                      importFullBackup,
                                      exportNewRecords,
                                      importAndMergeRecords
                                    }}>
                                      <PnoContext.Provider value={{
                                        pnoProcedures,
                                        savePnoProcedure,
                                        deletePnoProcedure
                                      }}>
                                        <InfographicContext.Provider value={{
                                          infographics,
                                          saveInfographic,
                                          deleteInfographic
                                        }}>
                                          {children}
                                          {confirmation.isOpen && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                                <p className="text-text mb-6">{confirmation.message}</p>
                                                <div className="flex justify-end space-x-4">
                                                  <button
                                                    onClick={handleCancel}
                                                    className="px-4 py-2 border border-border-color rounded-md hover:bg-gray-100"
                                                  >
                                                    Cancelar
                                                  </button>
                                                  <button
                                                    onClick={handleConfirm}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                  >
                                                    Confirmar
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </InfographicContext.Provider>
                                      </PnoContext.Provider>
                                    </AppDataContext.Provider>
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
    </AuthContext.Provider>
  );
};
