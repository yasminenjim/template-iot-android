var fvar = (function() {
    var onjson_; // function to call if json comes in
    var functions = {};
    var vars2 = {};
    var fv={}; // fvars as parsed
    function log(txt) {
        if (functions.log) functions.log(txt);
    }
    //-----------------------------------------------------------------------------
    function buttonfunc(e) {
        var btn = e.target;
	    if (btn.type!="BUTTON") btn=e.currentTarget;
	    //console.log("type "+btn.tagName); 

        var fnc;
        if (typeof btn.act.fnc === "function") {
            fnc = btn.act.fnc;
        } else {
            fnc = functions[btn.act.fnc];
        }
        if (fnc) {
            //fnc.bind(btn);
            console.log("buttonfunc exe " + btn.act.fnc + "(" + JSON.stringify(btn.act.arg) + ")");
            fnc.bind(this)(btn.act.arg);
        } else console.log(btn.act.fnc + " not found ");
    }
    //-----------------------------------------------------------------------------
    function inpfunc(e) {
        if (e.keyCode == 13) {
            var inp = e.target;
            var fnc;
            console.log("inpfunc");
            if (inp.act.fnc === "function") { // maybe funcion not yet defined
                fnc = inp.act.fnc;
            } else fnc = functions[inp.act.fnc];
            var arg = inp.act.arg;
            var value;
            if (Number.isFinite(inp.value)) value = Number(inp.value);
            else value = inp.value;

            console.log("input value= " + value);
            // look for $value	
            var setarray = [];
            if (arg.set || arg.prefs) {
                var a;
                if (arg.set) a = arg.set;
                if (arg.prefs) a = arg.prefs;
                Object.keys(a).forEach(function(key) {
                    console.log(" key " + key + " = " + a[key]);
                    if (a[key] == "$value") {
                        setarray.push(key);
                        a[key] = value;
                    }
                });

                console.log("arg now " + JSON.stringify(arg));

                if (fnc) fnc(arg);
                //back to $value
                setarray.forEach(function(key) {
                    a[key] = "$value";
                });

            } else {
                var so = arg;
                arg["value"] = value;
                console.log("fnc " + JSON.stringify(arg));
                if (fnc) fnc(arg);
            }

        }
    }
    //-----------------------------------------------------------------------------
    function scanforfvars(o) {
	    var scanobj=document;
	    if (o) scanobj=o;
	    var fvars = scanobj.querySelectorAll("[fvar]");
           console.log("scanforvars "+fvars.length+"  ");//+JSON.stringify(vars2));
        for (var i = 0; i < fvars.length; i++) {
            var tagName = fvars[i].tagName;
            var fid = fvars[i].id;
            var jtxt = fvars[i].getAttribute("fvar");
            var jo = {};
            if (jtxt.indexOf("{") == 0) { // first '{'
                try {
                    jo = eval("(" + jtxt + ")");
                } catch (exc) {
                    console.log("error from " + jtxt);
                }
            }
            //console.log(fid + " TAG " + tagName + " jtxt " + jtxt + " json " + JSON.stringify(jo));  
	    //mylog(tagName+" "+ JSON.stringify(jo));	
            if (!["DIV", "SPAN", "BUTTON", "INPUT"].includes(tagName)) continue;

            if (jo.name) {
                jo["el"] = fvars[i]; // add docElement
                addobj(jo, vars2);
                //console.log("vars2 "+JSON.stringify(vars2)); 
            }


            if (tagName == "INPUT") {
                fvars[i]["act"] = jo.act;
                fvars[i].addEventListener("keydown", inpfunc, false);

            }

            if (tagName == "BUTTON") {
                fvars[i]["act"] = jo.act;
                fvars[i].addEventListener("click", buttonfunc, false);
            }

        }

        //console.log("vars2 " + JSON.stringify(vars2));
     return this;
    }
    //-----------------------------------------------------------------------------
    //add object from fvar="{object}"  
    function addobj(jo, jo2) {
        var name = jo.name;
        var namearray = name.split(".");
        var vtmp = jo2;
        for (var i = 0; i < namearray.length; i++) {
            var key = namearray[i];
            //console.log("key "+key+" "+JSON.stringify(vtmp));
            if (vtmp.hasOwnProperty(key) == false) vtmp[key] = {};
            vtmp = vtmp[key];
        }
        vtmp["value"] = 0;
        // el mandatory	
        if (!jo.hasOwnProperty("el")) {
            console.log("no element for " + name);
            // func wo docelement
            if (jo.hasOwnProperty("fnc")) {
                vtmp["fnc"]=jo.fnc;
	        console.log("fnc for "+name+" "+typeof(vtmp.fnc));	    
            }
            return;
        }
        var docel = {
            el: jo.el
        }

        if (jo.hasOwnProperty("idx") && jo.idx >= 0) {
            //console.log("add array "); 
            vtmp["value"] = [];
            docel["idx"] = jo.idx;
        }
        if (jo.hasOwnProperty("digits")) {
            docel["digits"] = jo.digits;
        }

        if (jo.hasOwnProperty("fnc")) {
            docel["fnc"] = jo.fnc;
        }

        if (!vtmp.hasOwnProperty("docel")) vtmp["docel"] = [];

        vtmp.docel.push(docel);
        //console.log("jo2 "+JSON.stringify(jo2)); 
    }
    //----------------------------------------------------------
    // set from incoming json objects
    function setfvar(fvar, jin) { // recursion
        for (var key in jin) {
            //console.log("setfvar key: "+key+" "+fvar.hasOwnProperty(key)); 
            if (fvar.hasOwnProperty(key)) {
                // is jin[key] still an objekt and not an array?
                if (typeof jin[key] == "object" && Array.isArray(jin[key]) == false) {
                    //console.log("recursion for "+key); 
                    setfvar(fvar[key], jin[key]);
                } else {
                    var fvo = fvar[key];
			//console.log(key+"  "+JSON.stringify(fvo)); 
                    if (fvo.hasOwnProperty("value")) {
                        //console.log(key+" "+typeof fvar[key].value+" "+fvar[key].value);
                        fvo.value = jin[key];
                        if (fvo.hasOwnProperty("fnc")) { // func without docelement?
				fvo.fnc(key, fvo.value);
                        }
                        // update doc here here?
                        if (fvo.hasOwnProperty("docel")) {
                            for (var i = 0; i < fvo.docel.length; i++) {
                                var docel = fvo.docel[i];
                                var value;
                                if (Array.isArray(fvo.value) == false) value = fvo.value;
                                else value = fvo.value[docel.idx];
                               // console.log("set and updating "+key+" "+value+" "+docel.el.tagName);
                                if (docel.el.tagName == "INPUT") {
                                    docel.el.value = value;
                                }
                                //if array send whole array
                                if (docel.fnc) {
					//console.log("fnc for "+key+"  "+fvo.value);
                                    var ret = docel.fnc(docel.el, fvo.value);
                                    if (ret) docel.el.innerHTML = ret;
                                    else docel.el.innerHTML = fvo.value;
                                } else {
                                    if (docel.hasOwnProperty("digits")) value = value.toFixed(docel.digits);
                                    docel.el.innerHTML = value;

                                }
                            }
                        }

                    }
                }
            }
        }

    }

    //-----------------------------------------------------------------------------
    function parsejson(jo) {
        //mylog("parsejson "+JSON.stringify(jo));
        if (onjson_) onjson_(jo);
        setfvar(vars2, jo);
        Object.assign(fv,jo); 
	 //mylog("*");
        return;
    }
    //-----------------------------------------------------------------------------
    function update(){
     if (onjson_) onjson_(vars2);
     setfvar(vars2,fv);	  
     return;	    
    }
    //-----------------------------------------------------------------------------
    function addfnc2var(jo) {
        addobj(jo, vars2);
    }
    //-----------------------------------------------------------------------------
    //
    function addfunc(name, f) {
        functions[name] = f;
    }
    //-----------------------------------------------------------------------------
    function addonjson(f) {
        onjson_ = f;
    }
    //-----------------------------------------------------------------------------
    function getfvars() {
        return fv;
    }
    //-----------------------------------------------------------------------------
    function getfvar(name){
    var na=name.split("."); 
    var tmpvars=vars2;	    
	   for (var i=0;i<na.length;i++) { 
		   var key=na[i];
		   //mylog(i+" "+key);
	     if (tmpvars.hasOwnProperty(key)==true) {
		     tmpvars=tmpvars[key];
		                                  }
		   else return;
	     }
     return(tmpvars);		   
    }
    //-----------------------------------------------------------------------------
    return {
        scan: scanforfvars,
        addfnc2var: addfnc2var,
        addfunc: addfunc,
        update: update,
	parse: parsejson,
        onjson: addonjson,
        getvars: getfvars,
        getvar: getfvar
    }
})();
