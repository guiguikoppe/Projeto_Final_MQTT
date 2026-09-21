document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.navegacao a');

    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('ativo');
        } else {
            link.classList.remove('ativo');
        }
    });
});
