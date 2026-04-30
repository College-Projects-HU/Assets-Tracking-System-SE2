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
  purchaseCost: number;
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

export const mockAssets: Asset[] = [
  { id: 1, name: 'MacBook Pro 16"', assetTag: 'HW-001', category: 'HARDWARE', type: 'Laptop', brand: 'Apple', serialNumber: 'C02ZN1MDLVDM', status: 'ASSIGNED', description: 'Apple M3 Pro, 36GB RAM', purchaseDate: '2024-01-10', purchaseCost: 2499, warrantyExpiry: '2027-01-10', addDate: '2024-01-15', assignedTo: 'Ahmed Hassan', assignedToId: 1 },
  { id: 2, name: 'Dell Monitor 27"', assetTag: 'HW-002', category: 'HARDWARE', type: 'Monitor', brand: 'Dell', serialNumber: 'DL27U-XN3421', status: 'AVAILABLE', description: 'Dell UltraSharp U2723QE', purchaseDate: '2024-02-15', purchaseCost: 620, warrantyExpiry: '2027-02-15', addDate: '2024-02-20' },
  { id: 3, name: 'iPhone 15 Pro', assetTag: 'HW-003', category: 'HARDWARE', type: 'Phone', brand: 'Apple', serialNumber: 'DNQXK0P1HG', status: 'ASSIGNED', description: 'Company phone', purchaseDate: '2024-03-05', purchaseCost: 999, warrantyExpiry: '2025-03-05', addDate: '2024-03-10', assignedTo: 'Sara Ali', assignedToId: 2 },
  { id: 4, name: 'HP LaserJet Pro', assetTag: 'HW-004', category: 'HARDWARE', type: 'Printer', brand: 'HP', serialNumber: 'HPLJ-442211', status: 'UNDER_MAINTENANCE', description: 'Color laser printer - paper jam issue', purchaseDate: '2023-11-01', purchaseCost: 450, warrantyExpiry: '2025-11-01', addDate: '2023-11-05' },
  { id: 5, name: 'Lenovo ThinkPad X1', assetTag: 'HW-005', category: 'HARDWARE', type: 'Laptop', brand: 'Lenovo', serialNumber: 'LNV-TP-X1-0092', status: 'RETIRED', description: 'Old model, decommissioned', purchaseDate: '2020-06-10', purchaseCost: 1400, warrantyExpiry: '2023-06-10', addDate: '2020-06-15', retiredDate: '2024-07-01', retiredReason: 'End of life' },
  { id: 6, name: 'Cisco Router 4431', assetTag: 'HW-006', category: 'HARDWARE', type: 'Network', brand: 'Cisco', serialNumber: 'CSC-4431-7821', status: 'AVAILABLE', description: 'Enterprise router', purchaseDate: '2024-03-28', purchaseCost: 3200, warrantyExpiry: '2029-03-28', addDate: '2024-04-01' },
  { id: 7, name: 'Samsung Galaxy Tab S9', assetTag: 'HW-007', category: 'HARDWARE', type: 'Tablet', brand: 'Samsung', serialNumber: 'SM-X710-ABCD', status: 'ASSIGNED', description: 'Android tablet for field work', purchaseDate: '2024-05-08', purchaseCost: 850, warrantyExpiry: '2026-05-08', addDate: '2024-05-12', assignedTo: 'Omar Khaled', assignedToId: 3 },
  { id: 8, name: 'Microsoft 365 Business', assetTag: 'SW-001', category: 'SOFTWARE_LICENSE', type: 'Productivity Suite', brand: 'Microsoft', serialNumber: 'MS365-ENT-2024-001', status: 'ASSIGNED', description: '50-seat enterprise license', purchaseDate: '2024-01-01', purchaseCost: 12000, warrantyExpiry: '2025-01-01', addDate: '2024-01-05', assignedTo: 'IT Department', assignedToId: 4 },
  { id: 9, name: 'Adobe Creative Cloud', assetTag: 'SW-002', category: 'SOFTWARE_LICENSE', type: 'Design Suite', brand: 'Adobe', serialNumber: 'ACC-TEAM-2024-015', status: 'AVAILABLE', description: '10-seat team license', purchaseDate: '2024-03-01', purchaseCost: 6000, warrantyExpiry: '2025-03-01', addDate: '2024-03-05' },
  { id: 10, name: 'Dell Latitude 5540', assetTag: 'HW-008', category: 'HARDWARE', type: 'Laptop', brand: 'Dell', serialNumber: 'DL5540-QWE789', status: 'LOST_STOLEN', description: 'Reported stolen from office', purchaseDate: '2023-09-15', purchaseCost: 1200, warrantyExpiry: '2026-09-15', addDate: '2023-09-20' },
];

export const mockTickets: MaintenanceTicket[] = [
  {
    id: 1, ticketId: 'TKT-001', assetId: 4, assetName: 'HP LaserJet Pro', assetTag: 'HW-004',
    reportedBy: 'Sara Ali', reportedById: 2, issueDescription: 'Frequent paper jams and streaky prints. Toner may need replacement.',
    priority: 'HIGH', status: 'IN_PROGRESS',
    notes: ['Technician dispatched to inspect', 'Toner cartridge ordered'],
    technician: 'IT Support Team', createdAt: '2024-06-01', updatedAt: '2024-06-03',
  },
  {
    id: 2, ticketId: 'TKT-002', assetId: 1, assetName: 'MacBook Pro 16"', assetTag: 'HW-001',
    reportedBy: 'Ahmed Hassan', reportedById: 1, issueDescription: 'Battery drains within 2 hours even on light usage. Possible battery degradation.',
    priority: 'MEDIUM', status: 'OPEN',
    notes: [], createdAt: '2024-07-10', updatedAt: '2024-07-10',
  },
  {
    id: 3, ticketId: 'TKT-003', assetId: 7, assetName: 'Samsung Galaxy Tab S9', assetTag: 'HW-007',
    reportedBy: 'Omar Khaled', reportedById: 3, issueDescription: 'Screen flickering intermittently. Becomes unusable after 30 minutes.',
    priority: 'CRITICAL', status: 'OPEN',
    notes: [], createdAt: '2024-07-15', updatedAt: '2024-07-15',
  },
  {
    id: 4, ticketId: 'TKT-004', assetId: 6, assetName: 'Cisco Router 4431', assetTag: 'HW-006',
    reportedBy: 'Fatima Nour', reportedById: 4, issueDescription: 'Firmware update failed, device stuck in boot loop.',
    priority: 'HIGH', status: 'RESOLVED',
    notes: ['Firmware reflashed via console', 'Device tested and operational'],
    resolutionDetails: 'Reflashed firmware v15.9 via serial console. Ran diagnostics — all ports operational.',
    technician: 'Network Team', createdAt: '2024-05-20', updatedAt: '2024-05-22', resolvedAt: '2024-05-22',
  },
  {
    id: 5, ticketId: 'TKT-005', assetId: 3, assetName: 'iPhone 15 Pro', assetTag: 'HW-003',
    reportedBy: 'Sara Ali', reportedById: 2, issueDescription: 'Microphone not working during calls.',
    priority: 'LOW', status: 'CLOSED',
    notes: ['Software update applied', 'Issue resolved after iOS update'],
    resolutionDetails: 'Applied iOS 17.5 update which fixed the microphone driver issue.',
    technician: 'Mobile Support', createdAt: '2024-04-10', updatedAt: '2024-04-12', resolvedAt: '2024-04-11', closedAt: '2024-04-12',
  },
];

export const mockHistory: AssetHistoryItem[] = [
  { id: 1, assetName: 'MacBook Pro 16"', assetTag: 'HW-001', action: 'ASSIGNED', performedBy: 'Fatima Nour', date: '2024-01-16', details: 'Assigned to Ahmed Hassan' },
  { id: 2, assetName: 'iPhone 15 Pro', assetTag: 'HW-003', action: 'ASSIGNED', performedBy: 'Fatima Nour', date: '2024-03-11', details: 'Assigned to Sara Ali' },
  { id: 3, assetName: 'HP LaserJet Pro', assetTag: 'HW-004', action: 'UNDER_MAINTENANCE', performedBy: 'Fatima Nour', date: '2024-06-01', details: 'Maintenance ticket TKT-001 created' },
  { id: 4, assetName: 'Lenovo ThinkPad X1', assetTag: 'HW-005', action: 'RETIRED', performedBy: 'Fatima Nour', date: '2024-07-01', details: 'Decommissioned — end of life' },
  { id: 5, assetName: 'Dell Monitor 27"', assetTag: 'HW-002', action: 'ADDED', performedBy: 'Fatima Nour', date: '2024-02-20', details: 'New asset registered' },
  { id: 6, assetName: 'Samsung Galaxy Tab S9', assetTag: 'HW-007', action: 'ASSIGNED', performedBy: 'Fatima Nour', date: '2024-05-13', details: 'Assigned to Omar Khaled' },
  { id: 7, assetName: 'Dell Latitude 5540', assetTag: 'HW-008', action: 'LOST_STOLEN', performedBy: 'Fatima Nour', date: '2024-08-01', details: 'Reported stolen — police report filed' },
  { id: 8, assetName: 'Cisco Router 4431', assetTag: 'HW-006', action: 'MAINTENANCE_RESOLVED', performedBy: 'Network Team', date: '2024-05-22', details: 'Ticket TKT-004 resolved — firmware reflashed' },
];

export const mockStaff: StaffMember[] = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@company.com', role: 'EMPLOYEE', department: 'Engineering', assetsCount: 2, status: 'ACTIVE' },
  { id: 2, name: 'Sara Ali', email: 'sara@company.com', role: 'EMPLOYEE', department: 'Marketing', assetsCount: 1, status: 'ACTIVE' },
  { id: 3, name: 'Omar Khaled', email: 'omar@company.com', role: 'EMPLOYEE', department: 'Sales', assetsCount: 1, status: 'ACTIVE' },
  { id: 4, name: 'Fatima Nour', email: 'fatima@company.com', role: 'ADMIN', department: 'IT', assetsCount: 0, status: 'ACTIVE' },
  { id: 5, name: 'Youssef Mahmoud', email: 'youssef@company.com', role: 'ASSET_MANAGER', department: 'IT', assetsCount: 0, status: 'ACTIVE' },
  { id: 6, name: 'Layla Mostafa', email: 'layla@company.com', role: 'EMPLOYEE', department: 'HR', assetsCount: 0, status: 'ACTIVE' },
];

export const dashboardStats = {
  totalAssets: 10,
  assigned: 4,
  available: 2,
  underMaintenance: 1,
  retired: 1,
  lostStolen: 1,
  openTickets: 2,
  inProgressTickets: 1,
  resolvedTickets: 1,
  closedTickets: 1,
};
