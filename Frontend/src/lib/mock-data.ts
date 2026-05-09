export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'RETIRED' | 'LOST_STOLEN';
export type AssetCategory = 'HARDWARE' | 'SOFTWARE_LICENSE';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Asset {
  id: number;
  name: string;
  assetTag: string;
  category: AssetCategory;
  type: string;
  brand: string;
  serialNumber: string;
  status: AssetStatus;
  description: string;
  purchaseDate: string;
  purchaseCost?: number;
  warrantyExpiry: string;
  addDate: string;
  assignedTo?: string;
  assignedToId?: number;
  retiredDate?: string;
  retiredReason?: string;
}

export interface MaintenanceTicket {
  id: number;
  ticketId: string;
  assetId: number;
  assetName: string;
  assetTag: string;
  reportedBy: string;
  reportedById: number;
  issueDescription: string;
  priority: TicketPriority;
  status: TicketStatus;
  notes: string[];
  resolutionDetails?: string;
  technician?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface AssetHistoryItem {
  id: number;
  assetName: string;
  assetTag: string;
  action: string;
  performedBy: string;
  date: string;
  details: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  assetsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}
