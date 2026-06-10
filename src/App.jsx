import { dbSet, dbGet, dbSubscribe } from "./firebase";
import { useState, useEffect } from "react";

const USERS_CONFIG = {
  "Teo":   { pin:"1606", color:"#F59E0B", light:"#F59E0B18", avatar:"T", isAdmin:true },
  "ΞΞ―ΞΊΞΏΟ‚": { pin:"2406", color:"#22D3EE", light:"#22D3EE18", avatar:"Ξ" },
  "Ξ¤Ξ¬ΟƒΞΏΟ‚": { pin:"0802", color:"#A78BFA", light:"#A78BFA18", avatar:"Ξ¤" },
};
const ALL_USERS = Object.keys(USERS_CONFIG); // Teo ΟƒΟ…ΞΌΞΌΞµΟ„Ξ­Ο‡ΞµΞΉ ΞΊΞ±Ξ½ΞΏΞ½ΞΉΞΊΞ¬ + Ξ­Ο‡ΞµΞΉ admin Ξ΄ΞΉΞΊΞ±ΞΉΟΞΌΞ±Ο„Ξ±

const FLAGS = {
  MEX:"\uD83C\uDDF2\uD83C\uDDFD", ZAF:"\uD83C\uDDFF\uD83C\uDDE6", KOR:"\uD83C\uDDF0\uD83C\uDDF7", CZE:"\uD83C\uDDE8\uD83C\uDDFF",
  CAN:"\uD83C\uDDE8\uD83C\uDDE6", BIH:"\uD83C\uDDE7\uD83C\uDDE6", USA:"\uD83C\uDDFA\uD83C\uDDF8", PAR:"\uD83C\uDDF5\uD83C\uDDFE",
  QAT:"\uD83C\uDDF6\uD83C\uDDE6", SUI:"\uD83C\uDDE8\uD83C\uDDED", BRA:"\uD83C\uDDE7\uD83C\uDDF7", MAR:"\uD83C\uDDF2\uD83C\uDDE6",
  HAI:"\uD83C\uDDED\uD83C\uDDF9", AUS:"\uD83C\uDDE6\uD83C\uDDFA", TUR:"\uD83C\uDDF9\uD83C\uDDF7", GER:"\uD83C\uDDE9\uD83C\uDDEA",
  CUW:"\uD83C\uDDE8\uD83C\uDDFC", NED:"\uD83C\uDDF3\uD83C\uDDF1", JPN:"\uD83C\uDDEF\uD83C\uDDF5", CIV:"\uD83C\uDDE8\uD83C\uDDEE",
  ECU:"\uD83C\uDDEA\uD83C\uDDE8", SWE:"\uD83C\uDDF8\uD83C\uDDEA", TUN:"\uD83C\uDDF9\uD83C\uDDF3", ESP:"\uD83C\uDDEA\uD83C\uDDF8",
  CPV:"\uD83C\uDDE8\uD83C\uDDFB", BEL:"\uD83C\uDDE7\uD83C\uDDEA", EGY:"\uD83C\uDDEA\uD83C\uDDEC", SAU:"\uD83C\uDDF8\uD83C\uDDE6",
  URU:"\uD83C\uDDFA\uD83C\uDDFE", IRN:"\uD83C\uDDEE\uD83C\uDDF7", NZL:"\uD83C\uDDF3\uD83C\uDDFF", FRA:"\uD83C\uDDEB\uD83C\uDDF7",
  SEN:"\uD83C\uDDF8\uD83C\uDDF3", IRQ:"\uD83C\uDDEE\uD83C\uDDF6", NOR:"\uD83C\uDDF3\uD83C\uDDF4", ARG:"\uD83C\uDDE6\uD83C\uDDF7",
  ALG:"\uD83C\uDDE9\uD83C\uDDFF", AUT:"\uD83C\uDDE6\uD83C\uDDF9", JOR:"\uD83C\uDDEF\uD83C\uDDF4", POR:"\uD83C\uDDF5\uD83C\uDDF9",
  COD:"\uD83C\uDDE8\uD83C\uDDE9", CRO:"\uD83C\uDDED\uD83C\uDDF7", GHA:"\uD83C\uDDEC\uD83C\uDDED", PAN:"\uD83C\uDDF5\uD83C\uDDE6",
  UZB:"\uD83C\uDDFA\uD83C\uDDFF", COL:"\uD83C\uDDE8\uD83C\uDDF4", ENG:"\uD83C\uDDEC\uD83C\uDDE7", SCO:"\uD83C\uDDEC\uD83C\uDDE7",
};
function FL(code) { return FLAGS[code] || ""; }
function t(code, name) { return { code, name }; }

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   MARKETS
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
const MKT_IDS = ["1x2","dc","ou","btts","ht","htou","home_ou","away_ou","ggou"];

function buildMarkets(home, away) {
  return [
    { id:"1x2", label:"Ξ¤ΞµΞ»ΞΉΞΊΟ Ξ‘Ο€ΞΏΟ„Ξ­Ξ»ΞµΟƒΞΌΞ±",
      options:[{id:"1",label:"1 β€“ "+home.name},{id:"X",label:"Ξ§ β€“ Ξ™ΟƒΞΏΟ€Ξ±Ξ»Ξ―Ξ±"},{id:"2",label:"2 β€“ "+away.name}] },
    { id:"dc", label:"Ξ”ΞΉΟ€Ξ»Ξ® Ξ•Ο…ΞΊΞ±ΞΉΟΞ―Ξ±",
      options:[{id:"1X",label:"1X"},{id:"12",label:"12"},{id:"X2",label:"X2"}] },
    { id:"ou", label:"Ξ“ΞΊΞΏΞ» Over/Under",
      options:[{id:"o15",label:"Over 1.5"},{id:"u15",label:"Under 1.5"},{id:"o25",label:"Over 2.5"},{id:"u25",label:"Under 2.5"},{id:"o35",label:"Over 3.5"},{id:"u35",label:"Under 3.5"}] },
    { id:"btts", label:"ΞΞ± ΟƒΞΊΞΏΟΞ¬ΟΞΏΟ…Ξ½ ΞΊΞ±ΞΉ ΞΏΞΉ 2",
      options:[{id:"gg",label:"GG β€“ ΞΞ±ΞΉ"},{id:"ng",label:"NG β€“ ΞΟ‡ΞΉ"}] },
    { id:"ht", label:"1ΞΏ Ξ—ΞΌΞ―Ο‡ΟΞΏΞ½ΞΏ β€“ Ξ‘Ο€ΞΏΟ„Ξ­Ξ»ΞµΟƒΞΌΞ±",
      options:[{id:"ht1",label:"1 β€“ "+home.name},{id:"htx",label:"Ξ§ β€“ Ξ™ΟƒΞΏΟ€Ξ±Ξ»Ξ―Ξ±"},{id:"ht2",label:"2 β€“ "+away.name}] },
    { id:"htou", label:"1ΞΏ Ξ—ΞΌΞ―Ο‡ΟΞΏΞ½ΞΏ β€“ Over/Under",
      options:[{id:"hto05",label:"Over 0.5"},{id:"htu05",label:"Under 0.5"},{id:"hto15",label:"Over 1.5"},{id:"htu15",label:"Under 1.5"}] },
    { id:"home_ou", label:home.name+" β€“ Ξ“ΞΊΞΏΞ» Over/Under",
      options:[{id:"ho05",label:"Over 0.5"},{id:"hu05",label:"Under 0.5"},{id:"ho15",label:"Over 1.5"},{id:"hu15",label:"Under 1.5"}] },
    { id:"away_ou", label:away.name+" β€“ Ξ“ΞΊΞΏΞ» Over/Under",
      options:[{id:"ao05",label:"Over 0.5"},{id:"au05",label:"Under 0.5"},{id:"ao15",label:"Over 1.5"},{id:"au15",label:"Under 1.5"}] },
    { id:"ggou", label:"ΞΞ± ΟƒΞΊΞΏΟΞ¬ΟΞΏΟ…Ξ½ ΞΊΞ±ΞΉ ΞΏΞΉ 2 Ξ® Over 2.5",
      options:[{id:"ggou_y",label:"ΞΞ±ΞΉ"},{id:"ggou_n",label:"ΞΟ‡ΞΉ"}] },
  ];
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   MATCHES
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
const DAYS = [
  { label:"Ξ Ξ­ΞΌ 11/06", sub:"2 ΞΌΞ±Ο„Ο‚", matches:[
    {id:1,  grp:"A", time:"22:00", home:t("MEX","ΞΞµΞΎΞΉΞΊΟ"),       away:t("ZAF","Ξ. Ξ‘Ο†ΟΞΉΞΊΞ®"),     venue:"Azteca, Ξ ΟΞ»Ξ· ΞΞµΞΎΞΉΞΊΞΏΟ"},
    {id:2,  grp:"A", time:"05:00β¦",home:t("KOR","Ξ. ΞΞΏΟΞ­Ξ±"),      away:t("CZE","Ξ¤ΟƒΞµΟ‡Ξ―Ξ±"),         venue:"Akron, Ξ“ΞΏΟ…Ξ±Ξ΄Ξ±Ξ»Ξ±Ο‡Ξ¬ΟΞ±"},
  ]},
  { label:"Ξ Ξ±Ο 12/06", sub:"2 ΞΌΞ±Ο„Ο‚", matches:[
    {id:3,  grp:"B", time:"22:00", home:t("CAN","ΞΞ±Ξ½Ξ±Ξ΄Ξ¬Ο‚"),       away:t("BIH","Ξ’ΞΏΟƒΞ½Ξ―Ξ±-Ξ•ΟΞ¶."),   venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:4,  grp:"D", time:"04:00β¦",home:t("USA","Ξ—Ξ Ξ‘"),           away:t("PAR","Ξ Ξ±ΟΞ±Ξ³ΞΏΟ…Ξ¬Ξ·"),      venue:"SoFi Stadium, LA"},
  ]},
  { label:"Ξ£Ξ¬Ξ² 13/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:5,  grp:"B", time:"22:00", home:t("QAT","ΞΞ±Ο„Ξ¬Ο"),         away:t("SUI","Ξ•Ξ»Ξ²ΞµΟ„Ξ―Ξ±"),        venue:"Levi's Stadium, SF"},
    {id:6,  grp:"C", time:"01:00β¦",home:t("BRA","Ξ’ΟΞ±Ξ¶ΞΉΞ»Ξ―Ξ±"),      away:t("MAR","ΞΞ±ΟΟΞΊΞΏ"),         venue:"MetLife Stadium, NJ"},
    {id:7,  grp:"C", time:"04:00β¦",home:t("HAI","Ξ‘ΟΟ„Ξ®"),          away:t("SCO","Ξ£ΞΊΟ‰Ο„Ξ―Ξ±"),         venue:"Gillette Stadium, Boston"},
    {id:8,  grp:"D", time:"07:00β¦",home:t("AUS","Ξ‘Ο…ΟƒΟ„ΟΞ±Ξ»Ξ―Ξ±"),     away:t("TUR","Ξ¤ΞΏΟ…ΟΞΊΞ―Ξ±"),        venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
  ]},
  { label:"ΞΟ…Ο 14/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:9,  grp:"E", time:"20:00", home:t("GER","Ξ“ΞµΟΞΌΞ±Ξ½Ξ―Ξ±"),      away:t("CUW","ΞΞΏΟ…ΟΞ±ΟƒΞ¬ΞΏ"),       venue:"NRG Stadium, Houston"},
    {id:10, grp:"F", time:"23:00", home:t("NED","ΞΞ»Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),      away:t("JPN","Ξ™Ξ±Ο€Ο‰Ξ½Ξ―Ξ±"),        venue:"AT&T Stadium, Dallas"},
    {id:11, grp:"E", time:"02:00β¦",home:t("CIV","Ξ‘ΞΊΟ„Ξ® Ξ•Ξ»ΞµΟ†."),   away:t("ECU","Ξ•ΞΊΞΏΟ…Ξ±Ξ΄ΟΟ"),       venue:"Lincoln Financial, Philly"},
    {id:12, grp:"F", time:"05:00β¦",home:t("SWE","Ξ£ΞΏΟ…Ξ·Ξ΄Ξ―Ξ±"),       away:t("TUN","Ξ¤Ο…Ξ½Ξ·ΟƒΞ―Ξ±"),        venue:"Estadio BBVA, ΞΞΏΞ½Ο„ΞµΟΞ­ΞΉ"},
  ]},
  { label:"Ξ”ΞµΟ… 15/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:13, grp:"H", time:"19:00", home:t("ESP","Ξ™ΟƒΟ€Ξ±Ξ½Ξ―Ξ±"),       away:t("CPV","Ξ Ο. Ξ‘ΞΊΟΟ‰Ο„Ξ®ΟΞΉΞΏ"),  venue:"Mercedes-Benz, Atlanta"},
    {id:14, grp:"G", time:"22:00", home:t("BEL","Ξ’Ξ­Ξ»Ξ³ΞΉΞΏ"),        away:t("EGY","Ξ‘Ξ―Ξ³Ο…Ο€Ο„ΞΏΟ‚"),       venue:"Lumen Field, Seattle"},
    {id:15, grp:"H", time:"01:00β¦",home:t("SAU","Ξ£. Ξ‘ΟΞ±Ξ²Ξ―Ξ±"),    away:t("URU","ΞΟ…ΟΞΏΟ…Ξ³ΞΏΟ…Ξ¬Ξ·"),     venue:"Hard Rock Stadium, Miami"},
    {id:16, grp:"G", time:"04:00β¦",home:t("IRN","Ξ™ΟΞ¬Ξ½"),          away:t("NZL","Ξ. Ξ–Ξ·Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),    venue:"SoFi Stadium, LA"},
  ]},
  { label:"Ξ¤ΟΞ― 16/06", sub:"3 ΞΌΞ±Ο„Ο‚", matches:[
    {id:17, grp:"I", time:"22:00", home:t("FRA","Ξ“Ξ±Ξ»Ξ»Ξ―Ξ±"),        away:t("SEN","Ξ£ΞµΞ½ΞµΞ³Ξ¬Ξ»Ξ·"),       venue:"MetLife Stadium, NJ"},
    {id:18, grp:"I", time:"01:00β¦",home:t("IRQ","Ξ™ΟΞ¬ΞΊ"),          away:t("NOR","ΞΞΏΟΞ²Ξ·Ξ³Ξ―Ξ±"),       venue:"Gillette Stadium, Boston"},
    {id:19, grp:"J", time:"04:00β¦",home:t("ARG","Ξ‘ΟΞ³ΞµΞ½Ο„ΞΉΞ½Ξ®"),     away:t("ALG","Ξ‘Ξ»Ξ³ΞµΟΞ―Ξ±"),        venue:"Arrowhead Stadium, KC"},
  ]},
  { label:"Ξ¤ΞµΟ„ 17/06", sub:"5 ΞΌΞ±Ο„Ο‚", matches:[
    {id:20, grp:"J", time:"07:00β¦",home:t("AUT","Ξ‘Ο…ΟƒΟ„ΟΞ―Ξ±"),       away:t("JOR","Ξ™ΞΏΟΞ΄Ξ±Ξ½Ξ―Ξ±"),       venue:"Levi's Stadium, SF"},
    {id:21, grp:"K", time:"20:00", home:t("POR","Ξ ΞΏΟΟ„ΞΏΞ³Ξ±Ξ»Ξ―Ξ±"),    away:t("COD","Ξ›Ξ” ΞΞΏΞ½Ξ³ΞΊΟ"),      venue:"NRG Stadium, Houston"},
    {id:22, grp:"L", time:"23:00", home:t("ENG","Ξ‘Ξ³Ξ³Ξ»Ξ―Ξ±"),        away:t("CRO","ΞΟΞΏΞ±Ο„Ξ―Ξ±"),        venue:"AT&T Stadium, Dallas"},
    {id:23, grp:"L", time:"02:00β¦",home:t("GHA","Ξ“ΞΊΞ¬Ξ½Ξ±"),         away:t("PAN","Ξ Ξ±Ξ½Ξ±ΞΌΞ¬Ο‚"),        venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:24, grp:"K", time:"05:00β¦",home:t("UZB","ΞΟ…Ξ¶ΞΌΟ€ΞµΞΊΞΉΟƒΟ„Ξ¬Ξ½"), away:t("COL","ΞΞΏΞ»ΞΏΞΌΞ²Ξ―Ξ±"),       venue:"Azteca, Ξ ΟΞ»Ξ· ΞΞµΞΎΞΉΞΊΞΏΟ"},
  ]},
  { label:"Ξ Ξ­ΞΌ 18/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:25, grp:"A", time:"19:00", home:t("CZE","Ξ¤ΟƒΞµΟ‡Ξ―Ξ±"),        away:t("ZAF","Ξ. Ξ‘Ο†ΟΞΉΞΊΞ®"),      venue:"Mercedes-Benz, Atlanta"},
    {id:26, grp:"B", time:"22:00", home:t("SUI","Ξ•Ξ»Ξ²ΞµΟ„Ξ―Ξ±"),       away:t("BIH","Ξ’ΞΏΟƒΞ½Ξ―Ξ±-Ξ•ΟΞ¶."),   venue:"SoFi Stadium, LA"},
    {id:27, grp:"B", time:"01:00β¦",home:t("CAN","ΞΞ±Ξ½Ξ±Ξ΄Ξ¬Ο‚"),       away:t("QAT","ΞΞ±Ο„Ξ¬Ο"),          venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
    {id:28, grp:"A", time:"04:00β¦",home:t("MEX","ΞΞµΞΎΞΉΞΊΟ"),        away:t("KOR","Ξ. ΞΞΏΟΞ­Ξ±"),       venue:"Akron, Ξ“ΞΏΟ…Ξ±Ξ΄Ξ±Ξ»Ξ±Ο‡Ξ¬ΟΞ±"},
  ]},
  { label:"Ξ Ξ±Ο 19/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:29, grp:"D", time:"22:00", home:t("USA","Ξ—Ξ Ξ‘"),           away:t("AUS","Ξ‘Ο…ΟƒΟ„ΟΞ±Ξ»Ξ―Ξ±"),      venue:"Lumen Field, Seattle"},
    {id:30, grp:"C", time:"01:00β¦",home:t("SCO","Ξ£ΞΊΟ‰Ο„Ξ―Ξ±"),        away:t("MAR","ΞΞ±ΟΟΞΊΞΏ"),         venue:"Gillette Stadium, Boston"},
    {id:31, grp:"C", time:"03:30β¦",home:t("BRA","Ξ’ΟΞ±Ξ¶ΞΉΞ»Ξ―Ξ±"),      away:t("HAI","Ξ‘ΟΟ„Ξ®"),           venue:"Lincoln Financial, Philly"},
    {id:32, grp:"D", time:"06:00β¦",home:t("TUR","Ξ¤ΞΏΟ…ΟΞΊΞ―Ξ±"),       away:t("PAR","Ξ Ξ±ΟΞ±Ξ³ΞΏΟ…Ξ¬Ξ·"),      venue:"Levi's Stadium, SF"},
  ]},
  { label:"Ξ£Ξ¬Ξ² 20/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:33, grp:"F", time:"20:00", home:t("NED","ΞΞ»Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),      away:t("SWE","Ξ£ΞΏΟ…Ξ·Ξ΄Ξ―Ξ±"),        venue:"NRG Stadium, Houston"},
    {id:34, grp:"E", time:"23:00", home:t("GER","Ξ“ΞµΟΞΌΞ±Ξ½Ξ―Ξ±"),      away:t("CIV","Ξ‘ΞΊΟ„Ξ® Ξ•Ξ»ΞµΟ†."),     venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:35, grp:"E", time:"03:00β¦",home:t("ECU","Ξ•ΞΊΞΏΟ…Ξ±Ξ΄ΟΟ"),      away:t("CUW","ΞΞΏΟ…ΟΞ±ΟƒΞ¬ΞΏ"),       venue:"Arrowhead Stadium, KC"},
    {id:36, grp:"F", time:"07:00β¦",home:t("TUN","Ξ¤Ο…Ξ½Ξ·ΟƒΞ―Ξ±"),       away:t("JPN","Ξ™Ξ±Ο€Ο‰Ξ½Ξ―Ξ±"),        venue:"Estadio BBVA, ΞΞΏΞ½Ο„ΞµΟΞ­ΞΉ"},
  ]},
  { label:"ΞΟ…Ο 21/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:37, grp:"H", time:"19:00", home:t("ESP","Ξ™ΟƒΟ€Ξ±Ξ½Ξ―Ξ±"),       away:t("SAU","Ξ£. Ξ‘ΟΞ±Ξ²Ξ―Ξ±"),      venue:"Mercedes-Benz, Atlanta"},
    {id:38, grp:"G", time:"22:00", home:t("BEL","Ξ’Ξ­Ξ»Ξ³ΞΉΞΏ"),        away:t("IRN","Ξ™ΟΞ¬Ξ½"),           venue:"SoFi Stadium, LA"},
    {id:39, grp:"H", time:"01:00β¦",home:t("URU","ΞΟ…ΟΞΏΟ…Ξ³ΞΏΟ…Ξ¬Ξ·"),   away:t("CPV","Ξ Ο. Ξ‘ΞΊΟΟ‰Ο„Ξ®ΟΞΉΞΏ"),  venue:"Hard Rock Stadium, Miami"},
    {id:40, grp:"G", time:"04:00β¦",home:t("NZL","Ξ. Ξ–Ξ·Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),  away:t("EGY","Ξ‘Ξ―Ξ³Ο…Ο€Ο„ΞΏΟ‚"),       venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
  ]},
  { label:"Ξ”ΞµΟ… 22/06", sub:"3 ΞΌΞ±Ο„Ο‚", matches:[
    {id:41, grp:"J", time:"20:00", home:t("ARG","Ξ‘ΟΞ³ΞµΞ½Ο„ΞΉΞ½Ξ®"),     away:t("AUT","Ξ‘Ο…ΟƒΟ„ΟΞ―Ξ±"),        venue:"AT&T Stadium, Dallas"},
    {id:42, grp:"I", time:"00:00β¦",home:t("FRA","Ξ“Ξ±Ξ»Ξ»Ξ―Ξ±"),        away:t("IRQ","Ξ™ΟΞ¬ΞΊ"),           venue:"Lincoln Financial, Philly"},
    {id:43, grp:"I", time:"03:00β¦",home:t("NOR","ΞΞΏΟΞ²Ξ·Ξ³Ξ―Ξ±"),      away:t("SEN","Ξ£ΞµΞ½ΞµΞ³Ξ¬Ξ»Ξ·"),       venue:"MetLife Stadium, NJ"},
  ]},
  { label:"Ξ¤ΟΞ― 23/06", sub:"5 ΞΌΞ±Ο„Ο‚", matches:[
    {id:44, grp:"J", time:"06:00β¦",home:t("JOR","Ξ™ΞΏΟΞ΄Ξ±Ξ½Ξ―Ξ±"),      away:t("ALG","Ξ‘Ξ»Ξ³ΞµΟΞ―Ξ±"),        venue:"Levi's Stadium, SF"},
    {id:45, grp:"K", time:"20:00", home:t("POR","Ξ ΞΏΟΟ„ΞΏΞ³Ξ±Ξ»Ξ―Ξ±"),    away:t("UZB","ΞΟ…Ξ¶ΞΌΟ€ΞµΞΊΞΉΟƒΟ„Ξ¬Ξ½"),   venue:"NRG Stadium, Houston"},
    {id:46, grp:"L", time:"23:00", home:t("ENG","Ξ‘Ξ³Ξ³Ξ»Ξ―Ξ±"),        away:t("GHA","Ξ“ΞΊΞ¬Ξ½Ξ±"),          venue:"Gillette Stadium, Boston"},
    {id:47, grp:"L", time:"02:00β¦",home:t("PAN","Ξ Ξ±Ξ½Ξ±ΞΌΞ¬Ο‚"),       away:t("CRO","ΞΟΞΏΞ±Ο„Ξ―Ξ±"),        venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:48, grp:"K", time:"05:00β¦",home:t("COL","ΞΞΏΞ»ΞΏΞΌΞ²Ξ―Ξ±"),      away:t("COD","Ξ›Ξ” ΞΞΏΞ½Ξ³ΞΊΟ"),      venue:"Akron, Ξ“ΞΏΟ…Ξ±Ξ΄Ξ±Ξ»Ξ±Ο‡Ξ¬ΟΞ±"},
  ]},
  { label:"Ξ¤ΞµΟ„ 24/06", sub:"4 ΞΌΞ±Ο„Ο‚", matches:[
    {id:49, grp:"B", time:"22:00", home:t("SUI","Ξ•Ξ»Ξ²ΞµΟ„Ξ―Ξ±"),       away:t("CAN","ΞΞ±Ξ½Ξ±Ξ΄Ξ¬Ο‚"),        venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
    {id:50, grp:"B", time:"22:00", home:t("BIH","Ξ’ΞΏΟƒΞ½Ξ―Ξ±-Ξ•ΟΞ¶."),   away:t("QAT","ΞΞ±Ο„Ξ¬Ο"),          venue:"Lumen Field, Seattle"},
    {id:51, grp:"C", time:"01:00β¦",home:t("SCO","Ξ£ΞΊΟ‰Ο„Ξ―Ξ±"),        away:t("BRA","Ξ’ΟΞ±Ξ¶ΞΉΞ»Ξ―Ξ±"),       venue:"Hard Rock Stadium, Miami"},
    {id:52, grp:"C", time:"01:00β¦",home:t("MAR","ΞΞ±ΟΟΞΊΞΏ"),        away:t("HAI","Ξ‘ΟΟ„Ξ®"),           venue:"Mercedes-Benz, Atlanta"},
  ]},
  { label:"Ξ Ξ­ΞΌ 25/06", sub:"6 ΞΌΞ±Ο„Ο‚", matches:[
    {id:53, grp:"A", time:"04:00β¦",home:t("CZE","Ξ¤ΟƒΞµΟ‡Ξ―Ξ±"),        away:t("MEX","ΞΞµΞΎΞΉΞΊΟ"),         venue:"Azteca, Ξ ΟΞ»Ξ· ΞΞµΞΎΞΉΞΊΞΏΟ"},
    {id:54, grp:"A", time:"04:00β¦",home:t("ZAF","Ξ. Ξ‘Ο†ΟΞΉΞΊΞ®"),     away:t("KOR","Ξ. ΞΞΏΟΞ­Ξ±"),       venue:"Estadio BBVA, ΞΞΏΞ½Ο„ΞµΟΞ­ΞΉ"},
    {id:55, grp:"E", time:"23:00", home:t("CUW","ΞΞΏΟ…ΟΞ±ΟƒΞ¬ΞΏ"),      away:t("CIV","Ξ‘ΞΊΟ„Ξ® Ξ•Ξ»ΞµΟ†."),     venue:"Lincoln Financial, Philly"},
    {id:56, grp:"E", time:"23:00", home:t("ECU","Ξ•ΞΊΞΏΟ…Ξ±Ξ΄ΟΟ"),      away:t("GER","Ξ“ΞµΟΞΌΞ±Ξ½Ξ―Ξ±"),       venue:"MetLife Stadium, NJ"},
    {id:57, grp:"F", time:"02:00β¦",home:t("JPN","Ξ™Ξ±Ο€Ο‰Ξ½Ξ―Ξ±"),       away:t("SWE","Ξ£ΞΏΟ…Ξ·Ξ΄Ξ―Ξ±"),        venue:"AT&T Stadium, Dallas"},
    {id:58, grp:"F", time:"02:00β¦",home:t("TUN","Ξ¤Ο…Ξ½Ξ·ΟƒΞ―Ξ±"),       away:t("NED","ΞΞ»Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),       venue:"Arrowhead Stadium, KC"},
  ]},
  { label:"Ξ Ξ±Ο 26/06", sub:"6 ΞΌΞ±Ο„Ο‚", matches:[
    {id:59, grp:"D", time:"05:00β¦",home:t("TUR","Ξ¤ΞΏΟ…ΟΞΊΞ―Ξ±"),       away:t("USA","Ξ—Ξ Ξ‘"),            venue:"SoFi Stadium, LA"},
    {id:60, grp:"D", time:"05:00β¦",home:t("PAR","Ξ Ξ±ΟΞ±Ξ³ΞΏΟ…Ξ¬Ξ·"),     away:t("AUS","Ξ‘Ο…ΟƒΟ„ΟΞ±Ξ»Ξ―Ξ±"),      venue:"Levi's Stadium, SF"},
    {id:61, grp:"I", time:"22:00", home:t("NOR","ΞΞΏΟΞ²Ξ·Ξ³Ξ―Ξ±"),      away:t("FRA","Ξ“Ξ±Ξ»Ξ»Ξ―Ξ±"),         venue:"Gillette Stadium, Boston"},
    {id:62, grp:"I", time:"22:00", home:t("SEN","Ξ£ΞµΞ½ΞµΞ³Ξ¬Ξ»Ξ·"),      away:t("IRQ","Ξ™ΟΞ¬ΞΊ"),           venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:63, grp:"H", time:"03:00β¦",home:t("CPV","Ξ Ο. Ξ‘ΞΊΟΟ‰Ο„Ξ®ΟΞΉΞΏ"),away:t("SAU","Ξ£. Ξ‘ΟΞ±Ξ²Ξ―Ξ±"),      venue:"NRG Stadium, Houston"},
    {id:64, grp:"H", time:"03:00β¦",home:t("URU","ΞΟ…ΟΞΏΟ…Ξ³ΞΏΟ…Ξ¬Ξ·"),   away:t("ESP","Ξ™ΟƒΟ€Ξ±Ξ½Ξ―Ξ±"),        venue:"Akron, Ξ“ΞΏΟ…Ξ±Ξ΄Ξ±Ξ»Ξ±Ο‡Ξ¬ΟΞ±"},
  ]},
  { label:"Ξ£Ξ¬Ξ² 27/06", sub:"6 ΞΌΞ±Ο„Ο‚", matches:[
    {id:65, grp:"G", time:"06:00β¦",home:t("EGY","Ξ‘Ξ―Ξ³Ο…Ο€Ο„ΞΏΟ‚"),     away:t("IRN","Ξ™ΟΞ¬Ξ½"),           venue:"Lumen Field, Seattle"},
    {id:66, grp:"G", time:"06:00β¦",home:t("NZL","Ξ. Ξ–Ξ·Ξ»Ξ±Ξ½Ξ΄Ξ―Ξ±"),  away:t("BEL","Ξ’Ξ­Ξ»Ξ³ΞΉΞΏ"),         venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
    {id:67, grp:"L", time:"00:00", home:t("PAN","Ξ Ξ±Ξ½Ξ±ΞΌΞ¬Ο‚"),       away:t("ENG","Ξ‘Ξ³Ξ³Ξ»Ξ―Ξ±"),         venue:"MetLife Stadium, NJ"},
    {id:68, grp:"L", time:"00:00", home:t("CRO","ΞΟΞΏΞ±Ο„Ξ―Ξ±"),       away:t("GHA","Ξ“ΞΊΞ¬Ξ½Ξ±"),          venue:"Lincoln Financial, Philly"},
    {id:69, grp:"K", time:"02:30", home:t("COL","ΞΞΏΞ»ΞΏΞΌΞ²Ξ―Ξ±"),      away:t("POR","Ξ ΞΏΟΟ„ΞΏΞ³Ξ±Ξ»Ξ―Ξ±"),     venue:"Hard Rock Stadium, Miami"},
    {id:70, grp:"K", time:"02:30", home:t("COD","Ξ›Ξ” ΞΞΏΞ½Ξ³ΞΊΟ"),    away:t("UZB","ΞΟ…Ξ¶ΞΌΟ€ΞµΞΊΞΉΟƒΟ„Ξ¬Ξ½"),   venue:"Mercedes-Benz, Atlanta"},
  ]},
  { label:"ΞΟ…Ο 28/06", sub:"3 ΞΌΞ±Ο„Ο‚", matches:[
    {id:71, grp:"J", time:"05:00β¦",home:t("ALG","Ξ‘Ξ»Ξ³ΞµΟΞ―Ξ±"),       away:t("AUT","Ξ‘Ο…ΟƒΟ„ΟΞ―Ξ±"),        venue:"Arrowhead Stadium, KC"},
    {id:72, grp:"J", time:"05:00β¦",home:t("JOR","Ξ™ΞΏΟΞ΄Ξ±Ξ½Ξ―Ξ±"),      away:t("ARG","Ξ‘ΟΞ³ΞµΞ½Ο„ΞΉΞ½Ξ®"),      venue:"AT&T Stadium, Dallas"},
    {id:73, grp:"Ξ’'Ξ¦",time:"22:00",home:{code:"",name:"2Ξ· ΞΞΌ. A"},away:{code:"",name:"2Ξ· ΞΞΌ. B"},  venue:"SoFi Stadium, LA"},
  ]},
  { label:"Ξ”ΞµΟ…β€“Ξ¤ΞµΟ„ 29/6β€“1/7", sub:"Ξ’' Ξ¦Ξ¬ΟƒΞ·", matches:[
    {id:74, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. C"},away:{code:"",name:"2Ξ· ΞΞΌ. F"}, venue:"NRG Stadium, Houston"},
    {id:75, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. E"},away:{code:"",name:"ΞΞ±Ξ». 3Ξ·"},  venue:"Gillette Stadium, Boston"},
    {id:76, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. F"},away:{code:"",name:"2Ξ· ΞΞΌ. C"}, venue:"BBVA, ΞΞΏΞ½Ο„ΞµΟΞ­ΞΉ"},
    {id:77, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. I"},away:{code:"",name:"ΞΞ±Ξ». 3Ξ·"},  venue:"MetLife Stadium, NJ"},
    {id:78, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"2Ξ· ΞΞΌ. E"}, away:{code:"",name:"2Ξ· ΞΞΌ. I"},  venue:"AT&T Stadium, Dallas"},
    {id:79, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. A"},away:{code:"",name:"ΞΞ±Ξ». 3Ξ·"},  venue:"Azteca, Ξ ΟΞ»Ξ· ΞΞµΞΎΞΉΞΊΞΏΟ"},
    {id:80, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. L"},away:{code:"",name:"ΞΞ±Ξ». 3Ξ·"},  venue:"Mercedes-Benz, Atlanta"},
    {id:81, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. B"},away:{code:"",name:"2Ξ· ΞΞΌ. G"}, venue:"Lumen Field, Seattle"},
    {id:82, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. G"},away:{code:"",name:"2Ξ· ΞΞΌ. B"}, venue:"Levi's Stadium, SF"},
    {id:83, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. D"},away:{code:"",name:"2Ξ· ΞΞΌ. J"}, venue:"Hard Rock Stadium, Miami"},
    {id:84, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. J"},away:{code:"",name:"2Ξ· ΞΞΌ. D"}, venue:"BMO Field, Ξ¤ΞΏΟΟΞ½Ο„ΞΏ"},
    {id:85, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. H"},away:{code:"",name:"2Ξ· ΞΞΌ. K"}, venue:"Arrowhead Stadium, KC"},
    {id:86, grp:"Ξ’'Ξ¦",time:"TBD",home:{code:"",name:"ΞΞΉΞΊ. ΞΞΌ. K"},away:{code:"",name:"2Ξ· ΞΞΌ. H"}, venue:"BC Place, Ξ’Ξ±Ξ½ΞΊΞΏΟΞ²ΞµΟ"},
  ]},
  { label:"4β€“8/07", sub:"Ξ“ΟΟΞΏΟ‚ 16", matches:[
    {id:87,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:88,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:89,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:90,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:91,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:92,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:93,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:94,grp:"Ξ“16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
  ]},
  { label:"10β€“13/07", sub:"Ξ ΟΞΏΞ·ΞΌΞΉΟ„ΞµΞ»ΞΉΞΊΞ¬", matches:[
    {id:95,grp:"Ξ Ξ—Ξ¦",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:96,grp:"Ξ Ξ—Ξ¦",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:97,grp:"Ξ Ξ—Ξ¦",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:98,grp:"Ξ Ξ—Ξ¦",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
  ]},
  { label:"14β€“15/07", sub:"Ξ—ΞΌΞΉΟ„ΞµΞ»ΞΉΞΊΞ¬", matches:[
    {id:99, grp:"Ξ—Ξ¦",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"MetLife Stadium, NJ"},
    {id:100,grp:"Ξ—Ξ¦",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"Rose Bowl, LA"},
  ]},
  { label:"19/07", sub:"π† Ξ¤ΞµΞ»ΞΉΞΊΟΟ‚", matches:[
    {id:101,grp:"Ξ¤Ξ›",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"MetLife Stadium, NJ"},
  ]},
];

const ALL_MATCHES = DAYS.flatMap(d => d.matches);





/* β•β• HELPERS β•β• */
function canSeeOther(viewer,other,matchId,ready){return ready?.[viewer]?.[matchId]&&ready?.[other]?.[matchId];}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   LOGIN
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function LoginScreen({onLogin}){
  const [pin,setPin]=useState(""); const [error,setError]=useState(false); const [shake,setShake]=useState(false);
  function press(k){
    if(k==="β«"){setPin(p=>p.slice(0,-1));setError(false);return;}
    if(pin.length>=4)return;
    const next=pin+k; setPin(next);
    if(next.length===4){
      const found=Object.entries(USERS_CONFIG).find(([_k,v])=>v.pin===next);
      if(found){setTimeout(()=>onLogin(found[0]),150);}
      else{setError(true);setShake(true);setTimeout(()=>{setPin("");setShake(false);setError(false);},700);}
    }
  }
  return(
    <div style={{minHeight:"100vh",background:"#080f18",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',sans-serif",padding:24}}>
      <div style={{marginBottom:44,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:10}}>β½</div>
        <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1}}>ΞΞΞ¥ΞΞ¤Ξ™Ξ‘Ξ› 2026</div>
        <div style={{fontSize:11,color:"#3d5166",letterSpacing:4,marginTop:8,textTransform:"uppercase"}}>Ξ¦Ξ―Ξ»ΞΏΞΉ Ξ£Ο„ΞΏΞ―Ο‡Ξ·ΞΌΞ±</div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:36,animation:shake?"shake 0.5s":"none"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<pin.length?(error?"#ef4444":"#22c55e"):"#1a2535",border:`2px solid ${i<pin.length?(error?"#ef4444":"#22c55e"):"#253545"}`,transition:"all 0.15s",boxShadow:i<pin.length&&!error?"0 0 8px #22c55e60":"none"}}/>
        ))}
      </div>
      {error&&<div style={{color:"#ef4444",fontSize:13,marginBottom:16,fontWeight:600}}>Ξ›Ξ¬ΞΈΞΏΟ‚ PIN</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","β«"].map((k,i)=>(
          k===""?<div key={i}/>:
          <button key={i} onClick={()=>press(k)} style={{height:64,borderRadius:14,background:k==="β«"?"#1a2535":"#101c28",border:"1px solid #1a2535",color:k==="β«"?"#ef4444":"#e8eaed",fontSize:k==="β«"?22:24,fontWeight:700,cursor:"pointer"}}>{k}</button>
        ))}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   READY MODAL
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function ReadyModal({match,betCount,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)",padding:20}}>
      <div style={{background:"#111d2b",borderRadius:22,padding:28,width:"100%",maxWidth:400,border:"1px solid #1e2f40",textAlign:"center",animation:"fadeIn 0.2s ease"}}>
        <div style={{fontSize:44,marginBottom:12}}>π”’</div>
        <div style={{fontSize:17,fontWeight:800,color:"#fff",marginBottom:10}}>Ξ”Ξ®Ξ»Ο‰ΟƒΞ· Ξ•Ο„ΞΏΞΉΞΌΟΟ„Ξ·Ο„Ξ±Ο‚</div>
        <div style={{fontSize:13,color:"#5a7080",marginBottom:4,lineHeight:1.5}}>
          {FL(match.home.code)} {match.home.name} vs {FL(match.away.code)} {match.away.name}
        </div>
        {betCount===0
          ?<div style={{fontSize:13,color:"#F59E0B",background:"#F59E0B10",borderRadius:10,padding:"10px 14px",margin:"14px 0",lineHeight:1.6}}>Ξ”ΞµΞ½ Ξ­Ο‡ΞµΞΉΟ‚ ΞΊΞ¬Ξ½ΞµΞΉ ΞΊΞ±ΞΌΞ―Ξ± ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ®.<br/>ΞΞ­Ξ»ΞµΞΉΟ‚ Ξ½Ξ± Ξ΄Ξ·Ξ»ΟΟƒΞµΞΉΟ‚ ΞµΟ„ΞΏΞΉΞΌΟΟ„Ξ·Ο„Ξ± Ο‡Ο‰ΟΞ―Ο‚ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚;</div>
          :<div style={{fontSize:13,color:"#94a3b8",background:"#1a2c3e",borderRadius:10,padding:"10px 14px",margin:"14px 0",lineHeight:1.6}}>ΞΟ‡ΞµΞΉΟ‚ <strong style={{color:"#fff"}}>{betCount}</strong> ΞµΟ€ΞΉΞ»ΞΏΞ³{betCount===1?"Ξ®":"Ξ­Ο‚"}.<br/>ΞΞµΟ„Ξ¬ Ο„Ξ· Ξ΄Ξ®Ξ»Ο‰ΟƒΞ· <strong style={{color:"#ef4444"}}>Ξ΄ΞµΞ½ ΞΌΟ€ΞΏΟΞµΞ―Ο‚ Ξ½Ξ± Ξ±Ξ»Ξ»Ξ¬ΞΎΞµΞΉΟ‚</strong> Ο„Ξ―Ο€ΞΏΟ„Ξ±.<br/>ΞΞ± Ο†Ξ±Ξ½ΞΏΟΞ½ ΞΌΟΞ»ΞΉΟ‚ Ξ΄Ξ·Ξ»ΟΟƒΞΏΟ…Ξ½ ΞΊΞΉ ΞΏΞΉ Ξ¬Ξ»Ξ»ΞΏΞΉ.</div>
        }
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onCancel} style={{flex:1,padding:13,borderRadius:12,background:"#1a2535",border:"none",color:"#8a9db0",fontSize:14,fontWeight:600,cursor:"pointer"}}>Ξ Ξ―ΟƒΟ‰</button>
          <button onClick={onConfirm} style={{flex:2,padding:13,borderRadius:12,background:"#16a34a",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>β“ Ξ•Ξ―ΞΌΞ±ΞΉ ΞΟ„ΞΏΞΉΞΌΞΏΟ‚</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   SCORE MODAL β€” Ο‡ΞµΞΉΟΞΏΞΊΞ―Ξ½Ξ·Ο„Ξ· ΞΊΞ±Ο„Ξ±Ο‡ΟΟΞ·ΟƒΞ· ΟƒΞΊΞΏΟ
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function ScoreModal({match,existing,onSave,onDelete,onCancel}){
  const [h,setH]=useState(existing && existing.home !== undefined ? String(existing.home) : "");
  const [a,setA]=useState(existing && existing.away !== undefined ? String(existing.away) : "");
  const valid = h!==""&&a!==""&&!isNaN(parseInt(h))&&!isNaN(parseInt(a));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}>
      <div style={{background:"#111d2b",borderRadius:"22px 22px 0 0",padding:24,width:"100%",maxWidth:480,border:"1px solid #1e2f40",animation:"slideUp 0.22s ease"}}>
        <div style={{fontSize:12,color:"#5a7080",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>ΞΞ±Ο„Ξ±Ο‡ΟΟΞ·ΟƒΞ· Ξ£ΞΊΞΏΟ</div>
        <div style={{fontSize:13,color:"#8a9db0",marginBottom:16,textAlign:"center"}}>{FL(match.home.code)} {match.home.name} vs {FL(match.away.code)} {match.away.name}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 24px 1fr",alignItems:"center",gap:8,marginBottom:20}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#5a7080",marginBottom:6}}>{match.home.name}</div>
            <input type="number" min="0" max="20" value={h} onChange={e=>setH(e.target.value)}
              style={{width:"100%",padding:"12px 0",background:"#0c1520",border:"2px solid #2d4155",borderRadius:12,color:"#fff",fontSize:32,fontWeight:900,textAlign:"center",outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
          <span style={{textAlign:"center",fontSize:16,color:"#2d4155",fontWeight:700}}>β€“</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#5a7080",marginBottom:6}}>{match.away.name}</div>
            <input type="number" min="0" max="20" value={a} onChange={e=>setA(e.target.value)}
              style={{width:"100%",padding:"12px 0",background:"#0c1520",border:"2px solid #2d4155",borderRadius:12,color:"#fff",fontSize:32,fontWeight:900,textAlign:"center",outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:0}}>
          <button onClick={onCancel} style={{flex:1,padding:13,borderRadius:12,background:"#1a2535",border:"none",color:"#8a9db0",fontSize:14,fontWeight:600,cursor:"pointer"}}>Ξ†ΞΊΟ…ΟΞΏ</button>
          {existing&&<button onClick={onDelete} style={{padding:"13px 14px",borderRadius:12,background:"#ef444418",border:"1px solid #ef444430",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer"}}>Ξ”ΞΉΞ±Ξ³ΟΞ±Ο†Ξ®</button>}
          <button onClick={()=>valid&&onSave(parseInt(h),parseInt(a))} disabled={!valid}
            style={{flex:2,padding:13,borderRadius:12,background:valid?"#2563eb":"#1a2535",border:"none",color:valid?"#fff":"#3d5566",fontSize:14,fontWeight:700,cursor:valid?"pointer":"default"}}>
            β“ Ξ‘Ο€ΞΏΞΈΞ®ΞΊΞµΟ…ΟƒΞ·
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   MARKET ROW
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function MarketRow({market,matchId,userBets,onSelect}){
  const [open,setOpen]=useState(false);
  const sel=userBets?.[matchId]?.[market.id];
  return(
    <div style={{borderBottom:"1px solid #101820",background:sel?"rgba(34,197,94,0.03)":"transparent"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"12px 16px",background:"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:sel?"#22c55e":"#c9d1d9",fontSize:13,fontWeight:sel?600:400,textAlign:"left"}}>
        <span>{market.label}</span>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
          {sel&&<span style={{fontSize:11,background:"#16a34a20",color:"#22c55e",padding:"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{sel.optLabel}</span>}
          <span style={{color:"#2d4155",fontSize:15,transform:open?"rotate(180deg)":"rotate(0)",transition:"0.2s"}}>β„</span>
        </div>
      </button>
      {open&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:7,padding:"4px 16px 13px"}}>
          {market.options.map(opt=>{
            const isSel=sel?.optId===opt.id;
            return <button key={opt.id} onClick={()=>onSelect(market,opt)}
              style={{padding:"7px 14px",borderRadius:10,border:isSel?"2px solid #22c55e":"1px solid #253545",background:isSel?"#16a34a18":"#0d1a26",color:isSel?"#22c55e":"#8a9db0",fontSize:12,fontWeight:isSel?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
              {opt.label}
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   MATCH CARD
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function MatchCard({match,userBets,allBets,ready,scores,results,matchLocked,currentUser,isAdmin,onSelect,onReady,onUnlock,onScoreEdit,onResultEdit,onMatchLockToggle}){
  const [expanded,setExpanded]=useState(false);
  const markets=buildMarkets(match.home,match.away);
  const uc=USERS_CONFIG[currentUser];
  const isLocked=!!ready?.[currentUser]?.[match.id];
  const myBets=Object.entries(userBets?.[match.id]||{});
  const allDone=ALL_USERS.every(u=>ready?.[u]?.[match.id]);
  const waiting=ALL_USERS.filter(u=>!ready?.[u]?.[match.id]);
  const score=scores?.[match.id];
  const matchResults=results?.[match.id]||{};
  const adminLocked=!!matchLocked?.[match.id]; // admin-locked: no edits to score/results

  const othersBets=ALL_USERS.filter(u=>u!==currentUser&&ready?.[u]?.[match.id]).map(u=>({
    user:u,visible:canSeeOther(currentUser,u,match.id,ready),bets:Object.entries(allBets?.[u]?.[match.id]||{})
  }));
  const canUnlock = isLocked && !allDone && othersBets.length===0;

  function betResultColor(matchId,mktId,sel){
    const r=results?.[matchId]?.[`${mktId}_${sel.optId}`];
    if(r===true) return "#22c55e";
    if(r===false) return "#ef4444";
    return null;
  }
  function betResultIcon(matchId,mktId,sel){
    const r=results?.[matchId]?.[`${mktId}_${sel.optId}`];
    if(r===true) return " \u2713";
    if(r===false) return " \u2717";
    return "";
  }

  return(
    <div style={{background:"#0d1a26",border:`1px solid ${adminLocked?"#22c55e30":score?"#2563eb30":isLocked?(allDone?"#22c55e22":"#F59E0B22"):"#141f2b"}`,borderRadius:14,marginBottom:10,overflow:"hidden"}}>

      {/* HEADER */}
      <button onClick={()=>!isLocked&&setExpanded(e=>!e)} style={{width:"100%",background:"transparent",border:"none",cursor:isLocked?"default":"pointer",padding:"13px 16px 10px",textAlign:"left"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:11,color:"#3d5566",fontFamily:"monospace",fontWeight:600}}>{match.time} <span style={{color:"#1e2f40",fontSize:9}}>EEST</span> Β· ΞΞΌ.{match.grp}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,color:"#1e2f40",background:"#0a1520",padding:"2px 7px",borderRadius:8,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.venue}</span>
            {/* Admin lock button β€” top right */}
            {isAdmin&&(
              <button
                onClick={e=>{e.stopPropagation();onMatchLockToggle(match.id);}}
                title={adminLocked?"ΞΞµΞΊΞ»ΞµΞ―Ξ΄Ο‰ΞΌΞ± Ξ±Ο€ΞΏΟ„ΞµΞ»Ξ­ΟƒΞΌΞ±Ο„ΞΏΟ‚":"ΞΞ»ΞµΞ―Ξ΄Ο‰ΞΌΞ± Ξ±Ο€ΞΏΟ„ΞµΞ»Ξ­ΟƒΞΌΞ±Ο„ΞΏΟ‚"}
                style={{background:adminLocked?"#16a34a22":"#1a2535",border:`1px solid ${adminLocked?"#22c55e40":"#253545"}`,borderRadius:7,padding:"3px 7px",cursor:"pointer",fontSize:14,color:adminLocked?"#22c55e":"#4a5568",display:"flex",alignItems:"center"}}>
                {adminLocked?"\uD83D\uDD12":"\uD83D\uDD13"}
              </button>
            )}
            {!isAdmin&&adminLocked&&(
              <span style={{fontSize:13,color:"#22c55e",opacity:0.7}} title="Ξ‘Ο€ΞΏΟ„Ξ­Ξ»ΞµΟƒΞΌΞ± ΞΊΞ»ΞµΞΉΞ΄Ο‰ΞΌΞ­Ξ½ΞΏ">{"\uD83D\uDD12"}</span>
            )}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:6,marginBottom:8}}>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:22}}>{FL(match.home.code)}</span>
            <div style={{fontSize:13,fontWeight:700,color:"#e8eaed",lineHeight:1.2,marginTop:3}}>{match.home.name}</div>
          </div>
          <div style={{textAlign:"center",minWidth:52}}>
            {score
              ?<div style={{background:"#0a1520",border:"1px solid #2563eb40",borderRadius:10,padding:"4px 10px"}}>
                 <span style={{fontSize:20,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{score.home} β€“ {score.away}</span>
               </div>
              :<span style={{fontSize:9,color:"#2d4155",fontWeight:700}}>VS</span>
            }
          </div>
          <div style={{textAlign:"left"}}>
            <span style={{fontSize:22}}>{FL(match.away.code)}</span>
            <div style={{fontSize:13,fontWeight:700,color:"#e8eaed",lineHeight:1.2,marginTop:3}}>{match.away.name}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {isLocked
            ?<span style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:allDone?"#16a34a18":"#92400e18",color:allDone?"#22c55e":"#F59E0B",fontWeight:700}}>{allDone?"β“ ΞΞ»ΞΏΞΉ ΞΟ„ΞΏΞΉΞΌΞΏΞΉ":"π”’ Ξ•ΟƒΟ ΞΟ„ΞΏΞΉΞΌΞΏΟ‚"}</span>
            :<span style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:"#141f2b",color:"#3d5566"}}>+ Ξ•Ο€ΞΉΞ»ΞΏΞ³Ξ­Ο‚ {expanded?"β–²":"β–Ό"}</span>
          }
          {ALL_USERS.filter(u=>u!==currentUser&&ready?.[u]?.[match.id]).map(u=>(
            <span key={u} style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:USERS_CONFIG[u].light,color:USERS_CONFIG[u].color,fontWeight:600}}>{u} β“</span>
          ))}
        </div>
      </button>

      {/* Ξ£ΞΞΞ΅ ΞΞΞ¥ΞΞ Ξ™ β€” ΞΌΟΞ½ΞΏ Ξ³ΞΉΞ± Admin */}
      {isAdmin&&(
        <div style={{padding:"6px 16px 8px",display:"flex",gap:8,borderTop:"1px solid #101820"}}>
          <button onClick={()=>!adminLocked&&onScoreEdit(match)}
            style={{flex:1,padding:"6px 0",background:score?"#2563eb18":"#141f2b",border:`1px solid ${score?"#2563eb40":"#1e2f40"}`,borderRadius:9,color:score?(adminLocked?"#4a5568":"#60a5fa"):"#3d5566",fontSize:11,fontWeight:600,cursor:adminLocked?"default":"pointer",opacity:adminLocked?0.5:1}}>
            {score?`${score.home} β€“ ${score.away}${adminLocked?"":" β"}`:"\u2295 Ξ£ΞΊΞΏΟ"}
          </button>
          {canUnlock&&!adminLocked&&(
            <button onClick={()=>onUnlock(match.id)}
              style={{padding:"6px 12px",background:"#92400e18",border:"1px solid #92400e30",borderRadius:9,color:"#F59E0B",fontSize:11,fontWeight:600,cursor:"pointer"}}>
              β Ξ‘Ξ»Ξ»Ξ±Ξ³Ξ®
            </button>
          )}
        </div>
      )}
      {/* Score display when locked and not admin */}
      {!isAdmin&&score&&adminLocked&&(
        <div style={{padding:"4px 16px 6px",borderTop:"1px solid #101820"}}>
          <span style={{fontSize:10,color:"#22c55e",fontWeight:600}}>β“ Ξ¤ΞµΞ»ΞΉΞΊΟ: {score.home}β€“{score.away}</span>
        </div>
      )}

      {/* ΞΞ™ Ξ”Ξ™ΞΞ•Ξ£ ΞΞΞ¥ Ξ•Ξ Ξ™Ξ›ΞΞ“Ξ•Ξ£ β€” ΟΞ»ΞΏΞΉ ΞΏΞΉ Ο‡ΟΞ®ΟƒΟ„ΞµΟ‚ */}
      {myBets.length>0&&(
        <div style={{borderTop:"1px solid #101820",background:"rgba(0,0,0,0.15)"}}>
          <div style={{padding:"6px 16px 2px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:uc.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,flexShrink:0}}>{uc.avatar}</div>
            <span style={{fontSize:11,fontWeight:700,color:uc.color}}>{currentUser}</span>
          </div>
          {myBets.map(([mktId,sel])=>{
            const rc=betResultColor(match.id,mktId,sel);
            const key=`${mktId}_${sel.optId}`;
            const cur=results?.[match.id]?.[key];
            return(
              <div key={mktId} style={{padding:"3px 16px 3px 44px",display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontSize:11,color:"#3d5566",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.marketLabel}</span>
                <span style={{fontSize:11,fontWeight:700,color:rc||uc.color,background:(rc||uc.color)+"22",padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0}}>
                  {sel.optLabel}{betResultIcon(match.id,mktId,sel)}
                </span>
                {isAdmin&&(
                  <button
                    onClick={()=>!adminLocked&&onResultEdit(match.id,mktId,sel)}
                    style={{background:cur===true?"#16a34a22":cur===false?"#ef444422":"transparent",border:`1px solid ${cur===true?"#22c55e40":cur===false?"#ef444440":"#253545"}`,borderRadius:6,color:cur===true?"#22c55e":cur===false?"#ef4444":"#4a5568",cursor:adminLocked?"default":"pointer",fontSize:13,padding:"2px 7px",flexShrink:0,opacity:adminLocked?0.4:1}}>
                    {cur===undefined?"β—":cur===true?"β“":"β—"}
                  </button>
                )}
              </div>
            );
          })}
          <div style={{height:8}}/>
        </div>
      )}

      {/* ADMIN: Ξ²Ξ»Ξ­Ο€ΞµΞΉ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚ Ξ¬Ξ»Ξ»Ο‰Ξ½ ΞΌΟΞ½ΞΏ Ξ±Ξ½ Ξ­Ο‡ΞΏΟ…Ξ½ Ξ΄Ξ·Ξ»ΟΟƒΞµΞΉ ΞµΟ„ΞΏΞΉΞΌΟΟ„Ξ·Ο„Ξ± ΞΞ‘Ξ™ ΞΞ™ Ξ”Ξ¥Ξ */}
      {isAdmin&&ALL_USERS.filter(u=>u!==currentUser).map(u=>{
        const uConf=USERS_CONFIG[u];
        const uBets=Object.entries(allBets?.[u]?.[match.id]||{});
        const uReady=!!ready?.[u]?.[match.id];
        const iReady=!!ready?.[currentUser]?.[match.id];
        const visible=uReady&&iReady;
        if(!uReady) return null;
        return(
          <div key={u} style={{borderTop:"1px solid #101820",background:"rgba(0,0,0,0.12)"}}>
            <div style={{padding:"5px 16px 2px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:uConf.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,flexShrink:0}}>{uConf.avatar}</div>
              <span style={{fontSize:11,fontWeight:700,color:uConf.color}}>{u}</span>
              {!visible&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>π”’ Ξ”Ξ®Ξ»Ο‰ΟƒΞµ ΞΊΞΉ ΞµΟƒΟ Ξ³ΞΉΞ± Ξ½Ξ± Ξ΄ΞµΞΉΟ‚</span>}
              {visible&&uBets.length===0&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>Ξ§Ο‰ΟΞ―Ο‚ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚</span>}
            </div>
            {visible&&uBets.map(([mktId,sel])=>{
              const rc=betResultColor(match.id,mktId,sel);
              const key=`${mktId}_${sel.optId}`;
              const cur=results?.[match.id]?.[key];
              return(
                <div key={mktId} style={{padding:"3px 16px 3px 40px",display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:10,color:"#3d5566",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.marketLabel}</span>
                  <span style={{fontSize:11,fontWeight:700,color:rc||uConf.color,background:(rc||uConf.color)+"22",padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0}}>
                    {sel.optLabel}{betResultIcon(match.id,mktId,sel)}
                  </span>
                  <button
                    onClick={()=>!adminLocked&&onResultEdit(match.id,mktId,sel)}
                    style={{background:cur===true?"#16a34a22":cur===false?"#ef444422":"transparent",border:`1px solid ${cur===true?"#22c55e40":cur===false?"#ef444440":"#253545"}`,borderRadius:6,color:cur===true?"#22c55e":cur===false?"#ef4444":"#4a5568",cursor:adminLocked?"default":"pointer",fontSize:13,padding:"2px 7px",flexShrink:0,opacity:adminLocked?0.4:1}}>
                    {cur===undefined?"β—":cur===true?"β“":"β—"}
                  </button>
                </div>
              );
            })}
            <div style={{height:6}}/>
          </div>
        );
      })}

      {/* Ξ•Ξ Ξ™Ξ›ΞΞ“Ξ•Ξ£ Ξ‘Ξ›Ξ›Ξ©Ξ β€” ΞΌΟΞ½ΞΏ Ξ³ΞΉΞ± non-admin Ο‡ΟΞ®ΟƒΟ„ΞµΟ‚ (ΞΏ Teo Ο„Ξ± Ξ²Ξ»Ξ­Ο€ΞµΞΉ Ο€Ξ¬Ξ½Ο‰) */}
      {!isAdmin&&othersBets.map(({user,visible,bets})=>{
        const uConf=USERS_CONFIG[user];
        return(
          <div key={user} style={{borderTop:"1px solid #101820",background:"rgba(0,0,0,0.1)"}}>
            <div style={{padding:"6px 16px 2px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:uConf.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,flexShrink:0}}>{uConf.avatar}</div>
              <span style={{fontSize:11,fontWeight:700,color:uConf.color}}>{user}</span>
              {!visible&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>π”’ Ξ”Ξ®Ξ»Ο‰ΟƒΞµ ΞΊΞΉ ΞµΟƒΟ Ξ³ΞΉΞ± Ξ½Ξ± Ξ΄ΞµΞΉΟ‚</span>}
              {visible&&bets.length===0&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>Ξ§Ο‰ΟΞ―Ο‚ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚</span>}
            </div>
            {visible&&bets.map(([mktId,sel])=>{
              const rc=betResultColor(match.id,mktId,sel);
              return(
                <div key={mktId} style={{padding:"3px 16px 3px 44px",display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:11,color:"#3d5566",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.marketLabel}</span>
                  <span style={{fontSize:11,fontWeight:700,color:rc||uConf.color,background:(rc||uConf.color)+"22",padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0}}>
                    {sel.optLabel}{betResultIcon(match.id,mktId,sel)}
                  </span>
                </div>
              );
            })}
            <div style={{height:visible&&bets.length>0?8:4}}/>
          </div>
        );
      })}

      {/* WAITING */}
      {isLocked&&waiting.length>0&&(
        <div style={{borderTop:"1px solid #101820",padding:"7px 16px 9px",display:"flex",gap:5,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#3d5566"}}>Ξ ΞµΟΞΉΞΌΞ­Ξ½ΞµΞΉ:</span>
          {waiting.map(u=><span key={u} style={{fontSize:11,color:USERS_CONFIG[u].color,fontWeight:700}}>{u}</span>)}
        </div>
      )}

      {/* ACCORDION Ξ‘Ξ“ΞΞ΅Ξ©Ξ β€” ΟΞ»ΞΏΞΉ ΞΏΞΉ Ο‡ΟΞ®ΟƒΟ„ΞµΟ‚ */}
      {!isLocked&&expanded&&(
        <div style={{borderTop:"1px solid #1a2d3e"}}>
          {markets.map(m=>(
            <MarketRow key={m.id} market={m} matchId={match.id} userBets={userBets} onSelect={onSelect}/>
          ))}
          <div style={{padding:14}}>
            <button onClick={e=>{e.stopPropagation();onReady(match);}}
              style={{width:"100%",padding:12,borderRadius:12,background:"#16a34a",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              π”’ Ξ”Ξ®Ξ»Ο‰ΟƒΞ· Ξ•Ο„ΞΏΞΉΞΌΟΟ„Ξ·Ο„Ξ±Ο‚
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   STATS TAB
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function StatsTab({allBets,ready,results}){
  const MKT_DISPLAY=[
    {id:"1x2",    label:"Ξ¤ΞµΞ»ΞΉΞΊΟ Ξ‘Ο€ΞΏΟ„Ξ­Ξ»ΞµΟƒΞΌΞ±", icon:"π†"},
    {id:"dc",     label:"Ξ”ΞΉΟ€Ξ»Ξ® Ξ•Ο…ΞΊΞ±ΞΉΟΞ―Ξ±",    icon:"π―"},
    {id:"ou",     label:"Over/Under Ξ“ΞΊΞΏΞ»",    icon:"β½"},
    {id:"btts",   label:"GG/NG",              icon:"π¥…"},
    {id:"ht",     label:"1ΞΏ Ξ—ΞΌΞ―Ο‡. Ξ‘Ο€ΞΏΟ„Ξ­Ξ».",  icon:"β±"},
    {id:"htou",   label:"1ΞΏ Ξ—ΞΌΞ―Ο‡. Over/Under",icon:"π“"},
    {id:"home_ou",label:"Ξ“ΞΊΞΏΞ» Ξ“Ξ·Ο€ΞµΞ΄ΞΏΟΟ‡ΞΏΟ…",   icon:"π "},
    {id:"away_ou",label:"Ξ“ΞΊΞΏΞ» Ξ¦ΞΉΞ»ΞΏΞΎ.",       icon:"βοΈ"},
    {id:"ggou",   label:"GG Ξ® Over 2.5",      icon:"π’¥"},
  ];

  function calcStats(user){
    const betsMap=allBets?.[user]||{};
    // per market: {total, won}
    const mktStats={};
    MKT_IDS.forEach(id=>{mktStats[id]={total:0,won:0};});
    let total=0,won=0,lost=0;
    Object.entries(betsMap).forEach(([matchId,matchBets])=>{
      Object.entries(matchBets).forEach(([mktId,sel])=>{
        if(mktStats[mktId]!==undefined) mktStats[mktId].total++;
        total++;
        const r=results?.[matchId]?.[`${mktId}_${sel.optId}`];
        if(r===true){ won++; if(mktStats[mktId])mktStats[mktId].won++; }
        if(r===false) lost++;
      });
    });
    const readyCount=Object.values(ready?.[user]||{}).filter(Boolean).length;
    return{mktStats,total,readyCount,won,lost,pending:total-won-lost};
  }

  // Overall pct string
  function pct(w,t){ if(t===0)return"β€“"; return `${Math.round(w/t*100)}% (${w}/${t})`; }

  return(
    <div style={{padding:"16px 14px 100px"}}>
      <h2 style={{fontSize:12,color:"#3d5566",letterSpacing:2,textTransform:"uppercase",margin:"0 0 16px",fontWeight:700}}>Ξ£Ο„Ξ±Ο„ΞΉΟƒΟ„ΞΉΞΊΞ¬ Ξ Ξ±ΞΉΞΊΟ„ΟΞ½</h2>

      {/* Summary comparison row */}
      <div style={{background:"#0d1a26",border:"1px solid #141f2b",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#3d5566",letterSpacing:1,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>Ξ£ΟΞ³ΞΊΟΞΉΟƒΞ·</div>
        <div style={{display:"flex",gap:10}}>
          {ALL_USERS.map(user=>{
            const uc=USERS_CONFIG[user];
            const{total,won,lost}=calcStats(user);
            const judged=won+lost;
            const p=judged>0?Math.round(won/judged*100):null;
            return(
              <div key={user} style={{flex:1,background:uc.light,border:`1px solid ${uc.color}25`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:uc.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,margin:"0 auto 6px"}}>{uc.avatar}</div>
                <div style={{fontSize:11,fontWeight:700,color:uc.color,marginBottom:4}}>{user}</div>
                <div style={{fontSize:18,fontWeight:900,color:p!==null?"#fff":"#3d5566"}}>{p!==null?`${p}%`:"β€“"}</div>
                <div style={{fontSize:9,color:"#3d5566",marginTop:2}}>{won}/{judged} ΟƒΟ‰ΟƒΟ„Ξ­Ο‚</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-user detailed card */}
      {ALL_USERS.map(user=>{
        const uc=USERS_CONFIG[user];
        const{mktStats,total,readyCount,won,lost,pending}=calcStats(user);
        const judged=won+lost;
        return(
          <div key={user} style={{marginBottom:20,background:"#0d1a26",border:`1px solid ${uc.color}20`,borderRadius:14,overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"13px 16px",background:uc.light,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${uc.color}18`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:uc.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900}}>{uc.avatar}</div>
                <span style={{fontWeight:800,color:uc.color,fontSize:15}}>{user}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,fontWeight:900,color:judged>0?"#fff":"#3d5566",lineHeight:1}}>
                  {judged>0?`${Math.round(won/judged*100)}%`:"β€“"}
                </div>
                <div style={{fontSize:9,color:"#3d5566",marginTop:1}}>ΟƒΟ…Ξ½ΞΏΞ»ΞΉΞΊΟ Ο€ΞΏΟƒΞΏΟƒΟ„Ο</div>
              </div>
            </div>

            {/* Summary pills */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"12px 16px",borderBottom:"1px solid #141f2b"}}>
              {[
                {label:"Ξ•Ο€ΞΉΞ»ΞΏΞ³Ξ­Ο‚",  val:total,   col:"#e8eaed"},
                {label:"β“ Ξ£Ο‰ΟƒΟ„Ξ­Ο‚",  val:won,     col:"#22c55e"},
                {label:"β— Ξ›Ξ¬ΞΈΞΏΟ‚",   val:lost,    col:"#ef4444"},
                {label:"β³ Ξ•ΞΊΞΊΟΞµΞΌ.", val:pending, col:"#F59E0B"},
                {label:"ΞΞ±Ο„Ο‚ β“",    val:readyCount, col:"#8a9db0"},
              ].map(p=>(
                <div key={p.label} style={{background:"#141f2b",borderRadius:10,padding:"6px 12px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:p.col}}>{p.val}</div>
                  <div style={{fontSize:9,color:"#3d5566",marginTop:1}}>{p.label}</div>
                </div>
              ))}
            </div>

            {/* Per-market breakdown with % (W/T) */}
            <div style={{padding:"10px 16px 14px"}}>
              <div style={{fontSize:10,color:"#3d5566",letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Ξ‘Ξ½Ξ¬ Ξ‘Ξ³ΞΏΟΞ¬</div>
              {MKT_DISPLAY.map(m=>{
                const ms=mktStats[m.id]||{total:0,won:0};
                const hasBets=ms.total>0;
                const hasResult=ms.won>0||(ms.total>0&&(ms.total-(ms.won))>0);
                // judged for this market: we need to track lost per market too
                // Since we only track won in mktStats, compute judged from results
                // Actually let's compute judged properly
                const judgedMkt = (() => {
                  let w=0,l=0;
                  const betsMap=allBets?.[user]||{};
                  Object.entries(betsMap).forEach(([matchId,matchBets])=>{
                    Object.entries(matchBets).forEach(([mktId2,sel])=>{
                      if(mktId2!==m.id)return;
                      const r=results?.[matchId]?.[`${mktId2}_${sel.optId}`];
                      if(r===true)w++;
                      if(r===false)l++;
                    });
                  });
                  return{w,l,j:w+l};
                })();
                const barPct = judgedMkt.j>0 ? Math.round(judgedMkt.w/judgedMkt.j*100) : 0;
                return(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,opacity:hasBets?1:0.3}}>
                    <span style={{fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{m.icon}</span>
                    <span style={{fontSize:11,color:"#8a9db0",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      {judgedMkt.j>0&&(
                        <div style={{height:4,width:40,background:"#141f2b",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${barPct}%`,background:barPct>=50?"#22c55e":"#ef4444",borderRadius:4}}/>
                        </div>
                      )}
                      <span style={{fontSize:11,fontWeight:700,color:hasBets?uc.color:"#2d4155",minWidth:60,textAlign:"right"}}>
                        {judgedMkt.j>0
                          ? `${barPct}% (${judgedMkt.w}/${judgedMkt.j})`
                          : ms.total>0 ? `${ms.total} ΞµΞΊΞΊΟ.` : "β€“"
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   BANKROLL TAB
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
function BankrollTab({bankroll,isAdmin,onUpdate}){
  const INITIAL=bankroll.initial||300;
  const bets=bankroll.bets||[];

  // Ξ¥Ο€ΞΏΞ»ΞΏΞ³ΞΉΟƒΞΌΟΟ‚ Ο„ΟΞ­Ο‡ΞΏΞ½Ο„ΞΏΟ‚ ΞΊΞµΟ†Ξ±Ξ»Ξ±Ξ―ΞΏΟ…
  function calcCurrent(betList){
    return betList.reduce((cap,b)=>{
      if(b.result==="win") return cap+(b.stake*(b.odds-1));
      if(b.result==="loss") return cap-b.stake;
      return cap;
    },INITIAL);
  }

  const current=calcCurrent(bets);
  const diff=current-INITIAL;

  // Ξ•Ο€ΟΞΌΞµΞ½ΞΏ stake = 10% Ο„ΟΞ­Ο‡ΞΏΞ½Ο„ΞΏΟ‚
  const nextStake=Math.round(current*0.1*100)/100;

  // State for new bet form
  const [newOdds,setNewOdds]=useState("");

  async function addBet(){
    const odds=parseFloat(newOdds);
    if(isNaN(odds)||odds<1.01)return;
    const bet={id:Date.now(),odds,stake:nextStake,result:null,ts:new Date().toLocaleDateString("el-GR")};
    const nb={...bankroll,bets:[bet,...bets]};
    setNewOdds("");
    await onUpdate(nb);
  }

  async function setResult(id,result){
    const nb={...bankroll,bets:bets.map(b=>b.id===id?{...b,result}:b)};
    await onUpdate(nb);
  }

  async function deleteBet(id){
    const nb={...bankroll,bets:bets.filter(b=>b.id!==id)};
    await onUpdate(nb);
  }

  return(
    <div style={{padding:"14px 14px 100px"}}>
      {/* Capital summary */}
      <div style={{background:"#0d1a26",border:"1px solid #141f2b",borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:4}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Ξ‘ΟΟ‡ΞΉΞΊΟ</div>
            <div style={{fontSize:20,fontWeight:900,color:"#e8eaed"}}>{INITIAL.toFixed(0)}β‚¬</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Ξ¤ΟΞ­Ο‡ΞΏΞ½</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{current.toFixed(2)}β‚¬</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Ξ”ΞΉΞ±Ο†ΞΏΟΞ¬</div>
            <div style={{fontSize:20,fontWeight:900,color:diff>0?"#22c55e":diff<0?"#ef4444":"#8a9db0"}}>
              {diff>0?"+":""}{diff.toFixed(2)}β‚¬
            </div>
          </div>
        </div>
        <div style={{marginTop:10,background:"#141f2b",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#5a7080"}}>Ξ•Ο€ΟΞΌΞµΞ½ΞΏ Ξ£Ο„ΞΏΞ―Ο‡Ξ·ΞΌΞ± (10%)</span>
          <span style={{fontSize:14,fontWeight:800,color:"#F59E0B"}}>{nextStake.toFixed(2)}β‚¬</span>
        </div>
      </div>

      {/* New bet form β€” ΞΌΟΞ½ΞΏ admin */}
      {isAdmin&&(
        <div style={{background:"#0d1a26",border:"1px solid #F59E0B30",borderRadius:14,padding:"14px",marginBottom:16}}>
          <div style={{fontSize:11,color:"#F59E0B",fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>+ ΞΞ­ΞΏ Ξ£Ο„ΞΏΞ―Ο‡Ξ·ΞΌΞ±</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <input
                type="number" step="0.01" min="1.01" placeholder="Ξ‘Ο€ΟΞ΄ΞΏΟƒΞ·"
                value={newOdds} onChange={e=>setNewOdds(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addBet()}
                style={{width:"100%",padding:"12px 14px",background:"#0a1520",border:"1px solid #253545",borderRadius:10,color:"#fff",fontSize:20,fontWeight:700,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{display:"flex",alignItems:"center",background:"#141f2b",borderRadius:10,padding:"0 14px",flexShrink:0}}>
              <span style={{fontSize:14,color:"#F59E0B",fontWeight:700}}>{nextStake.toFixed(2)}β‚¬</span>
            </div>
            <button onClick={addBet}
              style={{padding:"12px 18px",background:"#F59E0B",border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:18,cursor:"pointer",flexShrink:0}}>
              +
            </button>
          </div>
        </div>
      )}

      {/* Bets list */}
      <div style={{fontSize:11,color:"#3d5566",letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontWeight:700}}>
        Ξ™ΟƒΟ„ΞΏΟΞΉΞΊΟ ({bets.length})
      </div>
      {bets.length===0&&(
        <div style={{color:"#2d4155",fontSize:13,textAlign:"center",padding:24}}>ΞΞ±Ξ½Ξ­Ξ½Ξ± ΟƒΟ„ΞΏΞ―Ο‡Ξ·ΞΌΞ± Ξ±ΞΊΟΞΌΞ±</div>
      )}
      {bets.map((b,i)=>{
        const isWin=b.result==="win";
        const isLoss=b.result==="loss";
        const isPending=!b.result;
        const profit=isWin?b.stake*(b.odds-1):isLoss?-b.stake:null;
        return(
          <div key={b.id} style={{background:"#0d1a26",border:`1px solid ${isWin?"#22c55e30":isLoss?"#ef444430":"#141f2b"}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{display:"flex",gap:10,alignItems:"center",flex:1,minWidth:0,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"#3d5566",flexShrink:0}}>{b.ts}</span>
                <span style={{fontSize:16,color:"#F59E0B",fontWeight:800,fontFamily:"monospace",flexShrink:0}}>@{b.odds}</span>
                <span style={{fontSize:14,color:"#8a9db0",fontFamily:"monospace",flexShrink:0}}>{b.stake.toFixed(2)}β‚¬</span>
                {profit!==null&&(
                  <span style={{fontSize:14,fontWeight:800,color:profit>=0?"#22c55e":"#ef4444",fontFamily:"monospace",flexShrink:0}}>
                    {profit>=0?"+":""}{profit.toFixed(2)}β‚¬
                  </span>
                )}
              </div>
              {/* Result badge */}
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                {isPending&&isAdmin&&(
                  <>
                    <button onClick={()=>setResult(b.id,"win")}
                      style={{padding:"5px 10px",background:"#16a34a20",border:"1px solid #22c55e40",borderRadius:8,color:"#22c55e",fontSize:12,fontWeight:700,cursor:"pointer"}}>β“</button>
                    <button onClick={()=>setResult(b.id,"loss")}
                      style={{padding:"5px 10px",background:"#ef444420",border:"1px solid #ef444440",borderRadius:8,color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>β—</button>
                  </>
                )}
                {!isPending&&(
                  <span style={{padding:"4px 12px",background:isWin?"#16a34a20":"#ef444420",border:`1px solid ${isWin?"#22c55e40":"#ef444440"}`,borderRadius:8,color:isWin?"#22c55e":"#ef4444",fontSize:12,fontWeight:700}}>
                    {isWin?"β“ ΞΞµΟΞ΄Ξ―ΟƒΞ±ΞΌΞµ":"β— Ξ§Ξ¬ΟƒΞ±ΞΌΞµ"}
                  </span>
                )}
                {isPending&&(
                  <span style={{padding:"4px 10px",background:"#F59E0B18",border:"1px solid #F59E0B30",borderRadius:8,color:"#F59E0B",fontSize:11}}>β³</span>
                )}
                {isAdmin&&!isPending&&(
                  <button onClick={()=>setResult(b.id,null)}
                    style={{padding:"4px 8px",background:"transparent",border:"1px solid #253545",borderRadius:8,color:"#4a5568",fontSize:11,cursor:"pointer"}}>β†©</button>
                )}
                {isAdmin&&isPending&&(
                  <button onClick={()=>deleteBet(b.id)}
                    style={{padding:"4px 8px",background:"transparent",border:"1px solid #253545",borderRadius:8,color:"#4a5568",fontSize:11,cursor:"pointer"}}>β•</button>
                )}
              </div>
            </div>
            {/* Capital after this bet */}
            {!isPending&&(
              <div style={{fontSize:10,color:"#3d5566",borderTop:"1px solid #141f2b",paddingTop:6,marginTop:4}}>
                ΞΞµΟ†Ξ¬Ξ»Ξ±ΞΉΞΏ ΞΌΞµΟ„Ξ¬: <span style={{color:"#8a9db0",fontWeight:700}}>{calcCurrent(bets.slice(i)).toFixed(2)}β‚¬</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


function MatchesTab({userBets,allBets,ready,scores,results,matchLocked,currentUser,isAdmin,onSelect,onReady,onUnlock,onScoreEdit,onResultEdit,onMatchLockToggle}){
  const uc=USERS_CONFIG[currentUser];
  const [activeDay,setActiveDay]=useState(0);
  const day=DAYS[activeDay];
  function dayCnt(d){return d.matches.reduce((a,m)=>a+Object.keys(userBets[m.id]||{}).length,0);}
  return(
    <div>
      <div style={{display:"flex",overflowX:"auto",padding:"10px 12px",gap:6,borderBottom:"1px solid #141f2b",scrollbarWidth:"none"}}>
        {DAYS.map((d,i)=>{
          const active=activeDay===i; const cnt=dayCnt(d);
          return(
            <button key={i} onClick={()=>setActiveDay(i)}
              style={{flexShrink:0,padding:"5px 9px",borderRadius:8,border:active?`1px solid ${uc.color}`:"1px solid #141f2b",background:active?uc.light:"#0a1520",color:active?uc.color:"#3d5566",fontSize:10,fontWeight:700,cursor:"pointer",position:"relative",whiteSpace:"nowrap",textAlign:"center",minWidth:54}}>
              <div>{d.label}</div>
              <div style={{fontSize:9,opacity:0.6,marginTop:1}}>{d.sub}</div>
              {cnt>0&&<span style={{position:"absolute",top:-5,right:-5,width:14,height:14,borderRadius:"50%",background:uc.color,color:"#000",fontSize:7,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{cnt}</span>}
            </button>
          );
        })}
      </div>
      <div style={{padding:"12px 12px 100px"}}>
        <div style={{fontSize:10,color:"#3d5566",marginBottom:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{day.label} Β· {day.sub}</div>
        {day.matches.map(match=>(
          <MatchCard key={match.id} match={match} userBets={userBets} allBets={allBets} ready={ready} scores={scores} results={results} matchLocked={matchLocked} currentUser={currentUser} isAdmin={isAdmin}
            onSelect={(market,option)=>onSelect(market,option,match)}
            onReady={()=>onReady(match)}
            onUnlock={onUnlock}
            onScoreEdit={onScoreEdit}
            onResultEdit={onResultEdit}
            onMatchLockToggle={onMatchLockToggle}
          />
        ))}
      </div>
    </div>
  );
}

/* β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•
   MAIN APP
β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β•β• */
export default function App(){
  // Auto-login: Ξ΄ΞΉΞ±Ξ²Ξ¬Ξ¶ΞΏΟ…ΞΌΞµ Ξ±Ο€ΞΏΞΈΞ·ΞΊΞµΟ…ΞΌΞ­Ξ½ΞΏ Ο‡ΟΞ®ΟƒΟ„Ξ· Ξ±Ο€Ο localStorage
  const [currentUser,setCurrentUser]=useState(()=>{
    try {
      const saved = localStorage.getItem("mundial2026_user");
      if(saved && USERS_CONFIG[saved]) return saved;
    } catch(e) {}
    return null;
  });
  const [allBets,setAllBets]=useState({});
  const [ready,setReady]=useState({});
  const [scores,setScores]=useState({});
  const [results,setResults]=useState({});
  const [matchLocked,setMatchLocked]=useState({});
  const [bankroll,setBankroll]=useState({bets:[],initial:300});
  const [tab,setTab]=useState("matches");
  const [pendingReady,setPendingReady]=useState(null);
  const [scoreEdit,setScoreEdit]=useState(null);
  const [loaded,setLoaded]=useState(false);

  // Ξ‘Ο€ΞΏΞΈΞ®ΞΊΞµΟ…ΟƒΞ· Ο‡ΟΞ®ΟƒΟ„Ξ· ΟƒΟ„ΞΏ localStorage ΞΊΞ¬ΞΈΞµ Ο†ΞΏΟΞ¬ Ο€ΞΏΟ… Ξ±Ξ»Ξ»Ξ¬Ξ¶ΞµΞΉ
  function handleLogin(user){
    try { localStorage.setItem("mundial2026_user", user); } catch(e) {}
    setCurrentUser(user);
    setTab("matches");
  }
  function handleLogout(){
    try { localStorage.removeItem("mundial2026_user"); } catch(e) {}
    setCurrentUser(null);
  }

  // Real-time Firebase subscription β€” loads everything once and listens for changes
  useEffect(()=>{
    const unsubs = [];
    let loadCount = 0;
    const total = 6;
    function checkLoaded(){ loadCount++; if(loadCount>=total) setLoaded(true); }

    unsubs.push(dbSubscribe("bets",       v=>{ setAllBets(v||{});       checkLoaded(); }));
    unsubs.push(dbSubscribe("ready",      v=>{ setReady(v||{});         checkLoaded(); }));
    unsubs.push(dbSubscribe("scores",     v=>{ setScores(v||{});        checkLoaded(); }));
    unsubs.push(dbSubscribe("results",    v=>{ setResults(v||{});       checkLoaded(); }));
    unsubs.push(dbSubscribe("matchLocked",v=>{ setMatchLocked(v||{});   checkLoaded(); }));
    unsubs.push(dbSubscribe("bankroll",   v=>{ if(v) setBankroll(v);    checkLoaded(); }));

    return ()=>{ unsubs.forEach(fn=>fn && fn()); };
  },[]);

  async function persistBets(nb){setAllBets(nb);await dbSet("bets",nb);}
  async function persistReady(nr){setReady(nr);await dbSet("ready",nr);}
  async function persistScores(ns){setScores(ns);await dbSet("scores",ns);}
  async function persistResults(nr){setResults(nr);await dbSet("results",nr);}
  async function persistMatchLocked(nm){setMatchLocked(nm);await dbSet("matchLocked",nm);}
  async function persistBankroll(nb){setBankroll(nb);await dbSet("bankroll",nb);}

  async function handleMatchLockToggle(matchId){
    const nm={...matchLocked,[matchId]:!matchLocked[matchId]};
    if(!nm[matchId]) delete nm[matchId];
    await persistMatchLocked(nm);
  }

  // Ξ†ΞΌΞµΟƒΞ· ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ® Ο‡Ο‰ΟΞ―Ο‚ modal Ξ±Ο€ΞΏΞ΄ΟΟƒΞµΟ‰Ξ½
  async function handleSelect(market,option,match){
    if(ready?.[currentUser]?.[match.id])return;
    const existing=allBets?.[currentUser]?.[match.id]?.[market.id];
    let nb;
    if(existing&&existing.optId===option.id){
      const mb={...(allBets?.[currentUser]?.[match.id]||{})};
      delete mb[market.id];
      nb={...allBets,[currentUser]:{...(allBets[currentUser]||{}),[match.id]:mb}};
    }else{
      nb={...allBets,[currentUser]:{...(allBets[currentUser]||{}),[match.id]:{...(allBets?.[currentUser]?.[match.id]||{}),[market.id]:{optId:option.id,optLabel:option.label,marketLabel:market.label}}}};
    }
    await persistBets(nb);
  }

  async function confirmReady(match){
    const nr={...ready,[currentUser]:{...(ready[currentUser]||{}),[match.id]:true}};
    setPendingReady(null);
    await persistReady(nr);
  }

  // ΞΞµΞΊΞ»ΞµΞ―Ξ΄Ο‰ΞΌΞ± ΞΌΞ±Ο„Ο‚ (ΞΌΟΞ½ΞΏ Ξ±Ξ½ Ξ΄ΞµΞ½ Ξ­Ο‡ΞΏΟ…Ξ½ Ξ±Ο€ΞΏΞΊΞ±Ξ»Ο…Ο†ΞΈΞµΞ―)
  async function handleUnlock(matchId){
    const nr={...ready,[currentUser]:{...(ready[currentUser]||{})}};
    delete nr[currentUser][matchId];
    await persistReady(nr);
  }

  // Ξ‘Ο€ΞΏΞΈΞ®ΞΊΞµΟ…ΟƒΞ· ΟƒΞΊΞΏΟ
  async function handleScoreSave(match,homeGoals,awayGoals){
    const ns={...scores,[match.id]:{home:homeGoals,away:awayGoals}};
    setScoreEdit(null);
    await persistScores(ns);
  }

  // Ξ”ΞΉΞ±Ξ³ΟΞ±Ο†Ξ® ΟƒΞΊΞΏΟ
  async function handleScoreDelete(match){
    const ns={...scores};
    delete ns[match.id];
    setScoreEdit(null);
    await persistScores(ns);
  }

  // Toggle Ξ±Ο€ΞΏΟ„Ξ­Ξ»ΞµΟƒΞΌΞ± Ο€ΟΟΞ²Ξ»ΞµΟΞ·Ο‚: null β†’ true β†’ false β†’ null
  async function handleResultEdit(matchId,mktId,sel){
    const key=`${mktId}_${sel.optId}`;
    const cur=results?.[matchId]?.[key];
    const next = cur===undefined?true : cur===true?false : undefined;
    const matchRes={...(results[matchId]||{})};
    if(next===undefined) delete matchRes[key];
    else matchRes[key]=next;
    const nr={...results,[matchId]:matchRes};
    await persistResults(nr);
  }

  if(!currentUser) return <LoginScreen onLogin={handleLogin}/>;
  if(!loaded) return <div style={{minHeight:"100vh",background:"#080f18",display:"flex",alignItems:"center",justifyContent:"center",color:"#3d5566"}}>Ξ¦ΟΟΟ„Ο‰ΟƒΞ·...</div>;

  const uc=USERS_CONFIG[currentUser];
  const isAdmin=!!uc.isAdmin;
  const userBets=allBets[currentUser]||{};
  const totalBets=Object.values(userBets).reduce((a,m)=>a+Object.keys(m).length,0);

  return(
    <div style={{minHeight:"100vh",background:"#080f18",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e8eaed",maxWidth:480,margin:"0 auto"}}>
      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(8,15,24,0.97)",backdropFilter:"blur(16px)",borderBottom:"1px solid #141f2b",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>β½</span>
          <div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:0.5}}>ΞΞΞ¥ΞΞ¤Ξ™Ξ‘Ξ› 2026</div>
            <div style={{fontSize:8,color:"#2d4155",letterSpacing:1}}>USA Β· CAN Β· MEX Β· Ξ©Ξ΅Ξ‘ Ξ•Ξ›Ξ›Ξ‘Ξ”ΞΞ£</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:uc.light,border:`1px solid ${uc.color}35`,borderRadius:20,padding:"4px 10px 4px 7px"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:uc.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900}}>{uc.avatar}</div>
            <span style={{color:uc.color,fontSize:12,fontWeight:700}}>{currentUser}</span>
            {isAdmin&&<span style={{fontSize:9,color:"#ef4444",background:"#ef444420",borderRadius:8,padding:"1px 5px",fontWeight:800}}>ADMIN</span>}
            {!isAdmin&&totalBets>0&&<span style={{fontSize:10,color:uc.color,background:uc.color+"30",borderRadius:10,padding:"0 5px",fontWeight:800}}>{totalBets}</span>}
          </div>
          <button onClick={handleLogout} style={{background:"#141f2b",border:"none",color:"#3d5566",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11}}>β†©</button>
        </div>
      </div>
      {/* TABS */}
      <div style={{display:"flex",background:"#0d1a26",borderBottom:"1px solid #141f2b",padding:"0 14px"}}>
        {[{id:"matches",label:"β½ Ξ‘Ξ³ΟΞ½ΞµΟ‚"},{id:"coupon",label:"π« Ξ”ΞµΞ»Ο„Ξ―ΞΏ"},{id:"stats",label:"π“ Ξ£Ο„Ξ±Ο„ΞΉΟƒΟ„ΞΉΞΊΞ¬"},{id:"bankroll",label:"π’° ΞΞµΟ†Ξ¬Ξ»Ξ±ΞΉΞΏ"}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{padding:"12px 14px",background:"transparent",border:"none",color:tab===tb.id?uc.color:"#3d5566",fontSize:12,fontWeight:tab===tb.id?700:400,cursor:"pointer",borderBottom:tab===tb.id?`2px solid ${uc.color}`:"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap"}}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab==="matches"&&<MatchesTab userBets={userBets} allBets={allBets} ready={ready} scores={scores} results={results} matchLocked={matchLocked} currentUser={currentUser} isAdmin={!!USERS_CONFIG[currentUser].isAdmin}
        onSelect={handleSelect} onReady={m=>setPendingReady(m)} onUnlock={handleUnlock} onScoreEdit={m=>setScoreEdit(m)} onResultEdit={handleResultEdit} onMatchLockToggle={handleMatchLockToggle}/>}

      {tab==="coupon"&&(
        <div style={{padding:"14px 14px 100px"}}>
          <div style={{background:"#0d1a26",border:"1px solid #141f2b",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:11,color:"#3d5566",lineHeight:1.6}}>
            π”’ ΞΞΉ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚ Ξ¬Ξ»Ξ»ΞΏΟ… ΞµΞΌΟ†Ξ±Ξ½Ξ―Ξ¶ΞΏΞ½Ο„Ξ±ΞΉ ΞΌΟΞ½ΞΏ Ξ±Ο†ΞΏΟ Ξ΄Ξ·Ξ»ΟΟƒΞµΟ„Ξµ ΞΊΞ±ΞΉ ΞΏΞΉ Ξ΄ΟΞΏ ΞµΟ„ΞΏΞΉΞΌΟΟ„Ξ·Ο„Ξ±.
          </div>
          {ALL_USERS.map(u=>{
            const uConf=USERS_CONFIG[u]; const isMe=u===currentUser;
            const rows=[];
            ALL_MATCHES.forEach(match=>{
              const mb=allBets?.[u]?.[match.id];
              if(!mb||Object.keys(mb).length===0)return;
              const visible=isMe||canSeeOther(currentUser,u,match.id,ready);
              Object.entries(mb).forEach(([mktId,sel])=>{
                const r=results?.[match.id]?.[`${mktId}_${sel.optId}`];
                rows.push({match,mktId,sel,visible,result:r});
              });
            });
            const visibleRows=rows.filter(r=>r.visible);
            const visibleCnt=visibleRows.length;
            const hiddenCnt=[...new Set(rows.filter(r=>!r.visible).map(r=>r.match.id))].length;
            const won=visibleRows.filter(r=>r.result===true).length;
            const lost=visibleRows.filter(r=>r.result===false).length;
            const judged=won+lost;
            return(
              <div key={u} style={{marginBottom:16,background:"#0d1a26",border:`1px solid ${uConf.color}20`,borderRadius:14,overflow:"hidden"}}>
                {/* Header */}
                <div style={{padding:"11px 14px",background:uConf.light,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${uConf.color}18`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:uConf.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900}}>{uConf.avatar}</div>
                    <span style={{fontWeight:800,color:uConf.color,fontSize:14}}>{u}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {judged>0&&(
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>{won}β“</span>
                        <span style={{fontSize:11,color:"#ef4444",fontWeight:700}}>{lost}β—</span>
                        <span style={{fontSize:12,fontWeight:800,color:uConf.color}}>{Math.round(won/judged*100)}%</span>
                      </div>
                    )}
                    {hiddenCnt>0&&<span style={{fontSize:10,color:"#2d4155"}}>Β·{hiddenCnt}π”’</span>}
                  </div>
                </div>
                {rows.length===0
                  ?<div style={{padding:14,color:"#2d4155",fontSize:12}}>ΞΞ±ΞΌΞ―Ξ± ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ® Ξ±ΞΊΟΞΌΞ±</div>
                  :rows.map(({match,mktId,sel,visible,result},idx)=>{
                    const rc=result===true?"#22c55e":result===false?"#ef4444":null;
                    return visible?(
                      <div key={idx} style={{padding:"8px 14px",borderBottom:"1px solid #101820",display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,color:"#3d5566",marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home.name} vs {match.away.name}</div>
                          <div style={{fontSize:10,color:"#5a7080",marginBottom:3}}>{sel.marketLabel}</div>
                          <span style={{fontSize:11,fontWeight:700,color:rc||uConf.color,background:(rc||uConf.color)+"20",padding:"2px 9px",borderRadius:20}}>
                            {sel.optLabel}{result===true?" β“":result===false?" β—":""}
                          </span>
                        </div>
                      </div>
                    ):(
                      <div key={idx} style={{padding:"8px 14px",borderBottom:"1px solid #101820",display:"flex",alignItems:"center",gap:8,opacity:0.3}}>
                        <div style={{flex:1,fontSize:10,color:"#3d5566",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home.name} vs {match.away.name}</div>
                        <span style={{fontSize:14,color:"#2d4155"}}>π”’</span>
                      </div>
                    );
                  })
                }
              </div>
            );
          })}
        </div>
      )}

      {tab==="stats"&&<StatsTab allBets={allBets} ready={ready} results={results}/>}
      {tab==="bankroll"&&<BankrollTab bankroll={bankroll} isAdmin={isAdmin} onUpdate={persistBankroll}/>}

      {pendingReady&&<ReadyModal match={pendingReady} betCount={Object.keys(userBets[pendingReady.id]||{}).length} onConfirm={()=>confirmReady(pendingReady)} onCancel={()=>setPendingReady(null)}/>}
      {scoreEdit&&<ScoreModal match={scoreEdit} existing={scores[scoreEdit.id]} onSave={(h,a)=>handleScoreSave(scoreEdit,h,a)} onDelete={()=>handleScoreDelete(scoreEdit)} onCancel={()=>setScoreEdit(null)}/>}
    </div>
  );
}
