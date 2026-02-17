document.addEventListener('DOMContentLoaded', function() {
    
    AOS.init({
        duration: 800,
        offset: 100,
        once: true,
        easing: 'ease-out'
    });

    lucide.createIcons();

    const nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.classList.add('shadow-xl', 'py-3');
            nav.classList.remove('py-4');
        } else {
            nav.classList.remove('shadow-xl', 'py-3');
            nav.classList.add('py-4');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});