# 微信小程序图标使用说明

## 当前状态

小程序的tabBar图标已经配置完成，使用与网站一致的SVG图标风格。

### 图标文件位置
```
miniprogram/assets/icons/
├── home.png          # 主页图标（默认状态）
├── home-active.png   # 主页图标（选中状态）
├── kids.png          # 儿童版图标（默认状态）
├── kids-active.png   # 儿童版图标（选中状态）
├── quiz.png          # 题组图标（默认状态）
└── quiz-active.png   # 题组图标（选中状态）
```

### app.json配置
```json
{
  "tabBar": {
    "color": "#64748b",
    "selectedColor": "#4F46E5",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "主页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-active.png"
      }
    ]
  }
}
```

## 图标设计规范

### 颜色
- **默认状态**: `#64748b` (灰色)
- **选中状态**: `#4F46E5` (主题色-靛蓝色)

### 尺寸
- **推荐尺寸**: 81x81 像素
- **文件大小**: < 40KB

### 图标来源
图标设计来自网站的导航系统，保持视觉一致性：
- **主页**: 房屋图标
- **儿童版**: 人物图标
- **题组**: 列表图标

## 如何更新图标

### 方法1: 使用图标生成工具
1. 打开 `scripts/icon-generator.html` 文件
2. 在浏览器中查看图标预览
3. 点击"下载全部图标"按钮
4. 将下载的PNG文件替换到 `miniprogram/assets/icons/` 目录

### 方法2: 手动创建
1. 使用设计软件（Figma、Sketch等）
2. 从网站复制SVG图标代码
3. 导出为PNG格式（81x81像素）
4. 保存到对应目录

### 方法3: 使用在线工具
1. 访问 https://svgtopng.com/
2. 上传SVG文件或粘贴SVG代码
3. 设置输出尺寸为81x81
4. 下载PNG文件

## 网站SVG图标代码

### 主页图标
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
</svg>
```

### 儿童版图标
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="8" r="5"></circle>
  <path d="M20 21a8 8 0 1 0-16 0"></path>
</svg>
```

### 题组图标
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <line x1="8" y1="6" x2="21" y2="6"></line>
  <line x1="8" y1="12" x2="21" y2="12"></line>
  <line x1="8" y1="18" x2="21" y2="18"></line>
  <line x1="3" y1="6" x2="3.01" y2="6"></line>
  <line x1="3" y1="12" x2="3.01" y2="12"></line>
  <line x1="3" y1="18" x2="3.01" y2="18"></line>
</svg>
```

## 验证图标

在微信开发者工具中：
1. 编译小程序
2. 查看底部tabBar
3. 确认图标显示正常
4. 测试选中/未选中状态切换

## 注意事项

1. **文件格式**: 必须使用PNG格式，不支持SVG
2. **文件路径**: 路径相对于小程序根目录
3. **文件命名**: 建议使用 `图标名.png` 和 `图标名-active.png` 的命名规范
4. **颜色一致性**: 确保图标颜色与网站主题色保持一致
