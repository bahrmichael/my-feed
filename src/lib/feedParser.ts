import { XMLParser } from 'fast-xml-parser';

interface HNRssItem {
  title: string;
  link: string;
  pubDate: string;
  comments: string; // This will be our unique ID
  description: string;
  'dc:creator': string;
}

interface HNRssFeed {
  rss: {
    channel: {
      item: HNRssItem[];
    };
  };
}

export async function fetchAndParseFeed(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    
    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    
    const result = parser.parse(xmlData) as HNRssFeed;
    const items = result.rss.channel.item;
    
    return items.map(item => {
      // Clean up the data - we no longer need points or id extraction 
      // as we're using SERIAL for IDs
      
      // Convert to our database format with simplified fields
      return {
        title: item.title.replace(/ \([0-9]+ points\)$/, ''), // Clean title
        link: item.link,
        pubDate: new Date(item.pubDate),
        type: 'article', // Default type for all HN items
        source: 'hn' // Explicitly set the source as Hacker News
      };
    });
  } catch (error) {
    console.error('Error fetching and parsing feed:', error);
    throw error;
  }
}