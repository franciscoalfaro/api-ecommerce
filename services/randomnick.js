function generateRandomNick(length) {
    const allowedChars = 'abcdefghijklmnopqrstuvwxyz';
    let randomNick = '';
    for (let i = 0; i < length; i++) {
        randomNick += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    return randomNick;
}

module.exports = {
    generateRandomNick
}