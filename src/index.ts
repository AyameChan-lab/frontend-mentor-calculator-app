const unitOne:HTMLElement = document.getElementById("unit1")!;
const unitTwo:HTMLElement = document.getElementById("unit2")!;
const unitThree:HTMLElement = document.getElementById("unit3")!;
const toggleBtn:HTMLElement = document.getElementById("toggle-btn")!;
const mainContainer:HTMLElement = document.getElementById("main-container")!;
const SCREEN:HTMLElement = document.querySelector(".screen")!;
const allKeys:NodeListOf<HTMLElement> = document.querySelectorAll("[key]")!;
const currentExpression:HTMLElement = document.getElementById("expression")!;
const EXPRESSION_HERO_DISPLAY:HTMLElement = document.getElementById("expression-hero")!;

type themeValue = "theme-1"|"theme-2"|"theme-3";
const useCookie:()=>themeValue|undefined = ():themeValue|undefined => {
    const [,theme]:string[]|undefined[] = document.cookie.split("theme=");
    return theme as themeValue;
}
window.addEventListener("load",()=>{
    const theme:themeValue|undefined = useCookie();
    if(theme){
        changeTheme(theme);
    }
});

//  username=JohnDoe; expires=Fri, 31 Dec 2025 23:59:59 GMT; path=/
function setThemeCookie(themeValue:themeValue,days:number){
    const date:Date = new Date();
    date.setTime(date.getTime() + (1000*60*60*24)*days);
    document.cookie = `theme=${themeValue}; expires=${date.toUTCString()}; path=/`;
}
function changeTheme(theme:themeValue):void {
    mainContainer.classList.remove("theme-1","theme-2","theme-3");
    mainContainer.classList.add(theme);
    if(theme === "theme-1") toggleBtn.style.marginLeft = "2px";
    if(theme === "theme-2") toggleBtn.style.marginLeft = "20px";
    if(theme === "theme-3") toggleBtn.style.marginLeft = "42px";
    setThemeCookie(theme,3);
}

unitOne.addEventListener("click",():void=> changeTheme("theme-1"));
unitTwo.addEventListener("click",():void=> changeTheme("theme-2"));
unitThree.addEventListener("click",():void=> changeTheme("theme-3"));
// ? Array หลักที่จะใช้ในการคำนวณต่างๆและทำ logic ต่างๆ><
let calculatorMain:string[] = ["0","",""];
// * เช็คว่าใช้ dot ( . ) ไปแล้วหรือยัง
let useDot:boolean = false;
// * ทำงานกับตัวแปร calculatorMain ex:[02 >>>> 2] >_<))))
function deleteUnnecessaryZeros(index:number):void {
    if(calculatorMain[index][0] === "0" && calculatorMain[index].length === 2 && !useDot){
        calculatorMain[index] = (+calculatorMain[index]).toLocaleString();
    }
}

const deleteHandle :(index:number)=>void = (index:number) => {
    if(calculatorMain[index][calculatorMain[index].length-1] === ".") useDot = false;
    calculatorMain[index] = calculatorMain[index].slice(0,-1) || "0";
    adjustExpressionDisplay(calculatorMain[index],null,true);
}

let helperExps:boolean = false;
const findResult:{[key:string]:(n1:number,n2:number)=>number}= {
    "+":(n1, n2):number=> n1 + n2,
    "-":(n1, n2):number => n1 - n2,
    "x":(n1, n2):number => n1 * n2,
    "/":(n1, n2):number => n1 / n2,
}
// ใช้กับ func adjustExpressionDisplay and window resize event เพื่อปรับ fontSize
let EXPR_HERO_DISP_fontSize:number = 36;
let currEXPR_fontSize:number = 20;
const adjustExpressionDisplay:(ExpsHeroText:string|null, currentExpsText:string|null,del?:boolean )=>void = (ExpsHeroText:string|null, currentExpsText:string|null,del?:boolean):void => {
    let int:string = "";
    let float:string = "";
    let foundDot:boolean = false;
    if(ExpsHeroText){
        Array.from(ExpsHeroText).forEach((e:string):void =>{
            if(e === "."){
                foundDot = true;
                float+=e;
                return;
            }
            if(foundDot) float+=e;
            else int+=e;
        });
    }
    if(ExpsHeroText){
        EXPRESSION_HERO_DISPLAY.innerText = `${(+int).toLocaleString()}${float || ""}`;
        // fontSize responsive
        if(EXPRESSION_HERO_DISPLAY.scrollWidth >= SCREEN.scrollWidth-55) {
            EXPR_HERO_DISP_fontSize -= 3;
        }
        if(del && EXPR_HERO_DISP_fontSize !== 36){
            EXPR_HERO_DISP_fontSize += 3;
        }
        EXPRESSION_HERO_DISPLAY.style.fontSize = `${EXPR_HERO_DISP_fontSize}px`;
    }
    if(currentExpsText){
        currentExpression.innerText = currentExpsText;
        // fontSize responsive
        if(currentExpression.scrollWidth >= SCREEN.scrollWidth-45) {
            currEXPR_fontSize -= 7;
        }
        if(currentExpression.scrollWidth === 0 && currEXPR_fontSize !== 20){
            currEXPR_fontSize += 7;
        }
        currentExpression.style.fontSize = `${currEXPR_fontSize}px`;
    }
}
// * window resize [fontSize responsive]
let prevInnerWidth:number = window.innerWidth;
window.addEventListener("resize",(e:any):void =>{
    const currentInnerWidth:number = e.target!.innerWidth;
    if(currentInnerWidth > prevInnerWidth){
        if(EXPRESSION_HERO_DISPLAY.scrollWidth <= SCREEN.scrollWidth-55 && EXPR_HERO_DISP_fontSize !== 36){
            EXPR_HERO_DISP_fontSize+=3;
        }
        if(currentExpression.scrollWidth <= SCREEN.scrollWidth-30 && currEXPR_fontSize!==20){
            currEXPR_fontSize+=0.5;
        }
    }else {
        if(EXPRESSION_HERO_DISPLAY.scrollWidth >= SCREEN.scrollWidth-55){
            EXPR_HERO_DISP_fontSize-=3;
        }
        if(currentExpression.scrollWidth >= SCREEN.scrollWidth-30){
            currEXPR_fontSize-=0.5;
        }
    }
    EXPRESSION_HERO_DISPLAY.style.fontSize = `${EXPR_HERO_DISP_fontSize}px`;
    currentExpression.style.fontSize = `${currEXPR_fontSize}px`;
    prevInnerWidth = e.target!.innerWidth;

})
function inputHandle(attributesValue:"op"|"normal-op"|"delete"|"eq"|"reset",text:string):void{
    if(attributesValue === "normal-op"){
        if(calculatorMain[3] === "form result") calculatorMain = ["0","",""];
        if(calculatorMain[1] === ""){
            if(calculatorMain[0].length === 16) return;
            if(text === "." && useDot) return;
            if(text === ".") useDot = true;
            calculatorMain[0] += text;
            deleteUnnecessaryZeros(0);
            adjustExpressionDisplay(calculatorMain[0]," ");
        }else {
            if(calculatorMain[2].length === 16 && !helperExps) return;
            if(helperExps) calculatorMain[2]="";
            if(calculatorMain[2] === "" && text === "." && useDot) return;
            if(text === ".") useDot = true;
            calculatorMain[2]+=text;
            deleteUnnecessaryZeros(2);
            adjustExpressionDisplay(calculatorMain[2],null);
            helperExps = false;
        }
    }
    if(attributesValue === "op"){
        if(useDot) useDot = false;
        if(calculatorMain[0] === "") return;
        if(calculatorMain[3] === "form result"){
            const holding:string = calculatorMain[0];
            calculatorMain = ["","",""];
            calculatorMain[0] = holding;
        }
        if(calculatorMain[2]===""){
            calculatorMain[1] = text;
            calculatorMain[2] = calculatorMain[0];
            adjustExpressionDisplay(null,`${calculatorMain[0]} ${calculatorMain[1]}`);
            helperExps = true;
        }else if(helperExps){
            calculatorMain[1] = text;
            adjustExpressionDisplay(null,`${calculatorMain[0]} ${calculatorMain[1]}`);
        } else {
            const result:number = findResult[calculatorMain[1]](+calculatorMain[0],+calculatorMain[2]);
            calculatorMain[0] = `${result}`;
            calculatorMain[1] = text;
            calculatorMain[2] = `${result}`;
            adjustExpressionDisplay(calculatorMain[2],`${result} ${text}`);
            helperExps = true;
        }
    }
    if(attributesValue === "delete"){
        if(calculatorMain[2]===""){
            console.log("0")
            deleteHandle(0);
        }else {
            deleteHandle(2);
            console.log("2")
        }
    }
    if(attributesValue === "reset"){
        calculatorMain = ["0","",""];
        adjustExpressionDisplay(" "," ")
    }
    if(attributesValue === "eq"){
        if(calculatorMain.includes("")) return;
        const results:number = findResult[calculatorMain[1]](+calculatorMain[0],+calculatorMain[2]);
        adjustExpressionDisplay(`${results}`,`${calculatorMain[0]} ${calculatorMain[1]} ${calculatorMain[2]} =`);
        calculatorMain = [`${results}`,calculatorMain[1],calculatorMain[2],"form result"];
    }
}
// * addEvents Mouse 🖱️
allKeys.forEach((e:HTMLElement):void=>{
    e.addEventListener("mousedown",(e:any):void =>{
        // Button down effect
        e.target.classList.add("mouse-down");
        // Input Handle
        inputHandle(e.target.attributes[0].value,e.target.innerText);
    });
    e.addEventListener("mouseup",(e:any):void =>{
        e.target.classList.remove("mouse-down");
    });
    e.addEventListener("mouseout",(e:any):void =>{
        e.target.classList.remove("mouse-down");
    });
});

// * keyboardEvent ⌨️
document.addEventListener("keydown",(e:KeyboardEvent):void=>{
    const normalOp:string[] = ["0","1","2","3","4","5","6","7","8","9","."];
    const op:string[] = ["+","-","*","x","/"];
    if(normalOp.includes(e.key)){
        inputHandle("normal-op",e.key);
    }
    if(op.includes(e.key.toLowerCase())){
        inputHandle("op",["*","x"].includes(e.key.toLowerCase())?"x":e.key);
    }
    if(e.key === "Backspace"){
        inputHandle("delete",e.key);
    }
    if(["r","c"].includes(e.key.toLowerCase())){
        inputHandle("reset",e.key);
    }
    if(e.key === "Enter"){
        inputHandle("eq",e.key);
    }
});

//* keyboard click effect
const mapKeyToText:{[key:string]:string} = {
    "*":'x',
    "backspace":"DEL",
    "enter":"=",
    "r":"RESET",
    "c":"RESET"
}
const keyboardEffect:(e:KeyboardEvent)=>void = (e:KeyboardEvent):void=>{
    const targetKey:HTMLElement|undefined = Array.from(allKeys).find((elem:HTMLElement):boolean => {
        const key:string = mapKeyToText[e.key.toLowerCase()] ?? e.key;
        return elem.innerText === key;
    });
    if(e.type === "keydown") targetKey?.classList.add("mouse-down");
    else targetKey?.classList.remove("mouse-down");
}
document.addEventListener("keydown",keyboardEffect);
document.addEventListener("keyup",keyboardEffect);