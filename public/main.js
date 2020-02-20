let Peer = require('simple-peer');
let socket = io();

const video = document.querySelector('video');
let client = {};

// to get stream
navigator.mediaDevices.getUserMedia({ video:true, audio:true })
.then( stream => {
    socket.emit("NewClient");
    video.srcObject = stream;
    video.play();


    // used to initialize a peer
    function InitPeer(type){
        let peer = new Peer({initiator:(type == "init") ? true : false, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' },{ url: 'stun:stun1.l.google.com:19302' },{ url: 'stun2.l.google.com:19302' },{ url: 'stun.ekiga.net' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] }, stream:stream, trickle:false})
        peer.on("stream", stream => {
            CreateVideo(stream)
        });
        peer.on("close", ()=>{
            document.getElementById("peerVideo").remove();
            peer.destroy()
        });
        return peer;
    };

    // for peer of type init
    function MakePeer(){
        client.gotAnswer = false;
        let peer = InitPeer("init");
        peer.on('signal', (data) => {
            console.log("Makepeer data:",data );
            if(!client.gotAnswer){
                socket.emit("Offer", data);
            };
        });
        client.peer = peer
    };

    // for peer of type not init
    function FrontAnswer(offer){
        let peer = InitPeer("notInit");
        peer.on("signal", (data) => {
            console.log("FrontAnswer data:",data );
            data.name = "Milan",
            console.log(`Data added ${data}`)
            socket.emit("Answer", data)
        });
        peer.signal(offer)
    };

    function SignalAnswer(answer){
        client.gotAnswer = true;
        let peer = client.peer
        peer.signal(answer)
    };

    function CreateVideo(stream){
        let video = document.createElement("video");
        video.id = "peerVideo";
        video.srcObject = stream;
        video.class = "embed-responsive-item";
        document.querySelector("#peerDiv").appendChild(video);
        video.play()
    }

    function SessionActive(){
        document.write("Session Active. Please comeback later")
    }

    
    socket.on("CreatePeer", MakePeer);
    socket.on("BackOffer", FrontAnswer);
    socket.on("BackAnswer", SignalAnswer);
    socket.on("SessionActive", SessionActive);
    

}).catch(error => {
    console.log(error);
});


