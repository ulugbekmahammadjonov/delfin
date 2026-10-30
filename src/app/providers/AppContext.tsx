import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  initialTariffs,
  getFreshRooms,
  initialClients,
  initialProducts,
  getFreshSessions,
  initialExpenses,
  initialActionLogs,
  initialStaffMembers,
  initialStaffShifts,
} from '@/shared/data/mockData';
import {
  Tariffs,
  Room,
  Client,
  Product,
  Session,
  Expense,
  ActionLog,
  BarOrderItem,
  RoomStatus,
  LangType,
  UserRole,
  AppContextType,
  StaffMember,
  StaffShiftRecord,
  StaffBonusConfig,
} from '@/shared/types';
import { translations } from '@/shared/utils/translations';
import { soundManager } from '@/shared/utils/audio';
import { formatTime24, calculateShiftHours, calculateShiftBreakdown } from '@/shared/utils/dateUtils';

const AppContext = createContext<AppContextType | null>(null);

// LocalStorage Helper
const loadLocal = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`delfin_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveLocal = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(`delfin_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Settings
  const [lang, setLang] = useState<LangType>(() => loadLocal('lang', 'uz'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadLocal('darkMode', true));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadLocal('sound', true));
  const [userRole, setUserRole] = useState<UserRole>(() => loadLocal('role', 'super_admin'));
  const [autoPersist, setAutoPersist] = useState<boolean>(() => loadLocal('autoPersist', true));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    loadLocal('sidebar_collapsed', false)
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      saveLocal('sidebar_collapsed', next);
      return next;
    });
  };

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Route-based currentTab
  const getTabFromPath = (path: string): string => {
    if (path.startsWith('/registration')) return 'registration';
    if (path.startsWith('/rooms')) return 'rooms';
    if (path.startsWith('/minibar')) return 'minibar';
    if (path.startsWith('/crm')) return 'crm';
    if (path.startsWith('/cashier')) return 'cashier';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentTab = getTabFromPath(location.pathname);

  const setCurrentTab = (tab: string) => {
    const pathToTab: Record<string, string> = {
      dashboard: '/',
      registration: '/registration',
      rooms: '/rooms',
      minibar: '/minibar',
      crm: '/crm',
      cashier: '/cashier',
      staff: '/staff',
      settings: '/settings',
    };
    navigate(pathToTab[tab] || '/');
  };

  // Core Data States with persistence
  const [tariffs, setTariffs] = useState<Tariffs>(() => loadLocal('tariffs', initialTariffs));
  const [rooms, setRooms] = useState<Room[]>(() => {
    const loaded = loadLocal<Room[]>('rooms', []);
    if (loaded && loaded.length === 2 && loaded.every((r) => r.id === 'r1' || r.id === 'r2')) {
      return loaded.map((r) => {
        const updatedName = r.name ? r.name.replace(/zal/gi, 'sauna').replace(/xona/gi, 'sauna') : r.name;
        return {
          ...r,
          name: updatedName,
          status: (r.status as string) === 'cleaning' ? ('free' as const) : r.status,
        };
      });
    }
    return getFreshRooms();
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const loaded = loadLocal<Client[]>('clients', []);
    if (loaded && loaded.length > 0 && loaded.some((c) => c.visitsHistory && c.visitsHistory.length > 0)) {
      return loaded.map((c) => ({
        ...c,
        notes: c.notes ? c.notes.replace(/zal/gi, 'sauna').replace(/xona/gi, 'sauna') : c.notes,
        visitsHistory: Array.isArray(c.visitsHistory)
          ? c.visitsHistory.map((v) => ({
              ...v,
              roomName: v.roomName ? v.roomName.replace(/zal/gi, 'sauna').replace(/xona/gi, 'sauna') : 'Sauna',
            }))
          : [],
      }));
    }
    return initialClients;
  });
  const [products, setProducts] = useState<Product[]>(() => loadLocal('products', initialProducts));
  const [sessions, setSessions] = useState<Session[]>(() => {
    const loaded = loadLocal<Session[]>('sessions', []);
    if (loaded && loaded.length > 0 && loaded.every((s) => s.roomId === 'r1' || s.roomId === 'r2')) {
      return loaded.map((s) => ({
        ...s,
        roomName: s.roomName ? s.roomName.replace(/zal/gi, 'sauna').replace(/xona/gi, 'sauna') : 'Sauna',
        barOrders: Array.isArray(s.barOrders) ? s.barOrders : [],
      }));
    }
    return getFreshSessions();
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLocal('expenses', initialExpenses));
  const [actionLogs, setActionLogs] = useState<ActionLog[]>(() => loadLocal('actionLogs', initialActionLogs));

  // Staff & Payroll state
  const [defaultStaffHourlyRate, setDefaultStaffHourlyRateState] = useState<number>(() =>
    loadLocal('staff_hourly_rate', 20000)
  );
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    loadLocal('staff_members', initialStaffMembers)
  );
  const [staffShifts, setStaffShifts] = useState<StaffShiftRecord[]>(() =>
    loadLocal('staff_shifts', initialStaffShifts)
  );
  const [staffBonusConfig, setStaffBonusConfigState] = useState<StaffBonusConfig>(() =>
    loadLocal('staff_bonus_config', {
      enabled: true,
      startTime: '20:00',
      endTime: '06:00',
      bonusHourlyRate: 25000,
    })
  );

  // Sync to LocalStorage if autoPersist is true
  useEffect(() => { saveLocal('lang', lang); }, [lang]);
  useEffect(() => { saveLocal('darkMode', isDarkMode); }, [isDarkMode]);
  useEffect(() => { saveLocal('sound', soundEnabled); }, [soundEnabled]);
  useEffect(() => { saveLocal('role', userRole); }, [userRole]);
  useEffect(() => { saveLocal('autoPersist', autoPersist); }, [autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('tariffs', tariffs);
  }, [tariffs, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('rooms', rooms);
  }, [rooms, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('clients', clients);
  }, [clients, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('products', products);
  }, [products, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('sessions', sessions);
  }, [sessions, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('expenses', expenses);
  }, [expenses, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('actionLogs', actionLogs);
  }, [actionLogs, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('staff_members', staffMembers);
  }, [staffMembers, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('staff_shifts', staffShifts);
  }, [staffShifts, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('staff_hourly_rate', defaultStaffHourlyRate);
  }, [defaultStaffHourlyRate, autoPersist]);

  useEffect(() => {
    if (autoPersist) saveLocal('staff_bonus_config', staffBonusConfig);
  }, [staffBonusConfig, autoPersist]);

  // Reset all data to default mock state
  const resetAllData = () => {
    const keys = [
      'tariffs',
      'rooms',
      'clients',
      'products',
      'sessions',
      'expenses',
      'actionLogs',
      'staff_members',
      'staff_shifts',
      'staff_hourly_rate',
      'staff_bonus_config',
    ];
    keys.forEach((k) => localStorage.removeItem(`delfin_${k}`));

    setTariffs(initialTariffs);
    setRooms(getFreshRooms());
    setClients(initialClients);
    setProducts(initialProducts);
    setSessions(getFreshSessions());
    setExpenses(initialExpenses);
    setActionLogs(initialActionLogs);
    setStaffMembers(initialStaffMembers);
    setStaffShifts(initialStaffShifts);
    setDefaultStaffHourlyRateState(20000);
    setStaffBonusConfigState({
      enabled: true,
      startTime: '20:00',
      endTime: '06:00',
      bonusHourlyRate: 25000,
    });

    soundManager.playSuccess();
  };

  // Modals
  const [activeReceiptSession, setActiveReceiptSession] = useState<Session | null>(null);
  const [activeBarOrderSession, setActiveBarOrderSession] = useState<Session | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [quickRegPrefill, setQuickRegPrefill] = useState<any>(null);

  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [alertedOvertimeIds, setAlertedOvertimeIds] = useState<Set<string>>(new Set());

  // Dark mode class sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Audio manager toggle sync
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      sessions.forEach((s) => {
        if (s.status === 'active' && s.endTime) {
          const diff = new Date(s.endTime).getTime() - now;
          if (diff <= 0) {
            setSessions((prev) =>
              prev.map((item) =>
                item.id === s.id ? { ...item, status: 'overtime' } : item
              )
            );
            if (!alertedOvertimeIds.has(s.id)) {
              soundManager.playOvertimeDing();
              setAlertedOvertimeIds((prev) => new Set(prev).add(s.id));
              addLog(`DIQQAT: "${s.clientName}" (${s.roomName}) seans vaqti tugadi va overtime boshlandi!`);
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessions, alertedOvertimeIds]);

  const t = translations[lang] || translations.uz;

  const addLog = (actionText: string) => {
    const nowTime = formatTime24(new Date());
    const authorName = userRole === 'super_admin' ? 'Super Admin' : 'Dilshod (Administrator)';
    const newLog: ActionLog = {
      id: 'l_' + Date.now(),
      time: nowTime,
      author: authorName,
      action: actionText,
    };
    setActionLogs((prev) => [newLog, ...prev]);
  };

  const findClientByPhone = (rawPhone: string): Client | undefined => {
    const clean = rawPhone.replace(/\D/g, '');
    return clients.find((c) => c.phone.replace(/\D/g, '').endsWith(clean.slice(-9)));
  };

  const upsertClient = (clientData: { phone: string; name: string; amount?: number }): Client => {
    const existing = findClientByPhone(clientData.phone);
    if (existing) {
      const updated: Client = {
        ...existing,
        name: clientData.name || existing.name,
        visitsCount: existing.visitsCount + 1,
        totalSpent: existing.totalSpent + (clientData.amount || 0),
        lastVisitDate: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [updated, ...prev.filter((c) => c.id !== existing.id)]);
      return updated;
    } else {
      const newClient: Client = {
        id: 'c_' + Date.now(),
        phone: clientData.phone,
        name: clientData.name,
        visitsCount: 1,
        totalSpent: clientData.amount || 0,
        lastVisitDate: new Date().toISOString().split('T')[0],
        registeredDate: new Date().toISOString().split('T')[0],
        status: 'Yangi mijoz',
        isBlacklisted: false,
        blacklistReason: null,
      };
      setClients((prev) => [newClient, ...prev]);
      return newClient;
    }
  };

  const addSession = (sessionData: Partial<Session> & { clientName: string; phone: string }): Session => {
    const newId = 's_' + Date.now();
    const duration = sessionData.durationHours || 1;
    const startTime = sessionData.startTime || new Date().toISOString();
    const endTime = sessionData.endTime || new Date(new Date(startTime).getTime() + duration * 3600000).toISOString();

    const newSession: Session = {
      id: newId,
      clientName: sessionData.clientName,
      phone: sessionData.phone,
      guestsCount: sessionData.guestsCount || 1,
      roomId: sessionData.roomId,
      roomName: sessionData.roomName || 'Sauna',
      type: sessionData.type || 'instant',
      durationHours: duration,
      startTime: startTime,
      endTime: endTime,
      baseAmount: sessionData.baseAmount || 0,
      extraAmount: sessionData.extraAmount || 0,
      barOrders: sessionData.barOrders || [],
      barTotal: sessionData.barTotal || 0,
      totalAmount: sessionData.totalAmount || 0,
      paymentStatus: sessionData.paymentStatus || 'postpaid',
      depositAmount: sessionData.depositAmount || 0,
      paymentMethod: sessionData.paymentMethod || 'cash',
      notes: sessionData.notes || '',
      status: sessionData.type === 'instant' ? 'active' : 'booking',
      bookingDate: sessionData.bookingDate || null,
      bookingTime: sessionData.bookingTime || null,
      isExclusive: sessionData.isExclusive || false,
      isBonus: sessionData.isBonus || false,
    };

    setSessions((prev) => [newSession, ...prev]);

    if (sessionData.type === 'instant' && sessionData.roomId) {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== sessionData.roomId) return r;
          const currentActive = sessions.filter(
            (s) => s.roomId === r.id && (s.status === 'active' || s.status === 'overtime')
          );
          const hasExclusive = Boolean(sessionData.isExclusive || currentActive.some((s) => s.isExclusive));
          const totalGuests =
            currentActive.reduce((acc, s) => acc + (s.guestsCount || 0), 0) + (sessionData.guestsCount || 1);
          const newStatus: RoomStatus = (hasExclusive || totalGuests >= r.capacity) ? 'busy' : 'partial';
          return { ...r, status: newStatus, currentSessionId: newId };
        })
      );
    }

    upsertClient({
      phone: sessionData.phone,
      name: sessionData.clientName,
      amount: sessionData.totalAmount,
    });

    soundManager.playSuccess();
    addLog(
      sessionData.type === 'instant'
        ? `Yangi seans boshlandi: ${sessionData.roomName} (${sessionData.clientName}, ${duration} soat, ${sessionData.totalAmount?.toLocaleString()} so'm)`
        : `Oldindan bron qilindi: ${sessionData.roomName} (${sessionData.clientName}, kelish: ${sessionData.bookingDate} ${sessionData.bookingTime})`
    );

    return newSession;
  };

  const extendSessionTime = (sessionId: string, extraMinutes: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const currentEnd = s.endTime ? new Date(s.endTime).getTime() : Date.now();
        const newEndTime = new Date(Math.max(Date.now(), currentEnd) + extraMinutes * 60000).toISOString();
        const extraHours = extraMinutes / 60;
        const addedCost = Math.round((tariffs.hour1 / 1) * extraHours);

        return {
          ...s,
          endTime: newEndTime,
          durationHours: s.durationHours + extraHours,
          totalAmount: s.totalAmount + addedCost,
          status: 'active' as const,
        };
      })
    );

    soundManager.playSuccess();
    addLog(`Seans uzaytirildi (+${extraMinutes} daqiqa, ID: ${sessionId})`);
  };

  const finishSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const nowIso = new Date().toISOString();

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'completed' as const,
              paymentStatus: 'full' as const,
              completedAt: nowIso,
            }
          : s
      )
    );

    if (session.roomId) {
      const remainingActiveSessions = sessions.filter(
        (s) => s.id !== sessionId && s.roomId === session.roomId && (s.status === 'active' || s.status === 'overtime')
      );
      const remainingGuests = remainingActiveSessions.reduce((acc, s) => acc + (s.guestsCount || 0), 0);
      const hasExclusive = remainingActiveSessions.some((s) => s.isExclusive);
      const room = rooms.find((r) => r.id === session.roomId);
      const capacity = room?.capacity || 7;

      const newStatus: RoomStatus =
        remainingGuests === 0 ? 'free' : (hasExclusive || remainingGuests >= capacity) ? 'busy' : 'partial';

      setRooms((prev) =>
        prev.map((r) =>
          r.id === session.roomId
            ? { ...r, status: newStatus, currentSessionId: remainingActiveSessions[0]?.id || null }
            : r
        )
      );
    }

    soundManager.playSuccess();
    addLog(`Seans yakunlandi: ${session.roomName} (${session.clientName}).`);
  };

  const startBookingSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const nowIso = new Date().toISOString();
    const endIso = new Date(Date.now() + session.durationHours * 3600000).toISOString();

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'active' as const,
              type: 'instant' as const,
              startTime: nowIso,
              endTime: endIso,
            }
          : s
      )
    );

    if (session.roomId) {
      const otherActive = sessions.filter(
        (s) => s.id !== sessionId && s.roomId === session.roomId && (s.status === 'active' || s.status === 'overtime')
      );
      const room = rooms.find((r) => r.id === session.roomId);
      const capacity = room?.capacity || 7;
      const totalGuests = otherActive.reduce((acc, s) => acc + (s.guestsCount || 0), 0) + (session.guestsCount || 0);
      const isBusy = Boolean(session.isExclusive || otherActive.some((s) => s.isExclusive) || totalGuests >= capacity);

      const newStatus: RoomStatus = isBusy ? 'busy' : 'partial';

      setRooms((prev) =>
        prev.map((r) =>
          r.id === session.roomId
            ? { ...r, status: newStatus, currentSessionId: sessionId }
            : r
        )
      );
    }

    soundManager.playSuccess();
    addLog(`Bron qilingan mijoz keldi va seans boshlandi: ${session.roomName} (${session.clientName})`);
  };

  const cancelBooking = (sessionId: string, reason: string = 'Mijoz kelmadi') => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addLog(`DIQQAT: Bron bekor qilindi! (${session.clientName}, sauna: ${session.roomName}, sababi: ${reason})`);
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
    const session = sessions.find((s) => s.id === sessionId);
    addLog(`Bron ma'lumotlari yangilandi: ${updates.clientName || session?.clientName} (${updates.roomName || session?.roomName})`);
    soundManager.playSuccess();
  };

  const addBarOrderToSession = (sessionId: string, orderedItem: BarOrderItem) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const existingIdx = s.barOrders.findIndex((o) => o.productId === orderedItem.productId);
        let updatedOrders = [...s.barOrders];
        if (existingIdx >= 0) {
          updatedOrders[existingIdx] = {
            ...updatedOrders[existingIdx],
            quantity: updatedOrders[existingIdx].quantity + orderedItem.quantity,
          };
        } else {
          updatedOrders.push(orderedItem);
        }

        const addedSum = orderedItem.price * orderedItem.quantity;
        return {
          ...s,
          barOrders: updatedOrders,
          barTotal: s.barTotal + addedSum,
          totalAmount: s.totalAmount + addedSum,
        };
      })
    );

    setProducts((prev) =>
      prev.map((p) =>
        p.id === orderedItem.productId
          ? { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) }
          : p
      )
    );

    soundManager.playSuccess();
    addLog(`Mini-bar buyurtmasi qo'shildi: ${orderedItem.name} (${orderedItem.quantity}x)`);
  };

  const addToBlacklist = (clientId: string, reason: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, isBlacklisted: true, blacklistReason: reason, status: 'Qora ro\'yxat' }
          : c
      )
    );
    const client = clients.find((c) => c.id === clientId);
    addLog(`DIQQAT: Mijoz qora ro'yxatga kiritildi: ${client?.name || clientId} (Sababi: ${reason})`);
  };

  const removeFromBlacklist = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, isBlacklisted: false, blacklistReason: null, status: 'Mijoz' }
          : c
      )
    );
    const client = clients.find((c) => c.id === clientId);
    addLog(`Mijoz qora ro'yxatdan chiqarildi: ${client?.name || clientId}`);
  };

  const setRoomStatus = (roomId: string, newStatus: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: newStatus, currentSessionId: newStatus === 'free' ? null : r.currentSessionId }
          : r
      )
    );
    const room = rooms.find((r) => r.id === roomId);
    addLog(`Sauna holati o'zgartirildi: ${room?.name} -> ${newStatus.toUpperCase()}`);
    soundManager.playSuccess();
  };

  const addExpense = (expenseData: { category: string; amount: number; note?: string }) => {
    const newExp: Expense = {
      id: 'e_' + Date.now(),
      time: formatTime24(new Date()),
      category: expenseData.category,
      amount: expenseData.amount || 0,
      note: expenseData.note || '',
      author: userRole === 'super_admin' ? 'Super Admin' : 'Dilshod (Administrator)',
    };
    setExpenses((prev) => [newExp, ...prev]);
    addLog(`Xarajat kiritildi: ${newExp.category} - ${newExp.amount.toLocaleString()} so'm (${newExp.note})`);
    soundManager.playSuccess();
  };

  // Staff & Payroll Management Methods
  const setDefaultStaffHourlyRate = (rate: number) => {
    setDefaultStaffHourlyRateState(rate);
    saveLocal('staff_hourly_rate', rate);
    addLog(`Xodimlarning soatlik stavkasi yangilandi: ${rate.toLocaleString()} so'm/soat`);
    soundManager.playSuccess();
  };

  const setStaffBonusConfig = (config: StaffBonusConfig) => {
    setStaffBonusConfigState(config);
    saveLocal('staff_bonus_config', config);
    addLog(`Super Admin tomonidan xodimlarning bonus stavkasi yangilandi (${config.startTime}-${config.endTime}: ${config.bonusHourlyRate.toLocaleString()} so'm/soat)`);
    soundManager.playSuccess();
  };

  const addStaffMember = (memberData: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...memberData,
      id: `emp_${Date.now()}`,
      hourlyRate: memberData.hourlyRate || defaultStaffHourlyRate,
    };
    setStaffMembers((prev) => [newMember, ...prev]);
    addLog(`Yangi xodim qo'shildi: ${newMember.name} (${newMember.role})`);
    soundManager.playSuccess();
    return newMember;
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    addLog(`Xodim ma'lumotlari tahrirlandi (ID: ${id})`);
    soundManager.playSuccess();
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers((prev) => prev.filter((m) => m.id !== id));
    addLog(`Xodim o'chirildi (ID: ${id})`);
    soundManager.playSuccess();
  };

  const addStaffShift = (
    shiftData: Omit<StaffShiftRecord, 'id' | 'totalWorkHours' | 'earnedAmount' | 'balance' | 'createdAt'>,
    syncToCashier: boolean = true
  ): StaffShiftRecord => {
    const rate = shiftData.hourlyRate || defaultStaffHourlyRate;
    const breakdown = calculateShiftBreakdown(
      shiftData.checkInTime,
      shiftData.checkOutTime,
      shiftData.breakHours,
      rate,
      staffBonusConfig
    );
    const earned = breakdown.totalEarned;
    const advance = Math.round(Number(shiftData.cashAdvance) || 0);
    const bal = earned - advance;

    const newShift: StaffShiftRecord = {
      ...shiftData,
      id: `shift_${Date.now()}`,
      regularHours: breakdown.regularHours,
      bonusHours: breakdown.bonusHours,
      totalWorkHours: breakdown.netHours,
      hourlyRate: rate,
      bonusHourlyRate: staffBonusConfig.enabled ? staffBonusConfig.bonusHourlyRate : undefined,
      earnedAmount: earned,
      cashAdvance: advance,
      balance: bal,
      createdAt: new Date().toISOString(),
    };

    setStaffShifts((prev) => [newShift, ...prev]);
    addLog(`Xodim smenasi qayd etildi: ${shiftData.employeeName} (${shiftData.date}, ${breakdown.netHours} soat: ${breakdown.regularHours}h kunduzgi, ${breakdown.bonusHours}h bonus, ${earned.toLocaleString()} so'm)`);
    soundManager.playSuccess();

    if (advance > 0 && syncToCashier) {
      addExpense({
        category: 'Xodimlarga avans / ish haqi',
        amount: advance,
        note: `${shiftData.employeeName} ga berilgan avans (${shiftData.date})`,
      });
    }

    return newShift;
  };

  const updateStaffShift = (id: string, updates: Partial<StaffShiftRecord>) => {
    setStaffShifts((prev) =>
      prev.map((shift) => {
        if (shift.id !== id) return shift;
        const merged = { ...shift, ...updates };
        const rate = merged.hourlyRate || defaultStaffHourlyRate;
        const breakdown = calculateShiftBreakdown(
          merged.checkInTime,
          merged.checkOutTime,
          merged.breakHours,
          rate,
          staffBonusConfig
        );
        const earned = breakdown.totalEarned;
        const advance = Math.round(Number(merged.cashAdvance) || 0);
        const bal = earned - advance;
        return {
          ...merged,
          regularHours: breakdown.regularHours,
          bonusHours: breakdown.bonusHours,
          totalWorkHours: breakdown.netHours,
          hourlyRate: rate,
          bonusHourlyRate: staffBonusConfig.enabled ? staffBonusConfig.bonusHourlyRate : undefined,
          earnedAmount: earned,
          cashAdvance: advance,
          balance: bal,
        };
      })
    );
    addLog(`Xodim smenasi yangilandi (ID: ${id})`);
    soundManager.playSuccess();
  };

  const deleteStaffShift = (id: string) => {
    setStaffShifts((prev) => prev.filter((s) => s.id !== id));
    addLog(`Xodim smenasi o'chirildi (ID: ${id})`);
    soundManager.playSuccess();
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode: () => setIsDarkMode((prev) => !prev),
        soundEnabled,
        toggleSound: () => setSoundEnabled((prev) => !prev),
        userRole,
        setUserRole,
        currentTab,
        setCurrentTab,

        tariffs,
        setTariffs,
        rooms,
        setRoomStatus,
        clients,
        setClients,
        findClientByPhone,
        addToBlacklist,
        removeFromBlacklist,
        products,
        setProducts,
        sessions,
        addSession,
        extendSessionTime,
        finishSession,
        startBookingSession,
        cancelBooking,
        updateSession,
        addBarOrderToSession,
        expenses,
        addExpense,
        actionLogs,
        addLog,

        staffMembers,
        setStaffMembers,
        staffShifts,
        setStaffShifts,
        defaultStaffHourlyRate,
        setDefaultStaffHourlyRate,
        staffBonusConfig,
        setStaffBonusConfig,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        addStaffShift,
        updateStaffShift,
        deleteStaffShift,

        currentTime,
        activeReceiptSession,
        setActiveReceiptSession,
        activeBarOrderSession,
        setActiveBarOrderSession,
        isShiftModalOpen,
        setIsShiftModalOpen,
        quickRegPrefill,
        setQuickRegPrefill,
        resetAllData,
        autoPersist,
        setAutoPersist,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
