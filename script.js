
const questionSets = {
    hr: [
        {
            q: "Tell me about yourself.",
            keywords: ["education", "skills", "project", "experience", "goal"]
        },
        {
            q: "What are your strengths and weaknesses?",
            keywords: ["strength", "improve", "learn", "example", "develop"]
        },
        {
            q: "Why should we hire you?",
            keywords: ["skills", "contribute", "learn", "team", "role"]
        },
        {
            q: "Where do you see yourself in five years?",
            keywords: ["career", "grow", "skills", "goals", "contribute"]
        },
        {
            q: "Why do you want to join our company?",
            keywords: ["company", "role", "skills", "learn", "contribute"]
        }
    ],

    technical: [
        {
            q: "What is the difference between an array and a linked list?",
            keywords: ["memory", "index", "insertion", "deletion", "nodes"]
        },
        {
            q: "What are the main principles of object-oriented programming?",
            keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"]
        },
        {
            q: "What is the difference between INNER JOIN and LEFT JOIN?",
            keywords: ["matching", "rows", "table", "unmatched", "null"]
        },
        {
            q: "What is the difference between a primary key and a foreign key?",
            keywords: ["unique", "identify", "reference", "table", "relationship"]
        },
        {
            q: "How would you debug a program that produces incorrect output?",
            keywords: ["reproduce", "debug", "test", "error", "logic"]
        }
    ],

    project: [
        {
            q: "Explain your project and the problem it solves.",
            keywords: ["problem", "solution", "features", "users", "purpose"]
        },
        {
            q: "Which technologies did you use and why?",
            keywords: ["technology", "frontend", "backend", "database", "reason"]
        },
        {
            q: "What was the biggest challenge in your project?",
            keywords: ["challenge", "problem", "solution", "approach", "learned"]
        },
        {
            q: "Explain your role and contribution to the project.",
            keywords: ["responsibility", "developed", "implemented", "team", "contribution"]
        },
        {
            q: "What improvements would you make to your project?",
            keywords: ["improve", "performance", "security", "features", "testing"]
        }
    ]
};

const $ = (id) => document.getElementById(id);

const setup = $("setup");
const interview = $("interview");
const results = $("results");
const category = $("category");
const question = $("question");
const answer = $("answer");
const timerDisplay = $("timer");
const progressText = $("progressText");
const progressBar = $("progressBar");
const feedback = $("feedback");
const submitBtn = $("submitBtn");
const nextBtn = $("nextBtn");

let questions = [];
let currentIndex = 0;
let secondsLeft = 60;
let timerId = null;
let scores = [];
let answered = false;

const categoryNames = {
    hr: "HR Interview",
    technical: "Technical Interview",
    project: "Project Interview"
};

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
    stopTimer();
    secondsLeft = 60;
    updateTimerDisplay();

    timerId = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();

        if (secondsLeft <= 0) {
            stopTimer();

            if (!answered) {
                evaluateAnswer(true);
            }
        }
    }, 1000);
}

function renderQuestion() {
    const item = questions[currentIndex];

    question.textContent = item.q;
    progressText.textContent =
        `Question ${currentIndex + 1} of ${questions.length}`;

    progressBar.style.width =
        `${((currentIndex + 1) / questions.length) * 100}%`;

    answer.value = "";
    feedback.hidden = true;
    feedback.replaceChildren();

    answered = false;
    submitBtn.hidden = false;
    submitBtn.disabled = false;
    nextBtn.hidden = true;

    startTimer();
}

function evaluateAnswer(timesUp = false) {
    if (answered) return;

    stopTimer();
    answered = true;

    const text = answer.value.trim();
    const words = text.match(/\b[\w'-]+\b/g) || [];
    const normalized = text.toLowerCase();

    const item = questions[currentIndex];

    const matchedKeywords = item.keywords.filter(keyword =>
        normalized.includes(keyword.toLowerCase())
    );

    // This is a simple rule-based estimate, not an AI evaluation.
    let score = 0;

    if (words.length >= 20) score += 4;
    else if (words.length >= 8) score += 2;
    else if (words.length > 0) score += 1;

    score += Math.min(6, matchedKeywords.length);

    scores.push(score);

    const suggestions = [];

    if (words.length < 8) {
        suggestions.push(
            "Expand your answer with a clear explanation and a specific example."
        );
    } else if (words.length < 20) {
        suggestions.push(
            "Add more relevant details to explain your thinking."
        );
    } else {
        suggestions.push(
            "Your answer has useful detail. Check that every point is relevant."
        );
    }

    if (matchedKeywords.length < 2) {
        suggestions.push(
            "Include concepts directly related to the question."
        );
    } else {
        suggestions.push(
            "You included relevant terms: " + matchedKeywords.join(", ") + "."
        );
    }

    if (category.value === "hr") {
        suggestions.push(
            "For HR questions, try using a real example and explaining what you learned."
        );
    } else if (category.value === "technical") {
        suggestions.push(
            "For technical questions, explain the concept, how it works, and an example."
        );
    } else {
        suggestions.push(
            "For project questions, describe your role, technology choices, and results."
        );
    }

    feedback.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent = timesUp
        ? "Time is up — answer reviewed"
        : "Your practice feedback";

    const scoreLine = document.createElement("p");
    scoreLine.textContent = `Practice indicator: ${score}/10`;

    const wordLine = document.createElement("p");
    wordLine.textContent =
        `Answer length: ${words.length} words.`;

    const list = document.createElement("ul");

    suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        list.appendChild(li);
    });

    feedback.append(heading, scoreLine, wordLine, list);
    feedback.hidden = false;

    submitBtn.hidden = true;
    nextBtn.hidden = false;
    nextBtn.textContent =
        currentIndex === questions.length - 1
            ? "View Results →"
            : "Next Question →";
}

function startInterview() {
    stopTimer();

    questions = questionSets[category.value];
    currentIndex = 0;
    scores = [];

    $("categoryLabel").textContent = categoryNames[category.value];

    setup.hidden = true;
    results.hidden = true;
    interview.hidden = false;

    renderQuestion();
}

function showResults() {
    stopTimer();

    interview.hidden = true;
    results.hidden = false;

    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length ? total / scores.length : 0;

    $("resultSummary").textContent =
        `You completed ${scores.length} of ${questions.length} questions. ` +
        `Your average practice indicator was ${average.toFixed(1)}/10.`;

    $("resultAdvice").textContent =
        average >= 7
            ? "Keep practicing and focus on accuracy, structure, and specific examples."
            : "Review your answers, add relevant details, and try another practice session.";

    $("progressBar").style.width = "100%";
}

function nextQuestion() {
    if (!answered) return;

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

$("startBtn").addEventListener("click", startInterview);

submitBtn.addEventListener("click", () => evaluateAnswer(false));

nextBtn.addEventListener("click", nextQuestion);

$("restartBtn").addEventListener("click", () => {
    stopTimer();

    interview.hidden = true;
    results.hidden = true;
    setup.hidden = false;

    progressBar.style.width = "0%";
    timerDisplay.textContent = "01:00";
});

window.addEventListener("beforeunload", stopTimer);
