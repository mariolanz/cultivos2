import { User, UserRole, Crop, CropStage, Genetics, Location, PlantBatch, LogEntry, Formula, FormulaSchedule, InventoryItem, PlantBatchStatus, Task, Expense, InventoryCategory, MotherPlant, TrimmingSession, Equipment, PnoParameters, PnoProcedure, Infographic } from './types';

const growerPermissions = {
  dashboard: true, schedule: true, notifications: true, batches: true, setup: true, log: true,
  motherPlants: true, pnoLibrary: true, infographics: true, aiDiagnosis: true, reports: true,
  harvest: true, archive: true, settings: true
};
const trimmerPermissions = {
  dashboard: true, trimming: true, harvest: true, settings: true
};
const maintenancePermissions = {
  maintenanceCalendar: true, maintenanceReports: true, expenses: true, settings: true
};
const adminPermissions = {
  dashboard: true, schedule: true, notifications: true, batches: true, setup: true, log: true,
  motherPlants: true, pnoLibrary: true, infographics: true, aiDiagnosis: true, reports: true,
  trimming: true, harvest: true, archive: true, maintenanceCalendar: true,
  maintenanceReports: true, expenses: true, settings: true
};


export const USERS: User[] = [
  { id: 'user-luis-b', username: 'LUIS B', password: 'LUBBana420', roles: [UserRole.ADMIN, UserRole.GROWER], locationId: 'TODAS', permissions: adminPermissions },
  { id: 'user-lumza', username: 'LUMZA', password: 'LZBana420', roles: [UserRole.GROWER], locationId: 'loc-mc', permissions: growerPermissions },
  { id: 'user-luis-t', username: 'LUIS T', password: 'LUBana420', roles: [UserRole.GROWER], locationId: 'loc-mc', permissions: growerPermissions },
  { id: 'user-fermin', username: 'FERMIN', password: 'FEBana420', roles: [UserRole.GROWER], locationId: 'loc-ll', permissions: growerPermissions },
  { id: 'user-cristian', username: 'CRISTIAN', password: 'CRBana420', roles: [UserRole.GROWER, UserRole.MAINTENANCE], locationId: 'loc-ll', maintenanceLocationIds: ['TODAS'], permissions: {...growerPermissions, ...maintenancePermissions} },
  { id: 'user-tomy', username: 'TOMY', password: 'TOBana420', roles: [UserRole.GROWER, UserRole.TRIMMER], locationId: 'loc-ll', permissions: {...growerPermissions, ...trimmerPermissions} },
  { id: 'user-dayana', username: 'DAYANA', password: 'DABana420', roles: [UserRole.GROWER], locationId: 'loc-ss', permissions: growerPermissions },
  { id: 'user-arturo', username: 'ARTURO', password: 'ARBana420', roles: [UserRole.GROWER, UserRole.MAINTENANCE], locationId: 'loc-ss', maintenanceLocationIds: ['loc-ss'], permissions: {...growerPermissions, ...maintenancePermissions} },
  { id: 'user-eduardo', username: 'EDUARDO', password: 'EDBana420', roles: [UserRole.GROWER], locationId: 'loc-br', permissions: growerPermissions },
  { id: 'user-gustavo', username: 'GUSTAVO', password: 'GUBana420', roles: [UserRole.GROWER], locationId: 'loc-br', permissions: growerPermissions },
  { id: 'user-paco', username: 'PACO', password: 'PABana420', roles: [UserRole.GROWER], locationId: 'loc-br', permissions: growerPermissions },
  { id: 'user-deysi', username: 'DEYSI', password: 'DEBana420', roles: [UserRole.TRIMMER, UserRole.MAINTENANCE], locationId: 'TODAS', maintenanceLocationIds: ['TODAS'], permissions: {...trimmerPermissions, ...maintenancePermissions} },
  { id: 'user-sebastian', username: 'SEBASTIAN', password: 'SEBana420', roles: [UserRole.TRIMMER, UserRole.MAINTENANCE], locationId: 'TODAS', maintenanceLocationIds: ['TODAS'], permissions: {...trimmerPermissions, ...maintenancePermissions} },
];

export const GENETICS: Genetics[] = [
  { id: 'gen-1', name: 'Bannana punch', code: 'B' },
  { id: 'gen-28', name: 'Banna x BL', code: 'BXBL' },
  { id: 'gen-2', name: 'Bloodsport', code: 'BS' },
  { id: 'gen-3', name: 'Big detroit energy', code: 'BDE' },
  { id: 'gen-4', name: 'Cali cookies', code: 'CC' },
  { id: 'gen-5', name: 'Champaña', code: 'CH' },
  { id: 'gen-6', name: 'Candy Store Rbx', code: 'CS' },
  { id: 'gen-7', name: 'Divoce Cake', code: 'DC' },
  { id: 'gen-8', name: 'End Game', code: 'EG' },
  { id: 'gen-9', name: 'Forbiben apple', code: 'FA' },
  { id: 'gen-10', name: 'Gelato', code: 'G' },
  { id: 'gen-11', name: 'GMO x Zoobie Kush', code: 'GMO' },
  { id: 'gen-12', name: 'Hindu kush', code: 'HK' },
  { id: 'gen-13', name: 'Jelly Breath', code: 'JB' },
  { id: 'gen-14', name: 'Kit pampoe', code: 'KP' },
  { id: 'gen-15', name: 'Lemon berry candy', code: 'LBC' },
  { id: 'gen-16', name: 'Limonada mango', code: 'LM' },
  { id: 'gen-17', name: 'Lemon up', code: 'LU' },
  { id: 'gen-29', name: 'Mango', code: 'MG' },
  { id: 'gen-18', name: 'Nanamichi', code: 'NN' },
  { id: 'gen-19', name: 'Purple Zkittlez', code: 'PZ' },
  { id: 'gen-20', name: 'Rufius', code: 'R' },
  { id: 'gen-21', name: 'Red whine runtz', code: 'RWR' },
  { id: 'gen-22', name: 'Strowberry candy', code: 'SBC' },
  { id: 'gen-23', name: 'Strawberry OG Cookies', code: 'SBOG' },
  { id: 'gen-24', name: 'Slammichi', code: 'SLAM' },
  { id: 'gen-25', name: 'Sugar michi', code: 'SU' },
  { id: 'gen-26', name: 'White fire', code: 'WF' },
  { id: 'gen-27', name: 'VHO', code: 'VHO' },
  { id: 'gen-30', name: 'Limonada mango', code: 'SLM' },
];

export const LOCATIONS: Location[] = [
    // Main Locations
    { id: 'loc-mc', name: 'MC' },
    { id: 'loc-ll', name: 'LL' },
    { id: 'loc-ss', name: 'SS' },
    { id: 'loc-br', name: 'BR' },
    
    // Rooms for MC
    { id: 'room-mcprev', name: 'MCPREV', parentId: 'loc-mc', type: 'VEGETACION', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-mc-madres', name: 'MC PLANTAS MADRE', parentId: 'loc-mc', type: 'VEGETACION', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-mc1', name: 'MC1', parentId: 'loc-mc', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-mc2', name: 'MC2', parentId: 'loc-mc', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-mc3', name: 'MC3', parentId: 'loc-mc', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-mc4', name: 'MC4', parentId: 'loc-mc', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-mc5', name: 'MC5', parentId: 'loc-mc', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '23:50' },

    // Rooms for LL
    { id: 'room-llveg', name: 'LLVEG', parentId: 'loc-ll', type: 'VEGETACION', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-llprev', name: 'LLPREV', parentId: 'loc-ll', type: 'VEGETACION', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-ll-madres', name: 'LL PLANTAS MADRE', parentId: 'loc-ll', type: 'VEGETACION', lightOnTime: '06:00', lightOffTime: '23:50' },
    { id: 'room-ll1', name: 'LL1', parentId: 'loc-ll', type: 'FLORACION', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-ll2', name: 'LL2', parentId: 'loc-ll', type: 'FLORACION', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-ll3', name: 'LL3', parentId: 'loc-ll', type: 'FLORACION', lightOnTime: '06:00', lightOffTime: '18:00' },
    
    // Rooms for SS
    { id: 'room-ss1', name: 'SS1', parentId: 'loc-ss', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-ss2', name: 'SS2', parentId: 'loc-ss', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    
    // Rooms for BR
    { id: 'room-br1', name: 'BR1', parentId: 'loc-br', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-br2', name: 'BR2', parentId: 'loc-br', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-br3', name: 'BR3', parentId: 'loc-br', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-br4', name: 'BR4', parentId: 'loc-br', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
    { id: 'room-br5', name: 'BR5', parentId: 'loc-br', type: 'ciclo completo', lightOnTime: '06:00', lightOffTime: '18:00' },
];

export const ROOM_LAMP_CONFIG: { [roomId: string]: number } = {
    'room-br1': 14,
    'room-br2': 14,
    'room-br3': 4,
    'room-br4': 6,
    'room-br5': 6,
    'room-ll1': 8,
    'room-ll2': 8,
    'room-ll3': 8,
    'room-ss1': 16,
    'room-ss2': 16,
    'room-mc1': 16,
    'room-mc2': 8,
    'room-mc3': 8,
    'room-mc4': 8,
    'room-mc5': 4,
};

export const MOTHER_PLANTS: MotherPlant[] = [
  // MC Plants
  { id: 'mp-b-mc-1', name: 'B #1 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-2', name: 'B #2 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-3', name: 'B #3 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-4', name: 'B #4 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-bs-mc-1', name: 'BS #1 (MC)', geneticsId: 'gen-2', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-fa-mc-1', name: 'FA #1 (MC)', geneticsId: 'gen-9', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-fa-mc-2', name: 'FA #2 (MC)', geneticsId: 'gen-9', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-1', name: 'HK #1 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-2', name: 'HK #2 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-3', name: 'HK #3 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-jb-mc-1', name: 'JB #1 (MC)', geneticsId: 'gen-13', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-jb-mc-2', name: 'JB #2 (MC)', geneticsId: 'gen-13', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lbc-mc-1', name: 'LBC #1 (MC)', geneticsId: 'gen-15', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lbc-mc-2', name: 'LBC #2 (MC)', geneticsId: 'gen-15', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lu-mc-1', name: 'LU #1 (MC)', geneticsId: 'gen-17', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-1', name: 'NN #1 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-2', name: 'NN #2 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-3', name: 'NN #3 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-pz-mc-1', name: 'PZ #1 (MC)', geneticsId: 'gen-19', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-pz-mc-2', name: 'PZ #2 (MC)', geneticsId: 'gen-19', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-r-mc-1', name: 'R #1 (MC)', geneticsId: 'gen-20', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-r-mc-2', name: 'R #2 (MC)', geneticsId: 'gen-20', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-sbog-mc-1', name: 'SBOG #1 (MC)', geneticsId: 'gen-23', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-su-mc-1', name: 'SU #1 (MC)', geneticsId: 'gen-25', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-su-mc-2', name: 'SU #2 (MC)', geneticsId: 'gen-25', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-vho-mc-1', name: 'VHO #1 (MC)', geneticsId: 'gen-27', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-vho-mc-2', name: 'VHO #2 (MC)', geneticsId: 'gen-27', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-wf-mc-1', name: 'WF #1 (MC)', geneticsId: 'gen-26', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-wf-mc-2', name: 'WF #2 (MC)', geneticsId: 'gen-26', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  // LL Plants
  { id: 'mp-hk-ll-1', name: 'HK #1 (LL)', geneticsId: 'gen-12', locationId: 'room-ll-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
];

export const PLANT_BATCHES: PlantBatch[] = [
    { id: 'KP-250922C-LUB', name: 'KP Clones 2025-09-22', geneticsId: 'gen-14', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'BXBL-250922C-LUB', name: 'BXBL Clones 2025-09-22', geneticsId: 'gen-28', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'SU-250922C-LUB', name: 'SU Clones 2025-09-22', geneticsId: 'gen-25', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 76, availablePlantCount: 76, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'B-250922C-LUB', name: 'B Clones 2025-09-22', geneticsId: 'gen-1', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 35, availablePlantCount: 35, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'SBOG-250922C-LUB', name: 'SBOG Clones 2025-09-22', geneticsId: 'gen-23', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 67, availablePlantCount: 67, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'NN-250915C-GU', name: 'NN Clones 2025-09-15', geneticsId: 'gen-18', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 190, availablePlantCount: 190, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] },
    { id: 'CH-250915C-GU', name: 'CH Clones 2025-09-15', geneticsId: 'gen-5', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] },
    { id: 'SBOG-250915C-GU', name: 'SBOG Clones 2025-09-15', geneticsId: 'gen-23', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 152, availablePlantCount: 152, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] }
];

export const CROPS: Crop[] = [
    // BR Location - CORRECTED
    { id: 'crop-br1-1', geneticsId: 'gen-23', locationId: 'room-br1', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 42 }, { batchId: 'NN-250714C-LU', count: 2 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br2-1', geneticsId: 'gen-23', locationId: 'room-br2', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-18T06:00:00.000Z', flowerDate: '2025-09-08T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 43 }, { batchId: 'NN-250714C-LU', count: 13 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br3-1', geneticsId: 'gen-6', locationId: 'room-br3', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 4 }, { batchId: 'CS-250714C-LU', count: 11 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br4-1', geneticsId: 'gen-5', locationId: 'room-br4', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 5 }, { batchId: 'CH-250714C-LU', count: 19 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br5-1', geneticsId: 'gen-23', locationId: 'room-br5', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 12 }, { batchId: 'CH-250714C-LU', count: 11 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // MC Location - CORRECTED
    { id: 'crop-mcprev-1', geneticsId: 'gen-1', locationId: 'room-mcprev', ownerId: 'user-lumza', cloningDate: '2025-08-25T06:00:00.000Z', preVegDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'B-250825C-LU', count: 41 }, { batchId: 'FA-250825C-LU', count: 6 }, { batchId: 'LBC-250825C-LU', count: 10 }, { batchId: 'NN-250825C-LU', count: 20 }, { batchId: 'PZ-250825C-LU', count: 25 }, { batchId: 'R-250825C-LU', count: 8 }, { batchId: 'SBOG-250825C-LU', count: 14 }, { batchId: 'SLAM-250825C-LU', count: 16 }, { batchId: 'SU-250825C-LU', count: 15 }, { batchId: 'VHO-250825C-LU', count: 22 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-mc1-1', geneticsId: 'gen-1', locationId: 'room-mc1', ownerId: 'user-lumza', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'B-250707C-LU', count: 7 }, { batchId: 'BDE-250707C-LU', count: 4 }, { batchId: 'HK-250707C-LU', count: 2 }, { batchId: 'PZ-250707C-LU', count: 2 }, { batchId: 'R-250707C-LU', count: 4 }, { batchId: 'SLAM-250707C-LU', count: 6 }, { batchId: 'WF-250707C-LU', count: 4 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // LL Location - VERIFIED
    { id: 'crop-llveg-1', geneticsId: 'gen-12', locationId: 'room-llveg', ownerId: 'user-fermin', cloningDate: '2025-08-04T06:00:00.000Z', preVegDate: '2025-08-18T06:00:00.000Z', vegDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'HK-250804C-FE', count: 40 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-llprev-1', geneticsId: 'gen-12', locationId: 'room-llprev', ownerId: 'user-fermin', cloningDate: '2025-08-18T06:00:00.000Z', preVegDate: '2025-09-08T06:00:00.000Z', plantCounts: [{ batchId: 'HK-250818C-FE', count: 30 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ll1-1', geneticsId: 'gen-21', locationId: 'room-ll1', ownerId: 'user-fermin', cloningDate: '2025-06-30T06:00:00.000Z', preVegDate: '2025-07-21T06:00:00.000Z', vegDate: '2025-08-11T06:00:00.000Z', flowerDate: '2025-09-01T06:00:00.000Z', plantCounts: [{ batchId: 'RWR-250630C-FE', count: 17 }, { batchId: 'CH-250630C-FE', count: 12 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ll3-1', geneticsId: 'gen-21', locationId: 'room-ll3', ownerId: 'user-fermin', cloningDate: '2025-07-21T06:00:00.000Z', preVegDate: '2025-08-11T06:00:00.000Z', vegDate: '2025-09-01T06:00:00.000Z', flowerDate: '2025-09-25T06:00:00.000Z', plantCounts: [{ batchId: 'RWR-250721C-FE', count: 6 }, { batchId: 'CH-250721C-FE', count: 6 }, { batchId: 'KP-250721C-FE', count: 3 }, { batchId: 'SU-250721C-FE', count: 4 }, { batchId: 'SLM-250721C-FE', count: 1 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // SS Location - CORRECTED
    { id: 'crop-ss1-1', geneticsId: 'gen-20', locationId: 'room-ss1', ownerId: 'user-fermin', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'R-250707C-FE', count: 12 }, { batchId: 'HK-250707C-FE', count: 9 }, { batchId: 'MG-250707C-FE', count: 13 }, { batchId: 'B-250707C-FE', count: 9 }, { batchId: 'BS-250707C-FE', count: 3 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ss2-1', geneticsId: 'gen-28', locationId: 'room-ss2', ownerId: 'user-fermin', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'BXBL-250707C-FE', count: 23 }, { batchId: 'SU-250707C-FE', count: 15 }, { batchId: 'SBOG-250707C-FE', count: 9 }, { batchId: 'KP-250707C-FE', count: 6 }], logEntries: [], lightHours: { veg: 18, flower: 12 } }
];

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

const createCultivoInventoryForLocation = (locationId: string): InventoryItem[] => [
    { id: `inv-silicato-potasio-${locationId}`, name: 'Silicato de Potasio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-yara-calcinit-${locationId}`, name: 'Yara Calcinit', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sulfato-magnesio-${locationId}`, name: 'Sulfato de Magnesio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-ultrasol-desarrollo-${locationId}`, name: 'Ultrasol Desarrollo', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-ultrasol-inicial-${locationId}`, name: 'Ultrasol Inicial', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-boro-micros-${locationId}`, name: 'Micros Rexene BSP', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-ultrasol-mkp-${locationId}`, name: 'Ultrasol MKP', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-melaza-${locationId}`, name: 'Melaza', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-tricodermas-${locationId}`, name: 'Tricodermas', category: 'Microorganismos/Biológicos', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-aminoacidos-${locationId}`, name: 'Aminoacidos', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-anibac-${locationId}`, name: 'Anibac con cobre', category: 'Control de Plagas/Enfermedades', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-bacillus-${locationId}`, name: 'Bacillus subtilis', category: 'Microorganismos/Biológicos', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-rootex-${locationId}`, name: 'Rootex', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
];

const createMaintenanceInventoryForLocation = (locationId: string): InventoryItem[] => [
    { id: `inv-filtro-ac-carbon-${locationId}`, name: 'Filtro de carbón activado (AC)', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', partNumber: 'AC-F-12345', supplier: 'Grainger', minStockLevel: 2 },
    { id: `inv-filtro-deshu-${locationId}`, name: 'Filtro para deshumidificador', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-foam-cleaner-${locationId}`, name: 'Foam cleaner para serpentines', category: 'Limpieza y Sanitización', inventoryType: 'Mantenimiento', unit: 'lata', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, minStockLevel: 5 },
    { id: `inv-sol-cal-ph7-${locationId}`, name: 'Solución calibración pH 7', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sol-cal-ph4-${locationId}`, name: 'Solución calibración pH 4', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sol-cal-ec-${locationId}`, name: 'Solución calibración EC', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-lampara-uv-${locationId}`, name: 'Lámpara UV para filtro de agua', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-filtro-sedimentos-${locationId}`, name: 'Cartucho de filtro de sedimentos', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Cartucho estándar de 10 pulgadas, 5 micras.', minStockLevel: 4 },
    { id: `inv-filtro-carbon-${locationId}`, name: 'Cartucho de filtro de carbón', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Cartucho estándar de 10 pulgadas, carbón activado.', minStockLevel: 4 },
];

const generateInitialInventory = (): InventoryItem[] => {
    const items: InventoryItem[] = [];
    const parentLocations = LOCATIONS.filter(l => !l.parentId);
    const rooms = LOCATIONS.filter(l => l.parentId && !l.name.includes('MADRE'));

    // Add generic cultivation and maintenance items for each main location
    parentLocations.forEach(loc => {
        items.push(...createCultivoInventoryForLocation(loc.id));
        items.push(...createMaintenanceInventoryForLocation(loc.id));
    });
    
    // Add a specific "Coco Coir" item for each individual room
    rooms.forEach(room => {
        items.push({
            id: `inv-coco-${room.id}`,
            name: 'Coco Coir',
            category: 'Sustrato',
            inventoryType: 'Cultivo',
            unit: 'ciclo', // Unit is now "cycle"
            purchaseUnit: 'bloque',
            purchaseUnitConversion: 60, // liters per block
            purchases: [],
            currentStock: 1, // Assume 1 cycle's worth
            locationId: room.id, // Linked to the specific room
            averageCostPerUnit: 0,
            reuseCount: 0 
        });
    });

    return items;
};

export const INVENTORY_ITEMS: InventoryItem[] = generateInitialInventory();

// --- NEW FORMULAS BASED ON PNO-CULT-001-RM ---
export const FORMULAS: Formula[] = [
    {
        id: 'pno-clonacion', name: 'PNO Clonación S1-3', targetPPM: 350, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.10 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.40 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.15 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.30 },
            { inventoryItemId: 'inv-ultrasol-inicial', amountPerLiter: 0.131 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-preveg-s1-2', name: 'PNO Pre-vegetación S1-2', targetPPM: 675, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.05 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.50 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.406 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.325 },
            { inventoryItemId: 'inv-ultrasol-inicial', amountPerLiter: 0.160 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-veg-s1-4', name: 'PNO Vegetación S1-4', targetPPM: 1000, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.05 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.60 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.457 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.483 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.076 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-floracion-s1-2', name: 'PNO Floración S1-2', targetPPM: 1075, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.10 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.807 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.558 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.361 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.219 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-floracion-s3-6', name: 'PNO Floración S3-6', targetPPM: 1150, nutrients: [
            // Same ingredients as S1-2, per PNO section 11.5
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.10 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.807 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.558 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.361 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.219 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-maduracion-s7-8', name: 'PNO Maduración S7-8', targetPPM: 900, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.23 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.753 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.558 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.185 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.199 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-lavado-s9', name: 'PNO Lavado S9', targetPPM: 100, nutrients: []
    },
    // --- NEW MOTHER PLANT FORMULAS ---
    {
        id: 'pno-madre-mantenimiento', name: 'PNO Madre Mantenimiento', targetPPM: 950, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.12 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.700 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.457 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.286 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.099 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-madre-preclon', name: 'PNO Madre Pre-clon', targetPPM: 900, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.10 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.753 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.507 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.241 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.104 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-madre-recuperacion', name: 'PNO Madre Recuperación', targetPPM: 1025, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.15 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.753 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.457 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.296 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.098 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    },
    {
        id: 'pno-madre-raices', name: 'PNO Madre Servicio Raíces', targetPPM: 775, nutrients: [
            { inventoryItemId: 'inv-silicato-potasio', amountPerLiter: 0.13 },
            { inventoryItemId: 'inv-yara-calcinit', amountPerLiter: 0.699 },
            { inventoryItemId: 'inv-sulfato-magnesio', amountPerLiter: 0.457 },
            { inventoryItemId: 'inv-ultrasol-desarrollo', amountPerLiter: 0.203 },
            { inventoryItemId: 'inv-ultrasol-mkp', amountPerLiter: 0.086 },
            { inventoryItemId: 'inv-boro-micros', amountPerLiter: 0.03 }
        ]
    }
];

export const FORMULA_SCHEDULE: FormulaSchedule = {
    [CropStage.CLONING]: {
        1: 'pno-clonacion',
        2: 'pno-clonacion',
        3: 'pno-clonacion',
    },
    [CropStage.PRE_VEGETATION]: {
        1: 'pno-preveg-s1-2',
        2: 'pno-preveg-s1-2',
        3: 'pno-preveg-s1-2', // PNO lacks a specific recipe for Pre-Veg 3-4, using S1-2 as fallback
        4: 'pno-preveg-s1-2', // PNO lacks a specific recipe for Pre-Veg 3-4, using S1-2 as fallback
    },
    [CropStage.VEGETATION]: {
        1: 'pno-veg-s1-4',
        2: 'pno-veg-s1-4',
        3: 'pno-veg-s1-4',
        4: 'pno-veg-s1-4',
    },
    [CropStage.FLOWERING]: {
        1: 'pno-floracion-s1-2',
        2: 'pno-floracion-s1-2',
        3: 'pno-floracion-s3-6',
        4: 'pno-floracion-s3-6',
        5: 'pno-floracion-s3-6',
        6: 'pno-floracion-s3-6',
        7: 'pno-maduracion-s7-8',
        8: 'pno-maduracion-s7-8',
        9: 'pno-lavado-s9',
    }
};

export const STAGES = [
  CropStage.CLONING,
  CropStage.PRE_VEGETATION,
  CropStage.VEGETATION,
  CropStage.FLOWERING,
  CropStage.DRYING_CURING,
  CropStage.HARVESTED,
];

export const TASKS: Task[] = [
    // --- Tareas de Cultivador ---
    { id: 'task-c-1', title: 'Aplicación foliar', description: 'Aplicar foliares según la semana y fórmula.', recurrenceType: 'weekly', dayOfWeek: 1, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Lunes
    { id: 'task-c-1-jueves', title: 'Aplicación foliar', description: 'Aplicar foliares según la semana y fórmula.', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Jueves
    { id: 'task-c-2', title: 'Revisión de plagas', description: 'Inspeccionar detalladamente las plantas en busca de plagas o enfermedades.', recurrenceType: 'weekly', dayOfWeek: 3, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Miércoles
    { id: 'task-c-3', title: 'Defoliación y LST', description: 'Realizar defoliación y entrenamiento de bajo estrés si es necesario.', recurrenceType: 'weekly', dayOfWeek: 5, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Viernes
    
    // --- Tareas de Mantenimiento ---
    // HVAC
    { id: 'task-m-ac-filter', title: 'Limpieza de filtros de Aires Acondicionados', recurrenceType: 'weekly', dayOfWeek: 2, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Agua', 'Jabón', 'Cepillo suave'], 
        sop: { 
            title: 'Procedimiento de Limpieza de Filtros de AC', 
            steps: [
                'Apagar la unidad de AC desde el breaker.', 'Remover la cubierta frontal del AC.', 'Extraer los filtros con cuidado.',
                'Lavar los filtros con agua a baja presión y jabón neutro.', 'Dejar secar completamente a la sombra.',
                'Volver a colocar los filtros y la cubierta.', 'Restablecer la energía.'
            ]
        } 
    },
    { id: 'task-m-deshu-filter', title: 'Limpieza de filtro de Deshumidificadores', recurrenceType: 'weekly', dayOfWeek: 2, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Deshumidificadores', requiredTools: ['Agua', 'Jabón', 'Cepillo suave'] },
    { id: 'task-m-ac-serpentin', title: 'Limpieza de serpentín (AC)', recurrenceType: 'monthly', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Aspiradora', 'Agua'], requiredParts: [{ inventoryItemId: 'inv-foam-cleaner', quantity: 1 }] },
    { id: 'task-m-deshu-serpentin', title: 'Limpieza de serpentín (Deshumidificador)', recurrenceType: 'bimonthly', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Deshumidificadores', requiredTools: ['Aspiradora'], requiredParts: [{ inventoryItemId: 'inv-foam-cleaner', quantity: 1 }] },
    { id: 'task-m-ac-drain', title: 'Revisión y limpieza de drenaje (AC)', recurrenceType: 'monthly', dayOfMonth: 5, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Agua', 'Alambre guía flexible'] },
    { id: 'task-m-ac-pressure', title: 'Revisión de presión de refrigerante', recurrenceType: 'quarterly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Manómetros para R-410a'] },
    
    // Riego y Agua
    { id: 'task-m-water-filter', title: 'Limpiar filtros de línea de riego', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Sistema de riego', requiredTools: ['Agua a presión', 'Cepillo'] },
    { id: 'task-m-tinacos', title: 'Limpieza de tinacos/depósitos', recurrenceType: 'monthly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Depósitos de nutrientes', requiredTools: ['Cepillo', 'Cloro/Desinfectante', 'Agua'] },
    { id: 'task-m-humidifiers', title: 'Limpieza de humidificadores', description: 'Limpiar depósito y membranas.', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Humidificadores', requiredTools: ['Vinagre blanco', 'Agua', 'Cepillo pequeño'] },
    { id: 'task-m-dosing-pumps', title: 'Calibrar bombas dosificadoras', recurrenceType: 'monthly', dayOfMonth: 10, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Bombas dosificadoras', requiredTools: ['Probeta graduada', 'Cronómetro'] },
    { id: 'task-m-water-cartridges', title: 'Cambio de cartuchos de filtro de agua', recurrenceType: 'semiannually', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Filtro de Agua', requiredTools: ['Llave para portafiltro'], requiredParts: [{ inventoryItemId: 'inv-filtro-sedimentos', quantity: 1 }, { inventoryItemId: 'inv-filtro-carbon', quantity: 1 }] },
    { id: 'task-m-uv-lamp', title: 'Cambio de lámpara UV', recurrenceType: 'semiannually', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Iluminación', equipmentType: 'Filtro de Agua', requiredTools: ['Guantes'], requiredParts: [{ inventoryItemId: 'inv-lampara-uv', quantity: 1 }] },
    
    // Sensores
    { id: 'task-m-sensors-ph-ec', title: 'Calibrar medidores pH/EC', recurrenceType: 'weekly', dayOfWeek: 3, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Medidores Bluelab', requiredParts: [{ inventoryItemId: 'inv-sol-cal-ph7', quantity: 0.05 }, { inventoryItemId: 'inv-sol-cal-ph4', quantity: 0.05 }, { inventoryItemId: 'inv-sol-cal-ec', quantity: 0.05 }],
        sop: {
            title: 'Procedimiento de Calibración de Medidores Bluelab',
            steps: [
                'Limpiar el electrodo com agua destilada.',
                'Sumergir en solución de calibración pH 7.',
                'Esperar a que la lectura se estabilice y presionar "Cal".',
                'Enjuagar el electrodo com agua destilada.',
                'Sumergir en solución de calibración pH 4.',
                'Esperar a que la lectura se estabilice y presionar "Cal".',
                'Enjuagar y repetir el proceso para EC con la solución correspondiente.'
            ]
        }
    },
    { id: 'task-m-sensors-temp-hum', title: 'Verificar sensores Temp/Humedad', recurrenceType: 'quarterly', dayOfMonth: 10, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Sensores Ambientales', requiredTools: ['Termohigrómetro calibrado de referencia'] },
    { id: 'task-m-sensors-co2', title: 'Verificar sensor de CO2', recurrenceType: 'semiannually', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Sensor de CO2', requiredTools: ['Medidor de CO2 calibrado de referencia'] },

    // Iluminación y Ventilación
    { id: 'task-m-lights-cleaning', title: 'Limpieza de Lámparas/reflectores', recurrenceType: 'monthly', dayOfMonth: 20, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Iluminación', equipmentType: 'Lámparas', requiredTools: ['Paño de microfibra', 'Alcohol isopropílico'] },
    { id: 'task-m-electrical', title: 'Verificar conexiones eléctricas', recurrenceType: 'quarterly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'General', equipmentType: 'Tableros eléctricos', requiredTools: ['Multímetro (opcional)'] },
    { id: 'task-m-fans', title: 'Limpieza de ventiladores', description: 'Limpiar aspas y rejillas.', recurrenceType: 'monthly', dayOfMonth: 25, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Ventilación', equipmentType: 'Ventiladores', requiredTools: ['Paño húmedo', 'Desarmador'] },
];

export const FOLIAR_PRODUCTS: { name: string; dose: string }[] = [
  { name: 'Aminoacidos', dose: '2.5 ml/L' },
  { name: 'Aceite de neem con jabon potasico', dose: '10 ml/L' },
  { name: 'Anibac con cobre', dose: '2 ml/L' },
  { name: 'Ferfomax', dose: '15 ml/L' },
  { name: 'Bacillus subtilis', dose: '4 ml/L' },
];

export const SUPPLEMENT_PRODUCTS: { name: string; dose: string }[] = [
  { name: 'Aminoacidos', dose: '2.5 ml/L' },
  { name: 'Bacillus subtilis', dose: '4 ml/L' },
  { name: 'Tricodermas', dose: '1 ml/L' },
  { name: 'Te de microorganismos', dose: '10 ml/L' },
];

export const PLANT_HEALTH_OPTIONS: { [category: string]: string[] } = {
  'Estado Positivo': [
    'Crecimiento vigoroso',
    'Color verde intenso',
    'Sin signos de estrés',
    'Producción de resina alta',
    'Desarrollo de flores denso',
    'Sistema radicular sano',
  ],
  'Plagas Comunes': [
    'Araña roja',
    'Mosca blanca',
    'Trips',
    'Pulgones',
    'Cochinilla',
    'Minadores de hojas',
    'Orugas',
  ],
  'Enfermedades y Hongos': [
    'Oídio',
    'Mildiu',
    'Botrytis (Moho gris)',
    'Pythium (Pudrición de raíz)',
    'Fusarium',
    'Roya',
    'Septoria',
  ],
  'Deficiencias Nutricionales': [
    'Deficiencia de Nitrógeno (N)',
    'Deficiencia de Fósforo (P)',
    'Deficiencia de Potasio (K)',
    'Deficiencia de Calcio (Ca)',
    'Deficiencia de Magnesio (Mg)',
    'Deficiencia de Azufre (S)',
    'Deficiencia de Hierro (Fe)',
    'Deficiencia de Manganeso (Mn)',
    'Deficiencia de Zinc (Zn)',
  ],
  'Otros Problemas': [
    'Estrés por calor',
    'Estrés por frío',
    'Exceso de riego',
    'Falta de riego',
    'Quemaduras por luz',
    'Bloqueo de nutrientes (pH)',
  ],
};

export const EXPENSES: Expense[] = [];

export const TRIMMING_SESSIONS: TrimmingSession[] = [];
export const EQUIPMENT: Equipment[] = [];

// --- PNO Parameters from Document ---
export const PNO_PARAMETERS: PnoParameters = {
  [CropStage.CLONING]: {
    1: { tempDay: [24, 24], tempNight: 21, humidityDay: [75, 85], humidityNight: [80, 90], vpd: [0.4, 0.6], co2: 'Ambiente', ppfd: [150, 300], ph: [5.8, 6.0], ppm: 350 },
    2: { tempDay: [24, 24], tempNight: 21, humidityDay: [75, 85], humidityNight: [80, 90], vpd: [0.4, 0.6], co2: 'Ambiente', ppfd: [150, 300], ph: [5.8, 6.0], ppm: 350 },
    3: { tempDay: [24, 24], tempNight: 21, humidityDay: [75, 85], humidityNight: [80, 90], vpd: [0.4, 0.6], co2: 'Ambiente', ppfd: [150, 300], ph: [5.8, 6.0], ppm: 350 },
  },
  [CropStage.PRE_VEGETATION]: {
    1: { tempDay: [26, 26], tempNight: 22, humidityDay: [70, 70], humidityNight: [75, 75], vpd: [0.8, 1.0], co2: [600, 800], ppfd: [300, 400], ph: [5.6, 5.9], ppm: 675 },
    2: { tempDay: [26, 26], tempNight: 22, humidityDay: [70, 70], humidityNight: [75, 75], vpd: [0.8, 1.0], co2: [600, 800], ppfd: [300, 400], ph: [5.6, 5.9], ppm: 675 },
    3: { tempDay: [26, 26], tempNight: 22, humidityDay: [70, 75], humidityNight: [70, 75], vpd: [0.9, 1.1], co2: [700, 900], ppfd: [300, 500], ph: [5.6, 5.9], ppm: 850 },
    4: { tempDay: [26, 26], tempNight: 22, humidityDay: [70, 75], humidityNight: [70, 75], vpd: [0.9, 1.1], co2: [700, 900], ppfd: [300, 500], ph: [5.6, 5.9], ppm: 850 },
  },
  [CropStage.VEGETATION]: {
    1: { tempDay: [28, 28], tempNight: 24, humidityDay: [65, 70], humidityNight: [70, 75], vpd: [1.0, 1.3], co2: [800, 1000], ppfd: [400, 800], ph: [5.6, 6.0], ppm: 1000 },
    2: { tempDay: [28, 28], tempNight: 24, humidityDay: [65, 70], humidityNight: [70, 75], vpd: [1.0, 1.3], co2: [800, 1000], ppfd: [400, 800], ph: [5.6, 6.0], ppm: 1000 },
    3: { tempDay: [28, 28], tempNight: 24, humidityDay: [65, 70], humidityNight: [70, 75], vpd: [1.0, 1.3], co2: [800, 1000], ppfd: [400, 800], ph: [5.6, 6.0], ppm: 1000 },
    4: { tempDay: [28, 28], tempNight: 24, humidityDay: [65, 70], humidityNight: [70, 75], vpd: [1.0, 1.3], co2: [800, 1000], ppfd: [400, 800], ph: [5.6, 6.0], ppm: 1000 },
  },
  [CropStage.FLOWERING]: {
    1: { tempDay: [28, 28], tempNight: 24, humidityDay: [60, 60], humidityNight: [65, 65], vpd: [1.1, 1.3], co2: [1000, 1200], ppfd: [800, 1000], ph: [5.8, 6.1], ppm: 1075 },
    2: { tempDay: [28, 28], tempNight: 24, humidityDay: [60, 60], humidityNight: [65, 65], vpd: [1.1, 1.3], co2: [1000, 1200], ppfd: [800, 1000], ph: [5.8, 6.1], ppm: 1075 },
    3: { tempDay: [28, 28], tempNight: 24, humidityDay: [55, 60], humidityNight: [60, 65], vpd: [1.2, 1.5], co2: [1200, 1400], ppfd: [1000, 1300], ph: [5.8, 6.2], ppm: 1150 },
    4: { tempDay: [28, 28], tempNight: 24, humidityDay: [55, 60], humidityNight: [60, 65], vpd: [1.2, 1.5], co2: [1200, 1400], ppfd: [1000, 1300], ph: [5.8, 6.2], ppm: 1150 },
    5: { tempDay: [28, 28], tempNight: 24, humidityDay: [55, 60], humidityNight: [60, 65], vpd: [1.2, 1.5], co2: [1200, 1400], ppfd: [1000, 1300], ph: [5.8, 6.2], ppm: 1150 },
    6: { tempDay: [28, 28], tempNight: 24, humidityDay: [55, 60], humidityNight: [60, 65], vpd: [1.2, 1.5], co2: [1200, 1400], ppfd: [1000, 1300], ph: [5.8, 6.2], ppm: 1150 },
    7: { tempDay: [24, 24], tempNight: 20, humidityDay: [45, 45], humidityNight: [50, 50], vpd: [1.3, 1.6], co2: [800, 1000], ppfd: [800, 1000], ph: [5.8, 6.2], ppm: 900 },
    8: { tempDay: [24, 24], tempNight: 20, humidityDay: [45, 45], humidityNight: [50, 50], vpd: [1.3, 1.6], co2: [800, 1000], ppfd: [800, 1000], ph: [5.8, 6.2], ppm: 900 },
    9: { tempDay: [22, 22], tempNight: 18, humidityDay: [45, 45], humidityNight: [50, 50], vpd: [1.2, 1.4], co2: 'Ambiente', ppfd: [600, 800], ph: [5.8, 6.0], ppm: 100 },
  }
};


export const INITIAL_PNO_PROCEDURES: PnoProcedure[] = [
    {
        id: 'pno-cultivo-elite',
        title: 'PNO-CULT-001-RM: Procedimiento Maestro de Cultivo de Élite',
        sections: [
            {
                title: '1. Objetivo y Alcance',
                content: 'Este procedimiento establece la metodología estándar para todas las fases del cultivo de cannabis, desde la clonación hasta la cosecha, con el objetivo de maximizar la calidad y el rendimiento. Es aplicable a todas las ubicaciones y personal de cultivo.'
            },
            {
                title: '2. Mezcla de Nutrientes (Tanque Único)',
                content: `El orden de mezcla es crítico para evitar la precipitación de nutrientes. Siga estos pasos rigurosamente:
1. Llenar el tanque al 80% con agua de ósmosis inversa y comenzar la agitación.
2. Añadir Silicato de Potasio (pre-diluido) y agitar durante 5 minutos.
3. Acidificar la solución a un pH de 5.5 con ácido fosfórico o nítrico.
4. Añadir Sulfato de Magnesio (Epsom) y disolver completamente.
5. Añadir Nitrato de Calcio (Yara Calcinit) y disolver completamente.
6. Añadir Ultrasol (Inicial o Desarrollo según la fórmula) y disolver.
7. Añadir Fosfato Monopotásico (MKP) y disolver.
8. Añadir Micronutrientes (Rexene) y disolver.
9. Completar el volumen de agua y realizar el ajuste final de pH al rango objetivo para la semana actual.`
            },
            {
                title: '3. Estrategia de Riego',
                content: `El riego se basa en la estrategia de "Dry Back" (secado) controlado por VWC (Contenido Volumétrico de Agua) del sustrato.
- Riego de Saturación: Aplicar solución nutritiva hasta alcanzar un 15-25% de drenaje (runoff). El VWC debe llegar al 70-75%.
- Gatillo de Riego: No volver a regar hasta que el VWC baje al nivel objetivo para la fase actual (ver tabla de parámetros).
- Frecuencia: La frecuencia será determinada por la rapidez con que se alcanza el gatillo, típicamente de 1 a 3 riegos por día durante el pico de floración.`
            },
        ]
    },
    {
        id: 'pno-plantas-madre',
        title: 'PNO-CULT-002-MAD: Procedimiento Maestro — Plantas Madre',
        sections: [
            {
                title: '1. Objetivo',
                content: 'Mantener la salud y el vigor a largo plazo del banco genético, asegurando una producción constante de esquejes de alta calidad y libres de plagas.'
            },
            {
                title: '2. Ambiente de Mantenimiento',
                content: `El objetivo es la estabilidad, no el crecimiento explosivo.
- Fotoperiodo: 18 horas de luz / 6 de oscuridad.
- PPFD: 350-450 µmol/m²/s.
- Temperatura: 24-26°C.
- Humedad: 60-70%.
- CO₂: Ambiental.`
            },
            {
                title: '3. Poda y Toma de Esquejes',
                content: `- Nunca retirar mais del 30% de la masa foliar en una sesión.
- Seleccionar ramas sanas con al menos 2-3 nudos.
- Realizar cortes limpios en un ángulo de 45 grados.
- Sumergir inmediatamente el corte en solución de enraizamiento.
- Realizar una poda de mantenimiento estructural después de cada cosecha de esquejes para mantener una forma de arbusto.`
            },
        ]
    },
    {
        id: 'pno-calibracion-equipos',
        title: 'PNO-EQP-001: Mantenimiento y Calibración de Equipos de Medición',
        sections: [
            {
                title: '1. Objetivo',
                content: 'Asegurar la precisión de todos los equipos de medición de pH y EC (PPM) para garantizar la correcta formulación de nutrientes y la salud del cultivo.'
            },
            {
                title: '2. Frecuencia de Calibración',
                content: '- Medidores de pH: Semanal (Lunes). \n- Medidores de EC/PPM: Semanal (Lunes).'
            },
            {
                title: '3. Procedimiento Medidor de pH (2 Puntos)',
                content: `1. Limpiar el electrodo con agua destilada.
2. Sumergir en solución buffer de pH 7.00. Esperar estabilización y presionar "Cal".
3. Enjuagar el electrodo con agua destilada.
4. Sumergir en solución buffer de pH 4.01. Esperar estabilización y presionar "Cal".
5. Enjuagar y guardar el medidor en solución de almacenamiento (KCl). NUNCA guardar en agua destilada.`
            },
            {
                title: '4. Procedimiento Medidor de EC/PPM (1 Punto)',
                content: `1. Limpiar la sonda con agua destilada.
2. Sumergir en solución de calibración estándar (ej. 2.77 EC / 1385 PPM).
3. Esperar estabilización y ejecutar la calibración.
4. Enjuagar y verificar la lectura en agua de ósmosis (debe ser cercana a 0).`
            }
        ]
    }
];

export const INITIAL_INFOGRAPHICS: Infographic[] = [
    {
        id: 'info-calibracion-medidores',
        title: 'Calibración de Medidores',
        pnoId: 'pno-calibracion-equipos',
        htmlContent: {
            style: `
                body { font-family: 'Inter', sans-serif; }
                .step-circle { width: 3rem; height: 3rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 1.5rem; flex-shrink: 0; }
            `,
            body: `
                <header class="bg-[#003f5c] text-white p-8 text-center sticky top-0 z-10 shadow-lg">
                    <h1 class="text-4xl font-bold">PNO: Calibración de Medidores</h1>
                    <p class="mt-2 text-lg text-slate-300">Garantizando la Precisión de los Datos para un Cultivo de Élite</p>
                </header>
                <main class="p-4 md:p-8">
                    <section id="intro" class="max-w-4xl mx-auto text-center mb-12">
                        <h2 class="text-3xl font-bold text-[#003f5c]">Si no puedes medirlo, no puedes mejorarlo.</h2>
                        <p class="mt-4 text-lg text-slate-600">La precisión de tus medidores de pH y PPM no es negociable. Una desviación puede bloquear nutrientes y limitar el potencial de tu cultivo. Este PNO asegura que cada gota de agua sea exactamente como la planeamos.</p>
                    </section>
                    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section id="ph-meter" class="bg-white p-6 rounded-lg shadow-md">
                            <div class="text-center">
                                <h2 class="text-3xl font-bold text-[#7a5195]">Medidor de pH</h2>
                                <p class="text-xl font-semibold text-slate-500 mt-1">Frecuencia de Calibración: <span class="text-[#ef5675] font-bold">SEMANAL</span></p>
                                <p class="text-slate-600 mt-2">(Ej. Lunes, antes de la primera mezcla)</p>
                            </div>
                            <div class="mt-8 space-y-6">
                                <h3 class="text-xl font-bold text-center text-[#003f5c] border-b-2 border-slate-200 pb-2">Protocolo de Calibración a 2 Puntos</h3>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ffa600]">1</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Limpiar Electrodo</h4>
                                        <p class="text-slate-600">Enjuagar suavemente la punta del electrodo con agua de ósmosis inversa o destilada.</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ff764a]">2</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Calibrar en Buffer 7.00</h4>
                                        <p class="text-slate-600">Sumergir el electrodo en la solución buffer de pH 7.00. Esperar a que la lectura se estabilice y ejecutar la calibración.</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ffa600]">3</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Volver a Limpiar</h4>
                                        <p class="text-slate-600">Enjuagar nuevamente el electrodo para no contaminar la siguiente solución.</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ef5675]">4</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Calibrar en Buffer 4.01</h4>
                                        <p class="text-slate-600">Sumergir el electrodo en la solución buffer de pH 4.01. Esperar a que la lectura se estabilice y ejecutar la calibración.</p>
                                    </div>
                                </div>
                                <div class="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                                    <p class="font-bold">Regla de Oro: ¡Nunca dejes secar el electrodo!</p>
                                    <p>Guarda siempre el medidor con su tapa protectora llena de solución de almacenamiento (KCI). Un electrodo seco es un electrodo impreciso.</p>
                                </div>
                            </div>
                        </section>
                        <section id="ppm-meter" class="bg-white p-6 rounded-lg shadow-md">
                            <div class="text-center">
                                <h2 class="text-3xl font-bold text-[#7a5195]">Medidor de PPM</h2>
                                <p class="text-xl font-semibold text-slate-500 mt-1">Frecuencia de Calibración: <span class="text-[#ef5675] font-bold">SEMANAL</span></p>
                                <p class="text-slate-600 mt-2">(Ej. Lunes, junto al medidor de pH)</p>
                            </div>
                            <div class="mt-8 space-y-6">
                                <h3 class="text-xl font-bold text-center text-[#003f5c] border-b-2 border-slate-200 pb-2">Protocolo de Calibración a 1 Punto</h3>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ffa600]">1</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Limpiar Sonda</h4>
                                        <p class="text-slate-600">Enjuagar la sonda del medidor con agua de ósmosis inversa o destilada.</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ff764a]">2</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Calibrar en Solución Estándar</h4>
                                        <p class="text-slate-600">Sumergir la sonda en la solución de calibración (ej. 1385 PPM / 2.77 EC). Esperar a que la lectura se estabilice y ejecutar la calibración.</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="step-circle bg-[#ef5675]">3</div>
                                    <div>
                                        <h4 class="font-bold text-lg">Verificar en Agua de O.I.</h4>
                                        <p class="text-slate-600">Después de calibrar y limpiar, medir el agua de ósmosis. La lectura debe ser muy cercana a 0 PPM (normalmente entre 0 y 10 PPM).</p>
                                    </div>
                                </div>
                                <div class="mt-8 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-r-lg">
                                    <p class="font-bold">Práctica Esencial: ¡Registra todo!</p>
                                    <p>Cada calibración debe ser anotada en la **Bitácora de Calibración de Equipos**, indicando la fecha, el resultado y las iniciales del técnico.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
                <footer class="bg-[#003f5c] text-white p-4 text-center text-sm mt-8">
                    <p>Infografía generada para Luis por María, Asistente Botánica.</p>
                </footer>
            `
        }
    },
    {
        id: 'info-manejo-plagas',
        title: 'Manejo Integrado de Plagas',
        htmlContent: {
            style: `
                body { font-family: 'Inter', sans-serif; }
                .step-circle { width: 4rem; height: 4rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 1.8rem; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            `,
            body: `
                <header class="bg-[#003f5c] text-white p-8 text-center sticky top-0 z-10 shadow-lg">
                    <h1 class="text-4xl font-bold">PNO: Manejo Integrado de Plagas (MIP)</h1>
                    <p class="mt-2 text-lg text-slate-300">Un Cultivo Sano es la Mejor Defensa</p>
                </header>
                <main class="p-4 md:p-8">
                    <section id="philosophy" class="max-w-5xl mx-auto mb-12">
                        <h2 class="text-3xl font-bold text-center text-[#003f5c] mb-6">La Pirámide de Defensa del MIP</h2>
                        <p class="text-center text-lg text-slate-600 mb-8">Nuestra estrategia no es reaccionar a los problemas, es construír un sistema tan robusto que los problemas no tengan lugar para empezar. Actuamos en tres niveles, desde la base más sólida hasta el último recurso.</p>
                        <div class="flex flex-col items-center space-y-0">
                            <div class="w-full max-w-sm p-4 bg-[#ef5675] text-white rounded-t-lg text-center shadow-lg">
                                <h3 class="text-2xl font-bold">3. CONTROL</h3><p class="text-sm">Acción Curativa</p>
                            </div>
                            <div class="w-full max-w-md p-4 bg-[#ff764a] text-white text-center shadow-lg">
                                <h3 class="text-2xl font-bold">2. MONITOREO</h3><p class="text-sm">Detección Temprana</p>
                            </div>
                            <div class="w-full max-w-lg p-4 bg-[#7a5195] text-white rounded-b-lg text-center shadow-lg">
                                <h3 class="text-2xl font-bold">1. PREVENCIÓN</h3><p class="text-sm">La Base de Todo</p>
                            </div>
                        </div>
                    </section>
                    <section id="prevention" class="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mb-12">
                        <div class="flex items-center justify-center space-x-4 mb-6">
                            <div class="step-circle bg-[#7a5195]">1</div>
                            <h2 class="text-3xl font-bold text-center text-[#003f5c]">PREVENCIÓN: El Escudo Proactivo</h2>
                        </div>
                        <p class="text-center text-slate-600 mb-8">El 90% del éxito del MIP ocurre aquí. Creamos un ambiente hostil para las plagas y fortalecemos la planta para que pueda defenderse sola.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 class="font-bold text-xl text-[#003f5c] mb-2">Programa Foliar Semanal</h3>
                                <p class="text-slate-600 mb-4">Rotamos aplicaciones para evitar la resistencia y atacar desde múltiples frentes. **(Aplicar hasta la semana 3 de floración)**.</p>
                                <div class="space-y-3">
                                    <div class="p-3 bg-slate-200 rounded-lg"><p class="font-bold text-slate-800">LUNES (Insecticida/Fungicida):</p><p>Aceite de Neem + Jabón Potásico (10 ml/L)</p></div>
                                    <div class="p-3 bg-slate-200 rounded-lg"><p class="font-bold text-slate-800">JUEVES (Bio-estimulante/Fortalecedor):</p><p>Alternar cada semana: Aminoácidos (2.5 ml/L) o Ferfomax (15 ml/L)</p></div>
                                </div>
                            </div>
                            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 class="font-bold text-xl text-[#003f5c] mb-2">Barreras Físicas y Biológicas</h3>
                                <p class="text-slate-600 mb-4">Defendemos el sustrato, el punto más vulnerable a las plagas de suelo.</p>
                                <div class="space-y-3">
                                    <div class="p-3 bg-slate-200 rounded-lg"><p class="font-bold text-slate-800">En Trasplante y Floración:</p><p>Aplicar 100g de Diatomix (Tierra de Diatomeas) para crear una barrera física contra larvas.</p></div>
                                    <div class="p-3 bg-slate-200 rounded-lg"><p class="font-bold text-slate-800">En Riego de Suplementos:</p><p>Inocular con Tricodermas y Bacillus subtilis para crear un microbioma que compita con los patógenos.</p></div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <section id="monitoring" class="bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center justify-center space-x-4 mb-6"><div class="step-circle bg-[#ff764a]">2</div><h2 class="text-2xl font-bold text-center text-[#003f5c]">MONITOREO: Ojos en el Cultivo</h2></div>
                            <p class="text-center text-slate-600 mb-6">La detección temprana es la diferencia entre un pequeño ajuste y una crisis. Buscamos activamente antes de que sea evidente.</p>
                            <div class="space-y-4">
                                <div class="flex items-start space-x-3"><span class="font-bold text-2xl text-[#ff764a]">✓</span><div><h4 class="font-semibold text-lg">Inspección Visual Diaria</h4><p class="text-slate-600">Revisar el envés de las hojas, especialmente en la parte media y baja de la planta.</p></div></div>
                                <div class="flex items-start space-x-3"><span class="font-bold text-2xl text-[#ff764a]">✓</span><div><h4 class="font-semibold text-lg">Trampas Adhesivas</h4><p class="text-slate-600">Colocar trampas amarillas justo por encima del dosel para capturar insectos voladores y monitorear poblaciones.</p></div></div>
                            </div>
                        </section>
                        <section id="control" class="bg-white p-6 rounded-lg shadow-md">
                            <div class="flex items-center justify-center space-x-4 mb-6"><div class="step-circle bg-[#ef5675]">3</div><h2 class="text-2xl font-bold text-center text-[#003f5c]">CONTROL: El Plan de Emergencia</h2></div>
                            <p class="text-center text-slate-600 mb-6">Solo actuamos con productos curativos si la prevención y el monitoreo fallan. Este es nuestro "botiquín de emergencia".</p>
                            <div class="space-y-4">
                                <div class="flex items-start space-x-3"><span class="font-bold text-2xl text-[#ef5675]">!</span><div><h4 class="font-semibold text-lg">Umbral de Acción</h4><p class="text-slate-600">Se aplica un tratamiento curativo solo si se detecta un **brote activo** y confirmado por el supervisor.</p></div></div>
                                <div class="flex items-start space-x-3"><span class="font-bold text-2xl text-[#ef5675]">!</span><div><h4 class="font-semibold text-lg">Herramienta Curativa</h4><p class="text-slate-600">**Anibac con Cobre (2 ml/L):** Nuestro fungicida de emergencia para brotes de oídio u otros hongos.</p></div></div>
                            </div>
                        </section>
                    </div>
                    <section id="rules" class="max-w-6xl mx-auto p-6 bg-slate-800 text-white rounded-lg shadow-lg">
                        <h2 class="text-3xl font-bold text-center text-[#ffa600] mb-6">Reglas de Oro de las Aplicaciones Foliares</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                            <p><span class="font-bold text-[#ffa600]">1.</span> Aplicar SIEMPRE con las luces apagadas.</p>
                            <p><span class="font-bold text-[#ffa600]">2.</span> NO aplicar NADA después de la semana 3 de floración.</p>
                            <p><span class="font-bold text-[#ffa600]">3.</span> La planta debe estar bien hidratada antes de rociar.</p>
                            <p><span class="font-bold text-[#ffa600]">4.</span> Registrar CADA aplicación en la bitácora.</p>
                        </div>
                    </section>
                </main>
                <footer class="bg-[#003f5c] text-white p-4 text-center text-sm mt-8">
                    <p>Infografía generada para Luis por María, Asistente Botánica.</p>
                </footer>
            `
        }
    }
];