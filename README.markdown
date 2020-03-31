
**Note: This project has been deprecated.  Please check out [smooth-talkr](https://smooth.talkrapp.com) for an example of an application that uses a superior APNG method [talkr-apng](https://github.com/talkr-app/talkr-apng). Loading times and memory usage are improved dramatically with APNG, the implementation uses only a single canvas, and PNG files fully support transpacency.**

# Overview

Forked from the excelent [libgif-js project](https://github.com/buzzfeed/libgif-js), which is a general-purpose gif parsing and playback framework. 

This is an attempt to animate a GIF file in sync with the [SpeechSynthesis web API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).  The following tricks are used to improve results:

* The SpeechSynthesis start event is used to start the gif animation.

* speech duration is estimated using the length of the text to be spoken and passed to the the play_with_duration() function

* the gif "ping-pongs" while there is talking, and always starts and ends at frame 0.  (the direction of playback is reversed at the correct time such that playback ends at frame zero)  

* speech synthesis is broken up into punctuation-deliminated [.,?!] utterances, and each utterance is animated with its own call to play_with_duration.  Pauses in the utterances are then automatically aligned with periods of non-movement in the GIF file.

# GIF Selection

Here are some tips for selecting an optimal GIF file (in rough order of importance)

* The GIF should feature something talking (obviously)

* Frame 0 should have the mouth closed

* The mouth should open relatively quickly in the early frames

* For several frames after the initial opening, avoid frames that completely close the mouth.  This can result in an overly flappy mouth.

* Avoid large gestures or movements in the early frames which will be repeated very frequently.

* More than a second or two of animation is overkill, the early frames are more important that what comes later.


# TALKRAPP Gif App Extension

A new GIF app extension was created to specify animation channels that could be layered on top of the lipsync animation. The app extension is similar to the popular NETSCAPE looping extension.  The extension does not alter how the GIF is played back in browsers where there is no support for it.

## Eyebrows and Blinks
The app extension is used to determine which frames (if any) should be used to create eyebrow and blink animations.  These are not looped as part of the normal animation, and instead are layered on top at random intervals.  This can bring movement to the upper part of the face with out making the gif overly repetitive or predictable.

The Premium version ($2.99) of the iOS app Talkr (www.talkrapp.com) supports outputing .GIF files with this extension, but a selection of examples is available from [imgur](http://imgur.com/a/NRZVQ) .  You can find some regular gif files without the TALKRAPP extension [here](http://imgur.com/a/qgptp).

## Extension Definition
```
    +---------------+
 0  |     0x21      |  Extension Label
    +---------------+
 1  |     0xFF      |  Application Extension Label
    +---------------+
 2  |     0x0B      |  Block Size
    +---------------+
 3  |               | 
    +-             -+
 4  |               | 
    +-             -+
 5  |               | 
    +-             -+
 6  |               | 
    +-  TALKRAPP   -+  Application Identifier (8 bytes)
 7  |               | 
    +-             -+
 8  |               | 
    +-             -+
 9  |               | 
    +-             -+
10  |               | 
    +---------------+
11  |               | 
    +-             -+
12  |      COM      |  Application Authentication Code (3 bytes)
    +-             -+
13  |               | 
    +===============+                      --+
14  |     0x03      |  Sub-block Data Size   |
    +---------------+                        |
15  |               |                        |
    +- FRAME INDEX -+                        | 
16  |               |                        |
    +---------------+                        |
17  |               | Application Data Sub-block
    +- NUM  FRAMES -+                        |
18  |               |                        |  
    +---------------+                        |							
19  |  CHANNEL IDX  | ('0'=Blink,'1'=Eyebrow)|
    +---------------+                        | 
20  |               |                        | 
    +-             -+                        |
21  |               |                        | 
    +-  RESERVED   -+                        |
22  |               |                        | 
    +-             -+                        |
23  |               |                        | 
    +===============+                      --+
24  |     0x00      |  Block Terminator
    +---------------+
```

# Example

Please see example.html for, you know, an example. It allows you to change the voice and text and watch it talk on various GIFs.

Please note: this example must be loaded via a webserver, not directly from disk. I.e. http://localhost/libgif-js/example.html NOT file:///libgif-js/example.html. See the same-domain origin caveat at the bottom of this document for more information.

For a hosted example, check out this post on [talkrapp.com](http://www.talkrapp.com/gifdemo/example.html)


# Technical Details

Of note to the developer, libjs.gif contains a class SuperGif, which can be used to manipulate animated gifs. For more information on how to use the SuperGif class, check out the original [libgif project](https://github.com/buzzfeed/libgif-js).

# Performance

Prior to playing, the frames of the GIF file must be extracted and stored in memory.  This can take several seconds on a slow device and consume around 10 MB of memory for GIF files exported from talkr which have a width of 480 pixels.  Non-talkr GIF files may consume significantly more memory depending on the number of frames and pixels, and the cropping of the frames (talkr GIF files are optimized and aggressivly cropped to keep memory use low).  In a real-world implementation, you will want to pre-load your GIF file before it talks, and avoid storing too many GIF files in memory simultaneously.  You **must** call the destroy method on the SuperGif object to free the memory when you are finished.

## Caveat: same-domain origin

The gif has to be on the same domain (and port and protocol) as the page you're loading.

The library works by parsing gif image data in js, extracting individual frames, and rendering them on a canvas element. There is no way to get the raw image data from a normal image load, so this library does an XHR request for the image and forces the MIME-type to "text/plain". Consequently, using this library is subject to all the same cross-domain restrictions as any other XHR request.
