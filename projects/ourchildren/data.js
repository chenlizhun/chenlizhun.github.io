const DataStore = (() => {
    const STORAGE_KEY = 'kids_management_data';
    const COLLECTION_NAME = 'kids_data';
    const DOC_ID = 'global_kids_data'; // 固定ID，确保所有用户操作同一份数据

    let app = null;
    let auth = null;
    let db = null;
    let _data = null;
    let _onDataChange = null;

    // 默认空数据结构
    const defaultData = {
        kids: {
            '猪姐姐': { points: 0, history: [] },
            '牛弟弟': { points: 0, history: [] }
        }
    };

    function ensureData(d) {
        if (!d || typeof d !== 'object') d = JSON.parse(JSON.stringify(defaultData));
        if (!d.kids) d.kids = {};
        if (!d.kids['猪姐姐']) d.kids['猪姐姐'] = { points: 0, history: [] };
        if (!d.kids['牛弟弟']) d.kids['牛弟弟'] = { points: 0, history: [] };
        return d;
    }

    // 本地读写辅助
    function loadLocal() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            _data = ensureData(raw ? JSON.parse(raw) : null);
        } catch (e) {
            _data = ensureData(null);
        }
    }

    function saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    }

    // 初始化云开发
    async function init({ env, onDataChange }) {
        _onDataChange = onDataChange;
        
        // 先加载本地数据作为兜底，保证UI有内容显示
        loadLocal();

        try {
            if (!window.cloudbase) {
                console.error('CloudBase SDK not loaded');
                return;
            }

            console.log('Initializing CloudBase with env:', env);
            app = cloudbase.init({ env });
            auth = app.auth();
            
            // 匿名登录
            await auth.signInAnonymously();
            console.log('Anonymous login successful');
            
            db = app.database();
            
            // 1. 开启实时监听 (这样如果另一半操作了，这边会自动更新)
            setupWatcher();

            // 2. 主动拉取一次最新数据 (确保是新的)
            await fetchFromCloud();

        } catch (e) {
            console.error('CloudBase init failed:', e);
            // 初始化失败，仅使用本地数据继续运行
        }
    }

    function setupWatcher() {
        if (!db) return;
        
        // 监听特定ID的文档
        db.collection(COLLECTION_NAME).doc(DOC_ID).watch({
            onChange: (snapshot) => {
                if (snapshot.docs && snapshot.docs.length > 0) {
                    console.log('Cloud data changed, updating local...');
                    const cloudData = snapshot.docs[0];
                    // 剔除 _id, _openid 等系统字段
                    delete cloudData._id;
                    delete cloudData._openid;
                    
                    _data = ensureData(cloudData);
                    saveLocal();
                    if (_onDataChange) _onDataChange(_data);
                }
            },
            onError: (err) => {
                console.error('Watch error:', err);
            }
        });
    }

    async function fetchFromCloud() {
        if (!db) return;
        try {
            const res = await db.collection(COLLECTION_NAME).doc(DOC_ID).get();
            if (res.data && res.data.length > 0) {
                // 有数据
                const cloudData = res.data[0];
                delete cloudData._id;
                delete cloudData._openid;
                _data = ensureData(cloudData);
                saveLocal();
                if (_onDataChange) _onDataChange(_data);
            } else {
                // 文档不存在，说明是第一次使用，将本地数据上传作为初始数据
                console.log('Cloud doc not found, creating from local data...');
                if (!_data) loadLocal();
                try {
                    // 使用 set 确保 ID 一致，即使 add 也行但 set 更幂等
                    await db.collection(COLLECTION_NAME).doc(DOC_ID).set({
                        ..._data
                    });
                    console.log('Cloud doc created.');
                } catch (createErr) {
                    console.error('Failed to create initial doc:', createErr);
                }
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
    }

    async function syncToCloud() {
        if (!db) return;
        try {
            // 全量更新 (简单粗暴但有效，适合小数据量)
            // 使用 set 覆盖
            await db.collection(COLLECTION_NAME).doc(DOC_ID).set({
                ..._data
            });
        } catch (e) {
            console.error('Sync failed:', e);
            alert('数据同步到云端失败，请检查网络。数据已保存在本地。');
        }
    }

    return {
        init,
        getData() { 
            if (!_data) loadLocal(); 
            return _data; 
        },
        async updatePoints(kid, delta, reason, operator) {
            // 1. 乐观更新本地 (UI 立即响应)
            if (!_data) loadLocal();
            _data.kids[kid] = _data.kids[kid] || { points: 0, history: [] };
            _data.kids[kid].points += delta;
            _data.kids[kid].history.push({ timestamp: Date.now(), delta, reason, operator });
            saveLocal();
            
            // 2. 调用云函数进行安全更新
            try {
                if (!app) {
                    console.error('CloudBase not initialized');
                    return;
                }
                
                // 注意：这里我们需要传入密码哈希。
                // 鉴于我们前端验证逻辑是写死的，这里直接传哈希值。
                
                const res = await app.callFunction({
                    name: 'updateKidsPoints',
                    data: {
                        kid,
                        delta,
                        reason,
                        operator,
                        password: '6c0f3412848008d49d186d5fad7fd1482656cfb62ad3c060a14e41c3fb3f1b43' // 传输密码哈希给云端校验
                    }
                });
                
                if (!res.result || !res.result.success) {
                    console.error('Cloud function update failed:', res);
                    // 如果失败，理论上应该回滚本地数据，这里简化处理，依赖 Watcher 修正
                    alert('云端同步失败：' + (res.result && res.result.message || '未知错误'));
                } else {
                    console.log('Cloud update success');
                }
            } catch (e) {
                console.error('Call cloud function failed:', e);
                // 可能是网络问题，或者是云函数没部署
                // 如果云函数不存在，尝试降级到旧的直接写库（但在安全模式下会失败）
                alert('云端同步出错，请检查网络或联系管理员。');
            }
        },
        async setData(newData) {
            _data = ensureData(newData);
            saveLocal();
            // 乐观更新
            if (_onDataChange) _onDataChange(_data);
            await syncToCloud();
        },
        export() { return JSON.stringify(this.getData()); },
        import(jsonStr) { 
            const nd = JSON.parse(jsonStr); 
            this.setData(nd); 
        }
    };
})();
