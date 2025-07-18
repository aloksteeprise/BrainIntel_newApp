import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Appside from '../../layout/Appside/Appside';
import { Typography, TextField, Button } from '@mui/material';
import HeaderLogin from '../../layout/Header/HeaderLogin';
import Helplink from '../../layout/Header/HelpLink';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import InstructionPage from './InstructionPage';
import Footer from '../../layout/Footer/Footer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import StyledInput from '../../layout/TextInput';
import config from '../../translation/config.ts';
import { login,handleSignOut,handlerLogs } from '../../service/Authservice';
import {withAuthenticator } from '@aws-amplify/ui-react';
import MailOutlineIcon from '@mui/icons-material/MailOutline';


import './Login.scss';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUserName] = React.useState('');
  const [password, setpassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState('login');
  const [isChecked, setChecked] = React.useState(false);
  const [unauthError, setUnauthError] = React.useState('');

  localStorage.clear();
  handleSignOut();
  React.useEffect(() => {
    setError(false);
  }, []);



  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const redirectForgot = () => {
    setPage('forgot');
  };

  const redirectRegister = () => {
    setPage('signup');
  };
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const redirectAuthenticator = async (e) => {
    e.preventDefault();
    if (username.length === 0 || password.length === 0) {
      
      setError('Please fill in both the fields');
    }

    else if (!validateEmail(username)) {
      
      setError('Invalid email');
      return false;
    } else {
      setChecked(true);
      try {
        setError('');
        
        const response = await login(username, password);
        setUnauthError('');
        let isResult = '0';
        let isResultMessage = '';
  
        if (response) {
          const parts = response.split('-');
          isResult = parts[0];
          isResultMessage = parts[1] || 'An unexpected error occurred'; // Provide a default error message if undefined
        }
  
        if (isResult === '1') {
          const logMessage = 'Successful login';
          handlerLogs(logMessage);
          
          navigate('/record');
          localStorage.setItem('login', true);
        } else {
          if (isResultMessage === 'Email id is not verified.') {
            setError(isResultMessage);
            setUnauthError('Email id is not verified');
          } else {
            setError(isResultMessage);
            setUnauthError('');
          }
          setChecked(false);
          handlerLogs(isResultMessage);
        }
      } catch (error) {
        setChecked(false);
        localStorage.setItem('login', '');
        
        if (username.length === 0 || password.length === 0) {
          
          setError('Please fill in both the fields');
        } else {
          const errorMessage = error?.message || 'An unexpected error occurred';
          setError(errorMessage);
          handlerLogs(errorMessage);
        }
      }
    }
  };
  

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleKeyDown = (event) => {
    // if(event.keyCode==32){

    //   event.preventDefault();
    // } 
};
const validateEmailAdress=(event)=> {
  navigate('/ValidateEmail');
}
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Appside />
        </Grid>
        {page === 'login' ? (
          <Grid item xs={12} sm={6} className='mobile-height'>
            <Typography mt={15}>
              <HeaderLogin />
            </Typography>
            <Typography mt={1}>
              <p className="subheading">Beta Version 1.0</p>
            </Typography>
            <Typography mt={4}>
              <p className="subheading">{config.loginSubheading}</p>
            </Typography>
            {error ? <p className="error-stmt">{error}</p> : null}
            {unauthError ?
            <a href="#" onClick={validateEmailAdress}>
                             <p style={{textAlign:'center'}}>Validate Email</p>
                        </a>:null}
            <Typography sx={{ justifyContent: 'center', display: 'flex' }}>
              <StyledInput
                id="outlined-basic"
                label="Email"
                variant="outlined"
                value={username}
                required
                onChange={(ev) => setUserName(ev.target.value)}
                // onKeyDown={handleKeyDown}
                InputProps={{
                  endAdornment: <InputAdornment />
                }}
              />
             
            </Typography>
            <Typography
              mt={2}
              sx={{ justifyContent: 'center', display: 'flex' }}
            >
              <StyledInput
                id="outlined-basic-password"
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                // onKeyDown={handleKeyDown}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {showPassword ? (
                        <VisibilityOff onClick={() => setShowPassword(false)} />
                      ) : (
                        <Visibility onClick={() => setShowPassword(true)} />
                      )}
                    </InputAdornment>
                  ),
                  inputProps: {
                    maxLength: config.passwordmaxlenght
                  }
                }}
                onChange={(ev) => setpassword(ev.target.value)}
                value={password}
                required
              />
            </Typography>

            {/* <div  className='footernote' >
                        {config.loginFooter}<br/> {config.continuedFooterNote}
                        <a href="#" style={{display: 'contents'}}>{config.loginPrivacyPOlicy}</a>
                    </div>  */}
            <Typography
              className="button-container"
              mt={2}
              sx={{ display: 'flex', justifyContent: 'space-evenly' }}
            >
             <a
                href="#"
                onClick={redirectForgot}
                style={{ position: 'relative', right: '8px' }}
              >
                {config.loginForgotPassword}
              </a>
              <PrimaryButton
                variant="contained"
                className="buttonPrimarylogin"
                onClick={redirectAuthenticator}
                 disabled={isChecked}
              >
                {config.loginButton}
              </PrimaryButton>
              
            </Typography>
            <div className="no-account" onClick={redirectRegister}>
              {' '}
              {config.loginAccount} <a href="#">{config.loginContactUS}</a>
            </div>
            {/* <Footer style="75px" /> */}
          </Grid>
        ) : page === 'signup' ? (
          <Registration setPage={setPage} />
        ) : page === 'forgot' ? (
          <ForgotPassword setPage={setPage} page={page} />
        ) : page === 'link' ? (
          <InstructionPage />
        ) : null}
      </Grid>
    </Box>
  );
};

export default Login; // withAuthenticator(Login);
