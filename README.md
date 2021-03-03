## 目录结构

```bash
├── dist                     # 构建产物目录
├── mock                     # 本地模拟数据
├── public
│   └── favicon.ico          # Favicon
├── src
│   ├── assets               # 本地静态资源（全局）
│   ├── components           # 业务通用组件（全局）
│   ├── layouts              # 通用布局（全局）
│   ├── models               # dva model（全局）
│   └── pages                # 业务页面
│       ├── .umi/            # dev 临时目录
│       ├── .umi-production/ # build 临时目录，会自动删除
│       ├── item             # 业务模块（如：商品管理）
│       ├── document.ejs     # HTML 入口模板
│       └── item             # 业务模块（如：商品管理）
│           ├── assets       # 本地静态资源（业务模块）
│           ├── components   # 业务通用组件（业务模块）
│           ├── models       # dva model（业务模块）
│           ├── services     # 后台接口服务（业务模块）
│           ├── taskMonthList.js      # 业务页面
│           └── page.less    # 业务页面样式
│   ├── services             # 后台接口服务（全局）
│   ├── utils                # 工具库
│   ├── theme.js             # 主题配置
│   └── global.less          # 全样式
├── tests                    # 测试工具
├── .umirc.js                # umi 配置
├── .webpackrc               # webpack 配置
├── package.json
└── README.md
```

## 提交规范
```
feat: 新功能（feature）
fix: 修补 bug
docs: 文档（documentation）
style: 格式（不影响代码运行的变动）
refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
test: 增加测试
chore: 构建过程或辅助工具的变动
```
