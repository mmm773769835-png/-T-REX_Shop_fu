import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import app, { isWeb } from '../utils/firebaseInitializer';
import { FirebaseApp } from 'firebase/app';

interface UpdateConfig {
  lastUpdate: string;
  version: string;
  features: string[];
  forceUpdate: boolean;
}

class AutoUpdateService {
  private static instance: AutoUpdateService;
  private updateInterval: any = null;
  private isChecking = false;

  static getInstance(): AutoUpdateService {
    if (!AutoUpdateService.instance) {
      AutoUpdateService.instance = new AutoUpdateService();
    }
    return AutoUpdateService.instance;
  }

  // start monitoring for updates
  startAutoUpdateMonitoring = () => {
    console.log('AutoUpdateService: Starting auto-update monitoring');
    
    // Check when app comes to foreground
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Check periodically (every 5 minutes)
    this.updateInterval = setInterval(this.checkForUpdates, 5 * 60 * 1000);
    
    // Check immediately on start
    this.checkForUpdates();
  };

  // stop monitoring
  stopAutoUpdateMonitoring = () => {
    console.log('AutoUpdateService: Stopping auto-update monitoring');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  };

  // handle app state changes
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('AutoUpdateService: App became active, checking for updates');
      this.checkForUpdates();
    }
  };

  // check for updates
  checkForUpdates = async () => {
    if (this.isChecking) {
      console.log('AutoUpdateService: Already checking for updates');
      return;
    }

    this.isChecking = true;
    
    try {
      // Check for new products
      await this.checkForNewProducts();
      
      // Check for theme updates
      await this.checkForThemeUpdates();
      
      // Check for feature updates
      await this.checkForFeatureUpdates();
      
      // Update last check time
      await AsyncStorage.setItem('lastUpdateCheck', new Date().toISOString());
      
      console.log('AutoUpdateService: Update check completed successfully');
    } catch (error) {
      console.error('AutoUpdateService: Error checking for updates:', error);
    } finally {
      this.isChecking = false;
    }
  };

  // check for new products
  private checkForNewProducts = async () => {
    try {
      const firebaseApp = app as FirebaseApp;
      const db = getFirestore(firebaseApp);
      const lastProductCheck = await AsyncStorage.getItem('lastProductCheck');
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(productsQuery);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (products.length > 0) {
        const latestProduct = products[0] as any;
        const latestProductDate = latestProduct.createdAt;
        
        if (!lastProductCheck || new Date(latestProductDate) > new Date(lastProductCheck)) {
          console.log('AutoUpdateService: New products detected');
          await AsyncStorage.setItem('lastProductCheck', latestProductDate);
          
          // Trigger product refresh in app
          this.notifyProductUpdate();
        }
      }
    } catch (error) {
      console.error('AutoUpdateService: Error checking for new products:', error);
    }
  };

  // check for theme updates
  private checkForThemeUpdates = async () => {
    try {
      const currentThemeVersion = await AsyncStorage.getItem('themeVersion');
      const latestThemeVersion = '2.0.0'; // This could come from server config
      
      if (currentThemeVersion !== latestThemeVersion) {
        console.log('AutoUpdateService: Theme update detected');
        await AsyncStorage.setItem('themeVersion', latestThemeVersion);
        
        // Trigger theme refresh
        this.notifyThemeUpdate();
      }
    } catch (error) {
      console.error('AutoUpdateService: Error checking for theme updates:', error);
    }
  };

  // check for feature updates
  private checkForFeatureUpdates = async () => {
    try {
      const featuresConfig = await AsyncStorage.getItem('featuresConfig');
      const latestFeatures = {
        multiImageGallery: true,
        darkTheme: true,
        goldAccents: true,
        autoRefresh: true
      };
      
      if (featuresConfig !== JSON.stringify(latestFeatures)) {
        console.log('AutoUpdateService: Feature update detected');
        await AsyncStorage.setItem('featuresConfig', JSON.stringify(latestFeatures));
        
        // Trigger feature refresh
        this.notifyFeatureUpdate(latestFeatures);
      }
    } catch (error) {
      console.error('AutoUpdateService: Error checking for feature updates:', error);
    }
  };

  // notify product update
  private notifyProductUpdate = () => {
    // This would trigger a refresh in the product components
    console.log('AutoUpdateService: Notifying product update');
    // You could use event emitter or context update here
  };

  // notify theme update
  private notifyThemeUpdate = () => {
    console.log('AutoUpdateService: Notifying theme update');
    // Trigger theme refresh
  };

  // notify feature update
  private notifyFeatureUpdate = (features: any) => {
    console.log('AutoUpdateService: Notifying feature update:', features);
    // Update features in context
  };

  // force update check
  forceUpdateCheck = () => {
    console.log('AutoUpdateService: Force update check requested');
    this.checkForUpdates();
  };

  // get update status
  getUpdateStatus = async () => {
    try {
      const lastCheck = await AsyncStorage.getItem('lastUpdateCheck');
      const lastProductCheck = await AsyncStorage.getItem('lastProductCheck');
      const themeVersion = await AsyncStorage.getItem('themeVersion');
      
      return {
        lastCheck,
        lastProductCheck,
        themeVersion,
        isChecking: this.isChecking
      };
    } catch (error) {
      console.error('AutoUpdateService: Error getting update status:', error);
      return null;
    }
  };
}

export default AutoUpdateService;
