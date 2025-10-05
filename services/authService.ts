import { supabase } from './supabaseClient';
import { UserRole, AppPermission } from '../types';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
  locationId?: string;
  maintenanceLocationIds?: string[];
  permissions: { [key in AppPermission]?: boolean };
}

/**
 * Login with username and password
 */
export const login = async (username: string, password: string): Promise<AuthUser | null> => {
  try {
    // Query user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.error('User not found:', error);
      return null;
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.error('Invalid password');
      return null;
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      roles: user.roles || [],
      locationId: user.location_id,
      maintenanceLocationIds: user.maintenance_location_ids || [],
      permissions: user.permissions || {}
    };

    return authUser;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: {
  username: string;
  password: string;
  roles: UserRole[];
  locationId?: string;
  maintenanceLocationIds?: string[];
  permissions: { [key in AppPermission]?: boolean };
}): Promise<AuthUser | null> => {
  try {
    // Hash password before storing
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password_hash: passwordHash,
        roles: userData.roles,
        location_id: userData.locationId,
        maintenance_location_ids: userData.maintenanceLocationIds,
        permissions: userData.permissions
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      roles: data.roles,
      locationId: data.location_id,
      maintenanceLocationIds: data.maintenance_location_ids,
      permissions: data.permissions
    };
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      username: user.username,
      roles: user.roles || [],
      locationId: user.location_id,
      maintenanceLocationIds: user.maintenance_location_ids || [],
      permissions: user.permissions || {}
    }));
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

/**
 * Update user
 */
export const updateUser = async (userId: string, updates: Partial<AuthUser>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        roles: updates.roles,
        location_id: updates.locationId,
        maintenance_location_ids: updates.maintenanceLocationIds,
        permissions: updates.permissions,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update user error:', error);
    return false;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
};
