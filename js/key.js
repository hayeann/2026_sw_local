// [SRS 4.２ 실시간 시각적 피드백 시스템] 하단 추가 - 2026.05.29 이채민

class PianoKey {
    constructor(keyID, midiNoteNumber, keyType, x, y, width, height, noteName) {
        this.keyID = keyID;                 
        this.midiNoteNumber = midiNoteNumber; 
        this.keyType = keyType;            
        this.noteName = noteName;          
        
        // 충돌 판정을 위한 물리 좌표 범위
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // 건반 상태 속성
        this.isPressed = false;
    }
}