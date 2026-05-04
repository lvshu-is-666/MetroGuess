const MetroGameLogic = {
    SCORE_CONFIG: {
        REVEAL_FOUND: -5,
        REVEAL_NOT_FOUND: -15,
        GUESS_CORRECT_BASE: 100,
        GUESS_WRONG: 0,
        HINT_PENALTY: -30,
        COMBO_BONUS_PER_COMBO: 5,
        AUTO_SOLVE_BASE: 50,
        TIME_BONUS_MULTIPLIER: 2
    },

    COMBO_TIME_WINDOW: 5000,

    DIFFICULTY_SETTINGS: {
        easy: { stationCount: 3, hints: 5, timeBonus: 180, multiplier: 1, difficultyLevel: 'easy' },
        normal: { stationCount: 4, hints: 3, timeBonus: 300, multiplier: 1.5, difficultyLevel: 'normal' },
        hard: { stationCount: 6, hints: 2, timeBonus: 480, multiplier: 2, difficultyLevel: 'hard' }
    },

    LETTER_FREQUENCY: {
        superCommon: ['a', 'e', 'i', 'n', 'o', 's', 'u'],
        common: ['g', 'h', 't', 'l', 'r', 'd', 'c'],
        medium: ['y', 'j', 'x', 'z', 'p', 'm', 'w', 'b'],
        rare: ['q', 'f', 'k', 'v']
    },

    createGameState(overrides = {}) {
        return {
            stations: [],
            revealedLetters: {},
            revealedSpecialChars: new Set(),
            solvedStations: new Set(),
            guessCount: 0,
            guessHistory: [],
            gameWon: false,
            score: 0,
            hintsUsed: 0,
            hintsLeft: 3,
            startTime: null,
            elapsedTime: 0,
            usedLetters: new Set(),
            usedSpecialChars: new Set(),
            foundLetters: new Set(),
            foundSpecialChars: new Set(),
            combo: 0,
            lastCorrectTime: 0,
            ...overrides
        };
    },

    initGameState(stations, difficulty = 'normal') {
        const settings = this.DIFFICULTY_SETTINGS[difficulty] || this.DIFFICULTY_SETTINGS.normal;
        const state = this.createGameState({
            stations: stations.map((s, i) => ({
                ...s,
                index: i,
                calculatedDifficulty: s.calculatedDifficulty || this.calculateStationDifficulty(s)
            })),
            hintsLeft: settings.hints,
            startTime: Date.now()
        });

        state.stations.forEach((_, i) => {
            state.revealedLetters[i] = new Set();
        });

        return state;
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

    getDisplayText(stationEn, revealedLetters, isSolved, devMode = false, revealedSpecialChars = new Set()) {
        if (isSolved || devMode) {
            let result = '';
            for (let i = 0; i < stationEn.length; i++) {
                const c = stationEn.charCodeAt(i);
                if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
                    result += '<span class="letter-reveal text-blue-600">' + stationEn[i] + '</span>';
                } else {
                    result += stationEn[i];
                }
            }
            return result;
        }

        let result = '';
        for (let i = 0; i < stationEn.length; i++) {
            const char = stationEn[i];
            const c = char.charCodeAt(0);
            const lower = c | 32;
            if (lower >= 97 && lower <= 122) {
                if (revealedLetters && revealedLetters.has(char.toLowerCase())) {
                    result += '<span class="letter-reveal text-blue-600">' + char + '</span>';
                } else {
                    result += '*';
                }
            } else if (char === ' ') {
                result += ' ';
            } else if (revealedSpecialChars && revealedSpecialChars.has(char)) {
                result += '<span class="letter-reveal text-blue-600">' + char + '</span>';
            } else {
                result += '*';
            }
        }
        return result;
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

    revealLetter(state, letter) {
        const isSpecialChar = !/[a-z]/.test(letter);
        const result = {
            found: false,
            matchCount: 0,
            scoreChange: 0,
            alreadyUsed: false
        };

        if (isSpecialChar) {
            if (state.usedSpecialChars.has(letter)) {
                result.alreadyUsed = true;
                return result;
            }

            state.usedSpecialChars.add(letter);

            state.stations.forEach((station, index) => {
                if (state.solvedStations.has(index)) return;

                const stationEn = station.station_en;
                if (stationEn.includes(letter)) {
                    result.found = true;
                    result.matchCount++;
                }
            });

            if (result.found) {
                state.revealedSpecialChars.add(letter);
                state.foundSpecialChars.add(letter);
                result.scoreChange = this.SCORE_CONFIG.REVEAL_FOUND;
            } else {
                result.scoreChange = this.SCORE_CONFIG.REVEAL_NOT_FOUND;
            }
        } else {
            if (state.usedLetters.has(letter)) {
                result.alreadyUsed = true;
                return result;
            }

            state.usedLetters.add(letter);

            state.stations.forEach((station, index) => {
                if (state.solvedStations.has(index)) return;

                const stationLower = station.station_en.toLowerCase();
                if (stationLower.includes(letter)) {
                    result.found = true;
                    state.revealedLetters[index].add(letter);
                    result.matchCount++;
                }
            });

            if (result.found) {
                state.foundLetters.add(letter);
                result.scoreChange = this.SCORE_CONFIG.REVEAL_FOUND;
            } else {
                result.scoreChange = this.SCORE_CONFIG.REVEAL_NOT_FOUND;
            }
        }

        state.score = Math.max(0, state.score + result.scoreChange);
        state.guessCount++;

        return result;
    },

    guessStation(state, guess) {
        const result = {
            correct: false,
            matchedStation: null,
            matchedIndex: -1,
            scoreChange: 0,
            combo: 0
        };

        for (let index = 0; index < state.stations.length; index++) {
            const station = state.stations[index];
            if (state.solvedStations.has(index)) continue;

            if (this.compareStationNames(guess, station.station_en) ||
                this.compareStationNames(guess, station.station_cn)) {
                result.correct = true;
                result.matchedIndex = index;
                result.matchedStation = station;
                break;
            }
        }

        if (result.correct && result.matchedIndex !== -1) {
            state.solvedStations.add(result.matchedIndex);

            const now = Date.now();
            if (now - state.lastCorrectTime < this.COMBO_TIME_WINDOW) {
                state.combo++;
            } else {
                state.combo = 1;
            }
            state.lastCorrectTime = now;

            result.combo = state.combo;
            result.scoreChange = this.SCORE_CONFIG.GUESS_CORRECT_BASE + state.combo * this.SCORE_CONFIG.COMBO_BONUS_PER_COMBO;
            state.score += result.scoreChange;
        } else {
            state.combo = 0;
        }

        state.guessCount++;

        return result;
    },

    checkAutoSolved(state) {
        const autoSolved = [];

        state.stations.forEach((station, index) => {
            if (state.solvedStations.has(index)) return;

            const stationLower = station.station_en.toLowerCase();
            const allLetters = stationLower.split('').filter(char => /[a-z]/.test(char));
            const revealedSet = state.revealedLetters[index];

            if (allLetters.length > 0 && allLetters.every(char => revealedSet.has(char))) {
                state.solvedStations.add(index);

                const now = Date.now();
                if (now - state.lastCorrectTime < this.COMBO_TIME_WINDOW) {
                    state.combo++;
                } else {
                    state.combo = 1;
                }
                state.lastCorrectTime = now;

                const comboBonus = state.combo * this.SCORE_CONFIG.COMBO_BONUS_PER_COMBO;
                const totalPoints = this.SCORE_CONFIG.AUTO_SOLVE_BASE + comboBonus;
                state.score += totalPoints;

                autoSolved.push({
                    index,
                    station,
                    scoreChange: totalPoints,
                    combo: state.combo
                });
            }
        });

        return autoSolved;
    },

    useHint(state) {
        const result = {
            success: false,
            letter: null,
            stationIndex: -1,
            scoreChange: 0,
            noHintsLeft: false,
            allSolved: false,
            noLettersToReveal: false,
            revealedCount: 0,
            hintType: null
        };

        if (state.hintsLeft <= 0) {
            result.noHintsLeft = true;
            return result;
        }

        const unsolvedIndices = state.stations
            .map((_, index) => index)
            .filter(index => !state.solvedStations.has(index));

        if (unsolvedIndices.length === 0) {
            result.allSolved = true;
            return result;
        }

        const stationScores = unsolvedIndices.map(index => {
            const station = state.stations[index];
            const stationLower = station.station_en.toLowerCase();
            const allLetters = stationLower.split('').filter(char => /[a-z]/.test(char));
            const revealedSet = state.revealedLetters[index] || new Set();
            const unrevealedCount = allLetters.filter(l => !revealedSet.has(l)).length;
            const revealedRatio = allLetters.length > 0 ? revealedSet.size / allLetters.length : 0;
            
            return {
                index,
                station,
                stationLower,
                allLetters,
                unrevealedCount,
                revealedRatio,
                priority: unrevealedCount * 10 - revealedRatio * 5
            };
        });

        stationScores.sort((a, b) => b.priority - a.priority);

        let targetStation = null;
        let targetLetter = null;
        let hintType = null;

        for (const stationInfo of stationScores) {
            const { index, station, stationLower, allLetters, revealedRatio } = stationInfo;
            const revealedSet = state.revealedLetters[index] || new Set();
            
            const unrevealedLetters = allLetters.filter(l => !revealedSet.has(l));
            if (unrevealedLetters.length === 0) continue;

            const firstLetter = stationLower.match(/[a-z]/);
            if (firstLetter && !revealedSet.has(firstLetter[0])) {
                targetStation = stationInfo;
                targetLetter = firstLetter[0];
                hintType = 'first_letter';
                break;
            }

            const rareLetters = unrevealedLetters.filter(l => this.LETTER_FREQUENCY.rare.includes(l));
            if (rareLetters.length > 0) {
                targetStation = stationInfo;
                targetLetter = rareLetters[0];
                hintType = 'rare_letter';
                break;
            }

            const mediumLetters = unrevealedLetters.filter(l => this.LETTER_FREQUENCY.medium.includes(l));
            if (mediumLetters.length > 0) {
                targetStation = stationInfo;
                targetLetter = mediumLetters[0];
                hintType = 'medium_letter';
                break;
            }

            targetStation = stationInfo;
            targetLetter = unrevealedLetters[0];
            hintType = 'common_letter';
            break;
        }

        if (!targetStation || !targetLetter) {
            result.noLettersToReveal = true;
            return result;
        }

        const { index: targetIndex, stationLower: targetStationLower } = targetStation;
        let revealedCount = 0;

        for (let i = 0; i < targetStationLower.length; i++) {
            if (targetStationLower[i] === targetLetter) {
                revealedCount++;
            }
        }

        state.stations.forEach((station, idx) => {
            if (state.solvedStations.has(idx)) return;
            const stationLower = station.station_en.toLowerCase();
            if (stationLower.includes(targetLetter)) {
                state.revealedLetters[idx].add(targetLetter);
            }
        });

        state.usedLetters.add(targetLetter);
        state.foundLetters.add(targetLetter);
        state.hintsLeft--;
        state.hintsUsed++;

        result.success = true;
        result.letter = targetLetter;
        result.stationIndex = targetIndex;
        result.revealedCount = revealedCount;
        result.hintType = hintType;
        result.scoreChange = this.SCORE_CONFIG.HINT_PENALTY;

        state.score = Math.max(0, state.score + result.scoreChange);

        return result;
    },

    checkWinCondition(state, difficulty = 'normal') {
        if (state.solvedStations.size === state.stations.length) {
            state.gameWon = true;

            const settings = this.DIFFICULTY_SETTINGS[difficulty] || this.DIFFICULTY_SETTINGS.normal;
            const timeBonus = Math.max(0, settings.timeBonus - state.elapsedTime) * this.SCORE_CONFIG.TIME_BONUS_MULTIPLIER;
            state.score += timeBonus;
            state.score = Math.floor(state.score * settings.multiplier);

            return {
                won: true,
                timeBonus,
                finalScore: state.score,
                multiplier: settings.multiplier
            };
        }

        return { won: false };
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            easy: 'bg-green-100 text-green-700',
            normal: 'bg-yellow-100 text-yellow-700',
            hard: 'bg-red-100 text-red-700'
        };
        return colors[difficulty] || 'bg-yellow-100 text-yellow-700';
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetroGameLogic;
} else {
    window.MetroGameLogic = MetroGameLogic;
}
