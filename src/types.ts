export interface DatabaseDoc {
  id: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  name: string;
  description: string;
  documents: DatabaseDoc[];
  indexes: string[];
  ownerId?: string; // Scopes collection to local developer users (null/undefined = Admin/Global)
}

export interface WebProject {
  id: string;
  name: string;
  domainUrl: string;
  description: string;
  apiKey: string;
  ownerId: string; // References AuthUser.id
  createdAt: string;
  authEmailPasswordEnabled?: boolean;
  authAllowRegistration?: boolean;
  minPasswordLength?: number;
  authRequireConfirm?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  password?: string; // Password support for live logging
  displayName: string;
  role: 'admin' | 'user' | 'anonymous';
  status: 'active' | 'suspended' | 'pending';
  lastSignIn: string;
}

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number; // bytes
  mimeType: string;
  content?: string; // Content for text files
  updatedAt: string;
  url?: string;
}

export interface CloudFunction {
  id: string;
  name: string;
  trigger: 'db:write' | 'auth:create' | 'http:get' | 'cron';
  code: string;
  status: 'active' | 'disabled';
  lastRun?: string;
}

export interface APIKey {
  id: string;
  name: string;
  secret: string;
  role: 'root' | 'read-only' | 'public';
  createdAt: string;
  lastUsed?: string;
}

export interface ZongoLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success';
  service: 'database' | 'auth' | 'storage' | 'functions' | 'gateway';
  message: string;
}

export interface RealtimeConnection {
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: string;
}

export interface DevMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  text: string;
  createdAt: string;
}

