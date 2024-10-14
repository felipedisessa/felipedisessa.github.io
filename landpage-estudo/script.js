document.addEventListener('DOMContentLoaded', function() {

    AOS.init({
        duration: 800, 
        once: false      
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    // Adiciona evento de clique ao ícone de menu sanduíche
    menuToggle.addEventListener('click', function() {
        // Alterna a classe 'active' no menu sanduíche e na lista de navegação
        menuToggle.classList.toggle('active');
        navList.classList.toggle('active');
    });
});
