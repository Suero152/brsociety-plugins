// ==/UserScript==
// Criado por: // ==UserScript==
// @name         BRSociety Custom Message Plugin
// @namespace    https://brsociety.club/
// @version      1.0
// @description  Plugin para enviar mensagens com customização.
// @author       Suero & Anekin
// @match        https://brsociety.club/
// @icon         https://brsociety.club/img/logo.png
// @grant        none
// @license MIT
// ==/UserScript==
// Criado por: https://brsociety.club/users/Suero & https://brsociety.club/users/anekin
// Aproveite o plugin <3



(function () {
    'use strict';

    const colorCode = '#ff2626'

    axios.interceptors.request.use((config) => {
        /** In dev, intercepts request and logs it into console for dev */
        if (config.url == '/api/chat/messages') {

            let message = config.data.message
            if (!message.match('/msg') && !message.match('/gift')) {
                const quoteRegex = /\[quote\](.*?)\[\/quote\]/;
                const match = config.data.message.match(quoteRegex);
                const citation = match ? match[0] : "";
                const messageWithoutCitation = config.data.message.replace(quoteRegex, "").trim();
                const newMessage = `${citation} [color=${colorCode}]${messageWithoutCitation}[/color]`.trim();

                config.data.message = newMessage
            }

        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

})();
