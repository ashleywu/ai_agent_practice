/**
 * Popup script for Browsing Behavior Tracker
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load current status
  await updateStatus();
  
  // Load API config
  await loadApiConfig();
  
  // Set up event listeners
  document.getElementById('saveConfig').addEventListener('click', saveApiConfig);
  document.getElementById('startTracking').addEventListener('click', startTracking);
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('clearData').addEventListener('click', clearData);
  
  // Update status every 2 seconds
  setInterval(updateStatus, 2000);
});

/**
 * Update status indicator
 */
async function updateStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (response && response.isTracking) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Tracking active';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Not tracking';
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

/**
 * Load API configuration
 */
async function loadApiConfig() {
  try {
    const result = await chrome.storage.local.get(['apiConfig']);
    const config = result.apiConfig;
    
    if (config) {
      document.getElementById('apiKey').value = config.apiKey || '';
      document.getElementById('baseUrl').value = config.baseUrl || 'https://space.ai-builders.com/backend';
    }
  } catch (error) {
    console.error('Error loading API config:', error);
  }
}

/**
 * Save API configuration
 */
async function saveApiConfig() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const baseUrl = document.getElementById('baseUrl').value.trim();
  
  if (!apiKey || !baseUrl) {
    showMessage('Please fill in both API key and base URL', 'error');
    return;
  }
  
  try {
    await chrome.storage.local.set({
      apiConfig: {
        apiKey: apiKey,
        baseUrl: baseUrl
      }
    });
    
    showMessage('Configuration saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving API config:', error);
    showMessage('Error saving configuration', 'error');
  }
}

/**
 * Export data
 */
async function exportData() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportData' });
    
    if (response && response.success && response.data) {
      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `browsing-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      showMessage('Data exported successfully!', 'success');
    } else {
      showMessage('No data to export', 'error');
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    showMessage('Error exporting data', 'error');
  }
}

/**
 * Clear all data
 */
async function clearData() {
  if (!confirm('Are you sure you want to clear all tracking data? This cannot be undone.')) {
    return;
  }
  
  try {
    await chrome.storage.local.clear();
    showMessage('All data cleared', 'success');
  } catch (error) {
    console.error('Error clearing data:', error);
    showMessage('Error clearing data', 'error');
  }
}

/**
 * Force start tracking
 */
async function startTracking() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'forceStartTracking' });
    if (response && response.success) {
      showMessage('Tracking started!', 'success');
      setTimeout(updateStatus, 500); // Update status after a short delay
    } else {
      showMessage(response?.message || 'Failed to start tracking. Make sure you have a valid webpage open.', 'error');
    }
  } catch (error) {
    console.error('Error starting tracking:', error);
    showMessage('Error starting tracking', 'error');
  }
}

/**
 * Show message
 */
function showMessage(text, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(msg => msg.remove());
  
  // Create new message
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  document.querySelector('.container').appendChild(message);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    message.remove();
  }, 3000);
}
