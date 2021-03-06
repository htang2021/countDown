// global variables
let score = 0;
let scoreList = [];
let highScoreList = [];
let time;
let timer;

// countdown timer
const decrement = function () {
    if (time > 0) {
        time = time - 1;
        $(".countdown-counter").empty().append(time);
    } else if (time <= 0) {
        endQuiz();
    }
};

// get the difficulty and category from the select inputs and make an API call
const getQuestions = function () {
    var difficulty = $("#difficulty").val()
    var questionCategory = $("#category").val()
    const apiVariable = `https://opentdb.com/api.php?amount=15&category=${questionCategory}&difficulty=${difficulty}`;
    fetch(apiVariable).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                let questionNumber = 0;
                time = 150;
                $(".countdown-counter").empty().append(time);
                timer = setInterval(decrement, 1000);
                showQuestions(data, questionNumber);
            })
        } else {
            $("#alert-modal").show();
        }
    });
};

// display and iterate through questions until all questions are answered or time runs out
const showQuestions = function (data, questionNumber) {
    if (questionNumber == data.results.length) {
        endQuiz();
        return;
    }
    $(".selections > form > button").prop("disabled", true);
    $(".selections > form > select").prop("disabled", true);
    $(".questions-container").empty().append(data.results[questionNumber].question);

    const answers = [];
    answers.push(data.results[questionNumber].correct_answer);
    for (let i = 0; i < data.results[questionNumber].incorrect_answers.length; i++) {
        answers.push(data.results[questionNumber].incorrect_answers[i]);
    }
    var item = []
    // randomize the answers for buttons
    while (answers.length > 0) {
        num = Math.floor(Math.random() * answers.length)
        item.push(answers[num]);
        answers.splice(num, 1);
    }
    // create answer buttons
    $(".answers-container").empty();
    for (let i = 0; i < item.length; i++) {
        const button = $("<button>").html(item[i]).click(function () {
            if (this.innerText === data.results[questionNumber].correct_answer) {
                $(".answers-container").empty().append("Correct!");
                score = score + 25;
            } else {
                $(".answers-container").empty().append("Wrong!");
            }
            setTimeout(function () {
                questionNumber = questionNumber + 1;
                showQuestions(data, questionNumber);
            }, 2000)

        })
        $(".answers-container").append(button);
    }
    
    // randomly show distraction gif
    diceroll =Math.floor(Math.random() * 3)
    if (diceroll == 2) {
        $('#distraction').empty();
        let gifSearch = "dancing"
        fetch(`https://api.giphy.com/v1/gifs/search?q=${gifSearch}&api_key=HvaacROi9w5oQCDYHSIk42eiDSIXH3FN`)
        .then(function (response) {
            return response.json();
        })

        .then(function (response) {
            let num2 = Math.floor(Math.random() * 50);
            var gifImg = document.createElement('img');
            gifImg.setAttribute('src', response.data[num2].images.fixed_height.url);
            $('#distraction').append(gifImg);
        });
    } else {
        $('#distraction').text("Whatever you do! Don't look here! Stay focused on the questions!");
    }

};
// call the times up or congratulations/high score modal
endQuiz = function () {
    clearInterval(timer);

    $(".selections > form > button").prop("disabled", false);
    $(".selections > form > select").prop("disabled", false);
    $(".questions-container").empty();
    $(".answers-container").empty();
    $("#distraction").empty();
    // calculate final score
    score = score + time;

    let gifSearch = "";

    if (time == 0) {
        $(".countdown-counter").empty().append("Time's Up!");
        gifSearch = "timesup"
    } else {
        gifSearch = "congratulations ";
        score = score + time;
        var modal = $("#score-modal");
        modal.show();
        $("#new-score").text(`Score: ${score}`);
    }
    
    fetch(`https://api.giphy.com/v1/gifs/search?q=${gifSearch}&api_key=HvaacROi9w5oQCDYHSIk42eiDSIXH3FN`)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            let num2 = Math.floor(Math.random() * 50);
            var gifImg = document.createElement('img');
            gifImg.setAttribute('src', response.data[num2].images.fixed_height.url);
            $('.questions-container').append(gifImg);
        });
};

// saves user initials and final score to high score array
const setHighScore = (initials) => {
    let highScore = {
        initials: initials.toUpperCase(),
        score: score
    };
    scoreList.push(highScore);
    writeToStorage();
    displayHighScore();
};

// display top - 5 high scores in 
const displayHighScore = function () {
    $("#high-scores").empty();

    scoreList.sort((a, b) => { return b.score - a.score; });

    for (let i = 0; i < scoreList.length && i < 5; i++) {
        $("#high-scores").append(`<li>${scoreList[i].initials}, score: ${scoreList[i].score}</li>`);
    }
};

// Write to localStorage ********************************
// Pass a full object array nameObjArry = [{initial: xyz, score: 123}, {initial: abc, score: 345}, .....]
var writeToStorage = function () {
    localStorage.setItem("scoreList", JSON.stringify(scoreList));
};

// Return what's stored in localStorage *******************************
var readFromStorage = function () {
    scoreList = JSON.parse(localStorage.getItem("scoreList"));
    if (scoreList) {
        displayHighScore();
    } else {
        scoreList = [];
    }
};

// -- start event listeners --
// start button click and begin game
$("#start").on("click", function () {
    event.preventDefault();
    $(".countdown-counter").empty();
    getQuestions();
});

// submit button on high score modal
$("#submit-btn").on("click", function () {
    event.preventDefault();
    var initials = $(".initial").val();
    if (initials.length != 3) {
        $("#new-score").text("Please enter 3 characters!");
        setTimeout(function(){
            $("#new-score").text(`Score: ${score}`);
        }, 1000);
        return;
    }
    $(".modal").hide();

    setHighScore(initials);
});

// close button on modals
$(".close").on("click", function() {
    $(".modal").hide();
});

// ok button on error modal
$("#alert-btn").on("click", function () {
    $("#alert-modal").hide();
});


// -- end event listeners --

// get high scores on page load
readFromStorage();
