setupSpeechInterface();
var processSpeech = function(transcript) {
    // Helper function to detect if any commands appear in a string
    var userSaid = function(pattern, commands) {
      console.log(pattern + " " + commands);
      if (commands.indexOf(pattern) > -1) return true;
      return false;
    };

    var processed = false;
    if (userSaid('submit', transcript)) {
        // Change square color
        let voiceSquare = document.getElementById("voice-tutorial");
        voiceSquare.style.backgroundColor = "green";

        processed = true;
    }

    return processed;
}