const path = require('path'); //Lesson 176, 3:40
//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // lesson 142 timestamp 0:43
const helmet = require('helmet'); // lesson 144
const AppError = require('./utils/appError');
const mongoSanitize = require('express-mongo-sanitize') //lesson 145
const xss = require('xss-clean') //lesson 145
const hpp = require('hpp'); //lesson 146
const globalErrorHandler = require('./controllers/errorController.js')
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js'); //lesson 155 creating and getting reviews
const bookingRouter = require('./routes/bookingRoutes.js');  //lesson 211
const bookingController = require('./controller/bookingController.js');  //lesson 227
const viewRouter = require('./routes/viewRoutes.js'); //lesson 155 creating and getting reviews
const cookieParser = require('cookie-parser');  //Lesson 189, 14:52
const bodyParser = require('body-parser'); //lesson 227
const compression = require('compression');
const cors = require('cors'); //lesson 226

// Start express app
const app = express();

app.set('view engine', 'pug'); //Lesson 176
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implenent CORS (Cross Origin Resource Sharing) lesson 226
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end naturs.com
// app.use(cors({
// origin: 'https://www.natours.com'
//}))


app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

//Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public'))); //Lesson 176, 4:55

//Set security HTTP headers
// app.use(helmet());

//solution fo showAlert, lesson 191
// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'http:', 'data:'],
//         scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
//         styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
//         imgSrc: ["'self'", 'data:', 'blob:'],
//       },
//     })
//   );



//lesson 189 solution
app.use(function(req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
     "script-src 'self' https://cdnjs.cloudflare.com  https://js.stripe.com/v3/"
  );
  next();
});

//Development logging
// if(process.env.NODE_ENV === 'development'){
//     app.use(morgan('dev'))
// }

//Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api',limiter);

app.post('/webhook-checkout',
     bodyParser.raw({type: 'application/json'}),
     bookingController.webhookCheckout);

//Body parser, reading data from the body into req.body
app.use(express.json({limit: '10kb'})); // parse the data from the body
app.use(cookieParser()); //lesson 189 , 15:49, parse the data from the cookie
app.use(express.urlencoded({extended: true,  limit: '10kb'})) //lesson 195, 8:37
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQuantity',
        'ratingAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));


// app.use((req, res, next) => {
//     console.log('Hello from the midlleware👏')  //remove from lesson 112
//     next();
// })


app.use(compression())

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies) // lesson 189, 16:11
    // console.log(req.headers);
    // console.log(x);
    next();
})

// console.log(x);

//ROUTES
// app.get("/", (req, res) => {
//     res.set("Content-Security-Policy", "default-src 'self'");
//     res.status(200).render("base", {
//         tour: 'The Forest Hiker',
//         user: 'Jonas'
//     });
// });
app.use('/', viewRouter); //Lesson 181, 2:39

app.use('/api/v1/tours', tourRouter);  //parent route
app.use('/api/v1/users', userRouter);  //parent route
app.use('/api/v1/reviews', reviewRouter); //lesson 155 creating and getting reviews
app.use('/api/v1/bookings', bookingRouter) //lesson 211, 1:40


app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err);
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})
// app.all('*', (req, res, next) => {                                            //app.all will handle all the verbs, wethere it is get, put, delete or post
//     next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

//error handling middleware

// app.use((err, req, res, next) => {
//     console.log(err.stack);

//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//     });
// });

app.use(globalErrorHandler);

module.exports = app;











