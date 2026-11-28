// 微博轻享版去广告（Quantumult X script-response-body）
// 按 $request.url 分发：searchall 递归去广告 + 原 Egern 模块 5 条 response_jq 的 JS 复刻。
(function () {
  try {
    var url = $request.url;
    var body = $response.body;
    if (!body) {
      $done({});
      return;
    }
    var obj = JSON.parse(body);

    // (a) searchall：移植自 Script/weibo-search.js（Egern 版逻辑原样复刻）
    if (/^https?:\/\/api\.weibo\.cn\/2\/searchall\?/.test(url)) {
      var removed = 0;
      var AD_WORDS = ["广告", "廣告", "热推", "熱推"];
      var isAdStatus = function (s) {
        if (!s || typeof s !== "object") return false;
        if (AD_WORDS.indexOf(s.mblogtypename) !== -1) return true;
        if (s.ad_state === 1 || s.is_ad === 1) return true;
        if (s.promotion && s.promotion.type === "ad") return true;
        if (s.title && AD_WORDS.indexOf(s.title.text) !== -1) return true;
        if (s.content_auth_info && s.content_auth_info.content_auth_title === "广告") return true;
        return false;
      };
      var isAdItem = function (item) {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        if (isAdStatus(item)) return true;
        if (item.data && isAdStatus(item.data)) return true;
        return false;
      };
      var clean = function (node) {
        if (Array.isArray(node)) {
          var out = [];
          for (var i = 0; i < node.length; i++) {
            var el = node[i];
            if (isAdItem(el)) { removed++; continue; }
            out.push(clean(el));
          }
          return out;
        }
        if (node && typeof node === "object") {
          var keys = Object.keys(node);
          for (var j = 0; j < keys.length; j++) node[keys[j]] = clean(node[keys[j]]);
          return node;
        }
        return node;
      };
      obj = clean(obj);
      console.log("[weibo-search] removed " + removed);
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // (b1) statuses timeline
    // jq: del(.ad, .advertises, .trends) | if .statuses then .statuses |= map(select(.mblogtypename != "广告")) | .statuses |= map(select(.mblogtypename != "廣告")) | .statuses |= map(select(.mblogtypename != "热推")) | .statuses |= map(select(.mblogtypename != "熱推")) | .statuses |= map(select(.promotion.type != "ad")) end
    if (/^https?:\/\/api\.weibo\.cn\/2\/statuses\/.*timeline/.test(url)) {
      delete obj.ad;
      delete obj.advertises;
      delete obj.trends;
      if (obj.statuses && Array.isArray(obj.statuses)) {
        var keepStatus = function (s) {
          var type = s && typeof s === "object" ? s.mblogtypename : undefined;
          if (type === "广告") return false;
          if (type === "廣告") return false;
          if (type === "热推") return false;
          if (type === "熱推") return false;
          var promoType = s && typeof s === "object" && s.promotion && typeof s.promotion === "object" ? s.promotion.type : undefined;
          if (promoType === "ad") return false;
          return true;
        };
        obj.statuses = obj.statuses.filter(keepStatus);
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // (b2) get_coopen_ads
    // jq: .data |= . + {"ad_list":[],"pic_ad":[],"gdt_video_ad_ios":[],"display_ad":0,"ad_ios_id":null,"app_ad_ios_id":null,"reserve_ad_ios_id":"","reserve_app_ad_ios_id":"","ad_duration":604800,"ad_cd_interval":604800}
    if (/^https?:\/\/weibointl\.api\.weibo\.cn\/portal\.php\?a=get_coopen_ads&/.test(url)) {
      var coopen = {
        "ad_list": [],
        "pic_ad": [],
        "gdt_video_ad_ios": [],
        "display_ad": 0,
        "ad_ios_id": null,
        "app_ad_ios_id": null,
        "reserve_ad_ios_id": "",
        "reserve_app_ad_ios_id": "",
        "ad_duration": 604800,
        "ad_cd_interval": 604800
      };
      if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
        for (var k1 in coopen) obj.data[k1] = coopen[k1];
      } else if (obj.data === null || typeof obj.data === "undefined") {
        obj.data = coopen;
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // (b3) trends
    // jq: if .data.order then .data.order = ["search_topic"] end
    if (/^https?:\/\/weibointl\.api\.weibo\.cn\/portal\.php\?a=trends&/.test(url)) {
      if (obj.data && obj.data.order) {
        obj.data.order = ["search_topic"];
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // (b4) search_topic
    // jq: if .data.search_topic.cards[0].type == "searchtop" then del(.data.search_topic.cards[0]) end
    if (/^https?:\/\/weibointl\.api\.weibo\.cn\/portal\.php\?a=search_topic&/.test(url)) {
      if (obj.data && obj.data.search_topic && Array.isArray(obj.data.search_topic.cards) && obj.data.search_topic.cards[0] && obj.data.search_topic.cards[0].type === "searchtop") {
        obj.data.search_topic.cards.splice(0, 1);
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    // (b5) user_center
    // jq: if .data.cards then .data.cards[].items |= map(select(.type != "personal_vip")) | .data.cards |= map(select((.items | length) > 0)) end
    if (/^https?:\/\/weibointl\.api\.weibo\.cn\/portal\.php\?a=user_center&/.test(url)) {
      if (obj.data && Array.isArray(obj.data.cards)) {
        obj.data.cards.forEach(function (card) {
          if (card && Array.isArray(card.items)) {
            card.items = card.items.filter(function (item) {
              var t = item && typeof item === "object" ? item.type : undefined;
              return t !== "personal_vip";
            });
          }
        });
        obj.data.cards = obj.data.cards.filter(function (card) {
          var len = 0;
          if (card && Array.isArray(card.items)) len = card.items.length;
          else if (card && typeof card.items === "string") len = card.items.length;
          else if (card && card.items && typeof card.items === "object") len = Object.keys(card.items).length;
          return len > 0;
        });
      }
      $done({ body: JSON.stringify(obj) });
      return;
    }

    $done({});
  } catch (e) {
    $done({});
  }
})();
