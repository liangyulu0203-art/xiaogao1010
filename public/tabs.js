function initTabs() {
// === 1. PORTFOLIO TABS SETUP ===
    
    // 影片 - 分場(10場)設計
    const sceneTitles = [
        "第一場：完美的開播 (The Perfect Stream)", 
        "第二場：滿分的濾鏡 (Flawless Filter)", 
        "第三場：流量的焦慮 (Traffic Anxiety)",
        "第四場：金主的面具 (Sponsor's Mask)", 
        "第五場：酸民的狂歡 (Hater's Carnival)", 
        "第六場：地下室的真實 (Basement Reality)",
        "第七場：人設的崩塌 (Persona Collapse)", 
        "第八場：冰冷的伺服器 (Cold Servers)", 
        "第九場：無盡的重啟 (Endless Reboot)",
        "第十場：歸零 (Reset to Zero)"
    ];



    // Populate Videos Tab (10 Scenes)
    const videosGrid = document.querySelector('#tab-videos .videos-grid');
    if (videosGrid) {
        for (let i = 0; i < sceneTitles.length; i++) {
            videosGrid.innerHTML += createVideoCard(sceneTitles[i], "100", "分場設計", `場景 0${i+1}`);
        }
    }

    // Populate Shorts Tab (幕後花絮 Behind the scenes)
    const shortsGrid = document.querySelector('#tab-shorts .shorts-grid');
    if (shortsGrid) {
        const btsTitles = ["動態捕捉實錄", "場景建模縮時", "UI 設計變遷", "音效製作秘密", "掉漆的綠幕日常", "崩潰 DEBUG 實錄"];
        for(let i = 0; i < btsTitles.length; i++) {
            shortsGrid.innerHTML += `
                <div class="short-card">
                    <div class="short-thumbnail"><div class="short-overlay">▶</div></div>
                    <div class="short-title">${btsTitles[i]}</div>
                    <div class="short-meta">幕後花絮 (BTS)</div>
                </div>`;
        }
    }

    // Populate Live Tab (公播及展覽時間)
    const liveGrid = document.querySelector('#tab-live .videos-grid');
    if (liveGrid) {
        liveGrid.innerHTML += createVideoCard("🎊 2026 台北數位藝術節 - 實體展出", 0, "即將到來", "推薦前往", true);
        liveGrid.innerHTML += createVideoCard("💬《解構人設》線上公播與創作者對談", 45, "報名中", "線上論壇", true);
        liveGrid.innerHTML += createVideoCard("🏛️ 國立台灣美術館｜科技藝術特展", 120, "籌備中", "即將上線", true);
    }

    // Populate Playlists Tab (工作室YT作品)
    const playlistsGrid = document.querySelector('#tab-playlists .videos-grid');
    if (playlistsGrid) {
        playlistsGrid.innerHTML += createPlaylistCard("2025 互動網頁專案集", 12);
        playlistsGrid.innerHTML += createPlaylistCard("音樂錄影帶 (MV) 視覺設計", 8);
        playlistsGrid.innerHTML += createPlaylistCard("沉浸式投影影像紀錄", 5);
        playlistsGrid.innerHTML += createPlaylistCard("早期實驗性影像", 15);
    }

    // Populate Community Tab (即時資訊如參賽入圍等)
    const communityContainer = document.querySelector('#tab-community');
    if (communityContainer) {
        communityContainer.innerHTML = `
            <div class="community-post">
                <div class="post-header">
                    <div class="post-avatar"></div>
                    <div class="post-meta">
                        <span class="post-author">你也可以叫我小高 (工作室公告)</span>
                        <span class="post-time">最新消息</span>
                    </div>
                </div>
                <div class="post-content">🎉 狂賀！《你也可以叫我小高》入圍 2026 放視大賞與 KT 科藝獎！<br><br>這段時間的爆肝總算有了回報，感謝評審的肯定，也謝謝大家一路以來的支持。實體的展覽資訊將會在近期於「直播」與這裡公佈，敬請期待！🔥</div>
                <div class="post-actions">
                    <button>👍 1.5萬</button>
                    <button>👎</button>
                    <button>💬 682</button>
                </div>
            </div>
            <div class="community-post">
                <div class="post-header">
                    <div class="post-avatar"></div>
                    <div class="post-meta">
                        <span class="post-author">你也可以叫我小高 (開發日誌)</span>
                        <span class="post-time">1週前</span>
                    </div>
                </div>
                <div class="post-content">⚠️ 開發日誌更新：目前已經完成第 8 場（冰冷的伺服器）的場景建置。<br><br>團隊正在瘋狂打磨最後的「崩壞特效」，大家準備好迎接首頁隨時被撕裂的準備了嗎？（按鈕已經做好了，但我不會告訴你是哪一顆 🤫）</div>
                <div class="post-image" style="background: #222; display: flex; align-items: center; justify-content: center; color: #666;">[開發測試截圖 - 特效 Placeholder]</div>
                <div class="post-actions">
                    <button>👍 8,420</button>
                    <button>👎</button>
                    <button>💬 340</button>
                </div>
            </div>
        `;
    }

    function createVideoCard(title, views, days, duration, isLive) {
        return `
            <div class="video-card">
                <div class="thumbnail">
                    ${isLive ? '<span class="live-badge">已直播</span>' : `<span class="duration">${duration}</span>`}
                </div>
                <div class="video-info-wrapper">
                    <div class="video-info">
                        <h4 class="video-title">${title}</h4>
                        <div class="video-meta">觀看次數：${views}萬次 • ${days}天上傳</div>
                    </div>
                    <div class="more-btn">⋮</div>
                </div>
            </div>`;
    }

    function createPlaylistCard(title, count) {
        return `
            <div class="video-card">
                <div class="thumbnail playlist-thumb">
                    <div class="playlist-overlay">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M22 7H2v1h20V7zm-9 5H2v-1h11v1zm0 4H2v-1h11v1zm2 3v-8l7 4-7 4z"/></svg>
                        <span>${count} 部影片</span>
                    </div>
                </div>
                <div class="video-info-wrapper">
                    <div class="video-info">
                        <h4 class="video-title">${title}</h4>
                        <div class="video-meta">查看完整播放清單</div>
                    </div>
                    <div class="more-btn">⋮</div>
                </div>
            </div>`;
    }

    // === 1.5. CHANNEL TABS INTERACTION ===
    const tabsContainer = document.getElementById('channel-tabs');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabsContainer) {
        const tabs = tabsContainer.querySelectorAll('.tab[data-target]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const targetId = tab.getAttribute('data-target');
                tabContents.forEach(content => {
                    if (content.id === targetId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    

// === 4. TRUTH SLIDER LOGIC ===
    const slider = document.getElementById('truth-slider');
    const handle = document.getElementById('slider-handle');
    const afterImg = document.getElementById('slider-after');
    
    if (slider && handle && afterImg) {
        let isDragging = false;
        
        function updateSlider(e) {
            if (!isDragging) return;
            // Prevent default scrolling on phones while dragging slider
            if (e.type === 'touchmove') e.preventDefault();
            
            const rect = slider.getBoundingClientRect();
            let clientX = e.clientX;
            if (e.touches && e.touches.length > 0) clientX = e.touches[0].clientX;
            
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            
            let percentage = (x / rect.width) * 100;
            afterImg.style.width = percentage + '%';
            handle.style.left = percentage + '%';
        }
        
        handle.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
        handle.addEventListener('touchstart', (e) => { isDragging = true; });
        
        window.addEventListener('mousemove', updateSlider);
        window.addEventListener('touchmove', updateSlider, { passive: false });
        
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('touchend', () => isDragging = false);
    }

}
