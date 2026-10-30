export type LangType = 'uz' | 'uz_cyrl' | 'ru';
export type UserRole = 'super_admin' | 'admin';

export interface Tariffs {
  hour1: number;
  hour1_5: number;
  hour2: number;
  vip: number;
  extraPersonPerHour: number;
  includedGuestsStandard: number;
}

export type RoomType = 'standard' | 'family' | 'vip';
export type RoomStatus = 'free' | 'partial' | 'busy';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  currentSessionId: string | null;
}

export interface ClientVisit {
  id: string;
  date: string;
  time: string;
  roomName: string;
  guestsCount: number;
  durationHours: number;
  totalAmount: number;
  paymentStatus: 'full' | 'deposit' | 'debt';
  paymentMethod: string;
  notes?: string;
}

export interface Client {
  id: string;
  phone: string;
  name: string;
  visitsCount: number;
  totalSpent: number;
  lastVisitDate: string;
  bonusBalance?: number;
  debtAmount?: number;
  status: string;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  visitsHistory?: ClientVisit[];
  registeredDate?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon?: string;
}

export interface BarOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type SessionType = 'instant' | 'booking';
export type SessionStatus = 'active' | 'overtime' | 'booking' | 'completed';
export type PaymentStatus = 'full' | 'deposit' | 'postpaid';
export type PaymentMethod = 'cash' | 'card' | 'qr' | 'mixed';

export interface Session {
  id: string;
  clientName: string;
  phone: string;
  guestsCount: number;
  roomId?: string;
  roomName: string;
  type: SessionType;
  durationHours: number;
  startTime?: string | null;
  endTime?: string | null;
  baseAmount: number;
  extraAmount: number;
  barOrders: BarOrderItem[];
  barTotal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  depositAmount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: SessionStatus;
  bookingDate?: string | null;
  bookingTime?: string | null;
  completedAt?: string | null;
  isExclusive?: boolean;
  isBonus?: boolean;
}

export interface Expense {
  id: string;
  time: string;
  category: string;
  amount: number;
  note: string;
  author: string;
}

export interface ActionLog {
  id: string;
  time: string;
  author: string;
  action: string;
}

export interface StaffBonusConfig {
  enabled: boolean;
  startTime: string; // masalan "20:00"
  endTime: string; // masalan "06:00"
  bonusHourlyRate: number; // masalan 25000 so'm/soat
}

export interface StaffShiftRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD masalan "2026-10-30"
  checkInTime: string; // HH:mm masalan "06:00"
  checkOutTime: string; // HH:mm masalan "19:00"
  breakHours: number; // masalan 1.5 ("ishdan tashqari holat / shaxsiy ish")
  breakReason?: string; // masalan "Uyga borib keldi"
  regularHours?: number; // kunduzgi sof soatlar
  bonusHours?: number; // tungi / bonus sof soatlar
  totalWorkHours: number; // sof ishlangan soat: regularHours + bonusHours
  hourlyRate: number; // kunduzgi soatlik stavka, masalan 20000
  bonusHourlyRate?: number; // bonus soatlik stavka, masalan 25000
  earnedAmount: number; // hisoblangan ish haqi
  cashAdvance: number; // kassirdan olingan pul (avans), masalan 100000
  balance: number; // earnedAmount - cashAdvance
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string; // Lavozimi: masalan "Sauna operatori / Texnik", "Farrosh / Tozalovchi", "Massajchi / Bannik", "Oshpaz"
  phone: string;
  hourlyRate: number; // Standart: 20000 so'm/soat
  status: 'active' | 'inactive';
  hireDate: string;
  notes?: string;
}

export interface AppContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: Record<string, string>;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  tariffs: Tariffs;
  setTariffs: React.Dispatch<React.SetStateAction<Tariffs>>;
  rooms: Room[];
  setRoomStatus: (roomId: string, newStatus: RoomStatus) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  findClientByPhone: (phone: string) => Client | undefined;
  addToBlacklist: (clientId: string, reason: string) => void;
  removeFromBlacklist: (clientId: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sessions: Session[];
  addSession: (sessionData: Partial<Session> & { clientName: string; phone: string }) => Session;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  extendSessionTime: (sessionId: string, extraMinutes: number) => void;
  finishSession: (sessionId: string) => void;
  startBookingSession: (sessionId: string) => void;
  cancelBooking: (sessionId: string, reason?: string) => void;
  addBarOrderToSession: (sessionId: string, orderedItem: BarOrderItem) => void;
  expenses: Expense[];
  addExpense: (expenseData: { category: string; amount: number; note?: string }) => void;
  actionLogs: ActionLog[];
  addLog: (actionText: string) => void;

  // Staff & Payroll Management
  staffMembers: StaffMember[];
  setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  staffShifts: StaffShiftRecord[];
  setStaffShifts: React.Dispatch<React.SetStateAction<StaffShiftRecord[]>>;
  defaultStaffHourlyRate: number;
  setDefaultStaffHourlyRate: (rate: number) => void;
  staffBonusConfig: StaffBonusConfig;
  setStaffBonusConfig: (config: StaffBonusConfig) => void;
  addStaffMember: (member: Omit<StaffMember, 'id'>) => StaffMember;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  addStaffShift: (
    shiftData: Omit<StaffShiftRecord, 'id' | 'totalWorkHours' | 'earnedAmount' | 'balance' | 'createdAt'>,
    syncToCashier?: boolean
  ) => StaffShiftRecord;
  updateStaffShift: (id: string, updates: Partial<StaffShiftRecord>) => void;
  deleteStaffShift: (id: string) => void;

  currentTime: number;
  activeReceiptSession: Session | null;
  setActiveReceiptSession: (session: Session | null) => void;
  activeBarOrderSession: Session | null;
  setActiveBarOrderSession: (session: Session | null) => void;
  isShiftModalOpen: boolean;
  setIsShiftModalOpen: (open: boolean) => void;
  quickRegPrefill: any;
  setQuickRegPrefill: (data: any) => void;
  resetAllData: () => void;
  autoPersist: boolean;
  setAutoPersist: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean) => void;
}
