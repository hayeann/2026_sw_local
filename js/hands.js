const videoElement =
    document.getElementsByClassName('input_video')[0];

const canvasElement =
    document.getElementsByClassName('output_canvas')[0];

const canvasCtx =
    canvasElement.getContext('2d');

const tracker =
    new TrackingManager(); //윤나영 5.30추가


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

    tracker.updatePerformance(); //윤나영 5.30추가

    tracker.detectHands(results); //윤나영 5.30추가

    tracker.detectHandedness(results); //윤나영 5.30추가

    canvasCtx.save();

    canvasCtx.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // 미러링

// 미러링 (좌우반전) 적용해 카메라 영상 출력

    canvasCtx.translate(canvasElement.width,0);
    canvasCtx.scale(-1, 1);

    // 카메라 영상 출력

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
    // 손가락 위치 계산

    let allHands = [];

    if(results.multiHandLandmarks){

        results.multiHandLandmarks.forEach((landmarks,index)=>{

            const filteredLandmarks = landmarks;

            allHands.push(filteredLandmarks);

            const velocity =
                tracker.calculateVelocity(
                    filteredLandmarks[8]
                );

            const indexAngle =
                tracker.calculateAngle(
                    filteredLandmarks[5],
                    filteredLandmarks[6],
                    filteredLandmarks[8]
                );

            console.log(
                "Index Angle:",
                indexAngle
            );

            let label =
                results.multiHandedness[index].label;

            if(label === "Left"){
                label = "Right";
            }
            else{
                label = "Left";
            }

            const handID =
                `${label}_${index}`;

            const palmX = (
                filteredLandmarks[0].x +
                filteredLandmarks[5].x +
                filteredLandmarks[9].x +
                filteredLandmarks[13].x +
                filteredLandmarks[17].x
            ) / 5;

            const palmY = (
                filteredLandmarks[0].y +
                filteredLandmarks[5].y +
                filteredLandmarks[9].y +
                filteredLandmarks[13].y +
                filteredLandmarks[17].y
            ) / 5;

            canvasCtx.fillStyle = "yellow";
            canvasCtx.font = "20px Arial";

            canvasCtx.fillText(
                handID,
                palmX * canvasElement.width,
                palmY * canvasElement.height
            );

        });

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

    canvasCtx.restore();//5.30윤나영 수정
    canvasCtx.fillStyle = "yellow";

    canvasCtx.font = "20px Arial";

    canvasCtx.fillText(

        `FPS : ${tracker.FramePerSecond.toFixed(1)}`,

        20,
        40

    );

    canvasCtx.fillText(

        `Latency : ${tracker.FrameLatency.toFixed(1)} ms`,

        20,
        70

    );

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