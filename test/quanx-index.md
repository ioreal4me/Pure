# QuanX 测试版（由 Egern 模块转换）

导入方法（每个模块相同）：

1. 重写：把模块的 `.snippet` 链接加到配置的 rewrite_remote，或在 App 里订阅该链接。
2. 脚本：snippet 里已写好 test/ 里的 JS 链接，不用单独加。
3. 分流（有 `-filter.snippet` 的模块才有）：把链接加到 filter_remote。
4. 开启 MITM 并信任证书，hostname 已写在 snippet 第一行。

## 模块

- Google：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-google.snippet ｜ 脚本 无 ｜ 分流 无
- 酷安 coolapk：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-coolapk.snippet ｜ 脚本 quanx-coolapk.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-coolapk-filter.snippet
- 闲鱼 goofish：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-goofish.snippet ｜ 脚本 quanx-goofish.js ｜ 分流 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-goofish-filter.snippet
- 库街区 kuro：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-kuro.snippet ｜ 脚本 无 ｜ 分流 无
- 米游社 miHoYo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-mihoyo.snippet ｜ 脚本 quanx-mihoyo.js ｜ 分流 无
- 微博轻享版 weibo：重写 https://raw.githubusercontent.com/ioreal4me/iOS/main/test/quanx-weibo.snippet ｜ 脚本 quanx-weibo.js ｜ 分流 无
