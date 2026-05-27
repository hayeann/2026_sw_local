const pianoKeys = [];

// 건반 생성 함수

function createPianoKeys(canvasWidth, canvasHeight){

    pianoKeys.length = 0;

    const whiteNotes = [

        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",

        "C5",
        "D5",
        "E5",
        "F5",
        "G5"

    ];

    const midiNumbers = [

        60,
        62,
        64,
        65,
        67,
        69,
        71,

        72,
        74,
        76,
        77,
        79
    ];

    const whiteKeyCount = whiteNotes.length;

    const whiteKeyWidth =
        canvasWidth / whiteKeyCount;

    const whiteKeyHeight = 220;

    // 흰 건반 생성

    for(let i = 0; i < whiteKeyCount; i++){

        pianoKeys.push({

            keyID: i,

            midiNoteNumber: midiNumbers[i],

            pitch: whiteNotes[i],

            keyType: "white",

            x: i * whiteKeyWidth,

            y: canvasHeight - whiteKeyHeight,

            width: whiteKeyWidth,

            height: whiteKeyHeight,

            pressed:false
        });

    }

    // 검은 건반 생성

    const blackKeys = [

        { note:"C#4", midi:61, pos:0 },
        { note:"D#4", midi:63, pos:1 },

        { note:"F#4", midi:66, pos:3 },
        { note:"G#4", midi:68, pos:4 },
        { note:"A#4", midi:70, pos:5 },

        { note:"C#5", midi:73, pos:7 },
        { note:"D#5", midi:75, pos:8 },

        { note:"F#5", midi:78, pos:10 }

    ];

    const blackKeyWidth =
        whiteKeyWidth * 0.6;

    const blackKeyHeight =
        whiteKeyHeight * 0.6;


    blackKeys.forEach((key, index)=>{

        pianoKeys.push({

            keyID: whiteKeyCount + index,

            midiNoteNumber:key.midi,

            pitch:key.note,

            keyType:"black",

            x:
                (key.pos + 1) * whiteKeyWidth
                - blackKeyWidth / 2,

            y:canvasHeight - whiteKeyHeight,

            width:blackKeyWidth,

            height:blackKeyHeight,

            pressed:false
        });

    });

}