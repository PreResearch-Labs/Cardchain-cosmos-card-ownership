const fetch = require('node-fetch');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
require('dotenv').config({path: '.env' })

const addresses = []

module.exports = async (req, res, next) => {
    try {
        const data = req.body;
        if (!await isValidToken(data.token)) {
            res.status(401).json({ message: "Error captcha" });
            return;
        }
        if (addresses.includes(data.address)) {
            res.status(402).json({ message: "Already got tokens." });
            return;
        } else {
            addresses.push(data.address);
        }
        console.log(data);
        const line = await claimToken(data.address);
        if (line === 'None') {
            res.status(403).json({ message: "Probably the incorrect address" });
            return;
        }
        console.log(line);
        res.status(200).json({ result: line });

    } catch (err) {
        return next(err);
    }
};

async function claimToken(address) {
    try {
        const cmd = await exec(`Cardchain tx cardchain createuser ${address} newUser --from faucet --gas auto --node=${process.env.RPC_NODE} -y`);
        const data = cmd.stdout.toString().split('\n');
        for (let line of data) {
            if (line.includes('txhash:')) {
                 return line;
             }
        }
    } catch (e) {
        console.log(e);
        return 'None';
    }
    return 'None';
}

async function isValidToken(token) {
    const params = new URLSearchParams();
    params.append('secret', process.env.SECRET_KEY)
    params.append('response', token)

    const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        body: params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    const json = await response.json();
    const { success } = json;
    return success;
}
