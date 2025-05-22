import { describe, it, expect, vi } from "vitest";
import { parseHackerNewsFeed, parseRedditFeed } from "./feedParser";

describe("Feed Parser", () => {
  describe("parseHackerNewsFeed", () => {
    it("parses Hacker News RSS correctly", async () => {
      // Sample HN RSS XML
      const sampleXml = `
        <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
        <channel>
        <title>Hacker News: Newest</title>
        <link>https://news.ycombinator.com/newest</link>
        <description>Hacker News RSS</description>
        <docs>https://hnrss.org/</docs>
        <generator>hnrss v2.1.1</generator>
        <lastBuildDate>Thu, 22 May 2025 18:02:21 +0000</lastBuildDate>
        <atom:link href="https://hnrss.org/newest?points=150" rel="self" type="application/rss+xml"/>
        <item>
        <title>
        <![CDATA[ Claude 4 ]]>
        </title>
        <description>
        <![CDATA[ <p>Article URL: <a href="https://www.anthropic.com/news/claude-4">https://www.anthropic.com/news/claude-4</a></p> <p>Comments URL: <a href="https://news.ycombinator.com/item?id=44063703">https://news.ycombinator.com/item?id=44063703</a></p> <p>Points: 572</p> <p># Comments: 235</p> ]]>
        </description>
        <pubDate>Thu, 22 May 2025 16:34:42 +0000</pubDate>
        <link>https://www.anthropic.com/news/claude-4</link>
        <dc:creator>meetpateltech</dc:creator>
        <comments>https://news.ycombinator.com/item?id=44063703</comments>
        <guid isPermaLink="false">https://news.ycombinator.com/item?id=44063703</guid>
        </item>
        </channel>
        </rss>
      `;

      const result = await parseHackerNewsFeed(sampleXml);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe("Claude 4");
      expect(result[0].link).toBe("https://www.anthropic.com/news/claude-4");
      expect(result[0].source).toBe("hackernews");
    });
  });

  describe("parseRedditFeed", () => {
    it("parses Reddit RSS correctly and uses feed name as source", async () => {
      // Sample Reddit RSS XML
      const sampleXml = `
        <feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
            <category term="factorio" label="r/factorio"/>
            <updated>2025-05-22T19:40:27+00:00</updated>
            <icon>https://www.redditstatic.com/icon.png/</icon>
            <id>/r/factorio/top.rss?t=day</id>
            <link rel="self" href="https://www.reddit.com/r/factorio/top.rss?t=day" type="application/atom+xml"/>
            <link rel="alternate" href="https://www.reddit.com/r/factorio/top?t=day" type="text/html"/>
            <logo>https://b.thumbs.redditmedia.com/slwYpQeWMVyRwpV_cgthYvlk4f2QU2SD5N_Id-dlWmA.png</logo>
            <subtitle>Community-run subreddit for the game Factorio made by Wube Software.</subtitle>
            <title>top scoring links : factorio</title>
            <entry>
                <author>
                    <name>/u/Zwa333</name>
                    <uri>https://www.reddit.com/user/Zwa333</uri>
                </author>
                <category term="factorio" label="r/factorio"/>
                <content type="html">&lt;table &gt;&lt;tr &gt;&lt;td &gt;&lt;a href=&quot;https://www.reddit.com/r/factorio/comments/1ksn7nb/sushi_science/&quot;&gt;&lt;img src=&quot;https://external-preview.redd.it/YndlaG83bnc0YjJmMdLRh348qNDgACTzJq65IzpQ083YCYnIFEZh-FDc_mvz.png?width=640 &amp;amp;crop=smart &amp;amp;auto=webp &amp;amp;s=1b3b87c1586673a073e0b267b1513f1cf0dbc9af &quot;alt=&quot;Sushi Science &quot;title=&quot;Sushi Science &quot;/&gt;&lt;/a &gt;&lt;/td &gt;&lt;td &gt;&lt;!-- SC_OFF --&gt;&lt;div class=&quot;md &quot;&gt;&lt;p &gt;Each incoming belt is slowed down to 1/8th speed before merging onto the sushi belt. A yellow belt brings it down to 1/4 then it loops back to half the speed again. I realised after building this I could have used just one side of a yellow and put half the science on either side to achieve the same effect of the loop back. But this looks nice so I don &amp;#39;t really care. This does mean the sushi belts are only 3/4 utilised, but mechanically splitting out 1/3rds is a pain.&lt;/p &gt;&lt;p &gt;Currently built 4 out of the 8 of these that I need to consume a full belt of each science, however I &amp;#39;m still nowhere near actually producing this much so it &amp;#39;s plenty for now. Also haven &amp;#39;t even started on promethium which is what the empty belt is for.&lt;/p &gt;&lt;p &gt;Video compression unfortunately hasn &amp;#39;t handled this well, which makes sense as the mixed belts are basically noise to the compression algorithm.&lt;/p &gt;&lt;p &gt;Blueprint &lt;a href=&quot;https://factoriobin.com/post/jbwv7mgs8jl2-EXPIRES &quot;&gt;https://factoriobin.com/post/jbwv7mgs8jl2-EXPIRES &lt;/a &gt;(doesn &amp;#39;t include tiles which are still WIP)&lt;/p &gt;&lt;/div &gt;&lt;!-- SC_ON --&gt;&amp;#32; submitted by &amp;#32; &lt;a href=&quot;https://www.reddit.com/user/Zwa333 &quot;&gt;/u/Zwa333 &lt;/a &gt;&lt;br/&gt;&lt;span &gt;&lt;a href=&quot;https://v.redd.it/c29z47nw4b2f1 &quot;&gt;[link]&lt;/a &gt;&lt;/span &gt;&amp;#32; &lt;span &gt;&lt;a href=&quot;https://www.reddit.com/r/factorio/comments/1ksn7nb/sushi_science/&quot;&gt;[comments]&lt;/a &gt;&lt;/span &gt;&lt;/td &gt;&lt;/tr &gt;&lt;/table &gt;</content>
                <id>t3_1ksn7nb</id>
                <media:thumbnail url="https://external-preview.redd.it/YndlaG83bnc0YjJmMdLRh348qNDgACTzJq65IzpQ083YCYnIFEZh-FDc_mvz.png?width=640&amp;crop=smart&amp;auto=webp&amp;s=1b3b87c1586673a073e0b267b1513f1cf0dbc9af"/>
                <link href="https://www.reddit.com/r/factorio/comments/1ksn7nb/sushi_science/"/>
                <updated>2025-05-22T10:21:17+00:00</updated>
                <published>2025-05-22T10:21:17+00:00</published>
                <title>Sushi Science</title>
            </entry>
        </feed>
      `;

      const feedName = "Factorio";
      const result = await parseRedditFeed(sampleXml, feedName);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe("Sushi Science");
      expect(result[0].link).toBe(
        "https://www.reddit.com/r/factorio/comments/1ksn7nb/sushi_science/",
      );
      expect(result[0].source).toBe("Factorio");
      expect(result[0].type).toBe("factorio");
    });
  });
});
