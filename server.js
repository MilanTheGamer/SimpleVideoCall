const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static("public"));
let clients = 0;

io.on("connection", (socket) => {
    socket.on("NewClient", () => {
        if(clients < 2){
            if(clients == 1){
                socket.emit("CreatePeer");
            }
        }
        else
            socket.emit("SessionActive");
        clients++;

    })
    socket.on("Offer", SendOffer);
    socket.on("Answer", SendAnswer);
    socket.on("disconnect", Disconnect)
})

function Disconnect(){
    if(clients > 0){
        if(clients <= 2){
            this.broadcast.emit("Disconnect")
        }
        clients--
    }
};

function SendOffer(offer){
    this.broadcast.emit("BackOffer",offer)
}

function SendAnswer(data){
    this.broadcast.emit("BackAnswer",data)
}


http.listen(port, () => {
    console.log(`Server is listening at port ${port}`)
})
