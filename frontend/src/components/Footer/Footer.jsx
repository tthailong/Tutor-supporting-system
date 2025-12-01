import React from 'react';
import './Footer.css';

const Footer = () => {
    
    const hcmutContact = {
        title: "[For HCMUT account, please contact to: Data and Information Technology Center]",
        email: "dl-cntt@hcmut.edu.vn",
        phone: "ĐT (Tel): (84-8) 38647256 - 7200",
    };

    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                </div>          
                <div className="footer-content-center">
                    <h4 className='footer-title'>{hcmutContact.title}</h4>
                    <p className='footer-link'>Email: <a href={`mailto:${hcmutContact.email}`}>{hcmutContact.email}</a></p>
                    <p className='footer-link'>ĐT (Tel): {hcmutContact.phone}</p>
                </div>
                <div className="footer-content-right">
                </div>                
            </div>
            <div className='footer-bottom'>
                <p> © 2025 Copyrights by tthaillong - 4rkiva - Quang1226 - Lunafiah - Mytranha - hcumt - qho244</p>
            </div>
        </div>
    );
}

export default Footer;