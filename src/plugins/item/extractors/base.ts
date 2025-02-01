import { CheerioAPI, load } from "cheerio";

type ItemData = {
  name: string;
  store: string;
  amount: number;
  currency: string;
  image: string;
  details: Record<string, string | number>;
};

export type StoreName = "Vinted" | "Zara" | "Reserved" | "H&M";

export abstract class Extractor {
  abstract appliesTo(url: string): boolean;
  abstract getStoreName(): StoreName;

  abstract getName($: CheerioAPI): string;
  abstract getImgSrc($: CheerioAPI): string;
  abstract getPriceString($: CheerioAPI): string;
  abstract getDetails($: CheerioAPI): ItemData["details"];

  private parseCurrency = (str: string) => {
    if (str === "zł") return "PLN";
    if (str === "€") return "EUR";
    return str;
  };

  async extractData(html: string): Promise<ItemData> {
    const $ = load(html);
    const priceStr = this.getPriceString($);
    const [amountStr, currencyStr] = priceStr.split(/\s+/);
    const amount = parseInt(amountStr.replaceAll(/[.,]/g, ""));
    const currency = this.parseCurrency(currencyStr);

    const imgSrc = this.getImgSrc($);
    if (!imgSrc) throw new Error("Could not find an image");
    const imgExt = new URL(imgSrc).pathname.split(".").at(-1);
    const hash = `${Bun.hash(imgSrc)}`;
    const imgFile = Bun.file(`./public/img/${hash}.${imgExt}`);

    // TODO do not save img if other things are not ready
    if (!(await imgFile.exists())) {
      console.log(`Fetching img from ${imgSrc}`);
      const imgRes = await fetch(imgSrc);
      await Bun.write(imgFile, await imgRes.blob());
    } else {
      // TODO resize img
      console.log("Using cached img");
    }

    return {
      name: this.getName($).trim(),
      store: this.getStoreName(),
      amount,
      currency,
      image: imgFile.name!,
      details: this.getDetails($),
    };
  }
}
