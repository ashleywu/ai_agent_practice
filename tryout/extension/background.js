/**
 * Background Service Worker for Browsing Behavior Tracker
 * Tracks active tab changes and records browsing time
 */

// Import utility scripts
importScripts('./utils/storage.js');
importScripts('./utils/category-classifier.js');

class TabTracker {
  constructor() {
    this.currentWindowId = null;
    this.currentTabId = null;
    this.currentStartTime = null;
    this.currentRecord = null;
    this.classifier = new CategoryClassifier();
    this.isTracking = false;
  }

  /**
   * Initialize the tracker
   */
  async init() {
    console.log('TabTracker initialized');
    
    // Load API config from storage
    await this.loadApiConfig();
    
    // Get initial active tab
    await this.updateActiveTab();
    
    // Set up event listeners
    this.setupListeners();
    
    // Start tracking if we have an active tab
    if (this.currentTabId) {
      try {
        const tab = await chrome.tabs.get(this.currentTabId);
        if (tab && tab.url && !this.isInvalidUrl(tab.url)) {
          await this.startTracking(tab);
          console.log('Started tracking on init:', tab.url);
        } else {
          console.log('No valid tab to track on init');
        }
      } catch (error) {
        console.error('Error starting tracking on init:', error);
      }
    } else {
      console.log('No active tab found on init');
    }
  }

  /**
   * Load API configuration from storage
   */
  async loadApiConfig() {
    try {
      const config = await StorageManager.getApiConfig();
      if (!config) {
        // Set default config (for development)
        // In production, user should set this via popup
        // Default values from .env file
        const defaultConfig = {
          apiKey: 'sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae',
          baseUrl: 'https://space.ai-builders.com/backend'
        };
        await StorageManager.saveApiConfig(defaultConfig);
        console.log('Using default API configuration');
      } else {
        console.log('Loaded API configuration from storage');
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    }
  }

  /**
   * Set up event listeners
   */
  setupListeners() {
    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      this.handleWindowFocusChange(windowId);
    });

    // Listen for tab activation (switching tabs within a window)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivated(activeInfo);
    });

    // Listen for tab updates (URL changes, page loads)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdated(tabId, changeInfo, tab);
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.handleTabRemoved(tabId);
    });

    // Listen for window removal
    chrome.windows.onRemoved.addListener((windowId) => {
      this.handleWindowRemoved(windowId);
    });

    // Listen for window creation (new window opened)
    chrome.windows.onCreated.addListener((window) => {
      // When a new window is created, check if it becomes active
      setTimeout(() => {
        this.handleWindowFocusChange(window.id);
      }, 100);
    });
  }

  /**
   * Update the current active tab
   */
  async updateActiveTab() {
    try {
      // Try to get the current active tab directly
      const tabs = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });
      
      if (tabs.length > 0 && tabs[0].url) {
        this.currentWindowId = tabs[0].windowId;
        this.currentTabId = tabs[0].id;
        return tabs[0];
      }
      
      // Fallback: get all windows
      const windows = await chrome.windows.getAll({ populate: true });
      
      // Find the focused window
      const focusedWindow = windows.find(w => w.focused);
      if (focusedWindow) {
        this.currentWindowId = focusedWindow.id;
        const activeTab = focusedWindow.tabs.find(t => t.active);
        if (activeTab && activeTab.url) {
          this.currentTabId = activeTab.id;
          return activeTab;
        }
      }
      
      // Last fallback: get current window
      const currentWindow = await chrome.windows.getCurrent();
      if (currentWindow) {
        this.currentWindowId = currentWindow.id;
        const tabs = await chrome.tabs.query({ 
          active: true, 
          windowId: currentWindow.id 
        });
        if (tabs.length > 0 && tabs[0].url) {
          this.currentTabId = tabs[0].id;
          return tabs[0];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating active tab:', error);
      return null;
    }
  }

  /**
   * Handle window focus change
   */
  async handleWindowFocusChange(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Window lost focus (minimized or switched to another app)
      this.stopTracking();
      return;
    }

    // Window gained focus
    this.currentWindowId = windowId;
    
    try {
      const tabs = await chrome.tabs.query({ 
        active: true, 
        windowId: windowId 
      });
      
      if (tabs.length > 0 && tabs[0].url && !this.isInvalidUrl(tabs[0].url)) {
        await this.switchToTab(tabs[0].id, tabs[0]);
      }
    } catch (error) {
      console.error('Error handling window focus change:', error);
      // Try to update active tab as fallback
      await this.updateActiveTab();
      if (this.currentTabId) {
        try {
          const tab = await chrome.tabs.get(this.currentTabId);
          if (tab && tab.url && !this.isInvalidUrl(tab.url)) {
            await this.startTracking(tab);
          }
        } catch (e) {
          console.error('Error starting tracking after window focus:', e);
        }
      }
    }
  }

  /**
   * Handle tab activation
   */
  async handleTabActivated(activeInfo) {
    try {
      // Update current window ID if needed
      if (this.currentWindowId !== activeInfo.windowId) {
        this.currentWindowId = activeInfo.windowId;
      }
      
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab && tab.url) {
        await this.switchToTab(activeInfo.tabId, tab);
      }
    } catch (error) {
      console.error('Error handling tab activation:', error);
    }
  }

  /**
   * Handle tab updates
   */
  async handleTabUpdated(tabId, changeInfo, tab) {
    // Only handle the active tab in the active window
    if (tabId === this.currentTabId && 
        tab.active && 
        tab.windowId === this.currentWindowId &&
        tab.url) {
      
      // If URL changed, save current record and start new one
      if (changeInfo.url) {
        await this.saveCurrentRecord();
        await this.startTracking(tab);
      }
      // If page finished loading, update the record
      else if (changeInfo.status === 'complete' && this.currentRecord && this.currentStartTime) {
        // Create a safe reference to avoid race conditions
        const currentRecord = this.currentRecord;
        // Only update if we have a valid record with all required fields
        if (currentRecord && currentRecord.domain && currentRecord.url) {
          // Update title safely
          this.currentRecord.title = tab.title || '';
          // Don't update URL if it's the same, to avoid breaking domain
          if (tab.url && tab.url !== currentRecord.url) {
            // URL changed, save current and start new tracking
            await this.saveCurrentRecord();
            await this.startTracking(tab);
          }
        }
      }
    }
  }

  /**
   * Handle tab removal
   */
  async handleTabRemoved(tabId) {
    if (tabId === this.currentTabId) {
      await this.saveCurrentRecord();
      this.currentTabId = null;
      this.currentStartTime = null;
      this.currentRecord = null;
      this.isTracking = false;
    }
  }

  /**
   * Handle window removal
   */
  async handleWindowRemoved(windowId) {
    if (windowId === this.currentWindowId) {
      await this.saveCurrentRecord();
      this.currentWindowId = null;
      this.currentTabId = null;
      this.currentStartTime = null;
      this.currentRecord = null;
      this.isTracking = false;
    }
  }

  /**
   * Switch to a new tab
   */
  async switchToTab(tabId, tab) {
    // Save the current record before switching
    await this.saveCurrentRecord();
    
    // Start tracking the new tab
    this.currentTabId = tabId;
    await this.startTracking(tab);
  }

  /**
   * Start tracking a tab
   */
  async startTracking(tab) {
    try {
      // Skip invalid URLs (chrome://, chrome-extension://, etc.)
      if (!tab || !tab.url || this.isInvalidUrl(tab.url)) {
        return;
      }

      // Save any existing record before starting new one (only if we're already tracking)
      // Use try-catch to prevent errors from blocking new tracking
      if (this.isTracking && this.currentRecord && this.currentStartTime) {
        try {
          await this.saveCurrentRecord();
        } catch (saveError) {
          console.warn('Error saving previous record before starting new tracking:', saveError);
          // Reset state to allow new tracking to proceed
          this.currentStartTime = null;
          this.currentRecord = null;
          this.isTracking = false;
        }
      }

      this.currentStartTime = Date.now();
      
      // Classify the website
      const category = await this.classifier.classify(tab.url, tab.title || '');
      
      // Extract domain safely
      let domain;
      try {
        domain = this.extractDomain(tab.url);
      } catch (extractError) {
        console.error('Error extracting domain from URL:', tab.url, extractError);
        return;
      }
      
      // Ensure domain is not empty or null
      if (!domain || domain === 'null' || domain === 'undefined') {
        console.warn('Could not extract valid domain from URL:', tab.url, 'got:', domain);
        return;
      }
      
      this.currentRecord = {
        tabId: tab.id,
        windowId: tab.windowId || this.currentWindowId,
        url: tab.url,
        title: tab.title || '',
        domain: domain,
        category: category || 'other',
        startTime: this.currentStartTime,
        endTime: null,
        duration: 0
      };

      this.isTracking = true;
      
      // Safe logging - ensure domain is not null
      console.log('Started tracking:', {
        url: tab.url || 'unknown',
        domain: domain || 'unknown',
        category: category || 'other',
        time: new Date(this.currentStartTime).toISOString()
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      console.error('Error details:', {
        errorMessage: error.message,
        errorStack: error.stack,
        tabUrl: tab?.url,
        hasCurrentRecord: !!this.currentRecord,
        currentRecordDomain: this.currentRecord?.domain
      });
      // Reset state on error
      this.currentStartTime = null;
      this.currentRecord = null;
      this.isTracking = false;
    }
  }

  /**
   * Stop tracking
   */
  async stopTracking() {
    await this.saveCurrentRecord();
    this.currentTabId = null;
    this.currentStartTime = null;
    this.currentRecord = null;
    this.isTracking = false;
  }

  /**
   * Save the current record
   */
  async saveCurrentRecord() {
    // Early return if no record to save
    if (!this.currentRecord || !this.currentStartTime) {
      return;
    }

    // Save references IMMEDIATELY to avoid race conditions
    // Capture the reference first, then check it's valid
    const currentRecordRef = this.currentRecord;
    const currentStartTimeRef = this.currentStartTime;
    
    // Double-check after capturing reference
    if (!currentRecordRef || !currentStartTimeRef) {
      return;
    }
    
    // Now check if domain exists before accessing it
    if (!currentRecordRef.domain || !currentRecordRef.url) {
      console.warn('Skipping save: record missing domain or url', {
        hasDomain: !!currentRecordRef.domain,
        hasUrl: !!currentRecordRef.url
      });
      // Reset state
      this.currentStartTime = null;
      this.currentRecord = null;
      return;
    }

    // Create a local copy with all fields
    let recordToSave;
    let startTime;
    
    try {
      // Capture values atomically - now safe because we've validated domain exists
      recordToSave = {
        tabId: currentRecordRef.tabId,
        windowId: currentRecordRef.windowId,
        url: currentRecordRef.url,
        title: currentRecordRef.title || '',
        domain: currentRecordRef.domain,
        category: currentRecordRef.category || 'other',
        startTime: currentRecordRef.startTime
      };
      startTime = currentStartTimeRef;
      
      // Validate captured values before proceeding
      // Check if recordToSave itself is valid
      if (!recordToSave) {
        console.error('recordToSave is null or undefined');
        this.currentStartTime = null;
        this.currentRecord = null;
        return;
      }
      
      if (!recordToSave.domain || !recordToSave.url || !startTime) {
        console.warn('Skipping save: invalid record data', {
          hasRecordToSave: !!recordToSave,
          hasDomain: !!recordToSave.domain,
          domainValue: recordToSave.domain,
          hasUrl: !!recordToSave.url,
          hasStartTime: !!startTime
        });
        // Reset state
        this.currentStartTime = null;
        this.currentRecord = null;
        return;
      }
    } catch (error) {
      console.error('Error capturing record data:', error);
      // Reset state on error
      this.currentStartTime = null;
      this.currentRecord = null;
      return;
    }

    try {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Only save records with meaningful duration (at least 1 second)
      if (duration < 1000) {
        // Reset tracking state even if we don't save
        this.currentStartTime = null;
        this.currentRecord = null;
        return;
      }

      // Final validation before saving
      if (!recordToSave.domain || !recordToSave.url) {
        console.warn('Skipping save: record missing required fields after validation', recordToSave);
        this.currentStartTime = null;
        this.currentRecord = null;
        return;
      }

      recordToSave.endTime = endTime;
      recordToSave.duration = duration;

      const saveResult = await StorageManager.saveRecord(recordToSave);
      
      if (saveResult) {
        // Safe logging - ensure domain exists
        const logDomain = recordToSave && recordToSave.domain ? recordToSave.domain : 'unknown';
        console.log('Saved record:', {
          domain: logDomain,
          category: recordToSave.category || 'other',
          duration: `${(duration / 1000).toFixed(1)}s`
        });
      }

      // Reset current record after successful save
      this.currentStartTime = null;
      this.currentRecord = null;
    } catch (error) {
      console.error('Error saving record:', error);
      console.error('Error details:', {
        errorMessage: error.message,
        errorStack: error.stack,
        hasRecordToSave: !!recordToSave,
        recordToSaveDomain: recordToSave?.domain,
        recordToSave: recordToSave
      });
      // Reset state on error to prevent stuck state
      this.currentStartTime = null;
      this.currentRecord = null;
    }
  }

  /**
   * Check if URL is invalid for tracking
   */
  isInvalidUrl(url) {
    const invalidPatterns = [
      /^chrome:\/\//,
      /^chrome-extension:\/\//,
      /^edge:\/\//,
      /^about:/,
      /^moz-extension:\/\//
    ];

    return invalidPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      if (!url || typeof url !== 'string') {
        console.warn('extractDomain called with invalid URL:', url);
        return '';
      }
      
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (!hostname) {
        console.warn('URL has no hostname:', url);
        return '';
      }
      
      const domain = hostname.replace(/^www\./, '');
      return domain || '';
    } catch (error) {
      console.error('Error extracting domain from URL:', url, error);
      return '';
    }
  }
}

// Initialize tracker when service worker starts
const tracker = new TabTracker();
tracker.init();

// Keep service worker alive and reinitialize on startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Browsing Behavior Tracker installed');
  // Reinitialize tracking
  tracker.init();
});

// Reinitialize when service worker wakes up
chrome.runtime.onStartup.addListener(() => {
  console.log('Browsing Behavior Tracker startup');
  tracker.init();
});

// Note: Service Workers can be paused by Chrome
// Tracking will automatically resume when events fire (tab switch, window focus, etc.)

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({
      isTracking: tracker.isTracking,
      currentTabId: tracker.currentTabId,
      currentWindowId: tracker.currentWindowId
    });
    return true; // Keep message channel open
  } else if (request.action === 'exportData') {
    StorageManager.exportData().then(data => {
      sendResponse({ success: true, data });
    });
    return true; // Indicates we will send a response asynchronously
  } else if (request.action === 'forceStartTracking') {
    // Force start tracking on current active tab
    tracker.updateActiveTab().then(async (tab) => {
      if (tab && tab.url && !tracker.isInvalidUrl(tab.url)) {
        await tracker.startTracking(tab);
        sendResponse({ success: true, message: 'Tracking started' });
      } else {
        sendResponse({ success: false, message: 'No valid tab to track' });
      }
    });
    return true;
  }
  return false;
});
