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
      // Extract points from title if available
      const pointsMatch = item.title.match(/\(([0-9]+) points\)/);
      const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;
      
      // Extract ID from comments URL
      const id = item.comments.split('id=')[1];
      
      // Convert to our database format
      return {
        id,
        title: item.title.replace(/ \([0-9]+ points\)$/, ''), // Clean title
        link: item.link,
        pubDate: new Date(item.pubDate),
        description: item.description,
        author: item['dc:creator'],
        points,
        commentsCount: 0, // Would need additional parsing to get this
        commentsUrl: item.comments,
        type: 'article' // Default type for all HN items
      };
    });
  } catch (error) {
    console.error('Error fetching and parsing feed:', error);
    throw error;
  }
}