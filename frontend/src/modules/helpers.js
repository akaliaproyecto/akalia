const cookie = require('cookie');

exports.getUpdatedHeaders = (req) => {
    let headers = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };
    headers.cookie = req.headers.cookie || "";
    return headers
}

exports.setCookie = (response, res) => {
    if (response.headers["set-cookie"]) {
        const cookies = response.headers['set-cookie'].map((c) => cookie.parse(c));
        cookies.forEach((c) => {
            res.cookie(Object.keys(c)[0], Object.values(c)[0], {
                httpOnly: false,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ahora front y back están bajo el mismo host lógico
            });
        });
    }
}