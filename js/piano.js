// [SRS 4.3 실시간 시각적 피드백 시스템] 하단 추가 - 2026.05.29 이채민
const pianoKeys = [];

// 건반 생성 함수
function createPianoKeys(canvasWidth, canvasHeight){
    pianoKeys.length = 0;

    const whiteNotes = [
        "C4", "D4", "E4", "F4", "G4", "A4", "B4",
        "C5", "D5", "E5", "F5", "G5"
    ];

    const midiNumbers = [
        60, 62, 64, 65, 67, 69, 71,
        72, 74, 76, 77, 79
    ];

    const whiteKeyCount = whiteNotes.length;
    const whiteKeyWidth = canvasWidth / whiteKeyCount;
    const whiteKeyHeight = 220;

    // [SRS] 검은 건반 높이 비율 속성 정의
    const blackKeyHeightRatio = 0.6;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * blackKeyHeightRatio;

    // 1. 흰 건반 생성
    for(let i = 0; i < whiteKeyCount; i++){

        const left = i * whiteKeyWidth;
        const top = canvasHeight - whiteKeyHeight;
        const right = left + whiteKeyWidth;
        const bottom = canvasHeight;

        pianoKeys.push({
            keyID: i,
            midiNoteNumber: midiNumbers[i],
            pitch: whiteNotes[i],
            keyType: "white",

            // [SRS 4.2] keyRect 구조화 (left, top, right, bottom)
            keyRect: { left: left, top: top, right: right, bottom: bottom },
            x: left,                                     // 하위 호환성 유지용 x, y
            y: top,
            width: whiteKeyWidth,
            height: whiteKeyHeight,

            zIndex: 2,                                  
            touchPadding: 5,                            
            isPressed: false,                           
            
            // [SRS] 시각적 피드백용 색상 속성 분리
            idleColor: "rgba(255, 255, 255, 0.65)",
            activeColor: "rgba(180, 180, 180, 0.85)",
            animationSpeed: 0.2 
        });
    }

    // 검은 건반 데이터 배열 정의
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

    // 2. 검은 건반 생성 (배열 이름 blackKeys로 통일 및 canvasHeight 반영)
    blackKeys.forEach((key, index) => {
        const left = (key.pos + 1) * whiteKeyWidth - blackKeyWidth / 2;
        const top = canvasHeight - whiteKeyHeight; // displayHeight에서 변경
        const right = left + blackKeyWidth;
        const bottom = top + blackKeyHeight;

        pianoKeys.push({
            keyID: whiteKeyCount + index,               // [SRS] 고유 ID
            midiNoteNumber: key.midi,                   // [SRS] MIDI 음호
            pitch: key.note,                            // 음계명
            keyType: "black",                           // [SRS] 건반 타입

            // [SRS] keyRect 구조화 (left, top, right, bottom)
            keyRect: { left: left, top: top, right: right, bottom: bottom },
            x: left,                                    // 하위 호환성 유지용 x, y
            y: top,
            width: blackKeyWidth,
            height: blackKeyHeight,

            zIndex: 2,                                  // [SRS] 레이어 처리 우선순위
            touchPadding: 3,                            // [SRS] 흑건용 충돌 보정 마진
            isPressed: false,                           // [SRS] 타건 상태 상태 (Boolean)
            
            // [SRS] 시각적 피드백용 색상 속성 분리
            idleColor: "rgba(0, 0, 0, 0.65)",
            activeColor: "rgba(139, 0, 0, 0.95)",       // 눌렸을 때 어두운 빨간색
            animationSpeed: 0.2                         // [SRS] 애니메이션 속도 변수
        });
    });

    // 전체 건반 카운트 변수 선언 (글로벌 관리용)
    window.keyCount = pianoKeys.length;
    window.blackKeyHeightRatio = blackKeyHeightRatio;
}