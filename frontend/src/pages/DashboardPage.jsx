import React, { useState, useEffect } from 'react';
import { 
  Folder, CheckSquare, CheckCircle, Bell, ChevronDown, TrendingUp, Users, ExternalLink
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import analyticsService from '../services/analyticsService';
import taskService from '../services/taskService';
import StatCard from '../components/analytics/StatCard';
import ChartCard from '../components/analytics/ChartCard';
import EmptyState from '../components/shared/EmptyState';
import ActivityFeed from '../components/activity/ActivityFeed';
import { TOOLTIP_CONFIG, SCALE_CONFIG } from '../utils/chartSetup';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import axiosInstance from '../utils/axiosInstance';

const DashboardPage = () => {
  const { user } = useAuth();
  const { currentProject, selectProject, projects } = useProject();
  const { socket } = useSocket();
  const navigate = useNavigate();
  usePageTitle('Dashboard');

  const [orgData, setOrgData] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);

  const [completionData, setCompletionData] = useState(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [days, setDays] = useState(30);

  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [weeklyData, setWeeklyData] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const [memberData, setMemberData] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const [orgId, setOrgId] = useState(null);
  const [hasNoOrgs, setHasNoOrgs] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setOrgId(currentProject.orgId);
    } else if (user) {
      axiosInstance.get('/orgs').then(res => {
        if (res.data.data && res.data.data.length > 0) {
          setOrgId(res.data.data[0]._id);
          setHasNoOrgs(false);
        } else {
          setHasNoOrgs(true);
        }
      }).catch(err => console.error(err));
    }
  }, [currentProject, user]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Fetch org overview and pending tasks
  useEffect(() => {
    if (!orgId) return;
    
    const fetchOrgData = async () => {
      try {
        setOrgLoading(true);
        const response = await analyticsService.getOrgOverview(orgId);
        setOrgData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setOrgLoading(false);
      }
    };

    const fetchPendingTasks = async () => {
      try {
        setPendingLoading(true);
        const response = await taskService.getMyTasks();
        // Filter out done tasks and sort by due date
        const pending = (response.data || [])
          .filter(t => t.status !== 'done')
          .sort((a, b) => new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01'))
          .slice(0, 6);
        setPendingTasks(pending);
      } catch (err) {
        console.error(err);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchOrgData();
    fetchPendingTasks();
  }, [orgId]);

  // 2. Fetch project specific data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (currentProject) {
        setStatsLoading(true);
        setMemberLoading(true);
        
        Promise.all([
          analyticsService.getProjectStats(currentProject._id).then(res => setStatsData(res.data)),
          analyticsService.getMemberProductivity(currentProject._id).then(res => setMemberData(res.data))
        ]).finally(() => {
          setStatsLoading(false);
          setMemberLoading(false);
        });
      } else {
        setStatsData(null);
        setMemberData(null);
      }
    };

    const fetchWeekly = async () => {
      if (orgId) {
        setWeeklyLoading(true);
        try {
          const res = await analyticsService.getWeeklyProgress(orgId);
          setWeeklyData(res.data);
        } finally {
          setWeeklyLoading(false);
        }
      }
    };

    fetchProjectData();
    fetchWeekly(); // weekly is org-level but we refresh it here to parallelize or we can do it on org change
  }, [currentProject, orgId]);

  // 3. Fetch completion data (dependent on days)
  useEffect(() => {
    if (currentProject) {
      setCompletionLoading(true);
      analyticsService.getTaskCompletion(currentProject._id, days)
        .then(res => setCompletionData(res.data))
        .finally(() => setCompletionLoading(false));
    } else {
      setCompletionData(null);
    }
  }, [currentProject, days]);

  // Socket listener for optimistic updates
  useEffect(() => {
    if (!socket) return;
    
    const handleTaskCompleted = ({ taskId }) => {
      if (orgData) {
        setOrgData(prev => ({
          ...prev,
          completedThisWeek: (prev?.completedThisWeek || 0) + 1
        }));
      }
      
      setPendingTasks(prev => prev.filter(t => t._id !== taskId));
      
      setCompletionData(prev => {
        if (!prev) return prev;
        const newLabels = [...prev.labels];
        const newData = [...prev.data];
        if (newData.length > 0) {
          newData[newData.length - 1] += 1;
        }
        return { ...prev, labels: newLabels, data: newData };
      });
    };
    
    const handleNotifCountChanged = ({ count }) => {
      if (orgData) {
        setOrgData(prev => ({
          ...prev,
          unreadNotifications: count
        }));
      }
    };
    
    socket.on('stats:task_completed', handleTaskCompleted);
    socket.on('stats:notif_count_changed', handleNotifCountChanged);
    
    return () => {
      socket.off('stats:task_completed', handleTaskCompleted);
      socket.off('stats:notif_count_changed', handleNotifCountChanged);
    };
  }, [socket, orgData]);

  // --- Chart Data Formatting ---
  const lineChartData = completionData ? {
    labels: completionData.labels,
    datasets: [{
      label: 'Tasks completed',
      data: completionData.data,
      borderColor: '#06b6d4',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(6,182,212,0.15)');
        gradient.addColorStop(1, 'rgba(6,182,212,0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: 'var(--chart-1)',
      pointBorderColor: 'var(--bg-page)',
      pointHoverBackgroundColor: '#fff',
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#22d3ee',
    }]
  } : null;

  const donutData = statsData ? {
    labels: ['Todo', 'In Progress', 'Review', 'Testing', 'Done'],
    datasets: [{
      data: [statsData.todo || 0, statsData.in_progress || 0, statsData.review || 0, statsData.testing || 0, statsData.done || 0],
      backgroundColor: ['#94a3b8','#06b6d4','#8b5cf6','#f59e0b','#10b981'],
      borderWidth: 0,
      hoverOffset: 6,
      borderRadius: 4,
    }]
  } : null;

  const donutTotal = statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;

  const barWeeklyData = weeklyData ? {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Created',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-sidebar)',
        hoverBackgroundColor: 'var(--border-hover)',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Completed',
        data: weeklyData.completed,
        backgroundColor: '#06b6d4',
        hoverBackgroundColor: '#22d3ee',
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  } : null;

  const barMemberData = memberData ? {
    labels: memberData.map(m => m.name),
    datasets: [{
      label: 'Tasks completed',
      data: memberData.map(m => m.tasksCompleted),
      backgroundColor: (ctx) => {
        const colors = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
        return colors[ctx.dataIndex % colors.length] + '99';
      },
      hoverBackgroundColor: (ctx) => {
        const colors = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
        return colors[ctx.dataIndex % colors.length];
      },
      borderRadius: 4,
      borderSkipped: false,
    }]
  } : null;

  const getPriorityColor = (p) => {
    if (p === 'urgent') return '#ef4444';
    if (p === 'high') return '#f97316';
    if (p === 'medium') return '#f59e0b';
    if (p === 'low') return '#10b981';
    return '#94a3b8';
  };

  if (hasNoOrgs) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
        <EmptyState 
          icon={Folder} 
          title="Welcome to NexaFlow!" 
          description="You don't belong to any organizations yet. Click the '+' button in the sidebar to create one and get started." 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ROW 0 — Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '26px', color: 'var(--text-primary)', fontWeight: 700 }}>
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Here's what's happening in your workspace today.
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            style={{
              height: '36px', padding: '0 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'border-color 0.15s'
            }}
            className="hover:border-border-hover"
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentProject?.color || '#475569' }} />
            {currentProject?.name || "Select project"}
            <ChevronDown size={14} />
          </button>
          
          {isProjectDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', width: '220px', zIndex: 10,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '240px', overflowY: 'auto'
            }}>
              <div 
                onClick={() => { selectProject(null); setIsProjectDropdownOpen(false); }}
                style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}
                className="hover:bg-bg-card-hover"
              >
                All projects
              </div>
              {projects.map(p => (
                <div 
                  key={p._id}
                  onClick={() => { selectProject(p); setIsProjectDropdownOpen(false); }}
                  style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  className="hover:bg-bg-card-hover"
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || '#475569' }} />
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 1 — Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px'
      }}>
        <StatCard 
          label="Active projects" 
          value={orgData?.activeProjects ?? '—'} 
          icon={Folder} color="#8b5cf6" loading={orgLoading} 
        />
        <StatCard 
          label="My pending tasks" 
          value={orgData?.myPendingTasks ?? '—'} 
          icon={CheckSquare} color="#06b6d4" loading={orgLoading} 
        />
        <StatCard 
          label="Completed this week" 
          value={orgData?.completedThisWeek ?? '—'} 
          icon={CheckCircle} color="#10b981" loading={orgLoading} 
          trend={{ direction: 'up', text: 'this week' }}
        />
        <StatCard 
          label="Unread notifications" 
          value={orgData?.unreadNotifications ?? '—'} 
          icon={Bell} color="#f59e0b" loading={orgLoading} 
        />
      </div>

      {/* ROW 2 — Main charts */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px'
      }}>
        <div style={{ flex: 2, minWidth: '400px' }}>
          <ChartCard 
            title="Task completion over time" 
            subtitle="Tasks completed per day"
            height="260px"
            loading={completionLoading}
            empty={!currentProject || !completionData || completionData.data.length === 0}
            emptyIcon={TrendingUp}
            emptyTitle={!currentProject ? "Select a project to see completion trends" : "No completion data available"}
            headerRight={currentProject && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {[7, 14, 30].map(d => (
                  <button
                    key={d} onClick={() => setDays(d)}
                    style={{
                      height: '24px', padding: '0 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
                      background: days === d ? 'var(--accent-dim)' : 'transparent',
                      border: `1px solid ${days === d ? 'var(--accent-border)' : 'var(--border-default)'}`,
                      color: days === d ? 'var(--accent)' : '#475569'
                    }}
                  >{d}d</button>
                ))}
              </div>
            )}
          >
            {lineChartData && (
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_CONFIG } },
                  scales: SCALE_CONFIG,
                  interaction: { mode: 'index', intersect: false }
                }} 
              />
            )}
          </ChartCard>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <ChartCard 
            title="Task breakdown" 
            subtitle={currentProject?.name || "Select a project"}
            height="260px"
            loading={statsLoading}
            empty={!currentProject || donutTotal === 0}
            emptyIcon={CheckSquare}
            emptyTitle={!currentProject ? "Select a project" : "No tasks in project"}
          >
            {donutData && (
              <>
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', color: 'var(--text-primary)', fontWeight: 700 }}>{donutTotal}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>total</div>
                </div>
                <Doughnut 
                  data={donutData} 
                  options={{
                    responsive: true, maintainAspectRatio: false, cutout: '72%',
                    plugins: {
                      legend: { display: false }, // We build a custom legend below
                      tooltip: { ...TOOLTIP_CONFIG }
                    }
                  }} 
                />
                {/* Custom Status Summary */}
                <div style={{ position: 'absolute', bottom: 0, left: 20, right: 20, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['Todo', 'In Progress', 'Review', 'Testing', 'Done'].map((status, i) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: donutData.datasets[0].backgroundColor[i] }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{status}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {donutData.datasets[0].data[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ROW 3 — Secondary charts */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px'
      }}>
        <ChartCard 
          title="Weekly progress" 
          subtitle="Tasks created vs completed — last 8 weeks"
          height="220px"
          loading={weeklyLoading}
          empty={!weeklyData || weeklyData.labels.length === 0}
          emptyIcon={TrendingUp}
          emptyTitle="No weekly data available"
        >
          {barWeeklyData && (
            <Bar 
              data={barWeeklyData} 
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', align: 'end', labels: { color: '#94a3b8', font: { size: 11 } } },
                  tooltip: { ...TOOLTIP_CONFIG, mode: 'index' }
                },
                scales: { ...SCALE_CONFIG, x: { ...SCALE_CONFIG.x, stacked: false } },
                barPercentage: 0.65, categoryPercentage: 0.7,
                interaction: { mode: 'index', intersect: false }
              }} 
            />
          )}
        </ChartCard>

        <ChartCard 
          title="Team productivity" 
          subtitle="Tasks completed per member"
          height="220px"
          loading={memberLoading}
          empty={!memberData || memberData.length === 0}
          emptyIcon={Users}
          emptyTitle={!currentProject ? "Select a project to see team stats" : "No team data yet"}
        >
          {barMemberData && (
            <Bar 
              data={barMemberData} 
              options={{
                responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_CONFIG } },
                scales: {
                  x: { ...SCALE_CONFIG.x, ticks: { ...SCALE_CONFIG.x.ticks, stepSize: 1 } },
                  y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } }, border: { display: false } }
                }
              }} 
            />
          )}
        </ChartCard>
      </div>

      {/* ROW 4 — Bottom two columns */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr minmax(320px, 380px)', gap: '24px'
      }}>
        {/* My tasks due soon */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>My tasks due soon</div>
            <Link to="/tasks" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ padding: '8px' }}>
            {pendingLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ height: '44px', background: 'var(--border-default)', borderRadius: 'var(--radius-md)', marginBottom: '4px', animation: 'ai-pulse 1.5s infinite' }} />
              ))
            ) : pendingTasks.length === 0 ? (
              <div style={{ padding: '40px 20px' }}>
                <EmptyState icon={CheckCircle} title="No tasks due soon" description="You're all caught up!" />
              </div>
            ) : (
              pendingTasks.map(task => {
                const isOverdue = new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
                const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
                
                let dateBg = 'transparent';
                let dateColor = '#475569';
                if (isOverdue) { dateBg = 'rgba(239,68,68,0.12)'; dateColor = '#ef4444'; }
                else if (isToday) { dateBg = 'rgba(245,158,11,0.12)'; dateColor = '#f59e0b'; }

                return (
                  <div 
                    key={task._id} 
                    onClick={() => navigate(`/projects/${task.projectId?._id || task.projectId}/kanban`)}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover:bg-bg-card-hover"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                      <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.project?.name || 'Unknown Project'}</div>
                    </div>
                    {task.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '12px', borderRadius: '4px', padding: '1px 6px', background: dateBg, color: dateColor }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>Recent activity</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>Live</div>
          </div>
          <div style={{ padding: '8px' }}>
            <ActivityFeed limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
