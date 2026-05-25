const videoElement =
    document.getElementsByClassName('input_video')[0];

const canvasElement =
    document.getElementsByClassName('output_canvas')[0];

const canvasCtx =
    canvasElement.getContext('2d');

// ROI 설정

const ROI = {
    x: 120,
    y: 260,
    width: 400,
    height: 180
};

// FPS 최적화

let frameCounter = 0;
const skipInterval = 2;

// Hands 결과 처리

function onResults(results) {

    frameCounter++;

    // 프레임 스킵
    if(frameCounter % skipInterval !== 0){
        return;
    }

    canvasCtx.save();

    canvasCtx.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // 미러링

    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);

    // 비디오 출력

    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // ROI 표시

    canvasCtx.strokeStyle = 'yellow';
    canvasCtx.lineWidth = 3;

    canvasCtx.strokeRect(
        ROI.x,
        ROI.y,
        ROI.width,
        ROI.height
    );

    // 손 랜드마크 처리

    if(results.multiHandLandmarks){

        for(const landmarks of results.multiHandLandmarks){

            // 검지 끝 좌표
            const tipX =
                landmarks[8].x * canvasElement.width;

            const tipY =
                landmarks[8].y * canvasElement.height;

            // ROI 내부 판별
            const insideROI =
                tipX > ROI.x &&
                tipX < ROI.x + ROI.width &&
                tipY > ROI.y &&
                tipY < ROI.y + ROI.height;

            // ROI 내부일 때만 출력
            if(insideROI){

                drawConnectors(
                    canvasCtx,
                    landmarks,
                    HAND_CONNECTIONS,
                    {
                        color:'#00FF00',
                        lineWidth:3
                    }
                );

                drawLandmarks(
                    canvasCtx,
                    landmarks,
                    {
                        color:'#FF0000',
                        fillColor:'#00FF00',
                        radius:5
                    }
                );
            }
        }
    }

    canvasCtx.restore();
}

// MediaPipe Hands 설정

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

// 카메라 설정

const camera = new Camera(videoElement, {

    onFrame: async () => {

        await hands.send({
            image: videoElement
        });

    },

    width:640,
    height:480

});

camera.start();