// Migration Script for Browser Console
// Copy and paste this into the browser console on index.html (after cloudbase is loaded)

async function runMigration() {
    if (typeof LOCAL_DATA === 'undefined' || typeof cloudbase === 'undefined') {
        console.error('Environment not ready. Run this on index.html');
        return;
    }

    const ENV_ID = 'lowcode-2g5508qg69c24010'; 
    const app = cloudbase.init({ env: ENV_ID });
    const auth = app.auth();
    if (!auth.hasLoginState()) await auth.signInAnonymously();
    const db = app.database();

    console.log('Start Migration...');

    // 1. Config
    try {
        await db.collection('food_config').doc('global_config').set({
            appTitle: '世友的肉肉仓库',
            appSubtitle: '冻肉类产品展示 · 业务演示',
            categories: LOCAL_DATA.categories.map((c, i) => ({ name: c, order: i + 1 }))
        });
        console.log('Config set.');
    } catch(e) {
        console.error('Config failed', e);
    }

    // 2. Products
    let count = 0;
    for (const p of LOCAL_DATA.products) {
        try {
            // Check if exists
            const check = await db.collection('food_products').doc(p.id).get();
            if (!check.data) {
                // Not exist, create
                await db.collection('food_products').add({
                    ...p,
                    // Use original ID as a field, let cloudbase generate _id?
                    // Or force _id? Web SDK add() doesn't support custom _id easily inside data object sometimes.
                    // But doc(id).set() does.
                }); 
                // Wait... if we use add(), we get random ID. 
                // If we want to maintain ID stability, we should use doc(p.id).set()
                // BUT doc().set() overwrites. That's fine for migration.
                
                // Let's retry with doc().set()
                await db.collection('food_products').doc(p.id).set({
                    ...p,
                    createTime: Date.now()
                });
                count++;
                console.log(`Migrated: ${p.name}`);
            } else {
                console.log(`Skipped: ${p.name} (exists)`);
            }
        } catch(e) {
            console.error(`Error ${p.name}`, e);
        }
    }
    console.log(`Done. Added ${count} products.`);
}
