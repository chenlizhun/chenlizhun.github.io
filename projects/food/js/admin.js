// Admin Logic
// Using the same EnvID as Edutogather for simplicity, or change if needed.
// Note: CloudBase init requires env ID.

const ENV_ID = 'chenlizhun-projects-2ckab9e1cd47'; 

let app, auth, db;
let products = [];
let categories = [];
let config = null;

// Use cloud function for secure operations?
// Yes, for GitHub Pages security, we MUST use cloud function for writes.
// Direct DB write from frontend is dangerous if exposed.
const USE_CLOUD_FUNCTION = true;
const CLOUD_FUNCTION_NAME = 'food_admin';

const COLLECTION_PRODUCTS = 'food_products';
const COLLECTION_CONFIG = 'food_config';
const CONFIG_ID = 'global_config';

// Helper to call cloud function or db directly
async function safeDbOp(action, collection, payload = {}, id = null) {
    const pin = localStorage.getItem('food_admin_pin');
    
    if (USE_CLOUD_FUNCTION) {
        // Call Cloud Function
        const res = await app.callFunction({
            name: CLOUD_FUNCTION_NAME,
            data: {
                action,
                collection,
                data: payload,
                id,
                pin
            }
        });
        
        if (res.result && res.result.success) {
            return res.result;
        } else {
            throw new Error(res.result ? res.result.error : 'Unknown cloud error');
        }
    } else {
        // Direct DB fallback (unsafe)
        if (action === 'add') return db.collection(collection).add(payload);
        if (action === 'update') return db.collection(collection).doc(id).update(payload);
        if (action === 'remove') return db.collection(collection).doc(id).remove();
        if (action === 'get') return db.collection(collection).limit(1000).get();
    }
}

// Initialize
window.onload = async () => {
    checkLogin();
};

function checkLogin() {
    const pin = localStorage.getItem('food_admin_pin');
    // Simple frontend gate. 
    // In a real app, we'd use cloud functions to verify pin or proper auth.
    // For this static upgrade, we rely on the user knowing the PIN.
    // We'll use a hardcoded PIN '888888' for demo or let user set it?
    // Let's use the same PIN logic as edutogather: just check if entered.
    
    if (pin) {
        initApp();
    } else {
        document.getElementById('login-overlay').classList.remove('hidden');
    }
}

document.getElementById('login-btn').onclick = () => {
    const input = document.getElementById('pin-input').value;
    // Hardcoded PIN for this simple version. 
    // You can change this to whatever you want.
    if (input === '888888') {
        localStorage.setItem('food_admin_pin', input);
        document.getElementById('login-overlay').classList.add('hidden');
        initApp();
    } else {
        alert('密码错误');
    }
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('food_admin_pin');
    location.reload();
};

async function initApp() {
    try {
        app = cloudbase.init({ env: ENV_ID });
        auth = app.auth();
        db = app.database();
        
        const loginState = await auth.getLoginState();
        if (!loginState) {
            await auth.signInAnonymously();
        }

        document.getElementById('admin-app').classList.remove('hidden');
        loadAllData();

    } catch (e) {
        console.error('Init Error:', e);
        let msg = e.message || JSON.stringify(e);
        if (msg === '{}') msg = '未知错误 (请查看控制台详细日志)';
        alert('云开发初始化失败：' + msg + '\n\n请检查：\n1. 腾讯云后台是否开启“匿名登录”\n2. 安全域名是否包含 localhost:8080');
    }
}

async function loadAllData() {
    // 1. Permission Check (Warn user if DB is private)
    try {
        await db.collection(COLLECTION_PRODUCTS).limit(1).get();
    } catch (e) {
        console.warn('Direct read failed, likely permission issue', e);
        alert('【重要提示】\n检测到数据库权限未开放！\n\n虽然后台（通过密码）可以管理数据，但前端页面（游客）将无法看到更新。\n\n请务必在腾讯云控制台 -> 数据库 -> 权限设置中，\n将 food_products 和 food_config 集合设置为“所有用户可读”。');
    }

    await Promise.all([loadConfig(), loadProducts()]);
    renderProductTable();
    renderCategoryList();
    renderSettings();
}

// --- Data Loading ---

async function loadConfig() {
    try {
        // Use safeDbOp (Cloud Function) to ensure we can read config even if DB is private
        const res = await safeDbOp('get', COLLECTION_CONFIG);
        // Cloud function 'get' returns array
        const configs = res.data || [];
        const found = configs.find(c => c._id === CONFIG_ID);

        if (found) {
            config = found;
        } else {
            // Initialize default config if not exists
            config = {
                appTitle: '世友的肉肉仓库',
                appSubtitle: '冻肉类产品展示 · 业务演示',
                categories: [
                    { name: '牛肉', order: 1 },
                    { name: '猪肉', order: 2 },
                    { name: '鸡肉', order: 3 },
                    { name: '羊肉', order: 4 },
                    { name: '预制菜', order: 5 }
                ]
            };
            // Try to create it via safeOp
            await safeDbOp('add', COLLECTION_CONFIG, { _id: CONFIG_ID, ...config })
                .catch(e => console.log('Config likely exists or create failed', e));
        }
        categories = config.categories || [];
        updateCategorySelects();
    } catch (e) {
        console.error('Load config failed', e);
        // Fallback to default config if load fails, so UI is not empty
        if (!config) {
             config = {
                appTitle: '世友的肉肉仓库',
                appSubtitle: '冻肉类产品展示 · 业务演示',
                categories: [
                    { name: '牛肉', order: 1 },
                    { name: '猪肉', order: 2 },
                    { name: '鸡肉', order: 3 },
                    { name: '羊肉', order: 4 },
                    { name: '预制菜', order: 5 }
                ]
            };
            categories = config.categories;
            updateCategorySelects();
        }
    }
}

async function loadProducts() {
    try {
        // Use safeDbOp (Cloud Function) to ensure we can read products even if DB is private
        const res = await safeDbOp('get', COLLECTION_PRODUCTS);
        products = res.data || [];
    } catch (e) {
        console.error('Load products failed', e);
        alert('读取产品数据失败：' + e.message);
    }
}

// --- Rendering ---

function updateCategorySelects() {
    const filter = document.getElementById('filter-category');
    const modal = document.getElementById('p-category');
    
    // Save current selection
    const currentFilter = filter.value;
    
    // Reset options
    filter.innerHTML = '<option value="">所有分类</option>';
    modal.innerHTML = '';
    
    categories.sort((a,b) => (a.order || 0) - (b.order || 0)).forEach(cat => {
        const opt1 = document.createElement('option');
        opt1.value = cat.name;
        opt1.textContent = cat.name;
        filter.appendChild(opt1);
        
        const opt2 = document.createElement('option');
        opt2.value = cat.name;
        opt2.textContent = cat.name;
        modal.appendChild(opt2);
    });
    
    filter.value = currentFilter;
}

function renderProductTable() {
    const tbody = document.getElementById('product-tbody');
    const filterCat = document.getElementById('filter-category').value;
    const search = document.getElementById('search-product').value.toLowerCase();
    
    tbody.innerHTML = '';
    
    const filtered = products.filter(p => {
        const hitCat = filterCat ? p.category === filterCat : true;
        const hitSearch = search ? p.name.toLowerCase().includes(search) : true;
        return hitCat && hitSearch;
    });
    
    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.thumb || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;background:#eee;"></td>
            <td><div style="font-weight:500">${p.name}</div><div style="font-size:12px;color:#888">${p.id || ''}</div></td>
            <td>${p.category}</td>
            <td>${p.packaging}</td>
            <td>${p.stockStatus}</td>
            <td>
                <button class="action-btn edit" onclick="openProductModal('${p._id}')">编辑</button>
                <button class="action-btn delete" onclick="deleteProduct('${p._id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCategoryList() {
    const container = document.getElementById('category-list');
    container.innerHTML = '';
    
    categories.sort((a,b) => (a.order || 0) - (b.order || 0)).forEach((cat, idx) => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        // Simple drag logic placeholder, actually we use buttons for order now for simplicity
        div.innerHTML = `
            <div style="display:flex;align-items:center;flex:1">
                <span style="color:#999;margin-right:10px;font-family:monospace">#${idx+1}</span>
                <input type="text" value="${cat.name}" class="form-input cat-name-input" data-idx="${idx}" style="width:200px">
            </div>
            <div>
                <button class="btn small" onclick="moveCategory(${idx}, -1)" ${idx===0?'disabled':''}>↑</button>
                <button class="btn small" onclick="moveCategory(${idx}, 1)" ${idx===categories.length-1?'disabled':''}>↓</button>
                <button class="btn small" style="color:red;margin-left:10px" onclick="removeCategory(${idx})">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderSettings() {
    if (config) {
        document.getElementById('setting-title').value = config.appTitle || '';
        document.getElementById('setting-subtitle').value = config.appSubtitle || '';
    }
}

// --- Product Actions ---

document.getElementById('filter-category').onchange = renderProductTable;
document.getElementById('search-product').oninput = renderProductTable;

window.openProductModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    form.reset();
    document.getElementById('p-id').value = '';
    // 使用透明像素作为默认图，避免破碎图标
    document.getElementById('p-thumb-preview').src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    // 重置上传按钮文字
    const labelBtn = document.getElementById('p-thumb-file').parentElement;
    labelBtn.childNodes[0].textContent = '选择图片';
    
    if (id) {
        // Edit
        const p = products.find(x => x._id === id);
        if (p) {
            document.getElementById('modal-title').textContent = '编辑产品';
            document.getElementById('p-id').value = p._id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-category').value = p.category;
            document.getElementById('p-cut').value = p.cut || '';
            document.getElementById('p-origin').value = p.origin || '';
            document.getElementById('p-grade').value = p.grade || '';
            document.getElementById('p-packaging').value = p.packaging || '';
            document.getElementById('p-stock').value = p.stockStatus || '现货';
            document.getElementById('p-price-w').value = p.priceWholesale || '';
            document.getElementById('p-price-r').value = p.priceRetail || '';
            document.getElementById('p-desc').value = p.description || '';
            document.getElementById('p-tags').value = (p.tags || []).join(', ');
            document.getElementById('p-thumb-path').value = p.thumb || '';
            
            if (p.thumb) {
                document.getElementById('p-thumb-preview').src = p.thumb;
                labelBtn.childNodes[0].textContent = '更换图片';
            }
        }
    } else {
        // New
        document.getElementById('modal-title').textContent = '新增产品';
        // Default category
        if (categories.length) document.getElementById('p-category').value = categories[0].name;
    }
    
    modal.classList.remove('hidden');
};

window.closeProductModal = () => {
    document.getElementById('product-modal').classList.add('hidden');
};

window.saveProduct = async () => {
    const id = document.getElementById('p-id').value;
    const data = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        cut: document.getElementById('p-cut').value,
        origin: document.getElementById('p-origin').value,
        grade: document.getElementById('p-grade').value,
        packaging: document.getElementById('p-packaging').value,
        stockStatus: document.getElementById('p-stock').value,
        priceWholesale: document.getElementById('p-price-w').value,
        priceRetail: document.getElementById('p-price-r').value,
        description: document.getElementById('p-desc').value,
        tags: document.getElementById('p-tags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        thumb: document.getElementById('p-thumb-path').value,
        updateTime: Date.now()
    };

    try {
        if (id) {
            await safeDbOp('update', COLLECTION_PRODUCTS, data, id);
            // Update local
            const idx = products.findIndex(p => p._id === id);
            if (idx >= 0) products[idx] = { ...products[idx], ...data };
        } else {
            data.createTime = Date.now();
            const res = await safeDbOp('add', COLLECTION_PRODUCTS, data);
            data._id = res.id; // Cloud function returns { success: true, id: ... }
            products.unshift(data);
        }
        
        closeProductModal();
        renderProductTable();
        alert('保存成功');
    } catch (e) {
        console.error(e);
        alert('保存失败：' + e.message);
    }
};

window.deleteProduct = async (id) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    try {
        await safeDbOp('remove', COLLECTION_PRODUCTS, {}, id);
        products = products.filter(p => p._id !== id);
        renderProductTable();
    } catch (e) {
        console.error(e);
        alert('删除失败：' + e.message);
    }
};

window.uploadImage = async (type) => {
    const fileInput = document.getElementById('p-thumb-file');
    const previewEl = document.getElementById('p-thumb-preview');
    const pathInput = document.getElementById('p-thumb-path');
    const labelBtn = fileInput.parentElement;
    
    const file = fileInput.files[0];
    if (!file) return;

    // 1. 本地立即预览
    const reader = new FileReader();
    reader.onload = (e) => {
        previewEl.src = e.target.result;
        previewEl.style.opacity = '0.5'; // 上传中半透明
    };
    reader.readAsDataURL(file);
    
    // 2. 更新UI状态
    const originalText = labelBtn.childNodes[0].textContent; // "选择图片" text node
    labelBtn.childNodes[0].textContent = '上传中...';
    labelBtn.style.pointerEvents = 'none'; // 禁用点击
    
    const ext = file.name.split('.').pop();
    const cloudPath = `food/images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    
    try {
        const res = await app.uploadFile({
            cloudPath: cloudPath,
            filePath: file
        });
        
        // Convert cloud:// ID to HTTP URL for storage
        const urlRes = await app.getTempFileURL({ fileList: [res.fileID] });
        const httpUrl = urlRes.fileList[0].tempFileURL;

        pathInput.value = httpUrl;
        previewEl.src = httpUrl;
        previewEl.style.opacity = '1'; // 恢复不透明
        
        // 成功反馈
        labelBtn.childNodes[0].textContent = '上传成功!';
        setTimeout(() => {
            labelBtn.childNodes[0].textContent = '更换图片';
            labelBtn.style.pointerEvents = 'auto';
        }, 2000);
        
    } catch (e) {
        console.error(e);
        alert('图片上传失败: ' + e.message);
        previewEl.style.opacity = '1';
        labelBtn.childNodes[0].textContent = '重试上传';
        labelBtn.style.pointerEvents = 'auto';
    }
};

// --- Category Actions ---

window.addCategory = () => {
    const name = prompt('请输入新分类名称');
    if (name) {
        categories.push({ name, order: categories.length + 1 });
        renderCategoryList();
    }
};

window.removeCategory = (idx) => {
    if (confirm('确定删除此分类？')) {
        categories.splice(idx, 1);
        renderCategoryList();
    }
};

window.moveCategory = (idx, dir) => {
    const target = idx + dir;
    if (target >= 0 && target < categories.length) {
        const temp = categories[idx];
        categories[idx] = categories[target];
        categories[target] = temp;
        renderCategoryList();
    }
};

window.saveCategories = async () => {
    // Update names from inputs
    const inputs = document.querySelectorAll('.cat-name-input');
    inputs.forEach(input => {
        const idx = parseInt(input.dataset.idx);
        if (categories[idx]) categories[idx].name = input.value;
    });
    
    // Update orders
    categories.forEach((c, i) => c.order = i + 1);
    
    try {
        await safeDbOp('update', COLLECTION_CONFIG, { categories: categories }, CONFIG_ID);
        config.categories = categories;
        updateCategorySelects();
        alert('分类配置已保存');
    } catch (e) {
        console.error(e);
        alert('保存失败：' + e.message);
    }
};

// --- Settings Actions ---

window.saveSettings = async () => {
    const title = document.getElementById('setting-title').value;
    const subtitle = document.getElementById('setting-subtitle').value;
    
    try {
        await safeDbOp('update', COLLECTION_CONFIG, {
            appTitle: title,
            appSubtitle: subtitle
        }, CONFIG_ID);
        config.appTitle = title;
        config.appSubtitle = subtitle;
        alert('全站设置已保存');
    } catch (e) {
        console.error(e);
        alert('保存失败：' + e.message);
    }
};

// Tabs
window.switchTab = (tabName) => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[onclick="switchTab(\'' + tabName + '\')"]').forEach(b => b.classList.add('active'));
    
    document.getElementById('tab-products').classList.add('hidden');
    document.getElementById('tab-categories').classList.add('hidden');
    document.getElementById('tab-settings').classList.add('hidden');
    
    document.getElementById('tab-' + tabName).classList.remove('hidden');
};

// --- Migration ---

window.initDB = async () => {
    if (!confirm('确定要初始化数据库集合吗？')) return;
    
    const btn = document.querySelector('button[onclick="initDB()"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '初始化中...';

    try {
        const res = await app.callFunction({
            name: CLOUD_FUNCTION_NAME,
            data: {
                action: 'setup',
                pin: localStorage.getItem('food_admin_pin')
            }
        });
        
        if (res.result && res.result.success) {
            alert('初始化结果：\n' + res.result.results.join('\n'));
        } else {
            alert('初始化失败：' + (res.result ? res.result.error : '未知错误'));
        }
    } catch (e) {
        console.error(e);
        alert('调用云函数失败：' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
};

window.importLocalData = async () => {
    if (typeof LOCAL_DATA === 'undefined') {
        alert('未找到本地数据文件 (js/data.js)');
        return;
    }
    
    if (!confirm('确定要导入本地数据吗？\n这将尝试创建产品和分类配置。\n已存在的 ID 将被跳过。')) return;
    
    const btn = document.querySelector('button[onclick="importLocalData()"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '导入中...';
    
    try {
        let addedCount = 0;
        let skippedCount = 0;
        
        // 1. Import Config (Categories)
        // Convert string array to object array
        const catObjects = LOCAL_DATA.categories.map((name, i) => ({
            name: name,
            order: i + 1
        }));
        
        // Update config
        await safeDbOp('update', COLLECTION_CONFIG, { categories: catObjects }, CONFIG_ID);
        config.categories = catObjects;
        categories = catObjects;
        updateCategorySelects();
        console.log('Categories imported');
        
        // 2. Import Products
        for (const p of LOCAL_DATA.products) {
            // Use local id as _id to prevent duplicates
            const productData = {
                ...p,
                _id: p.id, // Explicitly set _id
                createTime: Date.now(),
                updateTime: Date.now()
            };
            
            try {
                // Try to add. If using cloud function, it might fail if ID exists (if we used .add)
                // But cloud function .add usually generates ID if not provided. 
                // Wait, if we provide _id in data, does cloudbase accept it?
                // Yes, standard mongo/cloudbase behavior.
                
                // However, our cloud function 'add' implementation:
                // res = await db.collection(collection).add({ data: { ...data } })
                // It passes data as is. So if data has _id, it should work.
                
                await safeDbOp('add', COLLECTION_PRODUCTS, productData);
                addedCount++;
            } catch (e) {
                // Assume failure means duplicate or error
                console.warn('Skipped product:', p.id, e.message);
                skippedCount++;
            }
        }
        
        // Refresh
        await loadProducts();
        renderProductTable();
        
        alert(`导入完成！\n新增产品: ${addedCount}\n跳过/失败: ${skippedCount}\n分类配置已更新。`);
        
    } catch (e) {
        console.error(e);
        alert('导入过程中出错: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
};
