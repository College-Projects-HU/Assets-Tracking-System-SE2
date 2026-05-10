import type {
  Asset,
  AssetCategory,
  AssetHistoryItem,
  AssetStatus,
  MaintenanceTicket,
  StaffMember,
  TicketPriority,
  TicketStatus,
  UserRole,
} from '@/lib/mock-data';

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface BackendRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface BackendLoginRequest {
  email: string;
  password: string;
}

export interface BackendUserRoleDto {
  id?: number;
  name: string;
}

export interface BackendUserDto {
  id: number;
  fullName: string;
  email: string;
  role?: BackendUserRoleDto | null;
  enabled?: boolean | null;
}

export interface BackendAssetDto {
  id: number;
  name: string;
  category: string;
  status: string;
  assignedUserId?: number | null;
  assignedUserName?: string | null;
  location?: string | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
}

export interface BackendAssignmentDto {
  id: number;
  assetId: number;
  assetName: string;
  userId: number;
  userName: string;
  assignedDate?: string | null;
  expectedReturnDate?: string | null;
  actualReturnDate?: string | null;
  status: string;
  notes?: string | null;
}

export interface BackendMaintenanceTicketDto {
  id: number;
  ticketId: string;
  assetId: number;
  reportedByUserId?: number | null;
  technicianId?: number | null;
  status: string;
  priority: string;
  description: string;
  notes?: string | null;
  resolutionDetails?: string | null;
  cost?: number | null;
  createdAt?: string | null;
  resolvedAt?: string | null;
  scheduledDate?: string | null;
}

export interface BackendAssignmentRequest {
  assetId: number;
  userId: number;
  userName: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface BackendAssetRequest {
  name: string;
  category: string;
  location?: string;
  purchaseDate: string;
  warrantyExpiry: string;
}

export interface BackendMaintenanceRequest {
  assetId: number;
  priority: TicketPriority;
  description: string;
  scheduledDate?: string;
}

export interface BackendMaintenanceNoteRequest {
  notes: string;
}

const assetTagFor = (id: number) => `ASSET-${String(id).padStart(3, '0')}`;
const defaultDepartment = 'Unassigned';

export const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

export const splitNotes = (notes?: string | null) => {
  if (!notes) return [];
  return notes
    .split(/\r?\n|\s*\|\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const mapUserDto = (user: BackendUserDto): StaffMember => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: ((user.role?.name || 'EMPLOYEE').replace(/^ROLE_/, '') as UserRole),
  department: defaultDepartment,
  assetsCount: 0,
  status: user.enabled === false ? 'INACTIVE' : 'ACTIVE',
});

export const mapAssetDto = (asset: BackendAssetDto): Asset => ({
  id: asset.id,
  name: asset.name,
  assetTag: assetTagFor(asset.id),
  category: (asset.category as AssetCategory) || 'HARDWARE',
  type: asset.location || 'Managed Asset',
  brand: asset.location || '—',
  serialNumber: `AST-${String(asset.id).padStart(4, '0')}`,
  status: (asset.status as AssetStatus) || 'AVAILABLE',
  description: asset.location || '',
  purchaseDate: formatDate(asset.purchaseDate),
  warrantyExpiry: formatDate(asset.warrantyExpiry),
  addDate: formatDate(asset.purchaseDate),
  assignedTo: asset.assignedUserName || undefined,
  assignedToId: asset.assignedUserId || undefined,
});

export const mapAssignmentDto = (assignment: BackendAssignmentDto): AssetHistoryItem => ({
  id: assignment.id,
  assetName: assignment.assetName,
  assetTag: assetTagFor(assignment.assetId),
  action: assignment.status,
  performedBy: assignment.userName,
  date: formatDate(assignment.assignedDate),
  details: assignment.notes || assignment.expectedReturnDate || 'Assignment recorded',
});

export const mapTicketDto = (
  ticket: BackendMaintenanceTicketDto,
  assetName: string,
  assetTag: string,
  reporterName: string,
): MaintenanceTicket => ({
  id: ticket.id,
  ticketId: ticket.ticketId,
  assetId: ticket.assetId,
  assetName,
  assetTag,
  reportedBy: reporterName,
  reportedById: ticket.reportedByUserId || 0,
  issueDescription: ticket.description,
  priority: (ticket.priority as TicketPriority) || 'MEDIUM',
  status: (ticket.status as TicketStatus) || 'OPEN',
  notes: splitNotes(ticket.notes),
  resolutionDetails: ticket.resolutionDetails || undefined,
  technician: ticket.technicianId ? `Technician #${ticket.technicianId}` : undefined,
  createdAt: formatDate(ticket.createdAt),
  updatedAt: formatDate(ticket.resolvedAt || ticket.createdAt),
  resolvedAt: formatDate(ticket.resolvedAt) || undefined,
  closedAt: undefined,
});

export const buildHistoryFromAssets = (assets: Asset[]): AssetHistoryItem[] => {
  const items: AssetHistoryItem[] = [];

  assets.forEach((asset) => {
    if (asset.assignedTo) {
      items.push({
        id: items.length + 1,
        assetName: asset.name,
        assetTag: asset.assetTag,
        action: 'ASSIGNED',
        performedBy: asset.assignedTo,
        date: asset.addDate || asset.purchaseDate,
        details: `Assigned to ${asset.assignedTo}`,
      });
    }

    if (asset.status === 'UNDER_MAINTENANCE') {
      items.push({
        id: items.length + 1,
        assetName: asset.name,
        assetTag: asset.assetTag,
        action: 'UNDER_MAINTENANCE',
        performedBy: 'System',
        date: asset.addDate || asset.purchaseDate,
        details: 'Marked under maintenance',
      });
    }

    if (asset.status === 'RETIRED' || asset.status === 'LOST_STOLEN') {
      items.push({
        id: items.length + 1,
        assetName: asset.name,
        assetTag: asset.assetTag,
        action: asset.status,
        performedBy: 'System',
        date: asset.addDate || asset.purchaseDate,
        details: `${asset.name} marked ${asset.status.replace('_', ' ').toLowerCase()}`,
      });
    }
  });

  return items.slice(0, 20);
};
