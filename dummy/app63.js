//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 
const morgan = require('morgan');
const tourRouter = require('../routes/tourRoutes.js');
const userRouter = require('../routes/userRoutes.js')
const app = express();

// MIDDLEWARES

app.use(morgan('dev'))
app.use(express.json()); 

app.use((req, res, next) => {
    console.log('Hello from teh midlleware👏')
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})


//ROUTES
app.use('/api/v1/tours', tourRouter);  //parent route
app.use('/api/v1/users', userRouter);  //parent route

module.exports = app;