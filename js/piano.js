// [SRS 4.3 실시간 시각적 피드백 시스템] 하단 추가 - 2026.05.29 이채민

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

// [SRS 4.3 실시간 시각적 피드백 시스템] 
function drawPianoKeys(ctx) {
    // 1. 흰 건반 먼저 그리기 (배열의 앞부분)
    pianoKeys.forEach(key => {
        if (key.keyType === "white") {
            // 평상시에는 흰색, 눌렸을 때는 다른 색상
            ctx.fillStyle = key.pressed ? "#E0E0E0" : "#FFFFFF";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            
            // 건반 테두리 선 (회색)
            ctx.strokeStyle = "#CCCCCC";
            ctx.lineWidth = 1;
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            
            // [SRS 4.1.1 속성 매핑 표시] 건반 하단에 음계 이름(C4, D4 등) 텍스트 출력
            ctx.fillStyle = "#555555";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(key.pitch, key.x + key.width / 2, key.y + key.height - 20);
        }
    });

    // 2. 검은 건반 위에 덮어 그리기 (배열의 뒷부분)
    pianoKeys.forEach(key => {
        if (key.keyType === "black") {
            // 평상시에는 검은색, 눌렸을 때는 어두운 빨간색 등
            ctx.fillStyle = key.pressed ? "#8B0000" : "#333333";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            
            // 검은 건반 테두리
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(key.x, key.y, key.width, key.height);
        }
    });
}