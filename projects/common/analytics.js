/**
 * Common Analytics SDK for Edutogather Projects
 * Tracks user behavior, device info, and application events.
 */

(function(window) {
    const STORAGE_KEY_DEVICE_ID = 'edutogather_device_id';
    const STORAGE_KEY_SESSION_ID = 'edutogather_session_id';
    
    class AnalyticsSDK {
        constructor() {
            this.initialized = false;
            this.cloudbaseApp = null;
            this.buffer = [];
            this.flushInterval = 5000; // Flush every 5 seconds
            this.deviceId = this._getDeviceId();
            this.sessionId = this._getSessionId();
            this.projectId = this._detectProject();
            this.userInfo = null;
            this.cloudLoggingEnabled = true;
            
            // Auto-init if CloudBase is present
            if (window.cloudbase) {
                // Wait a moment for main app to init cloudbase if needed, 
                // but usually we pass the app instance or init ourselves.
                // For now, we assume the host app initializes cloudbase or we use a global instance.
            }

            // Start auto-flushing
            setInterval(() => this.flush(), this.flushInterval);
            
            // Track page view on load
            window.addEventListener('load', () => {
                this.track('page_view', {
                    url: window.location.href,
                    referrer: document.referrer,
                    title: document.title
                });
            });

            // Track errors
            window.addEventListener('error', (event) => {
                this.track('error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
        }

        init(app) {
            this.cloudbaseApp = app;
            this.initialized = true;
            this.flush(); // Flush any queued events
        }

        identify(userId, traits = {}) {
            this.userInfo = { userId, ...traits };
            this.track('identify', { userId, traits });
        }

        track(eventName, properties = {}) {
            const event = {
                event: eventName,
                project: this.projectId,
                timestamp: Date.now(),
                device_id: this.deviceId,
                session_id: this.sessionId,
                user_id: this.userInfo ? this.userInfo.userId : null,
                user_info: this.userInfo, // Snapshot of user info at time of event
                context: {
                    user_agent: navigator.userAgent,
                    screen: {
                        width: window.screen.width,
                        height: window.screen.height
                    },
                    window: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                properties: properties
            };

            this.buffer.push(event);
            
            // If important event or buffer full, flush immediately
            if (this.buffer.length >= 10 || eventName === 'error') {
                this.flush();
            }
        }

        async flush() {
            if (this.buffer.length === 0) return;
            if (!this.cloudLoggingEnabled) {
                this.buffer = []; // Clear buffer if disabled
                return;
            }

            if (!this.cloudbaseApp) {
                // Try to find global cloudbase app if not explicitly set
                if (window.app) this.cloudbaseApp = window.app;
                else if (window.cloudbase && window.cloudbase.getApps().length > 0) {
                    this.cloudbaseApp = window.cloudbase.getApps()[0];
                }
                
                if (!this.cloudbaseApp) {
                    console.warn('Analytics: CloudBase app not initialized yet. Queueing events.');
                    return;
                }
            }

            const eventsToSend = [...this.buffer];
            this.buffer = [];

            try {
                await this.cloudbaseApp.callFunction({
                    name: 'edu_common',
                    data: {
                        action: 'log_event',
                        events: eventsToSend
                    }
                });
                console.log(`[Analytics] Sent ${eventsToSend.length} events`);
            } catch (e) {
                // Check for missing cloud function error to prevent console spam
                const errStr = JSON.stringify(e);
                if (errStr.includes('FUNCTION_NOT_FOUND') || (e.message && e.message.includes('FUNCTION_NOT_FOUND'))) {
                    console.warn('[Analytics] Cloud function "log_event" not found. Disabling analytics for this session.');
                    this.cloudLoggingEnabled = false;
                    return; // Drop these events
                }

                console.error('[Analytics] Failed to send events', e);
                // Put back in buffer (prepend)
                this.buffer = [...eventsToSend, ...this.buffer];
            }
        }

        _getDeviceId() {
            let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
            if (!id) {
                id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
                localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
            }
            return id;
        }

        _getSessionId() {
            let id = sessionStorage.getItem(STORAGE_KEY_SESSION_ID);
            if (!id) {
                id = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
                sessionStorage.setItem(STORAGE_KEY_SESSION_ID, id);
            }
            return id;
        }

        _detectProject() {
            const path = window.location.pathname;
            if (path.includes('edutogatherhome')) return 'edutogatherhome';
            if (path.includes('edutogather')) return 'edutogather';
            if (path.includes('guide')) return 'guide';
            if (path.includes('admin') || path.includes('/a/')) return 'admin';
            return 'unknown_project';
        }
    }

    // Export global instance
    window.Analytics = new AnalyticsSDK();

})(window);
