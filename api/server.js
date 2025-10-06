import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
  throw new Error('Missing Supabase URL');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  throw new Error('Missing Supabase Service Role Key');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

app.post('/api/users/create', async (req, res) => {
  try {
    const { username, password, roles, locationId, maintenanceLocationIds, permissions, adminUserId } = req.body;

    if (!adminUserId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('roles')
      .eq('id', adminUserId)
      .single();

    if (!adminUser || !adminUser.roles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        roles: roles || [],
        location_id: locationId,
        maintenance_location_ids: maintenanceLocationIds || [],
        permissions: permissions || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      id: data.id,
      username: data.username,
      roles: data.roles,
      locationId: data.location_id,
      maintenanceLocationIds: data.maintenance_location_ids,
      permissions: data.permissions
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, roles, locationId, maintenanceLocationIds, permissions, adminUserId } = req.body;

    if (!adminUserId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('roles')
      .eq('id', adminUserId)
      .single();

    if (!adminUser || !adminUser.roles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const updateData = {
      username,
      roles: roles || [],
      location_id: locationId,
      maintenance_location_ids: maintenanceLocationIds || [],
      permissions: permissions || {}
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      id: data.id,
      username: data.username,
      roles: data.roles,
      locationId: data.location_id,
      maintenanceLocationIds: data.maintenance_location_ids,
      permissions: data.permissions
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId } = req.body;

    if (!adminUserId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('roles')
      .eq('id', adminUserId)
      .single();

    if (!adminUser || !adminUser.roles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
});
