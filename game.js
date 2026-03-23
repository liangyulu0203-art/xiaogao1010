function initGame() {
// === 2. ANTIGRAVITY EFFECT ===
    const liveBtn = document.getElementById('start-live-btn');
    const gameOverlay = document.getElementById('game-overlay');
    const canvas = document.getElementById('game-canvas');
    let ctx;
    if (canvas) ctx = canvas.getContext('2d');
    
    let isGameRunning = false;
    let groundY = window.innerHeight - 250;

    function globalResize() {
        if(canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            groundY = canvas.height - 250;
        }
    }
    window.addEventListener('resize', globalResize);
    globalResize();

    if (liveBtn) {
        liveBtn.addEventListener('click', () => {
            liveBtn.disabled = true;
            
            // Step 1 & 2: Scroll to target area
            const targetEl = document.querySelector('.videos-section');
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else window.scrollTo({ top: 300, behavior: 'smooth' });
            
            // Wait 2 seconds before Step 3 (Crumble)
            setTimeout(() => {
                triggerAntigravity();
            }, 2000); 
        });
    }

    // Pre-Game Menu Start Initialization
    const btnStartGame = document.getElementById('btn-start-game');
    const preGameMenu = document.getElementById('pre-game-menu');
    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            if (preGameMenu) preGameMenu.classList.add('move-up');
            // Give 0.2s for the slide up animation before starting calculations
            setTimeout(() => startGame(), 200);
        });
    }

    function triggerAntigravity() {
        // Step 3: DOM Crumbling
        // Boost z-index of the whole DOM container so elements drop IN FRONT of the newly revealed Canvas
        const container = document.querySelector('.channel-container');
        if (container) container.style.zIndex = '101'; // Canvas overlay is z-index 100
        
        const elements = document.querySelectorAll('.video-card, .short-card, .community-post, .about-text-content, .trailer-container, .channel-banner, .yt-navbar, .channel-header, .tab, .tab-search, .featured-section, .videos-section h3, .section-divider');
        const channelTabsDiv = document.getElementById('channel-tabs');
        if(channelTabsDiv) channelTabsDiv.style.border = 'none';
        
        // Initial Explosion Shake & SFX
        playSfx('damage');
        document.body.style.transform = `translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*20}px)`;
        setTimeout(() => document.body.style.transform = 'none', 100);

        // Disconnect layout
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Lock dimensions and positions
            el.style.width = rect.width + 'px';
            el.style.height = rect.height + 'px';
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.classList.add('antigravity-element');
            
            // Random physics constants
            el.vx = (Math.random() - 0.5) * 20;
            el.vy = (Math.random() - 1) * 15 - 5;
            el.vRot = (Math.random() - 0.5) * 15;
            el.rot = 0;
        });

        function updatePhysics() {
            let stillFalling = false;
            elements.forEach(el => {
                if(!el.classList.contains('antigravity-element')) return;
                el.vy += 0.8; // Gravity
                let x = parseFloat(el.style.left) + el.vx;
                let y = parseFloat(el.style.top) + el.vy;
                el.rot += el.vRot;
                
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.transform = `rotate(${el.rot}deg)`;
                
                if (y < window.innerHeight + 500) stillFalling = true;
            });
            
            if (stillFalling || !isGameRunning) {
                requestAnimationFrame(updatePhysics);
            } else {
                if(container) container.style.display = 'none'; // Only hide to save synchronous CPU blocking
                document.body.style.background = '#87CEEB'; // Sky blue backup
            }
        }
        updatePhysics();
        
        // Step 4: Scene Entrance (Wait 2s after crumble starts)
        setTimeout(() => {
            if (ctx) {
                gameOverlay.classList.remove('hidden'); // Reveal canvas layer immediately
                // Hide HUD during intro sequence
                const topHud = document.querySelector('.top-hud');
                const controls = document.querySelector('.controls-overlay');
                if (topHud) topHud.style.display = 'none';
                if (controls) controls.style.display = 'none';

                let introFrame = 0;
                let currentShake = 0;
                
                function drawLayerStatic(img, offsetX, offsetY, h) {
                if (img && img.complete && img.naturalHeight !== 0 && !Array.isArray(img)) {
                    let scaledWidth = img.naturalWidth * (h / img.naturalHeight);
                    if (scaledWidth <= 0) return;
                    let numTiles = Math.ceil(canvas.width / scaledWidth) + 1;
                    let x = offsetX % scaledWidth;
                    if (x > 0) x -= scaledWidth;
                    for (let i = 0; i < numTiles + 1; i++) {
                        ctx.drawImage(img, x + i * scaledWidth, offsetY, scaledWidth, h);
                    }
                }
            }

            function drawIntro() {
                if (isGameRunning) {
                    canvas.style.transform = 'none'; // Cleanup camera shake
                    return; 
                }
                introFrame++;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Sequence Timing (5.0s bg + 3.3s character):
                // Ground (bg3) enters first
                let tGround = Math.min(1, introFrame / 100);
                let eGround = 1 - Math.pow(1 - tGround, 3); // Ease out
                let bg3Y_offset = (1 - eGround) * canvas.height; 
                
                // Mid distance (bg2) enters second
                let tMid = Math.min(1, Math.max(0, (introFrame - 100) / 100));
                let eMid = 1 - Math.pow(1 - tMid, 3);
                let bg2Y_offset = (1 - eMid) * canvas.height;
                
                // Far distance (bg1) enters third
                let tFar = Math.min(1, Math.max(0, (introFrame - 200) / 100));
                let eFar = 1 - Math.pow(1 - tFar, 3);
                let bg1Y_offset = (1 - eFar) * canvas.height;
                
                let transitShake = 0;
                if (introFrame === 1) playSfx('quake'); // Play continuous rumble!
                
                if (introFrame < 100) transitShake = 2; // minor vibration during entry
                else if (introFrame === 100) { currentShake = 20; playSfx('damage'); } // Boom! Next layer
                else if (introFrame < 200) transitShake = 4;
                else if (introFrame === 200) { currentShake = 35; playSfx('damage'); } 
                else if (introFrame < 300) transitShake = 8;
                else if (introFrame === 300) { currentShake = 60; playSfx('damage'); stopSfx('quake'); } // Final huge boom and silence rumble 
                
                // Apply combined multi-layer Shake
                let totalShake = currentShake + transitShake;
                if (totalShake > 0) {
                    let dx = (Math.random() - 0.5) * totalShake;
                    let dy = (Math.random() - 0.5) * totalShake;
                    canvas.style.transform = `translate(${dx}px, ${dy}px)`;
                    currentShake *= 0.85; // Faster sharp decay
                    if (currentShake < 1) currentShake = 0;
                } else {
                    canvas.style.transform = 'none';
                }
                
                if (introFrame > 0) {
                    ctx.save();
                    ctx.translate(0, bg1Y_offset);
                    drawLayerStatic(images.bg1, 0, 0, canvas.height);
                    ctx.restore();
                }
                if (introFrame > 0) {
                    ctx.save();
                    ctx.translate(0, bg2Y_offset);
                    drawLayerStatic(images.bg2, 0, groundY - 600, 800);
                    ctx.restore();
                }
                if (introFrame > 0) {
                    let surfaceHeight = 160; 
                    drawLayerStatic(images.bg3, 0, groundY - 30 + bg3Y_offset, surfaceHeight); 
                    ctx.fillStyle = '#4a2f1d'; 
                    ctx.fillRect(0, groundY - 30 + surfaceHeight - 5 + bg3Y_offset, canvas.width, canvas.height);
                }
                
                // Cinematic Character Entrance (Frame 300 -> 500)
                if (introFrame > 300) {
                    let pT = Math.min(1, (introFrame - 300) / 200); 
                    let pE = 1 - Math.pow(1 - pT, 2); // Deaccelerate smoothly
                    let pX = canvas.width - pE * (canvas.width - 200); // 200 is starting X
                    
                    let isWalking = pT < 1;
                    let pY = groundY - 220; // Player natural height
                    
                    if (isWalking) {
                        pY -= Math.abs(Math.sin(introFrame * 0.4)) * 30; // Heavy bouncy walk logic
                        if (introFrame % 20 === 0) playSfx('jump'); // Pseudo-footstep sfx
                    }
                    
                    if (images.player && images.player.complete) {
                        ctx.save();
                        if (isWalking) { // Flip horizontal visually so character faces the direction they are walking
                            ctx.translate(pX + 140, pY);
                            ctx.scale(-1, 1);
                            ctx.drawImage(images.player, 0, 0, 140, 220);
                        } else { // Snap forward perfectly
                            let idleImg = (introFrame % 20 < 10) ? images.player : (images.playerRun && images.playerRun.complete ? images.playerRun : images.player);
                            ctx.drawImage(idleImg, pX, pY, 140, 220); 
                        }
                        ctx.restore();
                    } else {
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(pX, pY, 140, 220);
                    }
                }
                
                if (introFrame === 500) { 
                    const preGameMenu = document.getElementById('pre-game-menu');
                    if (preGameMenu) preGameMenu.classList.remove('hidden');
                }
                
                requestAnimationFrame(drawIntro);
            }
            drawIntro();
        }
        }, 2000); // 2-Second Gap between crumble and scene enter
    }

    // === 3. GAME ENGINE ===
    // Asset Preloading
    const assets = {
        player: 'assets/player.png', playerRun: 'assets/player_run.png', playerSlide: 'assets/player_slide.png',
        hateSnake: ['assets/hate_snake_1.png', 'assets/hate_snake_2.png', 'assets/hate_snake_3.png', 'assets/hate_snake_4.png', 'assets/hate_snake_5.png'],
        dislike: 'assets/dislike_monster.png', 
        coin: 'assets/coin.png', heal: 'assets/item_heal.png', 
        bg1: 'assets/bg_layer1.png', bg2: 'assets/bg_layer2.png', bg3: 'assets/bg_layer3.png',
        plane: 'assets/airplane.png', missile: 'assets/missile.png', bomb: 'assets/bomb.png'
    };
    const images = { hateSnake: [] };
    images.player = new Image(); images.player.src = assets.player;
    images.playerRun = new Image(); images.playerRun.src = assets.playerRun;
    images.playerSlide = new Image(); images.playerSlide.src = assets.playerSlide;
    images.dislike = new Image(); images.dislike.src = assets.dislike;
    images.coin = new Image(); images.coin.src = assets.coin;
    images.heal = new Image(); images.heal.src = assets.heal;
    images.bg1 = new Image(); images.bg1.src = assets.bg1;
    images.bg2 = new Image(); images.bg2.src = assets.bg2;
    images.bg3 = new Image(); images.bg3.src = assets.bg3;
    images.plane = new Image(); images.plane.src = assets.plane;
    images.missile = new Image(); images.missile.src = assets.missile;
    images.bomb = new Image(); images.bomb.src = assets.bomb;
    assets.hateSnake.forEach(src => {
        let img = new Image(); img.src = src; images.hateSnake.push(img);
    });

    const sfx = {
        bgm: new Audio('assets/bgm.mp3'),
        jump: new Audio('assets/jump.mp3'),
        slide: new Audio('assets/slide.mp3'),
        damage: new Audio('assets/damage.mp3'),
        coin: new Audio('assets/coin.mp3'),
        heal: new Audio('assets/heal.mp3'),
        gameover: new Audio('assets/gameover.mp3'),
        quake: new Audio('assets/bg_white_noise1.mp3') // Continuous ground vibration rumble!
    };
    sfx.bgm.loop = true;
    sfx.bgm.volume = 0.5;
    sfx.quake.loop = true;
    sfx.quake.volume = 0.8;

    function playSfx(name) {
        if (!sfx[name]) return;
        if (name === 'quake') {
            sfx.quake.play().catch(e => console.log('Audio error:', e));
            return;
        }
        const sound = sfx[name].cloneNode();
        sound.play().catch(e => console.log('Audio error:', e));
    }
    
    function stopSfx(name) {
        if (sfx[name]) {
            sfx[name].pause();
            sfx[name].currentTime = 0;
        }
    }

    // NEW HASH LOGIC for direct game entry from pause/reload buttons
    if (window.location.hash === '#game') {
        const container = document.querySelector('.channel-container');
        if (container) container.style.display = 'none';
        document.body.style.background = '#87CEEB';
        if (gameOverlay) gameOverlay.classList.remove('hidden');
        
        // Ensure HUD and controls are hidden before game starts
        const topHud = document.querySelector('.top-hud');
        const controls = document.querySelector('.controls-overlay');
        if (topHud) topHud.style.display = 'none';
        if (controls) controls.style.display = 'none';

        const preGameMenu = document.getElementById('pre-game-menu');
        if (preGameMenu) preGameMenu.classList.remove('hidden');
        history.replaceState(null, null, ' ');
        
        setTimeout(() => {
            if(ctx && images.bg1 && images.bg1.complete && !isGameRunning) {
                ctx.clearRect(0,0,canvas.width,canvas.height);
                function drawL(img,y,h) {
                    if(!img||!img.complete||img.naturalHeight===0)return;
                    let sw = img.naturalWidth * (h / img.naturalHeight);
                    if(sw<=0)return;
                    let tiles = Math.ceil(canvas.width/sw)+1;
                    for(let i=0;i<tiles;i++) ctx.drawImage(img, i*sw, y, sw, h);
                }
                drawL(images.bg1, 0, canvas.height);
                drawL(images.bg2, groundY-600, 800);
                drawL(images.bg3, groundY-30, 160);
                ctx.fillStyle = '#4a2f1d'; 
                ctx.fillRect(0, groundY - 30 + 160 - 5, canvas.width, canvas.height);
                if(images.player && images.player.complete) {
                    let pX = 200; 
                    ctx.drawImage(images.player, pX, groundY-220, 140, 220);
                }
            }
        }, 500);
    }

    function startGame() {
        isGameRunning = true;
        
        // Restore HUD visibility
        const topHud = document.querySelector('.top-hud');
        const controls = document.querySelector('.controls-overlay');
        if (topHud) {
            topHud.style.display = 'flex';
            topHud.style.animation = 'hudEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        }
        if (controls) {
            controls.style.display = 'flex';
            controls.style.animation = 'controlsEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        }
        
        sfx.bgm.currentTime = 0;
        sfx.bgm.play().catch(e => console.log('BGM error:', e));
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            groundY = canvas.height - 250; // Lift ground up to show more dirt
        }
        window.addEventListener('resize', resize);
        
        // Game State
        let groundY = window.innerHeight - 200; // Lowered slightly to show proper proportion
        let maxHealth = 15000;
        let health = 15000;
        let score = 0;
        let coinsCollected = 0;
        let targetSpeed = 16; 
        let gameSpeed = 0; // Starts at 0 for initial acceleration
        let frameCount = 0;
        let gravity = 1.6; // Lighter gravity for higher jump arcs!
        let isFlyingMode = false;
        let planeSpawned = false;
        let trueEndingTriggered = false;
        
        let bg1X = 0, bg2X = 0, bg3X = 0;
        
        // Finalize canvas size
        resize();
        
        // DOM Elements
        const healthBar = document.getElementById('health-bar');
        const scoreText = document.getElementById('score-text');
        const coinText = document.getElementById('coin-text');
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScoreLabel = document.getElementById('final-score');

        // Input
        const btnJump = document.getElementById('btn-jump');
        const btnSlide = document.getElementById('btn-slide');
        
        // Pause and Overlays Logic
        const btnPause = document.getElementById('btn-pause');
        const pauseOverlay = document.getElementById('pause-overlay');
        const btnResume = document.getElementById('btn-resume');
        const btnGameHomePause = document.getElementById('btn-game-home-pause');
        const btnWebsitePause = document.getElementById('btn-website-pause');
        const btnGameHomeEnd = document.getElementById('btn-game-home-end');
        const btnWebsiteEnd = document.getElementById('btn-website-end');

        // NEW PLANE CHUNKS
        const planeChoiceOverlay = document.getElementById('plane-choice-overlay');
        const btnBoardPlane = document.getElementById('btn-board-plane');
        const btnRefusePlane = document.getElementById('btn-refuse-plane');

        if (btnBoardPlane) btnBoardPlane.addEventListener('click', () => {
            if (planeChoiceOverlay) planeChoiceOverlay.classList.add('hidden');
            isFlyingMode = true;
            player.isSliding = false;
            player.width = 250;
            player.height = 120;
            player.y = groundY - 300;
            player.vy = 0;
            gravity = 0; 
            playSfx('heal'); 
            obstacles.length = 0; 
            items.length = 0;
            isGameRunning = true;
            sfx.bgm.play().catch(e => console.log('BGM error:', e));
            requestAnimationFrame(loop);
        });

        if (btnRefusePlane) btnRefusePlane.addEventListener('click', () => {
            if (planeChoiceOverlay) planeChoiceOverlay.classList.add('hidden');
            triggerTrueEnding();
        });

        function pauseGame() {
            if (!isGameRunning || health <= 0) return;
            isGameRunning = false;
            sfx.bgm.pause();
            if (pauseOverlay) pauseOverlay.classList.remove('hidden');
        }

        if (btnPause) btnPause.addEventListener('click', pauseGame);
        if (btnResume) btnResume.addEventListener('click', () => {
            isGameRunning = true;
            sfx.bgm.play().catch(e => console.log('BGM error:', e));
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
            requestAnimationFrame(loop);
        });

        const returnToGameHome = () => { window.location.hash = 'game'; window.location.reload(); };
        const returnToWebsite = () => { window.location.hash = ''; window.location.reload(); };

        if (btnGameHomePause) btnGameHomePause.addEventListener('click', returnToGameHome);
        if (btnGameHomeEnd) btnGameHomeEnd.addEventListener('click', returnToGameHome);
        if (btnWebsitePause) btnWebsitePause.addEventListener('click', returnToWebsite);
        if (btnWebsiteEnd) btnWebsiteEnd.addEventListener('click', returnToWebsite);

        window.addEventListener('keydown', e => {
            if (e.code === 'Escape' && isGameRunning) {
                pauseGame();
            }
        });
        
        // Donate Button Restored
        const donateBtn = document.getElementById('donate-btn');
        const cdOverlayEl = document.querySelector('.cd-overlay');
        const danmakuContainer = document.getElementById('danmaku-container');
        let donateCooldown = 0;
        const MAX_DONATE_CD = 600; // 10 secs

        function triggerDonate() {
            if (donateCooldown <= 0 && isGameRunning) {
                // Activate Donate Skill
                player.invincible = 360; // 6s iframe (Buffed!)
                targetSpeed = Math.min(35, targetSpeed + 5); // Speed boost
                gameSpeed = targetSpeed;
                health = Math.min(maxHealth, health + 2500); // Heal
                score += 5000;
                
                // Danmaku shower
                const texts = ["小高太神啦!!", "大老粗來啦", "刷一波666", "斗內支援!!", "物理外掛!!", "乾爹上香"];
                for(let i=0; i<15; i++) {
                    const d = document.createElement('div');
                    d.className = 'danmaku';
                    d.innerText = texts[Math.floor(Math.random()*texts.length)];
                    d.style.top = (10 + Math.random() * 60) + '%';
                    d.style.animationDuration = (1.5 + Math.random()*2) + 's';
                    danmakuContainer.appendChild(d);
                    setTimeout(()=> d.remove(), 4000);
                }

                // Start CD
                donateCooldown = MAX_DONATE_CD;
                if(donateBtn) donateBtn.disabled = true;
                
                playSfx('heal');
                setTimeout(()=>playSfx('coin'), 200);
            }
        }

        if(donateBtn) donateBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            triggerDonate();
        });
        
        function triggerJump() { if(isGameRunning) player.jump(); }
        function triggerSlide() { if(isGameRunning) player.slide(); }
        function releaseSlide() { if(isGameRunning) player.unslide(); }

        let isSlideInputActive = false;
        let isUpInputActive = false;

        btnJump.addEventListener('mousedown', (e) => { e.preventDefault(); isUpInputActive = true; triggerJump(); });
        btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); isUpInputActive = true; triggerJump(); });
        btnJump.addEventListener('mouseup', () => { isUpInputActive = false; });
        btnJump.addEventListener('touchend', () => { isUpInputActive = false; });
        btnJump.addEventListener('mouseleave', () => { isUpInputActive = false; });

        btnSlide.addEventListener('mousedown', (e) => { e.preventDefault(); isSlideInputActive = true; triggerSlide(); });
        btnSlide.addEventListener('touchstart', (e) => { e.preventDefault(); isSlideInputActive = true; triggerSlide(); });
        btnSlide.addEventListener('mouseup', () => { isSlideInputActive = false; releaseSlide(); });
        btnSlide.addEventListener('touchend', () => { isSlideInputActive = false; releaseSlide(); });
        btnSlide.addEventListener('mouseleave', () => { isSlideInputActive = false; releaseSlide(); });
        
        window.addEventListener('keydown', e => {
            if(['Space', 'ArrowUp', 'ArrowDown', 'Enter', 'KeyD'].includes(e.code) && isGameRunning) {
                e.preventDefault(); // Stop browser scrolling!
            }
            if(e.code === 'Space' || e.code === 'ArrowUp') {
                isUpInputActive = true;
                triggerJump();
            }
            if(e.code === 'ArrowDown' && !e.repeat) {
                isSlideInputActive = true;
                triggerSlide();
            }
            if(e.code === 'Enter' || e.code === 'KeyD') triggerDonate();
        });
        window.addEventListener('keyup', e => {
            if(['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) && isGameRunning) {
                e.preventDefault();
            }
            if(e.code === 'Space' || e.code === 'ArrowUp') {
                isUpInputActive = false;
            }
            if(e.code === 'ArrowDown') {
                isSlideInputActive = false;
                releaseSlide();
            }
        });

        // Player Entity
        const player = {
            x: 200, y: groundY - 220, width: 140, height: 220,
            baseHeight: 220, slideHeight: 110,
            vx: 0, vy: 0, 
            jumpCount: 0, 
            isSliding: false, 
            invincible: 0,
            jump: function() {
                if (isFlyingMode) return;
                if (this.jumpCount < 2) {
                    this.vy = -34; // Massive vertical jump
                    this.jumpCount++;
                    this.unslide();
                    playSfx('jump');
                }
            },
            slide: function() {
                // Strictly on a solid surface (ground or platform)
                if (this.jumpCount === 0 && this.vy === 0) { 
                    if (!this.isSliding) {
                        this.isSliding = true;
                        this.height = this.slideHeight;
                        this.y += (this.baseHeight - this.slideHeight); // Adjust y down
                        playSfx('slide');
                    }
                } else {
                    // In the air (jumping OR falling)
                    if (this.vy < 30) this.vy = 30; // Slam down immediately
                }
            },
            unslide: function() {
                if (this.isSliding) {
                    this.isSliding = false;
                    this.height = this.baseHeight;
                    this.y -= (this.baseHeight - this.slideHeight); // Adjust y up
                }
            },
            draw: function(ctx) {
                if (this.invincible > 0 && frameCount % 6 < 3) return; // Blink
                
                let img;
                if (isFlyingMode) img = images.plane;
                else if (this.isSliding) img = images.playerSlide;
                else if (this.jumpCount > 0) img = images.player; // Jump frame
                else img = (frameCount % 16 < 8 ? images.player : images.playerRun); // Run loop
                          
                if (img && img.complete && img.naturalHeight !== 0) {
                    ctx.drawImage(img, this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = this.invincible > 0 ? '#ff0' : (this.isSliding ? '#0aa' : (isFlyingMode ? '#eee' : '#0f0'));
                    if (isFlyingMode) {
                        ctx.font = '60px Arial';
                        ctx.fillText('✈️', this.x, this.y + 60);
                    } else {
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                }
            }
        };

        const obstacles = [];
        const items = [];
        let nextSpawnDist = 0;
        
        function triggerTrueEnding() {
            if (trueEndingTriggered) return;
            trueEndingTriggered = true;
            isGameRunning = false;
            sfx.bgm.pause();
            
            const flash = document.createElement('div');
            flash.style.position = 'fixed';
            flash.style.top = 0; flash.style.left = 0; flash.style.width = '100vw'; flash.style.height = '100vh';
            flash.style.background = 'white';
            flash.style.zIndex = 3000;
            flash.style.animation = 'flashAnim 3s forwards';
            document.body.appendChild(flash);
            
            setTimeout(() => {
                gameOverScreen.innerHTML = `
                    <div class="menu-panel" style="background:#fff; border:4px solid #000; box-shadow:none;">
                        <h2 style="color:#000; font-size:48px;">逃脫成功</h2>
                        <p style="color:#333; margin-bottom:30px; font-size:24px;">你選擇拒絕這場無盡的追逐戰，找回了真實的自我。</p>
                        <div class="menu-buttons" style="flex-direction: column; align-items:center;">
                            <button id="btn-true-home" class="retry-btn" style="border-color:#000; color:#000;">結束體驗</button>
                        </div>
                    </div>`;
                gameOverScreen.classList.remove('hidden');
                flash.remove();
                document.getElementById('btn-true-home').addEventListener('click', () => {
                    window.location.hash = ''; window.location.reload();
                });
            }, 2000);
            
            if(!document.getElementById('flash-style')) {
                let style = document.createElement('style');
                style.id = 'flash-style';
                style.innerHTML = `@keyframes flashAnim { 0% {opacity:0;} 20% {opacity:1;} 100% {opacity:1;} }`;
                document.head.appendChild(style);
            }
        }

        function spawnPattern() {
            nextSpawnDist -= gameSpeed;
            if (nextSpawnDist > 0) return;

            let baseSpacing = Math.max(1000, 1800 - (gameSpeed * 15));

            if (!planeSpawned && score > 5000) {
                obstacles.push({
                    type: 'plane_ride', x: canvas.width + 100, y: groundY - 250,
                    width: 350, height: 180, active: true
                });
                planeSpawned = true;
                nextSpawnDist = baseSpacing + 1000;
                return;
            }

            if (isFlyingMode) {
                let r = Math.random();
                if (r < 0.5) {
                    obstacles.push({
                        type: 'missile', x: canvas.width + 100, y: 50 + Math.random() * (groundY - 150),
                        width: 100, height: 50, active: true, vx: - (gameSpeed * 0.4) 
                    });
                    nextSpawnDist = baseSpacing - 300;
                } else {
                    obstacles.push({
                        type: 'bomb', x: canvas.width + 100, y: 100 + Math.random() * (groundY - 200),
                        width: 80, height: 80, active: true, time: 0
                    });
                    nextSpawnDist = baseSpacing;
                }
                
                if (Math.random() < 0.25) {
                    items.push({ type: 'heal', x: canvas.width + 500, y: 50 + Math.random() * (groundY - 150), width: 70, height: 70, collected: false });
                }
                return;
            }

            let difficultyChoice = Math.random();

            if (difficultyChoice < 0.2) { // 20% chance: Coin arc
                let startX = canvas.width + 150;
                let heightOffset = groundY - 300;
                let numCoins = 6 + Math.floor(Math.random() * 6);
                for(let i=0; i<numCoins; i++) {
                    items.push({
                        type: 'coin',
                        x: startX + i * 110,
                        y: Math.max(40, heightOffset + Math.sin(i * 0.6) * 200),
                        width: 80, height: 80, collected: false
                    });
                }
                nextSpawnDist = baseSpacing + (numCoins * 110);
            } else if (difficultyChoice < 0.4) { // 20% chance: Floating Platforms
                obstacles.push({
                    type: 'platform', x: canvas.width + 100, y: groundY - 280, // Lifted platform higher
                    width: 350, height: 60, active: true
                });
                for(let i=0; i<4; i++) {
                    items.push({ type: 'coin', x: canvas.width + 130 + i*70, y: groundY - 360, width: 50, height: 50, collected: false });
                }
                nextSpawnDist = baseSpacing + 800;
            } else if (difficultyChoice < 0.6) { // 20% chance: Double Jump Monsters
                let f1 = Math.random() > 0.5 ? -19 : -12;
                obstacles.push({
                    type: 'dislike', x: canvas.width + 200, y: groundY - 180, // BIG NEGATIVE MONSTERS
                    width: 180, height: 180, jumpTimer: 0, vy: 0, isJumping: false, active: true, jumpForce: f1
                });
                let f2 = Math.random() > 0.5 ? -19 : -12;
                obstacles.push({
                    type: 'dislike', x: canvas.width + 200 + 900 + Math.random()*400, y: groundY - 180, 
                    width: 180, height: 180, jumpTimer: 0, vy: 0, isJumping: false, active: true, jumpForce: f2
                });
                nextSpawnDist = baseSpacing + 1500;
            } else if (difficultyChoice < 0.8) { // 30% chance: Slide then Jump Combos
                obstacles.push({
                    type: 'hatesnake', x: canvas.width + 150, y: groundY - 200,
                    width: 220, height: 110, baseY: groundY - 200, time: 0, active: true
                });
                let f3 = Math.random() > 0.5 ? -19 : -12;
                obstacles.push({
                    type: 'dislike', x: canvas.width + 150 + 900 + Math.random()*500, y: groundY - 180, 
                    width: 180, height: 180, jumpTimer: 0, vy: 0, isJumping: false, active: true, jumpForce: f3
                });
                if (Math.random() > 0.5) {
                    items.push({ type: 'heal', x: canvas.width + 700, y: groundY - 160, width: 120, height: 120, collected: false });
                }
                nextSpawnDist = baseSpacing + 1800;
            } else { // 20% chance: Heavy Snakes High and Low
                obstacles.push({
                    type: 'hatesnake', x: canvas.width + 150, y: groundY - 260, // Requires slide
                    width: 260, height: 130, baseY: groundY - 260, time: 0, active: true
                });
                obstacles.push({
                    type: 'hatesnake', x: canvas.width + 150 + 1000, y: groundY - 140, // Dangerous ground snake further away
                    width: 220, height: 110, baseY: groundY - 140, time: 0, active: true
                });
                nextSpawnDist = baseSpacing + 1600;
            }
            
            // Random extra heal potion far away
            if (Math.random() < 0.20) {
                items.push({ type: 'heal', x: canvas.width + 1500 + Math.random()*1000, y: groundY - 280, width: 70, height: 70, collected: false });
            }
        }

        function endGame() {
            isGameRunning = false;
            gameOverScreen.classList.remove('hidden');
            finalScoreLabel.innerText = `最終分數：${score}`;
            sfx.bgm.pause();
            playSfx('gameover');
        }

        function update() {
            if (!isGameRunning) return;
            if (trueEndingTriggered) return;
            
            frameCount++;

            // Game Pacing: increase speed over time up to cap
            if (gameSpeed < targetSpeed) {
                gameSpeed += 0.2; // Fast acceleration at the start
            } else if (frameCount % 600 === 0 && targetSpeed < 32) { // 32 Max speed, slower ramp
                targetSpeed += 0.5;
                gameSpeed = targetSpeed;
            }

            // Donate CD
            if (donateCooldown > 0) {
                donateCooldown--;
                if(cdOverlayEl) cdOverlayEl.style.width = (donateCooldown / MAX_DONATE_CD * 100) + '%';
                if (donateCooldown <= 0 && donateBtn) donateBtn.disabled = false;
            }

            // Health Drain
            health -= 4; // Drain speed reduced from 8
            if (health <= 0) {
                health = 0;
                endGame();
            }
            healthBar.style.width = Math.max(0, (health / maxHealth) * 100) + '%';
            
            // Score UI
            score += 1; // passive score
            scoreText.innerText = score.toString();
            coinText.innerText = `🪙 ${coinsCollected}`;

            // Player Physics
            if (isFlyingMode) {
                if (isUpInputActive) player.vy -= 1.0;
                if (isSlideInputActive) player.vy += 1.0;
                player.vy *= 0.85; // friction
                let nextY = player.y + player.vy;
                player.y = nextY;
                if (player.y < 0) { player.y = 0; player.vy = 0; }
                if (player.y + player.height > groundY) { player.y = groundY - player.height; player.vy = 0; }
            } else {
                player.vy += gravity;
            }
            
            let nextY = player.y + player.vy;
            let landed = false;

            // Check Platforms
            for (const obs of obstacles) {
                if (obs.type === 'platform') {
                    // Only collide if falling downwards and previously above it
                    if (player.vy >= 0 && 
                        player.y + player.height <= obs.y + 25 &&
                        nextY + player.height >= obs.y && 
                        player.x + player.width - 30 > obs.x && 
                        player.x + 30 < obs.x + obs.width) {
                        
                        player.y = obs.y - player.height;
                        player.vy = 0;
                        player.jumpCount = 0;
                        landed = true;
                    }
                }
            }

            if (!landed) {
                player.y = nextY;
                if (player.y < 0) player.y = 0; // Ceiling guard
                if (player.y + player.height >= groundY) {
                    player.y = groundY - player.height;
                    player.vy = 0;
                    player.jumpCount = 0; // Reset jumps
                }
            }

            // Auto-slide trigger: seamlessly slide upon landing if input is held
            if (isSlideInputActive && player.jumpCount === 0 && player.vy === 0 && !player.isSliding) {
                player.slide();
            }

            // Force unslide if physically starting to fall (walked off ledge)
            if (player.vy > 0 && player.isSliding) {
                player.unslide();
            }

            if (player.invincible > 0) player.invincible--;

            // Move Backgrounds
            bg1X -= gameSpeed * 0.1;
            bg2X -= gameSpeed * 0.4;
            bg3X -= gameSpeed * 1.0; 

            // Update Items (Coins/Heals)
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                item.x -= gameSpeed;

                if (!item.collected && 
                    player.x + 20 < item.x + item.width && player.x + player.width - 20 > item.x &&
                    player.y + 20 < item.y + item.height && player.y + player.height - 20 > item.y) {
                    
                    item.collected = true;
                    if (item.type === 'coin') {
                        score += 300;
                        coinsCollected++;
                        playSfx('coin');
                    } else if (item.type === 'heal') {
                        health = Math.min(maxHealth, health + 4000);
                        score += 500;
                        playSfx('heal');
                    }
                }
                if (item.x < -200 || item.collected) items.splice(i, 1);
            }

            // Update Obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= gameSpeed;
                
                if (obs.type === 'plane_ride') {
                    if (!isFlyingMode && obs.active && obs.x < player.x + 300) {
                        isGameRunning = false;
                        sfx.bgm.pause();
                        if (planeChoiceOverlay) planeChoiceOverlay.classList.remove('hidden');
                    }
                } else if (obs.type === 'missile') {
                    obs.x += obs.vx;
                } else if (obs.type === 'bomb') {
                    obs.time += 0.1;
                    obs.y += Math.sin(obs.time) * 3; 
                } else if (obs.type === 'hatesnake') {
                    obs.time += 0.1;
                    obs.y = obs.baseY + Math.sin(obs.time) * 30; // Wilder wave
                } else if (obs.type === 'dislike') {
                    obs.jumpTimer++;
                    if (obs.jumpTimer > 80) {
                        if (!obs.isJumping) {
                            obs.vy = obs.jumpForce || -19; // Dynamic jump
                            obs.isJumping = true;
                        }
                        obs.jumpTimer = 0;
                    }
                    if (obs.isJumping) {
                        obs.vy += gravity;
                        obs.y += obs.vy;
                        if (obs.y + obs.height > groundY) {
                            obs.y = groundY - obs.height;
                            obs.vy = 0;
                            obs.isJumping = false;
                        }
                    }
                }

                // Collision (Ignore platform for damage)
                if (obs.type !== 'platform' && obs.active && player.invincible <= 0) {
                    // Forgiving hitbox scaled back to big dimensions
                    const hitP = {x: player.x+30, y: player.y+30, w: player.width-60, h: player.height-60};
                    if (
                        hitP.x < obs.x + obs.width && hitP.x + hitP.w > obs.x &&
                        hitP.y < obs.y + obs.height && hitP.y + hitP.h > obs.y
                    ) {
                        health -= 4000;
                        player.invincible = 60; // 1s iframe
                        obs.active = false;
                        playSfx('damage');
                        
                        // Shake
                        canvas.style.transform = `translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*20}px)`;
                        setTimeout(() => canvas.style.transform = 'none', 50);
                    }
                }
                if (obs.x + obs.width < -200) obstacles.splice(i, 1);
            }

            spawnPattern();
        }

        function drawLayer(img, offsetX, y, h) {
            if (img && img.complete && img.naturalHeight !== 0) {
                // Correctly tile background WITHOUT squishing horizontal aspect ratio
                let scaledWidth = img.naturalWidth * (h / img.naturalHeight);
                if (scaledWidth <= 0) return;
                
                let numTiles = Math.ceil(canvas.width / scaledWidth) + 1;
                // Calculate actual loop offset
                let x = offsetX % scaledWidth;
                if (x > 0) x -= scaledWidth;
                
                for (let i = 0; i < numTiles + 1; i++) {
                    ctx.drawImage(img, x + i * scaledWidth, y, scaledWidth, h);
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Backgrounds (Scaled to proper layout heights)
            // Align bg layers relative to groundY so the character always steps perfectly on the visual ground surface!
            drawLayer(images.bg1, bg1X, 0, canvas.height);
            drawLayer(images.bg2, bg2X, groundY - 600, 800); 
            
            // Shrink ground height so it looks zoomed out correctly without squishing horizontal aspect
            let surfaceHeight = 160; 
            drawLayer(images.bg3, bg3X, groundY - 30, surfaceHeight); 
            
            // Ground fallback & Seamless Lower Mud Layer
            ctx.fillStyle = '#4a2f1d'; // Rich dirt color below the image layer
            ctx.fillRect(0, groundY - 30 + surfaceHeight - 5, canvas.width, canvas.height - (groundY - 30 + surfaceHeight) + 10);
            
            if (!images.bg3 || !images.bg3.complete) {
                ctx.fillStyle = '#654321';
                ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            }

            // Player
            player.draw(ctx);

            // Items
            for (const item of items) {
                let img = item.type === 'coin' ? images.coin : images.heal;
                if (img && img.complete && img.naturalHeight !== 0) {
                    ctx.drawImage(img, item.x, item.y, item.width, item.height);
                } else {
                    ctx.fillStyle = item.type === 'coin' ? '#ff0' : '#f0f';
                    ctx.beginPath();
                    ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Obstacles
            ctx.font = 'bold 20px "Comic Sans MS"';
            for (const obs of obstacles) {
                if (!obs.active) ctx.globalAlpha = 0.3; 
                
                if (obs.type === 'plane_ride') {
                    if (images.plane && images.plane.complete && images.plane.naturalHeight !== 0) {
                        ctx.drawImage(images.plane, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.font = '60px Arial';
                        ctx.fillText('✈️', obs.x, obs.y + 60);
                    }
                } else if (obs.type === 'missile') {
                    if (images.missile && images.missile.complete && images.missile.naturalHeight !== 0) {
                        ctx.drawImage(images.missile, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.font = '40px Arial';
                        ctx.fillText('🚀', obs.x, obs.y + 40);
                    }
                } else if (obs.type === 'bomb') {
                    if (images.bomb && images.bomb.complete && images.bomb.naturalHeight !== 0) {
                        ctx.drawImage(images.bomb, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.font = '40px Arial';
                        ctx.fillText('💣', obs.x, obs.y + 40);
                    }
                } else if (obs.type === 'hatesnake') {
                    let frame = Math.floor(frameCount / 4) % images.hateSnake.length;
                    let snakeImg = images.hateSnake[frame];
                    if (snakeImg && snakeImg.complete && snakeImg.naturalHeight !== 0) {
                        ctx.drawImage(snakeImg, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.fillStyle = '#f00';
                        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                    }
                } else if (obs.type === 'dislike') {
                    if (images.dislike.complete && images.dislike.naturalHeight !== 0) {
                        ctx.drawImage(images.dislike, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.fillStyle = '#fa0';
                        ctx.font = '40px Arial';
                        ctx.fillText('👎', obs.x, obs.y + 80);
                    }
                } else if (obs.type === 'platform') {
                    if (images.bg3 && images.bg3.complete && images.bg3.naturalHeight !== 0) {
                        // Include the full vertical slice (or 80%) to show the mud/dirt underneath the grass!
                        ctx.drawImage(images.bg3, 0, 0, Math.min(images.bg3.naturalWidth, 800), images.bg3.naturalHeight * 0.8, obs.x, obs.y, obs.width, obs.height);
                    } else {
                        ctx.fillStyle = '#654321';
                        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                        ctx.fillStyle = '#228B22';
                        ctx.fillRect(obs.x, obs.y, obs.width, 20);
                    }
                }
                ctx.globalAlpha = 1.0;
            }
        }

        function loop() {
            if (isGameRunning) {
                update();
                draw();
                requestAnimationFrame(loop);
            }
        }
        loop();
    }

    
}
