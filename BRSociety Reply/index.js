// ==UserScript==
// @name         BRSociety Reply Plugin
// @namespace    https://brsociety.club/
// @version      2.2
// @description  Plugin para implementação de um botão para responder no chat do site.
// @author       Suero & Anekin
// @match        https://brsociety.club/
// @icon         https://brsociety.club/img/logo.png
// @grant        none
// @license MIT
// ==/UserScript==
// Criado por: https://brsociety.club/users/Suero & https://brsociety.club/users/anekin
// Aproveite o plugin <3

(function() {
  'use strict'

  class Cursor {
    static setCurrentCursorPosition(chars, element) {
      if (chars >= 0) {
        var selection = window.getSelection()

        let range = Cursor._createRange(element, { count: chars })

        if (range) {
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }

    static _createRange(node, chars, range) {
      if (!range) {
        range = document.createRange()
        range.selectNode(node)
        range.setStart(node, 0)
      }

      if (chars.count === 0) {
        range.setEnd(node, chars.count)
      } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.length < chars.count) {
            chars.count -= node.textContent.length
          } else {
            range.setEnd(node, chars.count)
            chars.count = 0
          }
        } else {
          for (var lp = 0; lp < node.childNodes.length; lp++) {
            range = Cursor._createRange(node.childNodes[lp], chars, range)

            if (chars.count === 0) {
              break
            }
          }
        }
      }

      return range
    }

    static _isChildOf(node, parentElement) {
      while (node !== null) {
        if (node === parentElement) {
          return true
        }
        node = node.parentNode
      }

      return false
    }
  }

  function waitForElm(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector))
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector))
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }

  waitForElm('.messages').then(() => {
    const chatBox = document.getElementsByClassName('messages')[0].firstElementChild
    const chatField = document.getElementsByClassName('wysibb-text-editor')[0]

    function addReplyButton(message) {
      const replyButton = document.createElement('a')
      const replyI = document.createElement('i')
      replyI.className = 'fas fa-reply pointee'
      replyButton.appendChild(replyI)
      replyButton.onclick = function () {
        let messageClone = replyButton.parentNode.parentNode.getElementsByClassName('text-bright')[0].cloneNode(true)
        if (messageClone.getElementsByTagName('ul')[0]) {
          messageClone.getElementsByTagName('ul')[0].remove()
        }

        messageClone = messageClone.firstChild

        let messageContent = messageClone.textContent
        const quote = `[quote]${messageContent}[/quote]`

        // Verifica se o chatField possui conteúdo,
        // para não apagar caso o usuário já tenha digitado algo
        const [, existingChatFieldContent] = /^(?: )?(?:\[quote\].+\[\/quote\])?(?:\n+| +)?(.+)/.exec(chatField.textContent) || []

        chatField.textContent = quote

        // Faz a quebra de linha no final do quote. Infelizmente foi necessário essas duas formas diferentes.
        if (existingChatFieldContent) {
          // Caso o usuário tenha digitado algo antes da quote, cria um p e insere o conteúdo digitado
          chatField.appendChild(document.createElement('p'))
          chatField.lastChild.textContent = existingChatFieldContent
        } else {
          // Caso não tenha nenhum conteúdo digitado, apenas adiciona uma quebra de linha no final
          chatField.appendChild(document.createElement('br'))
          chatField.appendChild(document.createElement('br'))
          chatField.lastChild.textContent = ' '
        }

        const end = chatField.textContent.length

        Cursor.setCurrentCursorPosition(end, chatField)
        chatField.focus()
      }

      message.getElementsByTagName('h4')[0].appendChild(replyButton)

    }

    function firstTime() {
      let messagesList = chatBox.getElementsByTagName('li')

      for (let message of messagesList) {
        if (message.className === 'sent') {
          addReplyButton(message)
        }
      }

    }

    firstTime()

    chatBox.addEventListener('DOMNodeInserted', function (event) {
      if (event.target.className === 'sent') {
        addReplyButton(event.target)
      }
    }, false)
  })
})()
