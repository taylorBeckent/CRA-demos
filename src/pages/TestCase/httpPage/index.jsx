import React from 'react';
import Header from "./Header";
import Request from './Request';
import Response from './Response';

const HttpPage = () => {
    return (
        <div>
            <Header/>
            <Request/>
            <Response/>
        </div>
    );
};

export default HttpPage;
