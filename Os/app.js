const searchInput = document.getElementById('searchInput');
const projectItems = document.querySelectorAll('.projects')[0].querySelectorAll('li');

searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase();
    projectItems.forEach(item => {
        const text = item.querySelector('.sys-name').textContent.toLowerCase();
        item.style.display = text.includes(filter) ? '' : 'none';
    });
});

function toggleWin7Menu(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('win7Dropdown').classList.toggle('show');
}

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('win7Dropdown');
    if (dropdown && !e.target.closest('.win7-wrapper')) {
        dropdown.classList.remove('show');
    }
});
