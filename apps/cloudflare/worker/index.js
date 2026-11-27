const ADMIN_HTML = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<meta name=\"theme-color\" content=\"#071b32\"><title>Wessali Operations</title>\n<link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css\">\n<style>\n:root{color-scheme:dark;--bg:#071629;--panel:#0d2036;--panel2:#112a45;--line:rgba(165,198,231,.12);--text:#eaf4ff;--muted:#8ca6c0;--blue:#3f9df2;--cyan:#63d5ef;--green:#47c6a0;--amber:#eab96c;--red:#ee7b88;--shadow:0 18px 45px rgba(0,0,0,.18)}\n*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font:14px Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}button,input,select{font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:wait}.hidden{display:none!important}\n.login-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 18% 0%,rgba(42,133,207,.24),transparent 42%),radial-gradient(ellipse at 100% 90%,rgba(47,181,190,.12),transparent 35%),var(--bg)}\n.login-card{width:min(100%,440px);padding:30px;border:1px solid var(--line);border-radius:24px;background:rgba(13,32,54,.94);box-shadow:var(--shadow)}\n.brand{display:flex;align-items:center;gap:12px;margin-bottom:25px}.brand-mark{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#2e8edc,#54c5ec);font-size:22px;font-weight:900;color:white;box-shadow:0 8px 22px rgba(49,147,219,.25)}.brand strong{display:block;font-size:17px;letter-spacing:.02em}.brand small{display:block;color:var(--muted);font-size:9px;letter-spacing:.2em;margin-top:3px}\n.eyebrow{font-size:10px;color:#71b8ed;letter-spacing:.19em;text-transform:uppercase;font-weight:800}.login-card h1{font-size:26px;margin:9px 0 8px}.sub{color:var(--muted);line-height:1.7;font-size:12px;margin:0 0 22px}.field{display:grid;gap:7px;margin:13px 0;color:#b8cde1;font-size:11px;font-weight:700}.field input{width:100%;min-height:45px;padding:11px 13px;border:1px solid rgba(165,198,231,.16);border-radius:12px;background:#081b30;color:var(--text);outline:none}.field input:focus{border-color:#4aa4ed;box-shadow:0 0 0 3px rgba(63,157,242,.12)}\n.btn{border:1px solid rgba(110,181,237,.24);border-radius:12px;padding:10px 14px;color:var(--text);background:rgba(62,145,216,.12);font-weight:750;font-size:11px;transition:transform .2s,border-color .2s,background .2s}.btn:hover{transform:translateY(-1px);border-color:rgba(111,193,249,.55);background:rgba(62,145,216,.2)}.btn.primary{background:linear-gradient(120deg,#2479bd,#2699ce);border-color:transparent;color:#fff}.btn.ghost{background:transparent}.btn.danger{color:#ffc3c8;border-color:rgba(238,123,136,.3);background:rgba(238,123,136,.08)}.wide{width:100%;min-height:46px;margin-top:14px}.notice{font-size:11px;color:var(--muted);line-height:1.7;margin-top:14px}.error{color:#ff9da7;font-size:12px;margin:10px 0}.success{color:#72dfbc;font-size:12px;margin:10px 0}\n.app{display:grid;grid-template-columns:232px minmax(0,1fr);min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:23px 16px;border-right:1px solid var(--line);background:#091b30;display:flex;flex-direction:column;z-index:3}.sidebar .brand{padding:0 7px 24px}.nav-label{margin:10px 10px 9px;color:#5f7d99;font-size:9px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}.nav{display:grid;gap:5px}.nav button{display:flex;align-items:center;gap:11px;width:100%;border:0;border-radius:11px;padding:12px 12px;background:transparent;color:#91abc4;text-align:left;font-size:12px;font-weight:680}.nav button .ico{width:20px;text-align:center;font-size:15px}.nav button.active{color:#eaf6ff;background:linear-gradient(90deg,rgba(48,139,207,.25),rgba(48,139,207,.06));box-shadow:inset 2px 0 #4fa7ed}.nav button:hover{background:rgba(70,148,210,.1)}.side-foot{margin-top:auto;padding:14px 10px;border-top:1px solid var(--line);color:var(--muted);font-size:10px;line-height:1.8}.online-dot{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:#4bd3a8;box-shadow:0 0 12px rgba(75,211,168,.6)}\n.main{min-width:0;padding:26px 30px 48px;max-width:1680px;width:100%;margin:0 auto}.topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}.topbar h1{font-size:25px;letter-spacing:-.04em;margin:5px 0 0}.topbar p{margin:0;color:var(--muted);font-size:11px}.top-actions{display:flex;align-items:center;gap:9px}.user-chip{border:1px solid var(--line);background:var(--panel);padding:9px 12px;border-radius:999px;color:#bbd2e8;font-size:11px}.refresh-indicator{color:var(--muted);font-size:10px}\n.page{display:none;animation:pagein .35s cubic-bezier(.2,.75,.25,1)}.page.active{display:block}@keyframes pagein{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}\n.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.kpi{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:17px;padding:17px 18px;background:linear-gradient(145deg,rgba(20,48,76,.96),rgba(12,31,52,.96));box-shadow:0 10px 26px rgba(0,0,0,.08)}.kpi:after{content:\"\";position:absolute;right:-32px;top:-45px;width:120px;height:120px;border-radius:50%;background:rgba(60,152,224,.08);filter:blur(2px)}.kpi label{display:block;color:var(--muted);font-size:10px;font-weight:700}.kpi strong{display:block;margin-top:11px;font-size:29px;letter-spacing:-.05em}.kpi small{display:block;margin-top:7px;color:#6e92b4;font-size:10px}.kpi .accent{color:#7dc4f6}\n.grid-2{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(270px,1fr);gap:14px;margin-top:14px}.panel{border:1px solid var(--line);border-radius:17px;padding:17px;background:linear-gradient(150deg,rgba(15,38,63,.98),rgba(11,29,49,.98));box-shadow:0 10px 28px rgba(0,0,0,.07);min-width:0}.panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}.panel-head h2{font-size:13px;margin:0}.panel-head p{font-size:10px;color:var(--muted);margin:5px 0 0}.chart-box{height:235px;position:relative}.chart-box.small{height:218px}.map-panel{margin-top:14px}.map{width:100%;height:420px;border-radius:13px;overflow:hidden;background:#102a42}.map .leaflet-container{background:#122f4a}.map-legend{display:flex;gap:14px;flex-wrap:wrap;color:#9bb4cc;font-size:10px}.legend-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}\n.table-panel{margin-top:15px;padding:0;overflow:hidden}.table-head{padding:16px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px}.table-head h2{font-size:13px;margin:0}.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.search{min-width:190px;min-height:35px;border:1px solid var(--line);background:#081b30;border-radius:9px;padding:8px 10px;color:var(--text);font-size:11px;outline:none}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:780px}th,td{padding:12px 15px;text-align:left;border-bottom:1px solid rgba(165,198,231,.08);font-size:10px;white-space:nowrap}th{font-size:9px;color:#7793ad;font-weight:850;text-transform:uppercase;letter-spacing:.1em;background:rgba(255,255,255,.012)}td{color:#bfd1e2}tr:last-child td{border-bottom:0}tbody tr:hover{background:rgba(59,140,205,.055)}.ref{color:#80c8f7;font-weight:800}.muted{color:#7692ad}.badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;background:rgba(85,169,229,.12);color:#93cdf7;font-size:9px;font-weight:800}.badge.green{background:rgba(71,198,160,.12);color:#72dfbc}.badge.amber{background:rgba(234,185,108,.12);color:#f0cb91}.badge.red{background:rgba(238,123,136,.12);color:#ffacb5}\n.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.provider-card{border:1px solid var(--line);border-radius:15px;background:var(--panel);padding:16px}.provider-card h3{font-size:13px;margin:0 0 5px}.provider-card p{font-size:10px;color:var(--muted);margin:0;line-height:1.6}.provider-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:10px}.actions{display:flex;gap:6px;flex-wrap:wrap}.empty{padding:38px 15px;text-align:center;color:var(--muted);font-size:11px}\n.modal{position:fixed;inset:0;background:rgba(2,9,18,.72);display:none;align-items:center;justify-content:center;padding:18px;z-index:20}.modal.open{display:flex}.modal-card{width:min(720px,100%);max-height:85vh;overflow:auto;border:1px solid var(--line);border-radius:18px;background:#0d2239;padding:19px;box-shadow:var(--shadow)}.modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:15px}.modal-head h2{margin:0;font-size:15px}.event-list{display:grid;gap:10px}.event{padding:11px 12px;border:1px solid var(--line);border-radius:11px;background:#0a1b2e}.event strong{font-size:11px}.event small{display:block;color:var(--muted);margin-top:5px;font-size:9px}\n@media(max-width:1100px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.app{grid-template-columns:205px minmax(0,1fr)}.main{padding:22px 18px 40px}.grid-2{grid-template-columns:1fr}}\n@media(max-width:740px){.app{display:block}.sidebar{position:relative;width:100%;height:auto;padding:14px}.sidebar .brand{padding:0 5px 12px}.nav{display:flex;overflow:auto}.nav-label,.side-foot{display:none}.nav button{width:auto;white-space:nowrap;padding:10px}.main{padding:19px 12px 34px}.topbar{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}.map{height:340px}.topbar h1{font-size:22px}}\n@media(max-width:420px){.kpis{gap:8px}.kpi{padding:13px}.kpi strong{font-size:24px}.chart-box{height:205px}}\n</style>\n</head>\n<body>\n<section id=\"auth\" class=\"login-shell\"><div class=\"login-card\"><div class=\"brand\"><div class=\"brand-mark\">W</div><div><strong>Wessali Operations</strong><small>SECURE ADMIN CONSOLE</small></div></div><div class=\"eyebrow\">Cloudflare / Wessali</div><h1 id=\"authTitle\">Administrator sign in</h1><p class=\"sub\" id=\"authSub\">Manage live orders, customer accounts and partner operations.</p><form id=\"authForm\"><label class=\"field hidden\" id=\"setupKeyWrap\">One-time setup key<input id=\"setupKey\" type=\"password\" autocomplete=\"off\"></label><label class=\"field hidden\" id=\"nameWrap\">Administrator name<input id=\"adminName\" minlength=\"2\" maxlength=\"80\" required></label><label class=\"field\" id=\"emailWrap\">Email address<input id=\"email\" type=\"email\" autocomplete=\"username\" required></label><label class=\"field\">Password<input id=\"password\" type=\"password\" minlength=\"12\" autocomplete=\"current-password\" required></label><label class=\"field hidden\" id=\"confirmWrap\">Confirm password<input id=\"confirmPassword\" type=\"password\" minlength=\"12\" autocomplete=\"new-password\"></label><button class=\"btn primary wide\" id=\"authButton\">Sign in</button><p id=\"authError\" class=\"error\"></p></form><p class=\"notice\" id=\"authNote\">Only authorized Wessali administrators can view customer and location data. Phone numbers are not verified by SMS in this release.</p></div></section>\n<div id=\"app\" class=\"app hidden\">\n<aside class=\"sidebar\"><div class=\"brand\"><div class=\"brand-mark\">W</div><div><strong>Wessali</strong><small>OPERATIONS INTELLIGENCE</small></div></div><div class=\"nav-label\">Workspace</div><nav class=\"nav\">\n<button class=\"active\" data-tab=\"overview\"><span class=\"ico\">◫</span>Overview</button><button data-tab=\"map\"><span class=\"ico\">⌖</span>Live map</button><button data-tab=\"orders\"><span class=\"ico\">▤</span>Orders</button><button data-tab=\"users\"><span class=\"ico\">♙</span>Accounts</button><button data-tab=\"providers\"><span class=\"ico\">▣</span>Providers</button><button data-tab=\"payments\"><span class=\"ico\">◈</span>Payments</button><button data-tab=\"audit\"><span class=\"ico\">≋</span>Audit trail</button>\n</nav><div class=\"side-foot\"><span class=\"online-dot\"></span>Cloudflare edge API<br><span id=\"sideEmail\"></span></div></aside>\n<main class=\"main\"><header class=\"topbar\"><div><p>WESSALI / CONTROL PLANE</p><h1 id=\"pageTitle\">Operations overview</h1></div><div class=\"top-actions\"><span class=\"refresh-indicator\" id=\"lastRefresh\">Connecting…</span><span class=\"user-chip\" id=\"adminNameChip\"></span><button class=\"btn ghost\" id=\"refreshBtn\">Refresh</button><button class=\"btn ghost\" id=\"logoutBtn\">Sign out</button></div></header>\n<section id=\"page-overview\" class=\"page active\"><div id=\"kpis\" class=\"kpis\"></div><div class=\"grid-2\"><article class=\"panel\"><div class=\"panel-head\"><div><h2>Order activity</h2><p>New orders · last 14 days</p></div><span class=\"badge\">LIVE DATA</span></div><div class=\"chart-box\"><canvas id=\"dailyChart\"></canvas></div></article><article class=\"panel\"><div class=\"panel-head\"><div><h2>Order status</h2><p>Current workflow distribution</p></div></div><div class=\"chart-box small\"><canvas id=\"statusChart\"></canvas></div></article></div><div class=\"grid-2\"><article class=\"panel\"><div class=\"panel-head\"><div><h2>Service mix</h2><p>Freight, roadside and water</p></div></div><div class=\"chart-box small\"><canvas id=\"serviceChart\"></canvas></div></article><article class=\"panel\"><div class=\"panel-head\"><div><h2>Latest activity</h2><p>Most recent order changes</p></div><button class=\"btn ghost\" data-go=\"orders\">All orders</button></div><div id=\"recentEvents\" class=\"event-list\"></div></article></div></section>\n<section id=\"page-map\" class=\"page\"><article class=\"panel map-panel\"><div class=\"panel-head\"><div><h2>Orders map</h2><p>Saved pickup and destination points from recent orders, plus provider locations explicitly shared during active jobs.</p></div><div class=\"map-legend\"><span><i class=\"legend-dot\" style=\"background:#4eafff\"></i>Pickup</span><span><i class=\"legend-dot\" style=\"background:#ff8795\"></i>Destination</span><span><i class=\"legend-dot\" style=\"background:#8194a8\"></i>Historical order</span><span><i class=\"legend-dot\" style=\"background:#4bd3a8\"></i>Provider live</span></div></div><div id=\"operationsMap\" class=\"map\"></div><p class=\"notice\">Provider GPS is collected only after the provider explicitly starts sharing for an active job. Live fixes older than 10 minutes are hidden.</p></article></section>\n<section id=\"page-orders\" class=\"page\"><div class=\"panel table-panel\"><div class=\"table-head\"><div><h2>All service orders</h2><p class=\"notice\">Customer details and order locations are visible only in this protected admin console.</p></div><div class=\"tools\"><input id=\"orderSearch\" class=\"search\" placeholder=\"Search reference, customer or address\"><select id=\"orderFilter\" class=\"search\"><option value=\"\">All statuses</option><option>submitted</option><option>matching</option><option>accepted</option><option>provider_en_route</option><option>arrived</option><option>in_progress</option><option>completed</option><option>cancelled</option></select></div></div><div class=\"table-wrap\"><table><thead><tr><th>Reference</th><th>Service</th><th>Customer</th><th>Pickup</th><th>Provider</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody id=\"ordersBody\"></tbody></table></div></div></section>\n<section id=\"page-users\" class=\"page\"><div class=\"panel table-panel\"><div class=\"table-head\"><div><h2>Customer and provider accounts</h2><p class=\"notice\">Password hashes and access tokens are never exposed in this dashboard.</p></div><input id=\"userSearch\" class=\"search\" placeholder=\"Search name or phone\"></div><div class=\"table-wrap\"><table><thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Last login</th><th>Action</th></tr></thead><tbody id=\"usersBody\"></tbody></table></div></div></section>\n<section id=\"page-providers\" class=\"page\"><div id=\"providerCards\" class=\"cards\"></div></section>\n<section id=\"page-payments\" class=\"page\"><div class=\"panel table-panel\"><div class=\"table-head\"><div><h2>Payment records</h2><p class=\"notice\">This view reports recorded payment rows. No payment gateway is connected yet.</p></div></div><div class=\"table-wrap\"><table><thead><tr><th>Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Recorded</th></tr></thead><tbody id=\"paymentsBody\"></tbody></table></div></div></section>\n<section id=\"page-audit\" class=\"page\"><div class=\"panel table-panel\"><div class=\"table-head\"><div><h2>Administrative audit trail</h2><p class=\"notice\">Reviews, account actions and order interventions.</p></div></div><div class=\"table-wrap\"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody id=\"auditBody\"></tbody></table></div></div></section>\n</main></div>\n<div id=\"modal\" class=\"modal\"><div class=\"modal-card\"><div class=\"modal-head\"><h2 id=\"modalTitle\">Order details</h2><button class=\"btn ghost\" id=\"modalClose\">Close</button></div><div id=\"modalBody\"></div></div></div>\n<script src=\"https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js\"></script><script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"></script>\n<script>\n(function(){\nconst $=id=>document.getElementById(id);\nconst state={initialized:false,tab:\"overview\",overview:null,orders:[],users:[],providers:[],payments:[],audit:[],locations:[],map:null,markers:[],charts:{},user:null,loading:false};\nconst titles={overview:\"Operations overview\",map:\"Live service map\",orders:\"Order management\",users:\"Customer accounts\",providers:\"Provider network\",payments:\"Payments and settlements\",audit:\"Audit trail\"};\nconst activeStates=[\"submitted\",\"matching\",\"offer_received\",\"accepted\",\"provider_en_route\",\"arrived\",\"in_progress\"];\nconst esc=value=>String(value==null?\"\":value).replace(/[&<>\"']/g,c=>({\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"}[c]));\nconst date=value=>value?new Date(value).toLocaleString():\"—\";\nconst money=(minor,currency)=>new Intl.NumberFormat(\"fr-DZ\",{style:\"currency\",currency:currency||\"DZD\",maximumFractionDigits:0}).format(Number(minor||0)/100);\nconst badge=status=>{const tone=[\"completed\",\"approved\",\"paid\",\"active\"].includes(status)?\"green\":[\"pending\",\"submitted\",\"matching\",\"offer_received\",\"provider_en_route\",\"arrived\",\"in_progress\"].includes(status)?\"amber\":[\"cancelled\",\"rejected\",\"suspended\",\"failed\"].includes(status)?\"red\":\"\";return '<span class=\"badge '+tone+'\">'+esc(String(status||\"unknown\").replaceAll(\"_\",\" \"))+\"</span>\";};\nfunction showError(message){$(\"authError\").textContent=message||\"\";}\nasync function api(path,options){const response=await fetch(\"/v1\"+path,{credentials:\"same-origin\",headers:Object.assign({\"Content-Type\":\"application/json\"},options&&options.headers||{}),...(options||{})});let data={};try{data=await response.json();}catch{}if(!response.ok)throw new Error(data.message||(\"HTTP \"+response.status));return data;}\nfunction showLogin(setup){state.initialized=!setup;$(\"auth\").classList.remove(\"hidden\");$(\"app\").classList.add(\"hidden\");$(\"setupKeyWrap\").classList.toggle(\"hidden\",!setup);$(\"nameWrap\").classList.toggle(\"hidden\",!setup);$(\"confirmWrap\").classList.toggle(\"hidden\",!setup);$(\"authTitle\").textContent=setup?\"Create the first administrator\":\"Administrator sign in\";$(\"authSub\").textContent=setup?\"Initialize your private operations account. This step can be completed only once.\":\"Sign in to view orders, accounts, providers and live job locations.\";$(\"authButton\").textContent=setup?\"Initialize secure dashboard\":\"Sign in\";$(\"authNote\").textContent=setup?\"The setup key is one-time. Use a unique password with at least 12 characters.\":\"Access is protected by an HttpOnly session cookie. Location sharing is shown only during active jobs.\";$(\"password\").autocomplete=setup?\"new-password\":\"current-password\";$(\"password\").minLength=12;}\nasync function boot(){try{const status=await api(\"/admin/setup/status\");if(!status.initialized){showLogin(true);return;}try{const me=await api(\"/admin/me\");state.user=me.user;showApp();await loadAll();}catch{showLogin(false);}}catch(error){showLogin(true);showError(error.message);}}\n$(\"authForm\").addEventListener(\"submit\",async event=>{event.preventDefault();showError(\"\");$(\"authButton\").disabled=true;try{const password=$(\"password\").value;if(password.length<12)throw new Error(\"Use at least 12 characters for the administrator password.\");let result;if(!state.initialized){if(password!==$(\"confirmPassword\").value)throw new Error(\"The passwords do not match.\");result=await api(\"/admin/setup\",{method:\"POST\",headers:{\"X-Setup-Key\":$(\"setupKey\").value},body:JSON.stringify({email:$(\"email\").value,displayName:$(\"adminName\").value,password})});}else{result=await api(\"/admin/auth/login\",{method:\"POST\",body:JSON.stringify({email:$(\"email\").value,password})});}state.user=result.user;showApp();await loadAll();}catch(error){showError(error.message);}finally{$(\"authButton\").disabled=false;}});\nfunction showApp(){$(\"auth\").classList.add(\"hidden\");$(\"app\").classList.remove(\"hidden\");$(\"adminNameChip\").textContent=state.user?state.user.displayName:\"Administrator\";$(\"sideEmail\").textContent=state.user?state.user.email:\"\";if(state.user&&state.user.mustChangePassword)changePasswordPrompt();}\nasync function changePasswordPrompt(){const current=prompt(\"Temporary password confirmed. Enter your current administrator password:\");if(current===null)return;const next=prompt(\"Set a new password with at least 12 characters:\");if(!next)return;try{await api(\"/admin/change-password\",{method:\"POST\",body:JSON.stringify({currentPassword:current,newPassword:next})});alert(\"Administrator password updated.\");}catch(error){alert(error.message);}}\n$(\"logoutBtn\").onclick=async()=>{try{await api(\"/admin/auth/logout\",{method:\"POST\",body:\"{}\"});}catch{}state.user=null;showLogin(false);};\n$(\"refreshBtn\").onclick=()=>loadAll();\n$(\"modalClose\").onclick=()=> $(\"modal\").classList.remove(\"open\");\n$(\"modal\").addEventListener(\"click\",e=>{if(e.target===$(\"modal\"))$(\"modal\").classList.remove(\"open\");});\ndocument.querySelectorAll(\".nav button\").forEach(button=>button.addEventListener(\"click\",()=>navigate(button.dataset.tab)));\ndocument.querySelectorAll(\"[data-go]\").forEach(button=>button.addEventListener(\"click\",()=>navigate(button.dataset.go)));\nfunction navigate(tab){state.tab=tab;document.querySelectorAll(\".nav button\").forEach(b=>b.classList.toggle(\"active\",b.dataset.tab===tab));document.querySelectorAll(\".page\").forEach(p=>p.classList.toggle(\"active\",p.id===\"page-\"+tab));$(\"pageTitle\").textContent=titles[tab]||\"Wessali\";if(tab===\"map\")setTimeout(()=>{if(state.map)state.map.invalidateSize();renderMap();},100);}\n$(\"orderSearch\").addEventListener(\"input\",renderOrders);$(\"orderFilter\").addEventListener(\"change\",renderOrders);$(\"userSearch\").addEventListener(\"input\",renderUsers);\nasync function loadAll(){if(state.loading)return;state.loading=true;$(\"lastRefresh\").textContent=\"Synchronizing…\";try{const values=await Promise.all([api(\"/admin/overview\"),api(\"/admin/bookings?limit=500\"),api(\"/admin/users\"),api(\"/admin/providers\"),api(\"/admin/payments\"),api(\"/admin/audit\"),api(\"/admin/locations\")]);[state.overview,state.orders,state.users,state.providers,state.payments,state.audit,state.locations]=values;renderAll();$(\"lastRefresh\").textContent=\"Updated \"+new Date().toLocaleTimeString();}catch(error){$(\"lastRefresh\").textContent=\"Refresh failed\";console.error(error);if(error.message.includes(\"401\")){state.user=null;showLogin(false);}else alert(error.message);}finally{state.loading=false;}}\nfunction renderAll(){renderKpis();renderCharts();renderRecent();renderOrders();renderUsers();renderProviders();renderPayments();renderAudit();if(state.tab===\"map\")renderMap();}\nfunction renderKpis(){const o=state.overview||{};const items=[[\"Active orders\",o.active_bookings,\"Current jobs\"],[\"Registered accounts\",o.total_users,\"Customer and provider accounts\"],[\"Providers awaiting review\",o.pending_providers,\"Applications to process\"],[\"Completed orders\",o.completed_bookings,\"Successfully completed\"]];$(\"kpis\").innerHTML=items.map((x,i)=>'<article class=\"kpi\"><label>'+x[0]+'</label><strong class=\"accent\">'+Number(x[1]||0).toLocaleString()+'</strong><small>'+x[2]+'</small></article>').join(\"\");}\nfunction chart(id,type,labels,data,colors){if(!window.Chart)return;const canvas=$(id);if(state.charts[id])state.charts[id].destroy();state.charts[id]=new Chart(canvas,{type,data:{labels,datasets:[{data,backgroundColor:colors||[\"#4298e6\",\"#4bd3a8\",\"#eab96c\",\"#f17f8d\",\"#8e9cf6\"],borderColor:type===\"line\"?\"#55a9ef\":\"transparent\",borderWidth:type===\"line\"?2:1,tension:.38,fill:type===\"line\",pointRadius:type===\"line\"?3:0,pointBackgroundColor:\"#9bd9ff\"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type!==\"line\",position:\"bottom\",labels:{color:\"#9bb3ca\",boxWidth:9,padding:13,font:{size:10}}}},scales:type===\"line\"?{x:{ticks:{color:\"#819bb4\",font:{size:9}},grid:{color:\"rgba(160,190,220,.07)\"}},y:{beginAtZero:true,ticks:{color:\"#819bb4\",precision:0,font:{size:9}},grid:{color:\"rgba(160,190,220,.07)\"}}}:undefined}});}\nfunction renderCharts(){const o=state.overview||{};chart(\"dailyChart\",\"line\",(o.daily||[]).map(x=>x.day),(o.daily||[]).map(x=>Number(x.count)),[\"#479fe9\"]);chart(\"statusChart\",\"doughnut\",(o.statuses||[]).map(x=>String(x.status).replaceAll(\"_\",\" \")),(o.statuses||[]).map(x=>Number(x.count)),[\"#479fe9\",\"#4bd3a8\",\"#eab96c\",\"#ed8794\",\"#8d9ef6\",\"#6ac9de\"]);chart(\"serviceChart\",\"doughnut\",(o.services||[]).map(x=>x.service_type),(o.services||[]).map(x=>Number(x.count)),[\"#479fe9\",\"#4bd3a8\",\"#eab96c\"]);}\nfunction renderRecent(){const items=state.audit.slice(0,7);$(\"recentEvents\").innerHTML=items.length?items.map(x=>'<div class=\"event\"><strong>'+esc(x.action.replaceAll(\"_\",\" \"))+'</strong><small>'+esc(x.admin_name||x.user_name||\"System\")+' · '+esc(date(x.created_at))+'</small></div>').join(\"\"):'<div class=\"empty\">No recorded activity yet.</div>';}\nfunction renderOrders(){const q=$(\"orderSearch\").value.toLowerCase();const filter=$(\"orderFilter\").value;const rows=state.orders.filter(x=>(!filter||x.status===filter)&&(!q||[x.public_reference,x.customer_name,x.pickup_address,x.provider_name].join(\" \").toLowerCase().includes(q)));$(\"ordersBody\").innerHTML=rows.length?rows.map(x=>'<tr><td class=\"ref\">'+esc(x.public_reference)+'</td><td>'+esc(x.service_type)+'</td><td>'+esc(x.customer_name)+'</td><td title=\"'+esc(x.pickup_address)+'\">'+esc((x.pickup_address||\"\").slice(0,32))+'</td><td>'+esc(x.provider_name||\"—\")+'</td><td>'+badge(x.status)+'</td><td>'+esc(date(x.created_at))+'</td><td><button class=\"btn ghost\" data-detail=\"'+esc(x.id)+'\">Details</button></td></tr>').join(\"\"):'<tr><td colspan=\"8\"><div class=\"empty\">No matching orders.</div></td></tr>';document.querySelectorAll(\"[data-detail]\").forEach(b=>b.onclick=()=>orderDetails(b.dataset.detail));}\nasync function orderDetails(id){try{const booking=state.orders.find(x=>x.id===id);const data=await api(\"/admin/bookings/\"+id+\"/events\");$(\"modalTitle\").textContent=booking.public_reference+\" · \"+booking.service_type;const eventHtml=data.events.map(e=>'<div class=\"event\"><strong>'+esc(e.event_type.replaceAll(\"_\",\" \"))+'</strong><small>'+esc(e.actor_name||\"System\")+' · '+esc(date(e.created_at))+'</small><small>'+esc(e.previous_status||\"—\")+' → '+esc(e.new_status||\"—\")+'</small></div>').join(\"\");const locationHtml=data.locations.slice(0,15).map(p=>'<div class=\"event\"><strong>Provider location sample</strong><small>'+esc(date(p.recorded_at))+' · '+Number(p.latitude).toFixed(5)+', '+Number(p.longitude).toFixed(5)+'</small><small>Accuracy: '+esc(p.accuracy_m==null?'—':Math.round(p.accuracy_m)+' m')+'</small></div>').join(\"\");$(\"modalBody\").innerHTML='<h3 class=\"eyebrow\">Order events</h3><div class=\"event-list\">'+eventHtml+'</div><h3 class=\"eyebrow\" style=\"margin-top:18px\">Location history</h3><div class=\"event-list\">'+(locationHtml||'<div class=\"empty\">No provider location samples were shared for this order.</div>')+'</div><p class=\"notice\">Showing up to 15 recent provider fixes for this booking. Location sharing is explicitly started by the provider and samples expire after 30 days.</p>';$(\"modal\").classList.add(\"open\");}catch(error){alert(error.message);}}\nfunction renderUsers(){const q=$(\"userSearch\").value.toLowerCase();const rows=state.users.filter(x=>(x.display_name+\" \"+x.phone_e164).toLowerCase().includes(q));$(\"usersBody\").innerHTML=rows.map(x=>'<tr><td>'+esc(x.display_name)+'</td><td>'+esc(x.phone_e164)+'</td><td>'+badge(x.role)+'</td><td>'+badge(x.status)+'</td><td>'+esc(date(x.created_at))+'</td><td>'+esc(date(x.last_login_at))+'</td><td><button class=\"btn '+(x.status===\"active\"?\"danger\":\"\")+'\" data-user=\"'+esc(x.id)+'\" data-status=\"'+(x.status===\"active\"?\"suspended\":\"active\")+'\">'+(x.status===\"active\"?\"Suspend\":\"Activate\")+'</button></td></tr>').join(\"\");document.querySelectorAll(\"[data-user]\").forEach(b=>b.onclick=()=>updateUser(b.dataset.user,b.dataset.status));}\nasync function updateUser(id,status){if(!confirm(\"Set this account to \"+status+\"?\"))return;try{await api(\"/admin/users/\"+id+\"/status\",{method:\"POST\",body:JSON.stringify({status})});await loadAll();}catch(error){alert(error.message);}}\nfunction renderProviders(){$(\"providerCards\").innerHTML=state.providers.length?state.providers.map(p=>'<article class=\"provider-card\"><div class=\"panel-head\"><div><h2>'+esc(p.business_name||\"Unnamed business\")+'</h2><p>'+esc(p.display_name)+' · '+esc(p.phone_e164)+'</p></div>'+badge(p.status)+'</div><p>'+esc((p.services||[]).map(s=>s.serviceType+(s.approved?\" ✓\":\"\")).join(\" · \"))+'</p><div class=\"provider-foot\"><small class=\"muted\">Applied '+esc(date(p.created_at))+'</small><div class=\"actions\">'+(p.status!==\"approved\"?'<button class=\"btn primary\" data-review=\"'+esc(p.id)+'\" data-decision=\"approve\">Approve</button><button class=\"btn danger\" data-review=\"'+esc(p.id)+'\" data-decision=\"reject\">Reject</button>':'<button class=\"btn danger\" data-review=\"'+esc(p.id)+'\" data-decision=\"suspend\">Suspend</button>')+'</div></div></article>').join(\"\"):'<div class=\"panel empty\">No provider applications yet.</div>';document.querySelectorAll(\"[data-review]\").forEach(b=>b.onclick=()=>reviewProvider(b.dataset.review,b.dataset.decision));}\nasync function reviewProvider(id,decision){const notes=prompt(\"Optional review note:\")||\"\";try{await api(\"/admin/providers/\"+id+\"/review\",{method:\"POST\",body:JSON.stringify({decision,notes})});await loadAll();}catch(error){alert(error.message);}}\nfunction renderPayments(){$(\"paymentsBody\").innerHTML=state.payments.length?state.payments.map(p=>'<tr><td class=\"ref\">'+esc(p.public_reference)+'</td><td>'+esc(money(p.amount_minor,p.currency))+'</td><td>'+esc(p.method)+'</td><td>'+badge(p.status)+'</td><td>'+esc(date(p.created_at))+'</td></tr>').join(\"\"):'<tr><td colspan=\"5\"><div class=\"empty\">No payment records yet. Connect a payment provider before accepting online payments.</div></td></tr>';}\nfunction renderAudit(){$(\"auditBody\").innerHTML=state.audit.length?state.audit.map(a=>'<tr><td>'+esc(date(a.created_at))+'</td><td>'+esc(a.admin_name||a.user_name||\"System\")+'</td><td>'+esc(a.action.replaceAll(\"_\",\" \"))+'</td><td>'+esc(a.entity_type)+' · '+esc(a.entity_id||\"\")+'</td><td>'+esc(a.metadata)+'</td></tr>').join(\"\"):'<tr><td colspan=\"5\"><div class=\"empty\">No audit entries yet.</div></td></tr>';}\nfunction renderMap(){if(!window.L)return;if(!state.map){state.map=L.map(\"operationsMap\",{zoomControl:true}).setView([36.7538,3.0588],6);L.tileLayer(\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\",{maxZoom:18,attribution:\"&copy; OpenStreetMap contributors\"}).addTo(state.map);}state.markers.forEach(m=>m.remove());state.markers=[];for(const x of state.locations){const active=activeStates.includes(x.status);const pinColor=active?\"#4eafff\":\"#8194a8\";const destColor=active?\"#ff8795\":\"#a18b98\";if(x.pickup_latitude!=null&&x.pickup_longitude!=null){const m=L.circleMarker([x.pickup_latitude,x.pickup_longitude],{radius:7,color:pinColor,fillColor:pinColor,fillOpacity:.9}).addTo(state.map);m.bindPopup(\"<b>\"+esc(x.public_reference)+\"</b><br>Pickup · \"+esc(x.pickup_address)+\"<br>\"+esc(x.status));state.markers.push(m);}if(x.destination_latitude!=null&&x.destination_longitude!=null){const m=L.circleMarker([x.destination_latitude,x.destination_longitude],{radius:7,color:destColor,fillColor:destColor,fillOpacity:.9}).addTo(state.map);m.bindPopup(\"<b>\"+esc(x.public_reference)+\"</b><br>Destination · \"+esc(x.destination_address||\"\")+\"<br>\"+esc(x.status));state.markers.push(m);}if(x.provider_latitude!=null&&x.provider_longitude!=null){const m=L.circleMarker([x.provider_latitude,x.provider_longitude],{radius:8,color:\"#4bd3a8\",fillColor:\"#4bd3a8\",fillOpacity:1}).addTo(state.map);m.bindPopup(\"<b>\"+esc(x.public_reference)+\"</b><br>Provider live · \"+esc(x.provider_name||\"Provider\")+\"<br>\"+esc(date(x.provider_location_at)));state.markers.push(m);}}}\nasync function updateLocations(){try{state.locations=await api(\"/admin/locations\");if(state.tab===\"map\")renderMap();}catch(error){console.error(error);}}\nsetInterval(()=>{if(!$(\"app\").classList.contains(\"hidden\")){loadAll();}},20000);\ndocument.addEventListener(\"visibilitychange\",()=>{if(!document.hidden&&!$(\"app\").classList.contains(\"hidden\"))loadAll();});\nboot();\n})();\n</script>\n</body></html>";
const encoder = new TextEncoder();
const ACTIVE_STATUSES = ["submitted", "matching", "offer_received", "accepted", "provider_en_route", "arrived", "in_progress"];
const SERVICE_TYPES = ["freight", "roadside", "water"];
const ADMIN_SETUP_KEY_HASH = "00700d58ac86530ad69af6483b25fae09cdd8cb82bc17df679c256ca1e8dd6d1";
const USER_ROLES = ["customer", "provider"];
const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...jsonHeaders, ...headers } });
}
function fail(status, message) { throw new HttpError(status, message); }
function isoNow() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }
function randomBytes(length) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return bytes; }
function base64url(bytes) {
  let raw = "";
  for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function tokenValue() { return base64url(randomBytes(32)); }
async function digest(value) { return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)))); }
function constantTimeStringEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
function validPhone(phone) { return typeof phone === "string" && /^\+[1-9]\d{7,14}$/.test(phone.trim()); }
function validEmail(email) { return typeof email === "string" && email.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validCoordinate(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
    Number(lat) >= -90 && Number(lat) <= 90 && Number(lng) >= -180 && Number(lng) <= 180;
}
function safeInt(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}
async function readJson(request, limit = 1024 * 1024) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > limit) fail(413, "The request is too large.");
  try { return await request.json(); } catch { fail(400, "A valid JSON body is required."); }
}
async function all(db, sql, ...params) {
  const result = await db.prepare(sql).bind(...params).all();
  return result.results || [];
}
async function first(db, sql, ...params) {
  return db.prepare(sql).bind(...params).first();
}
async function run(db, sql, ...params) {
  return db.prepare(sql).bind(...params).run();
}
function cookieValue(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const item of header.split(";")) {
    const part = item.trim();
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index) === name) return decodeURIComponent(part.slice(index + 1));
  }
  return "";
}
function adminCookie(token, maxAge) {
  return "__Host-wessali_admin=" + encodeURIComponent(token) +
    "; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=" + maxAge;
}
function checkAdminOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) fail(403, "Cross-origin admin requests are not allowed.");
}
async function passwordHash(password) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    fail(400, "Use a password with at least 12 characters.");
  }
  const salt = randomBytes(16);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
  return "pbkdf2$120000$" + base64url(salt) + "$" + base64url(new Uint8Array(bits));
}
async function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 300000) return false;
  try {
    const decode = (value) => {
      const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
      const raw = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
      return Uint8Array.from(raw, (c) => c.charCodeAt(0));
    };
    const salt = decode(parts[2]);
    const expected = decode(parts[3]);
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, expected.length * 8));
    let diff = actual.length ^ expected.length;
    for (let i = 0; i < Math.max(actual.length, expected.length); i++) diff |= (actual[i] || 0) ^ (expected[i] || 0);
    return diff === 0;
  } catch { return false; }
}
async function rateLimit(db, key, maxAttempts = 7, windowSeconds = 900) {
  const now = Math.floor(Date.now() / 1000);
  const result = await first(db,
    "INSERT INTO auth_rate_limits(rate_key,window_started_at,attempts) VALUES(?,?,1) " +
    "ON CONFLICT(rate_key) DO UPDATE SET " +
    "attempts=CASE WHEN ? - auth_rate_limits.window_started_at > ? THEN 1 ELSE auth_rate_limits.attempts+1 END, " +
    "window_started_at=CASE WHEN ? - auth_rate_limits.window_started_at > ? THEN ? ELSE auth_rate_limits.window_started_at END " +
    "RETURNING attempts",
    key, now, now, windowSeconds, now, windowSeconds, now
  );
  if (Number(result && result.attempts) > maxAttempts) fail(429, "Too many attempts. Try again in 15 minutes.");
}
async function rateLimitRequest(db, request, identifier) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  await rateLimit(db, "ip:" + ip, 20, 900);
  await rateLimit(db, "id:" + identifier, 7, 900);
}
async function createUserSession(db, user, role) {
  const token = tokenValue();
  const tokenHash = await digest(token);
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await run(db, "INSERT INTO auth_sessions(id,user_id,role,token_hash,expires_at) VALUES(?,?,?,?,?)",
    sessionId, user.id, role, tokenHash, expiresAt);
  return {
    accessToken: token,
    tokenType: "Bearer",
    expiresAt,
    user: { id: user.id, displayName: user.display_name, phoneE164: user.phone_e164, role }
  };
}
async function getUserActor(request, env) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) fail(401, "A valid Wessali session is required.");
  const token = header.slice(7).trim();
  if (token.length < 40) fail(401, "The session token is invalid.");
  const tokenHash = await digest(token);
  const actor = await first(env.DB,
    "SELECT s.id AS session_id,s.user_id,s.role,u.phone_e164,u.status,p.display_name " +
    "FROM auth_sessions s JOIN users u ON u.id=s.user_id " +
    "JOIN user_profiles p ON p.user_id=u.id " +
    "WHERE s.token_hash=? AND s.expires_at>? LIMIT 1",
    tokenHash, isoNow()
  );
  if (!actor || actor.status !== "active") fail(401, "Your session has expired. Sign in again.");
  await run(env.DB, "UPDATE auth_sessions SET last_used_at=? WHERE id=?", isoNow(), actor.session_id);
  return { userId: actor.user_id, sessionId: actor.session_id, role: actor.role, phoneE164: actor.phone_e164, displayName: actor.display_name };
}
async function getAdminActor(request, env) {
  const token = cookieValue(request, "__Host-wessali_admin");
  if (!token || token.length < 40) fail(401, "Administrator sign-in is required.");
  const tokenHash = await digest(token);
  const actor = await first(env.DB,
    "SELECT s.id AS session_id,a.id AS admin_id,a.email,a.display_name,a.status,a.must_change_password " +
    "FROM admin_sessions s JOIN admin_users a ON a.id=s.admin_user_id " +
    "WHERE s.token_hash=? AND s.expires_at>? LIMIT 1",
    tokenHash, isoNow()
  );
  if (!actor || actor.status !== "active") fail(401, "Your administrator session has expired.");
  await run(env.DB, "UPDATE admin_sessions SET last_used_at=? WHERE id=?", isoNow(), actor.session_id);
  return actor;
}
async function createAdminSession(db, admin) {
  const token = tokenValue();
  const tokenHash = await digest(token);
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  await run(db, "INSERT INTO admin_sessions(id,admin_user_id,token_hash,expires_at) VALUES(?,?,?,?)",
    sessionId, admin.id, tokenHash, expiresAt);
  return { token, expiresAt, user: { id: admin.id, email: admin.email, displayName: admin.display_name, mustChangePassword: Boolean(admin.must_change_password) } };
}
async function requireProvider(env, actor) {
  if (actor.role !== "provider") fail(403, "A provider account is required.");
  const profile = await first(env.DB, "SELECT id,status FROM provider_profiles WHERE user_id=?", actor.userId);
  if (!profile) fail(403, "Submit a provider application first.");
  if (profile.status !== "approved") fail(403, "Your provider application is waiting for operations review.");
  return profile;
}
async function addBookingEvent(db, bookingId, actorUserId, type, previousStatus, newStatus, payload = {}) {
  await run(db,
    "INSERT INTO booking_events(id,booking_id,actor_user_id,event_type,previous_status,new_status,payload) VALUES(?,?,?,?,?,?,?)",
    uuid(), bookingId, actorUserId || null, type, previousStatus || null, newStatus || null, JSON.stringify(payload)
  );
}
async function addAudit(db, actorAdminId, actorUserId, action, entityType, entityId, metadata = {}) {
  await run(db,
    "INSERT INTO audit_events(actor_admin_id,actor_user_id,action,entity_type,entity_id,metadata) VALUES(?,?,?,?,?,?)",
    actorAdminId || null, actorUserId || null, action, entityType, entityId || null, JSON.stringify(metadata)
  );
}
const bookingSelect =
  "SELECT b.id,b.public_reference,b.customer_id,b.assigned_provider_id,b.service_type,b.status," +
  "b.pickup_address,b.pickup_latitude,b.pickup_longitude,b.destination_address,b.destination_latitude,b.destination_longitude," +
  "b.requested_at,b.estimated_amount_minor,b.agreed_amount_minor,b.currency,b.customer_notes,b.created_at,b.updated_at," +
  "up.display_name AS customer_name,pp.business_name AS provider_name," +
  "fd.cargo_description,fd.weight_kg,fd.truck_type,fd.loading_requirements," +
  "rd.vehicle_type,rd.issue_category,rd.needs_towing,rd.towing_destination," +
  "wd.quantity_litres,wd.intended_use,wd.water_category " +
  "FROM bookings b JOIN user_profiles up ON up.user_id=b.customer_id " +
  "LEFT JOIN provider_profiles pp ON pp.id=b.assigned_provider_id " +
  "LEFT JOIN freight_details fd ON fd.booking_id=b.id " +
  "LEFT JOIN roadside_details rd ON rd.booking_id=b.id " +
  "LEFT JOIN water_details wd ON wd.booking_id=b.id";
function mapBooking(row) {
  return {
    id: row.id, public_reference: row.public_reference, service_type: row.service_type, status: row.status,
    pickup_address: row.pickup_address, pickup_latitude: row.pickup_latitude, pickup_longitude: row.pickup_longitude,
    destination_address: row.destination_address, destination_latitude: row.destination_latitude, destination_longitude: row.destination_longitude,
    requested_at: row.requested_at, estimated_amount_minor: row.estimated_amount_minor,
    agreed_amount_minor: row.agreed_amount_minor, currency: row.currency, customer_notes: row.customer_notes,
    created_at: row.created_at, updated_at: row.updated_at, customer_name: row.customer_name, provider_name: row.provider_name,
    freight: row.cargo_description ? { cargo_description: row.cargo_description, weight_kg: row.weight_kg, truck_type: row.truck_type, loading_requirements: row.loading_requirements } : null,
    roadside: row.vehicle_type ? { vehicle_type: row.vehicle_type, issue_category: row.issue_category, needs_towing: Boolean(row.needs_towing), towing_destination: row.towing_destination } : null,
    water: row.quantity_litres != null ? { quantity_litres: row.quantity_litres, intended_use: row.intended_use, water_category: row.water_category } : null
  };
}
async function listProviderProfile(db, providerId) {
  const profile = await first(db, "SELECT id,business_name,status,verification_notes,approved_at,created_at FROM provider_profiles WHERE id=?", providerId);
  if (!profile) fail(404, "Provider profile not found.");
  profile.services = await all(db, "SELECT service_type AS serviceType,is_approved AS approved FROM provider_services WHERE provider_id=? ORDER BY service_type", providerId);
  profile.services = profile.services.map((item) => ({ serviceType: item.serviceType, approved: Boolean(item.approved) }));
  return profile;
}
async function handleAuth(request, env, path) {
  if (path === "/auth/register" && request.method === "POST") {
    const input = await readJson(request);
    const phone = typeof input.phoneE164 === "string" ? input.phoneE164.trim() : "";
    const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
    const role = input.role || "customer";
    if (!validPhone(phone)) fail(400, "Enter a valid international phone number, including its country code.");
    if (displayName.length < 2 || displayName.length > 80) fail(400, "Your name must be between 2 and 80 characters.");
    if (!USER_ROLES.includes(role)) fail(400, "Choose a customer or provider account.");
    await rateLimitRequest(env.DB, request, phone);
    const existing = await first(env.DB, "SELECT id FROM users WHERE phone_e164=?", phone);
    if (existing) fail(409, "An account with this phone number already exists. Sign in instead.");
    const encodedPassword = await passwordHash(input.password);
    const userId = uuid();
    const now = isoNow();
    try {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO users(id,phone_e164,password_hash) VALUES(?,?,?)").bind(userId, phone, encodedPassword),
        env.DB.prepare("INSERT INTO user_profiles(user_id,display_name,preferred_locale) VALUES(?,?,?)").bind(userId, displayName, ["ar","fr","en"].includes(input.locale) ? input.locale : "ar"),
      ]);
    } catch (error) {
      if (String(error).toLowerCase().includes("unique")) fail(409, "An account with this phone number already exists.");
      throw error;
    }
    const session = await createUserSession(env.DB, { id: userId, display_name: displayName, phone_e164: phone }, role);
    await run(env.DB, "UPDATE users SET last_login_at=?,updated_at=? WHERE id=?", now, now, userId);
    return json(session, 201);
  }
  if (path === "/auth/login" && request.method === "POST") {
    const input = await readJson(request);
    const phone = typeof input.phoneE164 === "string" ? input.phoneE164.trim() : "";
    if (!validPhone(phone)) fail(400, "Enter a valid international phone number.");
    await rateLimitRequest(env.DB, request, phone);
    const user = await first(env.DB,
      "SELECT u.id,u.phone_e164,u.password_hash,u.status,p.display_name FROM users u " +
      "JOIN user_profiles p ON p.user_id=u.id WHERE u.phone_e164=?",
      phone
    );
    const valid = user && user.status === "active" && await verifyPassword(input.password, user.password_hash);
    if (!valid) fail(401, "The phone number or password is incorrect.");
    const role = input.role || "customer";
    if (!USER_ROLES.includes(role)) fail(400, "Choose a customer or provider account.");
    const session = await createUserSession(env.DB, user, role);
    const now = isoNow();
    await run(env.DB, "UPDATE users SET last_login_at=?,updated_at=? WHERE id=?", now, now, user.id);
    return json(session);
  }
  if (path === "/auth/logout" && request.method === "POST") {
    const actor = await getUserActor(request, env);
    await run(env.DB, "DELETE FROM auth_sessions WHERE id=?", actor.sessionId);
    return json({ success: true });
  }
  return null;
}
async function handleBookings(request, env, path, actor) {
  const isBookingRoute = path === "/bookings" || path === "/bookings/mine" || (path.startsWith("/bookings/") && path.endsWith("/cancel"));
  if (!isBookingRoute) return null;
  if (actor.role !== "customer") fail(403, "A customer account is required.");
  if (path === "/bookings/mine" && request.method === "GET") {
    const rows = await all(env.DB, bookingSelect + " WHERE b.customer_id=? ORDER BY b.created_at DESC LIMIT 150", actor.userId);
    return json(rows.map(mapBooking));
  }
  if (path === "/bookings" && request.method === "POST") {
    const input = await readJson(request);
    if (!SERVICE_TYPES.includes(input.serviceType)) fail(400, "Choose a valid Wessali service.");
    if (typeof input.pickupAddress !== "string" || input.pickupAddress.trim().length < 3) fail(400, "Enter a pickup address.");
    if ((input.pickupLatitude != null || input.pickupLongitude != null) && !validCoordinate(input.pickupLatitude, input.pickupLongitude)) fail(400, "The pickup coordinates are invalid.");
    if (input.serviceType === "freight") {
      if (typeof input.destinationAddress !== "string" || input.destinationAddress.trim().length < 3 ||
          typeof input.cargoDescription !== "string" || input.cargoDescription.trim().length < 3 ||
          !Number.isFinite(Number(input.weightKg)) || Number(input.weightKg) <= 0 ||
          typeof input.truckType !== "string") fail(400, "Complete the freight details before sending the request.");
      if ((input.destinationLatitude != null || input.destinationLongitude != null) && !validCoordinate(input.destinationLatitude, input.destinationLongitude)) fail(400, "The destination coordinates are invalid.");
    }
    if (input.serviceType === "roadside" && (!input.vehicleType || !input.issueCategory)) fail(400, "Complete the roadside details.");
    if (input.serviceType === "water" && (!Number.isFinite(Number(input.quantityLitres)) || Number(input.quantityLitres) <= 0 || !["residential","agricultural","other"].includes(input.intendedUse) || !["potable","non_potable","irrigation"].includes(input.waterCategory))) fail(400, "Complete the water delivery details.");
    const id = uuid();
    const reference = "WES-" + new Date().toISOString().slice(2,10).replace(/-/g,"") + "-" + base64url(randomBytes(5)).slice(0,7).toUpperCase();
    const now = isoNow();
    const statements = [
      env.DB.prepare("INSERT INTO bookings(id,public_reference,customer_id,service_type,status,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude,requested_at,customer_notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(id,reference,actor.userId,input.serviceType,"submitted",input.pickupAddress.trim(),input.pickupLatitude ?? null,input.pickupLongitude ?? null,input.serviceType === "freight" ? input.destinationAddress.trim() : null,input.serviceType === "freight" ? (input.destinationLatitude ?? null) : null,input.serviceType === "freight" ? (input.destinationLongitude ?? null) : null,input.requestedAt || now,input.customerNotes ? String(input.customerNotes).slice(0,2000) : null,now,now),
      env.DB.prepare("INSERT INTO booking_events(id,booking_id,actor_user_id,event_type,previous_status,new_status,payload,created_at) VALUES(?,?,?,?,?,?,?,?)")
        .bind(uuid(),id,actor.userId,"booking_submitted",null,"submitted","{}",now)
    ];
    if (input.serviceType === "freight") {
      statements.push(env.DB.prepare("INSERT INTO freight_details(booking_id,cargo_description,weight_kg,truck_type,loading_requirements) VALUES(?,?,?,?,?)")
        .bind(id,input.cargoDescription.trim(),Number(input.weightKg),input.truckType,String(input.loadingRequirements || "").slice(0,1000) || null));
    } else if (input.serviceType === "roadside") {
      statements.push(env.DB.prepare("INSERT INTO roadside_details(booking_id,vehicle_type,issue_category,needs_towing,towing_destination,notes) VALUES(?,?,?,?,?,?)")
        .bind(id,input.vehicleType,input.issueCategory,input.needsTowing ? 1 : 0,input.needsTowing ? (input.towingDestination || null) : null,String(input.notes || "").slice(0,1000) || null));
    } else {
      statements.push(env.DB.prepare("INSERT INTO water_details(booking_id,quantity_litres,intended_use,water_category,access_notes) VALUES(?,?,?,?,?)")
        .bind(id,Math.floor(Number(input.quantityLitres)),input.intendedUse,input.waterCategory,String(input.accessNotes || "").slice(0,1000) || null));
    }
    await env.DB.batch(statements);
    return json({ id, public_reference: reference, service_type: input.serviceType, status: "submitted" }, 201);
  }
  const cancel = /^\/bookings\/([0-9a-f-]+)\/cancel$/i.exec(path);
  if (cancel && request.method === "POST") {
    const booking = await first(env.DB, "SELECT id,status FROM bookings WHERE id=? AND customer_id=?", cancel[1], actor.userId);
    if (!booking) fail(404, "Booking not found.");
    if (!["submitted","matching","offer_received"].includes(booking.status)) fail(403, "This booking can no longer be cancelled.");
    const now = isoNow();
    const updated = await run(env.DB, "UPDATE bookings SET status='cancelled',cancelled_at=?,updated_at=? WHERE id=? AND customer_id=? AND status IN ('submitted','matching','offer_received')", now, now, booking.id, actor.userId);
    if (!updated.meta || Number(updated.meta.changes) !== 1) fail(409, "This booking has already changed.");
    await addBookingEvent(env.DB, booking.id, actor.userId, "booking_cancelled", booking.status, "cancelled");
    return json({ success: true, id: booking.id, status: "cancelled" });
  }
  return null;
}
async function handleProviders(request, env, path, actor) {
  if (!path.startsWith("/providers/")) return null;
  if (actor.role !== "provider") fail(403, "A provider account is required.");
  if (path === "/providers/me" && request.method === "GET") {
    const profile = await first(env.DB, "SELECT id,business_name,status,verification_notes,approved_at,created_at FROM provider_profiles WHERE user_id=?", actor.userId);
    if (!profile) return json({ status: "not_applied", services: [] });
    return json(await listProviderProfile(env.DB, profile.id));
  }
  if (path === "/providers/apply" && request.method === "POST") {
    const input = await readJson(request);
    const businessName = typeof input.businessName === "string" ? input.businessName.trim() : "";
    const services = Array.isArray(input.serviceTypes) ? [...new Set(input.serviceTypes)] : [];
    if (businessName.length < 2 || businessName.length > 120 || !services.length || services.some((s) => !SERVICE_TYPES.includes(s))) fail(400, "Enter a business name and choose at least one valid service.");
    const provider = await first(env.DB,
      "INSERT INTO provider_profiles(id,user_id,business_name,status) VALUES(?,?,?,'pending') " +
      "ON CONFLICT(user_id) DO UPDATE SET business_name=excluded.business_name,status=CASE WHEN provider_profiles.status='rejected' THEN 'pending' ELSE provider_profiles.status END,updated_at=? " +
      "RETURNING id,status",
      uuid(), actor.userId, businessName, isoNow()
    );
    for (const service of services) {
      await run(env.DB, "INSERT INTO provider_services(id,provider_id,service_type,is_approved) VALUES(?,?,?,0) ON CONFLICT(provider_id,service_type) DO NOTHING", uuid(), provider.id, service);
    }
    return json(await listProviderProfile(env.DB, provider.id));
  }
  const profile = await requireProvider(env, actor);
  if (path === "/providers/requests" && request.method === "GET") {
    const serviceRows = await all(env.DB, "SELECT service_type FROM provider_services WHERE provider_id=? AND is_approved=1", profile.id);
    const services = serviceRows.map((row) => row.service_type);
    if (!services.length) return json([]);
    const marks = services.map(() => "?").join(",");
    const rows = await all(env.DB,
      bookingSelect + " WHERE b.assigned_provider_id IS NULL AND b.status IN ('submitted','matching','offer_received') AND b.service_type IN (" + marks + ") ORDER BY b.created_at ASC LIMIT 100",
      ...services
    );
    return json(rows.map(mapBooking));
  }
  if (path === "/providers/jobs" && request.method === "GET") {
    const rows = await all(env.DB,
      bookingSelect + " WHERE b.assigned_provider_id=? AND b.status NOT IN ('completed','cancelled','expired') ORDER BY b.updated_at DESC LIMIT 100",
      profile.id
    );
    return json(rows.map(mapBooking));
  }
  const accept = /^\/providers\/bookings\/([0-9a-f-]+)\/accept$/i.exec(path);
  if (accept && request.method === "POST") {
    const booking = await first(env.DB, "SELECT id,service_type,status,assigned_provider_id FROM bookings WHERE id=?", accept[1]);
    if (!booking) fail(404, "Booking not found.");
    if (booking.assigned_provider_id) fail(409, "This request has already been assigned.");
    if (!["submitted","matching","offer_received"].includes(booking.status)) fail(409, "This request is no longer available.");
    const service = await first(env.DB, "SELECT id FROM provider_services WHERE provider_id=? AND service_type=? AND is_approved=1", profile.id, booking.service_type);
    if (!service) fail(403, "Your account is not approved for this service.");
    const now = isoNow();
    const updated = await run(env.DB, "UPDATE bookings SET assigned_provider_id=?,status='accepted',accepted_at=?,updated_at=? WHERE id=? AND assigned_provider_id IS NULL AND status IN ('submitted','matching','offer_received')", profile.id, now, now, booking.id);
    if (!updated.meta || Number(updated.meta.changes) !== 1) fail(409, "This request has already been assigned.");
    await addBookingEvent(env.DB, booking.id, actor.userId, "provider_accepted", booking.status, "accepted");
    return json({ success: true, bookingId: booking.id, status: "accepted" });
  }
  const advance = /^\/providers\/bookings\/([0-9a-f-]+)\/advance$/i.exec(path);
  if (advance && request.method === "POST") {
    const booking = await first(env.DB, "SELECT id,status FROM bookings WHERE id=? AND assigned_provider_id=?", advance[1], profile.id);
    if (!booking) fail(404, "Assigned booking not found.");
    const nextStates = { accepted: "provider_en_route", provider_en_route: "arrived", arrived: "in_progress", in_progress: "completed" };
    const next = nextStates[booking.status];
    if (!next) fail(409, "This job cannot advance from its current status.");
    const now = isoNow();
    const updated = await run(env.DB,
      "UPDATE bookings SET status=?,updated_at=?,completed_at=CASE WHEN ?='completed' THEN ? ELSE completed_at END WHERE id=? AND assigned_provider_id=? AND status=?",
      next, now, next, now, booking.id, profile.id, booking.status
    );
    if (!updated.meta || Number(updated.meta.changes) !== 1) fail(409, "The job status changed. Refresh and try again.");
    await addBookingEvent(env.DB, booking.id, actor.userId, "provider_status_updated", booking.status, next);
    if (next === "completed") await run(env.DB, "UPDATE provider_live_tracking SET enabled=0,stopped_at=? WHERE booking_id=?", now, booking.id);
    return json({ success: true, bookingId: booking.id, status: next });
  }
  const tracking = /^\/providers\/bookings\/([0-9a-f-]+)\/tracking\/(start|stop)$/i.exec(path);
  if (tracking && request.method === "POST") {
    const booking = await first(env.DB, "SELECT id,status FROM bookings WHERE id=? AND assigned_provider_id=?", tracking[1], profile.id);
    if (!booking) fail(404, "Assigned booking not found.");
    if (!ACTIVE_STATUSES.includes(booking.status)) fail(409, "Location sharing is available only during an active job.");
    if (tracking[2] === "start") {
      await run(env.DB, "INSERT INTO provider_live_tracking(booking_id,provider_id,enabled,started_at,stopped_at) VALUES(?,?,1,?,NULL) ON CONFLICT(booking_id) DO UPDATE SET provider_id=excluded.provider_id,enabled=1,started_at=excluded.started_at,stopped_at=NULL", booking.id, profile.id, isoNow());
      await addBookingEvent(env.DB, booking.id, actor.userId, "provider_location_sharing_started", booking.status, booking.status);
      return json({ success: true, tracking: true });
    }
    await run(env.DB, "UPDATE provider_live_tracking SET enabled=0,stopped_at=? WHERE booking_id=? AND provider_id=?", isoNow(), booking.id, profile.id);
    await addBookingEvent(env.DB, booking.id, actor.userId, "provider_location_sharing_stopped", booking.status, booking.status);
    return json({ success: true, tracking: false });
  }
  const location = /^\/providers\/bookings\/([0-9a-f-]+)\/location$/i.exec(path);
  if (location && request.method === "POST") {
    const booking = await first(env.DB,
      "SELECT b.id,b.status FROM bookings b JOIN provider_live_tracking t ON t.booking_id=b.id AND t.provider_id=? AND t.enabled=1 WHERE b.id=? AND b.assigned_provider_id=?",
      profile.id, location[1], profile.id
    );
    if (!booking || !ACTIVE_STATUSES.includes(booking.status)) fail(403, "Start location sharing for this active job first.");
    const input = await readJson(request, 16 * 1024);
    if (!validCoordinate(input.latitude, input.longitude)) fail(400, "Invalid location coordinates.");
    await run(env.DB,
      "INSERT INTO location_samples(id,booking_id,provider_id,latitude,longitude,accuracy_m,recorded_at) VALUES(?,?,?,?,?,?,?)",
      uuid(), booking.id, profile.id, Number(input.latitude), Number(input.longitude), Number.isFinite(Number(input.accuracy)) ? Number(input.accuracy) : null, isoNow()
    );
    return json({ success: true, recordedAt: isoNow() });
  }
  const trackingDoc = /^\/providers\/documents$/i.test(path);
  if (trackingDoc && request.method === "POST") {
    const form = await request.formData();
    const file = form.get("file");
    const documentType = String(form.get("documentType") || "other").slice(0,60);
    if (!(file instanceof File)) fail(400, "Choose a file to upload.");
    if (file.size < 1 || file.size > 15 * 1024 * 1024) fail(413, "Documents must be smaller than 15 MB.");
    if (!["application/pdf","image/jpeg","image/png"].includes(file.type)) fail(415, "Only PDF, JPG and PNG documents are accepted.");
    const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
    const key = "providers/" + profile.id + "/" + uuid() + "." + extension;
    await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { providerId: profile.id, documentType } });
    await run(env.DB, "INSERT INTO provider_documents(id,provider_id,document_type,object_key,content_type,byte_size) VALUES(?,?,?,?,?,?)", uuid(), profile.id, documentType, key, file.type, file.size);
    return json({ success: true }, 201);
  }
  return null;
}
async function adminSetup(request, env, url) {
  checkAdminOrigin(request, url);
  if (request.method !== "GET" && request.method !== "POST") return null;
  if (url.pathname === "/v1/admin/setup/status" && request.method === "GET") {
    const row = await first(env.DB, "SELECT COUNT(*) AS count FROM admin_users");
    return json({ initialized: Number(row.count) > 0 });
  }
  if (url.pathname === "/v1/admin/setup" && request.method === "POST") {
    const input = await readJson(request);
    const supplied = request.headers.get("x-setup-key") || "";
    if (!constantTimeStringEqual(await digest(supplied), ADMIN_SETUP_KEY_HASH)) fail(403, "The first-time setup key is incorrect.");
    const count = await first(env.DB, "SELECT COUNT(*) AS count FROM admin_users");
    if (Number(count.count) > 0) fail(409, "Administrator setup has already been completed.");
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
    if (!validEmail(email) || displayName.length < 2 || displayName.length > 80) fail(400, "Enter a valid email and administrator name.");
    const encoded = await passwordHash(input.password);
    const admin = { id: uuid(), email, display_name: displayName, must_change_password: 0 };
    await run(env.DB, "INSERT INTO admin_users(id,email,display_name,password_hash) VALUES(?,?,?,?)", admin.id, email, displayName, encoded);
    await addAudit(env.DB, admin.id, null, "admin_initialized", "admin_user", admin.id);
    const session = await createAdminSession(env.DB, admin);
    return json({ user: session.user }, 201, { "Set-Cookie": adminCookie(session.token, 43200) });
  }
  return null;
}
async function adminLogin(request, env, url) {
  checkAdminOrigin(request, url);
  if (url.pathname === "/v1/admin/auth/login" && request.method === "POST") {
    const input = await readJson(request);
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    await rateLimitRequest(env.DB, request, "admin:" + email);
    const admin = await first(env.DB, "SELECT id,email,display_name,password_hash,status,must_change_password FROM admin_users WHERE email=? COLLATE NOCASE", email);
    const valid = admin && admin.status === "active" && await verifyPassword(input.password, admin.password_hash);
    if (!valid) fail(401, "The administrator email or password is incorrect.");
    const session = await createAdminSession(env.DB, admin);
    await run(env.DB, "UPDATE admin_users SET last_login_at=?,updated_at=? WHERE id=?", isoNow(), isoNow(), admin.id);
    return json({ user: session.user }, 200, { "Set-Cookie": adminCookie(session.token, 43200) });
  }
  return null;
}
async function requireAdminRequest(request, env) {
  const actor = await getAdminActor(request, env);
  if (actor.must_change_password) fail(403, "Change the temporary administrator password before continuing.");
  return actor;
}
async function handleAdmin(request, env, url) {
  if (!url.pathname.startsWith("/v1/admin/")) return null;
  const setup = await adminSetup(request, env, url);
  if (setup) return setup;
  const login = await adminLogin(request, env, url);
  if (login) return login;
  if (url.pathname === "/v1/admin/me" && request.method === "GET") {
    const actor = await getAdminActor(request, env);
    return json({ user: { id: actor.admin_id, email: actor.email, displayName: actor.display_name, mustChangePassword: Boolean(actor.must_change_password) } });
  }
  if (url.pathname === "/v1/admin/auth/logout" && request.method === "POST") {
    checkAdminOrigin(request, url);
    const token = cookieValue(request, "__Host-wessali_admin");
    if (token) await run(env.DB, "DELETE FROM admin_sessions WHERE token_hash=?", await digest(token));
    return json({ success: true }, 200, { "Set-Cookie": adminCookie("", 0) });
  }
  if (url.pathname === "/v1/admin/change-password" && request.method === "POST") {
    checkAdminOrigin(request, url);
    const actor = await getAdminActor(request, env);
    const input = await readJson(request);
    const current = await first(env.DB, "SELECT password_hash FROM admin_users WHERE id=?", actor.admin_id);
    if (!current || !await verifyPassword(input.currentPassword, current.password_hash)) fail(401, "The current password is incorrect.");
    const encoded = await passwordHash(input.newPassword);
    await run(env.DB, "UPDATE admin_users SET password_hash=?,must_change_password=0,updated_at=? WHERE id=?", encoded, isoNow(), actor.admin_id);
    await run(env.DB, "DELETE FROM admin_sessions WHERE admin_user_id=? AND id<>?", actor.admin_id, actor.session_id);
    return json({ success: true });
  }

  const actor = await requireAdminRequest(request, env);
  const path = url.pathname.replace(/^\/v1/, "");
  if (path === "/admin/overview" && request.method === "GET") {
    const row = await first(env.DB,
      "SELECT COUNT(*) AS total_bookings," +
      "SUM(CASE WHEN status IN ('submitted','matching','offer_received','accepted','provider_en_route','arrived','in_progress') THEN 1 ELSE 0 END) AS active_bookings," +
      "SUM(CASE WHEN status IN ('submitted','matching','offer_received') THEN 1 ELSE 0 END) AS pending_bookings," +
      "SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_bookings " +
      "FROM bookings"
    );
    const users = await first(env.DB, "SELECT COUNT(*) AS total_users FROM users WHERE status<>'deleted'");
    const providers = await first(env.DB,
      "SELECT SUM(CASE WHEN status IN ('pending','under_review') THEN 1 ELSE 0 END) AS pending_providers," +
      "SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved_providers FROM provider_profiles"
    );
    const payments = await first(env.DB, "SELECT SUM(CASE WHEN status='paid' THEN amount_minor ELSE 0 END) AS paid_amount_minor,COUNT(*) AS payment_count FROM payment_records");
    const daily = await all(env.DB,
      "SELECT date(created_at) AS day,COUNT(*) AS count FROM bookings WHERE created_at>=datetime('now','-13 days') GROUP BY date(created_at) ORDER BY day"
    );
    const statuses = await all(env.DB, "SELECT status,COUNT(*) AS count FROM bookings GROUP BY status ORDER BY count DESC");
    const services = await all(env.DB, "SELECT service_type,COUNT(*) AS count FROM bookings GROUP BY service_type ORDER BY count DESC");
    return json({
      total_bookings: Number(row.total_bookings || 0), active_bookings: Number(row.active_bookings || 0),
      pending_bookings: Number(row.pending_bookings || 0), completed_bookings: Number(row.completed_bookings || 0),
      total_users: Number(users.total_users || 0), pending_providers: Number(providers.pending_providers || 0),
      approved_providers: Number(providers.approved_providers || 0), paid_amount_minor: Number(payments.paid_amount_minor || 0),
      payment_count: Number(payments.payment_count || 0), daily, statuses, services
    });
  }
  if (path === "/admin/bookings" && request.method === "GET") {
    const limit = safeInt(url.searchParams.get("limit"), 400, 1, 1000);
    const rows = await all(env.DB, bookingSelect + " ORDER BY b.created_at DESC LIMIT ?", limit);
    return json(rows.map((row) => ({ ...mapBooking(row), customer_id: row.customer_id, assigned_provider_id: row.assigned_provider_id })));
  }
  if (path === "/admin/users" && request.method === "GET") {
    const rows = await all(env.DB,
      "SELECT u.id,u.phone_e164,u.status,u.phone_verified_at,u.last_login_at,u.created_at,p.display_name," +
      "CASE WHEN EXISTS(SELECT 1 FROM provider_profiles pp WHERE pp.user_id=u.id) THEN 'provider' ELSE 'customer' END AS role " +
      "FROM users u JOIN user_profiles p ON p.user_id=u.id ORDER BY u.created_at DESC LIMIT 500"
    );
    return json(rows);
  }
  if (path === "/admin/providers" && request.method === "GET") {
    const rows = await all(env.DB,
      "SELECT p.id,p.user_id,p.business_name,p.status,p.verification_notes,p.created_at,p.approved_at," +
      "u.phone_e164,up.display_name FROM provider_profiles p JOIN users u ON u.id=p.user_id " +
      "JOIN user_profiles up ON up.user_id=u.id ORDER BY p.created_at DESC LIMIT 300"
    );
    for (const row of rows) {
      const services = await all(env.DB, "SELECT service_type AS serviceType,is_approved AS approved FROM provider_services WHERE provider_id=?", row.id);
      row.services = services.map((s) => ({ serviceType: s.serviceType, approved: Boolean(s.approved) }));
    }
    return json(rows);
  }
  if (path === "/admin/locations" && request.method === "GET") {
    const rows = await all(env.DB,
      "SELECT b.id,b.public_reference,b.service_type,b.status,b.pickup_address,b.pickup_latitude,b.pickup_longitude," +
      "b.destination_address,b.destination_latitude,b.destination_longitude,up.display_name AS customer_name," +
      "pp.business_name AS provider_name,ls.latitude AS provider_latitude,ls.longitude AS provider_longitude," +
      "ls.recorded_at AS provider_location_at,t.enabled AS tracking_enabled " +
      "FROM bookings b JOIN user_profiles up ON up.user_id=b.customer_id " +
      "LEFT JOIN provider_profiles pp ON pp.id=b.assigned_provider_id " +
      "LEFT JOIN provider_live_tracking t ON t.booking_id=b.id AND t.enabled=1 " +
      "LEFT JOIN location_samples ls ON ls.id=(SELECT id FROM location_samples x WHERE x.booking_id=b.id ORDER BY x.recorded_at DESC LIMIT 1) " +
      "WHERE ((b.pickup_latitude IS NOT NULL AND b.pickup_longitude IS NOT NULL) OR (b.destination_latitude IS NOT NULL AND b.destination_longitude IS NOT NULL)) " +
      "ORDER BY b.updated_at DESC LIMIT 500"
    );
    return json(rows.map((row) => {
      const fresh = row.provider_location_at && Date.parse(row.provider_location_at) > Date.now() - 10 * 60 * 1000;
      return { ...row, provider_latitude: row.tracking_enabled && fresh ? row.provider_latitude : null,
        provider_longitude: row.tracking_enabled && fresh ? row.provider_longitude : null,
        tracking_enabled: Boolean(row.tracking_enabled && fresh) };
    }));
  }
  if (path === "/admin/payments" && request.method === "GET") {
    return json(await all(env.DB,
      "SELECT p.id,p.booking_id,b.public_reference,p.amount_minor,p.currency,p.method,p.status,p.external_reference,p.created_at " +
      "FROM payment_records p JOIN bookings b ON b.id=p.booking_id ORDER BY p.created_at DESC LIMIT 300"
    ));
  }
  if (path === "/admin/audit" && request.method === "GET") {
    return json(await all(env.DB,
      "SELECT a.id,a.action,a.entity_type,a.entity_id,a.metadata,a.created_at,au.display_name AS admin_name,up.display_name AS user_name " +
      "FROM audit_events a LEFT JOIN admin_users au ON au.id=a.actor_admin_id LEFT JOIN user_profiles up ON up.user_id=a.actor_user_id " +
      "ORDER BY a.created_at DESC LIMIT 250"
    ));
  }
  const providerReview = /^\/admin\/providers\/([0-9a-f-]+)\/review$/i.exec(path);
  if (providerReview && request.method === "POST") {
    const input = await readJson(request);
    if (!["approve","reject","suspend"].includes(input.decision)) fail(400, "Choose a valid provider decision.");
    const current = await first(env.DB, "SELECT id,status FROM provider_profiles WHERE id=?", providerReview[1]);
    if (!current) fail(404, "Provider application not found.");
    const status = input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "suspended";
    const now = isoNow();
    await env.DB.batch([
      env.DB.prepare("UPDATE provider_profiles SET status=?,verification_notes=?,approved_at=CASE WHEN ?='approved' THEN ? ELSE NULL END,updated_at=? WHERE id=?")
        .bind(status, String(input.notes || "").slice(0,1000) || null, status, now, now, current.id),
      env.DB.prepare("UPDATE provider_services SET is_approved=? WHERE provider_id=?").bind(status === "approved" ? 1 : 0, current.id)
    ]);
    await addAudit(env.DB, actor.admin_id, null, "provider_" + input.decision, "provider_profile", current.id, { notes: String(input.notes || "").slice(0,500) });
    return json({ success: true, id: current.id, status });
  }
  const userStatus = /^\/admin\/users\/([0-9a-f-]+)\/status$/i.exec(path);
  if (userStatus && request.method === "POST") {
    const input = await readJson(request);
    if (!["active","suspended"].includes(input.status)) fail(400, "Choose active or suspended.");
    const user = await first(env.DB, "SELECT id FROM users WHERE id=?", userStatus[1]);
    if (!user) fail(404, "Account not found.");
    await run(env.DB, "UPDATE users SET status=?,updated_at=? WHERE id=?", input.status, isoNow(), user.id);
    if (input.status === "suspended") await run(env.DB, "DELETE FROM auth_sessions WHERE user_id=?", user.id);
    await addAudit(env.DB, actor.admin_id, null, "user_" + input.status, "user", user.id);
    return json({ success: true, id: user.id, status: input.status });
  }
  const bookingStatus = /^\/admin\/bookings\/([0-9a-f-]+)\/status$/i.exec(path);
  if (bookingStatus && request.method === "POST") {
    const input = await readJson(request);
    const allowed = ["submitted","matching","offer_received","accepted","provider_en_route","arrived","in_progress","completed","cancelled","expired","disputed"];
    if (!allowed.includes(input.status)) fail(400, "Choose a valid booking status.");
    const booking = await first(env.DB, "SELECT id,status FROM bookings WHERE id=?", bookingStatus[1]);
    if (!booking) fail(404, "Booking not found.");
    const now = isoNow();
    await run(env.DB, "UPDATE bookings SET status=?,updated_at=?,completed_at=CASE WHEN ?='completed' THEN ? ELSE completed_at END,cancelled_at=CASE WHEN ?='cancelled' THEN ? ELSE cancelled_at END WHERE id=?",
      input.status,now,input.status,now,input.status,now,booking.id);
    await addBookingEvent(env.DB, booking.id, null, "admin_status_updated", booking.status, input.status, { adminId: actor.admin_id });
    await addAudit(env.DB, actor.admin_id, null, "booking_status_updated", "booking", booking.id, { from: booking.status, to: input.status });
    return json({ success: true, id: booking.id, status: input.status });
  }
  const bookingEvents = /^\/admin\/bookings\/([0-9a-f-]+)\/events$/i.exec(path);
  if (bookingEvents && request.method === "GET") {
    const exists = await first(env.DB, "SELECT id FROM bookings WHERE id=?", bookingEvents[1]);
    if (!exists) fail(404, "Booking not found.");
    const events = await all(env.DB,
      "SELECT e.id,e.event_type,e.previous_status,e.new_status,e.payload,e.created_at,up.display_name AS actor_name " +
      "FROM booking_events e LEFT JOIN user_profiles up ON up.user_id=e.actor_user_id WHERE e.booking_id=? ORDER BY e.created_at DESC LIMIT 200",
      bookingEvents[1]
    );
    const locations = await all(env.DB, "SELECT latitude,longitude,accuracy_m,recorded_at FROM location_samples WHERE booking_id=? ORDER BY recorded_at DESC LIMIT 100", bookingEvents[1]);
    return json({ events, locations });
  }
  const doc = /^\/admin\/documents\/([0-9a-f-]+)$/i.exec(path);
  if (doc && request.method === "GET") {
    const record = await first(env.DB, "SELECT id,object_key,content_type FROM provider_documents WHERE id=?", doc[1]);
    if (!record) fail(404, "Document not found.");
    const object = await env.FILES.get(record.object_key);
    if (!object) fail(404, "The document file is no longer available.");
    return new Response(object.body, { headers: { "Content-Type": record.content_type, "Cache-Control": "private, no-store", "Content-Disposition": "inline; filename=\"provider-document\"" } });
  }
  return null;
}
async function handleCustomerTracking(request, env, path, actor) {
  const match = /^\/bookings\/([0-9a-f-]+)\/tracking$/i.exec(path);
  if (!match || request.method !== "GET") return null;
  if (actor.role !== "customer") fail(403, "A customer account is required.");
  const booking = await first(env.DB,
    "SELECT b.id,b.status,b.customer_id,ls.latitude,ls.longitude,ls.recorded_at,t.enabled " +
    "FROM bookings b LEFT JOIN provider_live_tracking t ON t.booking_id=b.id AND t.enabled=1 " +
    "LEFT JOIN location_samples ls ON ls.id=(SELECT id FROM location_samples x WHERE x.booking_id=b.id ORDER BY x.recorded_at DESC LIMIT 1) " +
    "WHERE b.id=? AND b.customer_id=?",
    match[1], actor.userId
  );
  if (!booking) fail(404, "Booking not found.");
  const fresh = booking.recorded_at && Date.parse(booking.recorded_at) > Date.now() - 10 * 60 * 1000;
  return json({ status: booking.status, providerLocation: booking.enabled && fresh ? {
    latitude: booking.latitude, longitude: booking.longitude, recordedAt: booking.recorded_at
  } : null });
}
function corsHeaders(request, url) {
  const origin = request.headers.get("origin");
  const allowed = !origin || origin === url.origin || origin === "http://localhost:3000" || origin === "http://localhost:8081";
  const headers = { "Vary": "Origin" };
  if (origin && allowed) headers["Access-Control-Allow-Origin"] = origin;
  if (origin && allowed) headers["Access-Control-Allow-Credentials"] = "true";
  return headers;
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/admin" || path === "/admin/") {
      return new Response(ADMIN_HTML, { headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin",
        "Permissions-Policy": "geolocation=(),camera=(),microphone=()",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self'; font-src 'self' https://unpkg.com"
      }});
    }
    if (!path.startsWith("/v1")) return json({ service: "wessali-platform", status: "ok", dashboard: "/admin" });
    const cors = corsHeaders(request, url);
    if (request.method === "OPTIONS") {
      if (request.headers.get("origin") && !cors["Access-Control-Allow-Origin"]) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: {
        ...cors,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Setup-Key",
        "Access-Control-Max-Age": "86400"
      }});
    }
    try {
      const route = path.replace(/^\/v1/, "") || "/";
      if (route === "/health" && request.method === "GET") {
        const check = await first(env.DB, "SELECT 1 AS ok");
        return json({ service: "wessali-api", status: check && check.ok === 1 ? "ok" : "degraded", database: "d1", timestamp: isoNow() }, 200, cors);
      }
      const auth = await handleAuth(request, env, route);
      if (auth) { Object.entries(cors).forEach(([k,v])=>auth.headers.set(k,v)); return auth; }
      const admin = await handleAdmin(request, env, url);
      if (admin) { Object.entries(cors).forEach(([k,v])=>admin.headers.set(k,v)); return admin; }
      const userActor = await getUserActor(request, env);
      const booking = await handleBookings(request, env, route, userActor);
      if (booking) { Object.entries(cors).forEach(([k,v])=>booking.headers.set(k,v)); return booking; }
      const tracking = await handleCustomerTracking(request, env, route, userActor);
      if (tracking) { Object.entries(cors).forEach(([k,v])=>tracking.headers.set(k,v)); return tracking; }
      const provider = await handleProviders(request, env, route, userActor);
      if (provider) { Object.entries(cors).forEach(([k,v])=>provider.headers.set(k,v)); return provider; }
      return json({ message: "Route not found." }, 404, cors);
    } catch (error) {
      if (error instanceof HttpError) return json({ message: error.message }, error.status, cors);
      console.error(JSON.stringify({ message: "Wessali request failed", path, error: error instanceof Error ? error.message : "Unknown error" }));
      return json({ message: "An unexpected server error occurred." }, 500, cors);
    }
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(Promise.all([
      run(env.DB, "DELETE FROM auth_sessions WHERE expires_at<=?", isoNow()),
      run(env.DB, "DELETE FROM admin_sessions WHERE expires_at<=?", isoNow()),
      run(env.DB, "DELETE FROM auth_rate_limits WHERE window_started_at<?", Math.floor(Date.now()/1000)-7200),
      run(env.DB, "DELETE FROM location_samples WHERE recorded_at<datetime('now','-30 days')")
    ]));
  }
};
