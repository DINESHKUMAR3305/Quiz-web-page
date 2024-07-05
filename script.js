let currentPage = 0;
let timer;
let timeRemaining = 180; 
let userAnswers = {};
let questions = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    startTimer();
});

function fetchQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestions();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function startTimer() {
    timer = setInterval(() => {
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (timeRemaining <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

function loadQuestions() {
    displayPage();
}

function displayPage() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';

    const start = currentPage * 5;
    const end = Math.min(start + 5, questions.length);

    for (let i = start; i < end; i++) {
        const question = questions[i];
        const questionElement = document.createElement('div');
        questionElement.className = 'question';

        const label = document.createElement('label');
        label.textContent = `${i + 1}. ${question.content}`;
        questionElement.appendChild(label);

        if (question.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `q${i}`;
            input.value = userAnswers[`q${i}`] || '';
            input.addEventListener('input', saveAnswer);
            questionElement.appendChild(input);
        } else if (question.type === 'radio') {
            question.options.forEach(option => {
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `q${i}`;
                radio.value = option;
                radio.checked = userAnswers[`q${i}`] === option;
                radio.addEventListener('click', saveAnswer);

                const radioLabel = document.createElement('label');
                radioLabel.textContent = option;

                questionElement.appendChild(radio);
                questionElement.appendChild(radioLabel);
                questionElement.appendChild(document.createElement('br'));
            });
        } else if (question.type === 'checkbox') {
            question.options.forEach(option => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = `q${i}`;
                checkbox.value = option;
                checkbox.checked = userAnswers[`q${i}`] && userAnswers[`q${i}`].includes(option);
                checkbox.addEventListener('click', saveAnswer);

                const checkboxLabel = document.createElement('label');
                checkboxLabel.textContent = option;

                questionElement.appendChild(checkbox);
                questionElement.appendChild(checkboxLabel);
                questionElement.appendChild(document.createElement('br'));
            });
        } else if (question.type === 'dropdown') {
            const select = document.createElement('select');
            select.name = `q${i}`;
            question.options.forEach(option => {
                const selectOption = document.createElement('option');
                selectOption.value = option;
                selectOption.textContent = option;
                selectOption.selected = userAnswers[`q${i}`] === option;
                select.appendChild(selectOption);
            });
            select.addEventListener('change', saveAnswer);
            questionElement.appendChild(select);
        }

        questionContainer.appendChild(questionElement);
    }

    document.getElementById('prev-button').disabled = currentPage === 0;
    document.getElementById('next-button').disabled = end >= questions.length;

    if (end >= questions.length) {
        document.getElementById('next-button').style.display = 'none';
        document.getElementById('submit-button').style.display = 'inline';
    } else {
        document.getElementById('next-button').style.display = 'inline';
        document.getElementById('submit-button').style.display = 'none';
    }
}

function nextPage() {
    currentPage++;
    displayPage();
}

function prevPage() {
    currentPage--;
    displayPage();
}

function saveAnswer(event) {
    const name = event.target.name;
    const type = event.target.type;

    if (type === 'checkbox') {
        if (!userAnswers[name]) {
            userAnswers[name] = [];
        }

        if (event.target.checked) {
            userAnswers[name].push(event.target.value);
        } else {
            userAnswers[name] = userAnswers[name].filter(val => val !== event.target.value);
        }
    } else {
        userAnswers[name] = event.target.value;
    }
}

function submitQuiz() {
    clearInterval(timer);

    let score = 0;
    let answeredQuestions = 0;

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[`q${index}`];
        if (userAnswer !== undefined) {
            answeredQuestions++;
            if (question.type === 'text' || question.type === 'dropdown') {
                if (userAnswer.toLowerCase() === question.answer.toLowerCase()) {
                    score++;
                }
            } else if (question.type === 'radio') {
                if (userAnswer === question.answer) {
                    score++;
                }
            } else if (question.type === 'checkbox') {
                if (JSON.stringify(userAnswer.sort()) === JSON.stringify(question.answer.sort())) {
                    score++;
                }
            }
        }
    });

    const timeTaken = 180 - timeRemaining;
    alert(`Your score is ${score} out of ${answeredQuestions}.\nTime taken: ${Math.floor(timeTaken / 60)} minutes and ${timeTaken % 60} seconds.`);
    window.location.reload();
}
