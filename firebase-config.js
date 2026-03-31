const FirebaseConfig = {
    config: {
        apiKey: "AIzaSyDPs3vZRgXUCEYJ6qWJc69YYKVfRfj8PuM",
        authDomain: "metroguess-lvshu.firebaseapp.com",
        databaseURL: "https://metroguess-lvshu-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "metroguess-lvshu",
        storageBucket: "metroguess-lvshu.firebasestorage.app",
        messagingSenderId: "331461414999",
        appId: "1:331461414999:web:50beeb73a94ca4ba971312",
        measurementId: "G-YWSMLL0YNC"
    },
    
    db: null,
    initialized: false,
    
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, '0')).join('');
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return { hash: hashHex, salt: salt };
    },
    
    async verifyPassword(password, storedHash, salt) {
        const { hash } = await this.hashPassword(password, salt);
        return hash === storedHash;
    },
    
    async init() {
        if (this.initialized) return true;
        
        if (typeof firebase !== 'undefined' && firebase.apps.length) {
            this.db = firebase.database();
            this.initialized = true;
            return true;
        }
        
        try {
            await this.loadFirebaseScripts();
            
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
                firebase.initializeApp(this.config);
                this.db = firebase.database();
                this.initialized = true;
                console.log('Firebase initialized successfully');
                return true;
            }
        } catch (e) {
            console.error('Firebase initialization failed:', e);
            return false;
        }
        
        return false;
    },
    
    loadFirebaseScripts() {
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };
        
        return Promise.all([
            loadScript('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js'),
            loadScript('https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js')
        ]);
    },
    
    async createQuiz(quizData) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        const quizId = MetroCommon.generateUniqueId();
        const now = Date.now();
        
        let hashedPassword = null;
        let passwordSalt = null;
        if (quizData.managerPassword) {
            const hashResult = await this.hashPassword(quizData.managerPassword);
            hashedPassword = hashResult.hash;
            passwordSalt = hashResult.salt;
        }
        
        const quiz = {
            id: quizId,
            ...quizData,
            managerPassword: hashedPassword,
            passwordSalt: passwordSalt,
            createdAt: now,
            updatedAt: now,
            playCount: 0,
            likeCount: 0
        };
        
        await this.db.ref('quizzes/' + quizId).set(quiz);
        return quiz;
    },
    
    async getQuiz(quizId) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        const snapshot = await this.db.ref('quizzes/' + quizId).once('value');
        if (!snapshot.exists()) return null;
        
        return snapshot.val();
    },
    
    async updateQuiz(quizId, updates) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        if (updates.managerPassword) {
            const hashResult = await this.hashPassword(updates.managerPassword);
            updates.managerPassword = hashResult.hash;
            updates.passwordSalt = hashResult.salt;
        }
        
        updates.updatedAt = Date.now();
        await this.db.ref('quizzes/' + quizId).update(updates);
        return true;
    },
    
    async deleteQuiz(quizId) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        await this.db.ref('quizzes/' + quizId).remove();
        await this.db.ref('quizLeaderboards/' + quizId).remove();
        return true;
    },
    
    async getQuizList(filters = {}) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        let query = this.db.ref('quizzes').orderByChild('isPublic').equalTo(true);
        
        const snapshot = await query.once('value');
        if (!snapshot.exists()) return [];
        
        let quizzes = Object.values(snapshot.val());
        
        if (filters.city && filters.city !== 'all') {
            quizzes = quizzes.filter(q => q.cityScope === filters.city || q.cityScope === 'all');
        }
        
        if (filters.difficulty && filters.difficulty !== 'all') {
            quizzes = quizzes.filter(q => q.difficultyLevel === filters.difficulty);
        }
        
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'popular':
                    quizzes.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
                    break;
                case 'newest':
                    quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    break;
                case 'difficulty':
                    const order = { easy: 1, normal: 2, hard: 3 };
                    quizzes.sort((a, b) => (order[a.difficultyLevel] || 2) - (order[b.difficultyLevel] || 2));
                    break;
                default:
                    quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }
        } else {
            quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        
        if (filters.limit) {
            quizzes = quizzes.slice(0, filters.limit);
        }
        
        return quizzes;
    },
    
    async incrementPlayCount(quizId) {
        if (!this.initialized) {
            await this.init();
        }
        
        const ref = this.db.ref('quizzes/' + quizId + '/playCount');
        await ref.transaction(count => (count || 0) + 1);
    },
    
    async saveQuizScore(quizId, scoreData) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        const scoreId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const score = {
            id: scoreId,
            ...scoreData,
            createdAt: Date.now()
        };
        
        await this.db.ref('quizLeaderboards/' + quizId + '/' + scoreId).set(score);
        return score;
    },
    
    async getQuizLeaderboard(quizId, limit = 10) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) return [];
        }
        
        const snapshot = await this.db.ref('quizLeaderboards/' + quizId)
            .orderByChild('score')
            .limitToLast(limit)
            .once('value');
        
        if (!snapshot.exists()) return [];
        
        const scores = Object.values(snapshot.val());
        scores.sort((a, b) => b.score - a.score);
        return scores;
    },
    
    listenToQuizLeaderboard(quizId, callback) {
        if (!this.initialized) {
            this.init().then(() => {
                this._setupLeaderboardListener(quizId, callback);
            });
        } else {
            this._setupLeaderboardListener(quizId, callback);
        }
    },
    
    _setupLeaderboardListener(quizId, callback) {
        this.db.ref('quizLeaderboards/' + quizId)
            .orderByChild('score')
            .limitToLast(20)
            .on('value', (snapshot) => {
                if (!snapshot.exists()) {
                    callback([]);
                    return;
                }
                const scores = Object.values(snapshot.val());
                scores.sort((a, b) => b.score - a.score);
                callback(scores);
            });
    },
    
    unlistenToQuizLeaderboard(quizId) {
        if (this.initialized && this.db) {
            this.db.ref('quizLeaderboards/' + quizId).off();
        }
    },
    
    validateQuizAccess(quiz, inviteCode = null) {
        if (!quiz) {
            return { valid: false, error: '题组不存在' };
        }
        
        if (!quiz.isPublic) {
            return { valid: false, error: '该题组为私有题组' };
        }
        
        if (quiz.inviteCode) {
            if (!inviteCode) {
                return { valid: false, error: '需要邀请码', needInviteCode: true };
            }
            if (inviteCode.toUpperCase() !== quiz.inviteCode.toUpperCase()) {
                return { valid: false, error: '邀请码错误' };
            }
        }
        
        return { valid: true };
    },
    
    async validateManagerAccess(quiz, username, password) {
        if (!quiz) {
            return { valid: false, error: '题组不存在' };
        }
        
        if (!quiz.managerUsername || !quiz.managerPassword) {
            return { valid: false, error: '该题组未设置管理凭证' };
        }
        
        if (username !== quiz.managerUsername) {
            return { valid: false, error: '用户名或密码错误' };
        }
        
        const isHashedPassword = quiz.managerPassword.length === 64 && quiz.passwordSalt;
        
        if (isHashedPassword) {
            const isValid = await this.verifyPassword(password, quiz.managerPassword, quiz.passwordSalt);
            if (!isValid) {
                return { valid: false, error: '用户名或密码错误' };
            }
        } else {
            if (password !== quiz.managerPassword) {
                return { valid: false, error: '用户名或密码错误' };
            }
        }
        
        return { valid: true };
    },
    
    async getAllQuizzes() {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        const snapshot = await this.db.ref('quizzes').once('value');
        if (!snapshot.exists()) return [];
        
        const quizzes = Object.values(snapshot.val());
        quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return quizzes;
    },
    
    async setFeatured(quizId, featured) {
        if (!this.initialized) {
            const success = await this.init();
            if (!success) throw new Error('Firebase初始化失败');
        }
        
        await this.db.ref('quizzes/' + quizId + '/featured').set(featured);
        return true;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseConfig;
} else {
    window.FirebaseConfig = FirebaseConfig;
}
