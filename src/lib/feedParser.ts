import { XMLParser } from "fast-xml-parser";

// Common interfaces for RSS feeds
interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

interface HNRssItem extends RssItem {
  comments: string;
  description: string;
  "dc:creator": string;
}

interface RedditRssItem extends RssItem {
  content: string;
  author: string;
  category?: string;
}

interface RssFeed {
  rss: {
    channel: {
      item: RssItem[];
    };
  };
}

// Common function to fetch XML feed
async function fetchXmlFeed(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed: ${response.status} ${response.statusText}`,
    );
  }
  return await response.text();
}

// Parse HackerNews feed
export async function parseHackerNewsFeed(xmlData: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => name === "item", // Ensure 'item' is always an array
  });

  const result = parser.parse(xmlData) as RssFeed;
  const items = result.rss.channel.item as HNRssItem[];

  return items.map((item) => {
    return {
      title: item.title.replace(/ \([0-9]+ points\)$/, "").trim(), // Clean title and trim
      link: item.link,
      // Instead of the publish date we're just using the current date. This makes sure
      // that new posts appear on the top.
      pubDate: new Date(),
      type: "article",
      source: "hackernews",
    };
  });
}

// Interface for Reddit Atom Feed
interface RedditAtomFeed {
  feed: {
    entry: RedditAtomEntry[];
  };
}

interface RedditAtomEntry {
  title: string | { toString: () => string };
  link:
    | { href: string; rel?: string }[]
    | { href: string; rel?: string }
    | string;
  published: string;
  updated: string;
  category?: { term: string } | { term: string }[];
}

// Parse Reddit feed (Atom format)
export async function parseRedditFeed(xmlData: string, feedName: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => name === "entry", // Ensure 'entry' is always an array
    ignoreNameSpace: true, // Add this to ignore XML namespaces
  });

  try {
    const result = parser.parse(xmlData) as RedditAtomFeed;
    console.log(
      "Parsed Reddit feed:",
      JSON.stringify(result, null, 2).substring(0, 500),
    );

    // Check if feed and entries exist
    if (!result.feed || !result.feed.entry) {
      console.error("Invalid Reddit feed structure:", Object.keys(result));
      return [];
    }

    const entries = result.feed.entry.slice(0, 5);

    return entries.map((entry) => {
      // Handle link which can be an object with href or an array of objects
      let link = "";
      if (typeof entry.link === "string") {
        link = entry.link;
      } else if (Array.isArray(entry.link)) {
        // Find the first link or the one with rel="alternate"
        const alternateLink = entry.link.find((l) => l.rel === "alternate");
        link = alternateLink ? alternateLink.href : entry.link[0].href;
      } else if (entry.link && entry.link.href) {
        link = entry.link.href;
      }

      // Extract category if available
      let category = "article";
      if (entry.category) {
        if (Array.isArray(entry.category)) {
          // Use the first category
          category = entry.category[0].term || "article";
        } else if (typeof entry.category === "object") {
          category = entry.category.term || "article";
        } else if (typeof entry.category === "string") {
          category = entry.category;
        }
      }

      // Extract image URL from media:thumbnail if available
      let imageUrl = undefined;
      if (entry["media:thumbnail"] && entry["media:thumbnail"].url) {
        imageUrl = entry["media:thumbnail"].url;
      }

      return {
        title:
          typeof entry.title === "string"
            ? entry.title
            : entry.title.toString(),
        link: link,
        // Instead of the publish date we're just using the current date. This makes sure
        // that new posts appear on the top.
        pubDate: new Date(),
        // Always set Factorio posts as articles regardless of image
        type: "article",
        source: feedName, // Use the feed name as the source
        imageUrl: imageUrl,
      };
    });
  } catch (error) {
    console.error("Error parsing Reddit feed:", error);
    throw error;
  }
}

// Main function to fetch and parse feeds based on type
export async function fetchAndParseFeed(
  url: string,
  type: string,
  name: string,
) {
  try {
    const xmlData = await fetchXmlFeed(url);

    switch (type.toLowerCase()) {
      case "hackernews":
        return await parseHackerNewsFeed(xmlData);
      case "reddit":
        return await parseRedditFeed(xmlData, name);
      default:
        throw new Error(`Unsupported feed type: ${type}`);
    }
  } catch (error) {
    console.error("Error fetching and parsing feed:", error);
    throw error;
  }
}
