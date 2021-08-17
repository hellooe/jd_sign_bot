const exec = require('child_process').execSync;
const fs = require('fs');
const rp = require('request-promise');
const download = require('download');

const KEY = process.env.JD_COOKIE;
const serverJ = process.env.PUSH_URI;
const sendKey = process.env.PUSH_KEY;

async function downFile () {
    const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
    await download(url, './');
}

async function changeFile () {
   let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8')
   content = content.replace(/var Key = ''/, `var Key = '${KEY}'`);
   await fs.writeFileSync( './JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify (msg) {
  const options ={
    uri:  serverJ,
    body: {
      "sendkey": sendKey,
      "msg_type": "text",
      "msg": msg
    },
    json: true,
    method: 'POST'
  }
  await rp.post(options).then(res=>{
    console.log(res)
  }).catch((err)=>{
    console.log(err)
  })
}

async function start() {
  if (!KEY) {
    console.log('请填写相关key')
    return
  }
  await downFile();
  await changeFile();
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log('执行完毕')

  if (serverJ && sendKey) {
    const path = "./result.txt";
    let content = "";
    let msg = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
      let results = content.matchAll(/【(.*?)\n/g)
      for(let result of results) {
        msg += result[0];
      }
    }
    await sendNotify(msg);
  }
}

start()
