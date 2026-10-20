import axios from "axios";
import * as cheerio from "cheerio";

export class UrlExtractionError extends Error {}

export async function extractUrlContent(
  url: string,
): Promise<{ title: string | null; content: string }> {
  let response: Awaited<ReturnType<typeof axios.get<string>>>;
  try {
    response = await axios.get<string>(url, {
      timeout: 12_000,
      maxContentLength: 3_000_000,
      headers: {
        "User-Agent": "TuriumKnowledgeInbox/1.0 (+content extraction)",
      },
      responseType: "text",
    });
  } catch {
    throw new UrlExtractionError(
      "The URL could not be fetched. Check that it is publicly accessible.",
    );
  }

  const contentType = String(response.headers["content-type"] ?? "");
  if (!contentType.includes("text/html")) {
    throw new UrlExtractionError(
      "The URL did not return an HTML page that can be read.",
    );
  }

  const $ = cheerio.load(response.data);
  $(
    "script, style, noscript, svg, nav, footer, header, aside, form, iframe",
  ).remove();
  const main = $("main, article, [role='main']").first();
  const content = (main.length ? main : $("body"))
    .text()
    .replace(/\s+/g, " ")
    .trim();
  if (content.length < 80)
    throw new UrlExtractionError(
      "Not enough readable page text was found at this URL.",
    );

  return { title: $("title").first().text().trim() || null, content };
}
