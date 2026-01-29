const crypto = require('crypto');

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

console.log(hashPin('0718'));
