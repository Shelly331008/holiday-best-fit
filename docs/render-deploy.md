# Render 部署说明

这份说明用于把“假期最优解”部署成一个别人可以访问的公网链接。

## 一、当前推荐方案

使用 Render 的 `Web Service` 部署 Node 服务版。

部署后，别人访问 Render 提供的 `https://xxx.onrender.com` 链接，可以同时访问：

- 前端页面：`/`
- 报价接口：`/api/v1/flight-searches`
- 健康检查：`/health`

当前没有 OTA 商务凭证时，页面会展示明确标注的 DEMO 报价，不会伪装成实时票价。

## 二、部署前需要准备

1. 一个 Render 账号：<https://render.com>
2. 一个 GitHub 仓库，用来放当前项目文件
3. 当前项目至少包含这些文件：

```text
index.html
styles.css
app.js
server.cjs
package.json
render.yaml
assets/
docs/
```

## 三、上传到 GitHub

如果项目还没有 GitHub 仓库，先在 GitHub 新建一个仓库，例如：

```text
holiday-best-fit
```

然后把当前文件上传到仓库。

非技术方式：

1. 打开 GitHub 仓库页面
2. 点击 `Add file`
3. 选择 `Upload files`
4. 上传本项目文件
5. 点击 `Commit changes`

注意：不要上传真实 OTA 密钥、`.env` 文件或任何账号密码。

## 四、在 Render 创建 Web Service

1. 打开 Render Dashboard
2. 点击 `New`
3. 选择 `Web Service`
4. 连接你的 GitHub 仓库
5. 选择项目仓库 `holiday-best-fit`
6. 填写或确认以下配置：

| 字段 | 推荐值 |
|---|---|
| Name | `holiday-best-fit` |
| Language / Runtime | `Node` |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` |
| Health Check Path | `/health` |

## 五、环境变量

Render 页面里的 Environment Variables 建议配置：

| Key | Value | 说明 |
|---|---|---|
| `HOST` | `0.0.0.0` | 线上必须监听公网入口 |
| `NODE_VERSION` | `24.14.1` | 固定 Node 版本，避免未来版本变化 |

如果只是参赛演示，不需要配置 OTA 相关变量。

如果未来接入同程/艺龙真实接口，再增加：

```text
TONGCHENG_USER
TONGCHENG_APP_KEY
TONGCHENG_SECRET_KEY
TONGCHENG_API_BASE
TONGCHENG_DEEP_LINK_TEMPLATE
```

这些变量只能放在 Render 环境变量里，不要写进前端或提交到 GitHub。

## 六、发布后如何验证

部署成功后，Render 会给一个公网链接，例如：

```text
https://holiday-best-fit.onrender.com
```

依次检查：

1. 打开首页：`https://你的域名.onrender.com/`
2. 打开健康检查：`https://你的域名.onrender.com/health`
3. 页面是否出现 3 张推荐方案卡片
4. 推荐卡片是否显示“非实时报价”或“产品演示样例”
5. 切换加拿大/日本是否能重新生成结果
6. 展开“关键机票组合”是否能看到航段

## 七、常见问题

### 1. 页面第一次打开很慢

Render 免费 Web Service 空闲一段时间后会休眠。下一次访问会先唤醒服务，可能需要等待几十秒到一分钟。

### 2. 页面能打开，但接口失败

检查 Render 日志里是否有端口错误。线上必须满足：

```text
HOST=0.0.0.0
PORT=Render 自动注入
```

本项目代码已经读取 `PORT`，只需要在 Render 配置 `HOST=0.0.0.0`。

### 3. 为什么不是实时 OTA 价格

因为携程、去哪儿、美团、同程、飞猪等真实机票价格接口需要商务授权或合作方接口文档。当前参赛版本展示的是产品决策链路和接口预留结构，价格为 DEMO 数据。

### 4. 是否可以直接部署静态版

可以，但静态版没有服务端接口。为了更贴近 V2 产品形态，Hackathon 建议部署 Node 服务版。
