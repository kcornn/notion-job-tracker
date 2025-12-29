// Extract job information from the page
function extractJobInfo() {
  const url = window.location.href;
  const pageTitle = document.title;
  let company = '';
  let role = '';
  
  // Greenhouse: title is role (after removing prefix), company from URL subdomain
  if (url.includes('greenhouse.io')) {
    // Remove "Job Application for" prefix if present
    role = pageTitle.replace(/^Job Application for\s+/i, '').trim();
    // Extract company from URL like: https://boards.greenhouse.io/company/jobs/123
    const urlMatch = url.match(/greenhouse\.io\/([^\/]+)/);
    if (urlMatch) {
      company = urlMatch[1];
    }
  }
  
  // Lever: title is role, company from URL subdomain
  else if (url.includes('lever.co')) {
    role = pageTitle.trim();
    // Extract company from URL like: https://jobs.lever.co/company/role-id
    const urlMatch = url.match(/lever\.co\/([^\/]+)/);
    if (urlMatch) {
      company = urlMatch[1];
    }
  }
  
  // Ashby: title is role, company from URL subdomain
  else if (url.includes('ashbyhq.com')) {
    role = pageTitle.trim();
    // Extract company from URL like: https://jobs.ashbyhq.com/company/role-id
    const urlMatch = url.match(/ashbyhq\.com\/([^\/]+)/);
    if (urlMatch) {
      company = urlMatch[1];
    }
  }
  
  // Fallback for other sites
  else {
    if (pageTitle.includes(' - ')) {
      const parts = pageTitle.split(' - ');
      role = parts[0].trim();
      company = parts[1].trim();
    } else if (pageTitle.includes(' | ')) {
      const parts = pageTitle.split(' | ');
      role = parts[0].trim();
      company = parts[1].trim();
    }
  }

  return { company, role, url };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobInfo') {
    sendResponse(extractJobInfo());
  }
});