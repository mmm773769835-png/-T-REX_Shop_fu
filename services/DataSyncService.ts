/**
 * Data Sync Service - خدمة المزامنة التلقائية للبيانات
 * 
 * Provides real-time synchronization with Firebase Firestore
 * Auto-updates data when changes occur in the database
 */

import { db } from './FirebaseAuthService';
import { collection, onSnapshot, query, orderBy, where, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface SyncConfig {
  collectionName: string;
  onDataUpdate: (data: any[]) => void;
  onError?: (error: Error) => void;
  filters?: {
    field: string;
    operator: string;
    value: any;
  }[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface UnsubscribeFunction {
  (): void;
}

/**
 * Real-time data sync service
 * يستمع للتغييرات في قاعدة البيانات ويحدث البيانات تلقائياً
 */
class DataSyncService {
  private activeListeners: Map<string, UnsubscribeFunction> = new Map();

  /**
   * Start real-time sync for a collection
   * بدء المزامنة الوقت الحقيقي لمجموعة بيانات
   */
  public startSync(config: SyncConfig): UnsubscribeFunction {
    const { 
      collectionName, 
      onDataUpdate, 
      onError,
      filters,
      orderByField,
      orderDirection 
    } = config;

    // Create unique key for this sync
    const syncKey = `${collectionName}_${JSON.stringify(filters || {})}`;

    // Stop existing listener if any
    if (this.activeListeners.has(syncKey)) {
      this.stopSync(syncKey);
    }

    try {
      // Build query
      let q: any = collection(db, collectionName);

      // Apply filters if provided
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator as any, filter.value));
        });
      }

      // Apply ordering if provided
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection || 'asc'));
      }

      // Start listening to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
          }));

          console.log(`🔄 Sync update for ${collectionName}: ${data.length} items`);
          onDataUpdate(data);
        },
        (error) => {
          console.error(`❌ Sync error for ${collectionName}:`, error);
          if (onError) {
            onError(error as Error);
          }
        }
      );

      // Store unsubscribe function
      this.activeListeners.set(syncKey, unsubscribe);

      console.log(`✅ Started syncing: ${collectionName}`);
      
      return () => this.stopSync(syncKey);
    } catch (error) {
      console.error(`Failed to start sync for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Stop sync for a specific collection
   * إيقاف المزامنة لمجموعة بيانات
   */
  public stopSync(syncKey: string): boolean {
    const unsubscribe = this.activeListeners.get(syncKey);
    
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(syncKey);
      console.log(`⏹️ Stopped syncing: ${syncKey}`);
      return true;
    }
    
    return false;
  }

  /**
   * Stop all active syncs
   * إيقاف جميع المزامنات النشطة
   */
  public stopAllSyncs(): void {
    this.activeListeners.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.activeListeners.clear();
    console.log('⏹️ All syncs stopped');
  }

  /**
   * Get active sync count
   * الحصول على عدد المزامنات النشطة
   */
  public getActiveSyncCount(): number {
    return this.activeListeners.size;
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

/**
 * Hook-like function for React components
 * دالة للاستخدام في مكونات React
 */
export function useRealTimeSync<T>(
  collectionName: string,
  filters?: SyncConfig['filters'],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = dataSyncService.startSync({
      collectionName,
      filters,
      orderByField,
      orderDirection,
      onDataUpdate: (newData) => {
        setData(newData as T[]);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [collectionName, filters, orderByField, orderDirection]);

  return { data, loading, error };
}

// Export for use in components
export default dataSyncService;
