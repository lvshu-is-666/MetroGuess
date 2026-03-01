const fs = require('fs');
const LETTER_FREQUENCY = {
    superCommon: ['a', 'e', 'i', 'n', 'o', 's', 'u'],
    common: ['g', 'h', 't', 'l', 'r', 'd', 'c'],
    medium: ['y', 'j', 'x', 'z', 'p', 'm', 'w', 'b'],
    rare: ['q', 'f', 'k', 'v']
};

function calculateStationDifficulty(name) {
    name = name.toLowerCase();
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
    
    return score;
}

function decryptData(encryptedBase64, key) {
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(decrypted);
}

// 读取加密数据
const encFile = fs.readFileSync('encrypted_data.js', 'utf-8');
const dataMatch = encFile.match(/const ENCRYPTED_DATA = "([^"]+)"/);
const keyMatch = encFile.match(/const DECRYPT_KEY = "([^"]+)"/);

if (dataMatch && keyMatch) {
    const decrypted = decryptData(dataMatch[1], keyMatch[1]);
    const lines = decrypted.split('\n').slice(1).filter(l => l.trim());
    const counts = { easy: 0, normal: 0, hard: 0 };
    const scores = [];
    
    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 4) {
            const station_en = parts[3];
            const score = calculateStationDifficulty(station_en);
            scores.push(score);
            if (score <= 1.5) counts.easy++;
            else if (score <= 3) counts.normal++;
            else counts.hard++;
        }
    });
    
    console.log('Total stations:', lines.length);
    console.log('Distribution:', counts);
    console.log('Score range:', Math.min(...scores).toFixed(2), '-', Math.max(...scores).toFixed(2));
    console.log('Score avg:', (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(2));
} else {
    // 回退到HTML中的csvData
    const html = fs.readFileSync('index.html', 'utf-8');
    const startIdx = html.indexOf('const csvData = `');
    const endIdx = html.indexOf('`', startIdx + 17);
    const csvContent = html.substring(startIdx + 17, endIdx);

    const lines = csvContent.split('\n').slice(1).filter(l => l.trim());
    const counts = { easy: 0, normal: 0, hard: 0 };
    const scores = [];

    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 4) {
            const station_en = parts[3];
            const score = calculateStationDifficulty(station_en);
            scores.push(score);
            if (score <= 1.5) counts.easy++;
            else if (score <= 3) counts.normal++;
            else counts.hard++;
        }
    });

    console.log('Total stations:', lines.length);
    console.log('Distribution:', counts);
    console.log('Score range:', Math.min(...scores).toFixed(2), '-', Math.max(...scores).toFixed(2));
    console.log('Score avg:', (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(2));
}
