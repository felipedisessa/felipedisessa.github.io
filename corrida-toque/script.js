document.getElementById('tapPlayer1').addEventListener('click', () => movePlayer('player1'));
document.getElementById('tapPlayer2').addEventListener('click', () => movePlayer('player2'));
document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('resetRace').addEventListener('click', resetRace);

const finishLine = document.querySelector('.finish-line').offsetLeft;
let raceInProgress = false;
let winner = null;

function movePlayer(playerId) {
    if (!raceInProgress) return;
    const player = document.getElementById(playerId);
    const currentPosition = parseFloat(player.style.left) || 0;
    const newPosition = currentPosition + 10; // Aumenta a posição em 10px a cada toque

    player.style.left = `${newPosition}px`;

    // Verifica se o jogador cruzou a linha de chegada
    if (newPosition >= finishLine - 80) {
        raceInProgress = false;
        announceWinner(playerId);
    }
}

function startRace() {
    raceInProgress = true;
    winner = null;
    document.getElementById('winner').textContent = '';
    resetPositions();
}

function resetPositions() {
    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        player.style.left = '0px';
    });
    document.getElementById('resetRace').classList.add('hidden');
    raceInProgress = true;
}

function announceWinner(playerId) {
    winner = playerId === 'player1' ? 'Jogador 1' : 'Jogador 2';
    document.getElementById('winner').textContent = `${winner} venceu a corrida!`;
    document.getElementById('resetRace').classList.remove('hidden');
    raceInProgress = false;
}

function resetRace() {
    resetPositions();
    document.getElementById('winner').textContent = '';
}
