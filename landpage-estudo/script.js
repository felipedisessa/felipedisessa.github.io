document.addEventListener('DOMContentLoaded', function() {

    AOS.init({
        duration: 800, 
        once: false      
    });

    const clickLogo = document.querySelector('.logo');

    clickLogo.addEventListener('click', function() {
        window.location.href = '/landpage/landpage-estudo/';
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    // Adiciona evento de clique ao ícone de menu sanduíche
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navList.classList.toggle('active');
    });
});
