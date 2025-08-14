const { malvinid } = require('./id'); 
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { Storage } = require("megajs");

const {
    default: Malvin_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// Function to generate a random Mega ID
function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// Function to upload credentials to Mega
async function uploadCredsToMega(credsPath) {
    try {
        const storage = await new Storage({
            email: 'mihirangam127@gmail.com', // Your Mega A/c Email Here
            password: 'Nimesh12345678' // Your Mega A/c Password Here
        }).ready;
        console.log('Mega storage initialized.');

        if (!fs.existsSync(credsPath)) {
            throw new Error(`File not found: ${credsPath}`);
        }

        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;

        console.log('Session successfully uploaded to Mega.');
        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();
        console.log(`Session Url: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

// Function to remove a file
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Router to handle pairing code generation
router.get('/', async (req, res) => {
    const id = malvinid(); 
    let num = req.query.number;

    async function MALVIN_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let Malvin = Malvin_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!Malvin.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Malvin.requestPairingCode(num);
                console.log(`Your Code: ${code}`);

                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            Malvin.ev.on('creds.update', saveCreds);
            Malvin.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;

                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'NENO-XMD~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);

                    const session = await Malvin.sendMessage(Malvin.user.id, { text: sid });

                    const MALVIN_TEXT = `
🎉 *Welcome to NENO XMD POWERFULL BOT* 🚀  

🔒 *Your Session ID* is ready!  ⚠️ _Keep it private and secure — dont share it with anyone._ 

🔑 *Copy & Paste the SESSION_ID Above*🛠️ Add it to your environment variable: *SESSION_ID*.  

💡 *Whats Next?* 
1️⃣ Explore all the cool features of Neno XMD
2️⃣ Stay updated with our latest releases and support.
3️⃣ Enjoy seamless WhatsApp automation! 🤖  

🔗 *Join Our Support Channel:* 👉 [Click Here to Join](https://whatsapp.com/channel/0029Vb6BQQmFnSz7bmxefu40) 

⭐ *Show Some Love!* Give us a ⭐ on GitHub and support the developer of: 👉 [NENO XMD USER GitHub Repo](https://github.com/Nimeshkamihiran/neno-xmd-bot)  

🚀 _Thanks for choosing NENO XMD    — Let the automation begin!_ ✨`;

                    await Malvin.sendMessage(Malvin.user.id, { text: MALVIN_TEXT }, { quoted: session });

                    await delay(100);
                    await Malvin.ws.close();
                    return removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MALVIN_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await MALVIN_PAIR_CODE();
});

module.exports = router    .input-container input:focus {
      border-left: 2px solid #075e54;
      outline: none;
      box-shadow: inset 13px 13px 10px #075e54, inset -13px -13px 10px #2c3e50;
    }

    .input-container button {
      flex-basis: 25%;
      padding: 1rem;
      background: #25d366;
      font-weight: 900;
      letter-spacing: 0.3rem;
      text-transform: uppercase;
      color: white;
      border: none;
      width: 100%;
      border-radius: 0 1rem 1rem 0;
      transition: all 0.2s ease-in-out;
    }

    .input-container button:hover {
      background: #2980b9;
    }

    #loading-spinner {
      display: none;
      color: white;
      margin-top: 10px;
    }

    .fa-spinner {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 10px 0;
      text-align: center;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <!-- Snowflakes -->
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>
  <div class="snowflake"></div>

  <div class="container">
      
    <h3>❄️ session name 🪀</h3>
    
    <br>
    <h3> 𝐑𝐞𝐠𝐚𝐫𝐝𝐬 NENO XMD🎗</h3>
    
    <p>🔢Enter Your WhatsApp Number with Country Code.</p>
    <br>
    <div class="input-container">
      <input placeholder="+94xxxxxx" type="number" id="number" name="">
      <button id="submit">Code</button>
    </div>
    <div id="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
    <br>
    <main id="pair"></main>
  </div>

  <footer>
    NIMESHKA MIHIRAN &copy <span id="currentYear"></span>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js"></script>
  <script>
    let a = document.getElementById("pair");
    let b = document.getElementById("submit");
    let c = document.getElementById("number");

    async function Copy() {
      let text = document.getElementById("copy").innerText;
      let obj = document.getElementById("copy");
      await navigator.clipboard.writeText(obj.innerText.replace('CODE: ', ''));
      obj.innerText = "✔️ COPIED";
      obj.style = "color:red;font-weight:bold";
      obj.size = "5";
      setTimeout(() => {
        obj.innerText = text;
        obj.style = "color:white;font-weight-bold";
        obj.size = "5";
      }, 500);
    }

    b.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!c.value) {
        a.innerHTML = '<a style="color:red;font-weight:bold">❗ Enter your WhatsApp number with country code.</a><br><br>';
      } else if (c.value.replace(/[^0-9]/g, "").length < 11) {
        a.innerHTML = '<a style="color:red;font-weight:bold">❗ Invalid number format. Please try again.</a><br><br>';
      } else {
        const bc = c.value.replace(/[^0-9]/g, "");
        let bb = "";
        let bbc = "";
        const cc = bc.split('');
        cc.map(a => {
          bbc += a;
          if (bbc.length == 3) {
            bb += " " + a;
          } else if (bbc.length == 8) {
            bb += " " + a;
          } else {
            bb += a;
          }
        });
        c.type = "text";
        c.value = "+" + bb;
        c.style = "color:white;font-size:20px";
        document.getElementById("loading-spinner").style.display = "block";
        a.innerHTML = '';
        let { data } = await axios(`/code?number=${bc}`);
        let code = data.code || "❗ Service Unavailable";
        a.innerHTML = '<font id="copy" onclick="Copy()" style="color:red;font-weight:bold" size="5">CODE: <span style="color:white;font-weight:bold">' + code + '</span></font><br><br><br>';
        document.getElementById("loading-spinner").style.display = "none";
      }
    });

    document.getElementById('currentYear').textContent = new Date().getFullYear();
  </script>
</body>
</html>
