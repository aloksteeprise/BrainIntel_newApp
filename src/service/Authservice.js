import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { fetchAuthSession, getCurrentUser, signIn, signOut, verifyTOTPSetup, signUp,confirmSignUp,updateUserAttributes,currentAuthenticatedUser  } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk';
import awsconfig from '../aws-exports';
import {withAuthenticator } from '@aws-amplify/ui-react'
import { confirmResetPassword ,resendSignUpCode,updatePassword,sendUserAttributeVerificationCode,updateUserAttribute,fetchUserAttributes } from 'aws-amplify/auth';

import { resetPassword as awsResetPassword  } from 'aws-amplify/auth';
Amplify.configure(awsconfig, {ssr: true})


var albumBucketName = 'amplify-brainintel1-dev-59877-deployment';
var bucketRegion = 'ap-south-1';
var IdentityPoolIdt = 'ap-south-1:3b01329c-a976-4e4e-a0f5-70a53b026882';

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

function decodeJWT(token) {
  if (!token) return;
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace;
}

const host = 'https://velocite.link/';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    const data = await response.json();

    localStorage.setItem('token', data.token)
    
    console.log("Backend response:", data); 


    // console.log("Status:", response.status);
    // console.log("Response:", data);

    // console.log(response.data,)

    if (response.ok) {
      localStorage.setItem('number', data.userId);
      console.log('Login simulated successfully');
      const userObject = { userId: email, email: email };
      localStorage.setItem('userObject', JSON.stringify(userObject));
      return `1-${email}`;
    }
    if (data?.message === "Email not verified yet. Please verify your email address first.") {
      console.warn("Email is not verified.");
      return '0-Email id is not verified.';
    }

    if (data?.message === "Invalid email or password") {
      console.warn("Invalid credentials.");
      return '0-Invalid username and password.';
    }

    console.warn("Login failed with unknown reason.");
    return `0-${data?.message || "Login failed"}`;

  } catch (error) {
    console.error("Network or fetch error:", error);
    return `0-${error.message}`;
  }
};



export const verifyEmail = async (email, verificationCode) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        otp: parseInt(verificationCode)
      })
    });
    return response;
};

export const resendSignUp = async (username) => {
  try {
   
    //await resendSignUpCode({email: username});
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username }),
    });

    const data = await response.json();
    console.log('Confirmation code resent successfully'); 
  } catch (error) {
    console.error('Error resending confirmation code:', error);
  }
};

export const validateEmailSendOtp = async (username) => {
  let result = '';
  try {
   
     //result = await resendSignUpCode({username});
     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username }),
    });

    const data = await response.json();

    result = '1-'+ data.message;
    console.log('Confirmation code resent successfully'); 
   
  } catch (error) {
    result = '0-'+ error.message;
    console.error('Error resending confirmation code:', error);
  }
  return result;
};
export const userAttributeVerificationCode = async (email, verificationCode) => {
  let result;
  try{
    await updateUserAttribute(email,verificationCode);
    result = '1-'+'Success';
  }
  catch(error){
    result = '0-'+ error.message;
  }
  return result;
};
// Define the handleConfirmResetPassword function

export const handleConfirmResetPassword = async (username, otp, password) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-forgot-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: username,
      otp: otp,
      newPassword: password
    })
  });

  const data = await response.json();
  return { success: response.ok, message: data.message };
};


export const handleUpdatePassword = async (oldPassword, newPassword) => {
  const userString = localStorage.getItem('userObject');
  const user = userString ? JSON.parse(userString) : null;
   const token = localStorage.getItem('token');

  let isPasswordChangeDone = '';

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        email: user?.email,
        currentPassword: oldPassword,
        newPassword: newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      isPasswordChangeDone = '0-' + (data.message || 'Something went wrong');
    } else {
      isPasswordChangeDone = '1-' + (data.message || 'Password updated successfully');
    }

    return isPasswordChangeDone;
  } catch (err) {
    isPasswordChangeDone = '0-' + err.message;
    return isPasswordChangeDone;
  }
};



export const register = async (email, password) => {
 
 const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
        createdBy:"admin"
      })
    });

    
  const data = await response.json();
    if (response.ok) {
    return true;
  } else {
    throw new Error(data?.message || "Registration failed");
  }
};
//   const response = await signUp({
//     username: email, // Assuming email as the username
//     password: password,
//     attributes: {
//         email: email,
//         // given_name: firstName,
//         // family_name: lastName,
     
//     }

     
// }
// );
  

  
  
  /*
  const response = await axios.post(
    `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/register`,
    {
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: password,
    }
  );

  */

//   let result;
//   const userId = response?.userId;
//   if (userId) {
//     result = true;
//   } else {
//     result = false;
//   }

//   return result;
// };




export const resetPassword = async function handleResetPassword(username) {
  let responseMessage = '';

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username }),
    });

    const data = await response.json();

    if (!response.ok) {
      responseMessage = '0-' + (data.message || 'Something went wrong');
    } else {
      // simulate the same as AWS output
      const simulatedOutput = {
        nextStep: {
          resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
          codeDeliveryDetails: {
            deliveryMedium: 'email'
          }
        }
      };

      const message = handleResetPasswordNextSteps(simulatedOutput);
      responseMessage = '1-' + message;
    }
  } catch (error) {
    responseMessage = '0-' + error.message;
    console.error('resetPassword error:', error);
  }

  return responseMessage;
};


export const forgotPassowrd = async (email) => {

  let forgotPassowrdResponse;
  // const response = await axios.post(`${host}users/password-reset-request`, {

  /*
  const response = await axios.post(
    `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/password-reset-request`,
    {
      email: email,
    }
  );
  */
  //const response = await resetPassword({ email });

  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    });

     const data = await response.json();

    if (!response.ok) {
      forgotPassowrdResponse = '0-' + (data.message || 'Something went wrong');
    } else {
      const simulatedOutput = {
        nextStep: {
          resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
          codeDeliveryDetails: {
            deliveryMedium: 'email'
          }
        }
      };
        forgotPassowrdResponse = handleResetPasswordNextSteps(simulatedOutput);
    }
  return forgotPassowrdResponse;
};

function handleResetPasswordNextSteps(output) {
  const { nextStep } = output;
  let forgotPassowrdResponse1;
  switch (nextStep.resetPasswordStep) {
    case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
      const codeDeliveryDetails = nextStep.codeDeliveryDetails;
      forgotPassowrdResponse1 =`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`;
      // Collect the confirmation code from the user and pass to confirmResetPassword.
      break;
    case 'DONE':
      forgotPassowrdResponse1 =`Successfully reset password.`;
      break;
  }
  return forgotPassowrdResponse1
}


// export const resetPassword = async (token, newPassword) => {
//   // const response = await axios.post(
//   //   `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/password-reset`,
//   //   {
//   //     token: token,
//   //     password: newPassword,
//   //   }
//   // );
//   console.log('response');
//   //console.log(response);
// };

export const isAuthenticated = () => {
  const user = localStorage.getItem('userObject');
  if (!user) {
    console.log('authenticate');
    return {};
  }
  return user;
};

export const handleSignOut = async () => {
  try {
     //await signOut();
    localStorage.clear();
  } catch (error) {
    console.log('error signing out: ', error);
    handlerLogs(error.message)
  }
}

export const handlerLogs = async (message) => {
  const loginUser = getLoginUserName();
  const url = window.location.href;
  const body = url +' - '+ loginUser +' - '+ message;
  const date = new Date().toISOString().split('T')[0];
  const LoggerFileName = getLoggerFileName();
  const logFileName = `${LoggerFileName}.txt`;
  const bucketName = albumBucketName  // Replace with your bucket name
  const folderName='Logs'
  
  const params = {
      Bucket: albumBucketName,
      Key: `${folderName}/${logFileName}`,
      Body: `${new Date().toISOString()}: ${body}\n`,
      ContentType: 'text/plain',
      ACL: 'private'
  };

  try {
      // Check if the file already exists
      const existingObject = await s3.getObject({ Bucket: bucketName, Key: params.Key }).promise();
      params.Body = existingObject.Body.toString() + params.Body;
  } catch (err) {
      // File does not exist, proceed with new log
      if (err.code !== 'NoSuchKey') {
          throw err;
      }
  }

  try {
      await s3.putObject(params).promise();
      return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Log written successfully' }),
      };
  } catch (err) {
      return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to write log' }),
      };
  }
};


const getLoginUserName = () => {
  const userInfo =  JSON.parse(localStorage.getItem('userObject'));
  let id ='';
  if(userInfo){
    id = userInfo?.userId;
  }
 return id;
};

const getLoggerFileName=()=>{

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

    let LoggerFileName='Logger'+ dd + mm + yy ;
    return LoggerFileName;
}


export const submitFeedback = async (feedbackValue,userfeedbackcount) => {
  
  try {
   
    const userAttributes= await  handleFetchUserAttributes();
    let userAttribute = userAttributes['custom:Userfeedback'];
   
  if(userAttribute!==undefined && userAttribute.length>0)
    {
      let lastChar = userAttribute.substring(userAttribute.length - 1);
      if(lastChar.includes(';'))
      {
        userAttribute = userAttribute.substring(userAttribute,userAttribute.length - 1);
      }
      userAttribute = userAttribute +';'+feedbackValue;
      if(userAttribute.length>2048){
        console.log('storage has been fulled');
      }
      else{
        await updateUserAttributes({
    
          userAttributes: {
            family_name:feedbackValue,
            ['custom:Userfeedback']: userAttribute,
            ['custom:LatestFeedback']: userfeedbackcount,
            
          }
        });
  
      }
      console.log('Feedback submitted successfully');
      return { success: true, message: 'Feedback submitted successfully' };
    }
    else if(userAttribute == undefined){
      await updateUserAttributes({
    
        userAttributes: {
          family_name:feedbackValue,
          ['custom:Userfeedback']: feedbackValue,
          ['custom:LatestFeedback']: userfeedbackcount
        }
      });
      return { success: true, message: 'Feedback submitted successfully' };
    }
    else{
      return { success: false, message: 'Feedback not submitted' };

    }
    
    
    //console.log(userAttribute.length)
    
  
    
   
     

    
    
  } 
  catch (error) {
    console.log('Error submitting feedback:', error);
    return { success: false, message: 'Error submitting feedback' };
   
  }
};

export const handleFetchUserAttributes = async function () {
  try {
    const userAttributes = await fetchUserAttributes();
    return userAttributes;
   

  } catch (error) {
    console.log(error);
    return null;
  }
}



export const latestUserAttributes = async function () {
  try {
    const userAttributes = await fetchUserAttributes();
    let userAttribute = userAttributes['custom:LatestFeedback'];
    // console.log(userAttributes);
    return userAttributes;
   

  } catch (error) {
    console.log(error);
  }
}


// export const submitLatestFeedback = async (feedbackValue) => {
//  
//   try {
//       await updateUserAttributes({
//         userAttributes: {
//           ['custom:Userfeedback']: feedbackValue
//         }
//       });

//     console.log('Feedback submitted successfully');
//     return { success: true, message: 'Feedback submitted successfully' };
//   } 
//   catch (error) {
//     console.log('Error submitting feedback:', error);
//     return { success: false, message: 'Error submitting feedback' };
   
//   }
// };

export const submitLoginUserAttributeFeedback = async (inputvalue) => {
  
  try {

     updateUserAttributes({
      userAttributes: {
        family_name:inputvalue
    }
  });
  } 
  catch (error) {
    console.log('Error submitting feedback:', error);
    return { success: false, message: 'Error submitting feedback' };
  }

};