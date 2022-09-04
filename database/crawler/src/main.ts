// For more information, see https://crawlee.dev/
import { JSDOMCrawler, ProxyConfiguration } from 'crawlee';
import { router } from './routes.js';

const startUrls = ['https://www.misterdonut.jp/enjoy/zukan/donut/'];

const crawler = new JSDOMCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

await crawler.run(startUrls);
