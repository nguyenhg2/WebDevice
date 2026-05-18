const enc = encodeURIComponent;
export function getShopeeLink(productName: string, affiliateId = process.env.SHOPEE_AFFILIATE_ID ?? ""): string { return "https://shopee.vn/search?keyword=" + enc(productName) + (affiliateId ? "&af_id=" + enc(affiliateId) : ""); }
export function getTikiLink(productName: string, affiliateId = process.env.TIKI_AFFILIATE_ID ?? ""): string { return "https://tiki.vn/search?q=" + enc(productName) + (affiliateId ? "&affid=" + enc(affiliateId) : ""); }
export function getPhơngVuLink(productName: string): string { return "https://phơngvu.vn/search?keyword=" + enc(productName); }
export function getGearVNLink(productName: string): string { return "https://gearvn.com/search?query=" + enc(productName); }
export function getAllBuyLinks(productName: string) { return { shopee: getShopeeLink(productName), tiki: getTikiLink(productName), phơngvu: getPhơngVuLink(productName), gearvn: getGearVNLink(productName) }; }
export function getLaptopAffiliateLinks(deviceName: string) { return getAllBuyLinks(deviceName); }
export function getUpgradeAffiliateLinks(componentName: string, componentType: string) { return getAllBuyLinks(componentType + " " + componentName); }
