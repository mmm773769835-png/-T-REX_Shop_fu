/**
 * Audit Log Service - خدمة تسجيل الأنشطة الأمنية
 * 
 * هذه الخدمة تقوم بتسجيل جميع الأنشطة الأمنية المهمة في التطبيق
 * مثل تسجيل الدخول، تسجيل الخروج، التغييرات في البيانات، إلخ.
 */

import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../config/firebaseConfig';

// تهيئة Firestore
const db = getFirestore();
const auth = getAuth();

interface AuditLogEntry {
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: any;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * تسجيل نشاط أمني
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const user = auth.currentUser;
    
    const logEntry: AuditLogEntry = {
      userId: user?.uid || entry.userId,
      userEmail: user?.email || entry.userEmail,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: entry.ipAddress || 'unknown',
      userAgent: entry.userAgent || 'unknown',
      timestamp: serverTimestamp(),
      status: entry.status,
      severity: entry.severity,
    };

    // إضافة السجل إلى مجموعة audit_logs في Firestore
    await addDoc(collection(db, 'audit_logs'), logEntry);
    
    console.log(`📝 Audit log created: ${entry.action} - ${entry.status}`);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

/**
 * تسجيل محاولة تسجيل الدخول
 */
export async function logLoginAttempt(email: string, success: boolean, ipAddress?: string): Promise<void> {
  await logAuditEvent({
    userEmail: email,
    action: 'LOGIN_ATTEMPT',
    resource: 'auth',
    details: { email },
    ipAddress,
    status: success ? 'success' : 'failure',
    severity: success ? 'low' : 'medium',
  });
}

/**
 * تسجيل تسجيل الخروج
 */
export async function logLogout(userId: string, email: string): Promise<void> {
  await logAuditEvent({
    userId,
    userEmail: email,
    action: 'LOGOUT',
    resource: 'auth',
    status: 'success',
    severity: 'low',
  });
}

/**
 * تسجيل تغيير في البيانات
 */
export async function logDataChange(userId: string, resource: string, details: any): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'DATA_CHANGE',
    resource,
    details,
    status: 'success',
    severity: 'medium',
  });
}

/**
 * تسجيل محاولة وصول غير مصرح به
 */
export async function logUnauthorizedAccess(resource: string, ipAddress?: string): Promise<void> {
  await logAuditEvent({
    action: 'UNAUTHORIZED_ACCESS',
    resource,
    details: { resource },
    ipAddress,
    status: 'failure',
    severity: 'high',
  });
}

/**
 * تسجيل خطأ في النظام
 */
export async function logSystemError(error: any, resource: string): Promise<void> {
  await logAuditEvent({
    action: 'SYSTEM_ERROR',
    resource,
    details: { 
      error: error.message,
      stack: error.stack,
    },
    status: 'failure',
    severity: 'critical',
  });
}

/**
 * الحصول على سجلات الأنشطة لمستخدم معين
 */
export async function getUserAuditLogs(userId: string, limitCount: number = 50): Promise<any[]> {
  try {
    const logsQuery = query(
      collection(db, 'audit_logs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(logsQuery);
    const logs: any[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * الحصول على سجلات الأنشطة ذات الأولوية العالية
 */
export async function getCriticalAuditLogs(limitCount: number = 20): Promise<any[]> {
  try {
    const logsQuery = query(
      collection(db, 'audit_logs'),
      where('severity', '==', 'critical'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(logsQuery);
    const logs: any[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching critical audit logs:', error);
    return [];
  }
}

export default {
  logAuditEvent,
  logLoginAttempt,
  logLogout,
  logDataChange,
  logUnauthorizedAccess,
  logSystemError,
  getUserAuditLogs,
  getCriticalAuditLogs,
};
