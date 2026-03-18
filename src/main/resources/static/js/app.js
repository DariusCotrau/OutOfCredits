let currentQuestion = null;
let answered = false;
let correctCount = 0;
let totalAnswered = 0;
let currentTopic = '';

const homeScreen = document.getElementById('homeScreen');
const quizScreen = document.getElementById('quizScreen');
const quizArea = document.getElementById('quizArea');
const scoreDisplay = document.getElementById('scoreDisplay');
const homeStats = document.getElementById('homeStats');
const topicGrid = document.getElementById('topicGrid');

// ===== INIT =====
async function init() {
    const stats = await fetch('/api/stats').then(r => r.json());
    homeStats.textContent = `${stats.totalQuestions} intrebari disponibile`;

    const topics = await fetch('/api/topics').then(r => r.json());

    // Count questions per topic
    const allQuestions = stats.totalQuestions;

    topics.forEach(t => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => startQuiz(t);
        card.innerHTML = `
            <div class="topic-info">
                <div class="topic-name">${escapeHtml(t)}</div>
            </div>
            <span class="topic-arrow">&rarr;</span>
        `;
        topicGrid.appendChild(card);
    });
}

// ===== NAVIGATION =====
function startQuiz(topic) {
    currentTopic = topic;
    correctCount = 0;
    totalAnswered = 0;
    scoreDisplay.textContent = '0 / 0';

    homeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    loadQuestion();
}

function goHome() {
    quizScreen.classList.remove('active');
    homeScreen.classList.add('active');
}

// ===== QUIZ =====
async function loadQuestion() {
    answered = false;
    quizArea.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <span>Se incarca intrebarea...</span>
        </div>
    `;

    const url = currentTopic
        ? `/api/question/random?topic=${encodeURIComponent(currentTopic)}`
        : '/api/question/random';

    const data = await fetch(url).then(r => r.json());

    if (data.error) {
        quizArea.innerHTML = `<div class="loading-state"><span>${data.error}</span></div>`;
        return;
    }

    currentQuestion = data;
    renderQuestion(data);
}

function renderQuestion(q) {
    const inputType = q.multipleCorrect ? 'checkbox' : 'radio';

    let html = `
        <div class="question-header">
            <span class="topic-badge">${escapeHtml(q.tematica)}</span>
            <span class="question-number">#${q.number}</span>
            ${q.needsVisualization ? '<span class="viz-badge">Necesita imagine/cod</span>' : ''}
        </div>
        <div class="question-text">${escapeHtml(q.questionText)}</div>
    `;

    if (q.multipleCorrect) {
        html += `<div class="hint-multiple">Aceasta intrebare are mai multe raspunsuri corecte. Selecteaza toate variantele corecte.</div>`;
    }

    html += `<div class="options-list">`;
    q.options.forEach((opt, i) => {
        const letter = opt.match(/^\(([a-z])\)/);
        const value = letter ? letter[1] : String.fromCharCode(97 + i);
        html += `
            <div class="option-item" data-value="${value}" onclick="toggleOption(this, '${inputType}')">
                <input type="${inputType}" name="answer" value="${value}" id="opt_${value}">
                <label for="opt_${value}">${escapeHtml(opt)}</label>
            </div>
        `;
    });
    html += `</div>`;

    html += `<button class="btn-submit" onclick="submitAnswer()">Verifica raspunsul</button>`;

    quizArea.innerHTML = html;
}

function toggleOption(el, type) {
    if (answered) return;

    if (type === 'radio') {
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
            item.querySelector('input').checked = false;
        });
        el.classList.add('selected');
        el.querySelector('input').checked = true;
    } else {
        el.classList.toggle('selected');
        const input = el.querySelector('input');
        input.checked = !input.checked;
    }
}

async function submitAnswer() {
    if (answered || !currentQuestion) return;

    const selected = [];
    document.querySelectorAll('.option-item.selected').forEach(el => {
        selected.push(el.dataset.value);
    });

    if (selected.length === 0) return;

    answered = true;

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Se verifica...';

    const loadingHtml = `
        <div class="explanation-box" id="explanationBox">
            <div class="loading">
                <div class="spinner"></div>
                <span>Se genereaza explicatia...</span>
            </div>
        </div>
    `;
    quizArea.insertAdjacentHTML('beforeend', loadingHtml);

    const response = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            questionId: currentQuestion.id,
            selectedAnswers: selected
        })
    }).then(r => r.json());

    totalAnswered++;
    if (response.correct) correctCount++;
    scoreDisplay.textContent = `${correctCount} / ${totalAnswered}`;

    document.querySelectorAll('.option-item').forEach(el => {
        el.classList.add('disabled');
        const val = el.dataset.value;
        if (response.correctAnswers.includes(val)) {
            el.classList.add(selected.includes(val) ? 'correct' : 'missed');
        } else if (selected.includes(val)) {
            el.classList.add('incorrect');
        }
        el.classList.remove('selected');
    });

    const explanationBox = document.getElementById('explanationBox');
    const resultClass = response.correct ? 'correct-result' : 'incorrect-result';
    const icon = response.correct ? '&#10003;' : '&#10007;';
    const title = response.correct ? 'Corect!' : 'Incorect';

    explanationBox.className = `explanation-box ${resultClass}`;
    explanationBox.innerHTML = `
        <h3>${icon} ${title}</h3>
        <div class="explanation-text">${escapeHtml(response.explanation)}</div>
    `;

    submitBtn.textContent = 'Raspuns trimis';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
