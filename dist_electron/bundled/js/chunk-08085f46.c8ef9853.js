(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-08085f46"],{2930:function(e,n,t){"use strict";t("7007")},7007:function(e,n,t){},c0d0:function(e,n,t){"use strict";t.r(n);var a=t("7a23");Object(a["w"])("data-v-3cff0e22");const r={ref:"warning-sound"},s=["volume"],c={ref:"normal-sound"},i=["volume"],o=Object(a["h"])("p",{class:"delimeter"},"|",-1),u={class:"text"};function l(e,n,t,l,m,d){const g=Object(a["B"])("font-awesome-icon");return Object(a["t"])(),Object(a["e"])(a["b"],{name:"flip",tag:"div",id:"warning-message-queue",class:Object(a["p"])({"regular-top":"regular-top"===m.mode,"regular-bottom":"regular-bottom"===m.mode,mini:"mini"===m.mode})},{default:Object(a["G"])(()=>[Object(a["h"])("audio",r,[Object(a["h"])("source",{src:"local-audio://musics/warning.wav",type:"audio/wav",volume:m.warningVolume},null,8,s)],512),Object(a["h"])("audio",c,[Object(a["h"])("source",{src:"local-audio://musics/normal.wav",type:"audio/wav",volume:m.warningVolume},null,8,i)],512),(Object(a["t"])(!0),Object(a["g"])(a["a"],null,Object(a["z"])(m.messages,(e,n)=>(Object(a["t"])(),Object(a["g"])("div",{class:Object(a["p"])(["message flip-item",{normal:"normal"===e.type,warning:"warning"===e.type}]),key:n},["warning"===e.type?(Object(a["t"])(),Object(a["e"])(g,{key:0,icon:"exclamation-triangle",class:"icon"})):Object(a["f"])("",!0),"normal"===e.type?(Object(a["t"])(),Object(a["e"])(g,{key:1,icon:"info-circle",class:"icon"})):Object(a["f"])("",!0),o,Object(a["h"])("p",u,Object(a["D"])(d.messageFilter(e.content)),1)],2))),128))]),_:1},8,["class"])}Object(a["u"])();var m=t("34bb"),d={name:"warning-message",data(){return{mode:"regular-top",messages:[],warningVolume:0,duration:3}},mounted(){m["ipcRenderer"].send("REQUEST_INIT_SCREEN_VALUE","warningMessage"),m["ipcRenderer"].on("INIT",(e,n)=>{this.mode=n.warningMessage.mode,this.warningVolume=parseFloat(n.warningMessage.warningVolume)}),m["ipcRenderer"].on("SET_WARNING_MODE",(e,n)=>{this.mode=n}),m["ipcRenderer"].on("INSERT_MESSAGE",(e,n)=>{this.messages.unshift(n),this.warningVolume>0&&this.playSound(n.type),setTimeout(()=>{this.messages.pop()},1e3*this.duration)}),m["ipcRenderer"].on("SET_WARNING_VOLUME",(e,n)=>{this.warningVolume=parseFloat(n),this.$refs["warning-sound"].querySelector("source").volume=this.warningVolume,this.$refs["normal-sound"].querySelector("source").volume=this.warningVolume})},methods:{playSound(e){"normal"===e?this.$refs["normal-sound"].play():"warning"===e&&this.$refs["warning-sound"].play()},messageFilter(e){switch(e){case"eye-blink":return"눈이 건조해지고 있습니다. 눈을 더 자주 깜빡여주세요.";case"eye-size-check":return"잠시만 기다려주세요.";case"eye-size-check-start":return"지금부터 카메라를 보고 정자세로 3초간 편하게 눈을 떠주세요.";case"eye-size-check-complete":return"측정이 완료되었습니다.";case"eye-size-check-fail":return"눈을 감으셨습니다. 3초 뒤 다시 측정합니다.";case"bright-warning":return"주변이 너무 어둡습니다. 주변을 밝게 해주세요.";case"bright-warning-auto":return"주변이 너무 어둡습니다. 자동으로 밝기를 조절할게요.";case"distance-warning":return"화면과의 거리가 너무 가깝습니다. 적정거리를 유지해주세요.";case"capture-face":return"정자세 기준이 설정되었어요.";case"no-face":return"흠... 얼굴을 못찾겠네요. 카메라를 정면으로 바라봐주세요";case"ready-to-capture":return"정자세 기준을 설정합니다. 바른자세로 카메라를 응시해 주세요. 5~10초의 시간이 소요됩니다.";case"cant-detect-camera":return"카메라가 준비되면 다시 시도해 주세요.";case"message-position":return"이제 이 위치에 메세지가 출력됩니다.";case"stare-time":return"너무 오랜시간 화면을 보고 있어요. 5분만 눈에게 휴식시간을 주세요";default:return""}}}};t("2930");d.render=l,d.__scopeId="data-v-3cff0e22";n["default"]=d}}]);
//# sourceMappingURL=chunk-08085f46.c8ef9853.js.map