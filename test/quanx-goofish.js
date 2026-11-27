/**
 * 闲鱼去广告 — Quantumult X script-response-body
 * Converted from:
 *   (S) Script/goofish.js — Egern script, 7 branches (S1-S7), ported branch-for-branch.
 *   (J) Egern/goofish.yaml rewrites — 18 response_jq entries (J1-J17 + my.adapter jq),
 *       folded in as URL branches. The my.adapter jq (J18) and the Egern script's
 *       branch 3 (S3) do the same work, so they are merged into ONE branch below.
 * Branch on $request.url, parse $response.body, $done({body: JSON.stringify(obj)}).
 * Parse error / no branch matched -> $done({}) passthrough. 
 */
(function () {
  try {
    var url = $request.url || "";
    var body = $response.body;
    if (!body) {
      $done({});
      return;
    }
    var obj = JSON.parse(body);
    if (!obj || typeof obj !== "object") {
      $done({});
      return;
    }
    var data = obj.data;
    var matched = true;

    // ---------- (S) branches ported from Script/goofish.js ----------

    // S1. 首页商品信息流广告 mtop.taobao.idlehome.home.nextfresh
    if (url.indexOf("/mtop.taobao.idlehome.home.nextfresh") !== -1) {
      if (!data) { $done({}); return; }
      delete data.widgetReturnDO;
      delete data.bannerReturnDO;
      if (Array.isArray(data.sections)) {
        var excludeNames1 = [
          "fish_home_yunying_card_d3",
          "idlefish_seafood_market",
          "fish_home_chat_room"
        ];
        data.sections = data.sections.filter(function (section) {
          if (!section || typeof section !== "object") return false;
          var sectionData = section.data || {};
          var templateName = section.template ? section.template.name : undefined;
          if (sectionData.bizType === "AD" || sectionData.bizType === "homepage") {
            return false;
          }
          if (excludeNames1.indexOf(templateName) !== -1) {
            return false;
          }
          return sectionData.cardTypeValue === "Item";
        });
      }
      data.homeTopList = [];
    }
    // S2. 定位地区页面信息流广告 mtop.taobao.idle.local.home
    // (effective Egern scope: the scripting match required "/" or end right
    //  after ".home", so local.home.top etc. are NOT handled here)
    else if (/\/mtop\.taobao\.idle\.local\.home(?:\/|\?|$)/.test(url)) {
      if (!data) { $done({}); return; }
      if (Array.isArray(data.sections)) {
        data.sections = data.sections.filter(function (section) {
          var bizType = section && section.data ? section.data.bizType : undefined;
          return bizType !== "AD";
        });
      }
    }
    // S3+J18. 个人主页广告 mtop.idle.user.page.my.adapter
    // Egern branch 3 and the yaml jq entry are the same mutations, merged once:
    //   sections kept = index "0"/"1"/"3"; delete the index-"0" section's
    //   item.level (会员等级 strip); data.ability = [].
    // (jq deletes sections[0].item.level after filtering; the Egern script's
    //  the index-"0" section. Same result whenever an index-"0" section exists.)
    else if (url.indexOf("/mtop.idle.user.page.my.adapter") !== -1) {
      if (!data) { $done({}); return; }
      var sections3 = data.container ? data.container.sections : undefined;
      if (Array.isArray(sections3)) {
        var keepIndexes = ["0", "1", "3"];
        data.container.sections = sections3.filter(function (item) {
          return keepIndexes.indexOf(String(item ? item.index : undefined)) !== -1;
        });
      }
      var userSection = null;
      var kept3 = data.container ? data.container.sections : undefined;
      if (Array.isArray(kept3)) {
        for (var i3 = 0; i3 < kept3.length; i3++) {
          if (String(kept3[i3] ? kept3[i3].index : undefined) === "0") {
            userSection = kept3[i3];
            break;
          }
        }
      }
      if (userSection && userSection.item) {
        delete userSection.item.level;
      }
      data.ability = [];
    }
    // S4. 首页顶部频道菜单 mtop.taobao.idlehome.home.circle.list
    else if (url.indexOf("/mtop.taobao.idlehome.home.circle.list") !== -1) {
      if (!data) { $done({}); return; }
      if (Array.isArray(data.circleList)) {
        data.circleList = data.circleList.filter(function (circle) {
          var cid = circle ? circle.circleId : undefined;
          return cid === "1" || cid === "2";
        });
      }
      if (data.next && Array.isArray(data.next.headList)) {
        data.next.headList = data.next.headList.filter(function (item) {
          var bc = item ? item.bizCode : undefined;
          return bc === "main" || bc === "recycle";
        });
        var targetNext = null;
        for (var i4a = 0; i4a < data.next.headList.length; i4a++) {
          if (data.next.headList[i4a] && data.next.headList[i4a].bizCode === "recycle") {
            targetNext = data.next.headList[i4a];
            break;
          }
        }
        if (targetNext) {
          targetNext.showInfo = targetNext.showInfo || {};
          targetNext.showInfo.rightTagImage = {};
        }
      }
      if (Array.isArray(data.headList)) {
        data.headList = data.headList.filter(function (item) {
          var bc = item ? item.bizCode : undefined;
          return bc === "main" || bc === "recycle";
        });
        var targetHead = null;
        for (var i4b = 0; i4b < data.headList.length; i4b++) {
          if (data.headList[i4b] && data.headList[i4b].bizCode === "recycle") {
            targetHead = data.headList[i4b];
            break;
          }
        }
        if (targetHead) {
          targetHead.showInfo = targetHead.showInfo || {};
          targetHead.showInfo.rightTagImage = {};
        }
      }
    }
    // S5. 商品详情页周边推荐 mtop.taobao.idle.local.nearby.itemdetail.enter
    else if (url.indexOf("/mtop.taobao.idle.local.nearby.itemdetail.enter") !== -1) {
      if (!data) { $done({}); return; }
      data.targetUrl = "";
      if (data.trackParams && typeof data.trackParams === "object") {
        data.trackParams.itemIds = "";
      }
      data.nearbyItemInfoList = [];
      data.name = "";
      data.desc = "";
      data.poiName = "";
    }
    // S6. 搜索结果信息流广告 mtop.taobao.idlemtopsearch.search
    // (effective Egern scope: scripting match required "/" or end right after
    //  ".search", so search.shade / search.discover / search.activate.tablist
    //  are NOT handled here — they have their own branches/lines below)
    else if (/\/mtop\.taobao\.idlemtopsearch\.search(?:\/|\?|$)/.test(url)) {
      if (!data) { $done({}); return; }
      if (Array.isArray(data.resultList)) {
        var excludeNames6 = [
          "idlefish_search_card_category_select",
          "idlefish_search_spu_market_publish"
        ];
        data.resultList = data.resultList.filter(function (element) {
          var exContent = element && element.data && element.data.item &&
            element.data.item.main ? element.data.item.main.exContent : undefined;
          if (exContent && (exContent.isAliMaMaAD === true || exContent.isAliMaMaAD === "true")) {
            return false;
          }
          var templateName = element && element.data && element.data.template
            ? element.data.template.name : undefined;
          return excludeNames6.indexOf(templateName) === -1;
        });
      }
      delete data.resultPrefixBar;
      if (Array.isArray(data.topList)) {
        data.topList = [];
      }
    }
    // S7. 同城页横幅广告 mtop.taobao.idle.local.flow.plat.section
    else if (url.indexOf("/mtop.taobao.idle.local.flow.plat.section") !== -1) {
      if (!data) { $done({}); return; }
      var components7 = data.data ? data.data.components : undefined;
      if (Array.isArray(components7)) {
        data.data.components = components7.filter(function (item) {
          var key = item ? item.key : undefined;
          return key !== "fish_home_activity_enter_cardV1";
        });
      }
    }

    // ---------- (J) branches folded from the yaml response_jq entries ----------

    // J1. widget.refresh.get — jq: .data.homeTopList = []
    else if (url.indexOf("/mtop.taobao.idlehome.widget.refresh.get") !== -1) {
      obj.data = obj.data || {};
      obj.data.homeTopList = [];
    }
    // J2. idle.home.whale.modulet — jq: .data.container.sections |= map(select(.template.name == "fish_home_miniapp"))
    else if (url.indexOf("/mtop.taobao.idle.home.whale.modulet") !== -1) {
      if (data && data.container && Array.isArray(data.container.sections)) {
        data.container.sections = data.container.sections.filter(function (s) {
          var tn = s && s.template ? s.template.name : undefined;
          return tn === "fish_home_miniapp";
        });
      }
    }
    // J3. idle.user.strategy.list — jq: del(.data)
    else if (url.indexOf("/mtop.taobao.idle.user.strategy.list") !== -1) {
      delete obj.data;
    }
    // J4. idle.fun.follow.recommend.feed.list — jq: .data.nextPage = "false" | .data.sections |= map(select(.cardData.userInfo.attention == "true"))
    else if (url.indexOf("/mtop.taobao.idle.fun.follow.recommend.feed.list") !== -1) {
      obj.data = obj.data || {};
      obj.data.nextPage = "false";
      if (Array.isArray(obj.data.sections)) {
        obj.data.sections = obj.data.sections.filter(function (s) {
          var att = s && s.cardData && s.cardData.userInfo
            ? s.cardData.userInfo.attention : undefined;
          return att === "true";
        });
      }
    }
    // J5. idle.fun.follow.feed.list — jq: .data.sections |= map(select(.cardType == 2001))
    else if (url.indexOf("/mtop.taobao.idle.fun.follow.feed.list") !== -1) {
      if (data && Array.isArray(data.sections)) {
        data.sections = data.sections.filter(function (s) {
          return !!s && s.cardType === 2001;
        });
      }
    }
    // J6. idlehome.home.community — jq: .data.feedsList |= map(select(.template.name == "idlefish_home_new_commodity_card" or .template.name == "idlefish_home_new_content_card"))
    else if (url.indexOf("/mtop.taobao.idlehome.home.community") !== -1) {
      if (data && Array.isArray(data.feedsList)) {
        data.feedsList = data.feedsList.filter(function (s) {
          var tn = s && s.template ? s.template.name : undefined;
          return tn === "idlefish_home_new_commodity_card" ||
            tn === "idlefish_home_new_content_card";
        });
      }
    }
    // J7. idlehome.home.newitem.page — jq: .data.sections |= map(select(.data.clickParam.args.cardType as $ct | $ct != "banner" and $ct != "mamaAD"))
    else if (url.indexOf("/mtop.taobao.idlehome.home.newitem.page") !== -1) {
      if (data && Array.isArray(data.sections)) {
        data.sections = data.sections.filter(function (s) {
          var ct = s && s.data && s.data.clickParam && s.data.clickParam.args
            ? s.data.clickParam.args.cardType : undefined;
          return ct !== "banner" && ct !== "mamaAD";
        });
      }
    }
    // J8. idlemtopsearch.search.shade — jq: del(.data)
    else if (url.indexOf("/mtop.taobao.idlemtopsearch.search.shade") !== -1) {
      delete obj.data;
    }
    // J9. idlehome.magic.home.page.list — jq: delpaths([["data","topList"]])
    else if (url.indexOf("/mtop.taobao.idlehome.magic.home.page.list") !== -1) {
      if (data) {
        delete data.topList;
      }
    }
    // J10. idle.trade.full.info — jq: .data.components |= map(select(.render != "recommendTabVO"))
    else if (url.indexOf("/mtop.taobao.idle.trade.full.info") !== -1) {
      if (data && Array.isArray(data.components)) {
        data.components = data.components.filter(function (c) {
          var r = c ? c.render : undefined;
          return r !== "recommendTabVO";
        });
      }
    }
    // J11. idle.group.myself.banner — jq: .data.bannerList = []
    else if (url.indexOf("/mtop.taobao.idle.group.myself.banner") !== -1) {
      obj.data = obj.data || {};
      obj.data.bannerList = [];
    }
    // J12. idle.playboy.recommend/2.0 — jq: .data.recommends = [] | .data.items = [] | .data.next = false
    else if (url.indexOf("/mtop.taobao.idle.playboy.recommend/2.0") !== -1) {
      obj.data = obj.data || {};
      obj.data.recommends = [];
      obj.data.items = [];
      obj.data.next = false;
    }
    // J13. idle.fun.follow.often.visit — jq: .data.sections = []
    else if (url.indexOf("/mtop.taobao.idle.fun.follow.often.visit") !== -1) {
      obj.data = obj.data || {};
      obj.data.sections = [];
    }
    // J14. idle.circle.myself.banner/1.0 — jq: .data.bannerList = []
    else if (url.indexOf("/mtop.taobao.idle.circle.myself.banner/1.0") !== -1) {
      obj.data = obj.data || {};
      obj.data.bannerList = [];
    }
    // J15. idle.circle.visited/1.0 — jq: .data.visitedCircleList = []
    else if (url.indexOf("/mtop.taobao.idle.circle.visited/1.0") !== -1) {
      obj.data = obj.data || {};
      obj.data.visitedCircleList = [];
    }
    // J16. idlemtopsearch.search.activate.tablist — jq: .data.tabList = []
    else if (url.indexOf("/mtop.taobao.idlemtopsearch.search.activate.tablist") !== -1) {
      obj.data = obj.data || {};
      obj.data.tabList = [];
    }
    // J17. idle.trade.order.render — jq: del(.data.bottomBarVO.benefitPointAtmosphere) | .data.components |= map(select(.render != "meanTimeBuyVO"))
    else if (url.indexOf("/mtop.taobao.idle.trade.order.render") !== -1) {
      if (data) {
        if (data.bottomBarVO && typeof data.bottomBarVO === "object") {
          delete data.bottomBarVO.benefitPointAtmosphere;
        }
        if (Array.isArray(data.components)) {
          data.components = data.components.filter(function (c) {
            var r = c ? c.render : undefined;
            return r !== "meanTimeBuyVO";
          });
        }
      }
    }
    else {
      matched = false;
    }

    if (!matched) {
      $done({});
      return;
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
