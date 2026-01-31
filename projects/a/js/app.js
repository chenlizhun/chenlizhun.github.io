const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const user = ref(null);
        const loading = ref(false);
        const logs = ref([]);
        const stats = ref({
            totalEvents: 0,
            activeUsers: 0,
            topProject: '-',
            errors: 0
        });
        
        let app, auth;
        let projectChartInstance = null;
        let deviceChartInstance = null;

        // Configuration
        const ENV_ID = 'edutogather-4g5827l7c96323a7'; // Using the same Env ID as other projects

        const initCloudBase = async () => {
            try {
                app = cloudbase.init({
                    env: ENV_ID
                });
                auth = app.auth();
                
                // Initialize Analytics SDK with this app instance
                if (window.Analytics) {
                    window.Analytics.init(app);
                }

                const loginState = await auth.getLoginState();
                if (loginState) {
                    user.value = loginState.user;
                    refreshData();
                } else {
                    // Auto login anonymously for demo, but real admin should use custom login
                    // For now, we ask user to click login
                }
            } catch (e) {
                console.error('CloudBase init error', e);
            }
        };

        const login = async () => {
            try {
                // Ideally this should be email/password or custom auth for Admin
                // Falling back to anonymous for now to allow access
                await auth.signInAnonymously();
                const loginState = await auth.getLoginState();
                user.value = loginState.user;
                refreshData();
            } catch (e) {
                alert('Login failed: ' + e.message);
            }
        };

        const refreshData = async () => {
            if (loading.value) return;
            loading.value = true;
            
            try {
                // Call Cloud Function to get analytics data
                // If function doesn't exist yet, we'll catch error and show mock data
                const res = await app.callFunction({
                    name: 'edu_common',
                    data: {
                        action: 'get_analytics',
                        days: 1
                    }
                });
                
                if (res.result && res.result.code === 0) {
                    processData(res.result.data);
                } else {
                    console.warn('API returned error or empty', res);
                    // Fallback or empty state
                    logs.value = [];
                }
            } catch (e) {
                console.error('Fetch data failed', e);
                // alert('Failed to fetch data. Ensure "get_analytics" cloud function is deployed.');
                
                // MOCK DATA FOR DEMONSTRATION (Remove in production)
                // This allows the user to see what it looks like before deploying backend
                const mockLogs = [
                    { _id: '1', timestamp: Date.now(), project: 'edutogather', event: 'page_view', session_id: 'sess_abc', properties: { url: '/home' } },
                    { _id: '2', timestamp: Date.now() - 10000, project: 'guide', event: 'click', session_id: 'sess_def', properties: { target: 'btn_login' } },
                    { _id: '3', timestamp: Date.now() - 50000, project: 'edutogatherhome', event: 'page_view', session_id: 'sess_abc', properties: { url: '/' } }
                ];
                processData({ logs: mockLogs });
            } finally {
                loading.value = false;
            }
        };

        const processData = (data) => {
            logs.value = data.logs || [];
            
            // Calculate Stats
            stats.value.totalEvents = logs.value.length;
            const uniqueUsers = new Set(logs.value.map(l => l.user_id || l.session_id));
            stats.value.activeUsers = uniqueUsers.size;
            stats.value.errors = logs.value.filter(l => l.event === 'error').length;

            // Project distribution
            const projectCounts = {};
            logs.value.forEach(l => {
                projectCounts[l.project] = (projectCounts[l.project] || 0) + 1;
            });
            const sortedProjects = Object.entries(projectCounts).sort((a,b) => b[1] - a[1]);
            stats.value.topProject = sortedProjects.length > 0 ? sortedProjects[0][0] : '-';

            renderCharts(projectCounts);
        };

        const renderCharts = (projectCounts) => {
            // Project Chart
            const ctxP = document.getElementById('projectChart');
            if (ctxP) {
                if (projectChartInstance) projectChartInstance.destroy();
                projectChartInstance = new Chart(ctxP, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(projectCounts),
                        datasets: [{
                            data: Object.values(projectCounts),
                            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
                        }]
                    }
                });
            }

            // Device Chart (Mock for now, needs real data parsing)
            const ctxD = document.getElementById('deviceChart');
            if (ctxD) {
                if (deviceChartInstance) deviceChartInstance.destroy();
                deviceChartInstance = new Chart(ctxD, {
                    type: 'bar',
                    data: {
                        labels: ['Mobile', 'Desktop', 'Tablet'],
                        datasets: [{
                            label: 'Users',
                            data: [12, 19, 3], // Mock data
                            backgroundColor: '#6366F1'
                        }]
                    }
                });
            }
        };

        const formatDate = (ts) => {
            return new Date(ts).toLocaleString();
        };

        const getProjectColor = (p) => {
            const map = {
                'edutogather': 'bg-blue-100 text-blue-800',
                'edutogatherhome': 'bg-pink-100 text-pink-800',
                'guide': 'bg-gray-100 text-gray-800'
            };
            return map[p] || 'bg-green-100 text-green-800';
        };

        onMounted(() => {
            initCloudBase();
        });

        return {
            user,
            loading,
            logs,
            stats,
            login,
            refreshData,
            formatDate,
            getProjectColor
        };
    }
}).mount('#app');
