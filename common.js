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
        '北京', '上海', '广州', '深圳',
        '澳门', '长春', '长沙', '成都', '重庆', '常州',
        '大连', '东莞',
        '福州',
        '贵阳', '高雄',
        '杭州', '合肥', '呼和浩特', '哈尔滨',
        '金华', '济南',
        '昆明',
        '兰州', '洛阳',
        '南京', '南昌', '南宁', '宁波', '南通',
        '青岛',
        '沈阳', '石家庄', '苏州',
        '台北', '天津', '太原', '台州', '台中',
        '乌鲁木齐',
        '无锡', '温州', '芜湖', '武汉',
        '香港', '厦门', '西安', '徐州',
        '郑州'
    ],
    
    POPULAR_CITIES: ['北京', '上海', '广州', '深圳'],
    
    OTHER_CITIES: [
        '澳门', '长春', '长沙', '成都', '重庆', '常州',
        '大连', '东莞',
        '福州',
        '贵阳', '高雄',
        '杭州', '合肥', '呼和浩特', '哈尔滨',
        '金华', '济南',
        '昆明',
        '兰州', '洛阳',
        '南京', '南昌', '南宁', '宁波', '南通',
        '青岛',
        '沈阳', '石家庄', '苏州',
        '台北', '天津', '太原', '台州', '台中',
        '乌鲁木齐',
        '无锡', '温州', '芜湖', '武汉',
        '香港', '厦门', '西安', '徐州',
        '郑州'
    ],

    // 城市拼音首字母映射（用于音序排序和字母索引）
    CITY_PINYIN_MAP: {
        '北京': 'B', '上海': 'S', '广州': 'G', '深圳': 'S',
        '澳门': 'A', '长春': 'C', '长沙': 'C', '成都': 'C', '重庆': 'C', '常州': 'C',
        '大连': 'D', '东莞': 'D',
        '福州': 'F',
        '贵阳': 'G', '高雄': 'G',
        '杭州': 'H', '合肥': 'H', '呼和浩特': 'H', '哈尔滨': 'H',
        '金华': 'J', '济南': 'J',
        '昆明': 'K',
        '兰州': 'L', '洛阳': 'L',
        '南京': 'N', '南昌': 'N', '南宁': 'N', '宁波': 'N', '南通': 'N',
        '青岛': 'Q',
        '沈阳': 'S', '石家庄': 'S', '苏州': 'S',
        '台北': 'T', '天津': 'T', '太原': 'T', '台州': 'T', '台中': 'T',
        '乌鲁木齐': 'W',
        '无锡': 'W', '温州': 'W', '芜湖': 'W', '武汉': 'W',
        '香港': 'X', '厦门': 'X', '西安': 'X', '徐州': 'X',
        '郑州': 'Z'
    },

    // 获取按拼音首字母分组的城市
    getCitiesGroupedByPinyin() {
        const groups = {};
        const allCities = [...this.CITIES];
        
        // 按拼音首字母分组
        allCities.forEach(city => {
            const letter = this.CITY_PINYIN_MAP[city] || '#';
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(city);
        });
        
        // 按字母顺序返回
        return Object.keys(groups)
            .sort()
            .map(letter => ({
                letter,
                cities: groups[letter]
            }));
    },
    
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
        container.className = 'fixed right-4 z-[99999] space-y-2';
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
            } else if (char === ' ') {
                return ' ';
            } else if (revealedSpecialChars && revealedSpecialChars.has(char)) {
                return `<span class="letter-reveal text-blue-600">${char}</span>`;
            } else {
                return '<span class="text-slate-400">*</span>';
            }
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
    },
    
    initModernCitySelector(containerId, options = {}) {
        const container = this.$(containerId);
        if (!container) return;

        const {
            selectedValue = 'all',
            showAllOption = true,
            allText = '全部城市',
            onChange = null,
            beforeChange = null,
            placeholder = '搜索城市...',
            size = 'default'
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = `city-selector-wrapper size-${size}`;
        wrapper.id = `${containerId}-wrapper`;

        const trigger = document.createElement('div');
        trigger.className = 'city-selector-trigger';
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = `
            <span class="selected-city">${selectedValue === 'all' ? allText : selectedValue}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;

        wrapper.appendChild(trigger);

        container.innerHTML = '';
        container.appendChild(wrapper);

        let dropdown = this.$('city-selector-dropdown-portal');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'city-selector-dropdown-portal';
            dropdown.className = 'city-selector-dropdown';
            dropdown.setAttribute('role', 'listbox');
            document.body.appendChild(dropdown);
        }

        dropdown.innerHTML = `
            <div class="city-selector-search">
                <input type="text" placeholder="${placeholder}" autocomplete="off">
                <button class="search-clear-btn" type="button" aria-label="清除搜索">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="city-selector-content">
                <div class="city-selector-list"></div>
                <div class="city-selector-alphabet">
                    <div class="alphabet-nav"></div>
                </div>
            </div>
            <div class="city-selector-footer">共 ${this.CITIES.length} 个城市</div>
        `;

        const list = dropdown.querySelector('.city-selector-list');
        const alphabetNav = dropdown.querySelector('.alphabet-nav');
        const searchInput = dropdown.querySelector('input');
        const clearBtn = dropdown.querySelector('.search-clear-btn');
        let highlightedIndex = -1;
        let currentCity = selectedValue;
        let isOpen = false;
        
        // 搜索清除按钮功能
        const updateClearBtn = () => {
            if (searchInput.value.length > 0) {
                clearBtn.classList.add('visible');
            } else {
                clearBtn.classList.remove('visible');
            }
        };
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            renderCities('');
            updateClearBtn();
        });
        
        searchInput.addEventListener('input', () => {
            updateClearBtn();
        });

        // 获取按拼音分组的城市
        const groupedCities = this.getCitiesGroupedByPinyin();
        const allLetters = groupedCities.map(g => g.letter);

        // 渲染字母导航
        const renderAlphabetNav = () => {
            alphabetNav.innerHTML = '';
            allLetters.forEach(letter => {
                const letterEl = document.createElement('div');
                letterEl.className = 'alphabet-letter';
                letterEl.textContent = letter;
                letterEl.setAttribute('data-letter', letter);
                letterEl.addEventListener('click', () => {
                    // 更新active状态
                    alphabetNav.querySelectorAll('.alphabet-letter').forEach(el => {
                        el.classList.remove('active');
                    });
                    letterEl.classList.add('active');
                    
                    const section = list.querySelector(`[data-section="${letter}"]`);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    
                    // 300ms后移除active状态
                    setTimeout(() => {
                        letterEl.classList.remove('active');
                    }, 300);
                });
                alphabetNav.appendChild(letterEl);
            });
        };
        
        // 监听滚动更新当前字母
        const updateActiveLetterOnScroll = () => {
            const groups = list.querySelectorAll('.city-selector-group[data-section]');
            let currentLetter = '';
            
            groups.forEach(group => {
                const rect = group.getBoundingClientRect();
                const listRect = list.getBoundingClientRect();
                if (rect.top <= listRect.top + 20) {
                    currentLetter = group.getAttribute('data-section');
                }
            });
            
            if (currentLetter && currentLetter !== '热门') {
                alphabetNav.querySelectorAll('.alphabet-letter').forEach(el => {
                    el.classList.toggle('active', el.getAttribute('data-letter') === currentLetter);
                });
            }
        };
        
        list.addEventListener('scroll', updateActiveLetterOnScroll, { passive: true });

        // 渲染城市列表（网格布局 + 字母分组）
        const renderCities = (filter = '') => {
            list.innerHTML = '';
            highlightedIndex = -1;

            const filterLower = filter.toLowerCase();

            // 搜索模式
            if (filter) {
                // 搜索时隐藏字母导航
                alphabetNav.style.display = 'none';
                dropdown.classList.add('search-mode');

                if (showAllOption) {
                    const allOption = document.createElement('div');
                    allOption.className = `city-selector-all${currentCity === 'all' ? ' selected' : ''}`;
                    allOption.setAttribute('role', 'option');
                    allOption.setAttribute('data-value', 'all');
                    allOption.textContent = allText;
                    list.appendChild(allOption);
                }

                // 搜索所有城市
                const filteredCities = this.CITIES.filter(city =>
                    city.toLowerCase().includes(filterLower)
                );

                if (filteredCities.length > 0) {
                    const searchGroup = document.createElement('div');
                    searchGroup.className = 'city-selector-group';
                    searchGroup.innerHTML = `<div class="city-selector-group-label">搜索结果</div>`;

                    const grid = document.createElement('div');
                    grid.className = 'city-selector-grid';

                    filteredCities.forEach(city => {
                        const option = document.createElement('div');
                        option.className = `city-selector-option${currentCity === city ? ' selected' : ''}`;
                        option.setAttribute('role', 'option');
                        option.setAttribute('data-value', city);
                        option.textContent = city;
                        grid.appendChild(option);
                    });

                    searchGroup.appendChild(grid);
                    list.appendChild(searchGroup);
                } else {
                    list.innerHTML = `<div class="city-selector-empty">未找到匹配的城市</div>`;
                }
                return;
            }

            // 非搜索模式 - 显示字母导航和分组
            alphabetNav.style.display = 'flex';
            dropdown.classList.remove('search-mode');

            if (showAllOption) {
                const allOption = document.createElement('div');
                allOption.className = `city-selector-all${currentCity === 'all' ? ' selected' : ''}`;
                allOption.setAttribute('role', 'option');
                allOption.setAttribute('data-value', 'all');
                allOption.textContent = allText;
                list.appendChild(allOption);
            }

            // 常用城市
            const filteredPopular = this.POPULAR_CITIES.filter(city =>
                city.toLowerCase().includes(filterLower)
            );

            if (filteredPopular.length > 0) {
                const popularGroup = document.createElement('div');
                popularGroup.className = 'city-selector-group';
                popularGroup.setAttribute('data-section', '热门');
                popularGroup.innerHTML = `<div class="city-selector-group-label popular">⭐ 常用城市</div>`;

                const grid = document.createElement('div');
                grid.className = 'city-selector-grid';

                filteredPopular.forEach(city => {
                    const option = document.createElement('div');
                    option.className = `city-selector-option${currentCity === city ? ' selected' : ''}`;
                    option.setAttribute('role', 'option');
                    option.setAttribute('data-value', city);
                    option.textContent = city;
                    grid.appendChild(option);
                });

                popularGroup.appendChild(grid);
                list.appendChild(popularGroup);
            }

            // 按字母分组的城市
            groupedCities.forEach(group => {
                const groupEl = document.createElement('div');
                groupEl.className = 'city-selector-group';
                groupEl.setAttribute('data-section', group.letter);
                groupEl.innerHTML = `<div class="city-selector-group-label"><span class="letter-badge">${group.letter}</span></div>`;

                const grid = document.createElement('div');
                grid.className = 'city-selector-grid';

                group.cities.forEach(city => {
                    const option = document.createElement('div');
                    option.className = `city-selector-option${currentCity === city ? ' selected' : ''}`;
                    option.setAttribute('role', 'option');
                    option.setAttribute('data-value', city);
                    option.textContent = city;
                    grid.appendChild(option);
                });

                groupEl.appendChild(grid);
                list.appendChild(groupEl);
            });
        };

        const selectCity = (value) => {
            if (beforeChange) {
                beforeChange(value);
            }
            currentCity = value;
            const selectedCityEl = trigger.querySelector('.selected-city');
            selectedCityEl.textContent = value === 'all' ? allText : value;

            list.querySelectorAll('.city-selector-option, .city-selector-all').forEach(opt => {
                opt.classList.toggle('selected', opt.getAttribute('data-value') === value);
            });

            closeDropdown();

            if (onChange) {
                onChange(value);
            }

            const originalSelect = this.$(containerId.replace('-modern-wrapper', ''));
            if (originalSelect && originalSelect.tagName === 'SELECT') {
                originalSelect.value = value;
                originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        const updatePosition = () => {
            const rect = trigger.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.minWidth = `${Math.max(320, rect.width)}px`;
        };

        const openDropdown = () => {
            if (isOpen) return;
            isOpen = true;
            trigger.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
            updatePosition();
            dropdown.classList.add('open');
            searchInput.focus();
            renderCities();
        };

        const closeDropdown = () => {
            if (!isOpen) return;
            isOpen = false;
            trigger.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('open');
            searchInput.value = '';
            // 重置为正常显示模式
            renderCities();
        };

        const toggleDropdown = () => {
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        trigger.addEventListener('click', toggleDropdown);

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        searchInput.addEventListener('input', (e) => {
            renderCities(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            const options = list.querySelectorAll('.city-selector-option, .city-selector-all');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (highlightedIndex < options.length - 1) {
                    highlightedIndex++;
                    updateHighlight(options);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (highlightedIndex > 0) {
                    highlightedIndex--;
                    updateHighlight(options);
                }
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                e.preventDefault();
                const selected = options[highlightedIndex];
                if (selected) {
                    selectCity(selected.getAttribute('data-value'));
                }
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        const updateHighlight = (options) => {
            options.forEach((opt, i) => {
                opt.classList.toggle('highlighted', i === highlightedIndex);
            });

            if (highlightedIndex >= 0 && options[highlightedIndex]) {
                options[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        };

        list.addEventListener('click', (e) => {
            const option = e.target.closest('.city-selector-option, .city-selector-all');
            if (option) {
                selectCity(option.getAttribute('data-value'));
            }
        });

        const handleClickOutside = (e) => {
            if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('click', handleClickOutside);

        const handleScroll = () => {
            if (isOpen) {
                updatePosition();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        renderAlphabetNav();
        renderCities();

        return {
            getValue: () => currentCity,
            setValue: (value) => selectCity(value),
            open: openDropdown,
            close: closeDropdown
        };
    },
    
    initModernQuizSelector(containerId, options = {}) {
        const container = this.$(containerId);
        if (!container) return;

        const {
            selectedValue = 'all',
            showAllOption = true,
            allText = '随机选题',
            onChange = null,
            beforeChange = null,
            placeholder = '搜索题组...',
            size = 'default',
            quizzes = []
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = `quiz-selector-wrapper size-${size}`;
        wrapper.id = `${containerId}-wrapper`;

        const trigger = document.createElement('div');
        trigger.className = 'quiz-selector-trigger';
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = `
            <span class="selected-quiz">${selectedValue === 'all' ? allText : selectedValue}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;

        wrapper.appendChild(trigger);

        container.innerHTML = '';
        container.appendChild(wrapper);

        let dropdown = this.$('quiz-selector-dropdown-portal');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'quiz-selector-dropdown-portal';
            dropdown.className = 'quiz-selector-dropdown';
            dropdown.setAttribute('role', 'listbox');
            document.body.appendChild(dropdown);
        }

        dropdown.innerHTML = `
            <div class="quiz-selector-search">
                <input type="text" placeholder="${placeholder}" autocomplete="off">
                <button class="search-clear-btn" type="button" aria-label="清除搜索">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="quiz-selector-content">
                <div class="quiz-selector-list"></div>
            </div>
            <div class="quiz-selector-footer">共 ${quizzes.length} 个题组</div>
        `;

        const list = dropdown.querySelector('.quiz-selector-list');
        const searchInput = dropdown.querySelector('input');
        const clearBtn = dropdown.querySelector('.search-clear-btn');
        let highlightedIndex = -1;
        let currentQuiz = selectedValue;
        let isOpen = false;
        let allQuizzes = quizzes;

        const updateClearBtn = () => {
            if (searchInput.value.length > 0) {
                clearBtn.classList.add('visible');
            } else {
                clearBtn.classList.remove('visible');
            }
        };

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            renderQuizzes('');
            updateClearBtn();
        });

        searchInput.addEventListener('input', () => {
            updateClearBtn();
        });

        const renderQuizzes = (filter = '') => {
            list.innerHTML = '';
            highlightedIndex = -1;

            const filterLower = filter.toLowerCase();

            if (showAllOption) {
                const allOption = document.createElement('div');
                allOption.className = `quiz-selector-all${currentQuiz === 'all' ? ' selected' : ''}`;
                allOption.setAttribute('role', 'option');
                allOption.setAttribute('data-value', 'all');
                allOption.innerHTML = `
                    <div class="quiz-selector-all-content">
                        <span class="quiz-selector-all-icon">🎲</span>
                        <span class="quiz-selector-all-text">${allText}</span>
                    </div>
                `;
                list.appendChild(allOption);
            }

            const featuredQuizzes = allQuizzes.filter(q => 
                q.featured && (
                    filter === '' || 
                    (q.name && q.name.toLowerCase().includes(filterLower))
                )
            );

            if (featuredQuizzes.length > 0) {
                const featuredGroup = document.createElement('div');
                featuredGroup.className = 'quiz-selector-group';
                featuredGroup.setAttribute('data-section', 'featured');
                featuredGroup.innerHTML = `<div class="quiz-selector-group-label featured">⭐ 精选题组</div>`;

                featuredQuizzes.forEach(quiz => {
                    const option = createQuizOption(quiz);
                    featuredGroup.appendChild(option);
                });

                list.appendChild(featuredGroup);
            }

            const otherQuizzes = allQuizzes
                .filter(q => !q.featured)
                .filter(q => filter === '' || (q.name && q.name.toLowerCase().includes(filterLower)))
                .sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

            if (otherQuizzes.length > 0) {
                const popularGroup = document.createElement('div');
                popularGroup.className = 'quiz-selector-group';
                popularGroup.setAttribute('data-section', 'popular');
                popularGroup.innerHTML = `<div class="quiz-selector-group-label popular">🔥 热门题组</div>`;

                otherQuizzes.forEach(quiz => {
                    const option = createQuizOption(quiz);
                    popularGroup.appendChild(option);
                });

                list.appendChild(popularGroup);
            }

            if (featuredQuizzes.length === 0 && otherQuizzes.length === 0 && filter) {
                list.innerHTML = `<div class="quiz-selector-empty">未找到匹配的题组</div>`;
            }

            const footer = dropdown.querySelector('.quiz-selector-footer');
            const totalCount = featuredQuizzes.length + otherQuizzes.length;
            footer.textContent = `共 ${totalCount} 个题组`;
        };

        const createQuizOption = (quiz) => {
            const option = document.createElement('div');
            option.className = `quiz-selector-option${currentQuiz === quiz.id ? ' selected' : ''}`;
            option.setAttribute('role', 'option');
            option.setAttribute('data-value', quiz.id);

            const difficultyClass = this.getDifficultyColor(quiz.difficultyLevel);
            const difficultyLabel = this.getDifficultyLabel(quiz.difficultyLevel);
            const displayName = quiz.hideTheme ? '神秘题组' : quiz.name;

            option.innerHTML = `
                <div class="quiz-option-content">
                    <div class="quiz-option-header">
                        <span class="quiz-option-name">${this.escapeHtml(displayName)}</span>
                        ${quiz.featured ? '<span class="quiz-option-badge featured">精选</span>' : ''}
                    </div>
                    <div class="quiz-option-meta">
                        <span class="quiz-option-tag ${difficultyClass}">${difficultyLabel}</span>
                        <span class="quiz-option-tag count">${quiz.questions ? quiz.questions.length : 0}题</span>
                        ${quiz.cityScope && quiz.cityScope !== 'all' ? `<span class="quiz-option-tag city">${quiz.cityScope}</span>` : ''}
                    </div>
                </div>
            `;

            return option;
        };

        const selectQuiz = (value) => {
            if (beforeChange) {
                beforeChange(value);
            }
            currentQuiz = value;
            const selectedQuizEl = trigger.querySelector('.selected-quiz');
            
            if (value === 'all') {
                selectedQuizEl.textContent = allText;
            } else {
                const quiz = allQuizzes.find(q => q.id === value);
                if (quiz) {
                    selectedQuizEl.textContent = quiz.hideTheme ? '神秘题组' : quiz.name;
                } else {
                    selectedQuizEl.textContent = allText;
                }
            }

            list.querySelectorAll('.quiz-selector-option, .quiz-selector-all').forEach(opt => {
                opt.classList.toggle('selected', opt.getAttribute('data-value') === value);
            });

            closeDropdown();

            if (onChange) {
                onChange(value);
            }

            const originalSelect = this.$(containerId.replace('-modern-wrapper', ''));
            if (originalSelect && originalSelect.tagName === 'SELECT') {
                originalSelect.value = value;
                originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        const updatePosition = () => {
            const rect = trigger.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.minWidth = `${Math.max(280, rect.width)}px`;
        };

        const openDropdown = () => {
            if (isOpen) return;
            isOpen = true;
            trigger.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
            updatePosition();
            dropdown.classList.add('open');
            searchInput.focus();
            renderQuizzes();
        };

        const closeDropdown = () => {
            if (!isOpen) return;
            isOpen = false;
            trigger.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('open');
            searchInput.value = '';
            renderQuizzes();
        };

        const toggleDropdown = () => {
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        trigger.addEventListener('click', toggleDropdown);

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        searchInput.addEventListener('input', (e) => {
            renderQuizzes(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            const options = list.querySelectorAll('.quiz-selector-option, .quiz-selector-all');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (highlightedIndex < options.length - 1) {
                    highlightedIndex++;
                    updateHighlight(options);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (highlightedIndex > 0) {
                    highlightedIndex--;
                    updateHighlight(options);
                }
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                e.preventDefault();
                const selected = options[highlightedIndex];
                if (selected) {
                    selectQuiz(selected.getAttribute('data-value'));
                }
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        const updateHighlight = (options) => {
            options.forEach((opt, i) => {
                opt.classList.toggle('highlighted', i === highlightedIndex);
            });

            if (highlightedIndex >= 0 && options[highlightedIndex]) {
                options[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        };

        list.addEventListener('click', (e) => {
            const option = e.target.closest('.quiz-selector-option, .quiz-selector-all');
            if (option) {
                selectQuiz(option.getAttribute('data-value'));
            }
        });

        const handleClickOutside = (e) => {
            if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('click', handleClickOutside);

        const handleScroll = () => {
            if (isOpen) {
                updatePosition();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        renderQuizzes();

        return {
            getValue: () => currentQuiz,
            setValue: (value) => selectQuiz(value),
            open: openDropdown,
            close: closeDropdown,
            updateQuizzes: (newQuizzes) => {
                allQuizzes = newQuizzes;
                renderQuizzes();
            }
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetroCommon;
} else {
    window.MetroCommon = MetroCommon;
}
