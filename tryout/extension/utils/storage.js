/**
 * Storage utility for managing tracking data
 */

class StorageManager {
  /**
   * Save a timeline record
   */
  static async saveRecord(record) {
    try {
      // Validate record before saving
      if (!record) {
        console.error('Cannot save null or undefined record');
        return false;
      }

      // Ensure required fields exist - check domain first to avoid null access
      if (!record.domain) {
        console.error('Record missing domain field:', {
          hasDomain: false,
          hasUrl: !!record.url,
          hasStartTime: !!record.startTime,
          hasEndTime: !!record.endTime
        });
        return false;
      }
      
      if (!record.url || !record.startTime || !record.endTime) {
        console.error('Record missing required fields:', {
          hasDomain: !!record.domain,
          hasUrl: !!record.url,
          hasStartTime: !!record.startTime,
          hasEndTime: !!record.endTime
        });
        return false;
      }

      // Final safety check before saving
      if (!record.domain) {
        console.error('Final check failed: record.domain is null or undefined', {
          record: record,
          domainType: typeof record.domain,
          domainValue: record.domain
        });
        return false;
      }
      
      const result = await chrome.storage.local.get(['timeline']);
      const timeline = result.timeline || [];
      
      // Create a safe copy with all required fields
      const recordToPush = {
        id: this.generateId(),
        tabId: record.tabId,
        windowId: record.windowId,
        url: record.url,
        title: record.title || '',
        domain: record.domain, // Already validated above
        category: record.category || 'other',
        startTime: record.startTime,
        endTime: record.endTime,
        duration: record.duration || 0
      };
      
      timeline.push(recordToPush);
      
      await chrome.storage.local.set({ timeline });
      return true;
    } catch (error) {
      console.error('Error saving record:', error);
      console.error('Record that failed:', record);
      return false;
    }
  }

  /**
   * Get all timeline records
   */
  static async getAllRecords() {
    try {
      const result = await chrome.storage.local.get(['timeline']);
      return result.timeline || [];
    } catch (error) {
      console.error('Error getting records:', error);
      return [];
    }
  }

  /**
   * Get records for a specific date range
   */
  static async getRecordsByDateRange(startDate, endDate) {
    try {
      const records = await this.getAllRecords();
      return records.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting records by date range:', error);
      return [];
    }
  }

  /**
   * Get API configuration
   */
  static async getApiConfig() {
    try {
      const result = await chrome.storage.local.get(['apiConfig']);
      return result.apiConfig || null;
    } catch (error) {
      console.error('Error getting API config:', error);
      return null;
    }
  }

  /**
   * Save API configuration
   */
  static async saveApiConfig(config) {
    try {
      await chrome.storage.local.set({ apiConfig: config });
      return true;
    } catch (error) {
      console.error('Error saving API config:', error);
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data
   */
  static async clearAll() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Export data as JSON
   */
  static async exportData() {
    try {
      const records = await this.getAllRecords();
      const summary = this.calculateSummary(records);
      
      return {
        version: "1.0",
        export_date: new Date().toISOString(),
        data: records,
        summary: summary
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Calculate summary statistics
   */
  static calculateSummary(records) {
    const summary = {
      total_time: 0,
      work_time: 0,
      entertainment_time: 0,
      other_time: 0,
      focus_sessions: []
    };

    let currentFocusStart = null;
    let currentFocusDuration = 0;

    records.forEach(record => {
      // Skip invalid records
      if (!record || !record.duration || record.duration <= 0) {
        return;
      }

      summary.total_time += record.duration || 0;

      if (record.category === 'work') {
        summary.work_time += record.duration;
        
        // Track focus sessions (consecutive work time)
        if (currentFocusStart === null) {
          currentFocusStart = record.startTime;
        }
        currentFocusDuration += record.duration;
      } else {
        summary.entertainment_time += record.category === 'entertainment' ? record.duration : 0;
        summary.other_time += record.category === 'other' ? record.duration : 0;
        
        // End focus session if it exists
        if (currentFocusStart !== null) {
          summary.focus_sessions.push({
            start: currentFocusStart,
            end: record.startTime,
            duration: currentFocusDuration
          });
          currentFocusStart = null;
          currentFocusDuration = 0;
        }
      }
    });

    // Add final focus session if still active
    if (currentFocusStart !== null && records.length > 0) {
      const lastRecord = records[records.length - 1];
      if (lastRecord && lastRecord.endTime) {
        summary.focus_sessions.push({
          start: currentFocusStart,
          end: lastRecord.endTime,
          duration: currentFocusDuration
        });
      }
    }

    return summary;
  }
}
