
export const getStreamDevice = async ({ type }) => {
    return new Promise(async (resolve) => {

        let isHandled = false;

        // timeout 8s
        setTimeout(() => {
            if (!isHandled) {
                isHandled = true;
                resolve("timeout");
            }
        }, 8000);

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === "camera",
                audio: type === "micro"
                    ? {
                        echoCancellation: true,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                    : false
            });

            // Nếu là MIC thì TĂNG GAIN
            if (type === "micro") {
                const boostedStream = boostMicroStream(stream);  // <<< TĂNG GAIN tại đây

                if (!isHandled) {
                    isHandled = true;
                    resolve(boostedStream);
                }
                return;
            }

            // Nếu camera thì trả về bình thường
            if (!isHandled) {
                isHandled = true;
                resolve(stream);
            }

        } catch (err) {
            if (!isHandled) {
                isHandled = true;
                resolve("reject");
            }
        }
    });
};


export const getStreamMedia = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    });

    return stream;
}

function boostMicroStream(originalStream) {
    const audioContext = new AudioContext();

    // track gốc
    const source = audioContext.createMediaStreamSource(originalStream);

    // tạo gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 3.5;   // tăng 350% (bạn muốn 5x thì để 5)

    // pipeline: source -> gain -> dest
    const dest = audioContext.createMediaStreamDestination();

    source.connect(gainNode);
    gainNode.connect(dest);

    // dest.stream là stream mới đã được boost
    return dest.stream;
}