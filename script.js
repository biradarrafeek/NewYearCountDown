
    // === Utilities & target date ===
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const celebrateBtn = document.getElementById('celebrate');
    const messageArea = document.getElementById('messageArea');
    const dateInput = document.getElementById('dateInput');
    const preset = document.getElementById('preset');

    // compute next Jan 1 (auto)
    function nextJanFirst(){
      const now = new Date();
      const year = now.getFullYear() + (now.getMonth()===11 && now.getDate()===31 ? 1 : 1);
      return new Date(year,0,1,0,0,0);
    }

    let target = nextJanFirst();
    // try to prefill datetime-local to user's timezone (HTML expects local)
    function toLocalInput(dt){
      const pad = n=>String(n).padStart(2,'0');
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    }
    dateInput.value = toLocalInput(target);

    preset.addEventListener('change',()=>{
      if(preset.value==='auto'){
        target = nextJanFirst();
        dateInput.value = toLocalInput(target);
      } else {
        // let user choose
        dateInput.focus();
      }
    })

    dateInput.addEventListener('change',()=>{
      const v = dateInput.value;
      if(!v) return;
      // create local Date from input
      const t = new Date(v);
      if(!isNaN(t)){
        target = t;
      }
    })

    // flip animation helper
    function animateNumber(el, value){
      el.animate([
        {transform:'translateY(-6px) scale(0.98)', opacity:0.2},
        {transform:'translateY(0) scale(1)', opacity:1}
      ],{duration:280,easing:'cubic-bezier(.2,.9,.2,1)'});
      el.textContent = value;
    }

    // countdown loop
    let countdownInterval;
    function startCountdown(){
      if(countdownInterval) clearInterval(countdownInterval);
      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 250);
    }

    function updateCountdown(){
      const now = new Date();
      let diff = Math.max(0, Math.floor((target - now) / 1000));
      const days = Math.floor(diff / 86400); diff %= 86400;
      const hours = Math.floor(diff / 3600); diff %= 3600;
      const minutes = Math.floor(diff / 60); const seconds = diff % 60;
      animateNumber(daysEl, days);
      animateNumber(hoursEl, String(hours).padStart(2,'0'));
      animateNumber(minutesEl, String(minutes).padStart(2,'0'));
      animateNumber(secondsEl, String(seconds).padStart(2,'0'));

      if(target - now <= 0){
        clearInterval(countdownInterval);
        onCompleted();
      }
    }

    // === Confetti (simple particles on canvas) ===
    const fx = document.getElementById('fx');
    const ctx = fx.getContext('2d');
    function resizeCanv(){ fx.width = fx.clientWidth = fx.offsetWidth; fx.height = fx.clientHeight = fx.offsetHeight; }
    window.addEventListener('resize', resizeCanv);
    resizeCanv();

    const confetti = [];
    function spawnConfetti(x,y,spread=60,count=40){
      for(let i=0;i<count;i++){
        confetti.push({
          x:x || Math.random()*fx.width,
          y:y || fx.height*0.2 + Math.random()*fx.height*0.4,
          vx:(Math.random()-0.5)*6 + (Math.random()-0.5)*spread/50,
          vy: -Math.random()*6 - 1,
          r: Math.random()*6+4,
          rot: Math.random()*360,
          drip: Math.random()>0.5,
          ttl: 200 + Math.random()*200,
          hue: 30 + Math.floor(Math.random()*320)
        });
      }
    }

    function updateConfetti(){
      ctx.clearRect(0,0,fx.width,fx.height);
      for(let i=confetti.length-1;i>=0;i--){
        const p = confetti[i];
        p.vy += 0.12; // gravity
        p.x += p.vx; p.y += p.vy; p.rot += p.vx*2; p.ttl--;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = `hsl(${p.hue} 80% 60%)`;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.5);
        ctx.restore();
        if(p.y > fx.height + 50 || p.ttl <= 0) confetti.splice(i,1);
      }
      requestAnimationFrame(updateConfetti);
    }
    requestAnimationFrame(updateConfetti);

    // === Fireworks (particle bursts on a second canvas) ===
    const fw = document.getElementById('fireworks');
    const fctx = fw.getContext('2d');
    function resizeFW(){ fw.width = fw.clientWidth = fw.offsetWidth; fw.height = fw.clientHeight = fw.offsetHeight; }
    window.addEventListener('resize', resizeFW);
    resizeFW();

    const rockets = [];
    const sparks = [];

    function launchFirework(){
      const startX = Math.random()*fw.width*0.8 + fw.width*0.1;
      rockets.push({x:startX, y:fw.height+10, vx:(Math.random()-0.5)*1.4, vy:-6 - Math.random()*3, life:70 + Math.random()*30, hue:Math.random()*360});
    }

    function explode(x,y,hue){
      const n = 30 + Math.floor(Math.random()*40);
      for(let i=0;i<n;i++){
        const ang = Math.random()*Math.PI*2;
        const sp = {x,y,vx:Math.cos(ang)*(2+Math.random()*6), vy:Math.sin(ang)*(2+Math.random()*6), life:40+Math.random()*40, hue:hue + (Math.random()*60-30)};
        sparks.push(sp);
      }
    }

    function updateFW(){
      fctx.clearRect(0,0,fw.width,fw.height);
      // rockets
      for(let i=rockets.length-1;i>=0;i--){
        const r = rockets[i];
        r.vy += 0.06;
        r.x += r.vx; r.y += r.vy; r.life--;
        fctx.beginPath();
        fctx.fillStyle = `hsl(${r.hue} 80% 60%)`;
        fctx.arc(r.x, r.y, 2.6, 0, Math.PI*2);
        fctx.fill();
        if(r.life<=0 || r.vy>0){
          explode(r.x,r.y,r.hue);
          rockets.splice(i,1);
        }
      }
      // sparks
      for(let i=sparks.length-1;i>=0;i--){
        const s = sparks[i];
        s.vy += 0.04;
        s.x += s.vx; s.y += s.vy; s.life--;
        fctx.beginPath();
        fctx.globalCompositeOperation = 'lighter';
        fctx.fillStyle = `hsla(${s.hue},90%,60% , ${Math.max(0, s.life/60)})`;
        fctx.arc(s.x, s.y, Math.max(0.8, Math.min(3, s.life/18)), 0, Math.PI*2);
        fctx.fill();
        if(s.y>fw.height+40 || s.life<=0) sparks.splice(i,1);
      }
      fctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(updateFW);
    }
    requestAnimationFrame(updateFW);

    // periodic fireworks
    let fireworksTimer;
    function startFireworks(){
      if(fireworksTimer) return;
      fireworksTimer = setInterval(()=>{ launchFirework(); if(Math.random()>0.6) launchFirework(); }, 350);
      // also spawn confetti bursts occasionally
      spawnConfetti(null,null,80,60);
    }
    function stopFireworks(){ clearInterval(fireworksTimer); fireworksTimer=null; }

    // when countdown completes
    function onCompleted(){
      messageArea.innerHTML = `<div class="countdown-announced"><div class="headline">Happy New Year! 🎉</div><div class="small">Wishing you a fantastic year ahead.</div></div>`;
      startFireworks();
      // big confetti
      spawnConfetti(fx.width*0.5, fx.height*0.2, 120, 160);
    }

    celebrateBtn.addEventListener('click', ()=>{ startFireworks(); spawnConfetti(fx.width/2, fx.height/2, 120, 120); });

    // start
    startCountdown();

    // small UX: clicking the countdown triggers a mini burst
    document.querySelector('.countdown').addEventListener('click',(e)=>{
      const rect = fx.getBoundingClientRect();
      spawnConfetti((e.clientX-rect.left), (e.clientY-rect.top), 90, 40);
      launchFirework();
    });

    // keep canvases sized to container
    function fitCanvases(){
      const wrap = document.querySelector('.wrap');
      [fx,fw].forEach(c=>{
        c.style.width = wrap.clientWidth + 'px';
        c.style.height = wrap.clientHeight + 'px';
      });
      resizeCanv(); resizeFW();
    }
    window.addEventListener('resize', fitCanvases);
    fitCanvases();
