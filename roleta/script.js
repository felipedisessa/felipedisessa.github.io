/* =========================
   CONFIGURAÇÃO DOS PRÊMIOS
   ========================= */
let PRIZES = [
  "Ração Premium",
  "Desconto 50%",
  "Brinquedo para Pet",
  "Banho e Tosa",
  "Consulta Veterinária",
  "Coleira Personalizada",
  "Cupom R$100",
  "Kit Higiene",
];

// Porcentagens de chance para cada prêmio (deve somar 100%)
let PRIZE_PERCENTAGES = [
  10,  // Ração Premium - 10%
  15,  // Desconto 50% - 15%
  18,  // Brinquedo para Pet - 18%
  12,  // Banho e Tosa - 12%
  10,  // Consulta Veterinária - 10%
  12,  // Coleira Personalizada - 12%
  15,  // Cupom R$100 - 15%
  8,   // Kit Higiene - 8%
  0    // Nada - 0% (removido da porcentagem)
];

// Array para marcar quais prêmios são "perdas" (true = perda, false = prêmio)
let PRIZE_IS_LOSS = [
  false, // Ração Premium - prêmio
  false, // Desconto 50% - prêmio
  false, // Brinquedo para Pet - prêmio
  false, // Banho e Tosa - prêmio
  false, // Consulta Veterinária - prêmio
  false, // Coleira Personalizada - prêmio
  false, // Cupom R$100 - prêmio
  false, // Kit Higiene - prêmio
  true   // Nada - perda
];

// Função para selecionar prêmio baseado nas porcentagens
function selectPrizeByPercentage() {
  const total = PRIZE_PERCENTAGES.reduce((sum, percent) => sum + percent, 0);
  const random = Math.random() * total;
  
  let currentSum = 0;
  for (let i = 0; i < PRIZE_PERCENTAGES.length; i++) {
    currentSum += PRIZE_PERCENTAGES[i];
    if (random <= currentSum) {
      return i;
    }
  }
  return PRIZES.length - 1; // fallback para o último prêmio
}

// Função para normalizar porcentagens (garantir que somem 100%)
function normalizePercentages() {
  const total = PRIZE_PERCENTAGES.reduce((sum, percent) => sum + percent, 0);
  if (total !== 100) {
    const factor = 100 / total;
    PRIZE_PERCENTAGES = PRIZE_PERCENTAGES.map(percent => Math.round(percent * factor));
  }
}

// Configurações
let settings = {
  soundEnabled: true,
  speed: 'normal',
  customSpeedSeconds: 10, // Tempo personalizado em segundos
  theme: 'default',
  idleAnimation: true,
  usePercentages: false  // Nova configuração para usar porcentagens
};

/* ====== Núcleo da Roleta (Canvas + Física + Áudio) ====== */
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const nudgeBtn = document.getElementById('nudgeBtn');
const resultEl = document.getElementById('result');

const W = canvas.width, H = canvas.height, CX = W/2, CY = H/2;
let R = Math.min(W, H)/2 - 24;
let INNER_R = R * 0.32;
let SEG_ANGLE = (Math.PI * 2) / PRIZES.length;

// Função para recalcular dimensões baseadas no número de prêmios
function updateWheelDimensions() {
  R = Math.min(W, H)/2 - 24;
  INNER_R = R * 0.32;
  SEG_ANGLE = (Math.PI * 2) / PRIZES.length;
}

// Paletas de cores temáticas
const colorPalettes = {
  default: ["#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88"],
  natal: ["#dc2626","#059669","#f87171","#dc2626","#059669","#f87171","#dc2626","#059669","#f87171","#dc2626","#059669","#f87171","#dc2626","#059669"],
  mulheres: ["#ec4899","#f472b6","#f9a8d4","#fce7f3","#ec4899","#f472b6","#f9a8d4","#fce7f3","#ec4899","#f472b6","#f9a8d4","#fce7f3","#ec4899","#f472b6"],
  homens: ["#3b82f6","#1d4ed8","#2563eb","#1e40af","#3b82f6","#1d4ed8","#2563eb","#1e40af","#3b82f6","#1d4ed8","#2563eb","#1e40af","#3b82f6","#1d4ed8"],
  criancas: ["#f59e0b","#f97316","#ef4444","#ec4899","#8b5cf6","#06b6d4","#10b981","#84cc16","#f59e0b","#f97316","#ef4444","#ec4899","#8b5cf6","#06b6d4"],
  neon: ["#00ffff","#ff00ff","#ffff00","#00ff00","#ff0080","#8000ff","#0080ff","#ff8000","#00ffff","#ff00ff","#ffff00","#00ff00","#ff0080","#8000ff"],
  gold: ["#ffd700","#ffed4e","#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f","#ffd700","#ffed4e","#fbbf24","#f59e0b","#d97706","#b45309"],
  halloween: ["#7c2d12","#ea580c","#f97316","#fb923c","#fed7aa","#7c2d12","#ea580c","#f97316","#fb923c","#fed7aa","#7c2d12","#ea580c","#f97316","#fb923c"],
  pascoa: ["#78350f","#d97706","#f9a8d4","#78350f","#d97706","#f9a8d4","#78350f","#d97706","#f9a8d4","#78350f","#d97706","#f9a8d4","#78350f","#d97706"],
  carnaval: ["#f59e0b","#ef4444","#ec4899","#8b5cf6","#3b82f6","#06b6d4","#10b981","#84cc16","#f59e0b","#ef4444","#ec4899","#8b5cf6","#3b82f6","#06b6d4"],
  primavera: ["#fbbf24","#84cc16","#22c55e","#10b981","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#ec4899","#f472b6","#fbbf24","#84cc16","#22c55e","#10b981"],
  verao: ["#fbbf24","#f59e0b","#ef4444","#ec4899","#8b5cf6","#3b82f6","#06b6d4","#10b981","#84cc16","#fbbf24","#f59e0b","#ef4444","#ec4899","#8b5cf6"],
  inverno: ["#3b82f6","#1d4ed8","#6366f1","#8b5cf6","#a855f7","#c084fc","#d8b4fe","#e9d5ff","#3b82f6","#1d4ed8","#6366f1","#8b5cf6","#a855f7","#c084fc"],
  outono: ["#92400e","#b45309","#d97706","#f59e0b","#fbbf24","#84cc16","#22c55e","#10b981","#92400e","#b45309","#d97706","#f59e0b","#fbbf24","#84cc16"],
  personalizada: ["#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88","#4a9eff","#eec116","#2e3d88"]
};

// Paleta base para setores
function sectorColor(i){
  const palette = colorPalettes[settings.theme] || colorPalettes.default;
  return palette[i % palette.length];
}

// Texto horizontal por setor - sempre deitado com suporte a emojis
function drawCurvedText(text, startAngle, sweep){
  ctx.save();
  ctx.fillStyle = "#fff";
  
  // Ajusta o tamanho da fonte baseado no número de prêmios (ajustado)
  const fontSizeMultiplier = PRIZES.length <= 6 ? 0.10 : PRIZES.length <= 10 ? 0.075 : PRIZES.length <= 14 ? 0.06 : 0.05;
  ctx.font = `bold ${Math.floor(R*fontSizeMultiplier)}px 'QuatroSlab', system-ui, Segoe UI, Inter, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const radius = (INNER_R + R) / 2 - 20; // Reduzir 20px para dar mais margem das bordas
  
  // Sempre usar texto horizontal no centro do setor
  const centerAngle = startAngle + sweep/2;
  const centerX = CX + radius*Math.cos(centerAngle);
  const centerY = CY + radius*Math.sin(centerAngle);
  
  ctx.save();
  ctx.translate(centerX, centerY);
  // Rotacionar para ficar horizontal/deitado
  ctx.rotate(centerAngle);
  
  // Quebrar texto em linhas se necessário (considerando emojis)
  const words = text.split(' ');
  let lines = [];
  
  if(words.length > 1 && text.length > 8) {
    // Tentar quebrar em 2 linhas
    const midPoint = Math.ceil(words.length / 2);
    lines.push(words.slice(0, midPoint).join(' '));
    lines.push(words.slice(midPoint).join(' '));
  } else if(text.length > 12) {
    // Se for uma palavra longa, quebrar no meio (considerando emojis)
    const midPoint = Math.ceil(text.length / 2);
    lines.push(text.substring(0, midPoint));
    lines.push(text.substring(midPoint));
  } else {
    lines = [text];
  }
  
  // Desenhar cada linha
  const lineHeight = Math.floor(R*fontSizeMultiplier) * 1.3;
  for(let i = 0; i < lines.length; i++) {
    const y = (i - (lines.length - 1) / 2) * lineHeight;
    
    // Apenas preenchimento branco, sem contorno
    ctx.fillText(lines[i], 0, y);
  }
  
  ctx.restore();
  ctx.restore();
}

// Desenha a roleta para um ângulo (rotação) dado
function drawWheel(rotation=0){
  ctx.clearRect(0,0,W,H);

  // sombra suave
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R+10, 0, Math.PI*2);
  ctx.shadowColor = "rgba(0,0,0,.35)";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#0b0f26";
  ctx.fill();
  ctx.restore();

  // setores
  for(let i=0;i<PRIZES.length;i++){
    const start = i*SEG_ANGLE + rotation;
    const end = start + SEG_ANGLE;

    // fatia
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, start, end);
    ctx.closePath();
    
    // preenchimento com cor sólida
    ctx.fillStyle = sectorColor(i);
    ctx.fill();

    // divisória
    ctx.strokeStyle = "#00000055";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, R, start, end);
    ctx.stroke();

    // texto curvado
    drawCurvedText(PRIZES[i], start, SEG_ANGLE);
  }

  // "miolo" - círculo central com cor sólida
  ctx.beginPath();
  ctx.arc(CX, CY, INNER_R, 0, Math.PI*2);
  ctx.fillStyle = "#000000"; // Cor preta sólida
  ctx.fill();
  
  // Borda do círculo central
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();

  // aro dourado
  ctx.lineWidth = 20;
  ctx.strokeStyle = "#f6c453";
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI*2);
  ctx.stroke();

}

// ====== Áudio (ticks + fanfarra) ======
let audioCtx;
function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function beepTick(){
  if(!audioCtx || !settings.soundEnabled) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = 1100;
  gain.gain.value = 0.0001;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
  osc.stop(audioCtx.currentTime + 0.05);
}
function fanfare(){
  if(!audioCtx || !settings.soundEnabled) return;
  const notes = [523,659,784,1046];
  let t = audioCtx.currentTime;
  notes.forEach((f, i)=>{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type="sine"; o.frequency.value=f;
    g.gain.value=0.0001;
    o.connect(g).connect(audioCtx.destination);
    o.start(t + i*0.08);
    g.gain.exponentialRampToValueAtTime(0.15, t + i*0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.00001, t + i*0.08 + 0.25);
    o.stop(t + i*0.08 + 0.26);
  });
}

// ====== Animação do giro ======
let animId = null;
let spinning = false;
let currentRot = 0;
let lastTickIndex = -1;

function easeOutQuint(x){ return 1 - Math.pow(1 - x, 5); }

function spin(targetIndex=null){
  if(spinning) {
    return;
  }
  ensureAudio();
  spinning = true;
  spinBtn.disabled = true; shuffleBtn.disabled = true;
  spinBtn.classList.add('spinning');
  resultEl.textContent = "Girando...";

  const idx = (targetIndex==null)
    ? (settings.usePercentages ? selectPrizeByPercentage() : Math.floor(Math.random()*PRIZES.length))
    : ((targetIndex%PRIZES.length)+PRIZES.length)%PRIZES.length;

  const pointerAngle = -Math.PI/2;
  const centerOfSector = idx*SEG_ANGLE + SEG_ANGLE/2;
  const base = pointerAngle - centerOfSector;

  // Velocidade baseada nas configurações
  let extraTurns, duration;
  switch(settings.speed) {
    case 'slow':
      extraTurns = 10 + Math.floor(Math.random()*3); // Mais voltas para velocidade lenta
      duration = 8000 + Math.random()*2000; // 2.5x mais tempo (8000ms vs 3200ms normal)
      break;
    case 'fast':
      extraTurns = 3 + Math.floor(Math.random()*2);
      duration = 2400 + Math.random()*600;
      break;
    case 'custom':
      // Velocidade personalizada baseada no valor definido pelo usuário
      const customSeconds = settings.customSpeedSeconds || 10;
      extraTurns = Math.floor(customSeconds * 1.5) + Math.floor(Math.random()*2); // ~1.5 voltas por segundo
      duration = customSeconds * 1000 + Math.random()*500; // Tempo em milissegundos
      break;
    default:
      extraTurns = 4 + Math.floor(Math.random()*3);
      duration = 3200 + Math.random()*800;
  }

  const finalRotation = base + extraTurns * Math.PI * 2;
  const start = performance.now();
  lastTickIndex = -1;

  function frame(now){
    const t = Math.min(1, (now - start)/duration);
    const e = easeOutQuint(t);
    const angle = currentRot + (finalRotation)*e;
    drawWheel(angle);

    const normalized = (angle % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    // Calcular qual setor está sendo apontado pelo ponteiro no topo
    const pointerAngle = -Math.PI/2;
    const normalizedPointer = (pointerAngle - normalized + Math.PI*2) % (Math.PI*2);
    const crossedIndex = Math.floor(normalizedPointer / SEG_ANGLE) % PRIZES.length;
    if (crossedIndex !== lastTickIndex){
      beepTick();
      lastTickIndex = crossedIndex;
    }

    if(t < 1){
      animId = requestAnimationFrame(frame);
    } else {
      currentRot = angle % (Math.PI*2);
      spinning = false;
      spinBtn.disabled = false; shuffleBtn.disabled = false;
      spinBtn.classList.remove('spinning');
      fanfare();
      const norm = (currentRot % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
      // O ponteiro está no topo (meio-dia), então precisamos calcular qual setor está sendo apontado
      // O ponteiro aponta para -Math.PI/2 (topo), então o setor vencedor é o que está nessa posição
      const pointerAngle = -Math.PI/2;
      const normalizedPointer = (pointerAngle - norm + Math.PI*2) % (Math.PI*2);
      const winIndex = Math.floor(normalizedPointer / SEG_ANGLE) % PRIZES.length;
      
      // Validar se o índice é válido e se o prêmio existe
      if (winIndex >= 0 && winIndex < PRIZES.length && PRIZES[winIndex]) {
        const prize = PRIZES[winIndex];
        const isLoss = PRIZE_IS_LOSS[winIndex] || false;
        
        // Mensagem diferente baseada no tipo de prêmio
        if(isLoss) {
          resultEl.textContent = `😔 Que pena! Você tirou: ${prize}`;
          // SEMPRE mostrar o popup, independente da configuração
          showPrizePopup(prize, true); // true indica que é uma perda
        } else {
          resultEl.textContent = `🎉 Você ganhou: ${prize}`;
          // SEMPRE mostrar o popup, independente da configuração
          showPrizePopup(prize, false); // false indica que é um prêmio
        }
      } else {
        // Fallback caso algo dê errado
        console.warn('Índice inválido ou prêmio não encontrado:', winIndex, PRIZES);
        resultEl.textContent = "🎯 Tente novamente!";
        // SEMPRE mostrar popup mesmo no fallback
        showPrizePopup("Tente novamente!", true); // true indica que é uma perda
      }
    }
  }
  animId = requestAnimationFrame(frame);
}

// ====== Utilidades ======
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function pickTestIndex(){
  return Math.floor(Math.random()*PRIZES.length);
}

// ====== Modais ======
function openEditModal(){
  // Carregar o título atual
  document.getElementById('editEventTitle').value = document.getElementById('eventTitle').value;
  renderPrizes();
  document.getElementById('editModal').style.display = 'block';
}

function closeEditModal(){
  document.getElementById('editModal').style.display = 'none';
}

function openSettingsModal(){
  // Inicializar switches com estado atual
  document.getElementById('soundSwitch').classList.toggle('active', settings.soundEnabled);
  document.getElementById('idleSwitch').classList.toggle('active', settings.idleAnimation);
  document.getElementById('percentageSwitch').classList.toggle('active', settings.usePercentages);
  
  // Configurar velocidade
  document.getElementById('speed').value = settings.speed;
  document.getElementById('customSpeedValue').value = settings.customSpeedSeconds || 10;
  toggleCustomSpeed(); // Mostrar/ocultar campo personalizado
  
  // Configurar tema
  document.getElementById('theme').value = settings.theme;
  toggleCustomColors(); // Mostrar/ocultar interface de cores personalizadas
  
  // Configurar visibilidade das porcentagens
  const container = document.getElementById('percentagesContainer');
  const total = document.getElementById('percentageTotal');
  const info = document.getElementById('percentageInfo');
  
  if (settings.usePercentages) {
    container.style.display = 'block';
    total.style.display = 'block';
    info.style.display = 'none';
    renderPercentages();
  } else {
    container.style.display = 'none';
    total.style.display = 'none';
    info.style.display = 'block';
  }
  
  document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal(){
  document.getElementById('settingsModal').style.display = 'none';
}

function openInfoModal(){
  document.getElementById('infoModal').style.display = 'block';
}

function closeInfoModal(){
  document.getElementById('infoModal').style.display = 'none';
}

function renderPrizes(){
  const container = document.getElementById('prizesContainer');
  container.innerHTML = '';
  PRIZES.forEach((prize, index) => {
    const div = document.createElement('div');
    div.className = 'prize-input';
    div.innerHTML = `
      <span class="prize-number">${index + 1}</span>
      <input type="text" value="${prize}" placeholder="Ex: Cupom R$ 50, Brinde especial, etc.">
      <label class="loss-checkbox">
        <input type="checkbox" ${PRIZE_IS_LOSS[index] ? 'checked' : ''} onchange="toggleLoss(${index})">
        <span>😔 Perda</span>
      </label>
      <button class="remove-prize" onclick="removePrize(${index})" title="Remover este prêmio">×</button>
    `;
    container.appendChild(div);
  });
}

// Função para renderizar as porcentagens no modal de configurações
function renderPercentages(){
  const container = document.getElementById('percentagesContainer');
  container.innerHTML = '';
  
  PRIZES.forEach((prize, index) => {
    const div = document.createElement('div');
    div.className = 'percentage-item';
    div.innerHTML = `
      <span class="percentage-label">${prize}</span>
      <input type="number" class="percentage-input" value="${PRIZE_PERCENTAGES[index]}" 
             min="0" max="100" onchange="updatePercentage(${index}, this.value)">
      <span style="color:#f6c453;">%</span>
    `;
    container.appendChild(div);
  });
  
  updateTotalPercentage();
}

// Função para atualizar uma porcentagem específica
function updatePercentage(index, value) {
  PRIZE_PERCENTAGES[index] = parseInt(value) || 0;
  updateTotalPercentage();
}

// Função para alternar entre porcentagens personalizadas e sistema padrão
function togglePercentages() {
  settings.usePercentages = !settings.usePercentages;
  const switchElement = document.getElementById('percentageSwitch');
  const container = document.getElementById('percentagesContainer');
  const total = document.getElementById('percentageTotal');
  const info = document.getElementById('percentageInfo');
  
  switchElement.classList.toggle('active', settings.usePercentages);
  
  if (settings.usePercentages) {
    container.style.display = 'block';
    total.style.display = 'block';
    info.style.display = 'none';
    renderPercentages();
  } else {
    container.style.display = 'none';
    total.style.display = 'none';
    info.style.display = 'block';
  }
}

function addPrize(){
  PRIZES.push('');
  PRIZE_PERCENTAGES.push(8); // Porcentagem padrão para novos prêmios
  PRIZE_IS_LOSS.push(false); // Novo prêmio não é perda por padrão
  renderPrizes();
}

function toggleLoss(index){
  PRIZE_IS_LOSS[index] = !PRIZE_IS_LOSS[index];
}

function removePrize(index){
  if(PRIZES.length > 2) {
    PRIZES.splice(index, 1);
    PRIZE_PERCENTAGES.splice(index, 1);
    PRIZE_IS_LOSS.splice(index, 1);
    updateWheelDimensions(); // Recalcular dimensões
    renderPrizes();
    drawWheel(currentRot); // Redesenhar a roleta
  }
}

function savePrizes(){
  // Salvar o título editado
  const newTitle = document.getElementById('editEventTitle').value.trim();
  if(newTitle) {
    document.getElementById('eventTitle').value = newTitle;
  }
  
  // Salvar os prêmios e suas configurações de perda
  const prizeInputs = document.querySelectorAll('#prizesContainer input[type="text"]');
  const lossCheckboxes = document.querySelectorAll('#prizesContainer input[type="checkbox"]');
  
  // Filtrar prêmios vazios e manter correspondência com checkboxes
  const validPrizes = [];
  const validLosses = [];
  
  prizeInputs.forEach((input, index) => {
    const prize = input.value.trim();
    if(prize) { // Só adiciona se não estiver vazio
      validPrizes.push(prize);
      validLosses.push(lossCheckboxes[index] ? lossCheckboxes[index].checked : false);
    }
  });
  
  PRIZES = validPrizes;
  PRIZE_IS_LOSS = validLosses;
  
  if(PRIZES.length < 2) {
    alert('É necessário pelo menos 2 prêmios!');
    return;
  }
  
  // Ajustar arrays de porcentagens se necessário
  while(PRIZE_PERCENTAGES.length < PRIZES.length) {
    PRIZE_PERCENTAGES.push(8);
  }
  while(PRIZE_PERCENTAGES.length > PRIZES.length) {
    PRIZE_PERCENTAGES.pop();
  }
  
  updateWheelDimensions(); // Recalcular dimensões
  
  // Salvar prêmios no localStorage
  localStorage.setItem('roletaPrizes', JSON.stringify(PRIZES));
  localStorage.setItem('roletaPrizeLosses', JSON.stringify(PRIZE_IS_LOSS));
  
  closeEditModal();
  drawWheel(currentRot);
}

// Funções do popup de prêmio
function showPrizePopup(prize, isLoss = false){
  const prizeNameElement = document.getElementById('prizeName');
  const popupElement = document.getElementById('prizePopup');
  const prizeTitleElement = document.querySelector('.prize-content h2');
  
  // Garantir que sempre temos um prêmio válido
  if(!prize || prize.trim() === '' || prize === 'undefined') {
    console.warn('Prêmio vazio ou indefinido, usando fallback:', prize);
    prize = isLoss ? "Tente novamente!" : "Prêmio especial!";
  }
  
  // Verificar se os elementos existem
  if(!prizeNameElement) {
    console.error('Elemento prizeName não encontrado');
    return;
  }
  if(!popupElement) {
    console.error('Elemento prizePopup não encontrado');
    return;
  }
  if(!prizeTitleElement) {
    console.error('Elemento prizeTitle não encontrado');
    return;
  }
  
  // Sempre mostrar o popup
  prizeNameElement.textContent = prize;
  
  // Mudar título e estilo baseado no tipo
  if(isLoss) {
    prizeTitleElement.textContent = '😔 Que pena!';
    prizeTitleElement.style.color = '#ff6b6b'; // Cor vermelha para perdas
  } else {
    prizeTitleElement.textContent = '🎉 Parabéns!';
    prizeTitleElement.style.color = '#f6c453'; // Cor dourada para prêmios
  }
  
  // SEMPRE mostrar o popup
  popupElement.style.display = 'flex';
  
  console.log('Popup exibido:', { prize, isLoss });
}

function closePrizePopup(){
  document.getElementById('prizePopup').style.display = 'none';
}

// Função para carregar configurações do localStorage
function loadSettings(){
  // Carregar configurações gerais
  const savedSettings = localStorage.getItem('rouletteSettings');
  if(savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Mesclar configurações salvas com as padrão
      settings = {...settings, ...parsedSettings};
    } catch(e) {
      console.warn('Erro ao carregar configurações:', e);
    }
  }
  
  // Carregar prêmios salvos
  const savedPrizes = localStorage.getItem('roletaPrizes');
  if(savedPrizes) {
    try {
      PRIZES = JSON.parse(savedPrizes);
    } catch(e) {
      console.warn('Erro ao carregar prêmios:', e);
    }
  }
  
  // Carregar configurações de perda dos prêmios
  const savedPrizeLosses = localStorage.getItem('roletaPrizeLosses');
  if(savedPrizeLosses) {
    try {
      PRIZE_IS_LOSS = JSON.parse(savedPrizeLosses);
    } catch(e) {
      console.warn('Erro ao carregar configurações de perda:', e);
    }
  }
  
  // Recalcular dimensões se os prêmios mudaram
  if(savedPrizes) {
    updateWheelDimensions();
  }
  
  // Carregar cores personalizadas se existirem
  const savedCustomColors = localStorage.getItem('customColors');
  if(savedCustomColors) {
    try {
      selectedColors = JSON.parse(savedCustomColors);
    } catch(e) {
      console.warn('Erro ao carregar cores personalizadas:', e);
    }
  }
  
  // Se o tema for personalizada, aplicar as cores salvas
  if(settings.theme === 'personalizada') {
    const customPalette = [];
    for(let i = 0; i < 14; i++) {
      if(i % 3 === 0) customPalette.push(selectedColors[0]);
      else if(i % 3 === 1) customPalette.push(selectedColors[1]);
      else customPalette.push(selectedColors[2]);
    }
    colorPalettes.personalizada = customPalette;
  }
}

function saveSettings(){
  settings.soundEnabled = document.getElementById('soundSwitch').classList.contains('active');
  settings.speed = document.getElementById('speed').value;
  settings.customSpeedSeconds = parseInt(document.getElementById('customSpeedValue').value) || 10;
  settings.theme = document.getElementById('theme').value;
  settings.idleAnimation = document.getElementById('idleSwitch').classList.contains('active');
  settings.usePercentages = document.getElementById('percentageSwitch').classList.contains('active');
  
  // Salvar no localStorage
  localStorage.setItem('rouletteSettings', JSON.stringify(settings));
  
  closeSettingsModal();
  drawWheel(currentRot); // Redesenha com nova paleta de cores
}

// Funções dos switches
function toggleSound(){
  const switchEl = document.getElementById('soundSwitch');
  switchEl.classList.toggle('active');
}

function toggleIdle(){
  const switchEl = document.getElementById('idleSwitch');
  switchEl.classList.toggle('active');
}


function toggleCustomSpeed(){
  const speedSelect = document.getElementById('speed');
  const customContainer = document.getElementById('customSpeedContainer');
  
  if(speedSelect.value === 'custom') {
    customContainer.style.display = 'block';
  } else {
    customContainer.style.display = 'none';
  }
}

function toggleCustomColors(){
  const themeSelect = document.getElementById('theme');
  const customContainer = document.getElementById('customColorsContainer');
  
  if(themeSelect.value === 'personalizada') {
    customContainer.style.display = 'block';
    // Carregar cores salvas se existirem
    loadCustomColors();
    // Aplicar tema personalizado para preview
    settings.theme = 'personalizada';
    // Salvar tema personalizado no localStorage
    localStorage.setItem('rouletteSettings', JSON.stringify(settings));
    previewSelectedColors();
  } else {
    customContainer.style.display = 'none';
  }
}

// Variáveis para controle de seleção de cores
let currentColorSlot = 1; // 1, 2 ou 3
let selectedColors = ['#eec116', '#2e3d88', '#4a9eff']; // Cores padrão

function selectColor(button, slot) {
  const color = button.getAttribute('data-color');
  
  // Determinar qual slot usar (rotacionar entre 1, 2, 3)
  currentColorSlot = currentColorSlot > 3 ? 1 : currentColorSlot;
  
  // Atualizar cor selecionada
  selectedColors[currentColorSlot - 1] = color;
  
  // Atualizar visual do slot selecionado
  document.getElementById(`selectedColor${currentColorSlot}`).style.background = color;
  
  // Mostrar indicador de confirmação no slot preenchido
  showSlotIndicator(currentColorSlot);
  
  // Destacar botão clicado
  highlightSelectedButton(button);
  
  // Aplicar preview imediatamente
  previewSelectedColors();
  
  // Salvar cores no localStorage
  localStorage.setItem('customColors', JSON.stringify(selectedColors));
  
  // Garantir que o tema personalizado está salvo
  settings.theme = 'personalizada';
  localStorage.setItem('rouletteSettings', JSON.stringify(settings));
  
  // Avançar para o próximo slot
  currentColorSlot++;
  
  // Atualizar indicador do próximo slot
  updateNextSlotIndicator();
}

function showSlotIndicator(slot) {
  // Mostrar indicador de confirmação
  const indicator = document.getElementById(`slotIndicator${slot}`);
  indicator.style.display = 'block';
  
  // Remover indicador após 2 segundos
  setTimeout(() => {
    indicator.style.display = 'none';
  }, 2000);
}

function updateNextSlotIndicator() {
  const nextSlotText = document.getElementById('nextSlotText');
  const slotNames = ['Cor 1', 'Cor 2', 'Cor 3'];
  nextSlotText.textContent = slotNames[currentColorSlot - 1];
}

function highlightSelectedButton(clickedButton) {
  // Remover destaque de todos os botões
  const allButtons = document.querySelectorAll('.color-btn');
  allButtons.forEach(btn => {
    btn.style.border = '2px solid #f6c453';
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  });
  
  // Destacar o botão clicado
  clickedButton.style.border = '3px solid #10b981';
  clickedButton.style.transform = 'scale(1.1)';
  clickedButton.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
  
  // Remover destaque após 1 segundo
  setTimeout(() => {
    clickedButton.style.border = '2px solid #f6c453';
    clickedButton.style.transform = 'scale(1)';
    clickedButton.style.boxShadow = 'none';
  }, 1000);
}

function previewSelectedColors() {
  // Criar paleta personalizada com as 3 cores selecionadas
  const customPalette = [];
  for(let i = 0; i < 14; i++) {
    if(i % 3 === 0) customPalette.push(selectedColors[0]);
    else if(i % 3 === 1) customPalette.push(selectedColors[1]);
    else customPalette.push(selectedColors[2]);
  }
  
  // Atualizar a paleta personalizada
  colorPalettes.personalizada = customPalette;
  
  // Forçar atualização do tema
  settings.theme = 'personalizada';
  
  // Redesenhar a roleta
  drawWheel(currentRot);
}

function loadCustomColors(){
  // Carregar cores salvas do localStorage
  const savedColors = JSON.parse(localStorage.getItem('customColors') || '["#eec116","#2e3d88","#4a9eff"]');
  
  // Atualizar cores selecionadas
  selectedColors = savedColors;
  
  // Atualizar visual dos slots
  document.getElementById('selectedColor1').style.background = selectedColors[0];
  document.getElementById('selectedColor2').style.background = selectedColors[1];
  document.getElementById('selectedColor3').style.background = selectedColors[2];
  
  // Inicializar indicador do próximo slot
  updateNextSlotIndicator();
  
  // Aplicar preview
  previewSelectedColors();
}

function previewCustomColors(){
  // Função mantida para compatibilidade, mas agora usa previewSelectedColors
  previewSelectedColors();
}

function applyCustomColors(){
  // Criar paleta personalizada com as 3 cores selecionadas
  const customPalette = [];
  for(let i = 0; i < 14; i++) {
    if(i % 3 === 0) customPalette.push(selectedColors[0]);
    else if(i % 3 === 1) customPalette.push(selectedColors[1]);
    else customPalette.push(selectedColors[2]);
  }
  
  // Atualizar a paleta personalizada
  colorPalettes.personalizada = customPalette;
  
  // Salvar cores no localStorage
  localStorage.setItem('customColors', JSON.stringify(selectedColors));
  
  // Aplicar o tema personalizado
  settings.theme = 'personalizada';
  saveSettings();
  
  // Redesenhar a roleta
  drawWheel(currentRot);
  
  // Mostrar confirmação
  const btn = document.getElementById('applyCustomColors');
  const originalText = btn.textContent;
  btn.textContent = '✓ Aplicado!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = 'linear-gradient(135deg, #f6c453, #e6b800)';
  }, 2000);
}

// Função para upload de QR Code
function uploadQR(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e){
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = function(e){
        const qrPlaceholder = document.querySelector('.qr-placeholder');
        qrPlaceholder.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:6px;" alt="QR Code">`;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Função para debug do ponteiro
function debugPointer(){
  const norm = (currentRot % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
  const pointerAngle = -Math.PI/2;
  const normalizedPointer = (pointerAngle - norm + Math.PI*2) % (Math.PI*2);
  const winIndex = Math.floor(normalizedPointer / SEG_ANGLE) % PRIZES.length;
}

// ====== Eventos ======
document.getElementById('infoBtn').addEventListener('click', openInfoModal);
document.getElementById('customizeBtn').addEventListener('click', openEditModal);
document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);

// Event listeners para cores personalizadas
document.getElementById('theme').addEventListener('change', toggleCustomColors);
document.getElementById('applyCustomColors').addEventListener('click', applyCustomColors);
spinBtn.addEventListener('click', ()=> {
  spin();
});
shuffleBtn.addEventListener('click', ()=>{
  shuffle(PRIZES);
  resultEl.textContent = "Prêmios embaralhados.";
  drawWheel(currentRot);
});

// ====== Inicialização ======
let idleStart = null;
function idleRotate(ts){
  if(!idleStart) idleStart = ts;
  const t = (ts - idleStart)/1000;
  if(!spinning && settings.idleAnimation){
    const idle = currentRot + (Math.sin(t*0.6)*0.002);
    drawWheel(idle);
  } else if(!spinning) {
    drawWheel(currentRot);
  }
  requestAnimationFrame(idleRotate);
}
// Carregar configurações salvas
loadSettings();

drawWheel(0);
requestAnimationFrame(idleRotate);

// Acessibilidade de teclado
window.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){ e.preventDefault(); spin(); }
});

// Fechar modais clicando fora
window.addEventListener('click', (e)=>{
  if(e.target.classList.contains('modal')){
    e.target.style.display = 'none';
  }
  if(e.target.classList.contains('prize-popup')){
    closePrizePopup();
  }
});

// Fechar popup com ESC
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    closePrizePopup();
    closeEditModal();
    closeSettingsModal();
    closeInfoModal();
  }
});
