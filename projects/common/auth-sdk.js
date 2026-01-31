/**
 * EduTogether Shared Authentication SDK
 * Provides unified login, session management, and API access for all EduTogether apps.
 */

(function(window) {
    // Configuration
    const CONFIG = {
        env: 'chenlizhun-projects-2ckab9e1cd47', // Correct Env ID from edutogather
        storageKeys: {
            session: 'kids_management_session', // Must match Edutogather's key
            familyCache: 'kids_management_families_cache',
            currentKid: 'kids_management_current_kid'
        }
    };

    // State
    const state = {
        app: null,
        auth: null,
        user: null, // CloudBase user
        currentFamily: null,
        currentUser: null, // Full user object from session
        currentUserRole: null, // 'admin' | 'member'
        currentKidId: null,
        isInitialized: false,
        families: [], // Cache of families
        kids: [] // Current family kids
    };

    // API
    const EduAuth = {
        /**
         * Initialize the SDK
         */
        async init() {
            if (state.app) return;
            
            if (typeof cloudbase === 'undefined') {
                console.error('CloudBase SDK is not loaded. Please include cloudbase.js before auth-sdk.js');
                return;
            }

            try {
                state.app = cloudbase.init({ env: CONFIG.env });
                state.auth = state.app.auth();
                
                // Init Analytics
                if (window.Analytics) {
                    window.Analytics.init(state.app);
                }
                
                // Login anonymously if needed (Required for TCB access)
                const loginState = await state.auth.getLoginState();
                if (!loginState) {
                    await state.auth.signInAnonymously();
                }

                // Try to load session
                this._loadSession();
                
                // Parse URL parameters for context (cross-project navigation)
                this._parseUrlContext();
            } catch (e) {
                console.error('EduAuth init failed:', e);
                // Throw to let caller know
                throw e;
            }
        },

        /**
         * Call a Cloud Function (Unified API)
         */
        async callApi(action, payload = {}) {
            if (!state.app) await this.init();
            
            try {
                const res = await state.app.callFunction({
                    name: 'ourchildren_kidApi',
                    data: { action, payload }
                });
                
                if (!res.result) throw new Error('No result from cloud function');
                return res.result;
            } catch (e) {
                console.error(`API Call ${action} failed:`, e);
                throw e;
            }
        },

        /**
         * Get all families (Directory)
         */
        async getAllFamilies(page = 1) {
            const res = await this.callApi('get_all_families', { page });
            if (res.success && res.data) {
                // Handle different response structures
                const list = Array.isArray(res.data) ? res.data : (res.data.families || []);
                state.families = list;
            }
            return res;
        },

        /**
         * Join/Login to a family
         */
        async loginToFamily(familyId, pin, nickname) {
            // Determine if it's a join or just a verification
            // For simplicity, we use join_family which acts as login if already joined
            // But we need to handle "Create" vs "Join" separately in UI, 
            // here we assume we are joining/logging in to an existing ID.
            
            let res = await this.callApi('join_family', { 
                familyId, 
                adminPin: pin, 
                nickname 
            });

            // Auto-retry for leading zero PINs (e.g. "0718" -> "718")
            // This fixes the issue where cloud function stores PIN as number (718) but input is string ("0718")
            if (!res.success && res.message === 'Invalid PIN' && pin.startsWith('0') && pin.length > 1) {
                const pinNumberStr = parseInt(pin, 10).toString();
                console.log(`Auto-retrying login with PIN: ${pinNumberStr}`);
                
                const resRetry = await this.callApi('join_family', { 
                    familyId, 
                    adminPin: pinNumberStr, 
                    nickname 
                });
                
                if (resRetry.success) {
                    res = resRetry; // Use the successful response
                }
            }

            if (res.success) {
                // Fetch full family data to establish session
                const familyData = await this.callApi('get_family_data', { familyId });
                console.log('get_family_data result:', familyData);
                
                // Validate family data structure
                if (familyData.success && familyData.data && familyData.data.info) {
                    this._saveSession({
                        family: familyData.data.info,
                        user: familyData.data.user || { nickname: nickname, role: 'member' },
                        kids: familyData.data.kids
                    });
                    return { success: true, family: familyData.data.info };
                } else {
                    console.warn('get_family_data failed or incomplete, falling back to local construction', familyData);
                    
                    // Fallback: Construct session from join response or cache
                    let familyInfo = null;
                    let kids = [];
                    
                    // Try to get family info from join response
                    if (res.family && res.family.info) {
                        familyInfo = res.family.info;
                        kids = res.family.kids || [];
                    } 
                    // Or from cached directory
                    else {
                        const cached = state.families.find(f => f._id === familyId);
                        if (cached) {
                            familyInfo = cached;
                            // cached might be wrapper or direct object
                            if (cached.info) familyInfo = cached.info;
                        } else {
                            // Minimal fallback
                            familyInfo = { _id: familyId, name: '家庭 ' + familyId };
                        }
                    }

                    const sessionData = {
                        family: familyInfo,
                        user: { nickname: nickname, role: 'member', family_id: familyId },
                        kids: kids
                    };
                    
                    this._saveSession(sessionData);
                    return { success: true, family: familyInfo };
                }
            }
            return res;
        },

        /**
         * Create a new family
         */
        async createFamily(name, pin, nickname) {
            const res = await this.callApi('create_family', { 
                familyName: name, 
                adminPin: pin, 
                nickname 
            });
            
            if (res.success) {
                // Auto login
                return await this.loginToFamily(res.familyId, pin, nickname);
            }
            return res;
        },

        /**
         * Logout
         */
        logout() {
            localStorage.removeItem(CONFIG.storageKeys.session);
            localStorage.removeItem(CONFIG.storageKeys.currentKid);
            state.currentFamily = null;
            state.currentUser = null;
            state.currentUserRole = null;
            state.currentKidId = null;
            window.location.reload();
        },

        /**
         * Set the current active kid (for tools like Typeasy)
         */
        setCurrentKid(kidId) {
            state.currentKidId = kidId;
            localStorage.setItem(CONFIG.storageKeys.currentKid, kidId);
        },

        /**
         * Get current session info
         */
        getSession() {
            return {
                family: state.currentFamily,
                user: state.currentUser,
                role: state.currentUserRole,
                kidId: state.currentKidId,
                kids: state.kids,
                isAuthenticated: !!state.currentFamily
            };
        },

        /**
         * Refresh session data from server
         * Useful when local data is stale or missing fields (like kids list)
         */
        async refreshSession() {
            if (!state.currentFamily) return false;
            
            try {
                // Try to get familyId from currentFamily object or fallback to user.family_id
                let familyId = state.currentFamily._id;
                if (!familyId && state.currentUser && state.currentUser.family_id) {
                    familyId = state.currentUser.family_id;
                    console.log('Recovered familyId from currentUser:', familyId);
                }

                if (!familyId) {
                    console.error('Cannot refresh session: familyId is missing');
                    return false;
                }

                console.log('Refreshing session for family:', familyId);
                const familyData = await this.callApi('get_family_data', { familyId });
                console.log('Refresh result:', familyData);
                
                if (familyData.success && familyData.data) {
                    const info = familyData.data.info || familyData.data; // Fallback if structure differs
                    
                    // Merge old family data to preserve name if missing in new data
                    const oldFamily = state.currentFamily || {};
                    const mergedFamily = { ...oldFamily, ...info };
                    // Specifically ensure name is preserved if new info lacks it but old one had it
                    if (!info.name && oldFamily.name) {
                        mergedFamily.name = oldFamily.name;
                    }

                    // Robust kids extraction
                    let kids = familyData.data.kids;
                    if (!kids && info && info.kids) kids = info.kids;
                    if (!kids) kids = []; // Ensure array

                    const currentUser = state.currentUser;
                    
                    this._saveSession({
                        family: mergedFamily,
                        user: familyData.data.user || currentUser, 
                        kids: kids
                    });
                    return true;
                }
            } catch (e) {
                console.error('Failed to refresh session', e);
            }
            return false;
        },

        /**
         * Internal: Parse URL parameters for context
         */
        _parseUrlContext() {
            try {
                const params = new URLSearchParams(window.location.search);
                const kidId = params.get('kidId');
                if (kidId) {
                    console.log('Found kidId in URL, updating context:', kidId);
                    this.setCurrentKid(kidId);
                }
                
                // We could also handle familyId here if needed to switch families,
                // but usually session is source of truth for family.
                // If familyId in URL differs from session, we might want to warn or switch?
                // For now, assume session logic handles family, and URL supplements kid context.
            } catch (e) {
                console.error('Failed to parse URL context', e);
            }
        },

        /**
         * Internal: Load session from localStorage
         */
        _loadSession() {
            const json = localStorage.getItem(CONFIG.storageKeys.session);
            if (json) {
                try {
                    const data = JSON.parse(json);
                    
                    // Strict validation: Check for dirty data from old versions
                    if (data.user && typeof data.user !== 'object') {
                        console.warn('Detected legacy session data (user is not object), clearing session.');
                        this.logout(); // Clear invalid data
                        return;
                    }

                    state.currentFamily = data.family;
                    state.currentUser = data.user;
                    state.currentUserRole = data.user ? data.user.role : null;
                    state.kids = data.kids || [];
                    // Also load kid
                    state.currentKidId = localStorage.getItem(CONFIG.storageKeys.currentKid);
                } catch (e) {
                    console.error('Failed to load session', e);
                    // If parse fails, clear it
                    localStorage.removeItem(CONFIG.storageKeys.session);
                }
            }
        },

        /**
         * Internal: Save session
         */
        _saveSession(data) {
            console.log('Saving session:', data);
            state.currentFamily = data.family;
            state.currentUser = data.user;
            state.currentUserRole = data.user ? data.user.role : null;
            state.kids = data.kids || [];
            
            localStorage.setItem(CONFIG.storageKeys.session, JSON.stringify(data));
            console.log('Session saved. currentFamily:', state.currentFamily);
        }
    };

    // Expose to window
    window.EduAuth = EduAuth;

})(window);
