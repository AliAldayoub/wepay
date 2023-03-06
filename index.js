const express = require("express");
const app = express();
const cors = require('cors');
const helmet = require('helmet');

const authRoute = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use('/auth',authRoute);


app.get('/',(req,res,next)=> {
    res.send('hello from we pay')
})


app.listen(3000,()=>{
    console.log('heey again on 3000')
})