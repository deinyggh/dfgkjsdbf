import express from "express";

const server = express();
const port = process.env.PORT || 3000;
server.all('/', (req, res)=>{
    res.send('Your bot is alive!')
})
function keepAlive(){
    server.listen(port, ()=>{console.log("Server is Ready!")});
}
export default keepAlive;
