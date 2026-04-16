"use client";
import { useState, useEffect, useCallback } from "react";

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  const [nextMs, setNextMs] = useState(14400000);

  useEffect(() => {
    fetch("/api/history").then(r=>r.json()).then(d=>{
      if(d.lastScan){ setCoins(d.lastScan.coins); setLastScan(new Date(d.lastScan.timestamp)); }
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNextMs(p => p<=1000 ? 14400000 : p-1000), 1000);
    return () => clearInterval(t);
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true); setError(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCoins(data.coins);
      setLastScan(new Date(data.timestamp));
      setNextMs(14400000);
    } catch(e) { setError(e.message); }
    finally { setScanning(false); }
  }, []);

  const m = Math.floor(nextMs/60000);
  const s = Math.floor((nextMs%60000)/1000);

  return (
    <div style={{minHeight:"100vh",background:"#020817",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",padding:"24px 16px"}}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{maxWidth:780,margin:"0 auto"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:22,color:"#f1f5f9"}}>
              ALPHA<span style={{color:"#7c3aed"}}>BOT</span>
            </div>
            <div style={{fontSize:11,color:"#475569",letterSpacing:"0.1em"}}>CRYPTO INTELLIGENCE SCANNER</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"center",background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"8px 16px"}}>
              <div style={{fontFamily:"'Space Mono',monospace",color:"#7c3aed",fontSize:14,fontWeight:700}}>
                {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
              </div>
              <div style={{fontSize:10,color:"#475569"}}>next auto-scan</div>
            </div>
            <button onClick={runScan} disabled={scanning} style={{
              background:scanning?"#1e293b":"linear-gradient(135deg,#7c3aed,#6d28d9)",
              color:"#fff",border:"none",borderRadius:12,padding:"12px 20px",
              fontWeight:700,fontSize:13,cursor:scanning?"not-allowed":"pointer",
              display:"flex",alignItems:"center",gap:8
            }}>
              {scanning
                ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span> SCANNING...</>
                : "⚡ SCAN NOW"}
            </button>
          </div>
        </div>

        {/* Telegram notice */}
        <div style={{background:"#0c1a3a",border:"1px solid #1d4ed8",borderRadius:12,padding:"14px 18px",marginBottom:20,fontSize:13,color:"#93c5fd"}}>
          📱 <strong style={{color:"#60a5fa"}}>Telegram notifications active</strong> — auto-scans fire every 4 hours and results go straight to your phone!
        </div>

        {error && (
          <div style={{background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:12,padding:14,marginBottom:20,color:"#fca5a5",fontSize:13}}>
            ⚠️ {error}
          </div>
        )}

        {/* Scanning */}
        {scanning && (
          <div style={{background:"#0f172a",borderRadius:20,border:"1px solid #334155",padding:"40px 20px",textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:40,marginBottom:16,animation:"pulse 1s ease infinite"}}>⚡</div>
            <div style={{fontFamily:"'Space Mono',monospace",color:"#7c3aed",fontSize:15,marginBottom:12}}>AI SCANNING MARKETS...</div>
            {["🔍 Checking Binance, Bybit, OKX...","📡 Sweeping Pump.fun & Raydium...","🐋 Tracking whale wallets...","🧠 Scoring signals...","📱 Preparing Telegram message..."].map((t,i)=>(
              <div key={i} style={{color:"#475569",fontSize:12,marginBottom:6,animation:`pulse 1.5s ${i*0.3}s ease infinite`}}>{t}</div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!scanning && coins.length===0 && (
          <div style={{textAlign:"center",padding:"60px 20px",background:"#0f172a",borderRadius:20,border:"1px dashed #334155"}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <div style={{fontFamily:"'Space Mono',monospace",color:"#f1f5f9",fontSize:18,fontWeight:700,marginBottom:8}}>Ready to Hunt Alpha</div>
            <div style={{color:"#64748b",fontSize:14,maxWidth:360,margin:"0 auto",lineHeight:1.6}}>
              Tap <strong style={{color:"#7c3aed"}}>SCAN NOW</strong> to sweep all CEXs, DEXs and whale wallets. Results also sent to Telegram!
            </div>
          </div>
        )}

        {/* Coin cards */}
        {!scanning && coins.length>0 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>
              📅 Last scan: {lastScan?.toLocaleString()} · {coins.length} coins found
            </div>
            {[...coins].sort((a,b)=>(b.score||0)-(a.score||0)).map((coin,i)=>(
              <CoinCard key={i} coin={coin} idx={i}/>
            ))}
          </div>
        )}

        <div style={{marginTop:32,padding:"14px 18px",background:"#0f172a",borderRadius:12,border:"1px solid #1e293b",fontSize:11,color:"#475569",textAlign:"center"}}>
          ⚠️ Not financial advice. Always DYOR. Never invest more than you can afford to lose.
        </div>
      </div>
    </div>
  );
}

function CoinCard({ coin, idx }) {
  const [expanded, setExpanded] = useState(false);
  const colors = {
    "Meme":"#ff6b35","AI":"#7c3aed","AI Infrastructure":"#7c3aed",
    "RWA":"#059669","GameFi":"#0ea5e9","DePIN":"#d97706"
  };
  const bg = Object.entries(colors).find(([k])=>coin.narrative?.includes(k))?.[1] || "#334155";
  const isPos = coin.priceChange24h?.startsWith("+");

  return (
    <div onClick={()=>setExpanded(!expanded)} style={{
      background:"linear-gradient(135deg,#0f172a,#1e293b)",
      border:"1px solid #334155",borderRadius:16,padding:"18px 20px",
      cursor:"pointer",position:"relative",overflow:"hidden",
      animation:`slideIn 0.4s ${idx*0.07}s ease both`
    }}>
      <div style={{position:"absolute",top:0,left:0,background:"#7c3aed",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderBottomRightRadius:10}}>#{idx+1}</div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${bg},#0f172a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
          {coin.symbol?.slice(0,3)}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{coin.symbol}</span>
            <span style={{background:bg,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{coin.narrative}</span>
            <span style={{background:"#0f172a",color:"#94a3b8",fontSize:10,padding:"2px 8px",borderRadius:20,border:"1px solid #334155"}}>{coin.chain}</span>
          </div>
          <div style={{color:"#64748b",fontSize:12,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{coin.name} · {coin.source}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{color:"#f1f5f9",fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700}}>{coin.price}</div>
          <div style={{color:isPos?"#22c55e":"#ef4444",fontSize:12,fontWeight:600}}>{coin.priceChange24h}</div>
        </div>
        <div style={{background:"#0f172a",borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${coin.score>=80?"#22c55e":coin.score>=60?"#eab308":"#ef4444"}`}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,color:coin.score>=80?"#22c55e":coin.score>=60?"#eab308":"#ef4444"}}>{coin.score}</span>
        </div>
      </div>
      <div style={{marginTop:12,padding:"10px 12px",background:"#0f172a",borderRadius:10,borderLeft:`3px solid ${bg}`,fontSize:12,color:"#cbd5e1",lineHeight:1.5}}>
        ⚡ {coin.whyNow}
      </div>
      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
        {(coin.signals||[]).map((s,i)=>(
          <span key={i} style={{background:"#1e3a5f",color:"#93c5fd",fontSize:10,padding:"3px 8px",borderRadius:20}}>• {s}</span>
        ))}
      </div>
      {expanded && (
        <div style={{marginTop:14,borderTop:"1px solid #1e293b",paddingTop:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            {[["Market Cap",coin.marketCap],["Potential",coin.potentialMultiple],["Risk",coin.riskLevel]].map(([k,v])=>(
              <div key={k} style={{background:"#0f172a",padding:10,borderRadius:10,textAlign:"center"}}>
                <div style={{color:"#64748b",fontSize:10,marginBottom:4}}>{k}</div>
                <div style={{color:"#f1f5f9",fontSize:13,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#0f172a",padding:"10px 12px",borderRadius:10,fontSize:12,color:"#fbbf24",lineHeight:1.5}}>
            🎯 <strong>Entry:</strong> {coin.entryNote}
          </div>
        </div>
      )}
    </div>
  );
                       }
