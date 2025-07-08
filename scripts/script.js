'use strict';

const stage = document.getElementById('stage');
const squareTemplate = document.getElementById('square-template');

const stoneStateList = [];

let currentColor = 1;

const currentTurnText = document.getElementById('current_turn');    

const passButton = document.getElementById('pass');

const blackScoreText = document.getElementById('black_score');
const whiteScoreText = document.getElementById('white_score');

const changeTurn = () => {
    currentColor = 3 - currentColor;

    currentTurnText.classList.remove('black', 'white');

    if(currentColor === 1) {
        currentTurnText.textContent = '黒';
        currentTurnText.classList.add('black');
    } else {
        currentTurnText.textContent = '白';
        currentTurnText.classList.add('white');
    }
}

const updateScore = () => {
    const blackStoneNum = stoneStateList.filter(state => state === 1).length;
    const whiteStoneNum = stoneStateList.filter(state => state === 2).length;
    blackScoreText.textContent = blackStoneNum;
    whiteScoreText.textContent = whiteStoneNum;
};

// [ひっくり返す石の判定]
const getReversibleStones = (idx) => {
    // クリックしたマスから見て、各方向にマスがある計算しておく
    const squareNums = [
        7 - (idx % 8),
        Math.min(7 - (idx % 8), (56 + (idx % 8) - idx) / 8), (56 + (idx % 8) - idx) / 8,
        Math.min(idx % 8, (56 + (idx % 8) - idx) / 8), idx % 8,
        Math.min(idx % 8, (idx - (idx % 8)) / 8), (idx - (idx % 8)) / 8,
        Math.min(7 - (idx % 8), (idx - (idx % 8)) / 8), 
    ];
    // for文ループの規定を定めるパラメータ定義
    const parameters = [1, 9, 8, 7, -1, -9, -8, -7];

    // ひっくり返せることが確定した石の情報を入れるための配列
    let results = [];

    // ８方向への走査のため
    for(let i = 0; i < 8; i++){
        // ひっくり返せる可能性のある石の情報のための配列（仮ボックス）
        const box = [];
        //　調べている方向にいくつマスがあるか
        const squareNum = squareNums[i];
        const param = parameters[i];
        // 一つ隣の石の状態
        const nextStoneState = stoneStateList[idx + param];

        // 隣に石があるか、相手の色か　どちらでもなければ次
        if(nextStoneState === 0 || nextStoneState === currentColor) continue;
        // 隣の石の番号を仮ボックスに格納
        box.push(idx + param);

        // さらに延長線上に石があるか、相手の色かどうかのループ
        for(let j = 0; j < squareNum - 1; j++){
            const targetIdx = idx + param * 2 + param * j;
            const targetColor = stoneStateList[targetIdx];
            // さらに隣に石があるか　なければ次のループ
            if(targetColor === 0) continue;
            // 隣の石が相手の色か
            if(targetColor === currentColor){
                // 自分の色なら仮ボックスの石がひっくり返せると確定
                results = results.concat(box); //concat＝配列、文字列を連結
                break;
            } else {
                // 相手の色なら仮ボックスにその色の番号を格納
            box.push(targetIdx);
            }
        }
    }

    // ひっくり返せると確定した石の番号を戻り値に
    return results;
};

const onClickSquare = (index) => {
    // ひっくり返せる石の数を取得
    const reversibleStones = getReversibleStones(index);

    // ほかの石があるか、置いたときにひっくり返せる石がない場合
    if(stoneStateList[index] !== 0 || !reversibleStones.length) {
        alert('ここには置けません');
        return;
    }

    //　自分の石を置く
    stoneStateList[index] = currentColor;
    document.querySelector(`[data-index='${index}']`).setAttribute('data-state', currentColor);

    // 相手の石をひっくり返す
    reversibleStones.forEach((key) => {
        stoneStateList[key] = currentColor;
        document.querySelector(`[data-index='${key}']`).setAttribute('data-state', currentColor);
    });

    // 盤面いっぱいになると集計
    if(stoneStateList.every((state) => state !== 0)) {
        const blackStoneNum = stoneStateList.filter(state => state === 1).length;
        const whiteStoneNum = stoneStateList.filter(state => state === 2).length;

        let winnerText = "";
        if(blackStoneNum > whiteStoneNum) {
            winnerText = '黒の勝ちです'
        } else if(blackStoneNum < whiteStoneNum) {
            winnerText = '白の勝ちです'
        } else {
            winnerText = '引き分けです'
        }

        alert(`ゲーム終了です。白${whiteStoneNum}、黒${blackStoneNum}で、${winnerText}`)
    }

    // ゲーム続行なら相手のターン
    changeTurn();
    updateScore();
}

const createSquares = () => {
    for(let i = 0; i < 64; i++){
        const square = squareTemplate.cloneNode(true);
        square.removeAttribute('id');
        stage.appendChild(square);

        const stone = square.querySelector('.stone');

        let defaultState;

        if(i === 27 || i === 36){
            defaultState = 1;
        } else if(i === 28 || i === 35) {
            defaultState = 2;    
        } else {
            defaultState = 0;
        }

        stone.setAttribute('data-state', defaultState);
        stone.setAttribute('data-index', i);
        stoneStateList.push(defaultState);

        square.addEventListener('click', () => {
            onClickSquare(i);
        });
    }
}

window.onload = () => {
    createSquares();
    updateScore();
    passButton.addEventListener('click', changeTurn)
}       