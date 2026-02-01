/**
 * Website category classifier
 * Classifies websites into work, entertainment, or other categories
 */

class CategoryClassifier {
  constructor() {
    // Predefined work domains
    this.workDomains = [
      'leetcode.com',
      'linkedin.com',
      'medium.com',
      'github.com',
      'stackoverflow.com',
      'stackexchange.com',
      'wikipedia.org',
      'docs.google.com',
      'drive.google.com',
      'notion.so',
      'confluence.atlassian.com',
      'jira.com',
      'atlassian.com',
      'coursera.org',
      'edx.org',
      'udemy.com',
      'khanacademy.org',
      'codecademy.com',
      'freecodecamp.org',
      'developer.mozilla.org',
      'w3schools.com',
      'geeksforgeeks.org',
      'hackerrank.com',
      'codewars.com'
    ];

    // Predefined entertainment domains
    this.entertainmentDomains = [
      'bilibili.com',
      'netflix.com',
      'youtube.com',
      'twitch.tv',
      'reddit.com',
      'twitter.com',
      'facebook.com',
      'instagram.com',
      'tiktok.com',
      'douyin.com',
      'weibo.com',
      'pinterest.com',
      'tumblr.com',
      'discord.com',
      'spotify.com',
      'music.youtube.com'
    ];

    // User custom rules (stored in chrome.storage)
    this.customRules = null;
  }

  /**
   * Load custom rules from storage
   */
  async loadCustomRules() {
    try {
      const result = await chrome.storage.local.get(['customRules']);
      this.customRules = result.customRules || {};
      return this.customRules;
    } catch (error) {
      console.error('Error loading custom rules:', error);
      return {};
    }
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      console.error('Error extracting domain:', error);
      return null;
    }
  }

  /**
   * Check if domain matches a list (including subdomains)
   */
  matchesDomain(domain, domainList) {
    if (!domain) return false;
    
    // Exact match
    if (domainList.includes(domain)) {
      return true;
    }
    
    // Subdomain match (e.g., www.example.com matches example.com)
    return domainList.some(pattern => {
      return domain === pattern || domain.endsWith('.' + pattern);
    });
  }

  /**
   * Classify website using predefined rules
   */
  async classifyByRules(url, title = '') {
    const domain = this.extractDomain(url);
    if (!domain) return 'other';

    // Load custom rules if not loaded
    if (!this.customRules) {
      await this.loadCustomRules();
    }

    // Check custom rules first
    if (this.customRules && this.customRules[domain]) {
      return this.customRules[domain];
    }

    // Check work domains
    if (this.matchesDomain(domain, this.workDomains)) {
      return 'work';
    }

    // Check entertainment domains
    if (this.matchesDomain(domain, this.entertainmentDomains)) {
      // Special handling for YouTube - may need API call
      if (domain === 'youtube.com' || domain === 'www.youtube.com') {
        return await this.classifyYouTube(url, title);
      }
      return 'entertainment';
    }

    // Default to other
    return 'other';
  }

  /**
   * Classify YouTube video using API
   */
  async classifyYouTube(url, title) {
    try {
      // Get API config
      const apiConfig = await chrome.storage.local.get(['apiConfig']);
      const config = apiConfig.apiConfig;
      
      if (!config || !config.apiKey) {
        // Fallback to keyword matching if no API key
        return this.classifyByKeywords(title);
      }

      // Extract video ID from URL
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) {
        return this.classifyByKeywords(title);
      }

      // Call API to get video details
      const category = await this.callYouTubeAPI(videoId, config);
      return category || this.classifyByKeywords(title);
    } catch (error) {
      console.error('Error classifying YouTube:', error);
      return this.classifyByKeywords(title);
    }
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Call YouTube API via AI Builder backend
   */
  async callYouTubeAPI(videoId, config) {
    try {
      // Use AI Builder chat completion API to classify the video
      const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek',
          messages: [
            {
              role: 'system',
              content: 'You are a website classifier. Classify YouTube videos as "work" (educational, tutorial, learning) or "entertainment" (funny, music, gaming, vlog). Respond with only one word: "work" or "entertainment".'
            },
            {
              role: 'user',
              content: `Classify this YouTube video (ID: ${videoId}) as work or entertainment. If you cannot determine, respond with "entertainment" as default.`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const classification = data.choices[0]?.message?.content?.toLowerCase().trim();
      
      if (classification === 'work' || classification === 'entertainment') {
        return classification;
      }
      
      return 'entertainment'; // Default
    } catch (error) {
      console.error('Error calling YouTube API:', error);
      return null;
    }
  }

  /**
   * Classify by keywords in title
   */
  classifyByKeywords(title) {
    if (!title) return 'entertainment'; // Default for YouTube

    const titleLower = title.toLowerCase();
    
    const workKeywords = [
      'tutorial', 'course', 'learn', 'programming', 'coding',
      'algorithm', 'interview', 'education', 'lecture', 'study',
      'how to', 'explained', 'documentation', 'guide', 'lesson',
      'training', 'workshop', 'webinar', 'academic', 'research'
    ];

    const entertainmentKeywords = [
      'funny', 'comedy', 'music', 'game', 'movie', 'trailer',
      'vlog', 'prank', 'reaction', 'meme', 'entertainment',
      'gaming', 'playthrough', 'walkthrough', 'review', 'unboxing'
    ];

    // Check work keywords
    for (const keyword of workKeywords) {
      if (titleLower.includes(keyword)) {
        return 'work';
      }
    }

    // Check entertainment keywords
    for (const keyword of entertainmentKeywords) {
      if (titleLower.includes(keyword)) {
        return 'entertainment';
      }
    }

    // Default to entertainment for YouTube
    return 'entertainment';
  }

  /**
   * Main classification method
   */
  async classify(url, title = '') {
    try {
      return await this.classifyByRules(url, title);
    } catch (error) {
      console.error('Error classifying:', error);
      return 'other';
    }
  }
}
