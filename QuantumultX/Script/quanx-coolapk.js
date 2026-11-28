/**
 * 酷安 (Coolapk) — Quantumult X script-response-body
 * Converted from Kris's Egern module (github-pure/Egern/coolapk.yaml).
 * Each Egern response_jq filter becomes one branch below, dispatched by
 * $request.url, replicating the jq logic exactly (same fields, conditions,
 * values). jq truthiness differs from JS: only false and null are falsy in
 * jq (0 and "" are truthy), so jqT() is used wherever jq tests a value.
 * Any parse/logic error passes the original body through unchanged
 * ($done({})), mirroring the source filters' `try ... catch .`.
 */

function jqT(v) { return v !== null && v !== undefined && v !== false; }
function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function get(o, k) { return (o !== null && typeof o === "object") ? o[k] : undefined; }
function reqObj(o) { if (!isObj(o)) throw new Error("jq: cannot index non-object"); return o; }
// jq map(select(f)): arrays filter in place; plain objects map over values;
// anything else is a jq error (caught upstream -> passthrough).
function jqFilter(v, pred) {
  if (Array.isArray(v)) return v.filter(pred);
  if (isObj(v)) return Object.keys(v).map(function (k) { return v[k]; }).filter(pred);
  throw new Error("jq: cannot iterate");
}
function hasId(el) { return jqT(get(el, "id")); } // select(.id?)

// ^https://api.coolapk.com/v6/feed/detail?
// jq: try (.data.hotReplyRows |= if . then map(select(.id?)) else . end
//        | .data.topReplyRows |= if . then map(select(.id?)) else . end
//        | reduce ("detailSponsorCard","include_goods","include_goods_ids") as $key (.; .data[$key] = [])) catch .
function branchDetail(obj) {
  var data = obj.data;
  if (data !== null && data !== undefined && !isObj(data)) throw new Error("jq: cannot index data");
  if (!isObj(data)) { data = {}; obj.data = data; }
  ["hotReplyRows", "topReplyRows"].forEach(function (k) {
    var v = data[k];
    if (jqT(v)) data[k] = jqFilter(v, hasId);
    else if (v === undefined) data[k] = null; // jq |= creates the key with null
  });
  data.detailSponsorCard = [];
  data.include_goods = [];
  data.include_goods_ids = [];
}

// ^https://api.coolapk.com/v6/feed/replyList
// jq: try (if .data? and ((.data | type) == "array") and (.data | length > 0)
//        then .data |= map(select(.id?)) else . end) catch .
function branchReplyList(obj) {
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    obj.data = obj.data.filter(hasId);
  }
}

// ^https://api.coolapk.com/v6/main/dataList
// jq: try (.data |= (if (type=="array" and length>0)
//        then map(select((.entityTemplate!="sponsorCard") and (.title!="精选配件")))
//        else . end)) catch .
function branchMainDataList(obj) {
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    obj.data = obj.data.filter(function (el) {
      reqObj(el); // jq accesses .entityTemplate/.title without "?" -> error on non-objects
      return el.entityTemplate !== "sponsorCard" && el.title !== "精选配件";
    });
  }
}

// ^https://api.coolapk.com/v6/page/dataList
// jq: try (.data |= (if (type=="array" and length>0)
//        then map(select((.title? != "话题热议") and (.title? != "酷安热搜")
//          and (.entityTemplate? != "imageScaleCard") and (.entityTemplate? != "sponsorCard")
//          and (.entityId? != 36104 and .entityId? != 24309 and .entityId? != 12889
//          and .entityId? != 21063 and .entityId? != 35730 and .entityId? != 35846
//          and .entityId? != 28374 and .entityId? != 28375 and .entityId? != 27332
//          and .entityId? != 20090 and .entityId? != 28773 and .entityId? != 29343
//          and .entityId? != 21106))
//          | if .entities then .entities |= map(select(.title? != "睡个好觉需要什么？")) else . end)
//        else . end)) catch .
var PAGE_IDS = [36104, 24309, 12889, 21063, 35730, 35846, 28374, 28375, 27332, 20090, 28773, 29343, 21106];
function branchPageDataList(obj) {
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    obj.data = obj.data.filter(function (el) {
      return get(el, "title") !== "话题热议" &&
        get(el, "title") !== "酷安热搜" &&
        get(el, "entityTemplate") !== "imageScaleCard" &&
        get(el, "entityTemplate") !== "sponsorCard" &&
        PAGE_IDS.indexOf(get(el, "entityId")) === -1;
    }).map(function (el) {
      if (el === null || el === undefined) return el;
      if (!isObj(el)) throw new Error("jq: cannot index element"); // .entities on a primitive/array errors in jq
      if (jqT(el.entities)) {
        el.entities = jqFilter(el.entities, function (e) {
          return get(e, "title") !== "睡个好觉需要什么？";
        });
      }
      return el;
    });
  }
}

// ^https://api.coolapk.com/v6/main/indexV8  (Kris's fixed basic-jq version)
// jq: .data |= map(select(.entityTemplate != "sponsorCard"))
//   | .data |= map(select(.entityTemplate != "imageCarouselCard_1"))
//   | .data |= map(select(.entityId != 8639)) | .data |= map(select(.entityId != 29349))
//   | .data |= map(select(.entityId != 33006)) | .data |= map(select(.entityId != 32557))
//   | .data |= map(select(.entityId != 28621))
//   | .data |= map(select(.title != "值得买")) | .data |= map(select(.title != "红包"))
var INDEX_IDS = [8639, 29349, 33006, 32557, 28621];
function branchIndexV8(obj) {
  if (Array.isArray(obj.data)) {
    obj.data = obj.data.filter(function (el) {
      reqObj(el); // jq accesses fields without "?" -> error on non-objects
      return el.entityTemplate !== "sponsorCard" &&
        el.entityTemplate !== "imageCarouselCard_1" &&
        INDEX_IDS.indexOf(el.entityId) === -1 &&
        el.title !== "值得买" &&
        el.title !== "红包";
    });
  }
}

// ^https://api.coolapk.com/v6/main/init
// jq: try (del(.data[]? | select(.entityId? == 944 or .entityId? == 945 or .entityId? == 6390
//        or .entityId? == 24455 or .entityId? == 36839 or .entityId? == 1635 or .title? == "关注"))
//   | .data |= map(if .entityId? == 20131 then .entities |= map(select(.title? != "酷品")) else . end)
//   | .data |= map(if .entities then .entities |= map(select(.entityId? != 1635 and .entityId? != 2261
//        and .entityId? != 1633 and .entityId? != 413 and .entityId? != 417 and .entityId? != 1754
//        and .entityId? != 1966 and .entityId? != 2274 and .entityId? != 1170 and .entityId? != 1175
//        and .entityId? != 1190 and .entityId? != 2258 and .title? != "关注")) else . end)) catch .
var INIT_DEL_IDS = [944, 945, 6390, 24455, 36839, 1635];
var INIT_ENT_IDS = [1635, 2261, 1633, 413, 417, 1754, 1966, 2274, 1170, 1175, 1190, 2258];
function branchInit(obj) {
  if (!Array.isArray(obj.data)) return;
  obj.data = obj.data.filter(function (el) {
    return !(INIT_DEL_IDS.indexOf(get(el, "entityId")) !== -1 || get(el, "title") === "关注");
  });
  obj.data = obj.data.map(function (el) {
    if (get(el, "entityId") === 20131) {
      // jq: .entities |= map(...) errors when entities is null -> passthrough via catch
      el.entities = jqFilter(el.entities, function (e) {
        return get(e, "title") !== "酷品";
      });
    }
    return el;
  });
  obj.data = obj.data.map(function (el) {
    if (el === null || el === undefined) return el;
    if (!isObj(el)) throw new Error("jq: cannot index element"); // .entities on a primitive/array errors in jq
    if (jqT(el.entities)) {
      el.entities = jqFilter(el.entities, function (e) {
        return INIT_ENT_IDS.indexOf(get(e, "entityId")) === -1 && get(e, "title") !== "关注";
      });
    }
    return el;
  });
}

// ^https://api.coolapk.com/v6/account/loadConfig?key=my_page_card_config
// jq: try (.data |= map(select(.entityType != "textLink"
//        and (.entityId != 1001 and .entityId != 1003 and .entityId != 1004 and .entityId != 1005))
//        | if .entities then .entities |= map(select(.entityType != "textLink")) else . end)) catch .
var LOADCONFIG_IDS = [1001, 1003, 1004, 1005];
function branchLoadConfig(obj) {
  if (!Array.isArray(obj.data)) return;
  obj.data = obj.data.filter(function (el) {
    reqObj(el); // jq accesses .entityType/.entityId without "?" -> error on non-objects
    return el.entityType !== "textLink" && LOADCONFIG_IDS.indexOf(el.entityId) === -1;
  }).map(function (el) {
    if (jqT(el.entities)) {
      el.entities = jqFilter(el.entities, function (e) {
        reqObj(e);
        return e.entityType !== "textLink";
      });
    }
    return el;
  });
}

var url = $request.url;
try {
  var obj = JSON.parse($response.body);
  if (!isObj(obj)) throw new Error("jq: root is not an object");
  if (/\/v6\/feed\/detail\?/.test(url)) branchDetail(obj);
  else if (/\/v6\/feed\/replyList/.test(url)) branchReplyList(obj);
  else if (/\/v6\/main\/dataList/.test(url)) branchMainDataList(obj);
  else if (/\/v6\/page\/dataList/.test(url)) branchPageDataList(obj);
  else if (/\/v6\/main\/indexV8/.test(url)) branchIndexV8(obj);
  else if (/\/v6\/main\/init/.test(url)) branchInit(obj);
  else if (/\/v6\/account\/loadConfig\?key=my_page_card_config/.test(url)) branchLoadConfig(obj);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
