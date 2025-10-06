import { User, UserRole, AppPermission } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiService = {
  async createUser(userData: {
    username: string;
    password: string;
    roles: UserRole[];
    locationId?: string;
    maintenanceLocationIds?: string[];
    permissions: { [key in AppPermission]?: boolean };
  }, adminUserId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          adminUserId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Network error:', error);
      return null;
    }
  },

  async updateUser(userId: string, userData: {
    username: string;
    password?: string;
    roles: UserRole[];
    locationId?: string;
    maintenanceLocationIds?: string[];
    permissions: { [key in AppPermission]?: boolean };
  }, adminUserId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          adminUserId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Network error:', error);
      return null;
    }
  },

  async deleteUser(userId: string, adminUserId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminUserId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Network error:', error);
      return false;
    }
  }
};
