import { Extractor } from "./base";
import { CheerioAPI } from "cheerio";

export class HmExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/www2\.hm\.com\/.*/.test(url);
  }

  getStoreName(): string {
    return "H&M";
  }

  getName($: CheerioAPI): string {
    return $(`h1`).text();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`[data-testid="grid-gallery"] img`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    return "10.10 PLN";
  }

  getMeta($: CheerioAPI) {
    return undefined;
  }
}
