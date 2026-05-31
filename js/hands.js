const videoElement =
    document.getElementsByClassName('input_video')[0];

const canvasElement =
    document.getElementsByClassName('output_canvas')[0];

const canvasCtx =
    canvasElement.getContext('2d');


// 피아노 생성
createPianoKeys(
    canvasElement.width,
    canvasElement.height
);

// 손 인식 결과 처리
function onResults(results){

    canvasCtx.save(); // [전체 상태 저장]

    canvasCtx.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // 미러링 - 2026.05.29 - 이채민, 미러링 버그로 건반 아래 글자까지 뒤집히는 오류 발생 이에 따라 수정함.
    canvasCtx.save();
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();


    // 건반 상태 초기화 (pressed -> isPressed로 오류 수정)
    pianoKeys.forEach(key => {
        key.isPressed = false;
    });

    // 손가락 위치 계산
    let allHands = [];

    if(results.multiHandLandmarks){

        for(const landmarks of results.multiHandLandmarks){

            allHands.push(landmarks);

            // [X축 미러링 보정] 거울 모드 화면과 1:1 매칭되도록 MediaPipe 원본 X 좌표를 뒤집음
            const fingerX = (1.0 - landmarks[8].x) * canvasElement.width;
            const fingerY = landmarks[8].y * canvasElement.height;

            // 건반 충돌 검사
            pianoKeys.forEach(key => {

                // press->ispressed로 변수 명 변경(SRS에 따름) 후 코드 소폭 변경
                if (
                    fingerX > key.keyRect.left &&
                    fingerX < key.keyRect.right &&
                    fingerY > key.keyRect.top &&
                    fingerY < key.keyRect.bottom
                ) {
                    key.isPressed = true; 
                }

            });

        }

    }

    // 흰 건반 렌더링
    pianoKeys
        .filter(key => key.keyType === "white")
        .forEach(key => {

            canvasCtx.fillStyle = key.isPressed ? key.activeColor : key.idleColor;

            canvasCtx.fillRect(
                key.x,
                key.y,
                key.width,
                key.height
            );


            canvasCtx.strokeStyle = "rgba(255,255,255,0.25)";
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeRect(
                key.x,
                key.y,
                key.width,
                key.height
            );


            canvasCtx.fillStyle = "black";
            canvasCtx.font = "18px Arial";
            canvasCtx.fillText(
               key.pitch,
                key.x + (key.width / 2) - 10,
                key.y + key.height - 20
            );

        });

    // 검은 건반 렌더링 (하드코딩 제거 및 객체 속성 색상 적용 완료)
    pianoKeys
        .filter(key => key.keyType === "black")
        .forEach(key => {

            canvasCtx.fillStyle = key.isPressed ? key.activeColor : key.idleColor;

            canvasCtx.fillRect(
                key.x,
                key.y,
                key.width,
                key.height
            );

        });

    // 손 랜드마크 덧그리기 (안전한 스택 관리를 위해 내부 save/restore 추가)
    canvasCtx.save(); 
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);

    allHands.forEach(landmarks => {

        drawConnectors(
            canvasCtx,
            landmarks,
            HAND_CONNECTIONS,
            {
                color:"#00FF00",
                lineWidth:4
            }
        );

        drawLandmarks(
            canvasCtx,
            landmarks,
            {
                color:"#FF0000",
                fillColor:"#00FF00",
                radius:5
            }
        );

    });
    canvasCtx.restore(); // 뼈대 미러링 상태 복구

    canvasCtx.restore(); // [전체 상태 복구] 맨 위 save와 짝궁
}

// MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands:2,
    modelComplexity:1,
    minDetectionConfidence:0.5,
    minTrackingConfidence:0.5
});

hands.onResults(onResults);

// 카메라
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({
            image: videoElement
        });
    },
    width:1000,
    height:700
});

camera.start();