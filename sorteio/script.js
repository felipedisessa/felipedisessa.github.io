document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('resetRace').addEventListener('click', resetRace);

let raceInProgress = false;
let winner = null;
const finishLine = document.querySelector('.track').offsetWidth - 100;

// Definindo a velocidade base para garantir que a corrida dure cerca de 10 segundos
const horses = Array.from(document.querySelectorAll('.horse')).map((horse, index) => ({
    element: horse,
    position: 0,
    speed: Math.random() * 0.8 + 0.7, // Velocidade ajustada para uma corrida de 10 segundos (entre 0.7 e 1.5)
    number: index + 1
}));

function startRace() {
    if (raceInProgress) return;
    raceInProgress = true;
    winner = null;

    toggleButtons();
    resetPositions();

    // Redefinir a velocidade dos cavalos e adicionar animação de balanço
    horses.forEach(horse => {
        horse.speed = Math.random() * 0.8 + 0.7; // Mantém a velocidade da corrida
        horse.element.classList.add('swing-animation'); // Adiciona a animação de "trotar" mais rápido
    });

    requestAnimationFrame(race);
}
function resetPositions() {
    horses.forEach(horse => {
        horse.position = 0;  // Reseta a posição de cada cavalo para 0
        horse.element.style.left = '0px';  // Move o cavalo para o início da pista
        horse.element.style.transform = 'scale(1)';  // Reseta a escala do cavalo
        horse.element.style.backgroundColor = '';  // Reseta a cor de fundo do cavalo
        horse.element.classList.remove('winner-animation');  // Remove a animação de vitória

        // Remove a animação de balanço quando a corrida for reiniciada
        horse.element.classList.remove('swing-animation');
    });
}

function race() {
    let raceComplete = false;

    horses.forEach(horse => {
        let randomFactor;

        // Fase 1: Primeiros 50% da corrida (mais acirrada)
        if (horse.position < finishLine * 0.5) {
            randomFactor = Math.random() * 0.15; // Variação pequena para uma corrida mais equilibrada
        } else {
            // Fase 2: Últimos 50% da corrida (começando a distanciar levemente)
            randomFactor = Math.random() * 0.3; // Variação maior para o cavalo se distanciar mais no final
        }

        horse.position += horse.speed + randomFactor; // A posição de cada cavalo é alterada
        horse.element.style.left = `${horse.position}px`;

        // Verifica se o cavalo cruzou a linha de chegada e se ainda não há um vencedor
        if (horse.position >= finishLine && !winner) {
            winner = horse;  // Define o cavalo vencedor
            announceWinner(horse);  // Anuncia o vencedor

            // Remover a animação de balanço quando a corrida terminar
            horses.forEach(horse => {
                horse.element.classList.remove('swing-animation');
            });
        }

        // Verifica se todos os cavalos cruzaram a linha de chegada
        if (horse.position >= finishLine) {
            raceComplete = true;
        }
    });

    // Continua a corrida até que o último cavalo tenha cruzado a linha de chegada
    if (!raceComplete) {
        requestAnimationFrame(race);
    }
}

// Função para anunciar o cavalo vencedor
function announceWinner(horse) {
    raceInProgress = false;
    document.getElementById('winner').textContent = `O Cavalinho número ${horse.number} venceu!`;
    horse.element.style.transform = 'scale(1.2)';  // Aumenta o cavalo vencedor
    horse.element.classList.add('winner-animation');  // Adiciona a animação de vencedor
}

function resetRace() {
    resetPositions();
    document.getElementById('winner').textContent = '';
    winner = null;
    raceInProgress = false;

    toggleButtons();
}

function toggleButtons() {
    const startButton = document.getElementById('startRace');
    const resetButton = document.getElementById('resetRace');

    startButton.style.display = raceInProgress ? 'none' : 'block';
    resetButton.style.display = raceInProgress ? 'block' : 'none';
}
