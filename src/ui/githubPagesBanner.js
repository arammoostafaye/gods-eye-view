/**
 * GitHub Pages Info Banner - Shows which features work on static hosting
 */

export function createGitHubPagesBanner() {
  const isGitHubPages = window.location.hostname.includes('github.io');
  if (!isGitHubPages) return null;

  const div = document.createElement('div');
  div.id = 'github-pages-banner';
  div.innerHTML = `
    <style>
      #github-pages-banner {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 996;
        background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,255,136,0.1));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0,212,255,0.3);
        border-radius: 12px;
        padding: 10px 16px;
        font-family: 'Vazirmatn', sans-serif;
        font-size: 11px;
        color: #e0e0e0;
        max-width: 90vw;
        width: 600px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideDown 0.5s ease;
      }
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      #github-pages-banner.hide {
        animation: slideUp 0.3s ease forwards;
      }
      @keyframes slideUp {
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; pointer-events: none; }
      }
      .gpb-icon { font-size: 20px; flex-shrink: 0; }
      .gpb-content { flex: 1; line-height: 1.4; }
      .gpb-title { font-weight: 700; color: #00d4ff; margin-bottom: 2px; }
      .gpb-text { color: #aaa; font-size: 10px; }
      .gpb-text strong { color: #fff; }
      .gpb-close {
        width: 24px; height: 24px; border-radius: 6px;
        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
        color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .gpb-close:hover { background: rgba(255,42,42,0.2); border-color: #ff2a2a; }
      @media (max-width: 768px) {
        #github-pages-banner { top: 50px; padding: 8px 12px; font-size: 10px; width: 95vw; }
        .gpb-text { font-size: 9px; }
      }
    </style>
    <div class="gpb-icon">ℹ️</div>
    <div class="gpb-content">
      <div class="gpb-title">GitHub Pages Mode - حالت گیتهاب پیجز</div>
      <div class="gpb-text">
        <strong style="color:#00ff88">✓ Working:</strong> Flights (via airplanes.live) • Military • Earthquakes • Country Intel • Cyber Threats • Currency LIVE<br>
        <strong style="color:#ffaa00">⚠ Limited:</strong> Bikeshare, AIS Vessels, CCTV, Traffic need Docker backend - برای همه لایه‌ها <code>docker-compose up</code> کنید
      </div>
    </div>
    <button class="gpb-close" id="gpb-close">✕</button>
  `;

  document.body.appendChild(div);

  const closeBtn = div.querySelector('#gpb-close');
  closeBtn.onclick = () => {
    div.classList.add('hide');
    setTimeout(() => div.remove(), 300);
    localStorage.setItem('gpb-dismissed', Date.now().toString());
  };

  // Auto-hide after 10 seconds if dismissed before
  const dismissed = localStorage.getItem('gpb-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
    div.style.display = 'none';
  } else {
    setTimeout(() => {
      if (div.parentNode) {
        div.classList.add('hide');
        setTimeout(() => div.remove(), 300);
      }
    }, 10000);
  }

  return div;
}
