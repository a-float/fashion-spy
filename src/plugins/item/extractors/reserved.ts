import { CheerioAPI } from "cheerio";
import { Extractor } from "./base";

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
}
