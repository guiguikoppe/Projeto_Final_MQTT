document.addEventListener('DOMContentLoaded', () => {
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const links = document.querySelectorAll('.navegacao a, .menu a, .dashboard-nav a');

    links.forEach((link) => {
        const href = (link.dataset.page || link.getAttribute('href') || '').toLowerCase();
        const isActive = href === currentPage || href === currentPage.replace(/\\/g, '');

        link.classList.toggle('ativo', isActive);
        link.classList.toggle('active', isActive);
    });
});
