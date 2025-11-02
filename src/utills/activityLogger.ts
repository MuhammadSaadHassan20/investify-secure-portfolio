import { localDB } from '../utills/localDB';

export type ActivityAction = 
  | 'REGISTRATION_SUCCESS'
  | 'REGISTRATION_FAILED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_CHANGED'
  | 'PROFILE_UPDATED'
  | 'ASSET_ADDED'
  | 'ASSET_UPDATED'
  | 'ASSET_DELETED'
  | 'SQL_INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED_ACCESS';

export async function logActivity(
  action: ActivityAction,
  details?: Record<string, any>
): Promise<void> {
  try {
    // Get current user from localStorage
    const currentUserJson = localStorage.getItem('current_user');
    const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
    
    // Create log entry
    await localDB.addActivityLog({
      user_id: currentUser?.id || null,
      action,
      details: details || {},
      ip_address: 'localhost'
    });

    console.log('📝 Activity Log:', { action, details });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getUserActivityLogs(limit: number = 50) {
  try {
    const currentUserJson = localStorage.getItem('current_user');
    const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
    
    if (!currentUser) return [];

    const logs = await localDB.getActivityLogs(currentUser.id);
    return logs.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return [];
  }
}

export async function getAllActivityLogs(limit: number = 100) {
  try {
    const logs = await localDB.getActivityLogs();
    return logs.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch all activity logs:', error);
    return [];
  }
}