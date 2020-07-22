const fs = require("fs")
const path = require('path');

var login_name = fs.readFileSync("name.txt", { encoding: "utf8" }, (err) => {})
var login_password = fs.readFileSync("password.txt", { encoding: "utf8" }, (err) => {})

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

function login() {
    window.location.replace("login.html")
}
function register() {
    window.location.replace("register.html")
}

async function loginsave() {

    var loginname = document.getElementById("name").value
    var loginpassword = document.getElementById("password").value

    await POST_API('http://10.0.0.9:3000/users/check', { name: loginname })
    .then(data => {
        
        fs.writeFileSync("name.txt", loginname, { encoding: "utf8" })
        fs.writeFileSync("password.txt", loginpassword, { encoding: "utf8" })

        if (datastatus != 400) {
            window.location.replace("chat.html")
        } else {
            document.getElementById("error-box").innerText = data.message
        }
        
    }).catch(data => {
        document.getElementById("error-box").innerText = data.message
    })
}
async function registersave() {

    var loginname = document.getElementById("name").value
    var loginpassword = document.getElementById("password").value

    await POST_API('http://10.0.0.9:3000/users/newUser', { name: loginname, password: loginpassword })
    .then(data => {
        
        fs.writeFileSync("name.txt", loginname, { encoding: "utf8" })
        fs.writeFileSync("password.txt", loginpassword, { encoding: "utf8" })

        if (datastatus != 400) {
            window.location.replace("chat.html")
        } else {
            if ( data.message == 'E11000 duplicate key error collection: chat_server.users index: name_1 dup key: { : "Niklas" }') {
                document.getElementById("error-box").innerText = "This user already exists"
            }
            document.getElementById("error-box").innerText = data.message
        }
        
    }).catch(data => {
        document.getElementById("error-box").innerText = data.message
    })
}

var pathn = window.location.pathname
pathn = pathn.substring(1).replace(/\//g, "\\")
if(pathn == path.join(__dirname, 'login.html') || pathn == path.join(__dirname, 'register.html')) {
    document.getElementById("name").value = login_name
    document.getElementById("password").value = login_password
}
