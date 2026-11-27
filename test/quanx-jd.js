/**
 * 京东开屏主接口响应处理 — Quantumult X script-response-body
 * Converted from Egern/jd.yaml body_rewrites response_jq:
 *   .images = [] | .showTimesDaily = 0 | .showtimes = 0 | .showTimes = 0
 *   | .start_isshow = 0 | .startIsshow = 0 | .showcondition = 0
 *   | .verCtrSwitch = 0 | .verCtrAllSwitch = 0 | .saoasaoSwitch = 0
 *   | .ver14CloseSwitch = 1 | .launchVideos = [] | .LaunchVideos = []
 *   | del(.startADImage)
 * Parse error -> $done({}) passthrough.
 */

var body = $response.body;

try {
  var obj = JSON.parse(body);

  obj.images = [];
  obj.showTimesDaily = 0;
  obj.showtimes = 0;
  obj.showTimes = 0;
  obj.start_isshow = 0;
  obj.startIsshow = 0;
  obj.showcondition = 0;
  obj.verCtrSwitch = 0;
  obj.verCtrAllSwitch = 0;
  obj.saoasaoSwitch = 0;
  obj.ver14CloseSwitch = 1;
  obj.launchVideos = [];
  obj.LaunchVideos = [];
  delete obj.startADImage;

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
