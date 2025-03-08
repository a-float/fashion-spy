import { CheerioAPI } from "cheerio";
import { Extractor } from "./base";

export class MedicineExtractor extends Extractor {
  appliesTo(url: string): boolean {
    return /^https:\/\/wearmedicine\.com\/.*/.test(url);
  }

  getStoreName() {
    return "Medicine" as const;
  }

  getName($: CheerioAPI): string {
    return $("h1").text().trim();
  }

  getImgSrc($: CheerioAPI): string {
    return $(`meta[property="og:image"]`).attr("content")!;
  }

  getPriceString($: CheerioAPI): string {
    const html = $.html();
    const amount = html.match(/"price":(.*?),/)?.at(1);
    const currency = html.match(/"priceCurrency":"(.*?)",/)?.at(1);
    console.log({ amount, currency });
    return `${amount} ${currency}`;
  }
}
