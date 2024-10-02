document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('resetRace').addEventListener('click', resetRace);

let raceInProgress = false;
let winner = null;
const finishLine = document.querySelector('.track').offsetWidth - 100;

const horses = Array.from(document.querySelectorAll('.horse')).map((horse, index) => ({
    element: horse,
    position: 0,
    speed: Math.random() * 2 + 1, // Velocidade inicial dos cavalos
    number: index + 1
}));

function startRace() {
    if (raceInProgress) return; 
    raceInProgress = true;
    winner = null;

    toggleButtons();  
    resetPositions();

    // Redefinir as velocidades dos cavalos ao iniciar a corrida
    horses.forEach(horse => {
        horse.speed = Math.random() * 2 + 1; // Gera uma nova velocidade para cada cavalo
        horse.element.classList.add('swing-animation');
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
    horses.forEach(horse => {
        let randomFactor;
        
        // Mantém uma corrida mais equilibrada até o meio da pista
        if (horse.position < finishLine * 0.5) {
            randomFactor = Math.random() * 1; // Variação menor até 50% da corrida
        } else {
            randomFactor = Math.random() * 2; // Aumenta a variação após 50% da corrida
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
    });

    if (!winner) {
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
