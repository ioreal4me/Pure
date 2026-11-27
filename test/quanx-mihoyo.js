// miHoYo (米游社) — QuanX script-response-body
// Converted from Egern miHoYo.yaml response_body jq entries:
//  1) getAppStartupData: delpaths([[data,resp_map,/teenager/api/info],
//       [data,resp_map,"\"/apihub/api/getAppConfig\"",data,get_app_config_response,config,is_show_teenager_mode_btn],
//       [data,resp_map,"\"/apihub/api/getAppConfig\"",data,get_app_config_response,config,teenager_popup_freq_type]])
//  2) getAppConfig:      setpath([data,config,teenager_popup_freq_type]; 0) | setpath([data,config,is_show_teenager_mode_btn]; 0)
//  3) teenager/api/info: setpath([data,is_enabled]; false) | setpath([data,is_teenager]; false) | setpath([data,is_force]; false)
// Fail-safe: any error or unmatched URL passes the original body through unchanged.
(function () {
  var url = ($request && $request.url) || "";
  try {
    var obj = JSON.parse($response.body);

    if (
      /^https:\/\/bbs-api(-ab)?\.miyoushe\.com\/apihub\/api\/getAppStartupData$/i.test(url)
    ) {
      // Branch 1: delpaths (jq deletes are no-ops when a path is absent)
      if (obj && obj.data && obj.data.resp_map && typeof obj.data.resp_map === "object") {
        delete obj.data.resp_map["/teenager/api/info"];
        var cfgEntry = obj.data.resp_map['"/apihub/api/getAppConfig"'];
        if (
          cfgEntry &&
          cfgEntry.data &&
          cfgEntry.data.get_app_config_response &&
          cfgEntry.data.get_app_config_response.config &&
          typeof cfgEntry.data.get_app_config_response.config === "object"
        ) {
          delete cfgEntry.data.get_app_config_response.config.is_show_teenager_mode_btn;
          delete cfgEntry.data.get_app_config_response.config.teenager_popup_freq_type;
        }
      }
    } else if (
      /^https:\/\/bbs-api(-ab)?\.miyoushe\.com\/apihub\/api\/getAppConfig$/i.test(url)
    ) {
      // Branch 2: setpath x2 (jq setpath creates intermediate objects)
      if (!obj || typeof obj !== "object") throw new Error("not an object");
      if (!obj.data || typeof obj.data !== "object") obj.data = {};
      if (!obj.data.config || typeof obj.data.config !== "object") obj.data.config = {};
      obj.data.config.teenager_popup_freq_type = 0;
      obj.data.config.is_show_teenager_mode_btn = 0;
    } else if (
      /^https:\/\/bbs-api-ab\.miyoushe\.com\/teenager\/api\/info$/i.test(url)
    ) {
      // Branch 3: setpath x3 (jq setpath creates intermediate objects)
      if (!obj || typeof obj !== "object") throw new Error("not an object");
      if (!obj.data || typeof obj.data !== "object") obj.data = {};
      obj.data.is_enabled = false;
      obj.data.is_teenager = false;
      obj.data.is_force = false;
    } else {
      $done({});
      return;
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
