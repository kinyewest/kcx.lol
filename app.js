(() => {
  'use strict';

  const canvas = document.getElementById('bgCanvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const gridSize = 60;
  let w = 0;
  let h = 0;
  let dpr = 1;

  const codeSnippets = [
    'SEC("lsm/bprm_check_security")',
    'if (inode->i_nlink == 0) return -EPERM;',
    'bgp_anycast :: quorum=3/3 loss=0ms',
    'raft_wal_sync(replicas = 3)',
    'etw_ti :: strip_lsass_vm_read()',
    'sessions_active = 1_200_000;',
    'wireguard_mtls :: pin_verified',
    'xdp_pass :: latency=0.24ms',
    'failover_standby :: hot_sync',
    'ringbuf_emit(ALLOW_VERIFIED_ELF)'
  ];

  let traces = [];
  let floatingCode = [];

  function initScene() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    traces = Array.from({ length: 8 }, () => ({
      horizontal: Math.random() > 0.35,
      pos: Math.floor((Math.random() * (w > h ? w : h)) / gridSize) * gridSize,
      offset: Math.random() * (w > h ? w : h),
      speed: 0.45 + Math.random() * 0.75,
      len: 80 + Math.random() * 110
    }));

    floatingCode = Array.from({ length: 9 }, (_, idx) => ({
      text: codeSnippets[idx % codeSnippets.length],
      x: Math.random() * (w - 220) + 30,
      y: Math.random() * h,
      speed: 0.16 + Math.random() * 0.22,
      alpha: 0.055 + Math.random() * 0.065
    }));
  }

  window.addEventListener('resize', initScene, { passive: true });
  initScene();

  function render() {
    ctx.clearRect(0, 0, w, h);

    // 1. Subtle drifting ambient code lines
    ctx.font = '11px "JetBrains Mono", monospace';
    for (let i = 0; i < floatingCode.length; i++) {
      const c = floatingCode[i];
      c.y -= c.speed;
      if (c.y < -20) {
        c.y = h + 20;
        c.x = Math.random() * Math.max(100, w - 260) + 20;
        c.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      }
      ctx.fillStyle = `rgba(138, 150, 168, ${c.alpha})`;
      ctx.fillText(c.text, c.x, c.y);
    }

    // 2. Clean grid-aligned moving trace lines
    ctx.lineWidth = 1;
    for (let i = 0; i < traces.length; i++) {
      const t = traces[i];
      t.offset += t.speed;

      if (t.horizontal) {
        const y = t.pos % h;
        if (t.offset - t.len > w) {
          t.offset = -20;
          t.pos = Math.floor((Math.random() * h) / gridSize) * gridSize;
        }
        const grad = ctx.createLinearGradient(t.offset - t.len, y, t.offset, y);
        grad.addColorStop(0, 'rgba(61, 220, 132, 0)');
        grad.addColorStop(1, 'rgba(61, 220, 132, 0.24)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(t.offset - t.len, y);
        ctx.lineTo(t.offset, y);
        ctx.stroke();
      } else {
        const x = t.pos % w;
        if (t.offset - t.len > h) {
          t.offset = -20;
          t.pos = Math.floor((Math.random() * w) / gridSize) * gridSize;
        }
        const grad = ctx.createLinearGradient(x, t.offset - t.len, x, t.offset);
        grad.addColorStop(0, 'rgba(61, 220, 132, 0)');
        grad.addColorStop(1, 'rgba(61, 220, 132, 0.2)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, t.offset - t.len);
        ctx.lineTo(x, t.offset);
        ctx.stroke();
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
