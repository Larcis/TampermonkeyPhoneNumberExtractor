// ==UserScript==
// @name         ig dm crawler 4
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  instagram dm crawler, searchs for defined regex
// @author       uygar_koroglu
// @match        https://www.instagram.com/direct/*
// @grant        none
// @require https://unpkg.com/react@16/umd/react.production.min.js
// @require https://unpkg.com/react-dom@16/umd/react-dom.production.min.js
// ==/UserScript==

(function() {
    'use strict';
    let INTERVAL = 1300;
    let CURRENT_CHAT = 0;

    //var phone_number_regex = /\+?(\d\s*){10,14}/g;
    var phone_number_regex = /(\+90|0)?\s*[5](\d\s*){9}/g;
    var contact_list = {};
    let main_interv = null;
    var ui_div;
    function scrollToTop(){
        let sc = document.getElementsByClassName("frMpI")[0];
        if(!sc) return false;
        if(sc.scrollTop > 0){
            sc.scrollTo(0, 0);
            return false;
        } else if(sc.firstElementChild.firstElementChild.classList.contains("rBNOH")){
            return false;
        }
        return true;
    }

    function queryChat(){
        let msgs = document.getElementsByClassName("frMpI")[0].getElementsByTagName("span");
        let str = "";
        for(let x = 0; x< msgs.length; x++){
            if(msgs[x].classList.length == 0){
                str += "___" + msgs[x].innerText;
            }
        }
        let matched_numbers = str.match(phone_number_regex);
        if(matched_numbers && matched_numbers.length > 0){
            contact_list[document.getElementsByClassName("_7UhW9 vy6Bb qyrsm KV-D4 fDxYl")[0].innerText] = matched_numbers;
        }
    }

    const e = React.createElement;
    ui_div = document.createElement("div");
    ui_div.id = "ui_div";
    document.body.insertBefore(ui_div, document.body.firstElementChild);

    var style = document.createElement('style');
    style.type='text/css';
    let style_text = `
        dl{
			color: white !important;
		}
		dd {
			display: list-item !important;
			list-style-type: circle !important;
			margin-left:20px !important;
		}
		#ui_div{
			position:absolute;
			top:0px;
			left:0px;
			width:300px;
			height:300px;
			-moz-border-radius:100px;
			border:3px  solid #000;
			-moz-box-shadow: 0px 0px 8px  #fff;
			z-index: 100;
			background: rgba(0,0,0, 0.6);
			overflow: auto;
		}
		::-webkit-scrollbar {
		  width: 10px;
		}
		::-webkit-scrollbar-track {
		  background: #f1f1f1;
		}
		::-webkit-scrollbar-thumb {
		  background: #888;
		}

		::-webkit-scrollbar-thumb:hover {
		  background: #555;
		}
    `
    if(style.styleSheet){
        style.styleSheet.cssText=style_text;
    }else{
        style.appendChild(document.createTextNode(style_text));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    function contactsToListItem(cl){
        let arr = [];
        Object.keys(cl).forEach(function (key) {
            var tel_nums = cl[key];
            arr.push(e("dt", null, key));
            for(let x = 0; x < tel_nums.length; x++){
                arr.push(e("dd", null, tel_nums[x]));
            }
            arr.push(e("div", {
                style: {"margin-top": "10px","margin-bottom": "10px", border: "2px rgba(0,255,0, 0.6)", "border-style": "solid", width: "100%", height: "1px"}
            }, null));
        });
        arr.push( e("button", {
            onClick : () => {
                download("rehber.json", JSON.stringify(contact_list));
            },
            style: {"margin-left": "30%" , width: "40%"}
        }, "indir"));
        return arr;
    }
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    function main(){
        if(scrollToTop()){
            queryChat();
            let chats = document.getElementsByClassName("N9abW")[0].firstElementChild.children;
            CURRENT_CHAT++;
            if(CURRENT_CHAT == chats.length-1){
                CURRENT_CHAT = 0;
                clearInterval(main_interv);
            } else {
                ReactDOM.render(e('dl', null, ...contactsToListItem(contact_list)), ui_div);
                chats[CURRENT_CHAT].firstElementChild.click();
            }
        }
    }

    setTimeout(()=>{
        document.getElementsByClassName("N9abW")[0].firstElementChild.children[CURRENT_CHAT].firstElementChild.click();
    },4000);

    let interv = setInterval(startRoutine, 100);
    function startRoutine(){
        if(document.location.href.includes("/t/")){
            clearInterval(interv);
            main_interv = setInterval(main, INTERVAL);
        }
    }
    ui_div.onmousedown = function(event) {
        let shiftX = event.clientX - ui_div.getBoundingClientRect().left;
        let shiftY = event.clientY - ui_div.getBoundingClientRect().top;
        moveAt(event.pageX, event.pageY);
        function moveAt(pageX, pageY) {
            ui_div.style.left = pageX - shiftX + 'px';
            ui_div.style.top = pageY - shiftY + 'px';
        }
        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
        document.addEventListener('mousemove', onMouseMove);
        ui_div.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            ui_div.onmouseup = null;
        };

    };
    ui_div.ondragstart = function() {
        return false;
    };
})();
