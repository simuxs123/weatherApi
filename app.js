class Orai {
    pradinisListas(){
        apiWeather()
    }
    kitasMiestas(){
        search.addEventListener("click", function(){
            if(city.value!=="")
                miestas.textContent=city.value; 
            resetBut()
            reset();    
            apiWeather()    
            
        })
    }
}
let list=document.querySelector(".list"),
    days=document.querySelectorAll(".nav-link"),
    search=document.querySelector("#search"),
    city=document.querySelector(".city"),
    miestas=document.querySelector(".miestas"),
    tbod=document.querySelector(".tbod"),
    sepArr=[],
    orai=new Orai;

main();

function main(){
    orai.pradinisListas();
    orai.kitasMiestas();
}
async function apiWeather (){
    try{
    let response=await fetch("https://cors-anywhere.herokuapp.com/https://api.meteo.lt/v1/places/"+miestas.textContent+"/forecasts/long-term"),
        datas= await response.json();
        naujasMasyvas(datas.forecastTimestamps);
        mygtukaiIrListas();
    }
    catch(error){
        console.log(error);
    }
}

function mygtukaiIrListas(){ 
    for(let i=0; i<days.length; i++){
        if(i===0){ //isvedamos pirmos Kauno prognozes
            dienuMygtukuInfo(sepArr[i],i)    
            createTableTrAndTd(sepArr[i]);
        }
        else{
            dienuMygtukuInfo(sepArr[i],i)
        }
    days[i].addEventListener("click", function(){ //dienos mygtuku paspaudimai
        dienos=new Date(sepArr[i][0].forecastTimeUtc)
        reset();
        createTableTrAndTd(sepArr[i]);   
    })
    }
}
function naujasMasyvas(info){ //susikuriu nauja masyva kiekvienos dienos su duomenimis
    let newArr, 
        kiek=info.length, 
        k=0,
        naujData,
        dabarData = moment().format().replace(/T/," "),
        found = info.map(function(e) { //surandu nuo kurios valandos rodyti siandienine temp
        return e.forecastTimeUtc 
        }).indexOf(dabarData.substring(0,13)+":00:00"); 
     for(let j=found;j<kiek;j+=k){
         newArr=new Array();
         k=0;
     for(let i=0; i<24 && kiek!==j+k; i++){       
        naujData = moment(info[j+k].forecastTimeUtc, "YYYY-MM-DD HH:mm:ss").toDate();     
        if(naujData.getHours()===i ){
            newArr.push(info[j+k]);
            k++;
        }
   }   
   sepArr.push(newArr);
}
}
function resetBut() { //resetinu mygtuku duomenis kai pasirenku kita miesta
    sepArr=[];
    let span = document.querySelectorAll(".keisti");
    for(let i=0; i<span.length; i++)
        span[i].parentNode.removeChild(span[i]); 
}
function reset(){    //resetinu eilutes kai paspaudziu ant kitos dienos
    city.value="";
    if(tbod.getElementsByTagName("tr").length>0){
        for(let i=tbod.getElementsByTagName("tr").length-1; i>=0;i--){
            tbod.deleteRow(i);
        }            
    }   
}
function dienuMygtukuInfo(el,i) { //visa informacija ant mygtuku
    let span,
        img,
        did=Math.max.apply(Math, el.map(function(o) { return o.airTemperature; })), //didziausia ir maziausia tos dienos temperatura
        maz=Math.min.apply(Math, el.map(function(o) { return o.airTemperature; })),
        naujData = moment(el[0].forecastTimeUtc, "YYYY-MM-DD HH:mm:ss").toDate();
    if(i===0){
        span=document.createElement("SPAN");
        span.className="dien keisti";
        span.textContent="Today"
    } else {
        span=document.createElement("SPAN");
        span.className="dien keisti";
        span.textContent=naujData.toDateString().substring(0,4)+" "+naujData.getDate()+"th";
    }
        days[i].appendChild(span);
        span=document.createElement("SPAN");
        span.className="keisti"
        img=document.createElement("IMG");
        img.src=whatDay(el[el.map(function(o) { return o.airTemperature; }).indexOf(did)].conditionCode);//pagal didziausia temperatura nustatau koks bus condition code ta diena?
        span.appendChild(img);       
        days[i].appendChild(span);
        span=document.createElement("SPAN");
        span.className="dienTemp keisti";
        span.textContent=did.toFixed()+"° "+maz.toFixed()+"°"
        days[i].appendChild(span);
        span=document.createElement("SPAN");
        span.className="condition keisti";
        span.textContent=el[el.map(function(o) { return o.airTemperature; }).indexOf(did)].conditionCode;
        days[i].appendChild(span);
}
function createTableTrAndTd(info){ //Kai kurie veiksmai pries sukuriant valandine oru prognozes eilute
    let tr, 
        td,
        text,
        naujData;
    for(let j=0; j<info.length;j++){
        naujData = moment(info[j].forecastTimeUtc, "YYYY-MM-DD HH:mm:ss").toDate();;
        if(naujData.getHours()>=20 || naujData.getHours()>=0&&naujData.getHours()<=6) //diena ar naktis
            arr=[naujData.toLocaleTimeString().substring(0,2),whatDay(info[j].conditionCode,true),info[j].airTemperature.toFixed(),info[j].windSpeed,info[j].totalPrecipitation];
        else arr=[naujData.toLocaleTimeString().substring(0,2),whatDay(info[j].conditionCode,false),info[j].airTemperature.toFixed(),info[j].windSpeed,info[j].totalPrecipitation];
        arr2=[":00","","°","km/h","mm/val"];       
        createTdForTr(arr,arr2)
        document.querySelectorAll(".fa-long-arrow-alt-up")[j].style.transform = "rotate("+info[j].windDirection+"deg)";
    }
}
function createTdForTr(a1,a2){ //Sukuriam ir ivedam duomenis kiekvienai valandai
    let tr, td,text;
    tr=document.createElement("TR"); 
    for(let i=0;i<a1.length; i++){
        td=document.createElement("TD");
        if(i===1){
            img=document.createElement("IMG");
            img.src=a1[i];
            img.className="dydis";
            td.appendChild(img);
        } else if(i===3){
            td.innerHTML=a1[i]+a2[i]+"<i class='fas fa-long-arrow-alt-up'></i>";
            td.className="slepti";  
        }          
        else{
            text=document.createTextNode(a1[i]+a2[i]);
            td.appendChild(text);
        }
        tr.appendChild(td);
    }
    tbod.appendChild(tr);   
}
function whatDay(el,dn){ //visos icon
    switch (el) {
        case "clear":
         foto= dn ? "img/1_1.png":"img/1.png"; //dienos ar nakties icon
          break;
        case "isolated-clouds":
          foto = dn? "img/2_2.png":"img/2.png";
          break;
        case "scattered-clouds":
           foto = "img/3.png";
          break;
        case "overcast":
          foto = "img/4.png";
          break;
        case "light-rain":
          foto = dn ? "img/5_5.png":"img/5.png"; 
          break;
        case "moderate-rain":
          foto = "img/6.png";
          break;
        case "heavy-rain":
          foto = "img/7.png";
          break
        case "sleet":
          foto = "img/12.png";
          break
        case "light-snow":
          foto = dn ? "img/8_8.png": "img/8.png";
          break
        case "moderate-snow":
          foto = "img/9.png";
          break
        case "heavy-snow":
          foto = "img/10.png";
          break 
        case "fog":
          foto = "img/11.png";
          break  
        case "na":
          foto = "img/calendar.png";              
      }
    return foto;
}
