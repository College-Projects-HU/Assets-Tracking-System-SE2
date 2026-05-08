export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'RETIRED' | 'LOST_STOLEN';
export type AssetCategory = 'HARDWARE' | 'SOFTWARE_LICENSE';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AssetRecord {
  id: number;
  assetTag: string;
  name: string;
  category: AssetCategory | string;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  location: string | null;
  notes: string | null;
  status: AssetStatus;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRecord {
  id: number;
  assetId: number;
  assigneeUserId: number;
  assignedBy: number;
  assignedAt: string;
  returnedAt: string | null;
  notes: string | null;
}

export interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface TicketNoteRecord {
  id: number;
  authorUserId: number;
  note: string;
  createdAt: string;
}

export interface MaintenanceTicketRecord {
  id: number;
  ticketCode: string;
  assetId: number;
  reportedByUserId: number;
  technicianUserId: number | null;
  priority: TicketPriority;
  status: TicketStatus;
  issueDescription: string;
  resolutionDetails: string | null;
  maintenanceCost: number | null;
  scheduledAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: TicketNoteRecord[];
}

export interface ReportAssetCategoryStatusCount {
  category: string;
  statusCounts: Record<string, number>;
}

export interface ReportAssignmentSummary {
  id: number;
  assetId: number;
  assigneeId: number;
  assigneeName: string;
  status: string;
}

export interface ReportMaintenanceCost {
  totalCost: number;
  byCategory: Record<string, number>;
}

export interface DashboardStatsRecord {
  assetSummary: ReportAssetCategoryStatusCount[];
  activeAssignments: ReportAssignmentSummary[];
  maintenanceCosts: ReportMaintenanceCost;
}

export interface AuditLogRecord {
  id: number;
  actor: string;
  action: string;
  details: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
