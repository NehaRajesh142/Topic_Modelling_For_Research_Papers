
let data=null,chart=null,cmp=null;
const $=x=>document.getElementById(x);
$("topics").oninput=()=>$("tv").textContent=$("topics").value;
async function run(){
 const r=await fetch("/api/model?topics="+$("topics").value);data=await r.json();
 render();$("count").textContent=data.papers.length;$("datasetCount").textContent=data.papers.length+" papers";
}
function render(){
 $("topicList").innerHTML=Object.entries(data.topics).map(([n,w])=>`<div class="topic" onclick="papers(${n})"><b>Topic ${n} — ${esc(data.topic_names[n])}</b><span>${data.counts[n]} papers</span><p>${w.join(" · ")}</p><strong class="topic-total">Total papers: ${data.counts[n]}</strong></div>`).join("");
 if(chart)chart.destroy();chart=new Chart($("dist"),{type:"bar",data:{labels:Object.keys(data.counts).map(x=>"Topic "+x),datasets:[{data:Object.values(data.counts),backgroundColor:"#245e55"}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0,color:"#c9d8d4",font:{size:13}},title:{display:true,text:"Number of Papers",color:"#dce9e5",font:{size:13,weight:"600"}}},x:{ticks:{color:"#c9d8d4",font:{size:13}}}},responsive:true,maintainAspectRatio:false}});
 $("overall").textContent=data.overall;
 $("qc").innerHTML='<div class="qcards">'+Object.entries(data.quality).map(([n,v])=>`<div class="qcard"><span>TOPIC ${n}</span><b>${v}</b><small>${v>=70?"Strong":v>=45?"Moderate":"Needs tuning"}</small></div>`).join("")+'</div>';
 let html='<table class="ht"><tr><th>TOPIC / YEAR</th>'+data.years.map(y=>`<th>${y}</th>`).join("")+'</tr>';
 Object.entries(data.heat).forEach(([t,vals])=>{let mx=Math.max(1,...vals);html+=`<tr><th>${esc(data.topic_names[t])}</th>`+vals.map(v=>`<td class="hc" style="background:rgba(36,94,85,${.12+.78*v/mx})">${v}</td>`).join("")+'</tr>'});$("heat").innerHTML=html+'</table>';
 papers(1);
}
function papers(t){document.querySelectorAll(".topic").forEach((x,i)=>x.classList.toggle("active",i===t-1));let ps=data.papers.filter(p=>p.topic==t);$("papers").innerHTML=ps.map(p=>`<article class="paper"><span class="meta">${p.year} · ${p.confidence}% confidence</span><div class="meta">TOPIC ${t}</div><h3>${esc(p.title)}</h3><p>${esc(p.abstract)}</p></article>`).join("")}
async function compare(){
 let a=[];for(let k=2;k<=8;k++){let r=await fetch("/api/model?topics="+k);let d=await r.json();a.push({k,q:d.overall})}
 if(cmp)cmp.destroy();cmp=new Chart($("compareChart"),{type:"line",data:{labels:a.map(x=>x.k+" topics"),datasets:[{label:"Quality",data:a.map(x=>x.q),borderColor:"#d56d50",tension:.25}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#dce9e5",font:{size:13}}}},scales:{y:{min:0,max:100,ticks:{color:"#c9d8d4",font:{size:13}}},x:{ticks:{color:"#c9d8d4",font:{size:13}}}}}});
 let b=a.reduce((x,y)=>y.q>x.q?y:x);$("best").innerHTML=`<b>Suggested:</b> ${b.k} topics produced the highest quality score (${b.q}). Always inspect the keywords before choosing the final model.`;
}
async function webSearch(){
 let q=$("webq").value.trim();if(!q)return;
 $("webResults").innerHTML="<p>Searching Crossref...</p>";
 let r=await fetch("/api/search-web?q="+encodeURIComponent(q)),d=await r.json();
 if(!r.ok){$("webResults").innerHTML="<p>"+esc(d.error)+"</p>";return}
 $("webResults").innerHTML=d.results.map((x,i)=>`<article class="webcard"><div class="meta">${x.year||"Year unavailable"} · ${x.doi||"No DOI"}</div><h3>${esc(x.title)}</h3><p>${esc(x.abstract.slice(0,700))}${x.abstract.length>700?"…":""}</p><div class="meta">${esc(x.author||"Author unavailable")}</div><button onclick='addWeb(${JSON.stringify(x).replace(/'/g,"&#39;")})'>ADD TO DATASET</button></article>`).join("")}
async function addWeb(x){
 let r=await fetch("/api/add-web",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(x)}),d=await r.json();
 if(!r.ok){alert(d.error);return} $("count").textContent=d.count;$("datasetCount").textContent=d.count+" papers";await run();
}
$("form").onsubmit=async e=>{e.preventDefault();let x={title:$("title").value,author:$("author").value,year:$("year").value,doi:$("doi").value,source:$("source").value,abstract:$("abstract").value};let r=await fetch("/api/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(x)}),d=await r.json();$("msg").textContent=r.ok?"Paper added. Model updated.":d.error;if(r.ok){e.target.reset();await run()}}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
run();
