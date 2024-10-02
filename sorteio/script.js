document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('resetRace').addEventListener('click', resetRace);

let raceInProgress = false;
let winner = null;
const finishLine = document.querySelector('.track').offsetWidth - 100;

const horses = Array.from(document.querySelectorAll('.horse')).map((horse, index) => ({
    element: horse,
    position: 0,
    speed: Math.random() * 0.5 + 0.8, 
    number: index + 1
}));

function startRace() {
    if (raceInProgress) return;
    raceInProgress = true;
    winner = null;

    toggleButtons();
    resetPositions();

    horses.forEach(horse => {
        horse.speed = Math.random() * 0.5 + 0.8; 
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
    let raceComplete = false;

    horses.forEach(horse => {
        let randomFactor = Math.random() * 0.1; 

        horse.position += horse.speed + randomFactor; 
        horse.element.style.left = `${horse.position}px`;

        if (horse.position >= finishLine && !winner) {
            winner = horse; 
            announceWinner(horse); 

            horses.forEach(horse => {
                horse.element.classList.remove('swing-animation');
            });
        }

        if (horse.position >= finishLine) {
            raceComplete = true;
        }
    });
    if (!raceComplete) {
        requestAnimationFrame(race);
    }
}
function announceWinner(horse) {
    raceInProgress = false;
    document.getElementById('winner').textContent = `O Cavalinho número ${horse.number} venceu!`;
    horse.element.style.transform = 'scale(1.2)';  
    horse.element.classList.add('winner-animation'); 
}
function resetRace() {
    resetPositions();
    document.getElementById('winner').textContent = '';
    winner = null;
    raceInProgress = false;

    toggleButtons();
    startRace();
}

function toggleButtons() {
    const startButton = document.getElementById('startRace');
    const resetButton = document.getElementById('resetRace');

    startButton.style.display = raceInProgress ? 'none' : 'block';
    resetButton.style.display = raceInProgress ? 'block' : 'none';
}
