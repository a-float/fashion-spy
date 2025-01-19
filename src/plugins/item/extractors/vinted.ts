import { Extractor } from "./base";
import { CheerioAPI } from "cheerio";

export class VintedExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?vinted\..*/.test(url);
  }

  getStoreName(): string {
    return "Vinted";
  }

  getName($: CheerioAPI): string {
    return $(`[data-testid="item-page-summary-plugin"] span`).text();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`[data-testid="item-photo-1--img"]`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    return $(`[data-testid="item-price"]`).text();
  }

  override getMeta($: CheerioAPI) {
    return { likes: parseInt($(`[data-testid="favourite-button"]`).text()) };
  }
}
