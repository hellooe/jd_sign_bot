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

  if (serverJ) {
    const path = "./result.txt";
    let content = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }  
    let t = content.match(/【签到概览】:(.*?)【/)
    console.log(t[1])
    let t2 = content.match(/【签到奖励】:(.*?)【/)
    console.log(t2[1])
    let t3 = content.match(/【其他奖励】:(.*?)【/)
    console.log(t3[1])
    let msg = new Date().toLocaleDateString() + '\n' + t[1] + '\n' + t2[1] + '\n' + t3[1]
    console.log(msg)
    await sendNotify(msg);
  }
}

start()
