import { BaseExtractor } from "./base";
import { CheerioAPI } from "cheerio";

export class ZaraExtractor extends BaseExtractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?zara\.com\/.*/.test(url);
  }

  getStoreName(): string {
    return "Zara";
  }

  getName($: CheerioAPI): string {
    return $(".product-detail-card-info__name").text();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`.media-image img`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    const x = $("html")
      .find(`[data-qa-qualifier="price-amount-current"]`)
      .text();
    console.log({ x });
    return x;
  }

  getMeta($: CheerioAPI) {
    return undefined;
  }
}
