/*
Reference :: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
*/

import './RecorderPage.scss';
import { useEffect, useState } from 'react';
import Header from '../Header/Header';
import Footer from './Footer.js';
import jsPDF from 'jspdf';
import { handlerLogs, submitFeedback, } from '../../service/Authservice';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Tooltip } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { array } from 'prop-types';
import { red } from '@mui/material/colors';
// import pdf from '../../../src/document/consent.pdf'
let mediaRecorder;
let audioCtx;

function RecorderPage() {

  const [feedbackValue, setFeedbackValue] = useState('');
  const [feedbackbuttonenable, setFeedbackButtonEnable] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackfilename, setFeedbackFilename] = useState("")
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [attributes, setAttributes] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [userfeedbackcount, setUserFeedbackcount] = useState("0")
  const [latesfeedbackcount, setLatestFeedbackcount] = useState("")
  const [headingText, setHeadingText] = useState('Kindly allow the microphone to record your voice');
  const [state, setState] = useState({
    startAnalysis: true,
    recording: false,
    completed: false,
    submitted: false,
    record: false,
    view: false,
    audioFile: null,
    feedbackVisible: false,
    feedbacktable: false,
    headingvisible: false

  });

  const textContent =
    'When the sunlight strikes raindrops in the air, they act as a prism  and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.';

  const [streamData, setStreamData] = useState();

  // var albumBucketName = 'amplify-brainintel1-dev-59877-deployment';
  // var bucketRegion = 'ap-south-1';
  // var IdentityPoolIdt = 'ap-south-1:3b01329c-a976-4e4e-a0f5-70a53b026882';

  // AWS.config.region = bucketRegion; // Region
  // AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  //   IdentityPoolId: IdentityPoolIdt,
  // });
  // AWS.config.update({
  //   region: bucketRegion,
  //   apiVersion: 'latest',
  //   credentials: {
  //     accessKeyId: 'AKIA6QH6OHEDILGKQ4VX',
  //     secretAccessKey: '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',
  //   },
  // });

  // var s3 = new AWS.S3({
  //   apiVersion: '2012-10-17',
  //   params: { Bucket: albumBucketName },
  // });
  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        //handlerLogs('getUserMedia success: >');
        setStreamData(stream);
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleRecordingStopped;
      } catch (error) {
        //handlerLogs(`getUserMedia > ` + error);
      }
    };

    initializeMediaRecorder();
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
      feedbacktable: false,
      headingvisible: false
    }));
  };

  const recordingHandler = () => {
    setHeadingText('Start Recording'); // Change the heading text
    startRecording();
  };

  const recordHandler = () => {
    handlerLogs('recordHandler> ');
    stopRecording();
  };

  // const feedbackHandler = async () => {
  //   //const userInfo = getUserInfo();
  //   //let id = userInfo?.userId;
  //   // const folderName = getUserFolderName();
  //   //const pdfCount = await s3.listAndCountFiles(albumBucketName, folderName);
  //   //const pdfCount = await listAndCountFiles('', folderName);

  //   //const pdfCount =  s3.listAndCountFiles({ Prefix: folderName });
  //   let sortedContents = 0;
  //   debugger;
  //   const userInfo = getUserInfo();
  //   let id = userInfo?.userId;
  //   const folderName = getUserFolderName();
  //   s3.listObjects({ Prefix: folderName }, function (err, data) {
  //     if (err) {
  //       return alert('There was a brutal error viewing your album: ' + err.message);
  //     } else {
  //       handlerLogs(`checkResults > ` + JSON.stringify(data));
  //       const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  //       let r = [];
  //       sortedContents.forEach((val) => {
  //         if (val.Key && val.Key.endsWith('.pdf')) {
  //           r.push(val.Key);
  //         }
  //       });
  //       if (r.length) {
  //         fetchFeedbackStatus();
  //         setFeedbackValue("")
  //         setState(prevState => ({
  //           ...prevState,
  //           feedbackVisible: true, // Show feedback section
  //           submitted: false, // Hide main content
  //           startAnalysis: false,
  //           recording: false,
  //           completed: false,
  //           headingvisible: true,
  //           view: false,
  //           record: false


  //         }));
  //       }

  //       else {

  //         alert('There is no files for feedback.')
  //       }
  //     }
  //   });







  // };


  const feedbackHandler = async () => {
    debugger
  const userInfo = getUserInfo();
  const id = localStorage.getItem('number')
  let reportIds;
  let feedbacktable = false;

  const feedbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/list-results?UserID=${encodeURIComponent(id)}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // ⬅️ Send token in header
    },
  },
)

  if (!feedbackResponse.ok) {
    if(feedbackResponse.status == 403)
        alert("Session expired. Log in to continue.");
   // throw new Error("Failed to fetch data");
  }

  const data = await feedbackResponse.json();

  if (Array.isArray(data.files) && data.files.length > 0) {
    setResult(data.files);
  reportIds = data.files.map(item => item.reportId);
    }
    else{
      if (feedbackResponse.ok) {
        reportIds = []
       alert("There is no file for feedback.");
      }
       return ;
    }
  
  if (!id) {
    alert("User ID is missing.");
    return;
  }
 
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get-feedback-by-user/${id}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // ⬅️ Send token in header
    },
  }
);
 
    if (!response.ok) {
      throw new Error("Failed to fetch feedback data");
    }
 
    const data = await response.json();
    const feedbackList = data.feedback || [];
 
    // if (feedbackList.length === 0) {
    //   alert("There is no files for feedback.");
    //   return;
    // }
 debugger
    if(feedbackList.length > 0){
      feedbacktable = true
    }
    
    setFeedbackData(feedbackList);
    const feedbackReportIds = feedbackList.map(f => f.ReportId);

    // Check if any reportId in localStorage does NOT have feedback
    const shouldShowFeedback = reportIds.some(reportId => !feedbackReportIds.includes(reportId));
 
    setState(prevState => ({
      ...prevState,
       feedbackVisible: shouldShowFeedback, // Show feedback section
            submitted: false, // Hide main content
            startAnalysis: false,
            recording: false,
            completed: false,
            headingvisible: true,
            view: false,
            record: false,
            feedbacktable:feedbacktable
    }));
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    alert("Something went wrong: " + error.message);
  }
};
  useEffect(() => {
    checkuserloginuser();

  }, []);

  const checkuserloginuser = async () => {

    // const loginUserAttribute = await handleFetchUserAttributes();
    // if (loginUserAttribute != null) {

    //   if ("family_name" in loginUserAttribute) {
    //     console.log("yes")
    //     if (loginUserAttribute.family_name != "0") {
    //       setFeedbackButtonEnable(true)
    //     }

    //   }
    //   else {
    //     console.log("no")
    //     setFeedbackButtonEnable(false);
        // submitLoginUserAttributeFeedback('0');
    //   }

    // }
  }

  const handleFeedbackChange = (event) => {
    setFeedbackValue(event.target.value);
  };


  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      const blob = new Blob([event.data], { type: 'audio/wav' });
      setState((prevState) => ({
        ...prevState,
        audioFile: blob,
      }));
    }
  };
  const handleRecordingStopped = () => {
    handlerLogs(`handleRecordingStopped > ` + 'Recording stopped');
    setState((prevState) => ({
      ...prevState,
      recording: false,
      completed: true,
    }));
  };


  // const submitHandler = () => {
  //   let name = getFileName();
  //   const folderName = getUserFolderName();
  //   var params = {
  //     Body: state.audioFile,
  //     Bucket: albumBucketName,
  //     Key: `${folderName}/${name + '.wav'}`,
  //     // Key: name + '.wav',
  //   };
  //   s3.putObject(params, function (err, data) {
  //     if (err) {
  //       handlerLogs(`submitHandler > ` + err.stack);
  //     } else {
  //       setFeedbackFilename(name);
  //      
  //       setUserFeedbackcount("0")
  //       handlerLogs(`submitHandler > ` + 'success');

  //       // createPdf(folderName,name)
  //     }
  //   });
  //   setState((state) => ({
  //     ...state,
  //     completed: false,
  //     submitted: true,
  //   }));
  // };


  const submitHandler = async () => {
    debugger;
    const id = localStorage.getItem('number')
    const token = localStorage.getItem('token');
    let name = getFileName();
    const folderName = getUserFolderName();
    const username = folderName.split('@')[0];



    const formData = new FormData();
    formData.append("userId", id);
    formData.append("email", folderName);
    formData.append("wavFileName", name + ".wav");
    formData.append("file", state.audioFile); // ✅ Must be "file"
    formData.append("wavFilePath", `/uploads/audio/${name}.wav`);
    formData.append("pdfFileName", "");
    formData.append("pdfFilePath", "");
    formData.append("isFileGenerated", "false");
    formData.append("updatedBy", username);


    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-report`, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`, 
      },
        body: formData,
      });

      const data = await response.json();
      // var params = {
      //   Body: state.audioFile,
      //   Bucket: albumBucketName,
      //   Key: `${folderName}/${name + '.wav'}`,
      // };

      // s3.putObject(params, async function (err, data) {
      //   if (err) {
      //     handlerLogs(`submitHandler > ` + err.stack);
      //   } else {
      //     setFeedbackButtonEnable(false);
      //     setTimeout(function () {
      //       setFeedbackButtonEnable(true)
      //       submitLoginUserAttributeFeedback('1');
      //     }, 10000)
      //     setFeedbackFilename(name);

      //     await submitFeedback("", "0");

      //     handlerLogs(`submitHandler > ` + 'success');
      //     //checkuserloginuser();

      //   }
      // });

      if (!response.ok) {
      if(response.status == 403)
          alert("Session expired. Log in to continue.");
          setState((state) => ({
          ...state,
          submitted: false,
          startAnalysis: true,
          completed:false
        }));
        setChecked(false)
          return
      }

      if (response.ok) {
        setFeedbackFilename(name);
        setFeedbackButtonEnable(false);
        // setTimeout(() => {
        //   setFeedbackButtonEnable(true);
        //   submitLoginUserAttributeFeedback('1');
        // }, 10000);
        // await submitFeedback("", "0");
        handlerLogs(`submitHandler > Upload successful`);
      } else {
        handlerLogs(`submitHandler > Upload failed: ${data.message}`);
        alert(`submitHandler > Upload failed: ${data.message}`);
      }
    } catch (err) {
      handlerLogs(`submitHandler > Error: ${err.message}`);
      alert(`submitHandler > Error: ${err.message}`);
    }


    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,

    }));
  };


  // const createPdf = (folderName, name) => {
  //   const userInfo = getUserInfo();
  //   let id = userInfo?.userId;
  //   id = id.split('@')[0];
  //   const doc = new jsPDF();
  //   doc.text(`Hello ${id}`, 10, 10);
  //   doc.text('This is a sample PDF file.', 10, 20);

  //   // Save the PDF
  //   const pdfBlob = doc.output('blob');
  //   var params = {
  //     // Body: state.audioFile,
  //     Bucket: albumBucketName,
  //     Key: `${folderName}/${name + '.pdf'}`,
  //     // Key: name + '.wav',
  //     Body: pdfBlob,
  //     ContentType: 'application/pdf',
  //   };
  //   s3.putObject(params, function (err, data) {
  //     if (err) {
  //       handlerLogs(`createPdf > ` + err.stack);
  //     } else {
  //       handlerLogs(`createPdf > ` + 'success');
  //     }
  //   });
  //   setState((state) => ({
  //     ...state,
  //     completed: false,
  //     submitted: true,
  //   }));
  // };
  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem('userObject'));
  };

  const getUserFolderName = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    // if(id){
    //   id = id.split('@')[0];
    // }
    if (id) {
      id = id.toLowerCase();
    }
    return id;
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
    let secs = today.getSeconds();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;
    //let abc="BrainIntel" + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins+''+secs;
    // return id + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins;
    id = id.split('@')[0];
    return id + '_' + dd + '' + mm + '' + yy + '_' + hh + '' + mins + '' + secs;
  };

  const closeHandler = () => {

    setState((state) => ({
      ...state,
      submitted: false,
      startAnalysis: true,
    }));
    setChecked(false)
  };


  //   setState((state) => ({
  //     ...state,
  //     submitted: false,
  //     completed: true,
  //     feedbackVisible:false
  //   }));
  // };

  const getLatestWavFile = async (bucketName, prefix) => {
    // const params = {
    //   Bucket: albumBucketName,
    //   Prefix: prefix
    // };

   
    
  };

//   useEffect(() => {
//   if (reportss.length > 0) {
//     console.log("Updated reportss:", reportss);
//     // now it's safe to use
//   }
// }, [reportss]);



  // const submitfeedbackhandler = async () => {
  //   const userInfo = getUserInfo();
  //   const id = userInfo?.userId;
  //   const folderName = getUserFolderName();
  //   console.log(id);

 
  //   const latestWavFile = await getLatestWavFile(albumBucketName, folderName);

  //   if (!latestWavFile) {
  //     setFeedbackError("No WAV file found");
  //     return;
  //   }

  //   const inputValue = latestWavFile + '-' + feedbackValue;

  //   if (!feedbackValue) {
  //     setFeedbackError("Feedback % not selected");
  //     return;
  //   }

  //   setUserFeedbackcount("1");
  //   console.log(inputValue, "Akash2");

  //   let result = await submitFeedback(inputValue, "1");
  //   setSnackbarMessage(result.message);
  //   setSnackbarOpen(true);
  //   setChecked(false);

  //   setState((state) => ({
  //     ...state,
  //     completed: false,
  //     startAnalysis: true,
  //     feedbacktable: false,
  //     feedbackVisible: false,
  //     headingvisible: false
  //   }));
  // };






  // useEffect(() => {
  //   const fetchFeedbackStatus = async () => {
  //     try {
  //       const userAttributes = await latestUserAttributes();
  //       const feedbackStatus = userAttributes['custom:LatestFeedback'];
  //       setLatestFeedbackcount(feedbackStatus);
  //       console.log('Latest Feedback Value:', feedbackStatus); // Log the value

  //       // Hide feedback section if feedbackStatus is 1
  //       if (feedbackStatus === "1") {
  //         setState((prevState) => ({ ...prevState, feedbackVisible: false }));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user attributes:', error);
  //     }
  //   };

  //   fetchFeedbackStatus();
  // }, []);


  // const fetchFeedbackStatus = async () => {
  //   try {
  //     const userAttributes = await latestUserAttributes();
  //     console.log(userAttributes)
  //     setLatestFeedbackcount(userAttributes);

  //     const feedbackString = userAttributes['custom:Userfeedback'];
  //     const feedbackStatus = userAttributes['custom:LatestFeedback'];
  //     if (feedbackStatus === "1") {
  //       setState((prevState) => ({ ...prevState, feedbackVisible: false }));
  //     }
  //     const email = userAttributes['email'];
  //     const emailPrefix = email.split('@')[0];

  //     const feedbackEntries = formatteddate.split(';').filter(entry => entry !== "");
  //   
  //     const processedFeedbackData = feedbackEntries.map(entry => {
  //       const [customFeedback, percentage] = entry.split('-');
  //       return {
  //         customFeedback: `${emailPrefix}_${customFeedback}`,
  //         percentage
  //       };
  //     });
  //     setFeedbackData(processedFeedbackData);

  //     if (feedbackStatus === "1") {
  //       setState(prevState => ({ ...prevState, feedbackVisible: false, feedbacktable: true,headingvisible:true }));
  //     } else {
  //       setState(prevState => ({ ...prevState, feedbackVisible: true, feedbacktable: true,headingvisible:true }));
  //     }


  //   } catch (error) {
  //     console.error('Error fetching user attributes:', error);
  //   }
  // };

  // holds report IDs globally in this file
const token = localStorage.getItem('token');


const submitfeedbackhandler = async () => {
  const userInfo = getUserInfo();
  const createdBy = userInfo?.email.split('@')[0];
  const userId = localStorage.getItem('number');
  const satisfactionLevel = feedbackValue;
  let reportIds;

  if (!userId) {
    setFeedbackError("User ID not found");
    return;
  }

  if (!satisfactionLevel) {
    setFeedbackError("Feedback % not selected");
    return;
  }


 
  const feedbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/list-results?UserID=${encodeURIComponent(userId)}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // ⬅️ Send token in header
    },
  }
);

  if (!feedbackResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await feedbackResponse.json();

  if (Array.isArray(data.files) && data.files.length > 0) {
    setResult(data.files);
    reportIds = data.files.map(item => item.reportId);
    }
    else{
      reportIds = []
    }

  if (!Array.isArray(reportIds) || reportIds.length === 0) {
    setFeedbackError("No report IDs to submit feedback for.");
    return;
  }

  const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/get-feedback-by-user/${userId}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // ⬅️ Send token in header
    },
  }
);

 
  if (!response1.ok) {
    throw new Error("Failed to fetch feedback data");
  }
 
  const data1 = await response1.json();
  const feedbackList = data1.feedback || [];
  const feedbackReportIds = feedbackList.map(fb => fb.ReportId);
  const reportIdsToSubmit = reportIds.filter(rid => !feedbackReportIds.includes(rid));

  if (!Array.isArray(reportIdsToSubmit) || reportIdsToSubmit.length === 0) {
    setFeedbackError("All feedbacks already submitted.");
    return;
  }

  const reportId = reportIdsToSubmit[0];

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submit-feedback`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ⬅️ Include token in Authorization header
      },
      body: JSON.stringify({
        userId,
        reportId,
        satisfactionLevel,
        createdBy,
      }),
    });

    const result = await response.json();
    console.log(`✅ Feedback submitted for reportId ${reportId}:`, result.message);

    // ✅ Remove used reportId from array & save back
    reportIds.shift(); // remove first

    setSnackbarMessage(result.message);
    setSnackbarOpen(true);
    setChecked(false);
    setFeedbackValue("");

    setState((state) => ({
      ...state,
      completed: false,
      startAnalysis: true,
      feedbacktable: false,
      feedbackVisible: false,
      headingvisible: false,
    }));
  } catch (error) {
    console.error(`❌ Error submitting feedback:`, error);
    setFeedbackError("Failed to submit feedback.");
  }
};





  const fetchFeedbackStatus = async () => {
    // try {
    //   const userAttributes = await latestUserAttributes();
    //   // console.log(userAttributes);
    //   setLatestFeedbackcount(userAttributes);

    //   const feedbackString = userAttributes['custom:Userfeedback'];
    //   const feedbackStatus = userAttributes['custom:LatestFeedback'];
    //   // if (feedbackStatus === "1") {
    //   //   setState((prevState) => ({ ...prevState, feedbackVisible: false }));
    //   // }
    //   // if (!feedbackString) {
    //   //   setState(prevState => ({ ...prevState, feedbackVisible: false,headingvisible:true }));
    //   //   return; 
    //   // }
    //   const email = userAttributes['email'];
    //   const emailPrefix = email.split('@')[0];

    //   const feedbackEntries = feedbackString.split(';').filter(entry => entry !== "");

    //   const processedFeedbackData = feedbackEntries.map(entry => {
    //     const [customFeedback, percentage] = entry.split('-');
    //     const timestamp = customFeedback;
    //     // console.log(timestamp)
    //     return {
    //       customFeedback: `${emailPrefix}_${customFeedback}`,
    //       percentage,
    //       timestamp
    //     };
    //   });


    //   const sortedFeedbackData = processedFeedbackData.sort((a, b) => {

    //     const dateA = convertTimestamp(a.timestamp);
    //     const dateB = convertTimestamp(b.timestamp);
    //     return dateB - dateA;
    //   });

    //   setFeedbackData(sortedFeedbackData);

    //   if (feedbackStatus === "1") {
    //     setState(prevState => ({ ...prevState, feedbackVisible: false, feedbacktable: true, headingvisible: true }));
    //   } else {
    //     setState(prevState => ({ ...prevState, feedbackVisible: true, feedbacktable: true, headingvisible: true }));
    //   }
    // } catch (error) {
    //   console.error('Error fetching user attributes:', error);
    // }
  };

  // useEffect(() => {
  //   fetchFeedbackStatus();
  // }, []);

  const convertTimestamp = (timestamp) => {
    if (!timestamp) {

      return null;
    }
    const [datePart, timePart] = timestamp.split('_');

    const day = parseInt(datePart.slice(0, 2), 10);
    const month = parseInt(datePart.slice(2, 4), 10) - 1; // months are 0-based
    const year = parseInt(datePart.slice(4, 6), 10); // Assuming year is in 2000s
    const hour = parseInt(timePart.slice(0, 2), 10);
    const minute = parseInt(timePart.slice(2, 4), 10);
    const second = parseInt(timePart.slice(4, 6), 10);
    const dateObject = new Date(year, month, day, hour, minute, second);
    // console.log(dateObject,"Akash")
    return dateObject;
  };




  const getFeedbackValue = (feedback) => {
    if (feedback) {
      const parts = feedback.split('-');
      return parts.length > 1 ? parts[1] : 'N/A';
    }
    return 'N/A';
  };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setFeedbackValue("");
  };
  const recordAgainHandler = () => {
    setState((state) => ({ ...state, completed: false, record: true }));
  };

  const [result, setResult] = useState([]);
  // const [reportss, setReportss] = useState([]);
  const [s3Files, s3SetFiles] = useState([]);


  // const checkResults = () => {

  //   const userInfo = getUserInfo();
  //   let id = userInfo?.userId;
  //   const folderName = getUserFolderName();
  //   s3.listObjects({ Prefix: folderName }, function (err, data) {
  //     if (err) {
  //       return alert('There was a brutal error viewing your album: ' + err.message);
  //     } else {
  //       handlerLogs(`checkResults > ` + JSON.stringify(data));
  //       const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  //       let r = [];
  //       sortedContents.forEach((val) => {
  //         if (val.Key && val.Key.endsWith('.pdf')) { // Only include PDF files
  //           r.push(val.Key);
  //         }
  //       });

  //       if (r.length) {
  //         setResult([...r]);
  //       }
  //     }
  //   });
  //   setState((state) => ({ ...state, completed: false, view: true, startAnalysis: false, submitted: false, recording: false, feedbacktable: false, headingvisible: false, feedbackVisible: false, record: false }));
  // };

    let reportIdQueue = []; 
const checkResults = async () => {
  const UserID = localStorage.getItem("number");

  if (!UserID) {
    alert("UserID is missing.");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/list-results?UserID=${encodeURIComponent(UserID)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        alert("Session expired. Log in to continue.");
      }
      return;
    }

    const data = await response.json();

    if (Array.isArray(data.files) && data.files.length > 0) {
      const files = data.files.map((item) => ({
        name: item.name,
        reportId: item.reportId,
      }));

      setResult(files);

      // Store report IDs if needed later
      const reportIds = files.map((item) => item.reportId);
      localStorage.setItem("reportIds", JSON.stringify(reportIds));
    } else {
      setResult([]);
    }

    handlerLogs(`checkResults > ${JSON.stringify(data)}`);
  } catch (err) {
    console.error("Error fetching results:", err);
    alert("Failed to fetch result files.");
  }

  // Update UI state
  setState((state) => ({
    ...state,
    completed: false,
    view: true,
    startAnalysis: false,
    submitted: false,
    recording: false,
    feedbacktable: false,
    headingvisible: false,
    feedbackVisible: false,
    record: false,
  }));
};




  const backtoStart = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true }));
    setChecked(false)
  };

  const backtoTable = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true, headingvisible: false, feedbacktable: false, feedbackVisible: false }));
    setChecked(false)
     setFeedbackValue("");
  };


  const backtoStartFromRecord = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true, record: false }));
  };

  useEffect(() => {
    if (state.recording) {
      startRecording();
    }
  }, [state.recording]);

  useEffect(() => {
    if (state.completed) {
      listenerRecording()
    }
  }, [state.completed]);

  const startRecording = () => {
    if (mediaRecorder && !state.recording) {
      mediaRecorder.start();
      handlerLogs('Recording started');
      setState((prevState) => ({
        ...prevState,
        recording: true,
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && state.recording) {
      mediaRecorder.stop();
    }
    setState((state) => ({
      ...state,
      startAnalysis: false,
      record: false,
    }));
  };

  const listenerRecording = () => {
    if (state.completed) {
      const url = URL.createObjectURL(state.audioFile);
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      document.getElementById("myrecords").appendChild(audio);
      handlerLogs('listener Recording Appended');
    }

  }

  const onButtonClick = (key) => {
    // Parameters for downloading object
    // const params = {
    //   Bucket: albumBucketName,
    //   Key: key,
    // };

    // Generate a pre-signed URL for the object
    // s3.getSignedUrl('getObject', params, (err, url) => {
    //   if (err) {
    //     handlerLogs('getSignedUrl Error' + err);
    //   } else {
    //     // Download the object using the generated URL
    //     window.open(url, '_blank');
    //   }
    // });
  };
  const checkHandler = () => {
    setChecked(!isChecked);
  };

  const ReportActivity = () => {
    checkResults()

  }

  return (
    <div className="App" style={{ paddingBottom: '80px', overflowY: 'auto' }}>

      < Header checkResults={checkResults} feedbackHandler={feedbackHandler} />
      {/* first page */}
      {state.startAnalysis ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Welcome { }</h1>
            <div className="para">
              Experience unparalleled insights of your happiness index  with our advanced Speech Analysis AI and Machine Learning Technology! Empower yourself to take the next steps towards a happier, more fulfilling life.
            </div>

            <div className="tacbox" style={{ marginTop: "20px" }}>
              <input
                className="checkbox-class"
                type="checkbox"
                checked={isChecked}
                onChange={checkHandler}
              />
              <label for="checkbox">
                {' '}
                I read and agree to the attached
                {/* <a href='https://amplify-braininelprod-dev-77a7c-deployment.s3.ap-south-1.amazonaws.com/consent.pdf' target="_blank"

                >
                  Consent
                </a> file{' '} */}


              </label>
            </div>

            <Tooltip
              title={!isChecked ? 'Please accept the terms and conditions' : null}
            >

              <button className="button" onClick={analysisHandler} disabled={!isChecked}>
                Click To Start
              </button>



            </Tooltip>

            <button className="button-secondary" onClick={checkResults}>
              Reports
            </button>
            <br />


            <button className="button" onClick={feedbackHandler} style={{ margin: "20px auto" }}>
              Feedback
            </button>
          </div>

          <div></div>
        </div>
      ) : null}

      {/* 2nd page */}
      {state.record ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">{headingText}</h1>
            <div className="para">
              {state.recording ? (<p></p>) : (
                <p>Kindly Allow the microphone to access. Click on the 'Allow' button and read the text. Once done, you can click the 'Stop' button. </p>
              )}
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

                  <div className="para2">READ ALOUD THE FOLLOWING LINES....</div>
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
                <div className=""></div>
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
                      // recordHandler();
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
                  Allow
                </button>

              )}
              {/* <button className="button" onClick={backtoStartFromRecord}>
                {' '}
                Close
              </button> */}
            </div>
          </div>
        </div>
      ) : null}

      {/* 3rd page */}
      {state.completed ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Recording Complete</h1>
            <div className="para">
              Your speech is ready for testing, please listen to it. If not
              audible, please record it again.
            </div>
            <div id='myrecords'></div>
            <audio id="audioEle" className="audio" />
            <div>
              <button className="button-secondary" onClick={recordAgainHandler}>
                Record Again, if not Audible
              </button>
              <br />

              {/* <button className="button-secondary" onClick={checkResults} style={{ marginTop: "5px" }}>
                Reports
              </button> */}

              <button className="button" onClick={submitHandler}>
                Submit for pdf report generation
              </button>


            </div>

          </div>
          <div></div>
        </div>
      ) : null}

      {/* {latesfeedbackcount === "1" && (
        <div>
          <p>Feedback has been submitted</p>
        </div>
      )} */}
      {state.headingvisible && (


        <h1 component="legend" className="head">Feedback on Report</h1>
      )}




      {state.feedbackVisible && (
        <div className="feedback-section" >
          <FormControl component="fieldset">

            <RadioGroup
              aria-label="feedback"
              name="feedback"
              value={feedbackValue}

              onChange={handleFeedbackChange}
              row
            >
              <FormControlLabel value="20" control={<Radio />} label="20%" />
              <FormControlLabel value="40" control={<Radio />} label="40%" />
              <FormControlLabel value="60" control={<Radio />} label="60%" />
              <FormControlLabel value="80" control={<Radio />} label="80%" />
            </RadioGroup>
            {feedbackError && <p className="error" style={{ color: "red" }}>{feedbackError}</p>}
          </FormControl>

          <button className="button" onClick={submitfeedbackhandler}>
            Submit
          </button>

        </div>
      )}

      {state.feedbacktable && (
        <div >
          {/* <h3>Feedback Table</h3> */}
          <div style={{ display: "flex", justifyContent: "center" }}>

            <table className='table table-striped table-bordered table-hover'>
              <thead className="thead-dark">
                <tr>
                  <th>Report</th>
                  <th>Satisfaction Level</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.map((feedback, index) => (
                  <tr key={index}>
                <td>{feedback.Report}</td>
                <td>{feedback.SatisfactionLevel}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="button" onClick={backtoTable}>
            {' '}
            Close
          </button>
        </div>

      )}



      {/* 4th page */}
      {state.submitted ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Check Your Reports</h1>
            <div className="para">
              Wait for 10 minutes for the report.
            </div>
            <button className="button" onClick={checkResults} style={{ marginTop: "10px" }}>
              Reports
            </button>
            {feedbackbuttonenable ? (<button className="button-secondary" onClick={feedbackHandler} style={{ margin: "20px auto" }}>
              Feedback
            </button>) : null}


            <button className="button" onClick={closeHandler} style={{ marginTop: "41px" }}>
              Close
            </button>
          </div>
          <div></div>
        </div>
      ) : null}
      {state.view ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Click to Check the PDF Report</h1>
            <button className="button" onClick={backtoStart}>
              {' '}
              Close
            </button>
            <div style={{ fontFamily: 'Proxima' }}>
              {result.length === 0 && <p>No records found!</p>}

{/* {result.length > 0 &&
  result.map((r, index) => (
    <p key={index}>
      <a
        className="custLabel"
        href={`${process.env.REACT_APP_API_URL}${r.url}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {r.name || r.url.split("/").pop()}
      </a>
      <span style={{ marginLeft: "10px", fontSize: "12px", color: "#777" }}>
      </span>
    </p>
  ))} */}
{result.length > 0 &&
  result.map((r, index) => (
    <p key={index}>
      <a
        className="custLabel"
        href={`${process.env.REACT_APP_API_URL}/api/download-report?userId=1&reportId=${r.reportId}`}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        {r.name || `Report ${index + 1}`}
      </a>
    </p>
  ))}

            </div>

          </div>
          <div></div>
        </div>
      ) : null}


      <Footer />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
}

export default RecorderPage;
