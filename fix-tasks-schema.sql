-- Agregar columna assignee_roles a la tabla tasks
-- Ejecuta este SQL en Supabase Dashboard (SQL Editor)

-- Agregar columna assignee_roles como array de texto
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assignee_roles TEXT[] DEFAULT '{}';

-- Actualizar las tareas existentes con valores por defecto
-- Si la tarea tiene assigned_to, buscar los roles del usuario y asignarlos
UPDATE tasks
SET assignee_roles = COALESCE(
  (SELECT roles FROM users WHERE id = tasks.assigned_to),
  '{}'
)
WHERE assignee_roles = '{}' OR assignee_roles IS NULL;

-- Comentario
COMMENT ON COLUMN tasks.assignee_roles IS 
  'Array de roles que pueden realizar esta tarea (CULTIVADOR, MANTENIMIENTO, etc)';
