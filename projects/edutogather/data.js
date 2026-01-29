const DataStore = (() => {
    const STORAGE_KEY = 'kids_management_session';
    
    let app = null;
    let auth = null;
    let _currentUser = null;
    let _currentFamily = null;
    let _kids = [];
    let _onDataChange = null;
    let _loading = true;
    let _pollingInterval = null;

    // Initialize CloudBase
    async function init({ env, onDataChange }) {
        _onDataChange = onDataChange;
        _loading = true;
        
        try {
            if (!window.cloudbase) {
                console.error('CloudBase SDK not loaded');
                return;
            }

            console.log('Initializing CloudBase with env:', env);
            app = cloudbase.init({ env });
            auth = app.auth();

            // Check for shared session from EdutogatherHome/AuthSDK
            const sharedSessionJson = localStorage.getItem(STORAGE_KEY);
            if (sharedSessionJson) {
                try {
                    const session = JSON.parse(sharedSessionJson);
                    // If we have a valid family and user in session, load it optimistically
                    if (session.family && session.user) {
                        console.log('Found shared session, loading optimistically:', session);
                        _currentUser = session.user;
                        _currentFamily = session.family;
                        _kids = session.kids || [];
                        
                        if (_onDataChange) {
                             _onDataChange({
                                type: 'session_restored',
                                user: _currentUser,
                                family: _currentFamily,
                                kids: _kids
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse shared session', e);
                }
            }
            
            // Anonymous login or silent login
            const loginState = await auth.getLoginState();
            if (!loginState) {
                await auth.signInAnonymously();
            }
            console.log('CloudBase login successful');
            
            // Check if we have a saved session or try to fetch user info
            await checkLoginStatus();

        } catch (e) {
            console.error('CloudBase init failed:', e);
        } finally {
            _loading = false;
            // Ensure we notify the app that loading is done even if it failed
             if (_onDataChange) _onDataChange({ type: 'init_finished' });
        }
    }

    async function checkLoginStatus() {
        _loading = true;
        if (_onDataChange) _onDataChange({ type: 'loading_start' });
        
        try {
            const res = await callApi('login');
            if (res.success) {
                // Pass openId to the callback
                const openId = res.data.openId;
                
                if (res.data.status === 'active') {
                    // Validation: Check if families list is present
                    if (!Array.isArray(res.data.families)) {
                         console.warn('Backend "login" response missing "families" array. Possible backend version mismatch.');
                         // Alert user once?
                    }

                    // Pass the list of families to the callback
                    // App.js will decide whether to show list or auto-select
                    _onDataChange({
                        type: 'login_success',
                        families: res.data.families || [],
                        openId: openId
                    });
                } else {
                    _onDataChange({
                        type: 'unregistered',
                        families: [],
                        openId: openId
                    });
                }
            }
        } catch (e) {
            console.error('Check login status failed', e);
        } finally {
            _loading = false;
            if (_onDataChange) _onDataChange({ type: 'loading_end' });
        }
    }

    async function callApi(action, payload = {}) {
        if (!app) throw new Error('App not initialized');
        try {
            const res = await app.callFunction({
                name: 'ourchildren_kidApi',
                data: { action, payload }
            });
            if (!res.result) throw new Error('No result from cloud function');
            
            // Check for outdated backend
            if (res.result.success === false && res.result.message === 'Unknown action') {
                console.error('Backend version mismatch: Action not supported', action);
                const msg = `云函数代码未更新：不支持操作 "${action}"。\n请务必在云端部署最新的 "ourchildren_kidApi" 函数代码。`;
                if (window.Toast) {
                    window.Toast.show(msg, 'error', 10000);
                } else {
                    alert(msg);
                }
                return res.result;
            }
            
            return res.result;
        } catch (e) {
            console.error('API Call failed', e);
            throw e;
        }
    }

    async function refreshFamilyData() {
        if (!_currentFamily) return;
        try {
            const res = await callApi('get_family_data', { familyId: _currentFamily._id });
            if (res.success) {
                _kids = res.data.kids;
                notifyChange();
            }
        } catch (e) {
            console.error('Refresh family data failed', e);
        }
    }

    function notifyChange() {
        if (_onDataChange) {
            // Convert to old structure for compatibility if needed, 
            // OR just pass the new structure and let app.js handle it.
            // Let's pass a structured object.
            _onDataChange({
                user: _currentUser,
                family: _currentFamily,
                kids: _kids
            });
        }
    }

    function startPolling(intervalMs = 5000) {
        if (_pollingInterval) clearInterval(_pollingInterval);
        console.log('Starting polling...');
        _pollingInterval = setInterval(async () => {
            if (_currentFamily) {
                try {
                    // Use silent call if possible, but our callApi doesn't support options.
                    // Just call get_family_data directly.
                    const res = await app.callFunction({
                        name: 'ourchildren_kidApi',
                        data: { 
                            action: 'get_family_data', 
                            payload: { 
                                familyId: _currentFamily._id,
                                _t: Date.now() // Prevent caching
                            } 
                        }
                    });
                    
                    if (res.result && res.result.success) {
                        const newKids = res.result.data.kids;
                        const oldKidsJson = JSON.stringify(_kids);
                        const newKidsJson = JSON.stringify(newKids);
                        
                        if (oldKidsJson !== newKidsJson) {
                            console.log('Data changed via polling, updating...');
                            _kids = newKids;
                            notifyChange();
                        }
                    }
                } catch (e) {
                    console.error('Polling failed', e);
                }
            }
        }, intervalMs);
    }

    function stopPolling() {
        if (_pollingInterval) {
            console.log('Stopping polling...');
            clearInterval(_pollingInterval);
            _pollingInterval = null;
        }
    }

    return {
        init,
        startPolling,
        stopPolling,
        // Auth / Family Mgmt
        async getAllFamilies(page = 1) {
            return await callApi('get_all_families', { page });
        },
        async selectFamily(familyContext) {
            // Expecting full family context object: { info, user, kids }
            if (!familyContext || !familyContext.info || !familyContext.user) {
                console.error('Invalid family context passed to selectFamily', familyContext);
                return { success: false, message: 'Invalid family context' };
            }

            _currentUser = familyContext.user;
            _currentFamily = familyContext.info;
            _kids = familyContext.kids || [];
            
            notifyChange();
            
            // Refresh latest data in background
            refreshFamilyData();
            
            return { success: true };
        },
        async createFamily(name, pin, nickname) {
            const res = await callApi('create_family', { familyName: name, adminPin: pin, nickname });
            if (res.success) {
                // Do NOT call checkLoginStatus immediately to avoid stale read (eventual consistency)
                // causing 'unregistered' event which would wipe our optimistic state.
                // We rely on optimistic update in app.js.
                // checkLoginStatus(); 
                return { success: true, familyId: res.familyId, newFamily: res.newFamily };
            }
            return res;
        },
        async joinFamily(familyId, pin, nickname) {
            const res = await callApi('join_family', { familyId, adminPin: pin, nickname });
            if (res.success) {
                // Do NOT call checkLoginStatus immediately to avoid stale read (eventual consistency)
                // We rely on optimistic update in app.js
                return { success: true, familyId };
            }
            return res;
        },
        async deleteFamily(familyId, pin) {
             const res = await callApi('delete_family', { familyId, adminPin: pin });
             if (res.success) {
                 await checkLoginStatus();
                 return { success: true };
             }
             return res;
        },
        async addKid(name, gender, initialPoints) {
            if (!_currentFamily) return { success: false, message: 'Not in a family' };
            const res = await callApi('add_kid', { 
                familyId: _currentFamily._id, 
                name, 
                gender, 
                initialPoints 
            });
            if (res.success) {
                await refreshFamilyData();
            }
            return res;
        },
        async updateFamilyName(newName) {
            if (!_currentFamily) return { success: false, message: 'Not in a family' };
            
            // Check for duplicates in memory (optimistic) or let backend handle it
            // Backend should handle uniqueness
            const res = await callApi('update_family_name', {
                familyId: _currentFamily._id,
                newName
            });
            
            if (res.success) {
                _currentFamily.name = newName;
                notifyChange();
            }
            return res;
        },
        async updateKidName(kidId, newName) {
            if (!_currentFamily) return { success: false, message: 'Not in a family' };
            
            const res = await callApi('update_kid_name', {
                familyId: _currentFamily._id,
                kidId,
                newName
            });
            
            if (res.success) {
                // Optimistic update done in UI, but good to ensure sync
                await refreshFamilyData();
            }
            return res;
        },
        async updateFamilyPin(oldPin, newPin) {
            if (!_currentFamily) return { success: false, message: 'Not in a family' };
            
            return await callApi('update_family_pin', {
                familyId: _currentFamily._id,
                oldPin,
                newPin
            });
        },
        async updateFamilySeries(seriesId) {
            if (!_currentFamily) return { success: false, message: 'Not in a family' };
            
            const res = await callApi('update_family_series', {
                familyId: _currentFamily._id,
                seriesId
            });
            
            if (res.success) {
                _currentFamily.display_series = seriesId;
                notifyChange();
            }
            return res;
        },
        // Points
        async updatePoints(kidId, delta, reason, operator) {
            if (!_currentFamily) return;
            
            // Optimistic update
            const kid = _kids.find(k => k._id === kidId);
            if (kid) {
                kid.current_points += delta;
                notifyChange();
            }

            const res = await callApi('update_points', {
                familyId: _currentFamily._id,
                kidId,
                delta,
                reason,
                operatorName: operator
            });
            
            if (!res.success) {
                if (window.Toast) {
                    window.Toast.error('Failed to update points: ' + res.message);
                } else {
                    alert('Failed to update points: ' + res.message);
                }
                // Rollback logic could go here
                await refreshFamilyData(); // Re-sync to be safe
            }
        },
        // Getters
        getData() {
            return {
                user: _currentUser,
                family: _currentFamily,
                kids: _kids
            };
        },
        isLoading() {
            return _loading;
        },
        async logout() {
            if (auth) {
                await auth.signOut();
                _currentUser = null;
                _currentFamily = null;
                _kids = [];
                notifyChange();
                // Re-init for next user (will create new anon id)
                await auth.signInAnonymously();
            }
        },
        async getHistory(kidId, page = 1, familyIdOverride = null) {
            const fid = familyIdOverride || (_currentFamily ? _currentFamily._id : null);
            if (!fid) return { success: false, message: 'No family context' };
            
            return await callApi('get_history', {
                familyId: fid,
                kidId,
                page
            });
        },
        async refresh() {
            await refreshFamilyData();
        },
        startPolling(intervalMs, familyId) {
            this.stopPolling();
            
            const fetchFn = async () => {
                // Fetch latest family data
                const res = await callApi('get_family_data', { familyId });
                if (res.success && res.data) {
                     if (_onDataChange) {
                         _onDataChange({
                             type: 'poster_update',
                             familyId: familyId,
                             kids: res.data.kids || []
                         });
                     }
                }
            };
            
            // Fetch immediately
            fetchFn();
            
            // Then poll
            _pollingInterval = setInterval(fetchFn, intervalMs);
        },
        stopPolling() {
            if (_pollingInterval) {
                clearInterval(_pollingInterval);
                _pollingInterval = null;
            }
        }
    };
})();
