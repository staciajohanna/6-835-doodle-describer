# Doodle Describer
Final project for MIT course 6.835 Intelligent Modal Interaction.

## Setup Instruction

## Table of Contents
- javascripts: folder that contains all the javascripts (JS) file used in the system.
  * 1-hand-tutorial.js: JS code for part 3 of the tutorial (using left hand on spacebar and right hand on leap).
  * 2-hands-tutorial.js: JS code for part 2 of the tutorial (using 2 hands on leap).
  * categories.js: all the drawing categories of the ML model.
  * cursor.js: Cursor object used for the leap cursor. (Adapted from MP3)
  * draw.js: JS code for the main doodle page.
  * helpers.js: contains helper functions for the speech synthesis. (Adapted from MP3)
  * setup.js: contains user interface setup for the leap and speech. (Adapted from MP3)
  * setupSpeech.js: speech recognition setup. (from MP3)
  * voice-tutorial.js: JS code for part 1 of the tutorial (using the voice command)
- lib: folder that contains all the libraries used in the system. Contains: backbone, d3, famous, jquery, leap, underscore.
- model: folder that contains the machine learning model used/tried for the system.
  * ensemble: model acquired from https://www.kaggle.com/ttagu99/ensemble-models-2epoch, then converted into TensorFlow.js format.
  * mobilenet: model acquired from https://www.kaggle.com/echomil/mobilenet-126x126x3-100k-per-class, then converted into TensorFlow.js format.
- root:
  * doodle.html: the main doodle page.
  * index.html: the landing page.
  * style.css: all the styling of the HTML page.
  * tutorial-1-voice.html: part 1 of tutorial (voice command).
  * tutorial-2-hands.html: part 2 of tutorial (2 hands with leap motion).
  * tutorial-3-hand-space.html: part 3 of tutorial (1 hand with leap, other hand with spacebar).
  * tutorial.html: tutorial landing page.
