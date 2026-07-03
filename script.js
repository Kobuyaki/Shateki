const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const cursor = document.getElementById('custom-cursor');

let score = 0;
let timeLeft = 30;
let gameInterval;
let targetInterval;
let isPlaying = false;

// 照準の位置管理
let cursorX = 300; // 初期位置（中央）
let cursorY = 200;

// ドラッグ管理用の変数
let isDragging = false;
let startStartX = 0;
let startStartY = 0;
let cursorStartX = 0;
let cursorStartY = 0;

// 初期位置に照準を配置
updateCursorPosition();

// ゲーム開始
function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    
    // 照準を中央に戻す
    cursorX = gameArea.clientWidth / 2;
    cursorY = gameArea.clientHeight / 2;
    updateCursorPosition();

    startBtn.style.display = 'none';

    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);

    targetInterval = setInterval(createTarget, 800);
}

// 的の生成
function createTarget() {
    const currentTargets = document.querySelectorAll('.target');
    if (currentTargets.length >= 5) {
        currentTargets[0].remove();
    }

    const target = document.createElement('div');
    target.classList.add('target');

    const maxX = gameArea.clientWidth - 40;
    const maxY = gameArea.clientHeight - 40;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    gameArea.appendChild(target);

    setTimeout(() => {
        if (target.parentNode) target.remove();
    }, 2500);
}

// 照準の表示位置を更新する関数
function updateCursorPosition() {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
}

// --- ドラッグ & ショットのロジック ---

// ドラッグ開始
function onDragStart(e) {
    if (!isPlaying) return;
    isDragging = true;

    // マウスかタッチかで取得元を変える
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const pageY = e.touches ? e.touches[0].pageY : e.pageY;

    // 押し始めたときのマウス位置と、その時の照準の位置を記憶
    startStartX = pageX;
    startStartY = pageY;
    cursorStartX = cursorX;
    cursorStartY = cursorY;
}

// ドラッグ中（照準の移動）
function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault(); // スクロール等の標準動作を防止

    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const pageY = e.touches ? e.touches[0].pageY : e.pageY;

    // 開始地点からの移動量を計算
    const deltaX = pageX - startStartX;
    const deltaY = pageY - startStartY;

    // 新しい照準の位置（開始時の位置 + 移動量）
    cursorX = cursorStartX + deltaX;
    cursorY = cursorStartY + deltaY;

    // ゲームエリアの外に出ないように制限
    cursorX = Math.max(0, Math.min(gameArea.clientWidth, cursorX));
    cursorY = Math.max(0, Math.min(gameArea.clientHeight, cursorY));

    updateCursorPosition();
}

// ドラッグ終了（離して打つ！）
function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // 弾が当たったかどうかの判定（すべての的をチェック）
    const targets = document.querySelectorAll('.target');
    
    targets.forEach(target => {
        // 的の左上座標とサイズを取得
        const rect = target.getBoundingClientRect();
        const areaRect = gameArea.getBoundingClientRect();

        // ゲームエリア内における的の中心座標を計算
        const targetLeft = rect.left - areaRect.left;
        const targetTop = rect.top - areaRect.top;
        const targetCenterX = targetLeft + 20; // 半径20px
        const targetCenterY = targetTop + 20;

        // 照準の中心と、的の中心の距離を計算（三平方の定理）
        const distance = Math.sqrt(Math.pow(cursorX - targetCenterX, 2) + Math.pow(cursorY - targetCenterY, 2));

        // 距離が25px以内なら命中とする（的の判定を少し優しく設定）
        if (distance <= 25) {
            score += 10;
            scoreDisplay.textContent = score;
            target.remove();
            
            // ヒットエフェクト（フラッシュ）
            gameArea.style.backgroundColor = '#555';
            setTimeout(() => gameArea.style.backgroundColor = '#444', 50);
        }
    });
}

// ゲーム終了
function endGame() {
    clearInterval(gameInterval);
    clearInterval(targetInterval);
    isPlaying = false;
    isDragging = false;
    
    const currentTargets = document.querySelectorAll('.target');
    currentTargets.forEach(t => t.remove());

    alert(`ゲーム終了！あなたのスコアは ${score} 点です！`);
    
    startBtn.textContent = 'もう一度プレイ';
    startBtn.style.display = 'block';
}

// --- イベントリスナー ---

// マウスイベント
gameArea.addEventListener('mousedown', onDragStart);
window.addEventListener('mousemove', onDragMove);
window.addEventListener('mouseup', onDragEnd);

// タッチイベント（スマホ・タブレット用）
gameArea.addEventListener('touchstart', onDragStart, { passive: false });
window.addEventListener('touchmove', onDragMove, { passive: false });
window.addEventListener('touchend', onDragEnd);

// スタートボタン
startBtn.addEventListener('click', startGame);