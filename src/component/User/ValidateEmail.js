import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Typography, TextField, Button } from '@mui/material';
import StyledInput from '../../layout/TextInput';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import HeaderLogin from '../../layout/Header/HeaderLogin'
import Helplink from '../../layout/Header/HelpLink';
import Footer from '../../layout/Footer/Footer';
import config from '../../translation/config.ts';
import { validateEmailSendOtp,handlerLogs } from '../../service/Authservice';
import './Login.scss';



const ValidateEmailAddress = (props) => {

    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    // const {setPage, page} = props;
    const [errMailMessage, setErrorMailMessage] = React.useState('');
    const [isRequiredMessage, setIsRequiredmsg] = React.useState(false);
    const [signupErrorMesageshow, setSignupErrormsgShow] = React.useState(false)
    const [signupErrorMesage, setSignupErrormsg] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('items', JSON.stringify(email));
    }, [email]);


    // React.useEffect(() => {
    //     setPage(page)
    // },[page])

    React.useEffect(() => {

        setEmail('');
        setIsRequiredmsg('');
        setErrorMailMessage('');
        setSignupErrormsg('');
        setSignupErrormsgShow('');
    }, [])

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const checkValidation = async () => {
        if (email.length === 0) {

            setIsRequiredmsg(true);
        }

        else if (!(validateEmail(email))) {

            setErrorMailMessage('Invalid email');
            setIsRequiredmsg(false);

        }
        else if (signupErrorMesage.length > 0) {
            setErrorMailMessage('');
            setIsRequiredmsg(false);
            setSignupErrormsgShow(true)
        }


        else {
            setIsRequiredmsg(false);
            setSignupErrormsgShow(false);
            const Result = await validateEmailSendOtp(email);

            let isResult = '0';
            let isResultMessage = '';
            if (Result) {
                isResult = Result.split('-')[0];
                isResultMessage = Result.split('-')[1];
            }
            if (isResult == '0') {
                setErrorMailMessage(isResultMessage);
                handlerLogs(email + isResultMessage);
            }
            else {
                setErrorMailMessage('')
                //setPage('link')
                handlerLogs(email +' '+ isResultMessage);
                navigate('/ValidateEmailOtp');
            }
        }
    }

    const forgotPassword = async (ev) => {

        ev.preventDefault();
        try {
            checkValidation();

        }
        catch (err) {
            console.error('error', err);
            setSignupErrormsg(err.response.data.message);
        }
    }

    const backtoLogin = () => {
      navigate('/login')
    }
    const handleKeyDown = (event) => {
        if (event.keyCode == 32) {
            event.preventDefault();
        }

    };

    return (
        <Grid xs={12} sm={6} >
            <Typography mt={20}>
                <HeaderLogin />
            </Typography>
            <Typography mt={10}>
                <p className='subheading'>{config.onupdatePasswordLogin}</p>
            </Typography>
            {

                isRequiredMessage ?
                    <Typography mt={2}>
                        <p style={{ fontSize: 'medium', color: 'red', justifyContent: 'center', display: 'flex' }}>Please fill in all the fields</p>
                    </Typography>
                    : signupErrorMesageshow ?
                        <Typography mt={2}>
                            <p style={{ fontSize: 'medium', color: 'red', justifyContent: 'center', display: 'flex' }}>{signupErrorMesage}</p>
                        </Typography>
                        : errMailMessage.length > 0 ?
                            <Typography>
                                <p style={{ fontSize: 'medium', color: 'red', justifyContent: 'center', display: 'flex' }}>{errMailMessage}</p>
                            </Typography> : null

            }
            <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
                <StyledInput id="outlined-basic" label="Email" variant="outlined" onKeyDown={handleKeyDown} onChange={(ev) => setEmail(ev.target.value)}
                    value={email} style={{ width: '315px' }} required />
            </Typography>
            <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
                <Button variant='oulined' startIcon={<ArrowBack />} color="#333E5B" style={{ marginRight: '150px' }}
                    onClick={backtoLogin}>Back
                </Button>
                <PrimaryButton variant='contained' className='buttonPrimarylogin' onClick={forgotPassword}
                >{config.resendOTPButton}
                </PrimaryButton>
            </Typography>
            <Footer style='172px' />

        </Grid>
    )
}

export default ValidateEmailAddress;
