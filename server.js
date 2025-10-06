const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({path:'./config.env'});
const app = require('./app.js');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose
// .connect(process.env.DATABASE_LOCAL, {
.connect(DB, {
    // useNewParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => {
    // console.log(con.connections);
    console.log('DB connection successful!')
});

// .catch(err => console.log('ERROR'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log( `App running on port ${port}.` )
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION! 💥 Shutting down...')
    server.close(() => {
        process.exit(1);
    })
});



// console.log(x)