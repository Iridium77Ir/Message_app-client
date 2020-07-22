const fs = require("fs")

var loginname = fs.readFileSync("name.txt", { encoding: "utf8" })
var loginpassword = fs.readFileSync("password.txt", { encoding: "utf8" })

var partners = []
var datastatus = 0

async function POST_API(url = '', data = {}, meth='POST') {
    const response = await fetch(url, {
      method: meth,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
      
    })
    datastatus = response.status
    return response.json()
}

async function getChatPartners(first = "false") {

    if (first) {
        document.getElementById("userUl").innerHTML = ""
    }

    await POST_API('http://10.0.0.9:3000/messages', { name: loginname, password: loginpassword })
    .then(data => {

        if (datastatus != 400) {
            for (var i = 0; i < data.length; i++) {
                if (!partners.includes(data[i].name) && data[i].name !== loginname) {
                    partners.push(data[i].name)
                }
                if (!partners.includes(data[i].recipient) && data[i].recipient !== loginname) {
                    partners.push(data[i].recipient)
                }
            }
            appendChatPartnersToList()
        } else {  
            if(data.message == "Could not find user") {
                document.getElementById("error-box").innerText = "The password is incorrect"
            } else {
                document.getElementById("error-box").innerText = data.message
            }
        }

    }).catch(data => {
        // MAKE ERROR APPEAR
        console.log(data)
    })
}

function appendChatPartnersToList() {
    var ul = document.getElementById("userUl")
    for(var i = 0; i < partners.length; i++) {
        var li = document.createElement("li")
        var btn = document.createElement("button")
        btn.innerText = partners[i]
        btn.id = partners[i]
        btn.setAttribute("onclick", "getChat(this.id)")
        li.appendChild(btn)
        ul.appendChild(li)
    }
}


async function getChat(ID) {

    document.getElementById("chatdiv").style.display = "block"
    document.getElementById("newMessagediv").style.display = "block"
    document.getElementById("newChatdiv").style.display = "none"
    document.getElementById("newChatinputdiv").style.display = "none"

    document.getElementById("chatName").innerText = ID

    await POST_API('http://10.0.0.9:3000/messages', { name: loginname, password: loginpassword })
    .then(data => {
        if (datastatus != 400) {
            for (var i = 0; i < data.length; i++) {
                if (!partners.includes(data[i].name)) {
                    partners.push(data[i].name)
                }
                if (!partners.includes(data[i].recipient)) {
                    partners.push(data[i].recipient)
                }
            }
    
            document.getElementById("messageList").innerHTML = ""
    
            chatList(data, ID)
        } else {  
            document.getElementById("error-box").innerText = data.message
        }
    }).catch(data => {
        // MAKE ERROR APPEAR
        console.log(data)
    })
    updateScroll()
}

function chatList(data, ID) {

    var ul = document.getElementById("messageList")
        for (var i = 0; i < data.length; i++) {

            if(data[i].name === ID || data[i].recipient === ID) {
                var li = document.createElement("li")
                var p = document.createElement("p")
                var span = document.createElement("span")
                var btn = document.createElement("button")
            
                btn.innerText = "Delete"
                btn.setAttribute("onclick", "deleteMessage(this.id)")
                p.innerText = data[i].txt
                btn.id = data[i]._id
                var date = data[i].date
                var date0 = date.substring(0,10)
                var date1 = date.substring(11,19)
                span.innerText = " " + date0 + " " + date1
                
                if ( data[i].name === loginname) {
                    li.classList.add("myOwn")
                }
      
                p.appendChild(span)
                p.appendChild(btn)
                li.appendChild(p)
                ul.appendChild(li)
            }
        }
}

async function deleteMessage(ID) {
    await POST_API('http://10.0.0.9:3000/messages', { name: loginname, password: loginpassword, id: ID }, 'DELETE')
    .then(data => {
        if (datastatus != 400) {
            document.getElementById(ID).parentElement.parentElement.style.display = "none"
        } else {  
            document.getElementById("error-box").innerText = data.message
        }
    }).catch(data => {
        // MAKE ERROR APPEAR
        console.log(data)
    })
}

async function newMessage() {
    document.getElementById("chatMessage").placeholder = "Message..."
    var text = document.getElementById("chatMessage").value
    document.getElementById("chatMessage").value = ""
    var rec = document.getElementById("chatName").innerText

    if( text != "") {

        await POST_API('http://10.0.0.9:3000/messages/newMessage', { name: loginname, password: loginpassword, txt: text, recipient: rec }, 'POST')
        .then(data => {
            if (datastatus != 400) {
                getChat(rec)
            } else {  
                document.getElementById("error-box").innerText = data.message
            }
        }).catch(data => {
            // MAKE ERROR APPEAR
            console.log(data)
        })
    } else {
        document.getElementById("chatMessage").placeholder = "Please enter a message..."
    }
    updateScroll()
}

async function newChat() {

    var rec = document.getElementById("newName").value

    await POST_API('http://10.0.0.9:3000/messages/newMessage', { name: loginname, password: loginpassword, txt: loginname + " opened a chat with you!", recipient: rec }, 'POST')
    .then(data => {
        if (datastatus != 400) {
            window.location.replace("chat.html")
        } else {  
            document.getElementById("error-box").innerText = data.message
        }
    }).catch(data => {
        // MAKE ERROR APPEAR
        console.log(data)
    })
}

function openNewChat() {
    document.getElementById("newChatinputdiv").style.display = "block"
    document.getElementById("newChatdiv").style.display = "none"
    
}

function refreshNameList() {
    window.location.replace("chat.html")
}
function refreshChatList() {
    var ID = document.getElementById("chatName").innerText
    getChat(ID)
}

function logout() {
    fs.writeFileSync("name.txt", "", { encoding: "utf8" })
    fs.writeFileSync("password.txt", "", { encoding: "utf8" })
    window.location.replace("index.html")
}


//Scrolling to bottom auto
function updateScroll(){
    var scrollable = document.getElementById("messageList");
    scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight
}


getChatPartners()

if(document.getElementById("chatName").innerText != "") {
    window.setInterval(function(){refreshChatList()}, 5000);
}
