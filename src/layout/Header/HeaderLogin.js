import config from '../../translation/config.ts';
import * as React from 'react';
import companyLogo from '../../images/bic.jpeg';


const HeaderLogin = () => {
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <img
        
      //   src='https://amplify-braininelprod-dev-77a7c-deployment.s3.ap-south-1.amazonaws.com/bic.jpeg'
        alt="Company Logo"
        style={{
          width: '100px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          marginTop: '-15px', 
        }}
      />
    </div>
  );
};

export default HeaderLogin;
