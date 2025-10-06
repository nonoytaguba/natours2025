import axios from 'axios';
import {showAlert} from './alerts'

export const login = async (email, password) => {
    // alert(email, password);
    console.log('hayyyy', email, password)
    try{
        
    const res = await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
            email: email,
            password: password
        }
    });
    // console.log('ressss', res);

    if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);
    }

    }catch(err){
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message) //you will find this here in the Axios documentation Lesson 189
}
};

//this code here transfered to index.js file
// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// });

export const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if(res.data.status = 'success') location.reload(true);
    }catch(err){
        console.log(err.response)
        showAlert('error', 'Error Log logging out! try again.')
    }
}