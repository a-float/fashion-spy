import { CheerioAPI } from "cheerio";
import { Extractor } from "./base";

export class ZaraExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?zara\.com\/.*/.test(url);
  }

  getStoreName() {
    return "Zara" as const;
  }

  getName($: CheerioAPI): string {
    return $("title").text().split("|")[0].trim();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`.media-image img`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    return $("html").find(`[data-qa-qualifier="price-amount-current"]`).text();
  }
}
