import  express  from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/conn.js";
import router from "./router/route.js";

const app = express();

// middleware 
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); //less hackers know about our stack

const port=8080;

// HTTP GET request
app.get('/', (req, res) =>{
    res.status(201).json("Home GET request");
});

//api routes
app.use('/api', router);

// Start server only we have valid connections

connect().then(() =>{
    try{
        app.listen(port,()=>{
            console.log(`server connected to http://localhost:${port}`);
        });
    } catch(err){
        console.log("Can't connect to server");
    }
}).catch(err =>{
    console.log("Invalid database");
})



