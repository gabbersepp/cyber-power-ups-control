const { exec } = require("child_process");
const postgres = require('postgres')
const fs = require("fs");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function execute(cmd) {
    return new Promise(resolve => {
        exec(cmd, (err, stdout, stderr) => {
            resolve({ err, stdout, stderr })
        })
    })
}

async function run() {
    // execute service
    exec("pwrstatd");
    const config = JSON.parse(fs.readFileSync("config/config.json").toString());
    console.log(JSON.stringify(config))
    const sql = postgres(`postgres://${config.user}:${config.pw}@${config.host}:5432/${config.db}`) // will default to the same as psql

    while(true) {
        const result = await execute("pwrstat -status");
        if (!result.err && result.stdout) {
            if (result.stdout.indexOf("lost") > -1) {
                console.error("connection lost");
                exit(2);
            }

            const parsedResult = Array.from(result.stdout.matchAll(/\.{4,} ([^\r\n]+)/g)).map(x => x[1])

            const obj = {
                timestamp: new Date().getTime(),
                state: parsedResult[3],
                powerSupplyBy: parsedResult[4],
                utilityVoltage: parsedResult[5].match(/[0-9]+/)[0],
                outputVoltage: parsedResult[6].match(/[0-9]+/)[0],
                batteryCapacity: parsedResult[7].match(/[0-9]+/)[0],
                remainingRuntime: parsedResult[8].match(/[0-9]+/)[0],
                load: parsedResult[9].match(/[0-9]+/)[0],
                lineInteraction: parsedResult[10],
                testResult: parsedResult[11],
                lastPowerEvent: parsedResult[12]
            }
            
            //console.log(JSON.stringify(obj))

            await sql `
            insert into data
            ${sql(obj)}`
        }
        await sleep(1000);
    }
}

run();