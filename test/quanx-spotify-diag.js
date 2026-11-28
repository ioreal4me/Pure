// Spotify bodyBytes diagnostic (test only): reports whether this QuanX build
// provides $response.bodyBytes, then passes the response through unchanged.
var url = $request.url || "";
var hasBB = false, len = -1;
try {
  hasBB = typeof $response !== "undefined" && $response.bodyBytes != null;
  if (hasBB) len = $response.bodyBytes.length;
} catch (e) {}
var tail = url.split("?")[0].split("/").slice(-2).join("/");
$notify("Spotify bodyBytes diag", tail, "bodyBytes: " + (hasBB ? "YES len=" + len : "NO"));
console.log("[spotify-diag] " + tail + " bodyBytes=" + hasBB + " len=" + len);
$done({});
