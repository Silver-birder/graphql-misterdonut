import { Dataset, createJSDOMRouter, Request } from "crawlee";

export const router = createJSDOMRouter();

router.addDefaultHandler(async ({ window, log, crawler }) => {
  log.info(`enqueueing new URLs`);
  let urls: { label: string; url: string }[] = [];
  window.document
    .querySelectorAll('select[name="select3"] option')
    .forEach((option) => {
      if (option.getAttribute("selected") !== null) {
        return;
      }
      const value = option.getAttribute("value");
      urls.push({
        label: "menu-history",
        url: `https://www.misterdonut.jp${value}` || "",
      });
    });
  crawler.addRequests(urls);
});

router.addHandler("menu-history", async ({ window, log }) => {
  log.info(`${window.document.title}, ${window.document.location.href}`);
  const createdYear = window.document
    .querySelector('[src^="/enjoy/zukan/donut/img/tit/k2_year_"]')
    ?.getAttribute("alt");
  let donuts: any[] = [];
  window.document.querySelectorAll("[title1]").forEach((donut) => {
    const category = donut
      .closest("table")
      ?.parentElement?.closest("table")
      ?.querySelectorAll("td")[0]
      .querySelector("img")
      ?.getAttribute("alt");
    const name = donut.getAttribute("title1");
    const price = donut.getAttribute("title2");
    const describe = donut.getAttribute("title3");
    const img = `https://www.misterdonut.jp/enjoy/zukan/donut/${donut.getAttribute(
      "href"
    )}`;
    donuts.push({
      createdYear,
      category,
      name,
      price,
      describe,
      img,
    });
  });
  await Dataset.pushData(donuts);
});
