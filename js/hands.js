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

        for(const landmarks of results.multiHandLandmarks){

            allHands.push(landmarks);

            const fingerX =
                landmarks[8].x
                * canvasElement.width;

            const fingerY =
                landmarks[8].y
                * canvasElement.height;

            // 건반 충돌 검사

            let blackKeyPressed = false;

            pianoKeys
                .filter(key => key.keyType === "black")
                .forEach(key => {

                    if (

                        fingerX > key.x &&
                        fingerX < key.x + key.width &&

                        fingerY > key.y &&
                        fingerY < key.y + key.height

                    ) {

                        key.pressed = true;
                        blackKeyPressed = true;

                    }

                });

            if (!blackKeyPressed) {

                pianoKeys
                    .filter(key => key.keyType === "white")
                    .forEach(key => {

                        if (

                            fingerX > key.x &&
                            fingerX < key.x + key.width &&

                            fingerY > key.y &&
                            fingerY < key.y + key.height

                        ) {

                            key.pressed = true;

                        }
                    });
            }

        }

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