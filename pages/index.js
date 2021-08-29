import React, { useState, useEffect } from 'react';
import {Howl, Howler} from 'howler';
import Head from 'next/head';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';



const CONST = {
  min_dist : 30,
  size1 : 27,
  size2 : 9,
  size3 : 61,
  rounds : 15,
  distanceLowerBound: 48,
  distanceUpperBound: 384,
}
function range(start, stop, step) {
  if (typeof stop == 'undefined') {
      stop = start;
      start = 0;
  }

  if (typeof step == 'undefined') {
      step = 1;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
  }

  var result = [];
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
  }

  return result;
};

function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = Object.keys(array[0]).join(',');
  str=str+'\r\n';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ','
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}


function Target({target,radius, distanceRadius, name}) {
  return(
    <div className={"target-box "} id={name} style={{
      left:`${target[0]-2*radius}px`,
      top:`${target[1]-2*radius}px`,
      width:`${4*radius}px`,
      height:`${4*radius}px`
    }}>
      <div className="target-core" style={{
        left:`${radius}px`,
        top:`${radius}px`,
        width:`${2*radius}px`,
        height:`${2*radius}px`
      }}>
      </div>
    </div>
  )
}

function randInt(range) {
  var min = Math.ceil(range[0]);
  var max = Math.floor(range[1]);
  return Math.floor(Math.random() * (max - min) + min);
}

function randFloat(range) {
  var min = Math.ceil(range[0]);
  var max = Math.floor(range[1]);
  return Math.random() * (max - min) + min;
}

function nextPos(target,radius,pad, endX, endY){

  let next = [pad+ radius,pad+ radius]
  next[0] = randFloat([pad + radius , pad+ radius + endX])
  next[1] = randFloat([pad+ radius , pad + radius+ endY])
  let limiter = 0;
  while(!checkInside(next[0], next[1], 2 * radius, pad) || tooClose(target, next, 2*radius)){
    next[0] = randFloat([pad , pad + endX])
    next[1] = randFloat([pad , pad + endY])
    limiter++;
    if(limiter > 100){
      console.log("Posn Not found")
      break
    }
  }

  return next
}

function nextPosFromTarget(target,bounds,radius,pad, distanceRadius, mode){
  console.log("Target Value : ", target)
  let next = [target + pad,target+pad]
  let limiter = 0;
  let t = randInt([0, 360])
  next = getPointOnCircumference(t, target, distanceRadius);
  while(!checkInside(next[0], next[1], radius, pad)){
    t = (t + randInt([1, 360])) % 360;
    next = getPointOnCircumference(t, target, distanceRadius);
    limiter++;
    if(limiter > 50){
      console.log("Limit reached Point not found");
      return [-1,-1];
    }
  }

  // let allowedRange = Array.from(range(0,361));

  // let temp = getAngleFromX(distanceRadius, target, window.innerWidth - (radius + pad) )
  // if(temp.length == 2){
  //   let arrTemp = Array.from(range(0,Math.min(temp[0], temp[1])))
  //   arrTemp += Array.from(range(Math.max(temp[0], temp[1]),360))
  //   allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  // }

  // temp = getAngleFromX(distanceRadius, target, radius + pad)
  // if(temp.length == 2){
  //   let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //   allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  // }

  // temp = getAngleFromY(distanceRadius, target, radius + pad)
  // if(temp.length == 2){
  //   let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //   allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  // }

  // temp = getAngleFromY(distanceRadius, target, window.innerHeight - (radius + pad))
  // if(temp.length == 2){
  //   let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //   allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  // }

  // let t = allowedRange[randInt([0, allowedRange.length])];

  // next = getPointOnCircumference(t,target, distanceRadius)
  // let limiter = 0;
  // let randomNum = randInt([1, 42]);


  // while(!checkInside(next[0], next[1], radius, pad)){
  //   let allowedRange = Array.from(range(0,361));

  //   let temp = getAngleFromX(distanceRadius, target, window.innerWidth - (radius + pad) )
  //   if(temp.length == 2){
  //     let arrTemp = Array.from(range(0,Math.min(temp[0], temp[1])))
  //     arrTemp += Array.from(range(Math.max(temp[0], temp[1]),360))
  //     allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  //   }

  //   temp = getAngleFromX(distanceRadius, target, radius + pad)
  //   if(temp.length == 2){
  //     let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //     allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  //   }

  //   temp = getAngleFromY(distanceRadius, target, radius + pad)
  //   if(temp.length == 2){
  //     let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //     allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  //   }

  //   temp = getAngleFromY(distanceRadius, target, window.innerHeight - (radius + pad))
  //   if(temp.length == 2){
  //     let arrTemp = Array.from(range(Math.min(temp[0], temp[1]), Math.max(temp[0], temp[1])))
  //     allowedRange = allowedRange.filter(x => !arrTemp.includes(x) )
  //   }

  //   let t = allowedRange[randInt([0, allowedRange.length])];

  //   next = getPointOnCircumference(t,target, distanceRadius)
  //   limiter++;
  //   if(limiter > 36){ 
  //     console.log("Posn From Target Not found")
  //     break
  //   }
  // }
  if(!checkInside(next[0], next[1], radius, pad)) return [-1, -1];
  console.log("Target Value 2 : ", next)
  return next
}

function getPointOnCircumference(t, center, radius){
  t = t%360;
  let temp_x = radius * Math.cos(t * Math.PI / 180) + center[0];
  let temp_y = radius * Math.sin(t * Math.PI / 180) + center[1];
  return [temp_x, temp_y];
}
function getAngleFromX(radius, center, x){
  let angle = (180 * Math.acos( ( (x - center[0]) / radius) ))/Math.PI;
  if(angle){
    return [angle, 360-angle];
  }
  return [];
}
function getAngleFromY(radius, center, y){
  let angle = (180 * Math.asin((y - center[1]) / radius))/Math.PI;
  if(angle){
    if(angle > 0){
      return [angle, 180 - angle];
    }
    return [360 + angle, 180 - angle];
  }
  return [];
}

function tooClose(center, point, radius){
  if ((point[0] - center[0]) * (point[0] - center[0]) +
      (point[1] - center[1]) * (point[1] - center[1]) <= radius * radius)
      return true;
  else
      return false;
}

function checkInside(x,y, radius, pad){
  if(x + radius + pad < window.innerWidth && x - radius - pad > 0){
    if(y + radius + pad < window.innerHeight && y - radius - pad> 0){
      return true;
    }
  }  
  return false;
}

function calcDist(from,to){

  try{
    var x=parseFloat(from[0])-parseFloat(to[0])
    var y=parseFloat(from[1])-parseFloat(to[1])
    return Math.sqrt(x*x + y*y);
  }
  catch{
    return -1
  }
  
}

export default function Home() {
  const startSound = new Howl({ src : 'beep.mp3'})
  const errorSound = new Howl({ src : 'errorbeep.mp3', volume: 0.1})
  const rewardSound = new Howl({ src : 'rewardbeep.mp3'})
  Howler.volume(100);
  const [pad,setPad] = useState(CONST.size1 + CONST.size2)
  const [radius,setRadius] = useState()
  const [username,setUsername] = useState("")
  const [age,setAge] = useState()
  const [distanceRadius,setDistanceRadius] = useState()
  const [bounds, setBounds] = useState([0,0])
  const [target, setTarget] = useState([pad+radius,pad+radius])
  const [target2, setTarget2] = useState([50,100])
  const [touch, setTouch] = useState([radius,radius])
  const [prevTouch, setPrevTouch] = useState([0,0])
  const [prevTarget, setPrevTarget] = useState([0,0])
  const [next, setNext] = useState([radius,radius])
  const [score, setScore] = useState(0)
  const [angles, setAngles] = useState()
  
  const [round,setRound] = useState(0)
  const [time, setTime] = useState(0)
  const [prevTime,setPrevTime] = useState(0)
  const [avgTime, setAvgTime] = useState(0)

  const [status,setStatus] = useState('frontPage')
  const [log,setLog] = useState([])
  const [mode, setMode] = useState("MT")
  const [radioType, setRadioType] = useState("NT")
  const [endButtonsShow, setEndButtonsShow] = useState(false)
  let canvasWidth = 320;
  let canvasHeight = 640;

  function handleTouchEnd(event){
    setTouch([event.changedTouches[0].clientX,event.changedTouches[0].clientY])
  }


  function init(){
    setStatus('go')
    setEndButtonsShow(false)
    setTime(Date.now())
    setPrevTime(Date.now())
    // -----------------------------------------------------------------------------------------
    document.getElementsByClassName("canvas")[0].style.backgroundColor = "#c8c8c8";
    document.getElementById("canvasText").innerText = "Loading...";
    // -----------------------------------------------------------------------------------------

    setTimeout(()=>{

    // -----------------------------------------------------------------------------------------
      document.getElementsByClassName("canvas")[0].style.backgroundColor = "white";
      document.getElementById("canvasText").innerText = "";
    // -----------------------------------------------------------------------------------------

      canvasWidth = window.innerWidth - 2 * (CONST.size1+ CONST.size2);
      canvasHeight = window.innerHeight - 2 * (CONST.size1+ CONST.size2);
      console.log("Inner width",window.innerWidth)
      console.log("Inner height",window.innerHeight)
      console.log("Canvas inner width",canvasWidth)
      console.log("Canvas inner height",canvasHeight)
      let next = nextPos(target,radius,pad, canvasWidth, canvasHeight)
      if(mode === "MT"){
        let next2 = nextPosFromTarget(next,bounds,radius,pad, distanceRadius, mode)
        let limit = 0;
        while(next2[0] == -1){
          let side = randInt([0,10])
          if(side > 5){
            next[1] = randFloat([pad + radius, pad + radius + distanceRadius])
          }else{
            next[1] = randFloat([(2*canvasHeight/3) + pad, canvasHeight + pad-radius])
          }
          if(next[1] < pad+radius){
            next[1] = randFloat([pad+radius, pad+radius+distanceRadius])
          } 
          next2 = nextPosFromTarget(next,bounds,radius,pad, distanceRadius, mode)
          limit++;
          if(limit > 50){
            console.log("Limit Reached, no 2 points were found.")
            break;
          }
        }
  
        setTarget(next)
        setTarget2(next2)
        console.log("Target 1 : ", next)
        console.log("Target 2 : ", next2)
      }else{
        setTarget(next)
        startSound.play()
      }
    }, 2000)
    
  }

  useEffect(()=>{
    setUsername(sessionStorage.getItem("username")?sessionStorage.getItem("username"):"")
    setAge(sessionStorage.getItem("age")?sessionStorage.getItem("age"):20)
    setRadius(sessionStorage.getItem("radius")?sessionStorage.getItem("radius"):CONST.size1)
    setDistanceRadius(sessionStorage.getItem("distanceRadius")?sessionStorage.getItem("distanceRadius"):CONST.distanceLowerBound)
    
    setBounds([
      parseInt(document.getElementById("touch-bound").getBoundingClientRect().width),
      parseInt(document.getElementById("touch-bound").getBoundingClientRect().height)
    ])
    setTarget([radius+pad,radius+pad])
    if(mode === "MT"){
      setTarget2([radius+pad+ distanceRadius, radius+pad+distanceRadius])
    }
    
  },[])


  function saveCsv(data){
    let csvStr = convertToCSV(data)
    let csvContent = "data:text/csv;charset=utf-8,"+csvStr
    var encodedUri = encodeURI(csvContent);
    var name = mode + "_" + username +"_" + age + "_" + radius;
    if(mode === "MT"){
      name  = name + "_" + distanceRadius;
    }
    name = name + "_" + radioType
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name + ".csv");
    document.body.appendChild(link); 

    link.click();
  }

  useEffect(async()=>{
    if(status!=='go')return;
    canvasWidth = window.innerWidth - 2 * (CONST.size1+ CONST.size2);
    canvasHeight = window.innerHeight - 2 * (CONST.size1+ CONST.size2);
    console.log("Inner width",window.innerWidth)
    console.log("Inner height",window.innerHeight)
    console.log("Canvas inner width",canvasWidth)
    console.log("Canvas inner height",canvasHeight)
    try {
      if(mode === 'FC'){
        if(document.getElementById("target1").style.display === 'none') return;
        const now = Date.now()
        
        await setRound(round+1)
  
        await setPrevTime(now)
  
        let calculatedDist = calcDist(touch,target);
  
        setLog(log.concat([{
          'round': round+1,
          'target_x' : Math.round(target[0]),
          'target_y' : Math.round(target[1]),
          'touch_x' : Math.round(touch[0]),
          'touch_y' : Math.round(touch[1]),
          'distance' : Math.round(calculatedDist),
          'hit' : (calculatedDist<(radius)),
          'username': username,
          'inputTargetRadius': radius,
          'inputAge': age,
        }]))
        
          
        document.getElementById("target1").style.display = "none";
        
        
        if(log.length>=CONST.rounds-1){
          document.getElementById("touch-bound").style.backgroundColor = "white";
          setStatus('end')
          setTimeout(() => setEndButtonsShow(true), 1000);
        }
  
  
        
        if(calculatedDist<(radius)){
          setScore(score+1);
          document.getElementById("touch-bound").style.backgroundColor = "green";
          rewardSound.play();
        }else{
          document.getElementById("touch-bound").style.backgroundColor = "red";
          errorSound.play();
        }
        
        setTimeout(()=>{
          document.getElementById("touch-bound").style.backgroundColor = "white";
          const next = nextPos(target,radius,pad, canvasWidth, canvasHeight)
          setTarget(next)
          document.getElementById("target1").style.display = "block";
          startSound.play()
        }, 1000);
  
      }else if(mode === 'MT'){ // For MT
        if(status!=='go')return;

        if(( document.getElementById("target1").style.display === '' ||
        document.getElementById("target1").style.display === 'block')){

          let calculatedDist = calcDist(touch,target);
          if(calculatedDist < radius){
            const now = Date.now()
            setPrevTouch(touch)
            setPrevTarget(target)
            await setPrevTime(now)
    
            document.getElementById("target1").style.display = 'none';
            document.getElementById("target2").firstChild.style.backgroundColor = 'black';
            document.getElementById("target2").firstChild.style.border = '0px';
            startSound.play()
          }

        }else if(( document.getElementById("target2").style.display === '' ||
        document.getElementById("target2").style.display === 'block')){

          let calculatedDist = calcDist(touch,target2);
          const now = Date.now()
          setLog(log.concat([{
            'round': round+1,
            'start_target_x' : Math.round(target[0]),
            'start_target_y' : Math.round(target[1]),
            'start_touch_x' : Math.round(prevTouch[0]),
            'start_touch_y' : Math.round(prevTouch[1]),
            'end_target_x' : Math.round(target2[0]),
            'end_target_y' : Math.round(target2[1]),
            'end_touch_x' : Math.round(touch[0]),
            'end_touch_y' : Math.round(touch[1]),
            'duration' : now - prevTime,
            'distance' : Math.round(calculatedDist),
            'hit' : (calculatedDist<(radius)),
            'username': username,
            'inputDistanceRadius': distanceRadius,
            'inputTargetRadius': radius,
            'inputAge': age,
          }]))

          await setAvgTime(avgTime +  (now - prevTime))
  
          await setPrevTime(now)
          
          if(log.length>=CONST.rounds-1){
            document.getElementById("touch-bound").style.backgroundColor = "white";
            setStatus('end')
            setTimeout(() => setEndButtonsShow(true), 1000);
          }
  
          if(calculatedDist<(radius)){
            setScore(score+1);
            document.getElementById("touch-bound").style.backgroundColor = "green";
            document.getElementById("target2").style.display = "none";
            rewardSound.play();
          }else{
            document.getElementById("touch-bound").style.backgroundColor = "red";
            document.getElementById("target2").style.display = "none";
            errorSound.play();
          }
          
          setTimeout(()=>{
            document.getElementById("touch-bound").style.backgroundColor = "white";
            let next1 = nextPos(target,radius,pad, canvasWidth, canvasHeight)
            
            let next2 = nextPosFromTarget(next1,bounds,radius,pad, distanceRadius, mode)
            while(next2[0] == -1){
              let side = randInt([0,10])
              if(side > 5){
                next1[1] = randFloat([pad+2*radius+10, distanceRadius])
              }else{
                next1[1] = randFloat([window.innerHeight - (pad+2*radius+10) - distanceRadius, window.innerHeight - (pad+2*radius+10)])
              }
              next2 = nextPosFromTarget(next1,bounds,radius,pad, distanceRadius, mode)
            }
            setTarget(next1)
            setTarget2(next2)
            console.log("Target 1 : ", next1)
            console.log("Target 2 : ", next2)
            
            document.getElementById("target2").firstChild.style.backgroundColor = "white";
            document.getElementById("target2").firstChild.style.border = '1px solid black';
            document.getElementById("target1").style.display = 'block';
            document.getElementById("target2").style.display = 'block';
          }, 1000);  
  

        }

      }
      
    } catch (error) {
      console.log("An error occured")
    }
    
  },[touch])

  function handleRadioGroup(e){
    setRadioType(e.target.value)
  }
  

  return (
    <>
    
      <Head>
        <title>Fitts Eval</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover'/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
      </Head>
      
      <div id="touch-bound" className="board" onTouchStart={(e)=>{handleTouchEnd(e)}} >
        <div className="menuItemContainer front-page"> 
          {(status==='frontPage') ? <div className="startBtn wider" onClick={() => {setStatus("wait3");}}>screen callibration</div>:''}
          {(status==='frontPage') ? <div className="startBtn wider" onClick={() => {setMode("MT"); setStatus("wait1");}}>main task</div>:''}
          {(status==='frontPage') ? <div className="startBtn wider" onClick={() => {setMode("FC"); setStatus("wait2");}}>finger callibration</div>:''}
        </div>
          
        <div className="menuItemContainer">
          {(status==='wait1')?<div className="startBtn" onClick={init}>Start</div>:''}
          {(status==='wait1')?
          <div className="radio-button-wrapper">
            <RadioGroup row aria-label="position" name="position" defaultValue="NT" onChange={handleRadioGroup}>
              <FormControlLabel
                value="NT"
                control={<Radio color="primary" />}
                label="NT"
                labelPlacement="top"
              />
              <FormControlLabel
                value="DT"
                control={<Radio color="primary" />}
                label="DT"
                labelPlacement="top"
              />
              <FormControlLabel
                value="NF"
                control={<Radio color="primary" />}
                label="NF"
                labelPlacement="top"
              />
              <FormControlLabel
                value="DF"
                control={<Radio color="primary" />}
                label="DF"
                labelPlacement="top"
              />
          </RadioGroup>
          </div>
          :''}
          {(status==='wait1')?<><input type="number" placeholder="distance radius" className="inputBox"  value={distanceRadius?distanceRadius.toString():""} onChange={e => {if(e.target){ setDistanceRadius(parseInt(e.target.value)); sessionStorage.setItem("distanceRadius",parseInt(e.target.value) )}}}/></>:''}
          {(status==='wait1')?<><input type="number" placeholder="target button radius" className="inputBox"  value={radius?radius.toString():""} onChange={e => {if(e.target){ setRadius(parseInt(e.target.value)); sessionStorage.setItem("radius",parseInt(e.target.value) )}}}/></>:''}
          {(status==='wait1')?<><input type="text" placeholder="Age" className="inputBox"  value={age?age.toString():""} onChange={e => {if(e.target){ setAge(parseInt(e.target.value)); sessionStorage.setItem("age",parseInt(e.target.value) )}}}/></>:''}
          {(status==='wait1')?<><input type="text" placeholder="User name" className="inputBox"  value={username} onChange={e => {if(e.target){setUsername(e.target.value); sessionStorage.setItem("username",e.target.value )}}}/></>:''}
        </div>
        
        
        

        <div className="menuItemContainer">
          {(status==='wait2')?<div className="startBtn" onClick={init}>Start</div>:''}
          {(status==='wait2')?
          <div className="radio-button-wrapper">
            <RadioGroup row aria-label="position" name="position" defaultValue="NT" onChange={handleRadioGroup}>
              <FormControlLabel
                value="NT"
                control={<Radio color="primary" />}
                label="NT"
                labelPlacement="top"
              />
              <FormControlLabel
                value="DT"
                control={<Radio color="primary" />}
                label="DT"
                labelPlacement="top"
              />
              <FormControlLabel
                value="NF"
                control={<Radio color="primary" />}
                label="NF"
                labelPlacement="top"
              />
              <FormControlLabel
                value="DF"
                control={<Radio color="primary" />}
                label="DF"
                labelPlacement="top"
              />
          </RadioGroup>
          </div>
          :''}
          {(status==='wait2')?<><input type="number" placeholder="target button radius" className="inputBox" value={radius?radius.toString():""} onChange={e => {if(e.target){ setRadius(parseInt(e.target.value)); sessionStorage.setItem("radius",parseInt(e.target.value) )}}}/></>:''}
          {(status==='wait2')?<><input type="text" placeholder="Age" className="inputBox" value={age?age.toString():""}  onChange={e => {if(e.target){ setAge(parseInt(e.target.value)); sessionStorage.setItem("age",parseInt(e.target.value) )}}}/></>:''}
          {(status==='wait2')?<><input type="text" placeholder="User name" className="inputBox"  value={username} onChange={e => {if(e.target){setUsername(e.target.value); sessionStorage.setItem("username",e.target.value )}}}/></>:''}
        </div>
        {status === 'wait3' ?
        ''
         :
         <div className="canvas" style={{margin: `${CONST.size1}px`}}>
          <pre className="log-box">
            {JSON.stringify(log.map(x=>[x.round,x.dist,x.e_time-x.s_time]),null,1)}
          </pre>
          <h1 id="canvasText"></h1>
        </div>
         
         }
        
        {(status==='go')?
        <>
          <span className="score-board">{score}/{log.length}</span>
          {mode === 'FC' ?
            <Target radius={radius} target={target} distanceRadius={distanceRadius} name="target1"/>
          :
            <>

              <Target radius={radius} target={target} distanceRadius={distanceRadius} name="target1"/>
              <Target radius={radius} target={target2} distanceRadius={distanceRadius} name="target2"/>
            </>
          }
          
        </>
        
        :''}
        {(status==='end')
        ?
        <div className="menuItemContainer  front-page">
          <div className="end-score-wrapper">
            <span>your score</span>
            <span>{score}/{CONST.rounds}</span>
            <br></br>
            <span style={{fontSize:'24px'}}>average time per trial</span>
            <span style={{fontWeight:'900', fontSize:'32px'}}>{(avgTime/15000).toFixed(3)} sec</span>
          </div>
          {endButtonsShow ?
          <div className="end-buttons-wrapper">
            <div className="startBtn" onClick={()=>saveCsv(log)}>download</div>
            <div className="startBtn" onClick={()=>window.location.reload()}>cancel</div>
          </div>
          :
          ''}
          
        </div>
        :''}
        <div className="screen-calibration">
        {(status === 'wait3') ? <><div className="center-box" /> <span className="startBtn" onClick={() => setStatus('frontPage')}>back</span></>
        :''
        }
        
        </div>
      </div>
      
    </>
  )
}
