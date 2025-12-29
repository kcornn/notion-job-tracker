// Load saved settings and job info when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings from storage
  const settings = await chrome.storage.sync.get(['notionToken', 'databaseId']);
  if (settings.notionToken) {
    document.getElementById('notionToken').value = settings.notionToken;
  }
  if (settings.databaseId) {
    document.getElementById('databaseId').value = settings.databaseId;
  }

  // Extract job info from current page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'extractJobInfo' }, (response) => {
    if (response) {
      document.getElementById('company').value = response.company || '';
      document.getElementById('role').value = response.role || '';
      document.getElementById('url').value = response.url || '';
    }
  });
});

// Toggle settings view
document.getElementById('settingsToggle').addEventListener('click', () => {
  document.getElementById('settings').classList.toggle('show');
});

// Save settings
document.getElementById('saveSettings').addEventListener('click', async () => {
  const token = document.getElementById('notionToken').value;
  const dbId = document.getElementById('databaseId').value;
  
  await chrome.storage.sync.set({ 
    notionToken: token, 
    databaseId: dbId 
  });
  
  showStatus('Settings saved!', 'success');
});

// Save job to Notion
document.getElementById('saveBtn').addEventListener('click', async () => {
  const company = document.getElementById('company').value.trim();
  const role = document.getElementById('role').value.trim();
  const url = document.getElementById('url').value.trim();
  
  if (!company || !role || !url) {
    showStatus('Please fill in all fields', 'error');
    return;
  }
  
  const settings = await chrome.storage.sync.get(['notionToken', 'databaseId']);
  
  if (!settings.notionToken || !settings.databaseId) {
    showStatus('Please configure settings first', 'error');
    document.getElementById('settings').classList.add('show');
    return;
  }
  
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2025-09-03'
      },
      body: JSON.stringify({
        parent: { database_id: settings.databaseId },
        properties: {
          Company: {
            title: [{ text: { content: company } }]
          },
          Role: {
            rich_text: [{ text: { content: role } }]
          },
          URL: {
            url: url
          },
          Status: {
            status: { name: 'Applied' }
          },
          "Referral?": {
            select: { name: 'No' }
          }
        }
      })
    });
    
    if (response.ok) {
      showStatus('✓ Saved to Notion!', 'success');
      setTimeout(() => window.close(), 1500);
    } else {
      const error = await response.json();
      showStatus(`Error: ${error.message}`, 'error');
    }
  } catch (err) {
    showStatus('Network error - check settings', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Job';
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
}