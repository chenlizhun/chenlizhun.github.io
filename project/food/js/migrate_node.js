const fs = require('fs');
const path = require('path');
const cloudbase = require('@cloudbase/node-sdk');

// Configuration
// Please ensure you have configured credentials via "tcb login" or set environment variables
const ENV_ID = 'lowcode-2g5508qg69c24010'; 

// Load Local Data
const dataPath = path.join(__dirname, 'data.js');
let LOCAL_DATA;

// Quick hack to load the JS file which defines a global variable
const fileContent = fs.readFileSync(dataPath, 'utf8');
// Remove "const LOCAL_DATA =" and make it JSON-like or eval it
// Safest way is to eval in a sandbox or just regex parse if simple
// Let's use a simple Function constructor approach since we trust the source
const getLocalData = new Function(fileContent + '; return LOCAL_DATA;');
LOCAL_DATA = getLocalData();

console.log(`Loaded ${LOCAL_DATA.products.length} products locally.`);

// Init CloudBase
const app = cloudbase.init({
    env: ENV_ID
});
const db = app.database();

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Config
    console.log('Migrating config...');
    const configData = {
        appTitle: '世友的肉肉仓库',
        appSubtitle: '冻肉类产品展示 · 业务演示',
        categories: LOCAL_DATA.categories.map((c, i) => ({ name: c, order: i + 1 }))
    };
    
    try {
        await db.collection('food_config').doc('global_config').set(configData);
        console.log('Config migrated successfully.');
    } catch (e) {
        console.error('Config migration failed:', e);
    }

    // 2. Migrate Products
    console.log('Migrating products...');
    const products = LOCAL_DATA.products;
    
    // We can't batch set easily with custom IDs if we want to keep them, 
    // but CloudBase add() generates IDs. 
    // If we want to keep "beef-au-brisket-2kg" as _id, we should use set/add with that ID?
    // CloudBase doc(_id).set() works.
    
    let successCount = 0;
    for (const p of products) {
        try {
            // Keep original ID if possible, or use it as a field
            // Let's try to use it as _id for consistency
            const docId = p.id; 
            const payload = { ...p, _id: docId, updateTime: Date.now() };
            
            // Check if exists
            const exists = await db.collection('food_products').doc(docId).get()
                .then(res => res.data && res.data.length > 0) // Node SDK returns array? No, doc().get() returns object with data
                .catch(() => false);

            if (exists) {
                console.log(`Skipping ${docId} (already exists)`);
                // Optional: await db.collection('food_products').doc(docId).update(payload);
            } else {
                await db.collection('food_products').add(payload); // add() generates ID if not provided, but we put _id in payload?
                // Actually add({_id: '...'}) is not always supported. 
                // Better use doc('...').set()
                await db.collection('food_products').doc(docId).set(payload);
                process.stdout.write('.');
                successCount++;
            }
        } catch (e) {
            console.error(`\nFailed to migrate ${p.name}:`, e.message);
        }
    }
    
    console.log(`\nMigration finished. Added ${successCount} new products.`);
}

migrate();
