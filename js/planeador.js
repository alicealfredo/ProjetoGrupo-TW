
let currentDate = new Date(2026, 0, 1); // Janeiro 2026

let monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function renderCalendar() {
    let grid = document.getElementById('days-grid');
    if (!grid) return;

    grid.innerHTML = '';

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    document.getElementById('current-month-year').textContent = 
        `${monthNames[month]} ${year}`;

    let firstDayOfMonth = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    //  mês anterior 
    let prevMonthDays = (firstDayOfMonth === 0 ? 7 : firstDayOfMonth);
    for (let i = 0; i < prevMonthDays; i++) {
        let dayEl = document.createElement('div');
        dayEl.className = 'day outside-month';
        grid.appendChild(dayEl);
    }

    //  mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        let dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="meals-container" data-date="${dateStr}"></div>
            <button class="add-btn btn btn-primary btn-sm rounded-circle" data-date="${dateStr}">+</button>
        `;

       
        let mealsContainer = dayEl.querySelector('.meals-container');
        if (currentUser?.plans?.[dateStr]) {
            Object.entries(currentUser.plans[dateStr]).forEach(([type, recipeId]) => {
                let recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    mealsContainer.innerHTML += `
                        <div class="meal-item ${type}">
                            ${type === 'almoço' ? '🕛' : '🌙'} ${recipe.name}
                            <button class="remove-meal btn btn-sm" data-date="${dateStr}" data-type="${type}">×</button>
                        </div>
                    `;
                }
            });
        }

        grid.appendChild(dayEl);
    }


}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function openAddMealModal(dateStr) {
    let modal = new bootstrap.Modal(document.getElementById('addMealModal'));
    document.getElementById('modal-date-display').textContent = formatDate(dateStr);

    let list = document.getElementById('recipe-list');
    list.innerHTML = '';

    recipes.forEach(r => {
        let div = document.createElement('div');
        div.className = 'recipe-option';
        div.innerHTML = `<strong>${r.name}</strong> <small>(${r.time} min • ${r.difficulty})</small>`;
        div.addEventListener('click', () => {
            addMeal(dateStr, r.id);
            modal.hide();
        });
        list.appendChild(div);
    });

    modal.show();
}

function formatDate(dateStr) {
    let [y, m, d] = dateStr.split('-');
    return `${parseInt(d)} de ${monthNames[parseInt(m)-1]} de ${y}`;
}

function addMeal(dateStr, recipeId) {
    let type = document.getElementById('meal-type-select').value;

    if (!currentUser.plans) currentUser.plans = {};
    if (!currentUser.plans[dateStr]) currentUser.plans[dateStr] = {};

    currentUser.plans[dateStr][type] = recipeId;

    saveToStorage('currentUser', currentUser);
    saveToStorage('users', users.map(u => u.id === currentUser.id ? currentUser : u));

    renderCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) return;

    renderCalendar();

    document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));


    document.addEventListener('click', e => {
        let target = e.target;

        if (target.classList.contains('add-btn')) {
            openAddMealModal(target.dataset.date);
        }

        if (target.classList.contains('remove-meal')) {
            let date = target.dataset.date;
            let type = target.dataset.type;

            if (currentUser.plans?.[date]?.[type]) {
                delete currentUser.plans[date][type];
                if (Object.keys(currentUser.plans[date]).length === 0) {
                    delete currentUser.plans[date];
                }
                saveToStorage('currentUser', currentUser);
                saveToStorage('users', users.map(u => u.id === currentUser.id ? currentUser : u));
                renderCalendar();
            }
        }
    });
});