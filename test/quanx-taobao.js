/**
 * 淘宝响应处理 — Quantumult X script-response-body
 * Converted from Egern/taobao.yaml body_rewrites (2 response_jq entries),
 * branched on $request.url:
 *   poplayer:   .res.images = [] | .res.videos = [] | .enable = false | .mainRes.images = []
 *   cloudvideo: .data.duration = "0" | .data.resources = [] | .data.caches = []
 *               (duration is the STRING "0", exactly as in the source jq filter)
 * Parse error / no branch matched -> $done({}) passthrough.
 */

var url = $request.url;
var body = $response.body;

try {
  var obj = JSON.parse(body);
  var changed = false;

  if (/poplayer\.template\.alibaba\.com/.test(url)) {
    // jq assignment creates missing intermediate objects; mirror that.
    obj.res = obj.res || {};
    obj.res.images = [];
    obj.res.videos = [];
    obj.enable = false;
    obj.mainRes = obj.mainRes || {};
    obj.mainRes.images = [];
    changed = true;
  } else if (/guide-acs\.m\.taobao\.com\/gw\/mtop\.taobao\.cloudvideo\.video\.query/.test(url)) {
    obj.data = obj.data || {};
    obj.data.duration = "0";
    obj.data.resources = [];
    obj.data.caches = [];
    changed = true;
  }

  if (changed) {
    $done({ body: JSON.stringify(obj) });
  } else {
    $done({});
  }
} catch (e) {
  $done({});
}
