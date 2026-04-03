const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'miniprogram', 'assets', 'icons');

const icons = {
  home: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>`,
    color: '#64748b',
    activeColor: '#4F46E5'
  },
  kids: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="5"></circle>
      <path d="M20 21a8 8 0 1 0-16 0"></path>
    </svg>`,
    color: '#64748b',
    activeColor: '#4F46E5'
  },
  quiz: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>`,
    color: '#64748b',
    activeColor: '#4F46E5'
  }
};

function createSvgWithColor(svgContent, color) {
  return svgContent.replace('stroke="currentColor"', `stroke="${color}"`);
}

function svgToDataUrl(svgContent) {
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

function createPngDataUrl(svgContent, color, size = 81) {
  const coloredSvg = createSvgWithColor(svgContent, color);
  return svgToDataUrl(coloredSvg);
}

console.log('=== 微信小程序图标生成 ===\n');
console.log('图标将保存到:', iconsDir);
console.log('\n图标列表:');

Object.keys(icons).forEach(name => {
  const icon = icons[name];
  console.log(`\n${name}:`);
  console.log(`  - 默认颜色: ${icon.color}`);
  console.log(`  - 激活颜色: ${icon.activeColor}`);
  
  const normalSvg = createSvgWithColor(icon.svg, icon.color);
  const activeSvg = createSvgWithColor(icon.svg, icon.activeColor);
  
  fs.writeFileSync(path.join(iconsDir, `${name}.svg`), normalSvg);
  fs.writeFileSync(path.join(iconsDir, `${name}-active.svg`), activeSvg);
  
  console.log(`  - 已生成: ${name}.svg, ${name}-active.svg`);
});

console.log('\n=== SVG文件已生成 ===');
console.log('\n注意: 微信小程序tabBar需要PNG格式图标');
console.log('请使用以下方法之一将SVG转换为PNG:');
console.log('1. 使用在线工具: https://svgtopng.com/');
console.log('2. 使用设计软件: Figma, Sketch, Adobe XD');
console.log('3. 使用ImageMagick命令行工具');
console.log('\n推荐PNG尺寸: 81x81 像素');
