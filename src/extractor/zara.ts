import { BaseExtractor } from "./base";
import { CheerioAPI } from "cheerio";

export class ZaraExtractor extends BaseExtractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?zara\.com\.*/.test(url);
  }

  getStoreName(): string {
    return "Zara";
  }

  getName($: CheerioAPI): string {
    return $(`[data-qa-qualifier="product-detail-info-name"]`).text();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`.product-detail-view__main-content img`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    return $(
      `.product-detail-info__price [data-qa-qualifier="price-amount-current"]`
    ).text();
  }

  getMeta($: CheerioAPI) {
    return undefined;
  }
}
