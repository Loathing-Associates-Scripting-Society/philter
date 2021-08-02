var e=Object.defineProperty,t=Object.defineProperties,a=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable,s=(t,a,l)=>a in t?e(t,a,{enumerable:!0,configurable:!0,writable:!0,value:l}):t[a]=l,i=(e,t)=>{for(var a in t||(t={}))n.call(t,a)&&s(e,a,t[a]);if(l)for(var a of l(t))r.call(t,a)&&s(e,a,t[a]);return e},o=(e,l)=>t(e,a(l)),c=e=>"symbol"==typeof e?e:e+"",m=(e,t)=>{var a={};for(var s in e)n.call(e,s)&&t.indexOf(s)<0&&(a[s]=e[s]);if(null!=e&&l)for(var s of l(e))t.indexOf(s)<0&&r.call(e,s)&&(a[s]=e[s]);return a};import{T as u,R as d,c as p,I as g,S as C,F as E,r as h,H as v,C as f,a as b,b as _,d as N,e as I,B as y,M as T,f as P,g as k,h as x,P as S,i as R,U as w,j as A,k as M,A as O,l as z,m as U,n as D,u as L,o as F,p as K,q as G,s as B,t as $,v as j,N as H,w as V,D as W,x as J,y as Y,z as q,E as Q,G as X,J as Z,K as ee,L as te,O as ae,Q as le}from"./philter-manager.vendor.js";const ne=Object.freeze({AUTO:0,BREAK:0,CLAN:0,CLST:0,DISC:0,DISP:0,GIFT:0,KEEP:0,MAKE:0,MALL:0,PULV:0,TODO:0,UNTN:0,USE:0});class re extends Error{constructor(e,t,a){super(e),this.code=t,this.response=a}}re.prototype.name="ApiError";const se=async(e,t,a)=>{const l=function(e){const t={};for(const l of Object.keys(e))if("method"===(a=l)||"path"===a)t[l]=e[l];else{const a=JSON.stringify(e[l]);void 0!==a&&(t[l]=a)}var a;return t}(i({path:e,method:t},a)),n=await fetch("/relay_Philter_Manager.js?relay=true",{body:new URLSearchParams(l),method:"POST"});if(!n.ok){let e;try{e=await n.text()}catch(s){console.error(s)}throw new re(n.statusText,n.status,e)}let r;try{r=await n.json()}catch(o){throw new re(`Invalid JSON returned from server (${o})\nResponse: ${r}`,500,r)}if("error"in r)throw new re(r.error.message,r.error.code,r.error.message);return r},ie=e=>se("/ruleset","post",{cleanupRules:e}),oe=u.create({maxToasts:1}),ce=(e,t,a)=>{t?oe.show({icon:"warning-sign",intent:"warning",message:t instanceof re?d.createElement(d.Fragment,null,a,": ",t.message,d.createElement("br",null),"Response: ",String(t.response)):`${a}: ${t}`},e):oe.dismiss(e)},me=(e,t,a)=>{t?oe.show({icon:"floppy-disk",intent:"primary",message:a},e):oe.dismiss(e)},ue=e=>!e.isTradable;const de=e=>{var t=e,{className:a,fill:l,small:n}=t,r=m(t,["className","fill","small"]);return d.createElement("input",i({className:p("NumericInputLite",g,n&&C,l&&E,a),dir:"auto",type:"number"},r))};const pe=e=>"UNKN"===e||(e=>"string"==typeof e&&Object.prototype.hasOwnProperty.call(ne,e))(e),ge=h.exports.memo((function(e){var t=e,{className:a,item:l,onChange:n,value:r}=t,s=m(t,["className","item","onChange","value"]);return d.createElement("div",i({className:p(v,"SelectCleanupAction",a)},s),d.createElement("select",{onChange:e=>pe(e.target.value)&&n(e.target.value),value:r},d.createElement("option",{value:"UNKN"},"(uncategorized)"),d.createElement("option",{value:"KEEP"},"Keep all"),l.canMall&&d.createElement("option",{value:"MALL"},"Mall sale"),l.canBreak&&d.createElement("option",{value:"BREAK"},"Break apart"),l.canAutosell&&d.createElement("option",{value:"AUTO"},"Autosell"),l.canDiscard&&d.createElement("option",{style:{color:f.ORANGE2},value:"DISC"},"Discard"),l.canGift&&d.createElement("option",{value:"GIFT"},"Send as gift"),l.canStash&&d.createElement("option",{value:"CLAN"},"Put in clan stash"),l.canPulverize&&d.createElement("option",{style:ue(l)?{color:f.ORANGE2}:void 0,value:"PULV"},"Pulverize"),l.canMake&&d.createElement("option",{value:"MAKE"},"Craft..."),l.canUntinker&&d.createElement("option",{value:"UNTN"},"Untinker"),l.canUse&&d.createElement("option",{value:"USE"},"Use"),l.canCloset&&d.createElement("option",{value:"CLST"},"Closet"),l.canDisplay&&d.createElement("option",{value:"DISP"},"Display"),d.createElement("option",{value:"TODO"},"Reminder")))})),Ce=({item:e,rule:t,onChange:a})=>{const l=h.exports.useCallback((e=>{a&&a((t=>e===(null==t?void 0:t.action)?t:"UNKN"===e?null:o(i({},t),"GIFT"===e?{action:e,message:"",recipent:""}:"MAKE"===e?{action:e,shouldUseCreatableOnly:!1,targetItem:""}:"MALL"===e?{action:e,minPrice:0}:"TODO"===e?{action:e,message:""}:{action:e})))}),[a]);let n,r;return t&&("PULV"===t.action&&ue(e)?(n="You will pulverize an untradable item.",r=_.WARNING):"DISC"===t.action&&(n="You will gain no meat from discarding.",r=_.WARNING)),d.createElement(b,{className:"CleanupRulePicker",helperText:n,intent:r},d.createElement("div",{className:"CleanupRulePicker__Inputs"},d.createElement(ge,{className:"CleanupRulePicker__Child",item:e,onChange:l,value:t?t.action:"UNKN"}),t?"GIFT"===t.action?d.createElement(d.Fragment,null,d.createElement(b,{className:"CleanupRulePicker__Child",contentClassName:"CleanupRulePicker__InputGiftRecipent",helperText:!t.recipent&&"No recipent name",inline:!0,intent:t.recipent?void 0:_.DANGER,label:"to"},d.createElement("input",{className:p(g,C,!t.recipent&&N,"CleanupRulePicker__InputText"),onChange:e=>null==a?void 0:a(o(i({},t),{recipent:e.target.value})),placeholder:"Player name",type:"text",value:t.recipent})),d.createElement(b,{className:"CleanupRulePicker__Child",contentClassName:"CleanupRulePicker__InputGiftMessage",inline:!0,label:"with"},d.createElement("input",{className:p(g,C,"CleanupRulePicker__InputText"),onChange:e=>null==a?void 0:a(o(i({},t),{message:e.target.value})),placeholder:"Kmail message",type:"text",value:t.message}))):"MAKE"===t.action?d.createElement(d.Fragment,null,d.createElement(b,{className:"CleanupRulePicker__Child",contentClassName:"CleanupRulePicker__InputMakeTarget",helperText:!t.targetItem&&"No item name",inline:!0,intent:t.targetItem?void 0:_.DANGER,label:"into"},d.createElement("input",{className:p(g,C,"CleanupRulePicker__InputText"),onChange:e=>null==a?void 0:a(o(i({},t),{targetItem:e.target.value})),placeholder:"Item name",type:"text",value:t.targetItem})),d.createElement(I,{checked:t.shouldUseCreatableOnly,className:"CleanupRulePicker__Child CleanupRulePicker__Checkbox",onChange:e=>null==a?void 0:a(o(i({},t),{shouldUseCreatableOnly:e.currentTarget.checked}))},d.createElement("span",{className:"CleanupRulePicker__CheckBoxText"},"Only use available ingredients"))):"MALL"===t.action?d.createElement(b,{className:"CleanupRulePicker__Child",contentClassName:"CleanupRulePicker__InputMallMinPrice",inline:!0,label:"min price"},d.createElement(de,{max:999999999,min:0,onChange:e=>{const l=Number(e.target.value);Number.isInteger(l)&&(null==a||a(o(i({},t),{minPrice:Math.max(0,Math.min(999999999,l))})))},value:t.minPrice})):"TODO"===t.action?d.createElement(b,{className:"CleanupRulePicker__Child",contentClassName:"CleanupRulePicker__InputTodoMessage",inline:!0,label:"with message:"},d.createElement("input",{className:p(g,C,"CleanupRulePicker__InputText"),onChange:e=>null==a?void 0:a(o(i({},t),{message:e.target.value})),placeholder:"Enter reminder message",type:"text",value:t.message})):null:null))};const Ee=()=>d.createElement("span",{className:p(U,T,D,"TableItemCleanup__ColumnMallPrice--minimum"),title:"Is at minimum mall price"},"min"),he=h.exports.memo((function(e){var t=e,{className:a,inventory:l,item:n,onRuleChange:r,rule:s}=t,c=m(t,["className","inventory","item","onRuleChange","rule"]);return d.createElement("div",i({className:`TableItemCleanup__Row ${a||""}`},c),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnItemName"},d.createElement("a",{className:p(y,T,"TableItemCleanup__ItemImageLink"),onClick:()=>{return e=n.descid,void(null==(t=window.open(`/desc_item.php?whichitem=${e}`,"name","height=200,width=214"))||t.focus());var e,t},tabIndex:0,title:"View item description"},d.createElement("img",{className:"TableItemCleanup__ItemImage",alt:n.name,src:`/images/itemimages/${n.image}`})),d.createElement("a",{className:p(y,T,"TableItemCleanup__ItemNameLink"),href:`https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=${n.name}&go=Go`,rel:"noopener noreferrer",target:"_blank",tabIndex:0,title:"Visit KoL wiki page"},d.createElement("span",{dangerouslySetInnerHTML:{__html:n.name}}),l.inventory[n.id]>0&&d.createElement(d.Fragment,null," ",d.createElement("i",null,"(",l.inventory[n.id],")")))),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnClosetAmount"},l.closet[n.id]||0),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnStorageAmount"},l.storage[n.id]||0),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnDisplayCaseAmount"},l.displayCase[n.id]||0),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnMallPrice"},n.mallPrice&&n.mallPrice.toLocaleString().replace(/,/g,",​"),null!==n.mallPrice&&n.isMallPriceAtMinimum&&d.createElement(Ee,null)),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnKeepAmount"},d.createElement(de,{className:"TableItemCleanup__InputKeepAmount",disabled:!s||"KEEP"===s.action,fill:!0,min:0,onChange:e=>{const t=Number(e.target.value);Number.isInteger(t)&&r(n.id,(e=>e&&o(i({},e),{keepAmount:t})))},value:(null==s?void 0:s.keepAmount)||0})),d.createElement("div",{className:"TableItemCleanup__Cell TableItemCleanup__ColumnAction"},d.createElement(Ce,{item:n,onChange:h.exports.useCallback((e=>r(n.id,e)),[n.id,r]),rule:s})))}),P),ve=(e,t)=>t.items[e].id,fe=({data:{cleanupRules:e,onRuleChange:t,inventory:a,items:l},index:n,style:r})=>d.createElement(he,{inventory:a,item:l[n],onRuleChange:t,rule:e[l[n].id],style:r}),be=e=>{e&&(e.tabIndex=-1)},_e=h.exports.memo((function(e){var t=e,{className:a,cleanupRules:l,disableReset:n,disableSave:r,inventory:s,items:u,onChange:g,onReset:C,onRuleChange:E,onSave:v}=t,f=m(t,["className","cleanupRules","disableReset","disableSave","inventory","items","onChange","onReset","onRuleChange","onSave"]);const b=h.exports.useCallback(((e,t)=>null==g?void 0:g((a=>{const l="function"==typeof t?t(a[e]||null):t;if(l)return o(i({},a),{[e]:l});{const t=a,{[e]:l}=t;return m(t,[c(e)])}}))),[g]),[_,N]=h.exports.useState(""),I=h.exports.useMemo((()=>{if(!_)return u;const e=_.trim().toLowerCase();return u.filter((t=>t.name.toLowerCase().includes(e)))}),[_,u]),y=h.exports.useMemo((()=>({inventory:s,items:I,cleanupRules:l,onRuleChange:E||b})),[b,I,s,l,E]),T=h.exports.useMemo((()=>d.createElement(k,{className:"TableItemCleanup__EditorButtons"},d.createElement(x,{disabled:r,icon:"saved",onClick:v,text:"Save all"}),d.createElement(x,{disabled:n,icon:"reset",onClick:C,text:"Discard changes"}),d.createElement(S,{className:"TableItemCleanup__PopperFix",popoverClassName:R,content:d.createElement("p",null,"Select an action for each item. These actions will tell Philter how to process each item:",d.createElement(w,null,d.createElement("li",null,"Philter will warn you about uncategorized items, but will not touch them."),d.createElement("li",null,'"Mall sale" will use the lowest mall price ',d.createElement("i",null,"at cleanup"),', but never below the "min price".'),d.createElement("li",null,'"Send as gift" actually uses Kmail, not the gift shop.'),d.createElement("li",null,'"Crafting" can use up other ingredients needed for the recipe, even if you marked them as "Keep all".'),d.createElement("li",null,'"Pulverize" will send items to Smashbot if you can\'t use Pulverize or Malus, but only in aftercore.'),d.createElement("li",null,'"Reminder" will show a reminder message during cleanup, but won\'t touch the item.')))},d.createElement(x,{icon:"help",text:"Help"})))),[n,r,C,v]);return d.createElement("section",i({className:p("TableItemCleanup",a)},f),d.createElement("header",{className:"TableItemCleanup__HeaderMenu"},T,d.createElement(A,{className:"TableItemCleanup__ItemFilterControl"},d.createElement("div",null,"Filter by:"),d.createElement(M,{onChange:h.exports.useCallback((e=>N(e.target.value)),[]),placeholder:"Enter item name...",value:_}),d.createElement("div",{className:"TableItemCleanup__ItemFilterBarHelperText"},_&&`${I.length} / ${u.length} match${I.length>1?"es":""}`))),d.createElement("div",{className:"TableItemCleanup__TableWrapper"},d.createElement(O,{disableWidth:!0},(({height:e})=>d.createElement("div",{className:"TableItemCleanup__Inner"},d.createElement("div",{className:"TableItemCleanup__HeaderRow"},d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnItemName"},"Item (Amount)"),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnClosetAmount"},d.createElement("abbr",{title:"Amount in Closet"},"C")),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnStorageAmount"},d.createElement("abbr",{title:"Amount in Storage"},"S")),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnDisplayCaseAmount"},d.createElement("abbr",{title:"Amount in Display Case"},"D")),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnMallPrice"},d.createElement("abbr",{title:"5th lowest mall price"},"Price")),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnKeepAmount"},"Keep"),d.createElement("div",{className:"TableItemCleanup__HeaderCell TableItemCleanup__ColumnAction"},"Action")),d.createElement(z,{className:"TableItemCleanup__Body",height:e,itemCount:I.length,itemData:y,itemKey:ve,itemSize:60,outerRef:be,overscanCount:15,width:"100%"},fe))))),d.createElement("footer",{className:"TableItemCleanup__FooterMenu"},T))})),Ne={all:0,closet:0,craft:0,display:0,dispose:0,gift:0,inventory:0,keep:0,mall:0,pulverize:0,reminder:0,search:0,stash:0,untinker:0,use:0},Ie=({cleanupRules:e,onChange:t})=>{const{data:a,error:l,isValidating:n,mutate:r}=L("/cleanup-tables/categorized",(async()=>{const e=await se("/cleanup-tables/categorized","get",{});return e.result.items.sort(((e,t)=>e.id-t.id)),e.result}));h.exports.useEffect((()=>{(null==a?void 0:a.cleanupRules)&&t((e=>null!=e?e:a.cleanupRules))}),[null==a?void 0:a.cleanupRules,t]);const s=h.exports.useMemo((()=>Boolean(e)&&!F(e,null==a?void 0:a.cleanupRules)),[e,null==a?void 0:a.cleanupRules]),u=h.exports.useCallback((()=>(null==a?void 0:a.cleanupRules)&&t(a.cleanupRules)),[null==a?void 0:a.cleanupRules,t]),{error:p,execute:g,loading:C}=K((()=>r((async t=>{var a;if(!t)throw new Error("Cannot save ruleset when we don't have any data yet");if(!e)throw new Error("Cannot save active ruleset because it has not been initialized yet");const l=await ie(e);if(!(null==(a=null==l?void 0:l.result)?void 0:a.success))throw new Error(`Unexpected response: ${JSON.stringify(l)}`);return o(i({},t),{cleanupRules:e})}),!1)));h.exports.useEffect((()=>ce("savingError",p,"Cannot save cleanup rule")),[p]),h.exports.useEffect((()=>me("isSaving",C,"Saving cleanup rules...")),[C]);const E=h.exports.useCallback(((e,l)=>t((t=>{var n;if(void 0===t)return t;const r=t[e],s="function"==typeof l?l(t[e]||null):l;if(r&&r.action!==(null==s?void 0:s.action)){const t=null==(n=null==a?void 0:a.items.find((t=>t.id===e)))?void 0:n.name;void 0!==t&&(u=s?`Changed action for ${t} to "${(e=>{switch(e){case"AUTO":return"Autosell";case"BREAK":return"Break apart";case"CLAN":return"Put in clan stash";case"CLST":return"Closet";case"DISC":return"Discard";case"DISP":return"Display";case"GIFT":return"Send as gift";case"KEEP":return"Keep all";case"MAKE":return"Craft";case"MALL":return"Mall sale";case"PULV":return"Pulverize";case"TODO":return"Reminder";case"UNTN":return"Untinker";case"USE":return"Use";default:return e}})(s.action)}"`:`Removed action for ${t}`,oe.show({icon:"info-sign",message:u}))}var u;if(s)return o(i({},t),{[e]:s});{const a=t,{[e]:l}=a;return m(a,[c(e)])}}))),[null==a?void 0:a.items,t]),[v,f]=h.exports.useState("all"),b=h.exports.useMemo((()=>{var t;return((e,t)=>e.reduce(((e,a)=>{const l=t[a.id];if(l)switch(e.all.push(a),l.action){case"CLST":e.closet.push(a);break;case"MAKE":e.craft.push(a);break;case"AUTO":case"DISC":e.dispose.push(a);break;case"BREAK":case"USE":e.use.push(a);break;case"DISP":e.display.push(a);break;case"KEEP":e.keep.push(a);break;case"GIFT":e.gift.push(a);break;case"MALL":e.mall.push(a);break;case"PULV":e.pulverize.push(a);break;case"TODO":e.reminder.push(a);break;case"UNTN":e.untinker.push(a);break;case"CLAN":e.stash.push(a)}return e}),{all:[],closet:[],craft:[],display:[],dispose:[],gift:[],keep:[],mall:[],pulverize:[],reminder:[],stash:[],untinker:[],use:[]}))(null!=(t=null==a?void 0:a.items)?t:[],e||{})}),[e,null==a?void 0:a.items]),_=!Object.prototype.hasOwnProperty.call(b,v)||b[v].length>0?v:"all",N=t=>e&&a&&d.createElement(_e,{className:"PanelCategorizedItems__Table",disableReset:!s,disableSave:!s,inventory:a.inventory,items:t,cleanupRules:e,onRuleChange:E,onReset:u,onSave:g});return d.createElement(d.Fragment,null,d.createElement(G,null,"Edit Cleanup Rules"),a?d.createElement(B,{className:"PanelCategorizedItems__Tabs",onChange:e=>(e=>"string"==typeof e&&Object.prototype.hasOwnProperty.call(Ne,e))(e)&&f(e),renderActiveTabPanelOnly:!0,selectedTabId:_},d.createElement($,{id:"all",panel:N(b.all),panelClassName:"PanelCategorizedItems__TabItem",title:"All"}),b.keep.length>0&&d.createElement($,{id:"keep",panel:N(b.keep),panelClassName:"PanelCategorizedItems__TabItem",title:"Keep"}),b.mall.length>0&&d.createElement($,{id:"mall",panel:N(b.mall),panelClassName:"PanelCategorizedItems__TabItem",title:"Mall"}),b.pulverize.length>0&&d.createElement($,{id:"pulverize",panel:N(b.pulverize),panelClassName:"PanelCategorizedItems__TabItem",title:"Pulverize"}),b.use.length>0&&d.createElement($,{id:"use",panel:N(b.use),panelClassName:"PanelCategorizedItems__TabItem",title:"Use"}),b.closet.length>0&&d.createElement($,{id:"closet",panel:N(b.closet),panelClassName:"PanelCategorizedItems__TabItem",title:"Closet"}),b.stash.length>0&&d.createElement($,{id:"stash",panel:N(b.stash),panelClassName:"PanelCategorizedItems__TabItem",title:"Clan Stash"}),b.craft.length>0&&d.createElement($,{id:"craft",panel:N(b.craft),panelClassName:"PanelCategorizedItems__TabItem",title:"Crafting"}),b.untinker.length>0&&d.createElement($,{id:"untinker",panel:N(b.untinker),panelClassName:"PanelCategorizedItems__TabItem",title:"Untinkering"}),b.gift.length>0&&d.createElement($,{id:"gift",panel:N(b.gift),panelClassName:"PanelCategorizedItems__TabItem",title:"Gift"}),b.display.length>0&&d.createElement($,{id:"display",panel:N(b.display),panelClassName:"PanelCategorizedItems__TabItem",title:"Display"}),b.dispose.length>0&&d.createElement($,{id:"dispose",panel:N(b.dispose),panelClassName:"PanelCategorizedItems__TabItem",title:"Dispose"}),b.reminder.length>0&&d.createElement($,{id:"reminder",panel:N(b.reminder),panelClassName:"PanelCategorizedItems__TabItem",title:"Reminders"})):n?d.createElement(j,null):d.createElement(H,{icon:l?"error":"info-sign",title:l?"Failed to load data":"Data not loaded yet",description:l instanceof Error?l.message:void 0}))};const ye=h.exports.memo((function(e){var t=e,{fileNamePrefix:a,fileNameSuffix:l,className:n=""}=t,r=m(t,["fileNamePrefix","fileNameSuffix","className"]);return d.createElement(M,i({className:`InputGroupAffixedFileName ${n}`,leftElement:a?d.createElement(V,{className:"InputGroupAffixedFileName__Prefix"},a):void 0,rightElement:l?d.createElement(V,{className:"InputGroupAffixedFileName__Suffix"},l):void 0},r))}));const Te=h.exports.memo((function({changedFiles:e=[],isOpen:t,onCancel:a,onSaveWithCopy:l,onSaveWithoutCopy:n}){return d.createElement(W,{canEscapeKeyClose:!0,canOutsideClickClose:!0,icon:"warning-sign",isOpen:t,onClose:a,title:"Changing data file name"+(e.length>1?"s":"")},d.createElement("div",{className:J},"You are about the change your data file",e.length>1?"s' names":"'s name",":",d.createElement("ul",null,e.map(((e,t)=>d.createElement("li",{key:t},e.label,": ",d.createElement(V,null,e.oldName)," ⇒"," ",d.createElement(V,null,e.newName))))),"Do you want to copy the contents of your previous data file",e.length>1&&"s","?"),d.createElement("div",{className:Y},d.createElement("div",{className:q},d.createElement(x,{icon:"duplicate",text:"Copy contents",onClick:l}),d.createElement(x,{icon:"exchange",text:`Change file name${e.length>1?"s":""} only`,onClick:n}),d.createElement(x,{intent:"danger",text:"Cancel",onClick:a}))))})),Pe=(e,t)=>t.includes(e),ke=()=>{const{data:e,error:t,mutate:a}=L("/config",(async()=>(await se("/config","get",{})).result)),[l,n]=h.exports.useState(null);h.exports.useEffect((()=>{e&&!l&&n(e)}),[e,l]);const[r,s]=h.exports.useState({}),c=h.exports.useCallback((()=>s({})),[]),{loading:m,execute:u,error:g}=K((async(e,t)=>{var l;const n=await((e,t)=>se("/config","post",{config:e,shouldCopyDataFiles:t}))(e,t);if(!(null==(l=null==n?void 0:n.result)?void 0:l.success))throw new Error(`Unexpected response: ${JSON.stringify(n)}`);a(e)})),C=h.exports.useCallback((async t=>{if(!l)throw new Error("Cannot save empty config");if(!e)throw new Error("Cannot overwrite an empty config object");const a=[];l.dataFileName!==e.dataFileName&&a.push({label:"Ruleset file",oldName:"OCDdata_"+e.dataFileName+".txt",newName:"OCDdata_"+l.dataFileName+".txt"}),l.stockFileName!==e.stockFileName&&a.push({label:"Stock file",oldName:"OCDstock_"+e.stockFileName+".txt",newName:"OCDstock_"+l.stockFileName+".txt"}),a.length&&void 0===t?s({isOpen:!0,changedFiles:a}):await u(l,t)}),[e,l,u]),E=!F(l,e),v=h.exports.useCallback((e=>n("function"==typeof e?t=>t&&e(t):e)),[]),f=!e||!l||m;h.exports.useEffect((()=>ce("loadingError",t,"Cannot load config")),[t]),h.exports.useEffect((()=>ce("savingError",g,"Cannot save config")),[g]),h.exports.useEffect((()=>me("isSaving",m,"Saving config...")),[m]);const _=f||!(null==l?void 0:l.canUseMallMulti);return d.createElement(d.Fragment,null,d.createElement(Te,i({onCancel:()=>c(),onSaveWithCopy:()=>{c(),C(!0)},onSaveWithoutCopy:()=>{c(),C(!1)}},r)),d.createElement(G,null,"Configure Philter"),d.createElement("fieldset",{className:"PanelConfig__Section"},d.createElement("legend",{className:"PanelConfig__SectionTitle"},"General settings"),d.createElement(Q,{disabled:f,inline:!0,label:"Empty closet first before cleanup:",onChange:h.exports.useCallback((({currentTarget:{value:e}})=>{const t=Number(e);Pe(t,[0,-1])&&v((e=>o(i({},e),{emptyClosetMode:t})))}),[v]),selectedValue:null==l?void 0:l.emptyClosetMode},d.createElement(X,{className:l?void 0:Z,label:"Never",value:0}),d.createElement(X,{className:l?void 0:Z,label:"Before Emptying Hangk's (recommended)",value:-1})),d.createElement(ee,{className:"PanelConfig__Divider"}),d.createElement(Q,{disabled:f,inline:!0,label:"Mall pricing: ",onChange:h.exports.useCallback((({currentTarget:{value:e}})=>{Pe(e,["auto","max"])&&v((t=>o(i({},t),{mallPricingMode:e})))}),[v]),selectedValue:null==l?void 0:l.mallPricingMode},d.createElement(X,{className:l?void 0:Z,label:"Automatic",value:"auto"}),d.createElement(X,{className:l?void 0:Z,label:`${999999999..toLocaleString()} meat (ignores "min price")`,value:"max"})),d.createElement(ee,{className:"PanelConfig__Divider"}),d.createElement(I,{checked:Boolean(null==l?void 0:l.simulateOnly),className:l?void 0:Z,disabled:f,onChange:({currentTarget:{checked:e}})=>v((t=>o(i({},t),{simulateOnly:e})))},"Simulate only ",d.createElement("small",null,"(no items will be cleaned up)"))),d.createElement("fieldset",{className:"PanelConfig__Section"},d.createElement("legend",{className:"PanelConfig__SectionTitle"},"Mall multi setup"),d.createElement(I,{checked:Boolean(null==l?void 0:l.canUseMallMulti),className:l?void 0:Z,disabled:f,onChange:({currentTarget:{checked:e}})=>v((t=>o(i({},t),{canUseMallMulti:e})))},"Use mall multi"),d.createElement(b,{className:"PanelConfig__FormGroupAligned",disabled:_,inline:!0,intent:_||(null==l?void 0:l.mallMultiName)?void 0:"warning",label:"Mall multi name:",helperText:_||(null==l?void 0:l.mallMultiName)?"​":"No multi account"},d.createElement(M,{className:l?void 0:Z,disabled:_,onChange:({target:{value:e}})=>v((t=>o(i({},t),{mallMultiName:e}))),placeholder:_?"":"Enter player name",value:(null==l?void 0:l.mallMultiName)||""})),d.createElement(b,{className:"PanelConfig__FormGroupAligned",disabled:f||!(null==l?void 0:l.canUseMallMulti),inline:!0,label:"Mall multi Kmail text:"},d.createElement(M,{className:l?void 0:Z,disabled:f||!(null==l?void 0:l.canUseMallMulti),onChange:({target:{value:e}})=>v((t=>o(i({},t),{mallMultiKmailMessage:e}))),placeholder:_?"":"Enter Kmail message",value:(null==l?void 0:l.mallMultiKmailMessage)||""}))),d.createElement("fieldset",{className:"PanelConfig__Section"},d.createElement("legend",{className:"PanelConfig__SectionTitle"},"Data files"),d.createElement(b,{className:"PanelConfig__FormGroupAligned",disabled:f,inline:!0,label:"Ruleset file:"},d.createElement(ye,{className:p("PanelConfig_InputFileName",!l&&Z),disabled:f,fileNamePrefix:"OCDdata_",fileNameSuffix:".txt",onChange:h.exports.useCallback((({target:{value:e}})=>v((t=>o(i({},t),{dataFileName:e})))),[v]),value:(null==l?void 0:l.dataFileName)||""})),d.createElement(b,{className:"PanelConfig__FormGroupAligned",disabled:f,inline:!0,label:"Stock file:"},d.createElement(ye,{className:p("PanelConfig_InputFileName",!l&&Z),disabled:f,fileNamePrefix:"OCDstock_",fileNameSuffix:".txt",onChange:h.exports.useCallback((({target:{value:e}})=>v((t=>o(i({},t),{stockFileName:e})))),[v]),value:(null==l?void 0:l.stockFileName)||""}))),d.createElement(k,null,d.createElement(x,{disabled:f||!E,icon:"floppy-disk",onClick:h.exports.useCallback((()=>C()),[C]),text:"Save"}),d.createElement(x,{disabled:f||!E,icon:"reset",onClick:h.exports.useCallback((()=>e&&n(e)),[e]),text:"Discard changes"})))};const xe=d.createElement("span",{className:"PanelInformation__Bullet"},"⋯"),Se=()=>{const{data:e,isValidating:t,error:a}=L("/statistics",(async()=>(await se("/statistics","get",{})).result)),l=h.exports.useMemo((()=>e?Object.values(e.categorizedItemCounts).reduce(((e,t)=>e+t)):0),[e]);return d.createElement("div",null,d.createElement(G,null,d.createElement("a",{href:"https://github.com/Loathing-Associates-Scripting-Society/Philter",rel:"noopener noreferrer",target:"_blank"},"Philter Manager")),d.createElement("p",null,"Brought to you by"," ",d.createElement("a",{href:"https://github.com/Loathing-Associates-Scripting-Society",rel:"noopener noreferrer",target:"_blank"},"Loathing Associates Scripting Society")),d.createElement(te,{intent:"warning",title:"Manager v2 is in alpha"},"Using this ",d.createElement("i",null,"may")," destroy your Philter configuration. Use at your own risk.",d.createElement("br",null),"The"," ",d.createElement("a",{href:"/relay_Philter_Manager_classic.ash?relay=true"},"classic UI")," ","is still available."),e?l>0?d.createElement(ae,{bordered:!0,className:"PanelInformation__VerticalTable",condensed:!0},d.createElement("tbody",null,d.createElement("tr",null,d.createElement("th",{style:e.uncategorizedItemCount>0?{color:f.ORANGE1}:void 0},"Uncategorized (in inventory)"),d.createElement("td",{style:e.uncategorizedItemCount>0?{color:f.ORANGE1}:void 0},e.uncategorizedItemCount)),d.createElement("tr",null,d.createElement("th",null,"Items in Ruleset"),d.createElement("td",null,l)),d.createElement("tr",null,d.createElement("th",null,xe," Keep All"),d.createElement("td",null,e.categorizedItemCounts.KEEP)),d.createElement("tr",null,d.createElement("th",null,xe," Mallsell"),d.createElement("td",null,e.categorizedItemCounts.MALL)),d.createElement("tr",null,d.createElement("th",null,xe," Autosell/Discard"),d.createElement("td",null,e.categorizedItemCounts.AUTO+e.categorizedItemCounts.DISC)),d.createElement("tr",null,d.createElement("th",null,xe," Pulverize"),d.createElement("td",null,e.categorizedItemCounts.PULV)),d.createElement("tr",null,d.createElement("th",null,xe," Use or break"),d.createElement("td",null,e.categorizedItemCounts.BREAK+e.categorizedItemCounts.USE)),d.createElement("tr",null,d.createElement("th",null,xe," Put in closet"),d.createElement("td",null,e.categorizedItemCounts.CLST)),d.createElement("tr",null,d.createElement("th",null,xe," Put in clan stash"),d.createElement("td",null,e.categorizedItemCounts.CLAN)),d.createElement("tr",null,d.createElement("th",null,xe," Crafting"),d.createElement("td",null,e.categorizedItemCounts.MAKE)),d.createElement("tr",null,d.createElement("th",null,xe," Untinker"),d.createElement("td",null,e.categorizedItemCounts.UNTN)),d.createElement("tr",null,d.createElement("th",null,xe," Send as gift"),d.createElement("td",null,e.categorizedItemCounts.GIFT)),d.createElement("tr",null,d.createElement("th",null,xe," Put in display case"),d.createElement("td",null,e.categorizedItemCounts.DISP)),d.createElement("tr",null,d.createElement("th",null,xe," Remind me later"),d.createElement("td",null,e.categorizedItemCounts.TODO)))):d.createElement(H,{icon:"help",description:'If this is your first time using Philter, you can create cleanup rules for your items in the "Add Items" tab.',title:"Your Philter ruleset is empty or missing."}):t?d.createElement(j,null):d.createElement(H,{icon:a?"error":"info-sign",title:a?"Failed to load data":"Data not loaded yet",description:a instanceof Error?a.message:void 0}))};const Re=({cleanupRules:e,onChange:t})=>{const{data:a,error:l,isValidating:n,mutate:r}=L("/cleanup-tables/uncategorized",(async()=>{const e=await se("/cleanup-tables/uncategorized","get",{});return e.result.items.sort(((e,t)=>e.id-t.id)),e.result}));h.exports.useEffect((()=>{(null==a?void 0:a.cleanupRules)&&t((e=>null!=e?e:a.cleanupRules))}),[null==a?void 0:a.cleanupRules,t]);const s=h.exports.useMemo((()=>Boolean(e)&&!F(e,null==a?void 0:a.cleanupRules)),[e,null==a?void 0:a.cleanupRules]),c=h.exports.useCallback((()=>(null==a?void 0:a.cleanupRules)&&t(a.cleanupRules)),[null==a?void 0:a.cleanupRules,t]),{error:u,execute:p,loading:g}=K((()=>r((async t=>{var a;if(!t)throw new Error("Cannot save ruleset when we don't have any data yet");if(!e)throw new Error("Cannot save active ruleset because it has not been initialized yet");const l=await ie(e);if(!(null==(a=null==l?void 0:l.result)?void 0:a.success))throw new Error(`Unexpected response: ${JSON.stringify(l)}`);return o(i({},t),{items:t.items.filter((t=>!(t.id in e))),cleanupRules:e})}),!1)));h.exports.useEffect((()=>ce("savingError",u,"Cannot save cleanup rule")),[u]),h.exports.useEffect((()=>me("isSaving",g,"Saving cleanup rules...")),[g]);const C=h.exports.useCallback((()=>a&&t((e=>{if(void 0===e)return e;const t=m(e,[]);for(const l of a.items)l.canMall&&(t[l.id]={action:"MALL",minPrice:0});return t}))),[a,t]),E=h.exports.useCallback((()=>a&&t((e=>{if(void 0===e)return e;const t=m(e,[]);for(const l of a.items)l.canCloset&&(t[l.id]={action:"CLST"});return t}))),[a,t]),v=h.exports.useCallback((()=>a&&t((e=>{if(void 0===e)return e;const t=m(e,[]);for(const l of a.items)t[l.id]={action:"KEEP"};return t}))),[a,t]),f=h.exports.useCallback((e=>t((t=>t?"function"==typeof e?e(t):e:t))),[t]);return d.createElement(d.Fragment,null,d.createElement(G,null,"Uncategorized Items in Your Inventory"),e&&a?a.items.length>0?d.createElement(d.Fragment,null,d.createElement(b,{inline:!0,label:"Categorize all items as..."},d.createElement(k,null,d.createElement(x,{disabled:!a.items.some((t=>{var a;return t.canMall&&"MALL"!==(null==(a=e[t.id])?void 0:a.action)})),onClick:C},"Mallsell"),d.createElement(x,{disabled:!a.items.some((t=>{var a;return t.canCloset&&"CLST"!==(null==(a=e[t.id])?void 0:a.action)})),onClick:E},"Closet"),d.createElement(x,{disabled:!a.items.some((t=>{var a;return"KEEP"!==(null==(a=e[t.id])?void 0:a.action)})),onClick:v},"Keep all"))),d.createElement(_e,{className:"PanelUncategorizedItems__Table",disableReset:!s,disableSave:!s,inventory:a.inventory,items:a.items,cleanupRules:e,onChange:f,onReset:c,onSave:p})):d.createElement(H,{icon:d.createElement("img",{alt:"Nothing to do",src:"/images/adventureimages/kg_accountant.gif"}),title:"Your entire inventory has been categorized",description:'"Nothing to see here, please move along."'}):n?d.createElement(j,null):d.createElement(H,{icon:l?"error":"info-sign",title:l?"Failed to load data":"Data not loaded yet",description:l instanceof Error?l.message:void 0}))},we=Object.freeze({categorized:0,config:0,information:0,uncategorized:0}),Ae=e=>Object.prototype.hasOwnProperty.call(we,e)?e:"information",Me=()=>{const[e,t]=h.exports.useState("information"),[a,l]=h.exports.useState();return d.createElement("div",{className:"App"},d.createElement(B,{className:"App__Tabs",id:"mainTabs",onChange:e=>t(Ae(e)),renderActiveTabPanelOnly:!0,selectedTabId:Ae(e)},d.createElement($,{id:"information",panel:d.createElement(Se,null),panelClassName:"App__TabItem",title:"Information"}),d.createElement($,{id:"uncategorized",panel:d.createElement(Re,{cleanupRules:a,onChange:l}),panelClassName:"App__TabItem",title:"Add Items"}),d.createElement($,{id:"categorized",panel:d.createElement(Ie,{cleanupRules:a,onChange:l}),panelClassName:"App__TabItem",title:"Edit Rules"}),d.createElement($,{id:"config",panel:d.createElement(ke,null),panelClassName:"App__TabItem",title:"Configuration"})))};le.render(d.createElement(d.StrictMode,null,d.createElement(Me,null)),document.getElementById("root"));
//# sourceMappingURL=philter-manager.index.js.map
