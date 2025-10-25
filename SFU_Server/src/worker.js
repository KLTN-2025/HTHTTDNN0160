import pidusage from 'pidusage';

const workerLimit = {
    MAX_USERS: 100,
    MAX_ROUTERS: 5,
}

export const workers = [];

export const createWorkers = async (mediasoup, numberWorkers, optionWorkers) => {
    for (let i = 0; i < numberWorkers; i++) {
        let worker = await mediasoup.createWorker(optionWorkers);
        worker.on("died", () => {
            console.error('Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
            setTimeout(() => process.exit(1), 2000);
        });
        workers.push({
            worker: worker,
            numRouters: 0,
            numUsers: 0,
        });
    }
}

export const findWorkerFeasible = async () => {
    function getLoad(w) {
        const routerLoad = w.numRouters / workerLimit.MAX_ROUTERS;
        const userLoad = w.numUsers / workerLimit.MAX_USERS;
        return (routerLoad + userLoad) / 2;
    }

    const filterWorkers = workers.filter((w) => getLoad(w) < 1);
    return filterWorkers.sort((a, b) => getLoad(a) - getLoad(b))[0].worker;
}