import { supabase } from './supabaseClient';
import type {
  Genetics, Location, MotherPlant, Crop, PlantBatch, Task,
  InventoryItem, Formula, FormulaSchedule, Equipment,
  TrimmingSession, Expense, PnoProcedure, Infographic,
  Notification, Announcement, MaintenanceLog
} from '../types';

type TableName =
  | 'genetics'
  | 'locations'
  | 'mother_plants'
  | 'crops'
  | 'plant_batches'
  | 'tasks'
  | 'inventory_items'
  | 'formulas'
  | 'formula_schedules'
  | 'equipment'
  | 'trimming_sessions'
  | 'expenses'
  | 'pno_procedures'
  | 'infographics'
  | 'notifications'
  | 'announcements'
  | 'maintenance_logs'
  | 'crop_plant_counts';

const COLUMN_MAPPINGS: Record<string, Record<string, string>> = {
  genetics: {
    id: 'id',
    name: 'name',
    type: 'type',
    thcContent: 'thc_content',
    cbdContent: 'cbd_content',
    floweringDays: 'flowering_days',
    description: 'description',
    image: 'image'
  },
  locations: {
    id: 'id',
    name: 'name',
    type: 'type',
    parentId: 'parent_id'
  },
  mother_plants: {
    id: 'id',
    name: 'name',
    geneticsId: 'genetics_id',
    locationId: 'location_id',
    sowingDate: 'sowing_date',
    cloneCount: 'clone_count',
    isArchived: 'is_archived',
    logEntries: 'log_entries'
  },
  crops: {
    id: 'id',
    geneticsId: 'genetics_id',
    locationId: 'location_id',
    ownerId: 'owner_id',
    cloningDate: 'cloning_date',
    preVegDate: 'pre_veg_date',
    vegDate: 'veg_date',
    flowerDate: 'flower_date',
    dryingCuringDate: 'drying_curing_date',
    harvestDate: 'harvest_date',
    lightHoursVeg: 'light_hours_veg',
    lightHoursFlower: 'light_hours_flower',
    isArchived: 'is_archived',
    harvestData: 'harvest_data',
    plantCounts: 'plant_counts',
    logEntries: 'log_entries'
  },
  plant_batches: {
    id: 'id',
    name: 'name',
    geneticsId: 'genetics_id',
    creationDate: 'creation_date',
    initialPlantCount: 'initial_plant_count',
    rootedPlantCount: 'rooted_plant_count',
    availablePlantCount: 'available_plant_count',
    sourceLocationId: 'source_location_id',
    type: 'type',
    status: 'status',
    creatorId: 'creator_id',
    motherPlantId: 'mother_plant_id',
    logEntries: 'log_entries'
  },
  tasks: {
    id: 'id',
    title: 'title',
    description: 'description',
    type: 'type',
    priority: 'priority',
    dueDate: 'due_date',
    assignedTo: 'assigned_to',
    cropId: 'crop_id',
    equipmentId: 'equipment_id',
    isCompleted: 'is_completed',
    recurring: 'recurring',
    dayOfWeek: 'day_of_week'
  },
  inventory_items: {
    id: 'id',
    name: 'name',
    category: 'category',
    currentStock: 'quantity',
    unit: 'unit',
    averageCostPerUnit: 'cost_per_unit',
    supplier: 'supplier',
    purchaseHistory: 'purchase_history'
  },
  formulas: {
    id: 'id',
    name: 'name',
    type: 'type',
    nutrients: 'nutrients',
    ec: 'ec',
    ph: 'ph',
    notes: 'notes'
  },
  equipment: {
    id: 'id',
    name: 'name',
    type: 'type',
    locationId: 'location_id',
    brand: 'brand',
    model: 'model',
    serialNumber: 'serial_number',
    purchaseDate: 'purchase_date',
    lastMaintenanceDate: 'last_maintenance_date',
    maintenanceFrequencyDays: 'maintenance_frequency_days',
    status: 'status',
    notes: 'notes'
  },
  trimming_sessions: {
    id: 'id',
    cropId: 'crop_id',
    date: 'date',
    trimmerIds: 'trimmer_ids',
    wetWeight: 'wet_weight',
    processedWeight: 'processed_weight',
    durationHours: 'duration_hours',
    notes: 'notes'
  },
  expenses: {
    id: 'id',
    date: 'date',
    category: 'category',
    description: 'description',
    amount: 'amount',
    locationId: 'location_id',
    createdBy: 'created_by'
  },
  pno_procedures: {
    id: 'id',
    title: 'title',
    description: 'description',
    category: 'category',
    version: 'version',
    content: 'content',
    attachments: 'attachments',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  infographics: {
    id: 'id',
    title: 'title',
    description: 'description',
    type: 'type',
    data: 'data',
    createdAt: 'created_at'
  },
  notifications: {
    id: 'id',
    userId: 'user_id',
    message: 'message',
    type: 'type',
    read: 'read',
    createdAt: 'created_at'
  },
  announcements: {
    id: 'id',
    message: 'message',
    locationId: 'location_id',
    read: 'read',
    createdAt: 'created_at'
  },
  maintenance_logs: {
    id: 'id',
    equipmentId: 'equipment_id',
    date: 'date',
    type: 'type',
    description: 'description',
    cost: 'cost',
    performedBy: 'performed_by'
  }
};

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeysToDb<T>(obj: T, tableName: string): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapping = COLUMN_MAPPINGS[tableName] || {};
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const dbKey = mapping[key] || camelToSnake(key);
    result[dbKey] = value;
  }
  
  return result;
}

function mapKeysFromDb<T>(obj: any, tableName: string): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapping = COLUMN_MAPPINGS[tableName] || {};
  const reverseMapping: Record<string, string> = {};
  for (const [camelKey, dbKey] of Object.entries(mapping)) {
    reverseMapping[dbKey] = camelKey;
  }
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = reverseMapping[key] || snakeToCamel(key);
    result[camelKey] = value;
  }
  
  return result as T;
}

export async function fetchAll<T>(tableName: TableName): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }

    return (data || []).map((item: any) => mapKeysFromDb<T>(item, tableName));
  } catch (error) {
    console.error(`Fetch all ${tableName} error:`, error);
    return [];
  }
}

export async function fetchById<T>(tableName: TableName, id: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching ${tableName} by id:`, error);
      return null;
    }

    return data ? mapKeysFromDb<T>(data, tableName) : null;
  } catch (error) {
    console.error(`Fetch ${tableName} by id error:`, error);
    return null;
  }
}

export async function create<T extends { id: string }>(
  tableName: TableName,
  item: Omit<T, 'id'>
): Promise<T | null> {
  try {
    const dbItem = mapKeysToDb(item, tableName);
    
    const { data, error } = await supabase
      .from(tableName)
      .insert(dbItem)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${tableName}:`, error);
      return null;
    }

    return data ? mapKeysFromDb<T>(data, tableName) : null;
  } catch (error) {
    console.error(`Create ${tableName} error:`, error);
    return null;
  }
}

export async function update<T extends { id: string }>(
  tableName: TableName,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  try {
    const dbUpdates = mapKeysToDb(updates, tableName);
    delete dbUpdates.id;

    const { data, error } = await supabase
      .from(tableName)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      return null;
    }

    return data ? mapKeysFromDb<T>(data, tableName) : null;
  } catch (error) {
    console.error(`Update ${tableName} error:`, error);
    return null;
  }
}

export async function upsert<T extends { id: string }>(
  tableName: TableName,
  item: T
): Promise<T | null> {
  try {
    const dbItem = mapKeysToDb(item, tableName);

    const { data, error } = await supabase
      .from(tableName)
      .upsert(dbItem)
      .select()
      .single();

    if (error) {
      console.error(`Error upserting ${tableName}:`, error);
      return null;
    }

    return data ? mapKeysFromDb<T>(data, tableName) : null;
  } catch (error) {
    console.error(`Upsert ${tableName} error:`, error);
    return null;
  }
}

export async function remove(tableName: TableName, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${tableName}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Delete ${tableName} error:`, error);
    return false;
  }
}

export const geneticsService = {
  getAll: () => fetchAll<Genetics>('genetics'),
  getById: (id: string) => fetchById<Genetics>('genetics', id),
  create: (item: Omit<Genetics, 'id'>) => create<Genetics>('genetics', item),
  update: (id: string, updates: Partial<Genetics>) => update<Genetics>('genetics', id, updates),
  upsert: (item: Genetics) => upsert<Genetics>('genetics', item),
  delete: (id: string) => remove('genetics', id)
};

export const locationsService = {
  getAll: () => fetchAll<Location>('locations'),
  getById: (id: string) => fetchById<Location>('locations', id),
  create: (item: Omit<Location, 'id'>) => create<Location>('locations', item),
  update: (id: string, updates: Partial<Location>) => update<Location>('locations', id, updates),
  upsert: (item: Location) => upsert<Location>('locations', item),
  delete: (id: string) => remove('locations', id)
};

export const motherPlantsService = {
  getAll: () => fetchAll<MotherPlant>('mother_plants'),
  getById: (id: string) => fetchById<MotherPlant>('mother_plants', id),
  create: (item: Omit<MotherPlant, 'id'>) => create<MotherPlant>('mother_plants', item),
  update: (id: string, updates: Partial<MotherPlant>) => update<MotherPlant>('mother_plants', id, updates),
  upsert: (item: MotherPlant) => upsert<MotherPlant>('mother_plants', item),
  delete: (id: string) => remove('mother_plants', id)
};

export const cropsService = {
  getAll: () => fetchAll<Crop>('crops'),
  getById: (id: string) => fetchById<Crop>('crops', id),
  create: (item: Omit<Crop, 'id'>) => create<Crop>('crops', item),
  update: (id: string, updates: Partial<Crop>) => update<Crop>('crops', id, updates),
  upsert: (item: Crop) => upsert<Crop>('crops', item),
  delete: (id: string) => remove('crops', id)
};

export const plantBatchesService = {
  getAll: () => fetchAll<PlantBatch>('plant_batches'),
  getById: (id: string) => fetchById<PlantBatch>('plant_batches', id),
  create: (item: Omit<PlantBatch, 'id'>) => create<PlantBatch>('plant_batches', item),
  update: (id: string, updates: Partial<PlantBatch>) => update<PlantBatch>('plant_batches', id, updates),
  upsert: (item: PlantBatch) => upsert<PlantBatch>('plant_batches', item),
  delete: (id: string) => remove('plant_batches', id)
};

export const tasksService = {
  getAll: () => fetchAll<Task>('tasks'),
  getById: (id: string) => fetchById<Task>('tasks', id),
  create: (item: Omit<Task, 'id'>) => create<Task>('tasks', item),
  update: (id: string, updates: Partial<Task>) => update<Task>('tasks', id, updates),
  upsert: (item: Task) => upsert<Task>('tasks', item),
  delete: (id: string) => remove('tasks', id)
};

export const inventoryService = {
  getAll: () => fetchAll<InventoryItem>('inventory_items'),
  getById: (id: string) => fetchById<InventoryItem>('inventory_items', id),
  create: (item: Omit<InventoryItem, 'id'>) => create<InventoryItem>('inventory_items', item),
  update: (id: string, updates: Partial<InventoryItem>) => update<InventoryItem>('inventory_items', id, updates),
  upsert: (item: InventoryItem) => upsert<InventoryItem>('inventory_items', item),
  delete: (id: string) => remove('inventory_items', id)
};

export const formulasService = {
  getAll: () => fetchAll<Formula>('formulas'),
  getById: (id: string) => fetchById<Formula>('formulas', id),
  create: (item: Omit<Formula, 'id'>) => create<Formula>('formulas', item),
  update: (id: string, updates: Partial<Formula>) => update<Formula>('formulas', id, updates),
  upsert: (item: Formula) => upsert<Formula>('formulas', item),
  delete: (id: string) => remove('formulas', id)
};

export const equipmentService = {
  getAll: () => fetchAll<Equipment>('equipment'),
  getById: (id: string) => fetchById<Equipment>('equipment', id),
  create: (item: Omit<Equipment, 'id'>) => create<Equipment>('equipment', item),
  update: (id: string, updates: Partial<Equipment>) => update<Equipment>('equipment', id, updates),
  upsert: (item: Equipment) => upsert<Equipment>('equipment', item),
  delete: (id: string) => remove('equipment', id)
};

export const trimmingSessionsService = {
  getAll: () => fetchAll<TrimmingSession>('trimming_sessions'),
  getById: (id: string) => fetchById<TrimmingSession>('trimming_sessions', id),
  create: (item: Omit<TrimmingSession, 'id'>) => create<TrimmingSession>('trimming_sessions', item),
  update: (id: string, updates: Partial<TrimmingSession>) => update<TrimmingSession>('trimming_sessions', id, updates),
  upsert: (item: TrimmingSession) => upsert<TrimmingSession>('trimming_sessions', item),
  delete: (id: string) => remove('trimming_sessions', id)
};

export const expensesService = {
  getAll: () => fetchAll<Expense>('expenses'),
  getById: (id: string) => fetchById<Expense>('expenses', id),
  create: (item: Omit<Expense, 'id'>) => create<Expense>('expenses', item),
  update: (id: string, updates: Partial<Expense>) => update<Expense>('expenses', id, updates),
  upsert: (item: Expense) => upsert<Expense>('expenses', item),
  delete: (id: string) => remove('expenses', id)
};

export const pnoProceduresService = {
  getAll: () => fetchAll<PnoProcedure>('pno_procedures'),
  getById: (id: string) => fetchById<PnoProcedure>('pno_procedures', id),
  create: (item: Omit<PnoProcedure, 'id'>) => create<PnoProcedure>('pno_procedures', item),
  update: (id: string, updates: Partial<PnoProcedure>) => update<PnoProcedure>('pno_procedures', id, updates),
  upsert: (item: PnoProcedure) => upsert<PnoProcedure>('pno_procedures', item),
  delete: (id: string) => remove('pno_procedures', id)
};

export const infographicsService = {
  getAll: () => fetchAll<Infographic>('infographics'),
  getById: (id: string) => fetchById<Infographic>('infographics', id),
  create: (item: Omit<Infographic, 'id'>) => create<Infographic>('infographics', item),
  update: (id: string, updates: Partial<Infographic>) => update<Infographic>('infographics', id, updates),
  upsert: (item: Infographic) => upsert<Infographic>('infographics', item),
  delete: (id: string) => remove('infographics', id)
};

export const notificationsService = {
  getAll: () => fetchAll<Notification>('notifications'),
  getById: (id: string) => fetchById<Notification>('notifications', id),
  create: (item: Omit<Notification, 'id'>) => create<Notification>('notifications', item),
  update: (id: string, updates: Partial<Notification>) => update<Notification>('notifications', id, updates),
  upsert: (item: Notification) => upsert<Notification>('notifications', item),
  delete: (id: string) => remove('notifications', id)
};

export const announcementsService = {
  getAll: () => fetchAll<Announcement>('announcements'),
  getById: (id: string) => fetchById<Announcement>('announcements', id),
  create: (item: Omit<Announcement, 'id'>) => create<Announcement>('announcements', item),
  update: (id: string, updates: Partial<Announcement>) => update<Announcement>('announcements', id, updates),
  upsert: (item: Announcement) => upsert<Announcement>('announcements', item),
  delete: (id: string) => remove('announcements', id)
};

export const maintenanceLogsService = {
  getAll: () => fetchAll<MaintenanceLog>('maintenance_logs'),
  getById: (id: string) => fetchById<MaintenanceLog>('maintenance_logs', id),
  create: (item: Omit<MaintenanceLog, 'id'>) => create<MaintenanceLog>('maintenance_logs', item),
  update: (id: string, updates: Partial<MaintenanceLog>) => update<MaintenanceLog>('maintenance_logs', id, updates),
  upsert: (item: MaintenanceLog) => upsert<MaintenanceLog>('maintenance_logs', item),
  delete: (id: string) => remove('maintenance_logs', id)
};
