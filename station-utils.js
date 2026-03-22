// 字母频率配置
const LETTER_FREQUENCY = {
    superCommon: ['a', 'e', 'i', 'n', 'o', 's', 'u'],
    common: ['g', 'h', 't', 'l', 'r', 'd', 'c'],
    medium: ['y', 'j', 'x', 'z', 'p', 'm', 'w', 'b'],
    rare: ['q', 'f', 'k', 'v']
};

// 计算站名难度（支持字符串或对象参数）
function calculateStationDifficulty(station) {
    const name = (typeof station === 'string' ? station : station.station_en).toLowerCase();
    let score = 0;
    
    const length = name.replace(/[^a-z]/g, '').length;
    if (length <= 5) score += 1;
    else if (length <= 8) score += 2;
    else if (length <= 12) score += 3;
    else score += 4;
    
    const specialChars = (name.match(/['().]/g) || []).length;
    score += specialChars * 1.5;
    
    const letters = name.replace(/[^a-z]/g, '');
    const uniqueLetters = new Set(letters.split(''));
    
    LETTER_FREQUENCY.rare.forEach(letter => {
        if (uniqueLetters.has(letter)) score += 1.5;
    });
    
    LETTER_FREQUENCY.medium.forEach(letter => {
        if (uniqueLetters.has(letter)) score += 0.5;
    });
    
    const letterCounts = {};
    letters.split('').forEach(l => letterCounts[l] = (letterCounts[l] || 0) + 1);
    const repeatCount = Object.values(letterCounts).filter(c => c > 1).length;
    score -= repeatCount * 0.2;
    
    const commonLetterCount = LETTER_FREQUENCY.common.filter(l => uniqueLetters.has(l)).length;
    score -= commonLetterCount * 0.2;
    
    const superCommonLetterCount = LETTER_FREQUENCY.superCommon.filter(l => uniqueLetters.has(l)).length;
    score -= superCommonLetterCount * 0.3;
    
    const superCommonRatio = superCommonLetterCount / uniqueLetters.size;
    if (superCommonRatio > 0.6) score -= 1;
    
    if (typeof station === 'string') {
        return score;
    }
    
    if (score <= 1.5) return 'easy';
    if (score <= 3) return 'normal';
    return 'hard';
}

// 解密数据
function decryptData(encryptedBase64, key) {
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(decrypted);
}

// 根据环境导出模块
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境
    module.exports = {
        LETTER_FREQUENCY,
        calculateStationDifficulty,
        decryptData
    };
} else {
    // 浏览器环境
    window.StationUtils = {
        LETTER_FREQUENCY,
        calculateStationDifficulty,
        decryptData
    };
}
