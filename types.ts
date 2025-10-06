




export enum UserRole {
  GROWER = 'CULTIVADOR',
  ADMIN = 'ADMINISTRADOR',
  MAINTENANCE = 'MANTENIMIENTO',
  TRIMMER = 'TRIMEADOR',
}

export const APP_PERMISSIONS = {
  dashboard: 'Panel Principal',
  schedule: 'Cronograma de Cultivos',
  notifications: 'Notificaciones',
  batches: 'Gestión de Lotes',
  setup: 'Configurar Cultivo',
  log: 'Entrada de Registro',
  motherPlants: 'Plantas Madre',
  pnoLibrary: 'Biblioteca PNO',
  infographics: 'Infografías',
  aiDiagnosis: 'Diagnóstico IA',
  reports: 'Reportes',
  trimming: 'Trimeado',
  harvest: 'Cosecha',
  archive: 'Cultivos Archivados',
  maintenanceCalendar: 'Calendario de Mantenimiento',
  maintenanceReports: 'Reportes de Mantenimiento',
  expenses: 'Gastos',
  settings: 'Ajustes y Gestión',
};
export type AppPermission = keyof typeof APP_PERMISSIONS;


export interface User {
  id: string;
  username: string;
  password?: string; // Should be hashed in a real app
  roles: UserRole[];
  locationId?: string; // Main location ID (e.g., loc-ss)
  maintenanceLocationIds?: string[]; // e.g., ['loc-ss', 'loc-br'] or ['TODAS']
  permissions: { [key in AppPermission]?: boolean };
}

export enum CropStage {
  CLONING = 'Clonación',
  PRE_VEGETATION = 'Pre-vegetación',
  VEGETATION = 'Vegetación',
  FLOWERING = 'Floración',
  DRYING_CURING = 'Secado y Curado',
  HARVESTED = 'Cosechado',
}

export const STAGES = [
  CropStage.CLONING,
  CropStage.PRE_VEGETATION,
  CropStage.VEGETATION,
  CropStage.FLOWERING,
  CropStage.DRYING_CURING,
];

export interface Crop {
  id: string;
  // name: string; // Removed as per user request
  geneticsId: string;
  locationId: string; // This is the room/child location ID
  ownerId: string; // User ID
  cloningDate: string; // Replaces startDate, marks the absolute beginning
  preVegDate?: string;
  vegDate?: string;
  flowerDate?: string;
  dryingCuringDate?: string;
  harvestDate?: string;
  plantCounts: { batchId: string; count: number }[];
  logEntries: LogEntry[];
  harvestData?: HarvestData;
  lightHours: {
    veg: number;
    flower: number;
  };
  isArchived?: boolean;
}

export enum PlantBatchStatus {
    GERMINATION_ROOTING = 'Germinación/Enraizamiento',
    PRE_VEGETATION = 'Pre-vegetación',
    IN_USE = 'En Cultivo',
    DEPLETED = 'Agotado',
}

export interface PlantBatch {
  id: string; 
  name: string; 
  geneticsId: string;
  creationDate: string;
  initialPlantCount: number;
  rootedPlantCount?: number; // Renamed from finalPlantCount for clarity
  availablePlantCount: number; // For tracking available plants for new crops
  sourceLocationId: string; // e.g., 'room-ss1', 'mother-plant-1'
  type: 'seed' | 'clone';
  status: PlantBatchStatus;
  creatorId: string; // User ID
  logEntries: LogEntry[];
}

export interface MotherPlant {
  id: string;
  name: string; // e.g., "OG Kush Madre #1"
  geneticsId: string;
  locationId: string; // Room ID where it is located
  sowingDate: string; // ISO date string
  cloneCount: number; // Total clones taken from this plant
  logEntries: LogEntry[];
  isArchived?: boolean;
}

export interface SensorDataPoint {
    timestamp: string;
    temperature: number;
    humidity: number;
}

export interface LogEntry {
  id: string;
  date: string; // ISO Date string
  environmental?: {
    temp: number;
    humidity: number;
    vpd: number;
    co2: number;
    leafTemp?: number;
    ppfd?: number;
  };
  irrigation?: {
    type: 'nutrients' | 'supplements';
    ph: number;
    ppm: number;
    volume: number;
    phOut?: number;
    ppmOut?: number;
    cost?: number;
  };
  foliarSpray?: { name: string; dose: string }[];
  supplements?: { name: string; dose: string }[];
  notes?: string;
  plantHealth?: string[];
  photos?: string[]; // base64 string array
  completedTasks?: {
    taskId: string;
    taskTitle: string;
    completedBy: string; // User Username
    completedAt: string; // ISO Date string
  }[];
  sensorData?: SensorDataPoint[];
}

export interface HarvestData {
  geneticHarvests: {
    geneticsId: string;
    wetWeight: number; // Cosecha
    dryBranchWeight?: number; // Secado
    dryFlowerWeight?: number; // Secado (en bolsa)
    trimmedFlowerWeight?: number; // Trimeado (listo para curar)
    trimWasteWeight?: number; // Trimeado (desperdicio)
  }[];
  totalWetWeight: number;
  totalDryWeight: number; // Sum of dryFlowerWeight
  totalTrimWeight: number; // Sum of trimmedFlowerWeight
  totalTrimWaste?: number; // Sum of trimWasteWeight
  curingLog: { date: string; notes: string }[];
  lastBurpDate?: string;
}

export interface Location {
  id: string;
  name: string;
  ownerId?: string;
  parentId?: string;
  type?: 'ciclo completo' | 'VEGETACION' | 'FLORACION';
  lightOnTime?: string; // "HH:MM"
  lightOffTime?: string; // "HH:MM"
}

export interface Genetics {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export type InventoryCategory = 
  'Nutriente Base' | 
  'Suplemento/Bioestimulante' | 
  'Microorganismos/Biológicos' | 
  'Control de Plagas/Enfermedades' |
  'Herramientas y Equipo' |
  'Refacciones' |
  'Limpieza y Sanitización' |
  'Sustrato' |
  'Otro';

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'Nutriente Base',
  'Suplemento/Bioestimulante',
  'Microorganismos/Biológicos',
  'Control de Plagas/Enfermedades',
  'Sustrato',
  'Herramientas y Equipo',
  'Refacciones',
  'Limpieza y Sanitización',
  'Otro'
];

export type InventoryType = 'Cultivo' | 'Mantenimiento';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  inventoryType: InventoryType;
  unit: string; // The unit for tracking stock (e.g., g, ml)
  purchaseUnit?: string; // The unit for purchases (e.g., kg, L, saco, bloque)
  purchaseUnitConversion?: number; // Factor to convert purchase unit to stock unit (e.g., 1000 for kg to g)
  purchases: { date: string; quantity: number; totalCost: number }[]; // quantity is in the base 'unit'
  currentStock: number;
  locationId: string;
  averageCostPerUnit: number;
  description?: string;
  partNumber?: string;
  supplier?: string;
  minStockLevel?: number;
  reuseCount?: number;
}

export interface Formula {
  id: string;
  name: string;
  nutrients: { inventoryItemId: string; amountPerLiter: number }[];
  targetPPM?: number;
}

export interface FormulaSchedule {
  [stage: string]: {
    [week: number]: string; // Formula ID
  };
}

export interface Notification {
  id:string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  read: boolean;
  recipientId?: string; // for specific users
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  locationId: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    recurrenceType: 'daily' | 'weekly' | 'monthly' | 'single' | 'bimonthly' | 'quarterly' | 'semiannually';
    dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
    dayOfMonth?: number; // 1-31 (for monthly)
    date?: string; // For 'single'
    assigneeRoles: UserRole[];
    locationId: string;
    category?: 'HVAC' | 'Riego' | 'Iluminación' | 'Sensores' | 'General' | 'Ventilación';
    equipmentType?: string;
    requiredTools?: string[];
    requiredParts?: { inventoryItemId: string; quantity: number }[];
    sop?: {
        title: string;
        steps: string[];
    };
}

export interface MaintenanceLog {
  id: string;
  taskId: string;
  taskTitle: string; 
  userId: string;
  userUsername: string; 
  locationId: string;
  completedAt: string; // ISO Date string
  notes?: string;
  photoEvidence?: string; // base64 string
  partsUsed?: { inventoryItemId: string; quantity: number }[];
  equipmentId?: string;
}

export interface TrimmingSession {
    id: string;
    userId: string;
    userUsername: string;
    cropId: string;
    geneticsId: string; // Which genetic was trimmed
    date: string; // No need for start/end time, just the date of logging
    trimmedWeight: number; // manicured flower weight from this session
    trimWasteWeight: number; // weight of trim from this session
}


export interface Equipment {
    id: string;
    name: string;
    locationId: string; // main location id, e.g. loc-ss
    roomId?: string; // specific room if applicable
    category: 'HVAC' | 'Riego' | 'Iluminación' | 'Sensores' | 'General' | 'Ventilación';
    purchaseDate?: string;
    warrantyEndDate?: string;
    lifespanHours?: number;
}

export interface Announcement {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  locationId?: string;
}

export interface DiagnosisResult {
  diagnosis: string;
  overall_health_assessment: string;
  preventative_tips: string[];
}

export interface HarvestPrediction {
    yield_range: string;
    reasoning: string;
    confidence_level: string;
}

// --- PNO (Procedimiento Maestro de Cultivo) Types ---
export type PnoParameterRange = [number, number];

export interface PnoWeekParameters {
  tempDay: PnoParameterRange;
  tempNight: number;
  humidityDay: PnoParameterRange;
  humidityNight: PnoParameterRange;
  vpd: PnoParameterRange;
  co2: PnoParameterRange | 'Ambiente';
  ppfd: PnoParameterRange;
  ph: PnoParameterRange;
  ppm: number;
}

export type PnoParameters = {
  [stage in CropStage]?: {
    [week: number]: PnoWeekParameters;
  };
};

export interface PnoProcedure {
  id: string;
  title: string;
  sections: {
    title: string;
    content: string; // A single string, paragraphs separated by newlines
  }[];
}

export interface Infographic {
    id: string;
    title: string;
    pnoId?: string; // Optional link to a PNO
    htmlContent: {
        body: string;
        style: string;
    };
}