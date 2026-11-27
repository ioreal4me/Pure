# QuanX 测试版（由 Egern 模块转换）

导入方法（每个模块相同）：

1. 重写：把模块的 `.snippet` 链接加到配置的 rewrite_remote，或在 App 里订阅该链接。
2. 脚本：snippet 里已写好 test/ 里的 JS 链接，不用单独加。
3. 分流（有 `-filter.snippet` 的模块才有）：把链接加到 filter_remote。
4. 开启 MITM 并信任证书，hostname 已写在 snippet 第一行。

## 模块

- 12306（v3：换墨鱼 @ddgksf2013 原版脚本，script-analyze-echo-response + 只回 body；另加 direct 分流）：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-12306.snippet ｜ 脚本 quanx-12306.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-12306-filter.snippet
- Google：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-google.snippet ｜ 脚本 无 ｜ 分流 无
- 酷安 coolapk：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-coolapk.snippet ｜ 脚本 quanx-coolapk.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-coolapk-filter.snippet
- 滴滴 didi：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-didi.snippet ｜ 脚本 quanx-didi.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-didi-filter.snippet ｜ v3：模式去掉尾部 \? 改前缀匹配（对齐 ZenmoFeiShi 已验证写法），jsonjq 并入 JS
- 闲鱼 goofish：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-goofish.snippet ｜ 脚本 quanx-goofish.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-goofish-filter.snippet
- 虎扑 hupu（v2：goblin 只走 echo 单条短路，去掉 (?i) 前缀）：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-hupu.snippet ｜ 脚本 quanx-hupu.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-hupu-filter.snippet
- 京东 jd：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-jd.snippet ｜ 脚本 quanx-jd.js ｜ 分流 无
- 库街区 kuro：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-kuro.snippet ｜ 脚本 无 ｜ 分流 无
- 米游社 miHoYo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-mihoyo.snippet ｜ 脚本 quanx-mihoyo.js ｜ 分流 无
- 拼多多 pdd（v2：去掉 url-and-header 两行、jsonjq 并入 JS；若仍失效，在 [general] 加 udp_drop_list = QUIC 后再测）：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-pdd.snippet ｜ 脚本 quanx-pdd.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-pdd-filter.snippet
- 淘宝 taobao：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-taobao.snippet ｜ 脚本 quanx-taobao.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-taobao-filter.snippet
- 微博轻享版 weibo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-weibo.snippet ｜ 脚本 quanx-weibo.js ｜ 分流 无
