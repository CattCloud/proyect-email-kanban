// src/lib/mock-data/user.ts
// Mock data para usuario del sistema
// Semana 1: Frontend Only - Sin autenticación real

export interface UserMock {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

// Usuario demo para la aplicación
export const mockUser: UserMock = {
  id: 'user-001',
  name: 'Usuario Demo',
  email: 'demo@emailkanban.com',
  avatar: null, // Usar iniciales en Avatar
  role: 'Ejecutivo Comercial'
};