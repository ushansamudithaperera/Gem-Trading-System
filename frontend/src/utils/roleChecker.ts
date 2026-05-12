import { UserRole } from '../types/user.types';

/**
 * Check if user has any of the given roles
 */
export const hasRole = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRoles: UserRole[]): boolean => {
  return userRoles.includes('ADMIN');
};

/**
 * Check if user is buyer
 */
export const isBuyer = (userRoles: UserRole[]): boolean => {
  return userRoles.includes('BUYER');
};

/**
 * Check if user is seller
 */
export const isSeller = (userRoles: UserRole[]): boolean => {
  return userRoles.includes('SELLER');
};

/**
 * Check if user is cutter
 */
export const isCutter = (userRoles: UserRole[]): boolean => {
  return userRoles.includes('CUTTER');
};

/**
 * Get role display names
 */
export const getRoleDisplayNames = (roles: UserRole[]): string[] => {
  const map: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    BUYER: 'Buyer',
    SELLER: 'Seller',
    CUTTER: 'Cutter',
  };
  return roles.map(role => map[role] || role);
};