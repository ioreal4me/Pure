# QuanX 测试版（由 Egern 模块转换）

导入方法（每个模块相同）：

1. 重写：把模块的 `.snippet` 链接加到配置的 rewrite_remote，或在 App 里订阅该链接。
2. 脚本：snippet 里已写好 test/ 里的 JS 链接，不用单独加。
3. 分流（有 `-filter.snippet` 的模块才有）：把链接加到 filter_remote。
4. 开启 MITM 并信任证书，hostname 已写在 snippet 第一行。

## 模块

- 已移至 Quantumult X/Rewrite/｜Google：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-google.snippet ｜ 脚本 无 ｜ 分流 无
- 已移至 Quantumult X/Rewrite/ + Script/｜酷安 coolapk：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-coolapk.snippet ｜ 脚本 Quantumult X/Script/quanx-coolapk.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-coolapk-filter.snippet
- 已移至 Quantumult X/Rewrite/ + Script/｜闲鱼 goofish：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-goofish.snippet ｜ 脚本 Quantumult X/Script/quanx-goofish.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-goofish-filter.snippet
- 库街区 kuro：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-kuro.snippet ｜ 脚本 无 ｜ 分流 无
- 米游社 miHoYo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-mihoyo.snippet ｜ 脚本 quanx-mihoyo.js ｜ 分流 无
- 已移至 Quantumult X/Rewrite/ + Script/｜微博轻享版 weibo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Rewrite/quanx-weibo.snippet ｜ 脚本 Quantumult X/Script/quanx-weibo.js ｜ 分流 无
- 已移至 Quantumult X/Spotify/｜Spotify（combined test）：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/Quantumult%20X/Spotify/quanx-spotify.snippet ｜ 脚本 quanx-spotify.js（同目录）｜ CDN 版 https://cdn.jsdelivr.net/gh/ioreal4me/iOS@main/Quantumult%20X/Spotify/quanx-spotify-cdn.snippet ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-spotify-filter.snippet（仍在 test/）｜ 来源 app2smile（proto 补丁）+ devchristian1337（广告接口与过滤脚本）+ Reukix（reject 清单）；用法：先登录 Spotify 再启用、重启 App；音质不能开超高（proto 补丁固有限制）；resolver/nebula 的 proto 分支为实验性

注：Spotify / Google / 微博轻享版 / 酷安 / 闲鱼 已移至 Quantumult X/ 正式目录（见上方各行新链接）；test/ 内保留了这五个模块的原始副本作备份，不再维护。
