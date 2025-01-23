import { Extractor } from "./base";
import { CheerioAPI } from "cheerio";

export class ReservedExtractor extends Extractor {
  getDataScript($: CheerioAPI) {
    return JSON.parse($(`script[type="application/ld+json"]`).text());
  }

  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?reserved\.com\/.*/.test(url);
  }

  getStoreName() {
    return "Reserved" as const;
  }

  // TODO store description?
  getName($: CheerioAPI): string {
    return this.getDataScript($).name;
  }

  getImgSrc($: CheerioAPI): string {
    return this.getDataScript($).image;
  }

  getPriceString($: CheerioAPI): string {
    const data = this.getDataScript($);
    return data.offers.price + " " + data.offers.priceCurrency;
  }

  override getMeta($: CheerioAPI) {
    return undefined;
  }
}
