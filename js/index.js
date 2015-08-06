//This code is neded for Phonegap to work
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {

        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');

    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }

};


//AdListeners: These functions respond to AdEvents
document.addEventListener('onAdLoaded', function (data) {
    interstitialIsReady = true;
});
document.addEventListener('onAdFailLoad', function (data) {
    console.log(data.error + ',' + data.reason);
    if (data.adType == 'banner') AdMob.hideBanner();
    else if (data.adType == 'interstitial') interstitialIsReady = false;
});



/* static variables */
var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '*'];
var storage = window.localStorage;
var stats = {};
stats.score = 1000; //default values on load
stats.streak = 0; //unused currently, could keep track of right questions in order at a later time.
var pos = 0; //cursor position
var lettersUsed = 0; //global variable reset each time, dictating how many letters can still be used when wordCOntains is called.
var questionPos = 0; //determines whichquestion the user is currently viewing.
var word = []; //represents the correct word
var shown = []; //represents the word the player can see, as well as their guess.
var maxLetters = 7; // maximum amount of letters to pick from
var lastDate = new Date(); //last time and date a question was answered correctly
var interstitialIsReady = false; //Global variable, representing weather or not an advertisement is ready to be played.
var minutesTillNextFunds = 60; //time until you can recieve your next free points.
var changing = false; //global variable denoting weather or not the question is currently switching between questions. This is used in timing when events happen.
var primaryColor = 'blue';
var accentColor = 'deep-orange';
var toastRunning = false; //global variable denoting weather or not a toast message is currently on the screen. this is used so the screen does not overflow with toast messages.


/* Functions */



//findLetter(i) takes a letter, i, and returns a number.
//returns the corrisponding number in alphabet where the given letter is located;
function findLetter(j) {
    for (var i = 0; i < alphabet.length; i++) {
        if (alphabet[i] == j) {
            return i;
        }
    }
}


//changes the location of the cursor. Used in click events.
function setPos(j) {
    pos = j;
    update();


}

//takes a letter. determines if that letter is in the current word
function inWord(g) {
    var contains = false;
    for (var i = 0; i < word.length; i++) {
        contains = contains || (word[i] == g);
    }
    return contains;
}

//takes a letter, and returns a boolean.
//Function that takes a letter and determines if that letter should be in the set of letters to pick form.
function wordContains(g) {
    //shouldUse:arbitrary function that returns a boolean, indicating if the letter should be used for the word as a decoy, when the letter is not actually in the word.
    function shouldUse() {
        var show = data[questionPos]["show_number"];
        var toTake = (questionPos % 4) + 1;
        return ((parseInt(show.charCodeAt(toTake)) % g) >= (g / 3));
    }
    var contains = inWord(g);
    if (!contains && shouldUse() && (lettersUsed < (maxLetters - word.length)) && g != 26) {
        lettersUsed++;
        contains = true;
    }
    return contains;

}

//switches the cursors position letter with the letter the player selects.
function change(g) {
    if (!changing || g == 26) {
        document.getElementById('score').innerHTML = g;
        shown[pos] = alphabet[g];
        pos++;
        isFinished();

        //replace shown word with guessed word.
        update();
        document.getElementById('score').innerHTML = stats.score;
    }


}


//replaces the contents of 'answer' with the new contents.
function update() {
    var buffer = '<div class="col s2  center-align">&nbsp;</div>';
    var returning = buffer;
    for (var i = 0; i < shown.length; i++) {
        returning += '<span id="shown-letter-' + i + '" class=" flow-text col s2 btn ';
        if (pos == i) {
            returning += accentColor + ' z-depth-3 "';
        } else {
            returning += primaryColor + '"';
        }
        returning += ' onclick=setPos(' + i + ')' + '>' + shown[i] + '</span>';


    }
    document.getElementById('answer').innerHTML = returning + buffer;

}

//returns how many minutes have passed sense the last answered question.
function minutesfromStart() {
    var today = new Date();
    return parseInt((today - lastDate) / (minutesTillNextFunds * 1000));

}

//displays toast, one at a time;
function toast(message) {
    if (!message) {
        message = 'Relax! More points in ' + (minutesTillNextFunds - minutesfromStart()) + ' minutes.';
    }
    var toastLength = 3000;
    if (!toastRunning) {
        toastRunning = true;
        setTimeout(function () {
            toastRunning = false;

        }, toastLength + 300);

        Materialize.toast(message, toastLength, accentColor + ' flow-text');
    }
}
//displays an Ad, if an ad is available.
function runAd() {
    if (window.AdMob) {
        AdMob.showInterstitial();
        interstitialIsReady = false;
        stats.score += 75;
        hint();
        AdMob.prepareInterstitial({
            adId: admobid.interstitial,

            autoShow: false
        });
    } else {
        toast();

    }
}

//decreases the score, if it is possible to decrease the score. returns a boolean, indicating success or failure. this could be optimised.
function decScore() {
    var toDec = 25;
    if (stats.score >= toDec) {
        stats.score = parseInt(stats.score - toDec);
        document.getElementById('score').innerHTML = stats.score;
        return true;
    } else {
        return false;
    }

}



//gives the player the next letter they need, if the score can be decreased.
function hint() {
    if (!changing) {
        if (decScore()) {
            var done = false;

            for (var i = 0; i < 4; i++) {
                if ((alphabet[word[i]] != shown[i]) && (!done)) {
                    pos = i;
                    change(word[i]);
                    done = true;
                }
            }
        } else if (interstitialIsReady) {
            runAd();
        } else {
            morePoints();

        }
    }
}


//takes no arguements, and determines if the current eneterd question is correct.
function isFinished() {

    var equals = true;

    for (var i = 0; i < word.length; i++) { //checks each letter in word, to see if it is equal to shown.
        equals = equals && (word[i] == findLetter(shown[i]));

    }
    if (equals) { //when the two are equal, the question is changed.
        changing = true;

        var w = document.getElementById('wrapper'); //contents of the card, this is what moves.
        var c = document.getElementById('topBox'); //card itself.
        var h = document.getElementById('hint');
        w.className = 'animated bounceOutRight row';
        c.className = 'col s10 card ' + primaryColor;

        stats.score += 5;
        stats.streak++;
        setTimeout(function () {

            next();
            w.className = 'animated bounceInLeft row';
            h.className = 'hidden';
            setTimeout(function () {
                h.className = ' btn right center-align animated zoomIn ' + accentColor;
            }, 1000);
            // zoom();
        }, 1000);

    }
    pos = pos % word.length; //rolls over question if it becomes longer than the word.
}

//adds points to the players score, if conditions are met.
function morePoints(points, msg) {
    if (!points) {
        points = 200;
    }
    if (minutesfromStart() >= minutesTillNextFunds && stats.score < (points * 2)) {
        stats.score += points;
        if (msg) {
            toast("(+ " + points + " points)");
        } else {
            toast("+ " + points + " points");
        }
        document.getElementById('score').innerHTML = stats.score;
        storage.setItem('lastUsed', new Date());
    } else if (!msg) {
        toast();
    } else {
        toast(msg);
    }

}


//changes the question to the next question.
function nextQuestion() {

    questionPos++;
    pos = 0;
    questionPos = questionPos % data.length;
    document.getElementById('clue').innerHTML = '<div  id="card-title" class="card-title">' + data[questionPos].category + '</div>' + '<p>' + data[questionPos].question + '</p>';


    var ans = data[questionPos].answer;
    //setting the answer to the JSON answer field.
    for (var i = 0; i < ans.length; i++) {
        word[i] = findLetter(ans.charAt(i).toLowerCase());
    }
    //make all currently shown letters asterisk's.
    for (var j = 0; j < ans.length; j++) {
        shown[j] = '*';
        change(26);

    }

}



//sets the letters the player can see.
function setLetters() {
    
    var toreturn = "";
    var items = [];
    var unique = 0;
    var multiplicationFactor = 3;

    //generates all letters
    lettersUsed = 0;

    for (var i = 0; i < alphabet.length; i++) { //generating each list item.
        var contains = wordContains(i);
        if (contains) {
            if (inWord(i)) {
                unique++;
            }
            var thisObj = {};
            var returning = '<li class="letter" ';

            returning += 'onclick="change(' + i + ')" ';
            returning += 'id=li-' + i +' ">' + alphabet[i] + '</li>';
            thisObj.id = i;
            thisObj.htmlValue = returning;
            thisObj.isUsed = false;
            items.push(thisObj);
            console.log('letter ' + alphabet[i] + ' added with html value of ' + thisObj.htmlValue);
        }

    }
    var order = [];
    if (unique < 4) {
        multiplicationFactor = 1;
    }
    for (var i = 0; i < items.length; i++) {
        var temp = (i * multiplicationFactor) % items.length;
        order.push(temp);

    }

    for (var i = 0; i < items.length; i++) {

        toreturn += items[order[i]].htmlValue;

    }

    document.getElementById('availableLetters').innerHTML = toreturn;

}


//controls what is seen. This is called once the question is guessed. Also shows ads given a condition
function next() {

    shown.splice(data[questionPos], Number.MAX_VALUE); //removes extra letters.
    word.splice(data[questionPos], Number.MAX_VALUE);
    var newQuestionNumber = questionPos - storage.getItem('starting_point');
    document.getElementById('logo-container').innerHTML = newQuestionNumber;
    nextQuestion();
    setLetters();

    //updates the variables
    storage.setItem('score', stats.score);
    storage.setItem('question', questionPos);
    storage.setItem('streak', stats.streak);
    lastDate = new Date();
    storage.setItem('lastUsed', lastDate);
    changing = false;


}


//loded when the page is loaded.
window.onload = function () {
    /*changeColors*/
    update();
    document.getElementById('bar').className = primaryColor + ' darken-1';
    document.getElementById('hint').className = accentColor + "  btn right center-align";
    document.getElementById('topBox').className = primaryColor + " col s10 card  z-depth-1 ";
    document.getElementById('box').className = primaryColor + " section white-text ";
    document.getElementById('slide-out').className='side-nav  full ' + primaryColor;



    //initial setting of the stored values.
    if (storage.score) {
        stats.score = parseInt(storage.getItem('score'));
    } else {
        storage.setItem('score', stats.score);
    }

    if (storage.question) {

        questionPos = storage.getItem('question') - 1;
        document.getElementById('logo-container').innerHTML = questionPos - storage.getItem('starting_point');
    } else {

        questionPos = Math.floor(Math.random() * data.length);
        storage.setItem('starting_point', questionPos);
        document.getElementById('logo-container').innerHTML = 0;

    }
    if (storage.lastUsed) {
        lastDate = new Date(Date.parse(storage.getItem("lastUsed")));
        morePoints(200, "Welcome Back!");
    }

    stats.streak = storage.getItem('streak');
    shown.splice(data[questionPos], Number.MAX_VALUE);
    word.splice(data[questionPos], Number.MAX_VALUE);

    nextQuestion();
    setLetters();


    storage.setItem('score', stats.score);
    storage.setItem('question', questionPos);
    storage.setItem('streak', stats.streak);
    initApp();

};
