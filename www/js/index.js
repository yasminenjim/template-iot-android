//const { color } = require("d3");

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {


    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
     ons.ready(function() {
            console.log("ons.ready");
        });

    document.addEventListener('init', function(event) {
     let page = event.target;
    //if (page.page) console.log("init page "+page.page);
    //else console.log("init a page ");
     console.log("init a page "); //+JSON.stringify(page));
     //let page_=page.pushedOptions.page;
     //console.log("init "+page_);	    
    });

    document.addEventListener('show', function(event) { 
    let page = event.target;   
    //let page_=page.pushedOptions.page;
    console.log("show a page "); //+JSON.stringify(page));     

    });

    /** 
 // for tabs ?
    document.addEventListener('prechange', function(event) { 
     console.log("prechange "+event.tabItem.getAttribute('label'));
	    
    });

    document.addEventListener('postchange', function(event) { 
     console.log("postchange "+event.tabItem.getAttribute('label'));
     // just scan the new item
     fvar.scan(event.tabItem).update(); 	    
	    
    }); **/

//css_getclass('.page__background').style.background="white";

onappstart(); // defined in app.js  	
}
//-----------------------------------------------------------------------------
const navigatetopage=(p)=>{
  let nv=document.querySelector('ons-navigator'); 
      
      nv.bringPageTop(p).then((page)=>{
	                          console.log("navigated to "+p);
                                  // just scan page
	                          fvar.scan(page).update();
                                  },()=>{console.log("failed to navigate to "+p)}); 	    
}
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
const gohome=()=>{  // splitter is home
document.getElementById('appSplitter').left.close(); //
navigatetopage("splitter.html");	
}
//-----------------------------------------------------------------------------
//This for a simple check for the credentials and navigation to home page (charging it in the pages slack)
const login = () => {
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  console.log("login "+username+" "+password);	
var gotopage='./home.html';
gotopage="splitter.html"	
  if (username === '' && password === '') {
    const navigator = document.querySelector('#navigator');
    navigator.resetToPage(gotopage);
  } else {
    document.getElementById('navigator').resetToPage(gotopage); 
    //ons.notification.alert('Wrong username/password combination');
  }
}
//-----------------------------------------------------------------------------
const toast=(t)=>{ ons.notification.toast(t,{timeout:2000}); };

//**************************************************************** */

/*************
The cssrules() function retrieves all the CSS rules from all the style sheets 
in the current HTML document and stores them in a JavaScript object called rules
where the keys are the CSS selectors and the values are the corresponding CSS rules
**/


function cssrules() {                                                                                                                                                                         
  var rules = {};                                                                                                     
  for (var i=0; i<document.styleSheets.length; ++i) {                                                                 
      var cssRules = document.styleSheets[i].cssRules;                                                                
      for (var j=0; j<cssRules.length; ++j)                                                                           
          rules[cssRules[j].selectorText] = cssRules[j];                                                              
  }                                                                                                                   
  return rules;                                                                                                       
}      

/*
The css_getclass(name) function takes a CSS selector as an argument
retrieves the corresponding CSS rule from the rules object created by the cssrules() function
and returns it. If the given CSS selector is not found in the rules object, an error is thrown.

*/
                                                                                                                      
function css_getclass(name) {                                                                                           
  var rules = cssrules();                                                                                             
  if (!rules.hasOwnProperty(name))                                                                                    
      throw 'TODO: deal_with_notfound_case';    
      console.log("changing the colors of the element " + name+ " from javascript");                                                                        
  return rules[name];        
                                                                                  
}                                                                                                                       
       
/*
//css_getclass('.page__background').style.background="blue";
var cssRule = css_getclass('.home');
console.log("this is cssRule" +cssRule);
// Access the CSS style properties from the returned cssRule object
var backgroundColor = cssRule.style.backgroundColor;

//************************************************************************************************* */
