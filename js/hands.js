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


// 모니터 좌표 -> 캔버스 좌표 변환

function monitorToCanvas(x, y){

    return {
        x: (x / monitorWidth) * canvasElement.width,
        y: (y / monitorHeight) * canvasElement.height
    };

}


// ROI 영역 시각화

function drawROI(){

    const x = roiTopLeft.x * canvasElement.width;
    const y = roiTopLeft.y * canvasElement.height;

    const width =
        (roiBottomRight.x - roiTopLeft.x) * canvasElement.width;

    const height =
        (roiBottomRight.y - roiTopLeft.y) * canvasElement.height;

    canvasCtx.strokeStyle = "rgba(255,255,0,0.9)";
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(x, y, width, height);

}


// 손 인식 결과 처리

function onResults(results){

    canvasCtx.save();

    canvasCtx.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );


// 미러링 (좌우반전) 적용해 카메라 영상 출력

    canvasCtx.translate(canvasElement.width,0);
    canvasCtx.scale(-1, 1);

    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );


    // 매 프레임마다 건반 상태 초기화

    pianoKeys.forEach(key => {

        key.pressed = false;

    });

    let allHands = [];

    if(results.multiHandLandmarks){

        allHands = results.multiHandLandmarks;

        const fingerList = trackMultipleFingers(
            results.multiHandLandmarks,
            monitorWidth,
            monitorHeight
        );

        fingerList.forEach(finger => {

            const canvasPoint = monitorToCanvas(
                finger.x,
                finger.y
            );

            pianoKeys.forEach(key => {
                if(
                    canvasPoint.x > key.x &&
                    canvasPoint.x < key.x + key.width &&
                    canvasPoint.y > key.y &&
                    canvasPoint.y < key.y + key.height
                ){
                    key.pressed = true;
                }
            });


            // 추적된 손가락 위치 표시(파란점은 제 건반 판정에 사용되는 손가락 좌표를 눈으로 보여주는 디버그점)
            canvasCtx.beginPath();
            canvasCtx.arc(

                canvasPoint.x,
                canvasPoint.y,
                8,
                0,
                Math.PI * 2
            );
            canvasCtx.fillStyle = "cyan";
            canvasCtx.fill();

        });

    }


    // 흰 건반 렌더링

    pianoKeys
        .filter(key => key.keyType === "white")
        .forEach(key => {

            canvasCtx.fillStyle =

                key.pressed
                    ? "rgba(180,180,180,0.85)"
                    : "rgba(255,255,255,0.65)";

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

                key.x + 15,
                key.y + key.height - 20

            );

        });

    // 검은 건반 렌더링

    pianoKeys
        .filter(key => key.keyType === "black")
        .forEach(key => {

            canvasCtx.fillStyle =

                key.pressed
                    ? "rgba(0,0,0,0.95)"
                    : "rgba(0,0,0,0.65)";


            canvasCtx.fillRect(

                key.x,
                key.y,

                key.width,
                key.height

            );

        });

    // ROI 표시

    drawROI();

    // 손 랜드마크 덧그리기

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


    canvasCtx.restore();

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
