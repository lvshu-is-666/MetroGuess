const MetroCommon = {
    $: id => document.getElementById(id),
    $all: sel => document.querySelectorAll(sel),
    
    createEl: (tag, className, innerHTML) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    },
    
    CITIES: [
        '北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉', 
        '西安', '重庆', '天津', '苏州', '郑州', '长沙', '沈阳', '青岛',
        '大连', '宁波', '厦门', '无锡', '福州', '合肥', '昆明', '哈尔滨',
        '济南', '佛山', '长春', '石家庄', '南宁', '贵阳', '兰州', '太原'
    ],
    
    initTheme() {
        this.initDarkMode();
        const btnTheme = this.$('btn-theme');
        if (btnTheme) {
            btnTheme.addEventListener('click', () => {
                this.toggleDarkMode();
                this.updateThemeIcon();
            });
        }
    },
    
    updateThemeIcon() {
        const isDark = this.isDarkMode();
        const moonIcon = this.$('theme-moon-icon');
        const sunIcon = this.$('theme-sun-icon');
        if (moonIcon) moonIcon.classList.toggle('hidden', isDark);
        if (sunIcon) sunIcon.classList.toggle('hidden', !isDark);
    },
    
    initCitySelect(selectId, selectedValue = 'all') {
        const select = this.$(selectId);
        if (!select) return;
        this.CITIES.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            if (city === selectedValue) option.selected = true;
            select.appendChild(option);
        });
    },
    
    formatTimeAgo(timestamp) {
        if (!timestamp) return '未知';
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    LETTER_FREQUENCY: {
        superCommon: ['a', 'e', 'i', 'n', 'o', 's', 'u'],
        common: ['g', 'h', 't', 'l', 'r', 'd', 'c'],
        medium: ['y', 'j', 'x', 'z', 'p', 'm', 'w', 'b'],
        rare: ['q', 'f', 'k', 'v']
    },
    
    DIFFICULTY_SETTINGS: {
        easy: { stationCount: 3, hints: 5, timeBonus: 180, multiplier: 1, difficultyLevel: 'easy' },
        normal: { stationCount: 4, hints: 3, timeBonus: 300, multiplier: 1.5, difficultyLevel: 'normal' },
        hard: { stationCount: 6, hints: 2, timeBonus: 480, multiplier: 2, difficultyLevel: 'hard' }
    },
    
    calculateStationDifficulty(station) {
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
        
        this.LETTER_FREQUENCY.rare.forEach(letter => {
            if (uniqueLetters.has(letter)) score += 1.5;
        });
        
        this.LETTER_FREQUENCY.medium.forEach(letter => {
            if (uniqueLetters.has(letter)) score += 0.5;
        });
        
        const letterCounts = {};
        letters.split('').forEach(l => letterCounts[l] = (letterCounts[l] || 0) + 1);
        const repeatCount = Object.values(letterCounts).filter(c => c > 1).length;
        score -= repeatCount * 0.2;
        
        const commonLetterCount = this.LETTER_FREQUENCY.common.filter(l => uniqueLetters.has(l)).length;
        score -= commonLetterCount * 0.2;
        
        const superCommonLetterCount = this.LETTER_FREQUENCY.superCommon.filter(l => uniqueLetters.has(l)).length;
        score -= superCommonLetterCount * 0.3;
        
        const superCommonRatio = superCommonLetterCount / uniqueLetters.size;
        if (superCommonRatio > 0.6) score -= 1;
        
        if (typeof station === 'string') {
            return score;
        }
        
        if (score <= 1.5) return 'easy';
        if (score <= 3) return 'normal';
        return 'hard';
    },
    
    getDifficultyLabel(difficulty) {
        const labels = {
            easy: '简单',
            normal: '普通',
            hard: '困难'
        };
        return labels[difficulty] || '普通';
    },
    
    getDifficultyColor(difficulty) {
        const colors = {
            easy: 'quiz-tag-difficulty-easy',
            normal: 'quiz-tag-difficulty-normal',
            hard: 'quiz-tag-difficulty-hard'
        };
        return colors[difficulty] || 'quiz-tag-difficulty-normal';
    },
    
    generateUniqueId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },
    
    generatePlayerId() {
        return 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    showToast(message, type = 'info', duration = 2000) {
        const container = this.$('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast px-4 py-2 rounded-lg shadow-lg text-sm font-medium cursor-pointer ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-slate-700 text-white'
        }`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 250);
        }, duration);
    },
    
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed right-4 z-[1000] space-y-2';
        container.style.top = '72px';
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
        return container;
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatNumber(num) {
        return num.toLocaleString('zh-CN');
    },
    
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(() => {
                this.showToast('已复制到剪贴板', 'success');
                return true;
            }).catch(() => {
                this.fallbackCopy(text);
                return true;
            });
        } else {
            this.fallbackCopy(text);
            return Promise.resolve(true);
        }
    },
    
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            this.showToast('已复制到剪贴板', 'success');
        } catch (e) {
            this.showToast('复制失败，请手动复制', 'error');
        }
        document.body.removeChild(textarea);
    },
    
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    },
    
    loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },
    
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    },
    
    isDarkMode() {
        return document.documentElement.classList.contains('dark') || 
               (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    },
    
    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        this.saveToLocalStorage('darkMode', isDark);
        return isDark;
    },
    
    initDarkMode() {
        const savedMode = this.loadFromLocalStorage('darkMode');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedMode === true || (savedMode === null && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    },
    
    getDisplayText(stationEn, revealedLetters, isSolved, revealedSpecialChars = new Set()) {
        if (isSolved) {
            return stationEn.split('').map(char => {
                const lowerChar = char.toLowerCase();
                if (/[a-z]/.test(lowerChar)) {
                    return `<span class="letter-reveal text-green-600">${char}</span>`;
                }
                return char;
            }).join('');
        }
        
        return stationEn.split('').map(char => {
            const lowerChar = char.toLowerCase();
            if (/[a-z]/.test(lowerChar)) {
                if (revealedLetters && revealedLetters.has(lowerChar)) {
                    return `<span class="letter-reveal text-blue-600">${char}</span>`;
                }
                return '<span class="text-slate-400">*</span>';
            } else if ([' ', "'", '(', ')', '.', '-', '/'].includes(char)) {
                if (revealedSpecialChars && revealedSpecialChars.has(char)) {
                    return char;
                }
                return char;
            }
            return char;
        }).join('');
    },
    
    normalizeStationName(name) {
        return name.toLowerCase()
            .replace(/['']/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    },
    
    compareStationNames(input, target) {
        const normalizedInput = this.normalizeStationName(input);
        const normalizedTarget = this.normalizeStationName(target);
        return normalizedInput === normalizedTarget;
    },
    
    parseCSV(data) {
        const lines = data.trim().split('\n');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (const char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            
            if (values.length >= 4) {
                result.push({
                    city_cn: values[0],
                    city_en: values[1],
                    station_cn: values[2],
                    station_en: values[3]
                });
            }
        }
        return result;
    },
    
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    setUrlParam(param, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url.toString());
    },
    
    removeUrlParam(param) {
        const url = new URL(window.location.href);
        url.searchParams.delete(param);
        window.history.replaceState({}, '', url.toString());
    },
    
    getBaseUrl() {
        return window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
    },
    
    updateRoute(mode, param = null) {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', mode);
        if (param) {
            url.searchParams.set('id', param);
        } else {
            url.searchParams.delete('id');
        }
        window.history.replaceState({}, '', url.toString());
    },
    
    calculateQuizDifficulty(questions) {
        if (!questions || questions.length === 0) return { score: 0, level: 'normal' };
        
        let totalScore = 0;
        questions.forEach(q => {
            const station = { station_en: q.station_en };
            const diff = this.calculateStationDifficulty(station);
            if (diff === 'easy') totalScore += 1;
            else if (diff === 'normal') totalScore += 2;
            else totalScore += 3;
        });
        
        const avgScore = totalScore / questions.length;
        
        let level;
        if (avgScore <= 1.3) level = 'easy';
        else if (avgScore <= 2.3) level = 'normal';
        else level = 'hard';
        
        return { score: avgScore.toFixed(1), level };
    },
    
    generateShareText(quiz) {
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
        const quizUrl = `${baseUrl}/quiz/play.html?id=${quiz.id}`;
        
        let text = `【地铁站名猜谜 - 自定义题组】\n`;
        text += `题组名称：${quiz.hideTheme ? '神秘题组' : quiz.name}\n`;
        text += `题目数量：${quiz.questions.length}题\n`;
        text += `综合难度：${this.getDifficultyLabel(quiz.difficultyLevel)}\n`;
        
        if (quiz.inviteCode) {
            text += `邀请码：${quiz.inviteCode}\n`;
        }
        
        text += `\n点击链接开始挑战：\n${quizUrl}`;
        
        return text;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetroCommon;
} else {
    window.MetroCommon = MetroCommon;
}
