import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createReport } from '../api';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ busNumber: '', issue: '', description: '', priority: 'Medium' });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  const submit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await createReport(form);
      setReports(prev => [r.data.report, ...prev]);
      setForm({ busNumber: '', issue: '', description: '', priority: 'Medium' });
      alert('Report submitted successfully. Admin has been notified.');
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not submit report');
    } finally { setLoading(false); }
  };

  return <div style={styles.page}><Navbar/><main style={styles.container}><div style={styles.hero}><span>APNIBUS SAFETY & SUPPORT</span><h1>Report a Bus Issue</h1><p>Tell us what is wrong. Your report will appear in the admin panel immediately.</p></div><div style={styles.grid}><form onSubmit={submit} style={styles.card}><label>Bus Number<input required value={form.busNumber} placeholder="e.g. APNI-101" onChange={e=>setForm({...form,busNumber:e.target.value})}/></label><label>Issue<select required value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})}><option value="">Select an issue</option><option>Bus delayed</option><option>Overcrowded bus</option><option>AC not working</option><option>Bus cleanliness</option><option>Unsafe driving</option><option>Route issue</option><option>Other</option></select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Description<textarea value={form.description} placeholder="Describe the issue…" onChange={e=>setForm({...form,description:e.target.value})}/></label><button disabled={loading} style={styles.button}>{loading?'Submitting…':'Submit Report'}</button></form><div style={styles.card}><h3>What happens next?</h3><div style={styles.step}><b>1</b><div><strong>Admin receives it</strong><p>Your report is stored in MongoDB and appears in the admin Reports section.</p></div></div><div style={styles.step}><b>2</b><div><strong>Status is updated</strong><p>The admin can mark it Pending, In Progress, Resolved or Rejected.</p></div></div><div style={styles.step}><b>3</b><div><strong>You get an update</strong><p>The system creates a notification whenever the report status changes.</p></div></div>{reports.length>0&&<div style={styles.success}>✓ Latest report submitted: {reports[0].busNumber}</div>}</div></div></main></div>;
};
const styles={page:{minHeight:'100vh',background:'#f8fafc'},container:{maxWidth:1050,margin:'0 auto',padding:'55px 20px'},hero:{marginBottom:30},heroSpan:{},grid:{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:22},card:{background:'#fff',border:'1px solid #e2e8f0',borderRadius:16,padding:25},button:{width:'100%',padding:13,border:0,borderRadius:9,background:'#2563eb',color:'#fff',fontWeight:'bold',cursor:'pointer'},step:{display:'flex',gap:12,margin:'18px 0'},success:{marginTop:20,padding:12,borderRadius:9,background:'#dcfce7',color:'#15803d'},};
export default ReportIssue;
