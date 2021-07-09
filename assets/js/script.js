// Global variables for HTML elements
// Header elements
let viewHighscoresEl = document.getElementById("view-highscores");
let timerEl = document.querySelector(".timer");
let timeRemainingEl = document.querySelector(".timer span");
// Introduction section elements
let introductionSectionEl = document.querySelector(".introduction");
let startQuizButton = document.getElementById("start-quiz");
// Question section elements
let questionSectionEl = document.querySelector(".question");
let questionTitleEl = document.getElementById("question-title");
let answerButtons = document.querySelectorAll(".question button");
let questionResultEl = document.querySelector(".question-result");
let resultEl = document.getElementById("result");
// Results section elements
let resultsSectionEl = document.querySelector(".results");
let initialsFormEl = document.getElementById("initials-form");
let initialsInputEl = document.getElementById("initials");
// Highscores section elements
let highscoresSectionEl = document.querySelector(".highscores");
let highscoresListEl = document.getElementById("highscores");
let goBackButton = document.getElementById("go-back");
let clearHighscoresButton = document.getElementById("clear-highscores");

// Constants
const quizTime = 100;
const highscoresStorageKey = "coding-quiz-highscores";
const applicationStates = {
    INTRO: "introduction",
    QUESTION: "question",
    RESULT: "result",
    HIGHSCORES: "highscore"
};

// Miscellaneous variables
let applicationState = {
    stateVal: applicationStates.INTRO,
    get state() {
        return this.stateVal;
    },
    set state(val) {
        this.stateVal = val;
        handleApplicationState();
    }
}

let timeRemaining, quizTimerInterval, question, questionAnswerTimer;
let questions = [];
let highscores = [];

// Set an element's display to 'flex' so that it renders on the page.
let show = function (element) {
    //element.classList.add("is-display");
    element.style.display = "flex";
}

// Set an element's display to 'block' so that it renders on the page.
let showBlock = function (element) {
    //element.classList.add("is-display-block");
    element.style.display = "block";
}

// Set an element's display to 'none' so that it is not rendered on the page.
let hide = function (element) {
    //element.classList.remove("is-display");
    element.style.display = "none";
}

// Initialize the application data on page load.
initialize();

function initialize() {
    // Load highscores
    loadHighscoresFromStorage();
    applicationState.state = applicationStates.INTRO;
}

// Construct the list of questions to be presented to the user.
function initializeQuestions() {
    questions = [
        {
            Question: "An HTML document can contain:",
            Answers: ["Attributes", "Tags", "Plain text", "All of these"],
            CorrectAnswer: 4
        }, {
            Question: "CSS is an acronym for _____.",
            Answers: ["Cascading Style Sheet", "Costume Style Sheet", "Cascading System Style", "None of the above"],
            CorrectAnswer: 1
        }, {
            Question: "Which HTML tag is used to list items with bullets?",
            Answers: ["<bullet>...</bullet>", "<list>...</list>", "<ul>...</ul>", "<ol>...</ol>"],
            CorrectAnswer: 3
        }, {
            Question: "Which of the following tags are related to Table in HTML?",
            Answers: ["<table><row><column>", "<table><tr><td>", "<table><head><body>", "<table><header><footer>"],
            CorrectAnswer: 2
        }, {
            Question: "The DIV element is a _____.",
            Answers: ["block-level element", "high-level element", "low-level element", "mid-level element"],
            CorrectAnswer: 1
        }, {
            Question: "What is the correct syntax for referring to an external Javascript file called \"abc.js\"?",
            Answers: ["<script href=\"abc.js\">", "<script name=\"abc.js\">", "<script src=\"abc.js\">", "None of the above"],
            CorrectAnswer: 3
        }, {
            Question: "Which operator can be used to concatenate two strings and assign the result the first operand?",
            Answers: ["&", "+=", "+", "&&"],
            CorrectAnswer: 2
        }, {
            Question: "Which event is generated when data changes in a control, such as a text field?",
            Answers: ["onchange", "onwrite", "changetext", "None of the above"],
            CorrectAnswer: 1
        }, {
            Question: "The property in CSS used to change the background color of an element is _____.",
            Answers: ["bgcolor", "color", "background-color", "All of the above"],
            CorrectAnswer: 3
        }, {
            Question: "Which of the following is the correct syntax for referring to an external style sheet?",
            Answers: ["<style src=example.css>", "<style src=\"example.css\">", "<stylesheet> example.css </stylesheet>", "<link rel=\"stylesheet\" type=\"text/css\" href=\"example.css\">"],
            CorrectAnswer: 4
        }
    ];
}

// This method is called whenever the applicationState changes and updates the display.
function handleApplicationState() {
    switch (applicationState.state) {
        case applicationStates.INTRO:
            // (Re)initialize the set of quiz questions.
            initializeQuestions();
            viewHighscoresEl.style.visibility = "visible";
            timerEl.style.visibility = "visible";
            // Make sure we're only showing the introduction section.
            show(introductionSectionEl);
            hide(questionSectionEl);
            hide(questionResultEl);
            hide(resultsSectionEl);
            hide(highscoresSectionEl);
            break;
        case applicationStates.QUESTION:
            // Make sure we're only showing the question section.
            viewHighscoresEl.style.visibility = "hidden";
            hide(introductionSectionEl);
            show(questionSectionEl);
            hide(questionResultEl);
            hide(resultsSectionEl);
            hide(highscoresSectionEl);
            break;
        case applicationStates.RESULT:
            // Make sure we're only showing the results section.
            viewHighscoresEl.style.visibility = "hidden";
            hide(introductionSectionEl);
            hide(questionSectionEl);
            //hide(questionResultEl);
            show(resultsSectionEl);
            hide(highscoresSectionEl);
            break;
        case applicationStates.HIGHSCORES:
            // Make sure we're only showing the highscores section.
            viewHighscoresEl.style.visibility = "hidden";
            timerEl.style.visibility = "hidden";
            populateHighscores();
            hide(introductionSectionEl);
            hide(questionSectionEl);
            hide(questionResultEl);
            hide(resultsSectionEl);
            show(highscoresSectionEl);
            break;
    }
}

// Retrieves any current highscores from local storage.
function loadHighscoresFromStorage() {
    // Retrieve the current highscores.
    highscores = JSON.parse(localStorage.getItem(highscoresStorageKey));

    // If there are highscores stored, start with those.
    if (highscores === null) {
        highscores = [];
    }
}

// Starts a new quiz.
function startQuiz() {
    // Choose and populate a question to be answered.
    getNextQuestion();
    // Show the question and hide anything else.
    applicationState.state = applicationStates.QUESTION;
    // Start the quiz timer.
    startQuizTimer();
}

// Updates the question elements with the question data.
function getNextQuestion() {
    // Check to see if we have any questions left.
    if (questions.length > 0) {
        // Pull the next question (randomly) from the array of available questions.
        question = questions.splice(Math.floor(Math.random() * questions.length), 1)[0];
        // Assign the question.
        questionTitleEl.textContent = question.Question;
        // Assign the answers to their respective buttons.
        for (let index = 0; index < answerButtons.length; index++) {
            const answerButton = answerButtons[index];
            answerButton.textContent = `${index + 1}. ${question.Answers[index]}`;
        }
    }
    else {
        // If we have no questions left, the quiz is complete. Show the results.
        gameOver();
    }
}

// Starts the quiz timer
function startQuizTimer() {
    timeRemaining = quizTime;
    timeRemainingEl.textContent = timeRemaining;

    // Sets interval in variable
    quizTimerInterval = setInterval(function () {
        decrementTimer(1);

        if (timeRemaining === 0) {
            // Calls function to present the user's score.
            gameOver();
        }
    }, 1000);
}

// Updates the timer by the specified decrement amount, limiting to 0.
function decrementTimer(timeToDecrement) {
    timeRemaining = Math.max(timeRemaining - timeToDecrement, 0);
    timeRemainingEl.textContent = timeRemaining;
}

// Display the results of the current game to the user. Give them the option to record their initials with their score.
function gameOver() {
    // Stops execution of the timer
    clearInterval(quizTimerInterval);
    // Set the user's score.
    let scoreEl = document.getElementById("score");
    scoreEl.textContent = timeRemaining;
    // Show the results section and hide anything else.
    applicationState.state = applicationStates.RESULT;
}

// Persists the user's highscore into local storage.
function recordHighscore(initials) {
    // Retrieve the current highscores from storage.
    loadHighscoresFromStorage();
    // Add the new highscore to the list.
    highscores.push({ "initials": initials, "score": timeRemaining });
    // Sort the list by score descending, so that the highest score is on top.
    highscores.sort((a, b) => b.score - a.score);
    // Store the updated highscores
    localStorage.setItem(highscoresStorageKey, JSON.stringify(highscores));
}

// Creates a new list item for each highscore.
function populateHighscores() {
    // Clear the highscores list element.
    highscoresListEl.innerHTML = "";

    // Render a new list item for each highscore.
    for (var i = 0; i < highscores.length; i++) {
        const highscore = highscores[i];
        let li = document.createElement("li");
        li.textContent = `${i + 1}. ${highscore.initials} - ${highscore.score}`;
        highscoresListEl.appendChild(li);
    }
}

// Shows the question result and hides it after 1-second of being on screen.
function showQuestionResultOnTimer() {
    showBlock(questionResultEl);

    // Create a timer that will hide the question result after 1 second.
    questionAnswerTimer = setInterval(function () {
        // If the question result is currenlty displayed, hide it.
        if (getComputedStyle(questionResultEl).display === "block") {
            hide(questionResultEl);
        }
        // Stop this timer after 1 execution.
        clearInterval(questionAnswerTimer);
    }, 1000);
}

//#region Event Listeners

// Register the click event handler for the Start Quiz button.
startQuizButton.addEventListener("click", startQuiz);

// Registers a click event handler for the entire question element and listens for button clicks within that element.
questionSectionEl.addEventListener("click", function (event) {
    let target = event.target;

    // If an answer button was clicked, check to see if the user answered correctly.
    if (target.matches("button")) {
        let answerId = target.getAttribute("id");

        if (answerId.slice(answerId.length - 1) == question.CorrectAnswer) {
            resultEl.textContent = "Correct!";
        }
        else {
            decrementTimer(10);
            resultEl.textContent = "Incorrect";
        }

        // Clear out any previous timer to allow for a "fresh" 1-second timer.
        clearInterval(questionAnswerTimer);
        showQuestionResultOnTimer();

        // Get the next question.
        getNextQuestion();
    }
})

// Register a click event handler for the initials form and check for button clicks.
initialsFormEl.addEventListener("click", function (event) {
    let target = event.target;

    // If an answer button was clicked, check to see if the user answered correctly.
    if (target.matches("button")) {
        let buttonType = target.getAttribute("type");

        // Only record the highscore if the user clicked the Submit button, not the Skip button.
        if (buttonType == "submit") {
            // Prevent the default behavior for the Submit button.
            event.preventDefault();

            // If the user entered initials, record their highscore, reset the quiz information and display the current highscores.
            if (initialsInputEl.value !== "") {
                recordHighscore(initialsInputEl.value);
                initialsInputEl.value = "";
            }
            else {
                return;
            }
        }

        // Show the highscores section and hide anything else.
        applicationState.state = applicationStates.HIGHSCORES;
    }
});

// Click event listener for the Go Back button. Will return the user back to the introduction.
goBackButton.addEventListener("click", function () {
    applicationState.state = applicationStates.INTRO;
});

// Click event listener for the Clear Highscores button. Will remove all persisted highscores.
clearHighscoresButton.addEventListener("click", function () {
    // Clear the "local" highscores array.
    highscores = [];
    // Remove any highscores from local storage.
    localStorage.removeItem(highscoresStorageKey);
    // Set the application state to HIGHSCORES so that it refreshes the display, which should remove all highscores from the page.
    applicationState.state = applicationStates.HIGHSCORES;
});

// Click event listener for the View Highscores link. Will take the user directly to the highscores.
viewHighscoresEl.addEventListener("click", function () {
    applicationState.state = applicationStates.HIGHSCORES;
});

//#endregion