// ==UserScript==
// @name         BRSociety Custom Message Plugin
// @namespace    https://brsociety.club/
// @version      2.0
// @description  Plugin para enviar mensagens com customização.
// @author       Suero & Anekin
// @match        https://brsociety.club/
// @icon         https://brsociety.club/img/logo.png
// @grant        none
// @license      MIT
// ==/UserScript==
// Criado por: https://brsociety.club/users/Suero & https://brsociety.club/users/anekin
// Aproveite o plugin <3

(function () {
    'use strict';

    const _config = {
        // Main color which will be automatically applied. ( Won't be applied if any other mode is enabled)
        colorCode: '#ff2626',
        gradientMode: {
            enabled: true,
            startColor: '#ba0000',
            endColor: '#7d0000'
        }

    }

    // Function required by rgbToHex
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    // Converts RGB into HEX
    function rgbToHex(colors) {
        return "#" + componentToHex(colors.r) + componentToHex(colors.g) + componentToHex(colors.b);
    }

    // Converts HEX into RGB
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Creates LERP fade between two colors.
    function twoColorFade(color1, color2, length) {
        var rIncr = (color2.r - color1.r) / (length - 1),
            gIncr = (color2.g - color1.g) / (length - 1),
            bIncr = (color2.b - color1.b) / (length - 1),
            colors = [],
            r = color1.r,
            g = color1.g,
            b = color1.b,
            ii;

        for (ii = 0; ii < length; ii++) {
            colors.push({ r: Math.floor(r), b: Math.floor(b), g: Math.floor(g) });
            r = r + rIncr;
            g = g + gIncr;
            b = b + bIncr;
        }

        return colors;
    };

    // Format a string to be faded on BBCode formatting.
    function stringFader(startColor, endColor, string) {
        let colorsArray = twoColorFade(hexToRgb(_config.gradientMode.startColor), hexToRgb(_config.gradientMode.endColor), string.length)
        let fadedString = ''

        for (let i = 0; i < string.length; i++) {
            const char = string.charAt(i)

            if (char == ' ') {
                fadedString += char
            } else {
                fadedString += `[color=${rgbToHex(colorsArray[i])}]${char}[/color]`
            }
        }
        return fadedString
    }


    axios.interceptors.request.use((config) => {
        /** In dev, intercepts request and logs it into console for dev */
        if (config.url == '/api/chat/messages') {

            let message = config.data.message
            if (!message.match('/msg') && !message.match('/gift')) {
                let newMessage
                const quoteRegex = /\[quote\](.*?)\[\/quote\]/;
                const match = config.data.message.match(quoteRegex);
                const citation = match ? match[0] : "";
                const messageWithoutCitation = config.data.message.replace(quoteRegex, "").trim();

                if (_config.gradientMode.enabled) {
                    newMessage = `${citation} ${stringFader(_config.gradientMode.startColor,_config.gradientMode.endColor,messageWithoutCitation)}`;
                    config.data.message = newMessage
                    return config;
                }

                newMessage = `${citation} [color=${_config.colorCode}]${messageWithoutCitation}[/color]`;
                config.data.message = newMessage
                return config;

            }

        }
        return config
    }, (error) => {
        return Promise.reject(error);
    });

})();
