/**
 * Roleta Morillo's Pet - Show de Prêmios
 * JavaScript principal da aplicação
 * 
 * @author NeoTech Soluções
 * @version 2.0
 */

// Classe principal da Roleta
class RoletaGame {
    constructor() {
        this.premios = ['$10', 'ZERO', '$2', '$50', '$1', '$5', '$20', 'JACKPOT', '$15', '$100', '$1', '$500'];
        this.rotationDuration = 4;
        this.ledAtivo = true;
        this.isSpinning = false;
        this.currentRotation = 0;
        this.audioContext = null;
        this.audioBuffer = null;
        
        this.init();
    }

    async init() {
        try {
            // Mostrar loading screen
            this.showLoading();
            
            // Aguardar carregamento dos recursos
            await this.loadResources();
            
            // Configurar elementos
            this.setupElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar áudio
            await this.setupAudio();
            
            // Esconder loading screen
            this.hideLoading();
            
            console.log('🎯 Roleta inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar roleta:', error);
            this.hideLoading();
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }

    async loadResources() {
        // Simular carregamento de recursos
        return new Promise(resolve => {
            setTimeout(resolve, 1500);
        });
    }

    setupElements() {
        this.elements = {
            girarButton: document.querySelector('.girar'),
            roletaPersonalizada: document.querySelector('.roleta-personalizada'),
            popupGanho: document.querySelector('.popupganho'),
            overlay: document.querySelector('.overlay'),
            audio: document.getElementById('myAudio'),
            premioGanho: document.getElementById('premio-ganho'),
            premioSelecionado: document.getElementById('premio-selecionado'),
            botaoPersonalizar: document.querySelector('.botao-personalizar'),
            botaoConfig: document.querySelector('.botao-config'),
            ledFrame: document.querySelector('.led-frame'),
            volumeSlider: document.getElementById('volume-musica'),
            volumeValue: document.getElementById('volume-value')
        };

        // Configurar volume inicial
        if (this.elements.audio) {
            this.elements.audio.volume = 0.3;
        }
    }

    async setupAudio() {
        try {
            // Configurar contexto de áudio para melhor controle
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Configurar controle de volume
            if (this.elements.volumeSlider && this.elements.volumeValue) {
                this.elements.volumeSlider.addEventListener('input', (e) => {
                    const volume = e.target.value / 100;
                    this.elements.audio.volume = volume;
                    this.elements.volumeValue.textContent = e.target.value + '%';
                });
            }
        } catch (error) {
            console.warn('⚠️ Áudio não disponível:', error);
        }
    }

    setupEventListeners() {
        // Botão girar
        if (this.elements.girarButton) {
            this.elements.girarButton.addEventListener('click', () => this.girarRoleta());
        }

        // Botões de controle
        if (this.elements.botaoPersonalizar) {
            this.elements.botaoPersonalizar.addEventListener('click', () => this.abrirModal('modal-premios'));
        }

        if (this.elements.botaoConfig) {
            this.elements.botaoConfig.addEventListener('click', () => this.abrirModal('modal-config'));
        }

        // Overlay para fechar popup
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => this.fecharPopup());
        }

        // Fechar modais clicando fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.fecharModal(modal.id);
                }
            });
        });

        // Prevenir scroll ao clicar nos botões
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });

        // Teclado para acessibilidade
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharTodosModais();
            }
            if (e.key === 'Enter' && e.target.classList.contains('girar')) {
                this.girarRoleta();
            }
        });
    }

    async girarRoleta() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        
        // Desabilitar botão
        this.elements.girarButton.disabled = true;
        this.elements.girarButton.textContent = '🎯 GIRANDO...';
        this.elements.girarButton.classList.add('spinning');

        try {
            // Tocar som
            await this.playAudio();

            // Adicionar classe de spinning para efeito visual
            this.elements.roletaPersonalizada.classList.add('spinning');

            // Calcular rotação
            const rotationDegrees = 3600 + (Math.random() * 360) + this.currentRotation;
            this.currentRotation = rotationDegrees;

            // Aplicar rotação com easing suave
            this.elements.roletaPersonalizada.style.transition = `transform ${this.rotationDuration}s cubic-bezier(0.08, -0.2, 0.1, 1.05)`;
            this.elements.roletaPersonalizada.style.transform = `translate(-50%, -50%) rotate(${rotationDegrees}deg)`;

            // Calcular prêmio
            const premioIndex = Math.floor((rotationDegrees % 360) / 30);
            const premioEscolhido = this.premios[premioIndex] || this.premios[0];

            // Aguardar fim da rotação
            setTimeout(() => {
                this.finalizarGiro(premioEscolhido);
            }, this.rotationDuration * 1000);

        } catch (error) {
            console.error('❌ Erro ao girar roleta:', error);
            this.resetarRoleta();
        }
    }

    async playAudio() {
        try {
            if (this.elements.audio) {
                this.elements.audio.currentTime = 0;
                await this.elements.audio.play();
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível reproduzir áudio:', error);
        }
    }

    finalizarGiro(premioEscolhido) {
        // Remover classe de spinning
        this.elements.roletaPersonalizada.classList.remove('spinning');

        // Mostrar resultado
        this.mostrarResultado(premioEscolhido);

        // Parar áudio
        if (this.elements.audio) {
            this.elements.audio.pause();
            this.elements.audio.currentTime = 0;
        }

        // Disparar confetes
        this.dispararConfetes();

        // Resetar botão
        this.resetarBotao();
    }

    mostrarResultado(premioEscolhido) {
        // Mostrar overlay e popup
        this.elements.overlay.style.display = 'block';
        this.elements.popupGanho.style.display = 'block';
        this.elements.premioGanho.textContent = premioEscolhido;
        this.elements.premioSelecionado.textContent = `PRÊMIO: ${premioEscolhido}`;

        // Anunciar para leitores de tela
        this.announceResult(premioEscolhido);
    }

    announceResult(premio) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = `Você ganhou: ${premio}`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    dispararConfetes() {
        try {
            // Confetes múltiplos para efeito mais impressionante
            const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
            
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: colors,
                        shapes: ['circle', 'square'],
                        gravity: 0.8
                    });
                }, i * 200);
            }
        } catch (error) {
            console.warn('⚠️ Confetes não disponíveis:', error);
        }
    }

    resetarBotao() {
        this.elements.girarButton.disabled = false;
        this.elements.girarButton.textContent = '🎯 GIRAR NOVAMENTE';
        this.elements.girarButton.classList.remove('spinning');
        this.isSpinning = false;
    }

    resetarRoleta() {
        this.elements.roletaPersonalizada.style.transition = 'none';
        this.elements.roletaPersonalizada.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        this.currentRotation = 0;
        this.resetarBotao();
    }

    fecharPopup() {
        this.elements.popupGanho.style.display = 'none';
        this.elements.overlay.style.display = 'none';
        
        // Resetar roleta
        setTimeout(() => {
            this.resetarRoleta();
        }, 300);
    }

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            // Focar no primeiro input
            const firstInput = modal.querySelector('input, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    fecharModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    fecharTodosModais() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.fecharPopup();
    }

    salvarPremios() {
        try {
            for (let i = 1; i <= 12; i++) {
                const input = document.getElementById(`premio${i}`);
                if (input) {
                    this.premios[i - 1] = input.value.trim() || this.premios[i - 1];
                    
                    // Atualizar o texto na roleta
                    const premioTexto = document.querySelector(`.premio-${i}`);
                    if (premioTexto) {
                        premioTexto.textContent = this.premios[i - 1];
                    }
                }
            }
            
            this.fecharModal('modal-premios');
            this.showNotification('Prêmios salvos com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar prêmios:', error);
            this.showNotification('Erro ao salvar prêmios', 'error');
        }
    }

    salvarConfiguracoes() {
        try {
            // Salvar velocidade
            const velocidadeSelect = document.getElementById('velocidade-roleta');
            if (velocidadeSelect) {
                this.rotationDuration = parseInt(velocidadeSelect.value);
            }
            
            // Salvar LED
            const ledSelect = document.getElementById('led-frame');
            if (ledSelect) {
                this.ledAtivo = ledSelect.value === 'true';
                this.elements.ledFrame.style.display = this.ledAtivo ? 'block' : 'none';
            }
            
            // Salvar título
            const tituloInput = document.getElementById('titulo-sorteio');
            const tituloSorteio = document.querySelector('.titulo-sorteio');
            if (tituloInput && tituloSorteio) {
                tituloSorteio.textContent = tituloInput.value.trim() || 'Título do Sorteio';
            }
            
            this.fecharModal('modal-config');
            this.showNotification('Configurações salvas com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.roletaGame = new RoletaGame();
    
    // Funções globais para compatibilidade com HTML
    window.fecharPopup = () => window.roletaGame.fecharPopup();
    window.abrirModal = (modalId) => window.roletaGame.abrirModal(modalId);
    window.fecharModal = (modalId) => window.roletaGame.fecharModal(modalId);
    window.salvarPremios = () => window.roletaGame.salvarPremios();
    window.salvarConfiguracoes = () => window.roletaGame.salvarConfiguracoes();
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('⚠️ Service Worker não registrado:', error);
            });
    });
}
