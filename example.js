// ----------------------
// Setup
// ----------------------

// Load the Gif
var sup1 = new SuperGif({ gif: document.getElementById('exampleimg') } );
sup1.load(function(){
	setup_blinks_and_eyebrows(sup1)
});


var instructions = document.getElementById('instructions');

// ----------------------
// Text to speech GUI
// ----------------------

// Code for the voice select element
var voiceSelecter = document.getElementById('voiceSelecter');
function getVoices() {
	voiceSelecter.innerHTML = "";
	var voices = speechSynthesis.getVoices();
	// iOS returns voices it doesn't let you use.
	var bIsiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	var iOSVoiceSet = {};
	if( bIsiOS ){ 
		var array = ["Maged","Zuzana","Sara","Anna","Melina","Karen","Serena","Moira","Tessa","Samantha","Monica","Paulina","Satu","Amelie","Thomas","Carmit","Lekha","Mariska","Damayanti","Alice","Kyoko","Yuna","Ellen","Xander","Nora","Zosia","Luciana","Joana","Ioana","Milena","Laura","Alva","Kanya","Yelda","Ting-Ting","Sin-Ji","Mei-Jia"];
		array.forEach(function(val){
			iOSVoiceSet[val] = true;
		});
	}
	voices.forEach(function(voice, i) {
		// only some iOS voices are working, but they are all returned.
		if( !bIsiOS || voice.name in iOSVoiceSet ){
			var option = document.createElement('option');
			option.value = voice.name;
			option.innerHTML = voice.name;
			if( voice.lang.substring(0,2) == "en" ){
				voiceSelecter.insertBefore(option, voiceSelecter.firstChild);
			}	else {
				voiceSelecter.appendChild(option);
			}
		}
	});
}
getVoices();
// Update the voices when they change (chrome loads asynchronously)
window.speechSynthesis.onvoiceschanged = function(e) {
  getVoices();
};


// ----------------------
// Load new GIFs
// ----------------------

var setup_blinks_and_eyebrows = function(superGifObject){
	// This is an example of how to loop blink and eyebrow animations
    var blink = superGifObject.get_talkr_ext('0');
    var eyebrows = superGifObject.get_talkr_ext('1');
    if( blink && blink.controller){
    	blink.controller.construct_default_anim(50, 3000, 8000);   // loop blinks every 3-11 seconds (3000ms + randomly up to 8000ms additional)
    	blink.controller.play();  
    }
    if( eyebrows && eyebrows.controller && eyebrows.index && eyebrows.numframes){
    	// instead of looping the eyebrows, we'll trigger them manually when speaking.

    	// Construct a default eyebrow animation with 100ms between each frame and no looping
    	// eyebrows.controller.construct_default_anim(100, null, null );  // null passed for loop arguments so there is no looping..  

    	// For illustration, here is a custom animation.  The brackets represent frames.  [frame_index, frame_duration_ms]
    	// You can get the frames using eyebrows.index and eyebrows.numframes.
    	// eyebrows.index is the first frame of the eyebrow anim (25)
    	// eyebrows.numframes = 4.  (25,26,27,28 all contain valid eyebrow frames and can be used in the animation)
    	// The last frame index is -1, meaning that the eyebrow canvas will be empty, showing the default eyebrows.
    	// The last duration is meaningless unless we turn on looping, which we aren't going to do for eyebrows.
    	var custom_anim = [[25,100],[26,100],[27,150],[28,400],[27,150],[26,100],[25,100],[-1,0]]

    	// set the current animation to our custom one.
    	eyebrows.controller.anim = custom_anim;

    	// update the default animation.  The default is automatically queued up after the current animation finishes.
    	eyebrows.controller.update_default_anim(custom_anim, null, null); // null passed for loop args

    	// Here is a more complex example of the system:
    	// Lets say you wanted to raise the eyebrows up, hold them there until the next time "play" is called
    	// then bring them down, and revert to the default animation. 
    	// 
    	// var leave_eyebrows_up = [[25,100],[26,100],[27,200],[28,100]]
    	// eyebrows.controller.anim = leave_eyebrows_up;
    	// var bring_eyebrows_down = [[27,200],[26,100],[25,100],[-1,100]]
    	// eyebrows.controller.play(function(){                                      //play takes on "onFinished" variable if you want to do a custom looping. 
    	//	    eyebrows.controller.anim = bring_eyebrows_down;
    	//  });
    }
}

// Randomly trigger an eyebrow raise at some point during speech.
var trigger_eyebrow_anim = function(superGifObject, duration){
	if( Math.random() > 0.65 ) {
		var eyebrows = superGifObject.get_talkr_ext('1');
		if( eyebrows && eyebrows.controller){

			setTimeout( eyebrows.controller.play, Math.random() * duration);
		}
	}
}
var gifurlinput = document.getElementById('gifurlinput')
function loadNewGif(){
		var gifURL = gifurlinput.value;
    	if (gifURL.toLowerCase().indexOf(".gif") == -1) {
    		document.getElementById('giferrormessage').innerHTML = "Specify a gif file.";
    		return;
    	}
        function doesFileExist(urlToFile, success) {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', urlToFile, true);
            xhr.onload = function(e) {
                if (xhr.status != "404") {
                    if (success) success(urlToFile);
                } else document.getElementById('giferrormessage').innerHTML = "That file was not found.";
            }
            xhr.onerror = function() {
                document.getElementById('giferrormessage').innerHTML  = "Error loading gif. Make sure the resource exists and has Access-Control-Allow-Origin headers.";
            };
            xhr.send();
        };

        function onFileExists() {
        	var imagecontainer = document.getElementById('imagecontainer')
        	imagecontainer.innerHTML = "";
            imgElement = document.createElement('img');
            imgElement.src = gifURL;
            imgElement.animatedSrc = gifURL;
            imgElement.setAttribute('rel:animated_src',gifURL);
            imgElement.setAttribute('rel:auto_play', 0);
            imagecontainer.appendChild(imgElement);
            instructions.innerHTML = "Please wait..."
            sup1 = new SuperGif({ gif: imgElement });
            sup1.load(function(){
            	instructions.innerHTML = "Click on the image below to hear the message."
            	setup_blinks_and_eyebrows(sup1);
            });
            document.getElementById('giferrormessage').innerHTML = "";
        }
        doesFileExist(gifURL, onFileExists)
}
gifurlinput.addEventListener('input', loadNewGif) 

var imgurgifs = ["https://i.imgur.com/nIYJ3hf.gif", // lily
    "https://i.imgur.com/GTlEMHn.gif", // dog2
    "https://i.imgur.com/S740Je4.gif", // brunette
    "https://i.imgur.com/LfxwrCM.gif", // trump
    "https://i.imgur.com/JhrwKQb.gif", // bear
    "https://i.imgur.com/sgE5CCo.gif", //guerilla
    "https://i.imgur.com/DWKjljE.gif", // washington     
    "https://i.imgur.com/kIrODoK.gif", // kiera
    "https://i.imgur.com/3LgL03O.gif", // dog1                   
    "https://i.imgur.com/YH5W9pN.gif", //taylor
    "https://i.imgur.com/Evu5uVy.gif", // beiber
    "https://i.imgur.com/GXkh6d4.gif", // portman
    "https://i.imgur.com/bRNJlO9.gif", // white walker
]
var imgurgifindex = 0;
document.getElementById("newgifbutton").addEventListener("click", function(){
    imgurgifindex += 1;
    imgurgifindex = imgurgifindex % imgurgifs.length;
    gifurlinput.value = imgurgifs[imgurgifindex];  
    loadNewGif();
})

// ---------------------
// Playing TTS in sync
// ---------------------

// play the specified text 
function playsyncronized(){


	if(!'speechSynthesis' in window){
		instructions.innerHTML = "Speech synthesis is not supported in this browser.  Sorry.";
		document.getElementById('ttsoptions').style.visibility = "hidden";
	}
	else {
		document.getElementById('ttsoptions').style.visibility = "visible";
		if(speechSynthesis.speaking){
			return;
		}
		var text = document.getElementById('texttospeakinput').value;
		// get the selected voice
		var voice = speechSynthesis.getVoices().filter(function(voice){
				return voice.name == voiceSelecter.value;
			})[0];

	    // Splitting each utterance up using punctuation is important.  Intra-utterance
	    // punctuation will add silence to the tts which looks bad unless the mouth stops moving
	    // correctly. Better to split it into separate utterances so play_for_duration will move when
	    // talking, and be on frame 0 when not. 

	    // split everything betwen deliminators [.?,!], but include the deliminator.
	    var substrings = text.match(/[^.?,!]+[.?,!]?/g);
	    for (var i = 0, l = substrings.length; i < l; ++i) {
	        var str = substrings[i].trim();

	        // Make sure there is something to say other than the deliminator
	        var numpunc = (str.match(/[.?,!]/g) || []).length;
	        if (str.length - numpunc > 0) {

	        	// suprisingly decent approximation for multiple languages.

	       		// if you change the rate, you would have to adjust
	            var speakingDurationEstimate = str.length * 50;
	            // Chinese needs a different calculation.  Haven't tried other Asian languages.
	            if (str.match(/[\u3400-\u9FBF]/)) {
	                speakingDurationEstimate = str.length * 200;
	            }

	            var msg = new SpeechSynthesisUtterance();

	            (function(dur){
                	msg.addEventListener('start', function(){
                		sup1.play_for_duration(dur);
                		trigger_eyebrow_anim(sup1, dur);
	                })
                })(speakingDurationEstimate);

	            // The end event is too inacurate to use for animation,
	            // but perhaps it could be used elsewhere.  You might need to push 
	            // the msg to an array or aggressive garbage collection fill prevent the callback
	            // from firing.
	            //msg.addEventListener('end', function (){console.log("too late")}			                
	            
	            msg.text = str;
	            //change voice here
	            msg.voice = voice;

	            window.speechSynthesis.speak(msg);
	        }
	    }
	}
}
document.addEventListener("keypress", function(e) {
    if (e.which == 13) {
        playsyncronized();
    }
});