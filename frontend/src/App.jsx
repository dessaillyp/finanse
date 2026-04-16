// ─────────────────────────────────────────────────────────────────────────────
// Finanse — Full App (Frontend + Backend integration)
// Conecta con Express API en http://localhost:3000/api/v1
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useCallback, useRef } = React;

// ── Config ────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000/api/v1';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n||0);
const shortDate = d => new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short'});
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CAT_COLORS = {housing:'#5e5ce6',food:'#30b0c7',transport:'#32ade6',health:'#34c759',entertainment:'#ff9f0a',education:'#bf5af2',clothing:'#ff6b81',utilities:'#8e8e93',savings:'#30d158',other:'#ff3b30'};
const CAT_ES = {housing:'Vivienda',food:'Alimentación',transport:'Transporte',health:'Salud',entertainment:'Ocio',education:'Educación',clothing:'Ropa',utilities:'Servicios',savings:'Ahorro',other:'Otros'};
const SRC_ES = {salary:'Salario',freelance:'Freelance',investment:'Inversión',rental:'Renta',gift:'Regalo',other:'Otro'};
const SRC_ICONS = {salary:'💼',freelance:'💻',investment:'📈',rental:'🏠',gift:'🎁',other:'💰'};

// ── API client ────────────────────────────────────────────────────────────────
async function apiFetch(method, path, body = null, params = {}) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(params).forEach(([k,v]) => { if(v!=null&&v!=='') url.searchParams.set(k,v); });
  const opts = { method, headers:{'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  const res = await fetch(url.toString(), opts);
  const data = await res.json();
  if(!res.ok) { const e=new Error(data.message||'Error'); e.errors=data.errors; throw e; }
  return data.data;
}

// ── useFinance hook ───────────────────────────────────────────────────────────
function useFinance() {
  const now = new Date();
  const [year,setYear]   = useState(now.getFullYear());
  const [month,setMonth] = useState(now.getMonth()+1);
  const [summary,setSummary]   = useState(null);
  const [income,setIncome]     = useState([]);
  const [expenses,setExpenses] = useState([]);
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState(null);
  const [status,setStatus]     = useState('loading'); // 'ok'|'error'|'loading'

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s,inc,exp] = await Promise.all([
        apiFetch('GET','/summary',null,{year,month}),
        apiFetch('GET','/income',null,{year,month,limit:100}),
        apiFetch('GET','/expenses',null,{year,month,limit:100}),
      ]);
      setSummary(s); setIncome(inc.records||[]); setExpenses(exp.records||[]);
      setStatus('ok');
    } catch(e) { setError(e.message); setStatus('error'); }
    finally { setLoading(false); }
  }, [year,month]);

  useEffect(()=>{ fetchAll(); },[fetchAll]);

  const addIncome  = async b => { await apiFetch('POST','/income',b);   await fetchAll(); };
  const addExpense = async b => { await apiFetch('POST','/expenses',b); await fetchAll(); };
  const removeIncome  = async id => { await apiFetch('DELETE',`/income/${id}`);   await fetchAll(); };
  const removeExpense = async id => { await apiFetch('DELETE',`/expenses/${id}`); await fetchAll(); };

  const prevMonth = () => { if(month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1); };

  return { year,month,prevMonth,nextMonth,summary,income,expenses,loading,error,status,refresh:fetchAll,addIncome,addExpense,removeIncome,removeExpense };
}

// ── PieChart component ────────────────────────────────────────────────────────
function PieChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if(!canvasRef.current) return;
    if(chartRef.current) chartRef.current.destroy();
    if(!data||!data.length) return;
    chartRef.current = new Chart(canvasRef.current, {
      type:'doughnut',
      data:{
        labels: data.map(c=>CAT_ES[c.category]||c.category),
        datasets:[{ data:data.map(c=>c.total), backgroundColor:data.map(c=>CAT_COLORS[c.category]||'#8e8e93'), borderWidth:2, borderColor:'#fff', hoverOffset:4 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'64%', plugins:{legend:{display:false}}, animation:{duration:700,easing:'easeInOutQuart'} }
    });
    return ()=>{ if(chartRef.current) chartRef.current.destroy(); };
  },[data]);
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />;
}

// ── Modal component ───────────────────────────────────────────────────────────
function Modal({ title, onClose, onSubmit, submitLabel, submitColor, children }) {
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>{title}</span>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        {children}
        <div style={S.modalBtns}>
          <button onClick={onClose} style={S.btnCancel}>Cancelar</button>
          <button onClick={onSubmit} style={{...S.btnSubmit, background:submitColor}}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const fin = useFinance();
  const [showAddIncome,  setShowAddIncome]  = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [formError, setFormError] = useState('');

  // Income form state
  const [incAmount,setIncAmount] = useState('');
  const [incDesc,  setIncDesc]   = useState('');
  const [incSource,setIncSource] = useState('salary');
  const [incDate,  setIncDate]   = useState(new Date().toISOString().split('T')[0]);

  // Expense form state
  const [expAmount,setExpAmount] = useState('');
  const [expDesc,  setExpDesc]   = useState('');
  const [expCat,   setExpCat]    = useState('housing');
  const [expDate,  setExpDate]   = useState(new Date().toISOString().split('T')[0]);
  const [expSaving,setExpSaving] = useState(false);
  const [incSaving,setIncSaving] = useState(false);

  const summary = fin.summary?.summary || {};
  const byCategory = fin.summary?.expenses?.byCategory || [];
  const totalExpenses = fin.summary?.summary?.totalExpenses || 1;

  const allTx = [
    ...fin.income.map(t=>({...t,_type:'income'})),
    ...fin.expenses.map(t=>({...t,_type:'expense'})),
  ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,15);

  const handleAddIncome = async () => {
    if(!incAmount||!incDesc){ setFormError('Completa todos los campos'); return; }
    setIncSaving(true); setFormError('');
    try {
      await fin.addIncome({amount:parseFloat(incAmount),description:incDesc,source:incSource,date:incDate});
      setShowAddIncome(false); setIncAmount(''); setIncDesc('');
    } catch(e){ setFormError(e.message); }
    finally{ setIncSaving(false); }
  };

  const handleAddExpense = async () => {
    if(!expAmount||!expDesc){ setFormError('Completa todos los campos'); return; }
    setExpSaving(true); setFormError('');
    try {
      await fin.addExpense({amount:parseFloat(expAmount),description:expDesc,category:expCat,date:expDate});
      setShowAddExpense(false); setExpAmount(''); setExpDesc('');
    } catch(e){ setFormError(e.message); }
    finally{ setExpSaving(false); }
  };

  const statusBadge = {
    ok:      { bg:'#dcfce7', color:'#15803d', text:'● Conectado'   },
    error:   { bg:'#fee2e2', color:'#b91c1c', text:'● Sin conexión' },
    loading: { bg:'#f3f4f6', color:'#6b7280', text:'○ Cargando...' },
  }[fin.status];

  return (
    <div style={S.app}>
      {/* ── Topbar ── */}
      <header style={S.topbar}>
        <div style={S.topLeft}>
          <span style={S.logo}>Finanse</span>
          <div style={S.monthNav}>
            <button style={S.navBtn} onClick={fin.prevMonth}>‹</button>
            <span style={S.monthLabel}>{MONTHS[fin.month-1]} {fin.year}</span>
            <button style={S.navBtn} onClick={fin.nextMonth}>›</button>
          </div>
        </div>
        <div style={S.topRight}>
          <span style={{...S.statusBadge, background:statusBadge.bg, color:statusBadge.color}}>{statusBadge.text}</span>
          <button style={S.btnIncome} onClick={()=>{setFormError('');setShowAddIncome(true);}}>+ Ingreso</button>
          <button style={S.btnExpense} onClick={()=>{setFormError('');setShowAddExpense(true);}}>+ Gasto</button>
        </div>
      </header>

      {/* ── Error bar ── */}
      {fin.error && (
        <div style={S.errorBar}>
          ⚠ No se pudo conectar al backend ({API_URL}) — {fin.error}
        </div>
      )}

      <main style={S.main}>
        {/* ── KPI Grid ── */}
        <div style={S.kpiGrid}>
          <div style={{...S.kpi,...S.kpiIncome}}>
            <div style={{...S.kpiLabel,color:'#1a7a3c'}}><span style={{...S.dot,background:'#34c759'}}/>Ingresos</div>
            <div style={S.kpiAmount}>{fin.loading ? '...' : fmt(summary.totalIncome)}</div>
            <div style={S.kpiSub}>Este período · {fin.income.length} registros</div>
            <span style={{...S.badge,background:'#dcfce7',color:'#15803d'}}>↑ {summary.savingsRate||0}% tasa de ahorro</span>
          </div>
          <div style={{...S.kpi,...S.kpiExpense}}>
            <div style={{...S.kpiLabel,color:'#b91c1c'}}><span style={{...S.dot,background:'#ff3b30'}}/>Gastos</div>
            <div style={{...S.kpiAmount,color:'#b91c1c'}}>{fin.loading ? '...' : fmt(summary.totalExpenses)}</div>
            <div style={S.kpiSub}>Este período · {fin.expenses.length} transacciones</div>
            <span style={{...S.badge,background:'#fee2e2',color:'#b91c1c'}}>
              {byCategory[0] ? `Mayor: ${CAT_ES[byCategory[0].category]}` : '—'}
            </span>
          </div>
          <div style={{...S.kpi,...S.kpiBalance}}>
            <div style={{...S.kpiLabel,color:'#9ca3af'}}><span style={{...S.dot,background:'#8e8e93'}}/>Balance</div>
            <div style={{...S.kpiAmount,color:'#f5f5f7'}}>{fin.loading ? '...' : fmt(summary.balance)}</div>
            <div style={{...S.kpiSub,color:'#636366'}}>{summary.savingsRate||0}% ahorrado del ingreso</div>
            <span style={{...S.badge, background: summary.status==='positive'?'#166534':'#7f1d1d', color: summary.status==='positive'?'#86efac':'#fca5a5'}}>
              {summary.status==='positive' ? '✓ Saldo positivo' : '⚠ Saldo negativo'}
            </span>
          </div>
        </div>

        {/* ── Bottom Grid ── */}
        <div style={S.bottomGrid}>
          {/* Transactions */}
          <div style={S.card}>
            <div style={S.cardTitle}>Últimas transacciones</div>
            {fin.loading
              ? <div style={S.empty}>Cargando...</div>
              : !allTx.length
                ? <div style={S.empty}>Sin transacciones este mes</div>
                : <div style={S.txList}>
                    {allTx.map(t => {
                      const isInc = t._type==='income';
                      const color = isInc ? '#34c759' : (CAT_COLORS[t.category]||'#ff3b30');
                      const icon  = isInc ? (SRC_ICONS[t.source]||'💰') : '•';
                      const label = t.description || (isInc ? SRC_ES[t.source] : CAT_ES[t.category]) || '—';
                      const meta  = isInc ? (SRC_ES[t.source]||t.source) : (CAT_ES[t.category]||t.category);
                      return (
                        <div key={t._id} style={S.txItem} className="tx-item">
                          <div style={{...S.txIcon,background:color+'22',color,fontSize:15}}>{icon}</div>
                          <div style={S.txBody}>
                            <div style={S.txName}>{label}</div>
                            <div style={S.txMeta}>{meta} · {shortDate(t.date)}</div>
                          </div>
                          <div style={{...S.txAmount,color:isInc?'#1a7a3c':'#b91c1c'}}>
                            {isInc?'+':'−'}{fmt(t.amount)}
                          </div>
                          <button
                            style={S.txDel}
                            title="Eliminar"
                            onClick={()=>{ if(confirm('¿Eliminar?')) isInc ? fin.removeIncome(t._id) : fin.removeExpense(t._id); }}
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
            }
          </div>

          {/* Pie Chart */}
          <div style={S.card}>
            <div style={S.cardTitle}>Distribución de gastos</div>
            {!byCategory.length
              ? <div style={S.empty}>Sin gastos este mes</div>
              : <div style={{display:'flex',alignItems:'center',gap:'1rem',marginTop:4}}>
                  <div style={{width:130,height:130,flexShrink:0}}>
                    <PieChart data={byCategory} />
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    {byCategory.slice(0,6).map(c => (
                      <div key={c.category} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:12}}>
                        <span style={{width:10,height:10,borderRadius:2,background:CAT_COLORS[c.category]||'#8e8e93',flexShrink:0}}/>
                        <span style={{flex:1,color:'#6e6e73',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{CAT_ES[c.category]||c.category}</span>
                        <span style={{fontWeight:500}}>{c.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
            }
          </div>
        </div>
      </main>

      {/* ── Add Income Modal ── */}
      {showAddIncome && (
        <Modal title="Nuevo ingreso" onClose={()=>setShowAddIncome(false)} onSubmit={handleAddIncome}
          submitLabel={incSaving?'Guardando...':'Guardar ingreso'} submitColor="#1a7a3c">
          {formError && <div style={S.formErr}>{formError}</div>}
          <Field label="Monto (MXN)"><input style={S.input} type="number" value={incAmount} onChange={e=>setIncAmount(e.target.value)} placeholder="5000" min="0.01" step="0.01"/></Field>
          <Field label="Descripción"><input style={S.input} type="text" value={incDesc} onChange={e=>setIncDesc(e.target.value)} placeholder="Salario mensual"/></Field>
          <Field label="Fuente">
            <select style={S.input} value={incSource} onChange={e=>setIncSource(e.target.value)}>
              {Object.entries(SRC_ES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Fecha"><input style={S.input} type="date" value={incDate} onChange={e=>setIncDate(e.target.value)}/></Field>
        </Modal>
      )}

      {/* ── Add Expense Modal ── */}
      {showAddExpense && (
        <Modal title="Nuevo gasto" onClose={()=>setShowAddExpense(false)} onSubmit={handleAddExpense}
          submitLabel={expSaving?'Guardando...':'Guardar gasto'} submitColor="#b91c1c">
          {formError && <div style={S.formErr}>{formError}</div>}
          <Field label="Monto (MXN)"><input style={S.input} type="number" value={expAmount} onChange={e=>setExpAmount(e.target.value)} placeholder="500" min="0.01" step="0.01"/></Field>
          <Field label="Descripción"><input style={S.input} type="text" value={expDesc} onChange={e=>setExpDesc(e.target.value)} placeholder="Renta departamento"/></Field>
          <Field label="Categoría">
            <select style={S.input} value={expCat} onChange={e=>setExpCat(e.target.value)}>
              {Object.entries(CAT_ES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Fecha"><input style={S.input} type="date" value={expDate} onChange={e=>setExpDate(e.target.value)}/></Field>
        </Modal>
      )}
    </div>
  );
}

function Field({label,children}){
  return <div style={{marginBottom:12}}>
    <label style={{fontSize:11,color:'#6e6e73',display:'block',marginBottom:4}}>{label}</label>
    {children}
  </div>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  app:{minHeight:'100vh',background:'#f5f5f7'},
  topbar:{background:'#fff',borderBottom:'0.5px solid #e5e5ea',padding:'0 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:52,position:'sticky',top:0,zIndex:10},
  topLeft:{display:'flex',alignItems:'center',gap:12},
  topRight:{display:'flex',alignItems:'center',gap:8},
  logo:{fontSize:16,fontWeight:500,letterSpacing:'-0.3px'},
  monthNav:{display:'flex',alignItems:'center',gap:8},
  navBtn:{background:'none',border:'0.5px solid #e5e5ea',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'},
  monthLabel:{fontSize:13,fontWeight:500,minWidth:130,textAlign:'center'},
  statusBadge:{fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:500},
  btnIncome:{fontSize:12,fontWeight:500,padding:'6px 14px',borderRadius:6,cursor:'pointer',background:'#f0faf4',border:'0.5px solid #c3e9d0',color:'#1a7a3c'},
  btnExpense:{fontSize:12,fontWeight:500,padding:'6px 14px',borderRadius:6,cursor:'pointer',background:'#fff5f5',border:'0.5px solid #fecaca',color:'#b91c1c'},
  errorBar:{background:'#fef2f2',border:'0.5px solid #fecaca',padding:'8px 1.25rem',fontSize:12,color:'#b91c1c'},
  main:{padding:'1.25rem',maxWidth:920,margin:'0 auto'},
  kpiGrid:{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12,marginBottom:12},
  kpi:{background:'#fff',border:'0.5px solid #e5e5ea',borderRadius:14,padding:'1rem 1.25rem',transition:'transform .2s'},
  kpiIncome:{background:'#f0faf4',borderColor:'#c3e9d0'},
  kpiExpense:{background:'#fff5f5',borderColor:'#fecaca'},
  kpiBalance:{background:'#1c1c1e',borderColor:'#3a3a3c'},
  kpiLabel:{fontSize:11,fontWeight:500,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:6},
  dot:{width:7,height:7,borderRadius:'50%',flexShrink:0,display:'inline-block'},
  kpiAmount:{fontSize:28,fontWeight:500,letterSpacing:'-.6px',lineHeight:1},
  kpiSub:{fontSize:11,color:'#8e8e93',marginTop:4},
  badge:{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:20,marginTop:6},
  bottomGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12},
  card:{background:'#fff',border:'0.5px solid #e5e5ea',borderRadius:14,padding:'1rem 1.25rem'},
  cardTitle:{fontSize:11,fontWeight:500,letterSpacing:'.05em',textTransform:'uppercase',color:'#8e8e93',marginBottom:12},
  txList:{maxHeight:240,overflowY:'auto',display:'flex',flexDirection:'column',gap:4},
  txItem:{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:8,cursor:'default'},
  txIcon:{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  txBody:{flex:1,minWidth:0},
  txName:{fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'},
  txMeta:{fontSize:11,color:'#8e8e93'},
  txAmount:{fontSize:13,fontWeight:500,flexShrink:0},
  txDel:{width:22,height:22,borderRadius:4,border:'none',background:'none',cursor:'pointer',color:'#b91c1c',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'},
  empty:{textAlign:'center',padding:'2rem',color:'#8e8e93',fontSize:13},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100},
  modal:{background:'#fff',borderRadius:16,padding:'1.5rem',width:340,border:'0.5px solid #e5e5ea'},
  modalHeader:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16},
  modalTitle:{fontSize:16,fontWeight:500},
  closeBtn:{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#8e8e93',lineHeight:1},
  input:{width:'100%',fontSize:14,padding:'8px 10px',borderRadius:8,border:'0.5px solid #d1d1d6',background:'#fff',outline:'none',color:'#1d1d1f'},
  modalBtns:{display:'flex',gap:8,marginTop:16},
  btnCancel:{flex:1,padding:9,borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',background:'#f5f5f7',border:'0.5px solid #e5e5ea',color:'#6e6e73'},
  btnSubmit:{flex:1,padding:9,borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',border:'none',color:'#fff'},
  formErr:{background:'#fef2f2',border:'0.5px solid #fecaca',borderRadius:8,padding:'8px 10px',fontSize:12,color:'#b91c1c',marginBottom:12},
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
