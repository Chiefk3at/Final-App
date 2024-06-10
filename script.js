document.addEventListener('DOMContentLoaded', async (event) => {
    const startButton = document.getElementById('start-btn');
    const nextButton = document.getElementById('next-btn');
    const signoutButton = document.getElementById('signout-btn');
    const questionContainerElement = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const signinContainer = document.getElementById('signin-container');
    const signinForm = document.getElementById('signin-form');
    const quizContainer = document.getElementById('quiz-container');
    const lifeCounterElement = document.getElementById('life-counter');
    const timerElement = document.getElementById('timer');
    const finalScoreContainer = document.getElementById('final-score-container');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-btn');
    const messageElement = document.createElement('div'); // Element to display message

    const SUPABASE_URL = "https://qgrmjdoeswhcrigeansg.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncm1qZG9lc3doY3JpZ2VhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgwNDQwMjUsImV4cCI6MjAzMzYyMDAyNX0.V0IPACerlt8XMLZa1ZdUtPBF0XvJ6v32Z9GWpJpV-yE";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let shuffledQuestions, currentQuestionIndex, score, lives, timer, timerInterval;
    let playerName = "keaton" // Variable to store player's name
    let gameEnded = false; // Variable to track if the game has ended

    const questions = [
        {
            question: "Which country has won the most FIFA World Cup titles?",
            answers: [
                { text: 'Brazil', correct: true },
                { text: 'Germany', correct: false },
                { text: 'Italy', correct: false },
                { text: 'Argentina', correct: false }
            ]
        },
        {
            question: "Who is considered the greatest basketball player of all time?",
            answers: [
                { text: 'Michael Jordan', correct: true },
                { text: 'LeBron James', correct: false },
                { text: 'Kobe Bryant', correct: false },
                { text: 'Magic Johnson', correct: false }
            ]
        },
        {
            question: "Which sport is known as the 'king of sports'?",
            answers: [
                { text: 'Soccer', correct: true },
                { text: 'Basketball', correct: false },
                { text: 'Cricket', correct: false },
                { text: 'Tennis', correct: false }
            ]
        },
        {
            question: "Which NFL team has won the most Super Bowls?",
            answers: [
                { text: 'Pittsburgh Steelers', correct: true },
                { text: 'New England Patriots', correct: true },
                { text: 'Dallas Cowboys', correct: false },
                { text: 'San Francisco 49ers', correct: false }
            ]
        },
        {
            question: "In which year did Roger Federer win his first Wimbledon title?",
            answers: [
                { text: '2003', correct: true },
                { text: '2004', correct: false },
                { text: '2002', correct: false },
                { text: '2001', correct: false }
            ]
        },
        {
            question: "Which country hosted the 2016 Summer Olympics?",
            answers: [
                { text: 'Brazil', correct: true },
                { text: 'China', correct: false },
                { text: 'United Kingdom', correct: false },
                { text: 'Russia', correct: false }
            ]
        },
        {
            question: "Who holds the record for the fastest 100m sprint?",
            answers: [
                { text: 'Usain Bolt', correct: true },
                { text: 'Tyson Gay', correct: false },
                { text: 'Yohan Blake', correct: false },
                { text: 'Asafa Powell', correct: false }
            ]
        },
        {
            question: "Which team won the 2020 NBA Championship?",
            answers: [
                { text: 'Los Angeles Lakers', correct: true },
                { text: 'Miami Heat', correct: false },
                { text: 'Toronto Raptors', correct: false },
                { text: 'Golden State Warriors', correct: false }
            ]
        },
        {
            question: "Who is the only tennis player to have won each Grand Slam tournament at least four times?",
            answers: [
                { text: 'Serena Williams', correct: true },
                { text: 'Steffi Graf', correct: false },
                { text: 'Martina Navratilova', correct: false },
                { text: 'Margaret Court', correct: false }
            ]
        },
        {
            question: "Which country won the inaugural Rugby World Cup in 1987?",
            answers: [
                { text: 'New Zealand', correct: true },
                { text: 'Australia', correct: false },
                { text: 'South Africa', correct: false },
                { text: 'England', correct: false }
            ]
        }
    ];

    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        playerName = document.getElementById('player-name').value; // Capture player's name

        // Validate email, password, and player name
        if (email && password && playerName) {
            signinContainer.classList.add('hide');
            quizContainer.classList.remove('hide');
        } else {
            alert('Please enter valid credentials and player name');
        }
    });

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        setNextQuestion();
    });
    signoutButton.addEventListener('click', signOut);
    restartButton.addEventListener('click', () => {
        finalScoreContainer.classList.add('hide');
        quizContainer.classList.remove('hide');
        startGame();
    });

    function startGame() {
        console.log("Game started");
        gameEnded = false; // Reset gameEnded flag
        startButton.classList.add('hide');
        signoutButton.classList.remove('hide');
        shuffledQuestions = questions.sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        lives = 3;
        updateLives();
        questionContainerElement.classList.remove('hide');
        setNextQuestion();
        startTimer();
    }

    function setNextQuestion() {
        resetState();
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    }

    function showQuestion(question) {
        console.log("Showing question:", question);
        questionElement.innerText = question.question;
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetState() {
        clearStatusClass(document.body);
        nextButton.classList.add('hide');
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        const correct = selectedButton.dataset.correct === "true";
        if (correct) {
            score++;
        } else {
            lives--;
            updateLives();
        }
        setStatusClass(selectedButton, correct);
        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true;
            setStatusClass(button, button.dataset.correct === "true");
        });
        if (lives === 0 || shuffledQuestions.length === currentQuestionIndex + 1) {
            if (!gameEnded) { // Ensure endGame is called only once
                endGame();
            }
        } else {
            nextButton.classList.remove('hide');
        }
    }

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }

    function updateLives() {
        const hearts = '❤️'.repeat(lives) + '❌'.repeat(3 - lives);
        lifeCounterElement.innerHTML = hearts;
        if (lives === 0 && !gameEnded) {
            endGame();
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timer = 60;
        timerElement.innerText = `Time: ${timer}`;
        timerInterval = setInterval(() => {
            timer--;
            timerElement.innerText = `Time: ${timer}`;
            if (timer <= 0 && !gameEnded) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    function signOut() {
        quizContainer.classList.add('hide');
        signinContainer.classList.remove('hide');
        startButton.classList.remove('hide');
        signoutButton.classList.add('hide');
        questionContainerElement.classList.add('hide');
        nextButton.classList.add('hide');
        clearInterval(timerInterval);
    }

    function endGame() {
        console.log('End game function called');
        clearInterval(timerInterval);

        console.log('Hiding quiz container');
        quizContainer.classList.add('hide');

        console.log('Showing final score container');
        finalScoreContainer.classList.remove('hide');

        console.log(`Final score: ${score} out of ${questions.length}`);
        finalScoreElement.innerText = `You answered ${score} out of ${questions.length} questions correctly.`;

        console.log('Saving score to database');
        saveScore(playerName, score); // Use the captured player's name

        console.log('Setting gameEnded to true');
        gameEnded = true;

        console.log('Displaying congratulatory message');
        messageElement.innerHTML = `<h2>Great Job, ${playerName}!</h2><p>You scored ${score} points.</p>`;
        messageElement.classList.add('message');
        finalScoreContainer.appendChild(messageElement);

        console.log('End game function completed');
        getHighScores()
    }

    async function saveScore(playerName, score) {
        console.log("Saving score:", playerName, score); // Add a log to see the data being sent
        const { data: existingScores, error } = await supabase
            .from('scores')
            .select('*')
            .eq('player_name', playerName);

        if (existingScores.length > 0) {
            // Username exists, update the score
            const existingScoreId = existingScores[0].id; // Assuming 'id' is the primary key
            const { data, error } = await supabase
                .from('scores')
                .update({ score: score })
                .eq('id', existingScoreId);
        } else {
            // Username does not exist, insert new score
            console.log("saveScore",playerName)
            const { data, error } = await supabase
                .from('scores')
                .insert([{ player_name: playerName, score: score }]);
        }
    }

    async function getHighScores() {
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .order("score",{ascending:false})
            .limit(5)

        if (error) {
            console.error('Error fetching scores:', error);
            alert('Failed to fetch scores. Please try again later.');
        } else {
            const scoreList = document.getElementById('score-list');
            scoreList.innerHTML = '';
            data.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.player_name}: ${score.score}`;
                scoreList.appendChild(li);
            });
        }  
    }
})