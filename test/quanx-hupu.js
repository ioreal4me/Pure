/**
 * 虎扑 (Hupu) — Quantumult X script
 * Converted from the Egern module (github-pure/Egern/hupu.yaml).
 * Serves two rewrite types, dispatched by $request.url:
 *   - script-echo-response  : the goblin interfaceAd/getOther respond entry
 *                             (fixed single-brace body, see below).
 *   - script-response-body  : every response_jq entry becomes one branch.
 * Any parse/logic error passes the original body through unchanged
 * ($done({})), matching Egern behaviour when a jq filter fails.
 */

function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function reqObj(o) { if (!isObj(o)) throw new Error("jq: cannot index non-object"); return o; }

var url = $request.url;

// (?i)^https?://goblin.hupu.com/\d+/[\d.]+/interfaceAd/getOther/
// Egern respond 200, Content-Type: application/json,
// body '{"ad_code":-41,"show_type":0,"ads":[]}' (single braces — the fixed version;
// the old double-brace body was invalid JSON and caused the launch white screen).
if (/goblin\.hupu\.com\/\d+\/[\d.]+\/interfaceAd\/getOther\//i.test(url)) {
  $done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "application/json" },
    body: '{"ad_code":-41,"show_type":0,"ads":[]}'
  });
} else {
  try {
    var obj = JSON.parse($response.body);
    if (!isObj(obj)) throw new Error("jq: root is not an object");

    if (/goblin\.hupu\.com\/\d\/\d\.\d\.\d+\/interfaceAd\/getOther/i.test(url)) {
      // jq: .ad_code = -41 | .ads = [] | if has("interval") then .interval = 0 else . end
      obj.ad_code = -41;
      obj.ads = [];
      if ("interval" in obj) obj.interval = 0;
    } else if (/games\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/bplapi\/user\/v1\/more/i.test(url)) {
      // jq: del(.result.inviteInfo, .result.vipInfo)
      if (isObj(obj.result)) {
        delete obj.result.inviteInfo;
        delete obj.result.vipInfo;
      }
    } else if (/games\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/buffer\/hotList/i.test(url)) {
      // jq: .result.topBanner = []
      if (obj.result === null || obj.result === undefined) obj.result = {};
      if (isObj(obj.result)) obj.result.topBanner = [];
    } else if (/bbs\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/topics\/\d/i.test(url)) {
      // jq: .data.topicResources = []
      if (obj.data === null || obj.data === undefined) obj.data = {};
      if (isObj(obj.data)) obj.data.topicResources = [];
    } else if (/bbs\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/bbsallapi\/topics\/topicSquareDetail/i.test(url)) {
      // jq: .data.list |= map(select(.cate_id != -99))
      if (isObj(obj.data) && Array.isArray(obj.data.list)) {
        obj.data.list = obj.data.list.filter(function (el) {
          reqObj(el);
          return el.cate_id !== -99;
        });
      }
    } else if (/bbs\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/bbsallapi\/lego\/data/i.test(url)) {
      // jq: .data.cards |= map(select(.code != "multiIcon"))
      if (isObj(obj.data) && Array.isArray(obj.data.cards)) {
        obj.data.cards = obj.data.cards.filter(function (el) {
          reqObj(el);
          return el.code !== "multiIcon";
        });
      }
    } else if (/games\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/bplbffapi\/device\/v1\/nav\/content/i.test(url)) {
      // jq: .result.components |= map(select(.order != 5))
      if (isObj(obj.result) && Array.isArray(obj.result.components)) {
        obj.result.components = obj.result.components.filter(function (el) {
          reqObj(el);
          return el.order !== 5;
        });
      }
    } else if (/bbs\.mobileapi\.hupu\.com\/\d\/\d\.\d\.\d+\/bbsallapi\/tab\/cardModule/i.test(url)) {
      // jq: .data = {}
      obj.data = {};
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
}
