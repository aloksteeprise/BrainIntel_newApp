/*
Reference :: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
*/

import './RecorderPage.scss';
import { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import Header from '../Header/Header';
import Footer from './Footer.js';

let mediaRecorder;
let audioCtx;

function RecorderPage() {
  const [state, setState] = useState({
    startAnalysis: true,
    recording: false,
    completed: false,
    submitted: false,
    record: false,
    view: false,
    audioFile: null,
  });

  const textContent =
    'When the sunlight strikes raindrops in the air, they act as a prism  and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.';

  const [streamData, setStreamData] = useState();

  var albumBucketName = 'wav-directory';
  var bucketRegion = 'us-east-1';
  var IdentityPoolIdt = 'us-east-1:3800b6bb-b0af-4093-bd6c-d136afcf3fbb';

  AWS.config.region = bucketRegion; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolIdt,
  });
  AWS.config.update({
    region: bucketRegion,
    apiVersion: 'latest',
    credentials: {
      accessKeyId: 'AKIA6QH6OHEDILGKQ4VX',
      secretAccessKey: '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',
    },
  });

  var s3 = new AWS.S3({
    apiVersion: '2012-10-17',
    params: { Bucket: albumBucketName },
  });
  // const mimeType = audioRecorder.mediaRecorder.mimeType; // Check if this indeed is 'audio/wav'
  // const mediaRecorder =

  useEffect(() => {
    
    if (navigator.mediaDevices.getUserMedia()) {
      console.log('getUserMedia supported.');
      const constraints = { audio: true };
      let chunks = [];

      let onSuccess = function (stream) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });

        setStreamData(stream);

        mediaRecorder.onstop = function () {
          const audio = document.getElementById('audioEle');
          audio.setAttribute('controls', '');

          audio.controls = true;
          const blob = new Blob(chunks, { type: 'audio/wav' });
          chunks = [];
          const audioURL = window.URL.createObjectURL(blob);
          audio.src = audioURL;
          setState((state) => ({
            ...state,
            audioFile: blob,
          }));
          console.log('data available');
          console.log(audio.src);
        };

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };
      };

      let onError = function (err) {
        console.log('The following error occured: ' + err);
      };
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
      // .catch(onError);
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  }, []);

  let analyser, dataArray, bufferLength;
  const visualize = (stream) => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    draw(analyser, dataArray, bufferLength);
  };

  const draw = () => {
    let canvas = document.querySelector('.visualizer');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const canvasCtx = canvas.getContext('2d');

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };
  const analysisHandler = () => {
    setState((state) => ({
      ...state,
      startAnalysis: false,
      record: true,
    }));
  };

  const recordingHandler = () => {
    setState((state) => ({
      ...state,
      record: true,
      recording: true,
    }));
  };

  const recordHandler = () => {
    setState((state) => ({
      ...state,
      recording: false,
      record: false,
      completed: true,
    }));
  };

  const submitHandler = () => {
    console.log('audio file');
    console.log(state.audioFile);
    let name = getFileName();
    var params = {
      Body: state.audioFile,
      Bucket: albumBucketName,
      Key: name + '.wav',
    };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('success');
      }
    });
    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,
    }));
  };

  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem('userObject'));
  };

  const getFileName = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;

    const today = new Date();
    const yy = today.getFullYear().toString().substr(-2);
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    let hh = today.getHours();
    let mins = today.getMinutes();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return id + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins;
  };

  const closeHandler = () => {
    setState((state) => ({
      ...state,
      submitted: false,
      startAnalysis: true,
    }));
  };

  const recordAgainHandler = () => {
    setState((state) => ({ ...state, completed: false, record: true }));
  };

  const [result, setResult] = useState([]);
  const checkResults = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    s3.listObjects({ Prefix: id }, function (err, data) {
      if (err) {
        return alert(
          'There was a brutal error viewing your album: ' + err.message
        );
      } else {
        console.log('list data--');
        console.log(data);

        let r = [];
        data.Contents.map((val) => {
          if (val.Key.includes('.pdf')) {
            r.push(val.Key);
          }
        });

        if (r.length) {
          setResult([...r]);
        }
      }
    });

    setState((state) => ({ ...state, startAnalysis: false, view: true }));
  };

  const backtoStart = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true }));
  };

  useEffect(() => {
    if (state.recording) {
      startRecording();
    }
  }, [state.recording]);

  const startRecording = () => {
    visualize(streamData);
    mediaRecorder.start();
    console.log('Recording started');
  };

  const stopRecording = () => {
    console.log('stopButton clicked');
    mediaRecorder.stop();
  };

  const onButtonClick = (key) => {
    s3.getObject({ Key: key }, function (err, data) {
      if (err) {
        return alert('There was an error viewing your album: ' + err.message);
      } else {
        var blobStore = new Blob([data.Body], { type: 'application/pdf' });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blobStore);
          return;
        }
        var data = window.URL.createObjectURL(blobStore);
        var link = document.createElement('a');
        document.body.appendChild(link);
        link.href = data;
        link.download = key + '.pdf';
        link.click();
        window.URL.revokeObjectURL(data);
      }
    });
  };

  return (
    <div className="App" style={{ paddingBottom: '80px', overflowY: 'auto' }}>
      <Header />
      {/* first page */}
      {state.startAnalysis ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Welcome {}</h1>
            <div className="para">
              With the help of our Speech Analysis AI and Machine Learning Tool,
              you can check your Happiness Index and get results in pdf format,
              so that you can decide next steps.
            </div>

            <button className="button" onClick={analysisHandler}>
              Click To Begin
            </button>

            <button className="button-secondary" onClick={checkResults}>
              Check Results
            </button>
          </div>
          <div></div>
        </div>
      ) : null}

      {/* 2nd page */}
      {state.record ? (
        <div className="main-div">
          <div></div>
          <div className="first">
            <h1 className="head">Start Analysis</h1>
            <div className="para">
              Kindly allow the microphone to access. Click the Record button and
              read the text. Once done, you can click the stop button.
            </div>
            <div
              style={{
                // border: "1px solid #000" ,
                margin: '10px auto',
                padding: '15px 15px 0px',
              }}
            >
              {state.recording ? (
                <div>
                  <div className="para2">READ ALOUD THE FOLLOWING LINES</div>
                  <div className="myRecordScrollBox">
                    <marquee
                      direction="up"
                      className="marquee"
                      scrollamount="1"
                    >
                      <div className="marqueeText">{textContent}</div>
                    </marquee>
                  </div>
                </div>
              ) : (
                <div className="myBox">{textContent}</div>
              )}
              {state.recording ? (
                <>
                  <canvas
                    className="visualizer"
                    height="35px"
                    style={{ margin: '15px auto' }}
                  ></canvas>
                  <button
                    className="button"
                    onClick={() => {
                      recordHandler();
                      stopRecording();
                    }}
                  >
                    <div>Stop</div>
                  </button>
                </>
              ) : (
                <button
                  className="button"
                  onClick={() => {
                    recordingHandler();
                  }}
                >
                  Record
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* 3rd page */}
      {state.completed ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Recording Complete</h1>
            <div className="para">
              Your speech is ready for testing, please listen to it. If not
              audible, please record it again.
            </div>
            <audio id="audioEle" className="audio" />
            <button className="button" onClick={submitHandler}>
              Submit for Analysis
            </button>
            <button className="button-secondary" onClick={recordAgainHandler}>
              Record Again
            </button>
          </div>
          <div></div>
        </div>
      ) : null}

      {/* 4th page */}
      {state.submitted ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Recording submitted</h1>
            <div className="para">
              We will analyze the recording and share analysis with you shortly.
              Please check Results section after some time.
            </div>
            {/* <div className="FeedbackForm">
              <h1>Feedback</h1>
              <FeedbackForm />
            </div> */}
            <button className="button" onClick={closeHandler}>
              Close
            </button>
          </div>
          <div></div>
        </div>
      ) : null}
      {state.view ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">View Analysis Results</h1>
            <div style={{ fontFamily: 'Proxima' }}>
              {result.length === 0 && <p> No records found!</p>}

              {result.length > 0 &&
                result.map((r) => {
                  console.log(r);
                  return (
                    <p>
                      {' '}
                      Here is the link to
                      <a
                        href={r}
                        onClick={() => {
                          onButtonClick(r);
                        }}
                      >
                        {' '}
                        {r}
                      </a>
                    </p>
                  );
                })}

              <button className="button" onClick={backtoStart}>
                {' '}
                Close
              </button>
            </div>
          </div>
          <div></div>
        </div>
      ) : null}
      <Footer />
    </div>
  );
}

export default RecorderPage;
