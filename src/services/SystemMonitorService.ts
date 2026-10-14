/**
 * SystemMonitorService.ts
 * خدمة المراقبة المباشرة للتطبيق: رصد المتصلين، تسجيل الأخطاء، وفحص تحديثات التطبيق
 */

import { Platform, AppState, AppStateStatus } from 'react-native';
import supabase from './SupabaseService';

export interface AppUpdateInfo {
  id: string;
  version_name: string;
  version_code?: number;
  title: string;
  message: string;
  download_url: string;
  is_force_update: boolean;
  is_active: boolean;
  created_at?: string;
}

export class SystemMonitorService {
  private static instance: SystemMonitorService;
  private presenceChannel: any = null;
  private currentVersion = '2.0.0';
  private updateListeners: ((update: AppUpdateInfo | null) => void)[] = [];
  private activeUpdate: AppUpdateInfo | null = null;

  static getInstance(): SystemMonitorService {
    if (!SystemMonitorService.instance) {
      SystemMonitorService.instance = new SystemMonitorService();
    }
    return SystemMonitorService.instance;
  }

  setCurrentVersion(version: string) {
    this.currentVersion = version;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  // ==============================================================
  // 1. رصد المتصلين المباشر في التطبيق (Realtime Presence)
  // ==============================================================
  startPresenceTracking() {
    try {
      if (this.presenceChannel) return;

      const clientKey = 'app_' + Platform.OS + '_' + Math.random().toString(36).substring(2, 9);
      this.presenceChannel = supabase.channel('online_presence', {
        config: {
          presence: { key: clientKey }
        }
      });

      this.presenceChannel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await this.trackPresenceState();
        }
      });

      // مراقبة حالة التطبيق (Foreground / Background)
      AppState.addEventListener('change', this.handleAppStateChange);
    } catch (err) {
      console.warn('SystemMonitorService: error starting presence tracking:', err);
    }
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      await this.trackPresenceState();
      // فحص التحديثات عند العودة للتطبيق
      this.checkLatestUpdate();
    } else if (nextAppState === 'background') {
      try {
        if (this.presenceChannel) {
          await this.presenceChannel.untrack();
        }
      } catch (e) {}
    }
  };

  private async trackPresenceState() {
    try {
      if (this.presenceChannel) {
        await this.presenceChannel.track({
          platform: 'app',
          os: Platform.OS,
          version: this.currentVersion,
          online_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('SystemMonitorService: trackPresenceState failed:', err);
    }
  }

  // ==============================================================
  // 2. تسجيل الأخطاء والكراش في السحابة فوراً (Realtime Error Logger)
  // ==============================================================
  async logError(
    errorMessage: string,
    stackTrace?: string,
    screenOrUrl?: string,
    extraInfo?: any
  ): Promise<void> {
    try {
      console.log('📝 SystemMonitorService: Logging error to cloud:', errorMessage);

      const payload = {
        platform: 'app',
        error_message: String(errorMessage || 'Unknown App Error'),
        stack_trace: stackTrace || '',
        screen_or_url: screenOrUrl || 'App_Runtime',
        device_info: {
          os: Platform.OS,
          osVersion: Platform.Version,
          appVersion: this.currentVersion,
          ...extraInfo
        },
        severity: 'high',
        status: 'new'
      };

      await supabase.from('system_error_logs').insert([payload]);
    } catch (err) {
      console.warn('SystemMonitorService: Failed to log error to cloud:', err);
    }
  }

  // ==============================================================
  // 3. نظام تحديثات التطبيق (App Updates & Force Update)
  // ==============================================================
  onUpdateAvailable(callback: (update: AppUpdateInfo | null) => void): () => void {
    this.updateListeners.push(callback);
    if (this.activeUpdate) {
      callback(this.activeUpdate);
    }
    return () => {
      this.updateListeners = this.updateListeners.filter(cb => cb !== callback);
    };
  }

  private notifyUpdateListeners(update: AppUpdateInfo | null) {
    this.activeUpdate = update;
    this.updateListeners.forEach(cb => {
      try {
        cb(update);
      } catch (e) {}
    });
  }

  async checkLatestUpdate(): Promise<AppUpdateInfo | null> {
    try {
      const { data, error } = await supabase
        .from('app_version_control')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.version_name) {
        if (this.isNewerVersion(data.version_name, this.currentVersion)) {
          this.notifyUpdateListeners(data);
          return data;
        }
      }

      this.notifyUpdateListeners(null);
      return null;
    } catch (err) {
      console.warn('SystemMonitorService: checkLatestUpdate failed:', err);
      return null;
    }
  }

  initUpdateRealtimeListener() {
    try {
      supabase
        .channel('app_updates_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'app_version_control'
          },
          (payload: any) => {
            const newUpdate = payload.new as AppUpdateInfo;
            if (newUpdate && newUpdate.is_active) {
              if (this.isNewerVersion(newUpdate.version_name, this.currentVersion)) {
                this.notifyUpdateListeners(newUpdate);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'app_version_control'
          },
          (payload: any) => {
            const updated = payload.new as AppUpdateInfo;
            if (updated && updated.is_active) {
              if (this.isNewerVersion(updated.version_name, this.currentVersion)) {
                this.notifyUpdateListeners(updated);
              }
            } else if (updated && !updated.is_active && this.activeUpdate?.id === updated.id) {
              this.notifyUpdateListeners(null);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('SystemMonitorService: initUpdateRealtimeListener failed:', err);
    }
  }

  /**
   * مقارنة أرقام الإصدارات (مثال: 2.1.0 أحدث من 2.0.0)
   */
  private isNewerVersion(remoteVersion: string, localVersion: string): boolean {
    try {
      const remote = remoteVersion.replace(/[^0-9.]/g, '').split('.').map(Number);
      const local = localVersion.replace(/[^0-9.]/g, '').split('.').map(Number);

      for (let i = 0; i < Math.max(remote.length, local.length); i++) {
        const r = remote[i] || 0;
        const l = local[i] || 0;
        if (r > l) return true;
        if (r < l) return false;
      }
      return false;
    } catch (e) {
      return remoteVersion !== localVersion;
    }
  }
}

export default SystemMonitorService.getInstance();
