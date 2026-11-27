// 拼多多 — Quantumult X script-response-body
// Converted from Egern/pdd.yaml: each branch merges all source jq entries for that URL
// (applied in source order; the duplicated irregular_banner_dy deletion is idempotent).
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

  // 1. homepage hub (5 source jq entries merged):
  //    del result.dy_module.irregular_banner_dy, result.icon_set, result.search_bar_hot_query;
  //    bottom_tabs?/buffer_bottom_tabs? keep link in (index.html, chat_list.html, personal.html);
  //    all_top_opts elements del(.selected_image, .image, .height, .width)
  if (/^https:\/\/api\.pinduoduo\.com\/api\/alexa\/homepage\/hub\?/.test(url)) {
    delPath(obj, ["result", "dy_module", "irregular_banner_dy"]);
    delPath(obj, ["result", "icon_set"]);
    delPath(obj, ["result", "search_bar_hot_query"]);
    var keepTabs = ["index.html", "chat_list.html", "personal.html"];
    if (isObj(obj.result) && Array.isArray(obj.result.bottom_tabs)) {
      obj.result.bottom_tabs = obj.result.bottom_tabs.filter(function (e) {
        return e && keepTabs.indexOf(e.link) >= 0;
      });
    }
    if (isObj(obj.result) && Array.isArray(obj.result.buffer_bottom_tabs)) {
      obj.result.buffer_bottom_tabs = obj.result.buffer_bottom_tabs.filter(function (e) {
        return e && keepTabs.indexOf(e.link) >= 0;
      });
    }
    if (isObj(obj.result) && Array.isArray(obj.result.all_top_opts)) {
      obj.result.all_top_opts.forEach(function (e) {
        if (e && typeof e === "object") {
          delete e.selected_image;
          delete e.image;
          delete e.height;
          delete e.width;
        }
      });
    }
  }

  // 2. personal hub (4 source jq entries merged):
  //    del monthly_card_entrance, personal_center_style_v2_vo, icon_set.icons, icon_set.top_personal_icons
  else if (/^https:\/\/api\.pinduoduo\.com\/api\/philo\/personal\/hub\?/.test(url)) {
    delPath(obj, ["monthly_card_entrance"]);
    delPath(obj, ["personal_center_style_v2_vo"]);
    delPath(obj, ["icon_set", "icons"]);
    delPath(obj, ["icon_set", "top_personal_icons"]);
  }

  // 3. oak integration render (3 source jq entries merged):
  //    del bottom_section_list, ui.bottom_section, ui.live_section.float_info
  else if (/^https:\/\/api\.pinduoduo\.com\/api\/oak\/integration\/render\?/.test(url)) {
    delPath(obj, ["bottom_section_list"]);
    delPath(obj, ["ui", "bottom_section"]);
    delPath(obj, ["ui", "live_section", "float_info"]);
  }

  // 4. order_list_v4: .orders |= map(.order_buttons |= map(del(.order_growth_tip)))
  else if (/^https:\/\/api\.pinduoduo\.com\/api\/aristotle\/order_list_v4\?/.test(url)) {
    if (Array.isArray(obj.orders)) {
      obj.orders.forEach(function (o) {
        if (o && Array.isArray(o.order_buttons)) {
          o.order_buttons.forEach(function (b) {
            if (b && typeof b === "object") delete b.order_growth_tip;
          });
        }
      });
    }
  }

  // 5. order/ (2 source jq entries merged): del marketing_banner_vo, shipping.banner_above_recommend
  else if (/^https:\/\/api\.pinduoduo\.com\/order\//.test(url)) {
    delPath(obj, ["marketing_banner_vo"]);
    delPath(obj, ["shipping", "banner_above_recommend"]);
  }

  $done({ body: JSON.stringify(obj) });
}
