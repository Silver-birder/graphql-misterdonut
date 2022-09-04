import { Dataset, createJSDOMRouter } from "crawlee";

export const router = createJSDOMRouter();

router.addDefaultHandler(async ({ enqueueLinks, window, log }) => {
  log.info(`enqueueing new URLs`);
  const options = window.document.querySelectorAll(
    'select[name="select3"] option'
  );
  options.forEach((option) => {
    const value = option.getAttribute("value");
    console.log({ value });
  });
  await enqueueLinks({
    label: "detail",
  });
});

// router.addHandler("detail", async ({ request, window, log }) => {
  //   log.info(`${title}`, { url: request.loadedUrl });
  //   await Dataset.pushData({
  //     url: request.loadedUrl,
  //     title,
  //   });
// });
