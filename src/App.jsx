import { dbSet, dbGet, dbSubscribe } from "./firebase";
import { useState, useEffect } from "react";

const USERS_CONFIG = {
  "Teo":   { pin:"1606", color:"#F59E0B", light:"#F59E0B18", avatar:"T", isAdmin:true },
  "Νίκος": { pin:"2406", color:"#22D3EE", light:"#22D3EE18", avatar:"Ν" },
  "Τάσος": { pin:"0802", color:"#A78BFA", light:"#A78BFA18", avatar:"Τ" },
};
const ALL_USERS = Object.keys(USERS_CONFIG); // Teo συμμετέχει κανονικά + έχει admin δικαιώματα

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

/* ══════════════════════════════════════════════════
   MARKETS
══════════════════════════════════════════════════ */
const MKT_IDS = ["1x2","dc","ou","btts","ht","htou","home_ou","away_ou","ggou"];

function buildMarkets(home, away) {
  return [
    { id:"1x2", label:"Τελικό Αποτέλεσμα",
      options:[{id:"1",label:"1 – "+home.name},{id:"X",label:"Χ – Ισοπαλία"},{id:"2",label:"2 – "+away.name}] },
    { id:"dc", label:"Διπλή Ευκαιρία",
      options:[{id:"1X",label:"1X"},{id:"12",label:"12"},{id:"X2",label:"X2"}] },
    { id:"ou", label:"Γκολ Over/Under",
      options:[{id:"o15",label:"Over 1.5"},{id:"u15",label:"Under 1.5"},{id:"o25",label:"Over 2.5"},{id:"u25",label:"Under 2.5"},{id:"o35",label:"Over 3.5"},{id:"u35",label:"Under 3.5"}] },
    { id:"btts", label:"Να σκοράρουν και οι 2",
      options:[{id:"gg",label:"GG – Ναι"},{id:"ng",label:"NG – Όχι"}] },
    { id:"ht", label:"1ο Ημίχρονο – Αποτέλεσμα",
      options:[{id:"ht1",label:"1 – "+home.name},{id:"htx",label:"Χ – Ισοπαλία"},{id:"ht2",label:"2 – "+away.name}] },
    { id:"htou", label:"1ο Ημίχρονο – Over/Under",
      options:[{id:"hto05",label:"Over 0.5"},{id:"htu05",label:"Under 0.5"},{id:"hto15",label:"Over 1.5"},{id:"htu15",label:"Under 1.5"}] },
    { id:"home_ou", label:home.name+" – Γκολ Over/Under",
      options:[{id:"ho05",label:"Over 0.5"},{id:"hu05",label:"Under 0.5"},{id:"ho15",label:"Over 1.5"},{id:"hu15",label:"Under 1.5"}] },
    { id:"away_ou", label:away.name+" – Γκολ Over/Under",
      options:[{id:"ao05",label:"Over 0.5"},{id:"au05",label:"Under 0.5"},{id:"ao15",label:"Over 1.5"},{id:"au15",label:"Under 1.5"}] },
    { id:"ggou", label:"Να σκοράρουν και οι 2 ή Over 2.5",
      options:[{id:"ggou_y",label:"Ναι"},{id:"ggou_n",label:"Όχι"}] },
  ];
}

/* ══════════════════════════════════════════════════
   MATCHES
══════════════════════════════════════════════════ */
const DAYS = [
  { label:"Πέμ 11/06", sub:"2 ματς", matches:[
    {id:1,  grp:"A", time:"22:00", home:t("MEX","Μεξικό"),       away:t("ZAF","Ν. Αφρική"),     venue:"Azteca, Πόλη Μεξικού"},
    {id:2,  grp:"A", time:"05:00✦",home:t("KOR","Ν. Κορέα"),      away:t("CZE","Τσεχία"),         venue:"Akron, Γουαδαλαχάρα"},
  ]},
  { label:"Παρ 12/06", sub:"2 ματς", matches:[
    {id:3,  grp:"B", time:"22:00", home:t("CAN","Καναδάς"),       away:t("BIH","Βοσνία-Ερζ."),   venue:"BMO Field, Τορόντο"},
    {id:4,  grp:"D", time:"04:00✦",home:t("USA","ΗΠΑ"),           away:t("PAR","Παραγουάη"),      venue:"SoFi Stadium, LA"},
  ]},
  { label:"Σάβ 13/06", sub:"4 ματς", matches:[
    {id:5,  grp:"B", time:"22:00", home:t("QAT","Κατάρ"),         away:t("SUI","Ελβετία"),        venue:"Levi's Stadium, SF"},
    {id:6,  grp:"C", time:"01:00✦",home:t("BRA","Βραζιλία"),      away:t("MAR","Μαρόκο"),         venue:"MetLife Stadium, NJ"},
    {id:7,  grp:"C", time:"04:00✦",home:t("HAI","Αϊτή"),          away:t("SCO","Σκωτία"),         venue:"Gillette Stadium, Boston"},
    {id:8,  grp:"D", time:"07:00✦",home:t("AUS","Αυστραλία"),     away:t("TUR","Τουρκία"),        venue:"BC Place, Βανκούβερ"},
  ]},
  { label:"Κυρ 14/06", sub:"4 ματς", matches:[
    {id:9,  grp:"E", time:"20:00", home:t("GER","Γερμανία"),      away:t("CUW","Κουρασάο"),       venue:"NRG Stadium, Houston"},
    {id:10, grp:"F", time:"23:00", home:t("NED","Ολλανδία"),      away:t("JPN","Ιαπωνία"),        venue:"AT&T Stadium, Dallas"},
    {id:11, grp:"E", time:"02:00✦",home:t("CIV","Ακτή Ελεφ."),   away:t("ECU","Εκουαδόρ"),       venue:"Lincoln Financial, Philly"},
    {id:12, grp:"F", time:"05:00✦",home:t("SWE","Σουηδία"),       away:t("TUN","Τυνησία"),        venue:"Estadio BBVA, Μοντερέι"},
  ]},
  { label:"Δευ 15/06", sub:"4 ματς", matches:[
    {id:13, grp:"H", time:"19:00", home:t("ESP","Ισπανία"),       away:t("CPV","Πρ. Ακρωτήριο"),  venue:"Mercedes-Benz, Atlanta"},
    {id:14, grp:"G", time:"22:00", home:t("BEL","Βέλγιο"),        away:t("EGY","Αίγυπτος"),       venue:"Lumen Field, Seattle"},
    {id:15, grp:"H", time:"01:00✦",home:t("SAU","Σ. Αραβία"),    away:t("URU","Ουρουγουάη"),     venue:"Hard Rock Stadium, Miami"},
    {id:16, grp:"G", time:"04:00✦",home:t("IRN","Ιράν"),          away:t("NZL","Ν. Ζηλανδία"),    venue:"SoFi Stadium, LA"},
  ]},
  { label:"Τρί 16/06", sub:"3 ματς", matches:[
    {id:17, grp:"I", time:"22:00", home:t("FRA","Γαλλία"),        away:t("SEN","Σενεγάλη"),       venue:"MetLife Stadium, NJ"},
    {id:18, grp:"I", time:"01:00✦",home:t("IRQ","Ιράκ"),          away:t("NOR","Νορβηγία"),       venue:"Gillette Stadium, Boston"},
    {id:19, grp:"J", time:"04:00✦",home:t("ARG","Αργεντινή"),     away:t("ALG","Αλγερία"),        venue:"Arrowhead Stadium, KC"},
  ]},
  { label:"Τετ 17/06", sub:"5 ματς", matches:[
    {id:20, grp:"J", time:"07:00✦",home:t("AUT","Αυστρία"),       away:t("JOR","Ιορδανία"),       venue:"Levi's Stadium, SF"},
    {id:21, grp:"K", time:"20:00", home:t("POR","Πορτογαλία"),    away:t("COD","ΛΔ Κονγκό"),      venue:"NRG Stadium, Houston"},
    {id:22, grp:"L", time:"23:00", home:t("ENG","Αγγλία"),        away:t("CRO","Κροατία"),        venue:"AT&T Stadium, Dallas"},
    {id:23, grp:"L", time:"02:00✦",home:t("GHA","Γκάνα"),         away:t("PAN","Παναμάς"),        venue:"BMO Field, Τορόντο"},
    {id:24, grp:"K", time:"05:00✦",home:t("UZB","Ουζμπεκιστάν"), away:t("COL","Κολομβία"),       venue:"Azteca, Πόλη Μεξικού"},
  ]},
  { label:"Πέμ 18/06", sub:"4 ματς", matches:[
    {id:25, grp:"A", time:"19:00", home:t("CZE","Τσεχία"),        away:t("ZAF","Ν. Αφρική"),      venue:"Mercedes-Benz, Atlanta"},
    {id:26, grp:"B", time:"22:00", home:t("SUI","Ελβετία"),       away:t("BIH","Βοσνία-Ερζ."),   venue:"SoFi Stadium, LA"},
    {id:27, grp:"B", time:"01:00✦",home:t("CAN","Καναδάς"),       away:t("QAT","Κατάρ"),          venue:"BC Place, Βανκούβερ"},
    {id:28, grp:"A", time:"04:00✦",home:t("MEX","Μεξικό"),        away:t("KOR","Ν. Κορέα"),       venue:"Akron, Γουαδαλαχάρα"},
  ]},
  { label:"Παρ 19/06", sub:"4 ματς", matches:[
    {id:29, grp:"D", time:"22:00", home:t("USA","ΗΠΑ"),           away:t("AUS","Αυστραλία"),      venue:"Lumen Field, Seattle"},
    {id:30, grp:"C", time:"01:00✦",home:t("SCO","Σκωτία"),        away:t("MAR","Μαρόκο"),         venue:"Gillette Stadium, Boston"},
    {id:31, grp:"C", time:"03:30✦",home:t("BRA","Βραζιλία"),      away:t("HAI","Αϊτή"),           venue:"Lincoln Financial, Philly"},
    {id:32, grp:"D", time:"06:00✦",home:t("TUR","Τουρκία"),       away:t("PAR","Παραγουάη"),      venue:"Levi's Stadium, SF"},
  ]},
  { label:"Σάβ 20/06", sub:"4 ματς", matches:[
    {id:33, grp:"F", time:"20:00", home:t("NED","Ολλανδία"),      away:t("SWE","Σουηδία"),        venue:"NRG Stadium, Houston"},
    {id:34, grp:"E", time:"23:00", home:t("GER","Γερμανία"),      away:t("CIV","Ακτή Ελεφ."),     venue:"BMO Field, Τορόντο"},
    {id:35, grp:"E", time:"03:00✦",home:t("ECU","Εκουαδόρ"),      away:t("CUW","Κουρασάο"),       venue:"Arrowhead Stadium, KC"},
    {id:36, grp:"F", time:"07:00✦",home:t("TUN","Τυνησία"),       away:t("JPN","Ιαπωνία"),        venue:"Estadio BBVA, Μοντερέι"},
  ]},
  { label:"Κυρ 21/06", sub:"4 ματς", matches:[
    {id:37, grp:"H", time:"19:00", home:t("ESP","Ισπανία"),       away:t("SAU","Σ. Αραβία"),      venue:"Mercedes-Benz, Atlanta"},
    {id:38, grp:"G", time:"22:00", home:t("BEL","Βέλγιο"),        away:t("IRN","Ιράν"),           venue:"SoFi Stadium, LA"},
    {id:39, grp:"H", time:"01:00✦",home:t("URU","Ουρουγουάη"),   away:t("CPV","Πρ. Ακρωτήριο"),  venue:"Hard Rock Stadium, Miami"},
    {id:40, grp:"G", time:"04:00✦",home:t("NZL","Ν. Ζηλανδία"),  away:t("EGY","Αίγυπτος"),       venue:"BC Place, Βανκούβερ"},
  ]},
  { label:"Δευ 22/06", sub:"3 ματς", matches:[
    {id:41, grp:"J", time:"20:00", home:t("ARG","Αργεντινή"),     away:t("AUT","Αυστρία"),        venue:"AT&T Stadium, Dallas"},
    {id:42, grp:"I", time:"00:00✦",home:t("FRA","Γαλλία"),        away:t("IRQ","Ιράκ"),           venue:"Lincoln Financial, Philly"},
    {id:43, grp:"I", time:"03:00✦",home:t("NOR","Νορβηγία"),      away:t("SEN","Σενεγάλη"),       venue:"MetLife Stadium, NJ"},
  ]},
  { label:"Τρί 23/06", sub:"5 ματς", matches:[
    {id:44, grp:"J", time:"06:00✦",home:t("JOR","Ιορδανία"),      away:t("ALG","Αλγερία"),        venue:"Levi's Stadium, SF"},
    {id:45, grp:"K", time:"20:00", home:t("POR","Πορτογαλία"),    away:t("UZB","Ουζμπεκιστάν"),   venue:"NRG Stadium, Houston"},
    {id:46, grp:"L", time:"23:00", home:t("ENG","Αγγλία"),        away:t("GHA","Γκάνα"),          venue:"Gillette Stadium, Boston"},
    {id:47, grp:"L", time:"02:00✦",home:t("PAN","Παναμάς"),       away:t("CRO","Κροατία"),        venue:"BMO Field, Τορόντο"},
    {id:48, grp:"K", time:"05:00✦",home:t("COL","Κολομβία"),      away:t("COD","ΛΔ Κονγκό"),      venue:"Akron, Γουαδαλαχάρα"},
  ]},
  { label:"Τετ 24/06", sub:"4 ματς", matches:[
    {id:49, grp:"B", time:"22:00", home:t("SUI","Ελβετία"),       away:t("CAN","Καναδάς"),        venue:"BC Place, Βανκούβερ"},
    {id:50, grp:"B", time:"22:00", home:t("BIH","Βοσνία-Ερζ."),   away:t("QAT","Κατάρ"),          venue:"Lumen Field, Seattle"},
    {id:51, grp:"C", time:"01:00✦",home:t("SCO","Σκωτία"),        away:t("BRA","Βραζιλία"),       venue:"Hard Rock Stadium, Miami"},
    {id:52, grp:"C", time:"01:00✦",home:t("MAR","Μαρόκο"),        away:t("HAI","Αϊτή"),           venue:"Mercedes-Benz, Atlanta"},
  ]},
  { label:"Πέμ 25/06", sub:"6 ματς", matches:[
    {id:53, grp:"A", time:"04:00✦",home:t("CZE","Τσεχία"),        away:t("MEX","Μεξικό"),         venue:"Azteca, Πόλη Μεξικού"},
    {id:54, grp:"A", time:"04:00✦",home:t("ZAF","Ν. Αφρική"),     away:t("KOR","Ν. Κορέα"),       venue:"Estadio BBVA, Μοντερέι"},
    {id:55, grp:"E", time:"23:00", home:t("CUW","Κουρασάο"),      away:t("CIV","Ακτή Ελεφ."),     venue:"Lincoln Financial, Philly"},
    {id:56, grp:"E", time:"23:00", home:t("ECU","Εκουαδόρ"),      away:t("GER","Γερμανία"),       venue:"MetLife Stadium, NJ"},
    {id:57, grp:"F", time:"02:00✦",home:t("JPN","Ιαπωνία"),       away:t("SWE","Σουηδία"),        venue:"AT&T Stadium, Dallas"},
    {id:58, grp:"F", time:"02:00✦",home:t("TUN","Τυνησία"),       away:t("NED","Ολλανδία"),       venue:"Arrowhead Stadium, KC"},
  ]},
  { label:"Παρ 26/06", sub:"6 ματς", matches:[
    {id:59, grp:"D", time:"05:00✦",home:t("TUR","Τουρκία"),       away:t("USA","ΗΠΑ"),            venue:"SoFi Stadium, LA"},
    {id:60, grp:"D", time:"05:00✦",home:t("PAR","Παραγουάη"),     away:t("AUS","Αυστραλία"),      venue:"Levi's Stadium, SF"},
    {id:61, grp:"I", time:"22:00", home:t("NOR","Νορβηγία"),      away:t("FRA","Γαλλία"),         venue:"Gillette Stadium, Boston"},
    {id:62, grp:"I", time:"22:00", home:t("SEN","Σενεγάλη"),      away:t("IRQ","Ιράκ"),           venue:"BMO Field, Τορόντο"},
    {id:63, grp:"H", time:"03:00✦",home:t("CPV","Πρ. Ακρωτήριο"),away:t("SAU","Σ. Αραβία"),      venue:"NRG Stadium, Houston"},
    {id:64, grp:"H", time:"03:00✦",home:t("URU","Ουρουγουάη"),   away:t("ESP","Ισπανία"),        venue:"Akron, Γουαδαλαχάρα"},
  ]},
  { label:"Σάβ 27/06", sub:"6 ματς", matches:[
    {id:65, grp:"G", time:"06:00✦",home:t("EGY","Αίγυπτος"),     away:t("IRN","Ιράν"),           venue:"Lumen Field, Seattle"},
    {id:66, grp:"G", time:"06:00✦",home:t("NZL","Ν. Ζηλανδία"),  away:t("BEL","Βέλγιο"),         venue:"BC Place, Βανκούβερ"},
    {id:67, grp:"L", time:"00:00", home:t("PAN","Παναμάς"),       away:t("ENG","Αγγλία"),         venue:"MetLife Stadium, NJ"},
    {id:68, grp:"L", time:"00:00", home:t("CRO","Κροατία"),       away:t("GHA","Γκάνα"),          venue:"Lincoln Financial, Philly"},
    {id:69, grp:"K", time:"02:30", home:t("COL","Κολομβία"),      away:t("POR","Πορτογαλία"),     venue:"Hard Rock Stadium, Miami"},
    {id:70, grp:"K", time:"02:30", home:t("COD","ΛΔ Κονγκό"),    away:t("UZB","Ουζμπεκιστάν"),   venue:"Mercedes-Benz, Atlanta"},
  ]},
  { label:"Κυρ 28/06", sub:"3 ματς", matches:[
    {id:71, grp:"J", time:"05:00✦",home:t("ALG","Αλγερία"),       away:t("AUT","Αυστρία"),        venue:"Arrowhead Stadium, KC"},
    {id:72, grp:"J", time:"05:00✦",home:t("JOR","Ιορδανία"),      away:t("ARG","Αργεντινή"),      venue:"AT&T Stadium, Dallas"},
    {id:73, grp:"Β'Φ",time:"22:00",home:{code:"",name:"2η Ομ. A"},away:{code:"",name:"2η Ομ. B"},  venue:"SoFi Stadium, LA"},
  ]},
  { label:"Δευ–Τετ 29/6–1/7", sub:"Β' Φάση", matches:[
    {id:74, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. C"},away:{code:"",name:"2η Ομ. F"}, venue:"NRG Stadium, Houston"},
    {id:75, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. E"},away:{code:"",name:"Καλ. 3η"},  venue:"Gillette Stadium, Boston"},
    {id:76, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. F"},away:{code:"",name:"2η Ομ. C"}, venue:"BBVA, Μοντερέι"},
    {id:77, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. I"},away:{code:"",name:"Καλ. 3η"},  venue:"MetLife Stadium, NJ"},
    {id:78, grp:"Β'Φ",time:"TBD",home:{code:"",name:"2η Ομ. E"}, away:{code:"",name:"2η Ομ. I"},  venue:"AT&T Stadium, Dallas"},
    {id:79, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. A"},away:{code:"",name:"Καλ. 3η"},  venue:"Azteca, Πόλη Μεξικού"},
    {id:80, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. L"},away:{code:"",name:"Καλ. 3η"},  venue:"Mercedes-Benz, Atlanta"},
    {id:81, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. B"},away:{code:"",name:"2η Ομ. G"}, venue:"Lumen Field, Seattle"},
    {id:82, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. G"},away:{code:"",name:"2η Ομ. B"}, venue:"Levi's Stadium, SF"},
    {id:83, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. D"},away:{code:"",name:"2η Ομ. J"}, venue:"Hard Rock Stadium, Miami"},
    {id:84, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. J"},away:{code:"",name:"2η Ομ. D"}, venue:"BMO Field, Τορόντο"},
    {id:85, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. H"},away:{code:"",name:"2η Ομ. K"}, venue:"Arrowhead Stadium, KC"},
    {id:86, grp:"Β'Φ",time:"TBD",home:{code:"",name:"Νικ. Ομ. K"},away:{code:"",name:"2η Ομ. H"}, venue:"BC Place, Βανκούβερ"},
  ]},
  { label:"4–8/07", sub:"Γύρος 16", matches:[
    {id:87,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:88,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:89,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:90,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:91,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:92,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:93,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:94,grp:"Γ16",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
  ]},
  { label:"10–13/07", sub:"Προημιτελικά", matches:[
    {id:95,grp:"ΠΗΦ",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:96,grp:"ΠΗΦ",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:97,grp:"ΠΗΦ",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
    {id:98,grp:"ΠΗΦ",time:"TBD",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"TBD"},
  ]},
  { label:"14–15/07", sub:"Ημιτελικά", matches:[
    {id:99, grp:"ΗΦ",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"MetLife Stadium, NJ"},
    {id:100,grp:"ΗΦ",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"Rose Bowl, LA"},
  ]},
  { label:"19/07", sub:"🏆 Τελικός", matches:[
    {id:101,grp:"ΤΛ",time:"22:00",home:{code:"",name:"TBD"},away:{code:"",name:"TBD"},venue:"MetLife Stadium, NJ"},
  ]},
];

const ALL_MATCHES = DAYS.flatMap(d => d.matches);





/* ══ HELPERS ══ */
function canSeeOther(viewer,other,matchId,ready){return ready?.[viewer]?.[matchId]&&ready?.[other]?.[matchId];}

/* ══════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════ */
function LoginScreen({onLogin}){
  const [pin,setPin]=useState(""); const [error,setError]=useState(false); const [shake,setShake]=useState(false);
  function press(k){
    if(k==="⌫"){setPin(p=>p.slice(0,-1));setError(false);return;}
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
        <div style={{fontSize:56,marginBottom:10}}>⚽</div>
        <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1}}>ΜΟΥΝΤΙΑΛ 2026</div>
        <div style={{fontSize:11,color:"#3d5166",letterSpacing:4,marginTop:8,textTransform:"uppercase"}}>Φίλοι Στοίχημα</div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:36,animation:shake?"shake 0.5s":"none"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<pin.length?(error?"#ef4444":"#22c55e"):"#1a2535",border:`2px solid ${i<pin.length?(error?"#ef4444":"#22c55e"):"#253545"}`,transition:"all 0.15s",boxShadow:i<pin.length&&!error?"0 0 8px #22c55e60":"none"}}/>
        ))}
      </div>
      {error&&<div style={{color:"#ef4444",fontSize:13,marginBottom:16,fontWeight:600}}>Λάθος PIN</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
          k===""?<div key={i}/>:
          <button key={i} onClick={()=>press(k)} style={{height:64,borderRadius:14,background:k==="⌫"?"#1a2535":"#101c28",border:"1px solid #1a2535",color:k==="⌫"?"#ef4444":"#e8eaed",fontSize:k==="⌫"?22:24,fontWeight:700,cursor:"pointer"}}>{k}</button>
        ))}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   READY MODAL
══════════════════════════════════════════════════ */
function ReadyModal({match,betCount,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)",padding:20}}>
      <div style={{background:"#111d2b",borderRadius:22,padding:28,width:"100%",maxWidth:400,border:"1px solid #1e2f40",textAlign:"center",animation:"fadeIn 0.2s ease"}}>
        <div style={{fontSize:44,marginBottom:12}}>🔒</div>
        <div style={{fontSize:17,fontWeight:800,color:"#fff",marginBottom:10}}>Δήλωση Ετοιμότητας</div>
        <div style={{fontSize:13,color:"#5a7080",marginBottom:4,lineHeight:1.5}}>
          {FL(match.home.code)} {match.home.name} vs {FL(match.away.code)} {match.away.name}
        </div>
        {betCount===0
          ?<div style={{fontSize:13,color:"#F59E0B",background:"#F59E0B10",borderRadius:10,padding:"10px 14px",margin:"14px 0",lineHeight:1.6}}>Δεν έχεις κάνει καμία επιλογή.<br/>Θέλεις να δηλώσεις ετοιμότητα χωρίς επιλογές;</div>
          :<div style={{fontSize:13,color:"#94a3b8",background:"#1a2c3e",borderRadius:10,padding:"10px 14px",margin:"14px 0",lineHeight:1.6}}>Έχεις <strong style={{color:"#fff"}}>{betCount}</strong> επιλογ{betCount===1?"ή":"ές"}.<br/>Μετά τη δήλωση <strong style={{color:"#ef4444"}}>δεν μπορείς να αλλάξεις</strong> τίποτα.<br/>Θα φανούν μόλις δηλώσουν κι οι άλλοι.</div>
        }
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onCancel} style={{flex:1,padding:13,borderRadius:12,background:"#1a2535",border:"none",color:"#8a9db0",fontSize:14,fontWeight:600,cursor:"pointer"}}>Πίσω</button>
          <button onClick={onConfirm} style={{flex:2,padding:13,borderRadius:12,background:"#16a34a",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>✓ Είμαι Έτοιμος</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SCORE MODAL — χειροκίνητη καταχώρηση σκορ
══════════════════════════════════════════════════ */
function ScoreModal({match,existing,onSave,onDelete,onCancel}){
  const [h,setH]=useState(existing && existing.home !== undefined ? String(existing.home) : "");
  const [a,setA]=useState(existing && existing.away !== undefined ? String(existing.away) : "");
  const valid = h!==""&&a!==""&&!isNaN(parseInt(h))&&!isNaN(parseInt(a));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}>
      <div style={{background:"#111d2b",borderRadius:"22px 22px 0 0",padding:24,width:"100%",maxWidth:480,border:"1px solid #1e2f40",animation:"slideUp 0.22s ease"}}>
        <div style={{fontSize:12,color:"#5a7080",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Καταχώρηση Σκορ</div>
        <div style={{fontSize:13,color:"#8a9db0",marginBottom:16,textAlign:"center"}}>{FL(match.home.code)} {match.home.name} vs {FL(match.away.code)} {match.away.name}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 24px 1fr",alignItems:"center",gap:8,marginBottom:20}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#5a7080",marginBottom:6}}>{match.home.name}</div>
            <input type="number" min="0" max="20" value={h} onChange={e=>setH(e.target.value)}
              style={{width:"100%",padding:"12px 0",background:"#0c1520",border:"2px solid #2d4155",borderRadius:12,color:"#fff",fontSize:32,fontWeight:900,textAlign:"center",outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
          <span style={{textAlign:"center",fontSize:16,color:"#2d4155",fontWeight:700}}>–</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#5a7080",marginBottom:6}}>{match.away.name}</div>
            <input type="number" min="0" max="20" value={a} onChange={e=>setA(e.target.value)}
              style={{width:"100%",padding:"12px 0",background:"#0c1520",border:"2px solid #2d4155",borderRadius:12,color:"#fff",fontSize:32,fontWeight:900,textAlign:"center",outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:0}}>
          <button onClick={onCancel} style={{flex:1,padding:13,borderRadius:12,background:"#1a2535",border:"none",color:"#8a9db0",fontSize:14,fontWeight:600,cursor:"pointer"}}>Άκυρο</button>
          {existing&&<button onClick={onDelete} style={{padding:"13px 14px",borderRadius:12,background:"#ef444418",border:"1px solid #ef444430",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer"}}>Διαγραφή</button>}
          <button onClick={()=>valid&&onSave(parseInt(h),parseInt(a))} disabled={!valid}
            style={{flex:2,padding:13,borderRadius:12,background:valid?"#2563eb":"#1a2535",border:"none",color:valid?"#fff":"#3d5566",fontSize:14,fontWeight:700,cursor:valid?"pointer":"default"}}>
            ✓ Αποθήκευση
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MARKET ROW
══════════════════════════════════════════════════ */
function MarketRow({market,matchId,userBets,onSelect}){
  const [open,setOpen]=useState(false);
  const sel=userBets?.[matchId]?.[market.id];
  return(
    <div style={{borderBottom:"1px solid #101820",background:sel?"rgba(34,197,94,0.03)":"transparent"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"12px 16px",background:"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:sel?"#22c55e":"#c9d1d9",fontSize:13,fontWeight:sel?600:400,textAlign:"left"}}>
        <span>{market.label}</span>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
          {sel&&<span style={{fontSize:11,background:"#16a34a20",color:"#22c55e",padding:"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{sel.optLabel}</span>}
          <span style={{color:"#2d4155",fontSize:15,transform:open?"rotate(180deg)":"rotate(0)",transition:"0.2s"}}>⌄</span>
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

/* ══════════════════════════════════════════════════
   MATCH CARD
══════════════════════════════════════════════════ */
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
          <span style={{fontSize:11,color:"#3d5566",fontFamily:"monospace",fontWeight:600}}>{match.time} <span style={{color:"#1e2f40",fontSize:9}}>EEST</span> · Ομ.{match.grp}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,color:"#1e2f40",background:"#0a1520",padding:"2px 7px",borderRadius:8,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.venue}</span>
            {/* Admin lock button — top right */}
            {isAdmin&&(
              <button
                onClick={e=>{e.stopPropagation();onMatchLockToggle(match.id);}}
                title={adminLocked?"Ξεκλείδωμα αποτελέσματος":"Κλείδωμα αποτελέσματος"}
                style={{background:adminLocked?"#16a34a22":"#1a2535",border:`1px solid ${adminLocked?"#22c55e40":"#253545"}`,borderRadius:7,padding:"3px 7px",cursor:"pointer",fontSize:14,color:adminLocked?"#22c55e":"#4a5568",display:"flex",alignItems:"center"}}>
                {adminLocked?"\uD83D\uDD12":"\uD83D\uDD13"}
              </button>
            )}
            {!isAdmin&&adminLocked&&(
              <span style={{fontSize:13,color:"#22c55e",opacity:0.7}} title="Αποτέλεσμα κλειδωμένο">{"\uD83D\uDD12"}</span>
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
                 <span style={{fontSize:20,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{score.home} – {score.away}</span>
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
            ?<span style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:allDone?"#16a34a18":"#92400e18",color:allDone?"#22c55e":"#F59E0B",fontWeight:700}}>{allDone?"✓ Όλοι Έτοιμοι":"🔒 Εσύ Έτοιμος"}</span>
            :<span style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:"#141f2b",color:"#3d5566"}}>+ Επιλογές {expanded?"▲":"▼"}</span>
          }
          {ALL_USERS.filter(u=>u!==currentUser&&ready?.[u]?.[match.id]).map(u=>(
            <span key={u} style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:USERS_CONFIG[u].light,color:USERS_CONFIG[u].color,fontWeight:600}}>{u} ✓</span>
          ))}
        </div>
      </button>

      {/* ΣΚΟΡ ΚΟΥΜΠΙ — μόνο για Admin */}
      {isAdmin&&(
        <div style={{padding:"6px 16px 8px",display:"flex",gap:8,borderTop:"1px solid #101820"}}>
          <button onClick={()=>!adminLocked&&onScoreEdit(match)}
            style={{flex:1,padding:"6px 0",background:score?"#2563eb18":"#141f2b",border:`1px solid ${score?"#2563eb40":"#1e2f40"}`,borderRadius:9,color:score?(adminLocked?"#4a5568":"#60a5fa"):"#3d5566",fontSize:11,fontWeight:600,cursor:adminLocked?"default":"pointer",opacity:adminLocked?0.5:1}}>
            {score?`${score.home} – ${score.away}${adminLocked?"":" ✎"}`:"\u2295 Σκορ"}
          </button>
          {canUnlock&&!adminLocked&&(
            <button onClick={()=>onUnlock(match.id)}
              style={{padding:"6px 12px",background:"#92400e18",border:"1px solid #92400e30",borderRadius:9,color:"#F59E0B",fontSize:11,fontWeight:600,cursor:"pointer"}}>
              ✎ Αλλαγή
            </button>
          )}
        </div>
      )}
      {/* Score display when locked and not admin */}
      {!isAdmin&&score&&adminLocked&&(
        <div style={{padding:"4px 16px 6px",borderTop:"1px solid #101820"}}>
          <span style={{fontSize:10,color:"#22c55e",fontWeight:600}}>✓ Τελικό: {score.home}–{score.away}</span>
        </div>
      )}

      {/* ΟΙ ΔΙΚΕΣ ΜΟΥ ΕΠΙΛΟΓΕΣ — όλοι οι χρήστες */}
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
                    {cur===undefined?"◎":cur===true?"✓":"✗"}
                  </button>
                )}
              </div>
            );
          })}
          <div style={{height:8}}/>
        </div>
      )}

      {/* ADMIN: βλέπει επιλογές άλλων μόνο αν έχουν δηλώσει ετοιμότητα ΚΑΙ ΟΙ ΔΥΟ */}
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
              {!visible&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>🔒 Δήλωσε κι εσύ για να δεις</span>}
              {visible&&uBets.length===0&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>Χωρίς επιλογές</span>}
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
                    {cur===undefined?"◎":cur===true?"✓":"✗"}
                  </button>
                </div>
              );
            })}
            <div style={{height:6}}/>
          </div>
        );
      })}

      {/* ΕΠΙΛΟΓΕΣ ΑΛΛΩΝ — μόνο για non-admin χρήστες (ο Teo τα βλέπει πάνω) */}
      {!isAdmin&&othersBets.map(({user,visible,bets})=>{
        const uConf=USERS_CONFIG[user];
        return(
          <div key={user} style={{borderTop:"1px solid #101820",background:"rgba(0,0,0,0.1)"}}>
            <div style={{padding:"6px 16px 2px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:uConf.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,flexShrink:0}}>{uConf.avatar}</div>
              <span style={{fontSize:11,fontWeight:700,color:uConf.color}}>{user}</span>
              {!visible&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>🔒 Δήλωσε κι εσύ για να δεις</span>}
              {visible&&bets.length===0&&<span style={{fontSize:10,color:"#2d4155",marginLeft:"auto"}}>Χωρίς επιλογές</span>}
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
          <span style={{fontSize:11,color:"#3d5566"}}>Περιμένει:</span>
          {waiting.map(u=><span key={u} style={{fontSize:11,color:USERS_CONFIG[u].color,fontWeight:700}}>{u}</span>)}
        </div>
      )}

      {/* ACCORDION ΑΓΟΡΩΝ — όλοι οι χρήστες */}
      {!isLocked&&expanded&&(
        <div style={{borderTop:"1px solid #1a2d3e"}}>
          {markets.map(m=>(
            <MarketRow key={m.id} market={m} matchId={match.id} userBets={userBets} onSelect={onSelect}/>
          ))}
          <div style={{padding:14}}>
            <button onClick={e=>{e.stopPropagation();onReady(match);}}
              style={{width:"100%",padding:12,borderRadius:12,background:"#16a34a",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🔒 Δήλωση Ετοιμότητας
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   STATS TAB
══════════════════════════════════════════════════ */
function StatsTab({allBets,ready,results}){
  const MKT_DISPLAY=[
    {id:"1x2",    label:"Τελικό Αποτέλεσμα", icon:"🏆"},
    {id:"dc",     label:"Διπλή Ευκαιρία",    icon:"🎯"},
    {id:"ou",     label:"Over/Under Γκολ",    icon:"⚽"},
    {id:"btts",   label:"GG/NG",              icon:"🥅"},
    {id:"ht",     label:"1ο Ημίχ. Αποτέλ.",  icon:"⏱"},
    {id:"htou",   label:"1ο Ημίχ. Over/Under",icon:"📊"},
    {id:"home_ou",label:"Γκολ Γηπεδούχου",   icon:"🏠"},
    {id:"away_ou",label:"Γκολ Φιλοξ.",       icon:"✈️"},
    {id:"ggou",   label:"GG ή Over 2.5",      icon:"💥"},
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
  function pct(w,t){ if(t===0)return"–"; return `${Math.round(w/t*100)}% (${w}/${t})`; }

  return(
    <div style={{padding:"16px 14px 100px"}}>
      <h2 style={{fontSize:12,color:"#3d5566",letterSpacing:2,textTransform:"uppercase",margin:"0 0 16px",fontWeight:700}}>Στατιστικά Παικτών</h2>

      {/* Summary comparison row */}
      <div style={{background:"#0d1a26",border:"1px solid #141f2b",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#3d5566",letterSpacing:1,textTransform:"uppercase",marginBottom:12,fontWeight:700}}>Σύγκριση</div>
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
                <div style={{fontSize:18,fontWeight:900,color:p!==null?"#fff":"#3d5566"}}>{p!==null?`${p}%`:"–"}</div>
                <div style={{fontSize:9,color:"#3d5566",marginTop:2}}>{won}/{judged} σωστές</div>
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
                  {judged>0?`${Math.round(won/judged*100)}%`:"–"}
                </div>
                <div style={{fontSize:9,color:"#3d5566",marginTop:1}}>συνολικό ποσοστό</div>
              </div>
            </div>

            {/* Summary pills */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"12px 16px",borderBottom:"1px solid #141f2b"}}>
              {[
                {label:"Επιλογές",  val:total,   col:"#e8eaed"},
                {label:"✓ Σωστές",  val:won,     col:"#22c55e"},
                {label:"✗ Λάθος",   val:lost,    col:"#ef4444"},
                {label:"⏳ Εκκρεμ.", val:pending, col:"#F59E0B"},
                {label:"Ματς ✓",    val:readyCount, col:"#8a9db0"},
              ].map(p=>(
                <div key={p.label} style={{background:"#141f2b",borderRadius:10,padding:"6px 12px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:p.col}}>{p.val}</div>
                  <div style={{fontSize:9,color:"#3d5566",marginTop:1}}>{p.label}</div>
                </div>
              ))}
            </div>

            {/* Per-market breakdown with % (W/T) */}
            <div style={{padding:"10px 16px 14px"}}>
              <div style={{fontSize:10,color:"#3d5566",letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Ανά Αγορά</div>
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
                          : ms.total>0 ? `${ms.total} εκκρ.` : "–"
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

/* ══════════════════════════════════════════════════
   BANKROLL TAB
══════════════════════════════════════════════════ */
function BankrollTab({bankroll,isAdmin,onUpdate}){
  const INITIAL=bankroll.initial||300;
  const bets=bankroll.bets||[];

  // Υπολογισμός τρέχοντος κεφαλαίου
  function calcCurrent(betList){
    return betList.reduce((cap,b)=>{
      if(b.result==="win") return cap+(b.stake*(b.odds-1));
      if(b.result==="loss") return cap-b.stake;
      return cap;
    },INITIAL);
  }

  const current=calcCurrent(bets);
  const diff=current-INITIAL;

  // Επόμενο stake = 10% τρέχοντος
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
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Αρχικό</div>
            <div style={{fontSize:20,fontWeight:900,color:"#e8eaed"}}>{INITIAL.toFixed(0)}€</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Τρέχον</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{current.toFixed(2)}€</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"#3d5566",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Διαφορά</div>
            <div style={{fontSize:20,fontWeight:900,color:diff>0?"#22c55e":diff<0?"#ef4444":"#8a9db0"}}>
              {diff>0?"+":""}{diff.toFixed(2)}€
            </div>
          </div>
        </div>
        <div style={{marginTop:10,background:"#141f2b",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#5a7080"}}>Επόμενο Στοίχημα (10%)</span>
          <span style={{fontSize:14,fontWeight:800,color:"#F59E0B"}}>{nextStake.toFixed(2)}€</span>
        </div>
      </div>

      {/* New bet form — μόνο admin */}
      {isAdmin&&(
        <div style={{background:"#0d1a26",border:"1px solid #F59E0B30",borderRadius:14,padding:"14px",marginBottom:16}}>
          <div style={{fontSize:11,color:"#F59E0B",fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>+ Νέο Στοίχημα</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <input
                type="number" step="0.01" min="1.01" placeholder="Απόδοση"
                value={newOdds} onChange={e=>setNewOdds(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addBet()}
                style={{width:"100%",padding:"12px 14px",background:"#0a1520",border:"1px solid #253545",borderRadius:10,color:"#fff",fontSize:20,fontWeight:700,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{display:"flex",alignItems:"center",background:"#141f2b",borderRadius:10,padding:"0 14px",flexShrink:0}}>
              <span style={{fontSize:14,color:"#F59E0B",fontWeight:700}}>{nextStake.toFixed(2)}€</span>
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
        Ιστορικό ({bets.length})
      </div>
      {bets.length===0&&(
        <div style={{color:"#2d4155",fontSize:13,textAlign:"center",padding:24}}>Κανένα στοίχημα ακόμα</div>
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
                <span style={{fontSize:14,color:"#8a9db0",fontFamily:"monospace",flexShrink:0}}>{b.stake.toFixed(2)}€</span>
                {profit!==null&&(
                  <span style={{fontSize:14,fontWeight:800,color:profit>=0?"#22c55e":"#ef4444",fontFamily:"monospace",flexShrink:0}}>
                    {profit>=0?"+":""}{profit.toFixed(2)}€
                  </span>
                )}
              </div>
              {/* Result badge */}
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                {isPending&&isAdmin&&(
                  <>
                    <button onClick={()=>setResult(b.id,"win")}
                      style={{padding:"5px 10px",background:"#16a34a20",border:"1px solid #22c55e40",borderRadius:8,color:"#22c55e",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓</button>
                    <button onClick={()=>setResult(b.id,"loss")}
                      style={{padding:"5px 10px",background:"#ef444420",border:"1px solid #ef444440",borderRadius:8,color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>✗</button>
                  </>
                )}
                {!isPending&&(
                  <span style={{padding:"4px 12px",background:isWin?"#16a34a20":"#ef444420",border:`1px solid ${isWin?"#22c55e40":"#ef444440"}`,borderRadius:8,color:isWin?"#22c55e":"#ef4444",fontSize:12,fontWeight:700}}>
                    {isWin?"✓ Κερδίσαμε":"✗ Χάσαμε"}
                  </span>
                )}
                {isPending&&(
                  <span style={{padding:"4px 10px",background:"#F59E0B18",border:"1px solid #F59E0B30",borderRadius:8,color:"#F59E0B",fontSize:11}}>⏳</span>
                )}
                {isAdmin&&!isPending&&(
                  <button onClick={()=>setResult(b.id,null)}
                    style={{padding:"4px 8px",background:"transparent",border:"1px solid #253545",borderRadius:8,color:"#4a5568",fontSize:11,cursor:"pointer"}}>↩</button>
                )}
                {isAdmin&&isPending&&(
                  <button onClick={()=>deleteBet(b.id)}
                    style={{padding:"4px 8px",background:"transparent",border:"1px solid #253545",borderRadius:8,color:"#4a5568",fontSize:11,cursor:"pointer"}}>✕</button>
                )}
              </div>
            </div>
            {/* Capital after this bet */}
            {!isPending&&(
              <div style={{fontSize:10,color:"#3d5566",borderTop:"1px solid #141f2b",paddingTop:6,marginTop:4}}>
                Κεφάλαιο μετά: <span style={{color:"#8a9db0",fontWeight:700}}>{calcCurrent(bets.slice(i)).toFixed(2)}€</span>
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
        <div style={{fontSize:10,color:"#3d5566",marginBottom:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{day.label} · {day.sub}</div>
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

/* ══════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════ */
export default function App(){
  // Auto-login: διαβάζουμε αποθηκευμένο χρήστη από localStorage
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

  // Αποθήκευση χρήστη στο localStorage κάθε φορά που αλλάζει
  function handleLogin(user){
    try { localStorage.setItem("mundial2026_user", user); } catch(e) {}
    setCurrentUser(user);
    setTab("matches");
  }
  function handleLogout(){
    try { localStorage.removeItem("mundial2026_user"); } catch(e) {}
    setCurrentUser(null);
  }

  // Real-time Firebase subscription — loads everything once and listens for changes
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

  // Άμεση επιλογή χωρίς modal αποδόσεων
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

  // Ξεκλείδωμα ματς (μόνο αν δεν έχουν αποκαλυφθεί)
  async function handleUnlock(matchId){
    const nr={...ready,[currentUser]:{...(ready[currentUser]||{})}};
    delete nr[currentUser][matchId];
    await persistReady(nr);
  }

  // Αποθήκευση σκορ
  async function handleScoreSave(match,homeGoals,awayGoals){
    const ns={...scores,[match.id]:{home:homeGoals,away:awayGoals}};
    setScoreEdit(null);
    await persistScores(ns);
  }

  // Διαγραφή σκορ
  async function handleScoreDelete(match){
    const ns={...scores};
    delete ns[match.id];
    setScoreEdit(null);
    await persistScores(ns);
  }

  // Toggle αποτέλεσμα πρόβλεψης: null → true → false → null
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
  if(!loaded) return <div style={{minHeight:"100vh",background:"#080f18",display:"flex",alignItems:"center",justifyContent:"center",color:"#3d5566"}}>Φόρτωση...</div>;

  const uc=USERS_CONFIG[currentUser];
  const isAdmin=!!uc.isAdmin;
  const userBets=allBets[currentUser]||{};
  const totalBets=Object.values(userBets).reduce((a,m)=>a+Object.keys(m).length,0);

  return(
    <div style={{minHeight:"100vh",background:"#080f18",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e8eaed",maxWidth:480,margin:"0 auto"}}>
      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(8,15,24,0.97)",backdropFilter:"blur(16px)",borderBottom:"1px solid #141f2b",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>⚽</span>
          <div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:0.5}}>ΜΟΥΝΤΙΑΛ 2026</div>
            <div style={{fontSize:8,color:"#2d4155",letterSpacing:1}}>USA · CAN · MEX · ΩΡΑ ΕΛΛΑΔΟΣ</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:uc.light,border:`1px solid ${uc.color}35`,borderRadius:20,padding:"4px 10px 4px 7px"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:uc.color,color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900}}>{uc.avatar}</div>
            <span style={{color:uc.color,fontSize:12,fontWeight:700}}>{currentUser}</span>
            {isAdmin&&<span style={{fontSize:9,color:"#ef4444",background:"#ef444420",borderRadius:8,padding:"1px 5px",fontWeight:800}}>ADMIN</span>}
            {!isAdmin&&totalBets>0&&<span style={{fontSize:10,color:uc.color,background:uc.color+"30",borderRadius:10,padding:"0 5px",fontWeight:800}}>{totalBets}</span>}
          </div>
          <button onClick={handleLogout} style={{background:"#141f2b",border:"none",color:"#3d5566",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11}}>↩</button>
        </div>
      </div>
      {/* TABS */}
      <div style={{display:"flex",background:"#0d1a26",borderBottom:"1px solid #141f2b",padding:"0 14px"}}>
        {[{id:"matches",label:"⚽ Αγώνες"},{id:"coupon",label:"🎫 Δελτίο"},{id:"stats",label:"📊 Στατιστικά"},{id:"bankroll",label:"💰 Κεφάλαιο"}].map(tb=>(
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
            🔒 Οι επιλογές άλλου εμφανίζονται μόνο αφού δηλώσετε και οι δύο ετοιμότητα.
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
                        <span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>{won}✓</span>
                        <span style={{fontSize:11,color:"#ef4444",fontWeight:700}}>{lost}✗</span>
                        <span style={{fontSize:12,fontWeight:800,color:uConf.color}}>{Math.round(won/judged*100)}%</span>
                      </div>
                    )}
                    {hiddenCnt>0&&<span style={{fontSize:10,color:"#2d4155"}}>·{hiddenCnt}🔒</span>}
                  </div>
                </div>
                {rows.length===0
                  ?<div style={{padding:14,color:"#2d4155",fontSize:12}}>Καμία επιλογή ακόμα</div>
                  :rows.map(({match,mktId,sel,visible,result},idx)=>{
                    const rc=result===true?"#22c55e":result===false?"#ef4444":null;
                    return visible?(
                      <div key={idx} style={{padding:"8px 14px",borderBottom:"1px solid #101820",display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,color:"#3d5566",marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home.name} vs {match.away.name}</div>
                          <div style={{fontSize:10,color:"#5a7080",marginBottom:3}}>{sel.marketLabel}</div>
                          <span style={{fontSize:11,fontWeight:700,color:rc||uConf.color,background:(rc||uConf.color)+"20",padding:"2px 9px",borderRadius:20}}>
                            {sel.optLabel}{result===true?" ✓":result===false?" ✗":""}
                          </span>
                        </div>
                      </div>
                    ):(
                      <div key={idx} style={{padding:"8px 14px",borderBottom:"1px solid #101820",display:"flex",alignItems:"center",gap:8,opacity:0.3}}>
                        <div style={{flex:1,fontSize:10,color:"#3d5566",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home.name} vs {match.away.name}</div>
                        <span style={{fontSize:14,color:"#2d4155"}}>🔒</span>
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
