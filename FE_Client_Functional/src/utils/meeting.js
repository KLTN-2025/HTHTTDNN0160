
export const getStreamDevice = async ({ type, deviceId }) => {
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
                video: type === "camera" ? {
                    deviceId: deviceId
                        ? { exact: deviceId }
                        : undefined
                } : false,
                audio: type === "micro"
                    ? {
                        deviceId: deviceId
                            ? { exact: deviceId }
                            : undefined,
                    }
                    : false
            });

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


export const getTimeHM = () => {
    const now = new Date()
    const h = now.getHours().toString().padStart(2, '0')
    const m = now.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
}