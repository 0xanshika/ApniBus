import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { io } from 'socket.io-client';
import logoImg from '../assets/logo.png';
import {
  getAdminStats, getAdminUsers, updateAdminUser, deleteAdminUser,
  getBuses, createBus, updateBus, deleteBus,
  getReports, updateReport,
  getNotifications, createNotification, updateAdminProfile
} from '../api';

const API_ROOT = 'http://127.0.0.1:5000';

const menu = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin' },
  { key: 'buses', label: 'Manage Buses', path: '/admin/buses' },
  { key: 'users', label: 'Manage Users', path: '/admin/users' },
  { key: 'reports', label: 'Reports', path: '/admin/reports' },
  { key: 'tracking', label: 'Live Tracking', path: '/admin/tracking' },
  { key: 'notifications', label: 'Notifications', path: '/admin/notifications' },
  { key: 'profile', label: 'Admin Profile', path: '/admin/profile' }
];

const emptyBus = { busNumber: '', routeFrom: '', routeTo: '', currentLat: '28.6139', currentLng: '77.2090', availableSeats: 40, eta: '15 mins', status: 'Active', driverName: '' };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, buses: 0, reports: 0, bookings: 0, pendingReports: 0 });
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [admin, setAdmin] = useState({ name: '', email: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [socketStatus, setSocketStatus] = useState('Connecting');

  const section = useMemo(() => {
    const value = location.pathname.replace('/admin', '').replace(/^\//, '');
    return value || 'dashboard';
  }, [location.pathname]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.__apniToast);
    window.__apniToast = window.setTimeout(() => setToast(''), 3000);
  };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [s, b, u, r, n] = await Promise.all([
        getAdminStats(), getBuses(), getAdminUsers(), getReports(), getNotifications()
      ]);
      setStats(s.data);
      setBuses(b.data);
      setUsers(u.data);
      setReports(r.data);
      setNotifications(n.data);
      const me = u.data.find(x => x._id === localStorage.getItem('userId'));
      if (me) setAdmin(me);
      else {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        setAdmin({ name: savedName || 'Admin', email: savedEmail || '', role: 'admin' });
      }
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.msg || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login', { replace: true });
      return;
    }
    loadAll();
  }, [token, role, navigate, loadAll]);

  useEffect(() => {
    const socket = io(API_ROOT, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setSocketStatus('Live'));
    socket.on('disconnect', () => setSocketStatus('Offline'));
    socket.on('newReport', payload => {
      if (payload?.report) setReports(prev => [payload.report, ...prev.filter(r => r._id !== payload.report._id)]);
      if (payload?.notification) setNotifications(prev => [payload.notification, ...prev]);
      notify('New report received');
      loadAll();
    });
    socket.on('reportUpdated', payload => {
      if (payload?.report) setReports(prev => prev.map(r => r._id === payload.report._id ? payload.report : r));
      if (payload?.notification) setNotifications(prev => [payload.notification, ...prev]);
    });
    socket.on('notification', item => setNotifications(prev => [item, ...prev]));
    socket.on('busUpdate', item => {
      setBuses(prev => prev.map(bus => bus.busNumber === item.busId ? { ...bus, currentLat: item.lat, currentLng: item.lng, eta: item.eta, status: item.status || bus.status } : bus));
    });
    return () => socket.disconnect();
  }, [loadAll]);

  const logout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const go = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const title = menu.find(item => item.key === section)?.label || 'Dashboard';

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="brand" onClick={() => go('/')}>
          <button className="mobile-menu" onClick={(e) => { e.stopPropagation(); setSidebarOpen(v => !v); }}>☰</button>
          <img src={logoImg} alt="ApniBus" />
          <div><strong>ApniBus</strong><small>Admin Panel</small></div>
        </div>
        <div className="top-actions">
          <span className="live-dot">● {socketStatus}</span>
          <button className="icon-btn" onClick={() => go('/admin/notifications')}>🔔<b>{stats.pendingReports}</b></button>
          <div className="admin-mini"><span>🛡️</span><div><strong>{admin.name || 'Admin'}</strong><small>Administrator</small></div></div>
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="admin-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="side-title">ADMINISTRATION</div>
          {menu.map(item => (
            <button key={item.key} className={`side-item ${section === item.key ? 'active' : ''}`} onClick={() => go(item.path)}>
              <span>{icons[item.key]}</span><span>{item.label}</span>
              {item.key === 'reports' && stats.pendingReports > 0 && <em>{stats.pendingReports}</em>}
            </button>
          ))}
          <div className="side-divider" />
          <button className="side-item" onClick={() => go('/')}><span>🌐</span><span>View Website</span></button>
          <button className="side-item danger" onClick={logout}><span>↪</span><span>Logout</span></button>
        </aside>

        <main className="admin-main">
          <div className="page-heading">
            <div><span>APNIBUS ADMINISTRATION</span><h1>{title}</h1><p>Manage your transport system from one place.</p></div>
            {loading && <span className="loading">Loading…</span>}
          </div>

          {toast && <div className="toast">✓ {toast}</div>}

          {section === 'dashboard' && <DashboardView stats={stats} reports={reports} buses={buses} go={go} />}
          {section === 'buses' && <BusesView buses={buses} setBuses={setBuses} notify={notify} />}
          {section === 'users' && <UsersView users={users} setUsers={setUsers} notify={notify} />}
          {section === 'reports' && <ReportsView reports={reports} setReports={setReports} notify={notify} />}
          {section === 'tracking' && <TrackingView buses={buses} setBuses={setBuses} notify={notify} />}
          {section === 'notifications' && <NotificationsView notifications={notifications} setNotifications={setNotifications} notify={notify} />}
          {section === 'profile' && <ProfileView admin={admin} setAdmin={setAdmin} notify={notify} />}
        </main>
      </div>

      <style>{styles}</style>
    </div>
  );
};

const icons = { dashboard: '▦', buses: '🚌', users: '👥', reports: '⚠', tracking: '🗺', notifications: '🔔', profile: '🛡' };

function DashboardView({ stats, reports, buses, go }) {
  return <>
    <div className="stats-grid">
      <Stat title="Total Buses" value={stats.buses} icon="🚌" sub="Fleet registered" />
      <Stat title="Total Users" value={stats.users} icon="👥" sub="Registered accounts" />
      <Stat title="Active Reports" value={stats.pendingReports} icon="⚠" sub="Need attention" />
      <Stat title="Bookings" value={stats.bookings} icon="🎫" sub="All bookings" />
    </div>
    <div className="two-col">
      <Panel title="Recent Reports" subtitle="Latest issues reported by users" action="View all" onAction={() => go('/admin/reports')}>
        {reports.slice(0, 5).map(r => <ReportRow key={r._id} report={r} />)}
        {!reports.length && <Empty text="No reports yet." />}
      </Panel>
      <Panel title="Quick Actions" subtitle="Frequently used admin tools">
        <Quick text="Manage fleet" sub="Add, edit or remove buses" icon="🚌" onClick={() => go('/admin/buses')} />
        <Quick text="Review reports" sub={`${stats.pendingReports} pending reports`} icon="⚠" onClick={() => go('/admin/reports')} />
        <Quick text="Manage users" sub="Roles and account access" icon="👥" onClick={() => go('/admin/users')} />
        <Quick text="Send notification" sub="Broadcast an update" icon="🔔" onClick={() => go('/admin/notifications')} />
      </Panel>
    </div>
    <Panel title="Fleet Snapshot" subtitle="Current buses in the system">
      <div className="mini-table"><div className="tr th"><span>Bus</span><span>Route</span><span>Status</span><span>ETA</span></div>{buses.slice(0, 6).map(b => <div className="tr" key={b._id}><span>{b.busNumber}</span><span>{b.routeFrom} → {b.routeTo}</span><span><Status value={b.status} /></span><span>{b.eta}</span></div>)}</div>
    </Panel>
  </>;
}

function Stat({ title, value, icon, sub }) { return <div className="stat"><div className="stat-icon">{icon}</div><h2>{value}</h2><strong>{title}</strong><small>{sub}</small></div>; }
function Panel({ title, subtitle, action, onAction, children }) { return <section className="panel"><div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action && <button onClick={onAction} className="link-btn">{action}</button>}</div>{children}</section>; }
function Quick({ text, sub, icon, onClick }) { return <button className="quick" onClick={onClick}><span>{icon}</span><div><strong>{text}</strong><small>{sub}</small></div><b>→</b></button>; }
function Empty({ text }) { return <div className="empty">{text}</div>; }
function Status({ value }) { return <span className={`status ${String(value).toLowerCase().replace(' ', '-')}`}>{value}</span>; }
function ReportRow({ report }) { return <div className="report-row"><span className="report-symbol">⚠</span><div><strong>{report.issue}</strong><small>{report.busNumber} • {report.reportedBy?.name || 'User'}</small></div><Status value={report.status} /></div>; }

function BusesView({ buses, setBuses, notify }) {
  const [form, setForm] = useState(emptyBus); const [editing, setEditing] = useState(null); const [search, setSearch] = useState('');
  const filtered = buses.filter(b => `${b.busNumber} ${b.routeFrom} ${b.routeTo}`.toLowerCase().includes(search.toLowerCase()));
  const submit = async e => { e.preventDefault(); try { if (editing) { const r = await updateBus(editing, form); setBuses(prev => prev.map(b => b._id === editing ? r.data : b)); notify('Bus updated successfully'); } else { const r = await createBus(form); setBuses(prev => [r.data, ...prev]); notify('Bus added successfully'); } setForm(emptyBus); setEditing(null); } catch (err) { notify(err.response?.data?.msg || 'Bus operation failed'); } };
  const edit = b => { setEditing(b._id); setForm({ busNumber:b.busNumber, routeFrom:b.routeFrom, routeTo:b.routeTo, currentLat:b.currentLat, currentLng:b.currentLng, availableSeats:b.availableSeats, eta:b.eta, status:b.status, driverName:b.driverName || '' }); window.scrollTo({top:0,behavior:'smooth'}); };
  const remove = async id => { if (!window.confirm('Delete this bus?')) return; try { await deleteBus(id); setBuses(prev => prev.filter(b => b._id !== id)); notify('Bus deleted'); } catch (err) { notify(err.response?.data?.msg || 'Delete failed'); } };
  return <div className="two-col"><Panel title={editing ? 'Edit Bus' : 'Add New Bus'} subtitle="Changes are saved to MongoDB"><form className="form" onSubmit={submit}>{['busNumber','routeFrom','routeTo','driverName'].map((key,i)=><input key={key} placeholder={['Bus Number','Route From','Route To','Driver Name'][i]} value={form[key]} required={key !== 'driverName'} onChange={e=>setForm({...form,[key]:e.target.value})}/>)}<div className="form-grid"><input type="number" placeholder="Latitude" value={form.currentLat} onChange={e=>setForm({...form,currentLat:e.target.value})}/><input type="number" placeholder="Longitude" value={form.currentLng} onChange={e=>setForm({...form,currentLng:e.target.value})}/></div><div className="form-grid"><input type="number" placeholder="Available seats" value={form.availableSeats} onChange={e=>setForm({...form,availableSeats:e.target.value})}/><input placeholder="ETA" value={form.eta} onChange={e=>setForm({...form,eta:e.target.value})}/></div><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Delayed</option><option>Maintenance</option><option>Inactive</option></select><button className="primary">{editing ? 'Save Changes' : 'Add Bus'}</button>{editing && <button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(emptyBus)}}>Cancel</button>}</form></Panel><Panel title="Current Fleet" subtitle={`${buses.length} buses`}><input className="search" placeholder="Search bus or route…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="mini-table"><div className="tr th"><span>Bus</span><span>Route</span><span>Status</span><span>Actions</span></div>{filtered.map(b=><div className="tr" key={b._id}><span><strong>{b.busNumber}</strong><small>{b.driverName || 'No driver'}</small></span><span>{b.routeFrom} → {b.routeTo}</span><span><Status value={b.status}/></span><span className="row-actions"><button onClick={()=>edit(b)}>Edit</button><button className="danger-text" onClick={()=>remove(b._id)}>Delete</button></span></div>)}{!filtered.length&&<Empty text="No buses found."/>}</div></Panel></div>;
}

function UsersView({ users, setUsers, notify }) { const [search,setSearch]=useState(''); const filtered=users.filter(u=>`${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())); const save=async(u,role)=>{try{const r=await updateAdminUser(u._id,{name:u.name,role});setUsers(prev=>prev.map(x=>x._id===u._id?r.data:x));notify('User updated');}catch(err){notify(err.response?.data?.msg||'Update failed')}}; const remove=async id=>{if(!window.confirm('Delete this user?'))return;try{await deleteAdminUser(id);setUsers(prev=>prev.filter(u=>u._id!==id));notify('User deleted')}catch(err){notify(err.response?.data?.msg||'Delete failed')}}; return <Panel title="Manage Users" subtitle="Review accounts and access roles"><input className="search" placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="mini-table"><div className="tr th"><span>Name</span><span>Email</span><span>Role</span><span>Joined</span><span>Actions</span></div>{filtered.map(u=><div className="tr" key={u._id}><span><strong>{u.name}</strong></span><span>{u.email}</span><span><select value={u.role} onChange={e=>save(u,e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></span><span>{new Date(u.date || u.createdAt).toLocaleDateString()}</span><span><button className="danger-text" onClick={()=>remove(u._id)}>Delete</button></span></div>)}</div></Panel>; }

function ReportsView({ reports, setReports, notify }) { const [filter,setFilter]=useState('All'); const [selected,setSelected]=useState(null); const filtered=filter==='All'?reports:reports.filter(r=>r.status===filter); const save=async()=>{try{const r=await updateReport(selected._id,{status:selected.status,priority:selected.priority,adminNote:selected.adminNote});setReports(prev=>prev.map(x=>x._id===selected._id?r.data.report:x));notify('Report updated and users notified');setSelected(null)}catch(err){notify(err.response?.data?.msg||'Report update failed')}}; return <><Panel title="Issue Reports" subtitle="Every report submitted by users appears here"><div className="filters">{['All','Pending','In Progress','Resolved','Rejected'].map(x=><button className={filter===x?'selected':''} key={x} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="report-list">{filtered.map(r=><div className="report-card" key={r._id}><div className="report-main"><div className="report-symbol large">⚠</div><div><h4>{r.issue}</h4><p><b>{r.busNumber}</b> • {r.priority} priority</p><small>{r.description || 'No description'} • Reported by {r.reportedBy?.name || 'User'} ({r.reportedBy?.email || ''})</small></div></div><div><Status value={r.status}/><button className="outline-btn" onClick={()=>setSelected({...r})}>Manage</button></div></div>)}{!filtered.length&&<Empty text="No reports in this category."/>}</div></Panel>{selected&&<div className="modal-backdrop"><div className="modal"><h3>Manage {selected.busNumber}</h3><p>{selected.issue}</p><label>Status<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option></select></label><label>Priority<select value={selected.priority} onChange={e=>setSelected({...selected,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Admin note<textarea value={selected.adminNote||''} onChange={e=>setSelected({...selected,adminNote:e.target.value})}/></label><div className="modal-actions"><button className="secondary" onClick={()=>setSelected(null)}>Cancel</button><button className="primary" onClick={save}>Save & Notify</button></div></div></div>}</>; }

function TrackingView({ buses, setBuses, notify }) { const [selected,setSelected]=useState(buses[0]?._id||''); useEffect(()=>{if(!selected&&buses[0])setSelected(buses[0]._id)},[buses,selected]); const bus=buses.find(x=>x._id===selected); const move=async()=>{if(!bus)return;const lat=Number(bus.currentLat)+(Math.random()-.5)*.02;const lng=Number(bus.currentLng)+(Math.random()-.5)*.02;try{const r=await updateBus(bus._id,{currentLat:lat,currentLng:lng,eta:`${Math.floor(Math.random()*20)+5} mins`});setBuses(prev=>prev.map(x=>x._id===bus._id?r.data:x));notify('Bus location updated')}catch(err){notify(err.response?.data?.msg||'Location update failed')}}; return <div className="tracking-grid"><Panel title="Live Fleet" subtitle="Locations update in real time"><div className="map-wrap"><MapContainer center={bus?[bus.currentLat,bus.currentLng]:[28.6139,77.209]} zoom={7} style={{height:'100%',width:'100%'}}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{buses.map(b=><Marker key={b._id} position={[b.currentLat,b.currentLng]}><Popup><b>{b.busNumber}</b><br/>{b.routeFrom} → {b.routeTo}<br/>ETA: {b.eta}</Popup></Marker>)}</MapContainer></div></Panel><Panel title="Selected Bus" subtitle="Admin controls"><select value={selected} onChange={e=>setSelected(e.target.value)}>{buses.map(b=><option key={b._id} value={b._id}>{b.busNumber} — {b.routeFrom} → {b.routeTo}</option>)}</select>{bus&&<div className="detail"><h3>{bus.busNumber}</h3><p>{bus.routeFrom} → {bus.routeTo}</p><Status value={bus.status}/><p>Coordinates: {Number(bus.currentLat).toFixed(5)}, {Number(bus.currentLng).toFixed(5)}</p><p>ETA: <b>{bus.eta}</b></p><button className="primary" onClick={move}>Simulate Location Update</button></div>}</Panel></div>; }

function NotificationsView({ notifications, setNotifications, notify }) { const [form,setForm]=useState({title:'',message:'',type:'info'}); const send=async e=>{e.preventDefault();try{const r=await createNotification(form);setNotifications(prev=>[r.data,...prev]);setForm({title:'',message:'',type:'info'});notify('Notification broadcast successfully')}catch(err){notify(err.response?.data?.msg||'Notification failed')}}; return <div className="two-col"><Panel title="Create Notification" subtitle="Send an update to connected users"><form className="form" onSubmit={send}><input required placeholder="Notification title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea required placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="info">Information</option><option value="warning">Warning</option><option value="success">Success</option><option value="report">Report</option></select><button className="primary">Send Notification</button></form></Panel><Panel title="Notification History" subtitle={`${notifications.length} notifications`}><div className="notification-list">{notifications.map(n=><div className="notification-card" key={n._id}><span>{n.type==='warning'?'⚠':n.type==='success'?'✓':'🔔'}</span><div><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div></div>)}{!notifications.length&&<Empty text="No notifications yet."/>}</div></Panel></div>; }

function ProfileView({ admin, setAdmin, notify }) { const [form,setForm]=useState({name:admin.name||'',email:admin.email||'',currentPassword:'',newPassword:''}); useEffect(()=>setForm(f=>({...f,name:admin.name||'',email:admin.email||''})),[admin]); const save=async e=>{e.preventDefault();try{const r=await updateAdminProfile(form);setAdmin(r.data);localStorage.setItem('userName',r.data.name);localStorage.setItem('userEmail',r.data.email);setForm(f=>({...f,currentPassword:'',newPassword:''}));notify('Profile updated')}catch(err){notify(err.response?.data?.msg||'Profile update failed')}}; return <div className="profile-card"><div className="profile-hero"><div className="avatar">🛡️</div><div><h2>{admin.name||'Admin'}</h2><p>{admin.email}</p><span>Administrator</span></div></div><form className="form profile-form" onSubmit={save}><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><div className="form-grid"><label>Current password<input type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label><label>New password<input type="password" minLength="6" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label></div><button className="primary">Save Profile</button></form></div>; }

const styles = `
*{box-sizing:border-box}.admin-shell{min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif}.admin-topbar{height:72px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;padding:0 28px;position:sticky;top:0;z-index:1000}.brand{display:flex;align-items:center;gap:10px;cursor:pointer}.brand img{width:42px;height:42px;object-fit:contain}.brand strong{display:block;color:#2563eb;font-size:20px}.brand small{display:block;color:#64748b;font-size:10px}.mobile-menu{display:none;border:0;background:none;font-size:20px}.top-actions{display:flex;align-items:center;gap:18px}.live-dot{font-size:11px;color:#16a34a}.icon-btn{position:relative;border:0;background:#f1f5f9;border-radius:50%;width:38px;height:38px;cursor:pointer}.icon-btn b{position:absolute;right:-3px;top:-3px;background:#ef4444;color:#fff;border-radius:50%;font-size:9px;padding:3px 5px}.admin-mini{display:flex;align-items:center;gap:8px}.admin-mini>span{background:#dbeafe;border-radius:50%;padding:9px}.admin-mini strong,.admin-mini small{display:block}.admin-mini small{font-size:10px;color:#64748b}.logout{border:1px solid #fecaca;background:#fff;color:#dc2626;padding:8px 13px;border-radius:8px;cursor:pointer}.admin-body{display:flex;min-height:calc(100vh - 72px)}.sidebar{width:245px;background:#fff;border-right:1px solid #e2e8f0;padding:22px 14px;flex-shrink:0}.side-title{font-size:10px;color:#94a3b8;letter-spacing:1px;font-weight:bold;padding:8px 12px}.side-item{width:100%;border:0;background:transparent;color:#64748b;padding:12px;border-radius:9px;display:flex;gap:12px;align-items:center;text-align:left;cursor:pointer;margin:3px 0}.side-item:hover{background:#eff6ff;color:#2563eb}.side-item.active{background:#2563eb;color:#fff}.side-item em{margin-left:auto;background:#ef4444;color:#fff;border-radius:20px;padding:3px 7px;font-size:10px;font-style:normal}.side-divider{height:1px;background:#e2e8f0;margin:20px 0}.danger{color:#dc2626}.admin-main{flex:1;padding:32px;max-width:1500px;width:100%;margin:auto}.page-heading{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:25px}.page-heading>div>span{font-size:10px;color:#2563eb;letter-spacing:1px;font-weight:bold}.page-heading h1{margin:5px 0;font-size:29px}.page-heading p{margin:0;color:#64748b}.loading{font-size:12px;color:#64748b}.toast{position:fixed;right:25px;bottom:25px;background:#0f172a;color:#fff;padding:13px 18px;border-radius:10px;z-index:2000;box-shadow:0 8px 25px #0002}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:20px}.stat,.panel,.profile-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px}.stat{padding:20px}.stat-icon{width:42px;height:42px;background:#eff6ff;color:#2563eb;border-radius:10px;display:grid;place-items:center}.stat h2{font-size:29px;margin:15px 0 2px}.stat strong,.stat small{display:block}.stat small{color:#94a3b8;font-size:11px;margin-top:4px}.two-col{display:grid;grid-template-columns:1.35fr 1fr;gap:20px;margin-bottom:20px}.panel{padding:22px;margin-bottom:20px}.panel-head{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:18px}.panel-head h3{margin:0 0 4px}.panel-head p{margin:0;color:#94a3b8;font-size:12px}.link-btn{border:0;background:none;color:#2563eb;font-weight:bold;cursor:pointer}.quick{width:100%;border:0;background:#f8fafc;border-radius:10px;padding:13px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;margin:8px 0}.quick:hover{background:#eff6ff}.quick>span{font-size:20px}.quick div{flex:1}.quick strong,.quick small{display:block}.quick small{font-size:10px;color:#94a3b8;margin-top:3px}.mini-table{width:100%;overflow:auto}.tr{display:grid;grid-template-columns:1.1fr 1.7fr 1fr 1fr;gap:12px;align-items:center;padding:13px 5px;border-top:1px solid #f1f5f9;font-size:12px;min-width:680px}.tr.th{font-weight:bold;color:#64748b;border-top:0}.tr span small{display:block;color:#94a3b8;margin-top:3px}.row-actions{display:flex;gap:8px}.row-actions button,.danger-text{border:0;background:none;color:#2563eb;cursor:pointer}.danger-text{color:#dc2626!important}.form{display:flex;flex-direction:column;gap:12px}.form input,.form select,.form textarea,.search,.profile-form input{width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:9px;outline:none;font:inherit}.form textarea{min-height:120px;resize:vertical}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.primary,.secondary,.outline-btn{padding:11px 15px;border-radius:9px;cursor:pointer;font-weight:bold}.primary{background:#2563eb;color:#fff;border:0}.secondary{background:#fff;color:#334155;border:1px solid #cbd5e1}.outline-btn{margin-left:12px;background:#fff;color:#2563eb;border:1px solid #bfdbfe}.search{margin-bottom:15px}.status{display:inline-block;padding:5px 9px;border-radius:20px;font-size:10px;font-weight:bold;background:#e2e8f0;color:#475569}.status.active,.status.resolved{background:#dcfce7;color:#15803d}.status.pending,.status.delayed{background:#ffedd5;color:#c2410c}.status.in-progress{background:#dbeafe;color:#1d4ed8}.status.rejected,.status.inactive{background:#fee2e2;color:#b91c1c}.report-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid #f1f5f9}.report-row>div{flex:1}.report-row strong,.report-row small{display:block}.report-row small{color:#64748b;font-size:10px;margin-top:3px}.report-symbol{width:36px;height:36px;background:#fff7ed;color:#ea580c;border-radius:9px;display:grid;place-items:center}.empty{text-align:center;padding:30px;color:#94a3b8}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px}.filters button{border:1px solid #e2e8f0;background:#fff;padding:8px 12px;border-radius:20px;cursor:pointer}.filters button.selected{background:#2563eb;color:#fff;border-color:#2563eb}.report-list{display:flex;flex-direction:column;gap:10px}.report-card{border:1px solid #e2e8f0;border-radius:12px;padding:15px;display:flex;justify-content:space-between;align-items:center;gap:15px}.report-main{display:flex;align-items:center;gap:12px}.report-symbol.large{width:42px;height:42px}.report-card h4{margin:0 0 4px}.report-card p,.report-card small{margin:0;color:#64748b;font-size:11px}.tracking-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px}.map-wrap{height:500px;border-radius:12px;overflow:hidden}.detail{margin-top:18px;background:#f8fafc;padding:15px;border-radius:12px}.detail h3{margin:0}.profile-card{padding:28px;max-width:850px}.profile-hero{display:flex;gap:15px;align-items:center;padding-bottom:25px;border-bottom:1px solid #e2e8f0;margin-bottom:25px}.avatar{width:64px;height:64px;border-radius:50%;background:#dbeafe;display:grid;place-items:center;font-size:27px}.profile-hero h2{margin:0}.profile-hero p{margin:4px 0;color:#64748b}.profile-hero span{font-size:11px;color:#2563eb;font-weight:bold}.modal-backdrop{position:fixed;inset:0;background:#0f172a66;display:grid;place-items:center;z-index:3000;padding:20px}.modal{background:#fff;width:min(500px,100%);border-radius:15px;padding:25px}.modal h3{margin-top:0}.modal label{display:block;font-size:12px;font-weight:bold;margin:13px 0}.modal select,.modal textarea{display:block;width:100%;margin-top:6px;padding:10px;border:1px solid #cbd5e1;border-radius:8px}.modal textarea{min-height:100px}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}
@media(max-width:1050px){.stats-grid{grid-template-columns:repeat(2,1fr)}.two-col,.tracking-grid{grid-template-columns:1fr}}@media(max-width:800px){.mobile-menu{display:block}.sidebar{position:fixed;left:-260px;top:72px;height:calc(100vh - 72px);z-index:1500;transition:.25s}.sidebar.open{left:0}.admin-main{padding:20px 15px}.top-actions .live-dot,.admin-mini{display:none}}@media(max-width:600px){.stats-grid{grid-template-columns:1fr}.admin-topbar{padding:0 15px}.logout{padding:7px 9px}.form-grid{grid-template-columns:1fr}.page-heading h1{font-size:23px}.report-card{align-items:flex-start;flex-direction:column}}
`;

export default AdminDashboard;
