const fs = require('fs');
const { LETTER_FREQUENCY, calculateStationDifficulty, decryptData } = require('./station-utils.js');

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
