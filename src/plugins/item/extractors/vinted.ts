import { Extractor } from "./base";
import { CheerioAPI } from "cheerio";

export class VintedExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/(www\.)?vinted\..*/.test(url);
  }

  getStoreName() {
    return "Vinted" as const;
  }

  getName($: CheerioAPI): string {
    return $(`[data-testid="item-page-summary-plugin"] span`).first().text();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`[data-testid="item-photo-1--img"]`).attr("src")!;
  }

  getPriceString($: CheerioAPI): string {
    return $(`[data-testid="item-price"]`)
      .next("button")
      .children()
      .first()
      .text();
  }

  override getMeta($: CheerioAPI) {
    return { likes: parseInt($(`[data-testid="favourite-button"]`).text()) };
  }
}
