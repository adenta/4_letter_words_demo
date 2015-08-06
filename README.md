four_letter_words
=================

Four letter words is a game where the proceeds are donated to the Nepal relief effort.

backlog
=========
* ~~add the ability to store typed letters even after the application is closed.~~
* intigrate Google Analytics for potential Cohort analysis
* ~~melt steel beams with Jet fuel.~~
* bug: when you type successive charecters when the word is already correct, questions are skipped. 
  *steps to repeat
    1. type a word incorrectly for the first letter (eg:if the answer is 'fire' type 'xire')
    2. retype the word correctly,(eg: 'fire');
    3. notice that questions are now skipped through.
* generate better questions
  * We need between 1000 and 2000 questions for the first version of the game.
  * Questions should have answers that are 4 letters long.
  * answers must only contain letters, no symbols or numbers.
  * each json element must have:
    * a question
	* an answer
	* a dificulty value (this could easily be derived by using the questions point value
	* a category 
  * questions cannot contain the phrase 'seen here'.
* bug: currently, if an ad can be fetched, nothing happens and no toast is displayed.
* decide on more plesant message for needing to have advertisements.
* bug: only four letters appear when question number gets high.
  * feature: revise algorithm for figuring out what letters to show?
* fix sidebar
  * sidebar will currently not work on older devices.
* Animate.css transitions look choppy on mobile. THis should be fixed. is it because of the drop-shadow?
* integrate a tutorial to show how app works.
* the word 'hint' looks weird on small screens.


  
