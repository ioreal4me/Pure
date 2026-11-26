// 微博轻享版搜索结果去广告（Egern http_response 脚本）
// 递归扫描 searchall 响应，删除任意层级带广告标记的条目。
export default async function (ctx) {
  try {
    const root = await ctx.response.json();
    let removed = 0;
    const AD_WORDS = ["广告", "廣告", "热推", "熱推"];
    function isAdStatus(s) {
      if (!s || typeof s !== "object") return false;
      if (AD_WORDS.indexOf(s.mblogtypename) !== -1) return true;
      if (s.ad_state === 1 || s.is_ad === 1) return true;
      if (s.promotion && s.promotion.type === "ad") return true;
      if (s.title && AD_WORDS.indexOf(s.title.text) !== -1) return true;
      if (s.content_auth_info && s.content_auth_info.content_auth_title === "广告") return true;
      return false;
    }
    function isAdItem(item) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      if (isAdStatus(item)) return true;
      if (item.data && isAdStatus(item.data)) return true;
      return false;
    }
    function clean(node) {
      if (Array.isArray(node)) {
        const out = [];
        for (const el of node) {
          if (isAdItem(el)) { removed++; continue; }
          out.push(clean(el));
        }
        return out;
      }
      if (node && typeof node === "object") {
        for (const k of Object.keys(node)) node[k] = clean(node[k]);
        return node;
      }
      return node;
    }
    clean(root);
    try { console.log("[weibo-search] removed " + removed); } catch (e) {}
    return { body: root };
  } catch (e) {}
}
