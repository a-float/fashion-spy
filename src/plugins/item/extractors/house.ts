import { CheerioAPI } from "cheerio";
import { Extractor } from "./base";

export class HouseExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?housebrand\.com\/.*/.test(url);
  }

  getStoreName() {
    return "House" as const;
  }

  getName($: CheerioAPI): string {
    return $(`meta[name="keywords"]`).attr("content")!;
  }

  getImgSrc($: CheerioAPI): string {
    return $(`img.skeleton-gallery-main-photo`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    const amount = $(`meta[property="product:price:amount"]`).attr("content")!;
    const currency = $(`meta[property="product:price:currency"]`).attr(
      "content"
    )!;
    return `${amount} ${currency}`;
  }
}
