import express from "express";

const server = express();
server.all('/', (req, res)=>{
    res.send('Your code is alive!')
})
function keepAlive(client, token){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
    client.login(token);

}
export default keepAlive;