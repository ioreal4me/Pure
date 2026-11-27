!(function () {
  var e;
  try {
    var a = JSON.parse($request.body);
    e =
      "0007" === a.placementNo
        ? '{"materialsList":[{"billMaterialsId":"255","filePath":"h","creativeType":1}],"advertParam":{"skipTime":1}}'
        : "G0054" === a.placementNo
          ? '{"code":"00","materialsList":[{}]}'
          : '{"code":"00","message":"无广告返回"}';
  } catch (err) {
    e = '{"code":"00","message":"无广告返回"}';
  }
  $done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "application/json" },
    body: e,
  });
})();
