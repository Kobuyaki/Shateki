const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

let score = 0;
let timeLeft = 30;
let gameInterval;
let targetInterval;
let isPlaying = false;

// ゲーム開始関数
function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    
    startBtn.style.display = 'none'; // スタートボタンを隠す

    // 1秒ごとにタイマーを減らす
    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // 0.8秒ごとに新しい的を出す
    targetInterval = setInterval(createTarget, 800);
}

// 的を生成する関数
function createTarget() {
    // 既存の的が多すぎたら一度消す（最大5個まで画面に残るように制限）
    const currentTargets = document.querySelectorAll('.target');
    if (currentTargets.length >= 5) {
        currentTargets[0].remove();
    }

    const target = document.createElement('div');
    target.classList.add('target');

    // ゲームエリア内のランダムな座標を計算
    const maxX = gameArea.clientWidth - 40; // 的の幅(40px)を引く
    const maxY = gameArea.clientHeight - 40; // 的の高さ(40px)を引く
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    // 的がクリックされた時の処理
    target.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // ゲームエリアのクリックイベントと重ならないようにする
        score += 10;
        scoreDisplay.textContent = score;
        target.remove(); // クリックされた的を消す
    });

    gameArea.appendChild(target);

    // 2秒経っても撃たれなかったら自動で消える
    setTimeout(() => {
        if (target.parentNode) {
            target.remove();
        }
    }, 2000);
}

// ゲーム終了関数
function endGame() {
    clearInterval(gameInterval);
    clearInterval(targetInterval);
    isPlaying = false;
    
    // 画面に残っている的を全て消す
    const currentTargets = document.querySelectorAll('.target');
    currentTargets.forEach(t => t.remove());

    alert(`ゲーム終了！あなたのスコアは ${score} 点です！`);
    
    startBtn.textContent = 'もう一度プレイ';
    startBtn.style.display = 'block'; // スタートボタンを再表示
}

// イベントリスナーの登録
startBtn.addEventListener('click', startGame);