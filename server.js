import express from "express";

const server = express();
const port = process.env.PORT || 3000;
server.all('/', (req, res)=>{
    res.send('Your code is well!')
})
function keepAlive(){
    server.listen(port, ()=>{console.log("I am Ready!")});
}
export default keepAlive;
