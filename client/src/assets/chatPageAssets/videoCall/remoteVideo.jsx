import React, { useEffect } from "react"

export default function RemoteVideo({ remoteVideo, socket, pc, strangerUserId }) {

    useEffect(() => {
        async function handelOffer(offer) {
            const remoteDesc = new RTCSessionDescription(offer)
            try {
                await pc.setRemoteDescription(remoteDesc)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)

                console.log("local desc set remote");

                socket.emit("answer", {
                    answer: answer,
                    to: strangerUserId
                })

                console.log("answer send.", answer)
            } catch (err) {
                console.log("error in creating answer or setting remoteDesc", err)
            }
        }

        if (socket) {
            socket.on("offer", handelOffer)
        }

        return() => {
            if (socket) {
                socket.off("offer")
            }
        }
    }, [strangerUserId])

    useEffect(() => {
        async function handelAnswer(answer) {
            const remoteDesc = new RTCSessionDescription(answer)
            try {
                await pc.setRemoteDescription(remoteDesc)
                console.log("recived answer", remoteDesc)
            } catch (err) {
                console.log("err srtting remoteDesc", err)
            }
        }

        if (socket) {
            socket.on("answer", handelAnswer)
        }

        return () => {
            if (socket) {
                socket.off("answer")
            }
        }
    }, [pc])

    useEffect(() => {
        if (pc) {
            pc.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams
                remoteVideo.current.srcObject = remoteStream

                console.log("working on remote stream")
            })
        }
    }, [pc])

    return <video ref={remoteVideo} autoPlay playsInline controls={false}></video>
}