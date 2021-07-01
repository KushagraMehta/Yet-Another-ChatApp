"use strict";

let localmessageInput = document.getElementById("local");
let remotemessageInput = document.getElementById("remote");

let localMessageArea = document.getElementById("localmsg");
let remoteMessageArea = document.getElementById("remotemsg");

localmessageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    addChildMessage(localMessageArea, event.target.value, "right");
    localChannel.send(event.target.value);
    event.target.value = "";
  }
});

remotemessageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    addChildMessage(remoteMessageArea, event.target.value, "right");
    remoteChannel.send(event.target.value);
    event.target.value = "";
  }
});
function log(...text) {
  console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> ", ...text);
}
let config = null;
// config = {
//   iceServers: [
//     {
//       urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

let localPeer = new RTCPeerConnection(config);
let remotePeer = new RTCPeerConnection(config);
let localChannel = localPeer.createDataChannel("chat");
let remoteChannel = null;

async function init() {
  localPeer
    .createOffer()
    .then((localSDP) => localPeer.setLocalDescription(localSDP))
    .then(() => remotePeer.setRemoteDescription(localPeer.localDescription))
    .then(() => remotePeer.createAnswer())
    .then((remoteSDP) => remotePeer.setLocalDescription(remoteSDP))
    .then(() => localPeer.setRemoteDescription(remotePeer.localDescription))
    .catch((err) => window.alert(err));
}

localPeer.onconnectionstatechange = () => log("Local coonnection state: ", localPeer.iceConnectionState);
localPeer.oniceconnectionstatechange = () => log("Local ice connection state: ", localPeer.iceConnectionState);
remotePeer.onconnectionstatechange = () => log("Remote coonnection state: ", remotePeer.iceConnectionState);
remotePeer.oniceconnectionstatechange = () => log("Remote ice connection state: ", remotePeer.iceConnectionState);

init();

localPeer.onicecandidate = ({ candidate }) => remotePeer.addIceCandidate(candidate);
remotePeer.onicecandidate = ({ candidate }) => localPeer.addIceCandidate(candidate);

localChannel.onmessage = (event) => {
  log("Got message at local side", event);
  addChildMessage(localMessageArea, event.data, "left");
};
localChannel.onclose = () => log("Local Connection close");
localChannel.onerror = (event) => log("Connection error at local side", event);
localChannel.onopen = () => log("Local Connection Openned.!!!");

remotePeer.ondatachannel = (event) => {
  remoteChannel = event.channel;
  remoteChannel.onmessage = (event) => {
    log("Got msg at remote side", event);
    addChildMessage(remoteMessageArea, event.data, "left");
  };
  remoteChannel.onclose = (event) => log("Remote Connection close");
  remoteChannel.onerror = (event) => log("Connection error at remote side", event);
  remoteChannel.onopen = (event) => log("Remote Connection Openned.!!!");
};

function addChildMessage(messageDiv, messageData, align) {
  let newMessage = document.createElement("div");
  newMessage.innerHTML = messageData;
  newMessage.align = align;
  if (messageDiv.childNodes.length == 0) {
    messageDiv.appendChild(newMessage);
  } else {
    messageDiv.insertBefore(newMessage, messageDiv.childNodes[0]);
  }
}
