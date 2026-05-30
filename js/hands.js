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

    canvasCtx.translate(
        canvasElement.width,
        0
    );

    canvasCtx.scale(-1,1);

    // 카메라 영상 출력

    canvasCtx.drawImage(

        results.image,

        0,
        0,

        canvasElement.width,
        canvasElement.height

    );

    // 건반 상태 초기화

    pianoKeys.forEach(key => {

        key.pressed = false;

    });

    // 손가락 위치 계산

    let allHands = [];

    if(results.multiHandLandmarks){

        results.multiHandLandmarks.forEach(//윤나영 5.30추가

            (landmarks,index)=>{//윤나영 5.30추가



            const filteredLandmarks =
                landmarks;//윤나영 5.30추가

            allHands.push(filteredLandmarks);

            const velocity =

                tracker.calculateVelocity(

                    filteredLandmarks[8]

                );//윤나영 5.30추가


             const indexAngle =

                 tracker.calculateAngle(

                     filteredLandmarks[5],
                     filteredLandmarks[6],
                     filteredLandmarks[8]

                 );

             console.log(
                 "Index Angle:",
                 indexAngle
             );//윤나영 5.30추가

             let label =

                 results.multiHandedness[index]
                     .label;

             // 미러링 때문에 화면 표시용으로 좌우 반전

             if(label === "Left"){

                 label = "Right";

             }
             else{

                 label = "Left";

             }//윤나영 5.30추가

             const handID =//왼손 오른손 고유 ID부여

                         `${label}_${index}`;

                     // 손바닥 중앙 계산

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

                     );//윤나영 5.30추가



            const fingerX =
                filteredLandmarks[8].x
                * canvasElement.width;//윤나영 5.30수정

            const fingerY =
                filteredLandmarks[8].y
                * canvasElement.height;//윤나영 5.30수정

            // 건반 충돌 검사

            pianoKeys.forEach(key => {

                if(

                    fingerX > key.x &&
                    fingerX < key.x + key.width &&

                    fingerY > key.y &&
                    fingerY < key.y + key.height

                ){

                    key.pressed = true;

                }

            });

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