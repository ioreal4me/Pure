// 滴滴 — Quantumult X script-response-body
// Converted from Egern/didi.yaml: each branch replicates one source jq filter exactly.
// Parse error -> $done({}) passthrough.

var url = $request.url;

function isObj(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function delPath(o, path) {
  var cur = o;
  for (var i = 0; i < path.length - 1; i++) {
    if (cur === null || typeof cur !== "object") return;
    cur = cur[path[i]];
  }
  if (cur !== null && typeof cur === "object") delete cur[path[path.length - 1]];
}

function keepKeys(o, keys) {
  var out = {};
  Object.keys(o).forEach(function (k) {
    if (keys.indexOf(k) >= 0) out[k] = o[k];
  });
  return out;
}

var obj = null;
var parsed = true;
try {
  obj = JSON.parse($response.body);
} catch (e) {
  parsed = false;
}

if (!parsed) {
  $done({});
} else {

  // 1. as toggles: .data |= map(select(.name != "isUseNetConnectivity") | .assign.args.rootca_pin = 0 | .assign.args.sni_list = {})
  if (/^https:\/\/as\.xiaojukeji\.com\/ep\/as\/toggles/.test(url)) {
    if (Array.isArray(obj.data)) {
      obj.data = obj.data
        .filter(function (e) { return !(e && e.name === "isUseNetConnectivity"); })
        .map(function (e) {
          if (e && typeof e === "object") {
            if (!isObj(e.assign)) e.assign = {};
            if (!isObj(e.assign.args)) e.assign.args = {};
            e.assign.args.rootca_pin = 0;
            e.assign.args.sni_list = {};
          }
          return e;
        });
    }
  }

  // 2. homepage slow: delpaths([["data","order_cards","new_loss_banner_card"],["data","order_cards","call_car_card_80"]])
  else if (/^https:\/\/conf\.diditaxi\.com\.cn\/homepage\/v\d\/other\/slow/.test(url)) {
    delPath(obj, ["data", "order_cards", "new_loss_banner_card"]);
    delPath(obj, ["data", "order_cards", "call_car_card_80"]);
  }

  // 3. homepage core: nav_list_card keep dache_anycar/carmate/driverservice/bike/nav_more_v3; top_nav_info keep chu_xing/freight_cargo
  else if (/^https:\/\/conf\.diditaxi\.com\.cn\/homepage\/v\d\/core/.test(url)) {
    var keepNav = ["dache_anycar", "carmate", "driverservice", "bike", "nav_more_v3"];
    if (isObj(obj.data) && isObj(obj.data.order_cards) && isObj(obj.data.order_cards.nav_list_card) && Array.isArray(obj.data.order_cards.nav_list_card.data)) {
      obj.data.order_cards.nav_list_card.data = obj.data.order_cards.nav_list_card.data.filter(function (e) {
        return e && keepNav.indexOf(e.nav_id) >= 0;
      });
    }
    var keepTop = ["chu_xing", "freight_cargo"];
    if (isObj(obj.data) && isObj(obj.data.disorder_cards) && isObj(obj.data.disorder_cards.top_nav_list) && isObj(obj.data.disorder_cards.top_nav_list.data) && Array.isArray(obj.data.disorder_cards.top_nav_list.data.top_nav_info)) {
      obj.data.disorder_cards.top_nav_list.data.top_nav_info = obj.data.disorder_cards.top_nav_list.data.top_nav_info.filter(function (e) {
        return e && keepTop.indexOf(e.nav_id) >= 0;
      });
    }
  }

  // 4. homepage fast: delpaths communicate_card/not_login_bottom_bar/riding_code_card/guess_card/scene_list_card, data.order_cards, car_icon.data.icon_info_new_agreement
  else if (/^https:\/\/conf\.diditaxi\.com\.cn\/homepage\/v\d\/other\/fast/.test(url)) {
    delPath(obj, ["data", "disorder_cards", "communicate_card"]);
    delPath(obj, ["data", "disorder_cards", "not_login_bottom_bar"]);
    delPath(obj, ["data", "disorder_cards", "riding_code_card"]);
    delPath(obj, ["data", "disorder_cards", "guess_card"]);
    delPath(obj, ["data", "disorder_cards", "scene_list_card"]);
    delPath(obj, ["data", "order_cards"]);
    delPath(obj, ["data", "disorder_cards", "car_icon", "data", "icon_info_new_agreement"]);
  }

  // 5. usercenter layout: .data.instances keep 3 cards; wallet card view_info keep title == "优惠卡券" (only when view_info present)
  else if (/^https:\/\/common\.diditaxi\.com\.cn\/common\/v\d\/usercenter\/layout/.test(url)) {
    if (isObj(obj.data) && isObj(obj.data.instances)) {
      obj.data.instances = keepKeys(obj.data.instances, ["center_base_info_card", "center_wallet_finance_card", "center_order_related_card"]);
      var wallet = obj.data.instances.center_wallet_finance_card;
      if (wallet && isObj(wallet.data) && wallet.data.view_info && Array.isArray(wallet.data.view_info)) {
        wallet.data.view_info = wallet.data.view_info.filter(function (e) {
          return e && e.title === "优惠卡券";
        });
      }
    }
  }

  // 6. dache_homepage_layout: .data.instances keep keys matching test("feed_back_|dache_main_member|order_container_|dache_main_core_icon|dache_main_card_")
  else if (/^https:\/\/api\.udache\.com\/gulfstream\/porsche\/v\d\/dache_homepage_layout/.test(url)) {
    if (isObj(obj.data) && isObj(obj.data.instances)) {
      var re = /feed_back_|dache_main_member|order_container_|dache_main_core_icon|dache_main_card_/;
      var inst = {};
      Object.keys(obj.data.instances).forEach(function (k) {
        if (re.test(k)) inst[k] = obj.data.instances[k];
      });
      obj.data.instances = inst;
    }
  }

  // 7. intercity getFullPageInfoLayout: .data.disorder_components keep 5 names
  else if (/^https:\/\/api\.udache\.com\/intercity\/ticket\/api\/v\d\/core\/getFullPageInfoLayout/.test(url)) {
    var keepNames = ["history_order_card", "inprogress_order_card", "station_calendar", "main_card_v2", "user_history_order"];
    if (isObj(obj.data) && Array.isArray(obj.data.disorder_components)) {
      obj.data.disorder_components = obj.data.disorder_components.filter(function (e) {
        return e && keepNames.indexOf(e.name) >= 0;
      });
    }
  }

  // 8. apolloConfig: .data |= map(select(.name != "daijia-memberInfo-config" and .name != "daijia-transfer-share-config"))
  else if (/^https:\/\/daijia\.kuaidadi\.com(:443)?\/gateway\?api=lj\.cos\.apolloConfig/.test(url)) {
    if (Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (e) {
        return !(e && (e.name === "daijia-memberInfo-config" || e.name === "daijia-transfer-share-config"));
      });
    }
  }

  // 9. apolloToggle: .data |= map(select(.name in whitelist object))
  else if (/^https:\/\/daijia\.kuaidadi\.com(:443)?\/gateway\?api=lj\.cos\.apolloToggle/.test(url)) {
    var allow = {
      "daijia_app_estimate_pre_req_switch": true,
      "daijia_agent_car_picture_check": true,
      "daijia_bluetooth_wifi_degrade_switch": true,
      "daijia_weixin_publish_login": true,
      "daijia_estimate_recommend_degrade_switch": true,
      "daijia_yugu_policy_switch": true,
      "daijia_home_location_guide_switch": true,
      "daijia_estimate_switch": true
    };
    if (Array.isArray(obj.data)) {
      obj.data = obj.data.filter(function (e) {
        return e && Object.prototype.hasOwnProperty.call(allow, e.name);
      });
    }
  }

  // 10. bronze pinchengle_homepage_layout: .data.instances keep 5 keys
  else if (/^https:\/\/api\.udache\.com\/gulfstream\/porsche\/v\d\/bronze\/pinchengle_homepage_layout/.test(url)) {
    if (isObj(obj.data) && isObj(obj.data.instances)) {
      obj.data.instances = keepKeys(obj.data.instances, ["dacheanycar-certificates-1", "main-card-1", "map-1", "nav-1", "tool-container-1"]);
    }
  }

  // 11. SFCHomeTab: .data.tab_list keep tab_id passenger/driver
  else if (/^https:\/\/api\.udache\.com\/gulfstream\/porsche\/v\d\/SFCHomeTab/.test(url)) {
    if (isObj(obj.data) && Array.isArray(obj.data.tab_list)) {
      obj.data.tab_list = obj.data.tab_list.filter(function (e) {
        return e && (e.tab_id === "passenger" || e.tab_id === "driver");
      });
    }
  }

  // 12. itineraryList: del(.data.tab_nav[]?.tab_param)
  else if (/^https:\/\/common\.diditaxi\.com\.cn\/user_common\/itineraryList/.test(url)) {
    if (isObj(obj.data) && Array.isArray(obj.data.tab_nav)) {
      obj.data.tab_nav.forEach(function (e) {
        if (e && typeof e === "object") delete e.tab_param;
      });
    }
  }

  // 13. htwkop gateway hm.fa.*: .data = {} (was jsonjq, moved to JS in v3)
  else if (/^https:\/\/htwkop\.xiaojukeji\.com(:443)?\/gateway\?api=hm\.fa\./.test(url)) {
    obj.data = {};
  }

  // 14. poi map startinfo/poiinfo: del(.rec_destination) (was jsonjq, moved to JS in v3)
  else if (/^https:\/\/poi\.map\.xiaojukeji\.com\/mapapi\/(startinfo|poiinfo)/.test(url)) {
    delPath(obj, ["rec_destination"]);
  }

  $done({ body: JSON.stringify(obj) });
}
