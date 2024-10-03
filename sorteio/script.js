document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('resetRace').addEventListener('click', resetRace);

let raceInProgress = false;
let winner = null;
let raceAnimationId = null;
const finishLine = document.querySelector('.track').offsetWidth - 100;

const horses = Array.from(document.querySelectorAll('.horse')).map((horse, index) => ({
    element: horse,
    position: 0,
    baseSpeed: 0,
    speed: 0,
    number: index + 1
}));

function startRace() {
    if (raceInProgress) return;
    raceInProgress = true;
    winner = null;

    // Tocar o som de cavalgada durante a corrida
    document.getElementById('raceAudio').play();

    toggleButtons();
    resetPositions();

    horses.forEach(horse => {
        horse.baseSpeed = Math.random() * 0.3 + 0.7;
        horse.speed = horse.baseSpeed;
        horse.element.classList.add('swing-animation');
    });

    raceAnimationId = requestAnimationFrame(race);
}

function resetPositions() {
    horses.forEach(horse => {
        horse.position = 0;
        horse.element.style.left = '0px';
        horse.element.style.transform = 'scale(1)';
        horse.element.style.backgroundColor = '';
        horse.element.classList.remove('winner-animation');
        horse.element.classList.remove('swing-animation');
    });
}

function race() {
    let raceComplete = false;
    let maxPosition = 0;
    let leader = null;

    // Determina o cavalo líder
    horses.forEach(horse => {
        if (horse.position > maxPosition) {
            maxPosition = horse.position;
            leader = horse;
        }
    });

    horses.forEach(horse => {
        let randomFactor = Math.random() * 1 - 0.5; 
        horse.speed = horse.baseSpeed + randomFactor;

        if (Math.random() < 0.05) {
            horse.speed += Math.random() * 0.8;
        }

        if (horse === leader) {
            horse.speed -= 0.2;
        }

        if (horse.position < maxPosition - 50) {
            horse.speed += 0.5;
        }
        if (horse.position >= finishLine - 100) {
            horse.speed = horse.baseSpeed + (Math.random() * 0.1 - 0.05); 
            if (horse === leader) {
                horse.speed += 0.2; 
            }
        }

        horse.position += horse.speed;
        horse.element.style.left = `${horse.position}px`;

        // Verifica se há um vencedor
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
        raceAnimationId = requestAnimationFrame(race);
    }
}

function announceWinner(horse) {
    raceInProgress = false;

    // Parar o som da corrida e tocar o som de vitória
    document.getElementById('raceAudio').pause();
    document.getElementById('raceAudio').currentTime = 0; // Reiniciar o som da corrida
    document.getElementById('winAudio').play();

    document.getElementById('winner').textContent = `O Cavalinho número ${horse.number} venceu!`;
    horse.element.style.transform = 'scale(1.2)';
    horse.element.classList.add('winner-animation');
}

function resetRace() {
    cancelAnimationFrame(raceAnimationId);
    resetPositions();
    document.getElementById('winner').textContent = '';
    winner = null;
    raceInProgress = false;

    // Parar o som da corrida se estiver tocando
    document.getElementById('raceAudio').pause();
    document.getElementById('raceAudio').currentTime = 0; // Reiniciar o som da corrida
    document.getElementById('winAudio').pause();
    document.getElementById('winAudio').currentTime = 0; // Reiniciar o som de vitória

    toggleButtons();
}

function toggleButtons() {
    const startButton = document.getElementById('startRace');
    const resetButton = document.getElementById('resetRace');

    startButton.style.display = raceInProgress ? 'none' : 'block';
    resetButton.style.display = raceInProgress ? 'block' : 'none';
}
