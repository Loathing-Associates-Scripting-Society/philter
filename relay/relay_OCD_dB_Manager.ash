// Relay OCD Inventory dB Manager by Bale

import "OCD Inventory Control";
string thisver = "1.10"; 				// This is the script's version!
string thread = "http://kolmafia.us/showthread.php?1818-OCD-Inventory-control&p=11138&viewfull=1#post11138";
string scriptname = "Bales's OCD dB Manager";
string title = "<a class='version' href='"+thread+"' target='_blank'>"+scriptname+"</a> v"+thisver+", by <a href='showplayer.php?who=754005'>Bale</a>";

OCDinfo [item] OCD;
OCDinfo [item] OCDefault;
file_to_map("OCDefault.txt", OCDefault);

// kBay info
record {
	string type;
	string price;
} [item] kBayList;
file_to_map("OCDkBay.txt", kBayList);

record {
	string type;
	int q;
	string cat;
} [item] stock;
record stock_item {
	item doodad;
	string type;
	int q;
};
stock_item[int] newstock1;
stock_item[int] newstock2;
boolean [item] delstock;

boolean [item] makes;
boolean [item] untinks;
boolean [item] uses;
boolean [item] pulvs;
boolean [item] malls;
boolean [item] autos;
boolean [item] disps;
boolean [item] clsts;
boolean [item] clans;
boolean [item] gifts;
boolean [item] kbays;
boolean [item] todos;
boolean [item] keeps;

// Some of KoLmafia's data files are helpful...
boolean [item] is_craftable;
boolean [item] is_untinkerable;

void version_update() {
	string current_ver = get_property("_version_BaleOCDrelay");
	// My rendition of zarqon's version checker. If it is unable to load version info, it will try again 20% of the time.
	if(current_ver == "" || (current_ver == "0" && random(5) == 0)) {
		matcher version = create_matcher("<b>relay OCD dB Manager (.+?)</b>", visit_url(thread));
		if(version.find()) {
			current_ver = version.group(1);
		} else current_ver = "0";
		set_property("_version_BaleOCDrelay", current_ver);
	}
	if(current_ver.to_float() > thisver.to_float()) {
		writeln("<p style='margin-bottom:0; font-size:140%; font-weight:bold; font-family:Arial,Helvetica,sans-serif'><a class='red' href='"+thread+"' target='_blank'>New version of "+scriptname+": "+current_ver+"</a></p>");
		title = "Visit <a class='version' href='"+thread+"' target='_blank'>this thread</a> to update "+scriptname+".";
	} else if(current_ver == "0")
		title += " &nbsp; &#x25E6; &nbsp; &#x25E6; &nbsp; &#x25E6; &nbsp; Current version unknown.";
	//else title += " &nbsp; &#x25E6; &nbsp; &#x25E6; &nbsp; &#x25E6; &nbsp; up to date.";
}

////////// Beginning of form functions based strongly on jasonharper's htmlform.ash from http://kolmafia.us/showthread.php?3842
string[string] fields;	// shared result from form_fields()
boolean success;	// form successfully submitted

string write_radio(string ov, string name, string label, string value) {
	if(fields contains name) ov = fields[name];
	if(label != "") write("<label>");
	write("<input type='radio' name='" + name + "' value='" + entity_encode(value) + "'");
	if(value == ov) write(" checked");
	write(">");
	if(label != "" ) write(label+ "</label>");
	return ov;
}

string write_select(string ov, string name, string label) {
	write("<label>" +label);
	if(fields contains name) ov = fields[name];
	write("<select style='width:112;' name='" +name);
	if(label == "") write("' id='" +name);
	write("'>");
	return ov;
}

void finish_select() {
	writeln("</select></label>");
}

void write_option(string ov, string label, string value) {
	write("<option value='" + entity_encode(value)+ "'");
	if(value == ov) write(" selected");
	writeln(">" +label+ "</option>");
}

void write_option(string ov, string label, string value, string style) {
	write("<option style='"+style+"' value='" + entity_encode(value)+ "'");
	if(value == ov) write(" selected");
	writeln(">" +label+ "</option>");
}

string intvalidator(string name) {
	if(!is_integer(fields[name]))
		return "An integer is requred";
	if(to_int(fields[name]) < 0)
		return "Value must be positive";
	return "";
}

string itemvalidator(string name) {
	if(fields[name] == "none")
		return "";
	item it = to_item(fields[name]);
	if(it == $item[none])
		return "A valid item is required.";
	fields[name] = to_string(it);	// normalize
	return "";
}

string write_field(string ov, string name, string label, int size, string validator) {
	if(label != "" )
		write("<label>"+label);
	string err;
	string rv = ov;
	if(fields contains name) {
		if(validator != "")
			err = call string validator(name);
		rv = fields[name];
	}
	write("<input type='text' name=\""+ name);
	if(label == "")
		write("\" id=\""+ name);
	write("\" value=\""+ entity_encode(rv)+ "\"");
	if(size != 0)
		write("size="+size);
	write(">");
	if(err != "") {
		success = false;
		rv = ov;
		write("<br /><font color='red'>"+ err+ "</font>");
	}
	if(label != "" )
		writeln("</label>");
	return rv;
}
int write_field(int ov, string name) {
	return write_field(ov.to_string(), name, "", 2, "intvalidator").to_int();
}
string write_field(string ov, string name, int size) {
	return write_field(ov, name, "", size, "");
}
item write_field(item ov, string name, int size) {
	return write_field(ov.to_string(), name, "", size, "itemvalidator").to_item();
}

boolean write_check(boolean ov, string name, string label) {
	if(label != "" ) write("<label>"+label);
	if(fields contains name && fields[name] != "") ov = true;
	else if(count(fields) > 0) ov = false;
	write("<input type='checkbox' name='" + name + "'");
	if(ov) write(" checked");
	write(">");
	if(label != "" ) write("</label>");
	return ov;
}
string write_check(string ov, string name, string label) {
	return write_check(ov.to_boolean(), name, label).to_string();
}

boolean test_button(string name) {
	if(name == "")	return false;
	return success && fields contains name;
}

boolean write_button(string name, string label) {
	write("<input type='submit' name='");
	write(name+ "' value='");
	write(label+ "'>");
	return test_button(name);
}
////////// End of jasonharper's htmlform.ash

// This forgets all form changes if the user switches tabs without saving.
string write_hidden(string ov, string name) {
	if(ov != "false")
		write("<input type='hidden' name='"+ name+ "' value='"+entity_encode(ov)+ "'>");
	return ov;
}

void styles() {
	writeln("<script language=Javascript>"+
	"function descitem(desc) {"+
	"	newwindow=window.open('/desc_item.php?whichitem='+desc,'name','height=200,width=214');"+
	"		if (window.focus) {newwindow.focus()}"+
	"}"+
	"</script>");
	
	writeln("<script language=Javascript>"+
	"function wikiitem(desc) {"+
	"	newwindow=window.open('http://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=' + desc + '&go=Go');"+
	"		if (window.focus) {newwindow.focus()}"+
	"}"+
	"</script>");

	writeln("<style type='text/css'>"+
	"th {background-color:blue; color:white; font-family:Arial,Helvetica,sans-serif;}"+
	
	"fieldset {background-color:white; margin-top: 3px; padding-top:10px; padding-bottom:15px;}"+
	"legend {font-size:110%; color:black;}"+
	
	"a:link {color:black; text-decoration:none;}"+
	"a:visited {color:black; text-decoration:none;}"+
	"a:hover {color:blue; text-decoration:underline;}"+
	"a.red:link {color:red}"+
	"a.red:visited {color:red}"+
	"a.version:link {color:#0000CD}"+
	"a.version:visited {color:#0000CD}"+
	"a.version:hover {color:red;}"+
	
	"p.zlib {margin:5px 20px; font-size:88%; font-family:Arial,Helvetica,sans-serif;}"+
	"table.zlib {margin:0px 20px; font-size:88%; font-family:Arial,Helvetica,sans-serif;}"+
	"tr.item:hover {background-color:silver;}"+
	
	"ul.stock {list-style-type:none;margin-bottom:20;margin-top:0;padding:0;position: relative;top:5;left:10;width:100%;}"+

	"input {margin-bottom:-2;}"+   # This corrects for buttons adding extra margin onto the bottom of a table. :(
	"input.nav {margin-bottom:-1; padding: 0; font-size:100%;}"+
	
	"ul.tabbernav {margin:0; padding: 3px 1px 0; border-bottom: 1px solid black; font: bold 12px Verdana, sans-serif;}"+
	"ul.tabbernav li {list-style: none; margin: 0; display: inline;}"+
	"ul.tabbernav li input {padding: 3px 0.5em; margin-left: 3px; border: 1px solid black;"+
		" border-bottom: 1px solid black; background: #DDDDEE; text-decoration: none;}"+
	"ul.tabbernav li input:hover {color: #000000; background: #AAAAEE; border-color: black;}"+
	"ul.tabbernav li.tabberactive input {background-color: white; border-bottom: 1px solid white;}"+
	"ul.tabbernav li.tabberactive input:hover {color: #000000; background: white; border-bottom: 1px solid white;}"+
	"</style>");
}
	
void load_OCD() {
	if(count(fields) > 0) return;
	string OCDfile = "OCDdata_"+vars["BaleOCD_DataFile"]+".txt";
	string OCDfileOld = "OCD_"+my_name()+"_Data.txt";
	if((!file_to_map(OCDfile, OCD) || count(OCD) == 0) && (!file_to_map(OCDfileOld, OCD) || count(OCD) == 0))
		print("All item information is corrupted or missing. Either you have not yet saved any item data or you lost it.", "red");
	if((!file_to_map("OCDstock_"+vars["BaleOCD_StockFile"]+".txt", stock) || count(stock) == 0) && vars["BaleOCD_Stock"] == "1")
		print("All item stocking information is corrupted or missing. Either you have not yet saved any item stocking data or you lost it.", "red");
}

boolean is_pulverizable(item it) {
	int [item] pulvy = get_related(it, "pulverize");
	if(pulvy contains $item[useless powder])
		return false;
	if(count(pulvy) > 0)
		return true;
	return is_wadable(it);
}

boolean is_breakable(item it) {
	switch(it) {
	case $item[BRICKO hat]:
	case $item[BRICKO sword]:
	case $item[BRICKO pants]:
		return true;
	}
	return false;
}

boolean discard_bait(item it) {
	return is_discardable(it) && autosell_price(it) < 1;
}

item item_name(string doodad) {
	if(doodad.to_item() != $item[none]) return doodad.to_item();
	matcher find_item = create_matcher("([A-Za-z0-9' ]+)(\\(\\d+\\))?" , doodad);
	if(find_item.find())
		return find_item.group(1).to_item();
	return $item[none];
}

void set_craftable() {
	record concoctions {
		string method;
		string mix1;
		string mix2;
		string mix3;
		string mix4;
	};
	concoctions [string] crafty;
	file_to_map("concoctions.txt", crafty);
	foreach key, value in crafty {
		is_craftable[item_name(value.mix1)] = true;
		is_craftable[item_name(value.mix2)] = true;
		is_craftable[item_name(value.mix3)] = true;
		is_craftable[item_name(value.mix4)] = true;
		if(value.method == "COMBINE" && is_tradeable(to_item(key)))
			is_untinkerable[to_item(key)] = true;
	}
	is_craftable[$item[titanium assault umbrella]] = true;
}

string kPrice(item doodad) {
	if(kBayList contains doodad)
		return kBayList[doodad].price;
	if(historical_price(doodad) > 0)
		return floor(.75* historical_price(doodad));
	return floor(.75* autosell_price(doodad));
}

string action_drop(string act, item doodad) {
	if(is_tradeable(doodad) && test_button("mall"))
		fields["_"+doodad.to_int()] = "MALL";
	else if(test_button("closet") && fields["_"+doodad.to_int()] == "UNKN")
		fields["_"+doodad.to_int()] = "CLST";
	else if(test_button("keep") && fields["_"+doodad.to_int()] == "UNKN")
		fields["_"+doodad.to_int()] = "KEEP";
	act = write_select(act, "_"+doodad.to_int(), "");
	write_option(act, "(uncategorized)", "UNKN");
	write_option(act, "Keep All", "KEEP");
	if(is_tradeable(doodad))
		write_option(act, "Mall sale", "MALL");
	if(is_breakable(doodad))
		write_option(act, "Break Apart", "BREAK");
	if(is_discardable(doodad) && autosell_price(doodad) > 0)
		write_option(act, "Autosell", "AUTO");
	else if(discard_bait(doodad))
		write_option(act, "Discard", "DISC", "color:#FFFFFF;background-color:#FFAF00");
	if(is_giftable(doodad)) {
		write_option(act, "Send as gift to...", "GIFT");
		write_option(act, "Sell on kBay", "KBAY");
		write_option(act, "Clan Stash", "CLAN");
	}
	if(is_pulverizable(doodad)) {
		if(is_tradeable(doodad))
			write_option(act, "Pulverize", "PULV");
		else // Mark untradable pulverizables with a red warning color
			write_option(act, "Pulverize", "PULV", "color:#CCFFFF;background-color:CC0033");
	}
	if(is_craftable[doodad])
		write_option(act, "Craft into a...", "MAKE");
	if(is_untinkerable[doodad])
		write_option(act, "Untinker", "UNTN");
	if(doodad.usable || doodad.multi)  // Can the item be used or multi-used?
		write_option(act, "Use", "USE");
	if(is_displayable(doodad)) {
		write_option(act, "Closet", "CLST");
		write_option(act, "Display", "DISP");
	}
	write_option(act, "Reminder", "TODO");
	finish_select();
	return act;
}

string image(item doodad) {
	return "<a title = \"KoL Pop-Up\" href=\"javascript:descitem('" + doodad.descid
		+ "');\"><img src=\"/images/itemimages/" + doodad.smallimage + "\" height=30 width=30></a>";
}

string desc(item doodad) {
	return  "<a title = \"Open wiki page in a new window\" href=\"javascript:wikiitem('" 
		+ replace_string(to_string(doodad), "'", "\\'")
		+ "');\">" + doodad +"</a>";
}

string imagedesc(item doodad) {
	return image(doodad) + "</td><td>" + desc(doodad);
}

string descPlusQ(item doodad) {
	return imagedesc(doodad)+ (available_amount(doodad) > 0? " <i>("+available_amount(doodad)+")</i>": "");
}

void save_ocd() {
	foreach key in OCD
		switch(OCD[key].action) {
		case "UNKN":
		case "":
			remove OCD[key];
			break;
		case "KEEP":
			OCD[key].q = 0;
			break;
		case "GIFT":
			if(OCD[key].info == "") {
				OCD[key].action = "UNKN";
				remove fields["_"+key.to_int()];
			}
			break;
		case "KBAY":
			if(OCD[key].message == "")
				OCD[key].message = (kBayList contains key)? kBayList[key].type: "Buy my stuff";
			if(OCD[key].info == "")
				OCD[key].info = kPrice(key);
			break;
		}
	if(OCD contains $item[none]) remove OCD[$item[none]];
	map_to_file(OCD, "OCDdata_"+vars["BaleOCD_DataFile"]+".txt");
}

int curr_items() {
	int total;
	foreach key in get_inventory()
		if(!(OCD contains key) && is_OCDable(key))
			total = total + 1;
	return total;
}

void add_items() {
	writeln("<fieldset><legend>Add Actions for these Items</legend>"); // write_box()

	int AddQ;
	foreach key in OCDefault
		if(!(OCD contains key) && item_amount(key) > 0) AddQ += 1; #{AddQ += 1; print(key);}
	int curr_items = curr_items();
	if(curr_items > 0 && AddQ > 0) {
		write("<p>");
		if(write_button("defaultdata", "Add default")) {
			foreach key in OCDefault
				if(!(OCD contains key) && item_amount(key) > 0) OCD[key] = OCDefault[key];
			save_ocd();
			curr_items = curr_items();
		}
		write(" Add default information for "+AddQ+" common item"+(AddQ == 1? " that is": "s that are")+" listed below.</p>");
	}

	boolean table_started = false;
	foreach doodad in get_inventory()
		// Quest items are the only items that cannot be displayed, so check for is_OCDable()
		if(is_OCDable(doodad) && !(OCD contains doodad && OCD[doodad].action != "UNKN")) {
			if(!table_started) {
				writeln("<table border=0 cellpadding=1><tr><td>");
				write_button("mall", "Mall All");
				write("</td><td>Categorize all mallable items to be sold in the mall</td></tr><tr><td>");
				write_button("closet", "Closet All");
				write("</td><td>Categorize all uncategorized items to be stored in your closet</td></tr><tr><td>");
				write_button("keep", "Keep All");
				write("</td><td>Categorize all uncategorized items to be kept</td></tr></table>");
				
				writeln("<table border=0 cellpadding=1>");
				writeln("<tr><th colspan=2>Item</th><th>Have</th>");
				if(count(stock) > 0 && vars["BaleOCD_Stock"].to_int() > 0)
					write("<th>Stock</th>");
				write("<th>Keep</th><th>Action</th><th>... information</th></tr>");
				table_started = true;
			}
			write("<tr valign=center class='item'");
			if(count(stock) > 0 && vars["BaleOCD_Stock"].to_int() > 0 
			  && stock contains doodad && stock[doodad].q >= item_amount(doodad))
				write(" style='background-color:E3E3E3'");
			write("><td>"+imagedesc(doodad)+"</a></td>");
			int q = 0;
			string act = "UNKN";
			string info = "";
			if(OCD contains doodad) {
				q = OCD[doodad].q;
				act = OCD[doodad].action;
				info = OCD[doodad].info;
			}
			write("<td align=center>"+item_amount(doodad)+"</td><td align=center>");
			if(count(stock) > 0 && vars["BaleOCD_Stock"].to_int() > 0) {
				if(stock contains doodad) write(stock[doodad].q);
				else write("0");
				write("</td><td align=center>");
			}
			OCD[doodad].q = write_field(q, "q_"+to_int(doodad));
			write("</td><td>");
			OCD[doodad].action = action_drop(act, doodad);
			write("</td><td>");
			OCD[doodad].info = write_field(info, "i_"+to_int(doodad), 14);
			write("</td></tr>");
		}
	if(table_started)
		writeln("</table>");
	else
		writeln("<p style='text-align:center; font-size:110%; font-weight:bold; color:#0000BB;'>Your entire inventory has already been categorized.<br />Nothing to see here, please move along.</p>");

	writeln("</fieldset>"); 	// finish_box()
}

void edit_items(string act) {
	string fieldset;
	void this_tab(boolean [item] cat) {
		write("<fieldset><legend>Manage "+fieldset+"</legend>");
		if(act == "kBay") {
			writeln("<table border=0 cellpadding=1><tr><td>");
			write_button("kbayReset", "Reset");
			write("</td><td>Reset all auction bidding to default values!</td>");
			if(test_button("kbayReset")) {
				write("<td><span style=\"color:blue\">&nbsp;Reset!</span></td>");
				foreach doodad in cat {
					OCD[doodad].message = (kBayList contains doodad)? kBayList[doodad].type: "Buy my stuff";
					#fields["m_"+doodad.to_int()] = OCD[doodad].message;
					fields["i_"+doodad.to_int()] = kPrice(doodad);
				}
				map_to_file(OCD, "OCDdata_"+vars["BaleOCD_DataFile"]+".txt");
			}
			write("</tr></table>");
			write("<table class='zlib' border=0 cellpadding=1><tr><td align=right>kBay Status: </td><td>");
			if(vars["BaleOCD_kBay"] != "0" && vars["BaleOCD_kBay"] != "1") vars["BaleOCD_kBay"] = 1;
			vars["BaleOCD_kBay"] = write_radio(vars["BaleOCD_kBay"], "EnableKBay", "Send Items to kBay,", 1);
			write_radio(vars["BaleOCD_kBay"], "EnableKBay", "Hold kBay items in inventory", 0);
			write("</td></tr></table>");
		}
		writeln("<table border=0 cellpadding=1>");
		write("<tr><th colspan=2>Item</th>");
		if(act == "Keep")
			write("<th>Have</th>");
		write("<th>Keep</th><th>Action</th>");
		switch(act) {
		case "Mall":
			write("<th>Minimum Sale Price</th>");
			break;
		case "Crafting":
			write("<th>Craft into a</th><th>No purchase</th>");
			break;
		case "Reminders":
			write("<th>To do...</th>");
			break;
		case "Gift List":
			write("<th>Send to</th><th>Message with Gift</th>");
			break;
		case "kBay":
			write("<th>Minimum Bid</th>");
			break;
		}
		writeln("</tr>");
		foreach doodad in cat {
			write("<tr valign=center class='item'><td>"+descPlusQ(doodad) +"</a></td>");
			if(act == "Keep")
				write("<td align=center>"+item_amount(doodad)+"</td>");
			write("<td>");
			OCD[doodad].q = write_field(OCD[doodad].q, "q_"+to_int(doodad));
			write("</td><td>");
			OCD[doodad].action = action_drop(OCD[doodad].action, doodad);
			switch(act) {
			case "Mall":
				write("</td><td>");
				OCD[doodad].info = write_field((is_integer(OCD[doodad].info) && OCD[doodad].info != "0")? OCD[doodad].info: "", "i_"+to_int(doodad), 20);
				break;
			case "Crafting":
			case "Reminders":
				write("</td><td>");
				OCD[doodad].info = write_field(OCD[doodad].info, "i_"+to_int(doodad), 25);
				if(act == "Crafting") {
					write("</td><td align=center>");
					OCD[doodad].message = write_check(OCD[doodad].message, "m_"+doodad.to_int(),"");
				}
				break;
			case "Gift List":
				write("</td><td>");
				OCD[doodad].info = write_field(OCD[doodad].info, "i_"+to_int(doodad), 10);
				write("</td><td>");
				OCD[doodad].message = write_field(OCD[doodad].message, "m_"+to_int(doodad), 25);
				break;
			case "kBay":
				write("</td><td>");
				#OCD[doodad].message = write_hidden(OCD[doodad].message, "m_"+doodad.to_int());
				OCD[doodad].info = write_field(OCD[doodad].info, "i_"+to_int(doodad), "", 12, "intvalidator");
				break;
			}
			writeln("</td></tr>");
		}
		writeln("</table>");
		writeln("</fieldset>"); 	// finish_box()
	}
	
	switch(act) {
	case "Keep":
		fieldset = "Items to Keep";
		this_tab(keeps);
		break;
	case "Mall":
		fieldset = "Mall";
		this_tab(malls);
		break;
	case "Dispose":
		fieldset = "Items to Autosell or Discard";
		this_tab(autos);
		break;
	case "Pulverize":
		fieldset = "Items to Pulverize";
		this_tab(pulvs);
		break;
	case "Use":
		fieldset = "Items to Use (or Break Apart)";
		this_tab(uses);
		break;
	case "Closet":
		fieldset = "Closet Items";
		this_tab(clsts);
		break;
	case "Clan Stash":
		fieldset = "Items for Clan Stash";
		this_tab(clans);
		break;
	case "Crafting":
		fieldset = "Crafting Items";
		this_tab(makes);
		break;
	case "Untinkering":
		fieldset = "Items to Untinker";
		this_tab(untinks);
		break;
	case "Gift List":
		fieldset = "Gift List";
		this_tab(gifts);
		break;
	case "kBay":
		fieldset = "<a class='version' href='http://kbay.turias.net/' target='_blank'>kBay Auctions</a>";
		this_tab(kbays);
		break;
	case "Display":
		fieldset = "Display Items";
		this_tab(disps);
		break;
	case "Reminders":
		fieldset = "Reminders";
		this_tab(todos);
		break;
	}
}

void stock_items() {
	item [int] ostock;
	
	writeln("<fieldset><legend>Items to keep in stock</legend>"); // write_box()
	
	write("What to do with items on this list?<ul class='stock'><li>");
	vars["BaleOCD_Stock"] = write_radio(vars["BaleOCD_Stock"], "stock", " Acquire these items for future use", 1);
	write("</li><li>");
	write_radio(vars["BaleOCD_Stock"], "stock", " Keep them... if they <i>happen</i> to be in inventory", 2);
	write("</li><li>");
	write_radio(vars["BaleOCD_Stock"], "stock", " Ignore this stock list", 0);
	writeln("</li></ul>");
	
	writeln("<table border=0 cellpadding=1><tr><td align=right>");
	if(write_button("stocknew", " New ")) {
		clear(stock);
		if(!file_to_map("OCDstock.txt", stock) || count(stock) == 0)
			print("Error loading default stock data.","red");
	}
	write("</td><td>Create a default stock list for softcore pulls!</td></tr>");
	if(count(stock) > 0) {
		write("<tr><td align=right>");
		if(write_button("stockdel", "Delete")) {
			clear(stock);
			foreach key in fields
				if(key.contains_text("stock_"))
					remove fields[key];
			map_to_file(stock, "OCDstock_"+vars["BaleOCD_StockFile"]+".txt");
		}
		write("</td><td>Delete <i>all</i> entries in the following list!</td></tr>");
	}
	write("</table><br />");
				
	if(count(stock) > 0) {
		writeln("<table border=0 cellpadding=1>");
		writeln("<tr><th>Purpose</th><th colspan=2>Item</th><th>Have</th><th>Stock</th><th>Delete?</th></tr>");
		foreach doodad in stock
			ostock[count(ostock)] = doodad;
		sort ostock by stock[value].type;
		string lasttype = stock[ostock[0]].type;
		foreach i, doodad in ostock {
			if(lasttype != stock[doodad].type) {
				write("<tr><td>&nbsp;</td></tr>");
				lasttype = stock[doodad].type;
			}
			write("<tr valign=center class='item'><td>");
			stock[doodad].type = write_field(stock[doodad].type, "stock_t_"+doodad.to_int(), 15);
			write("</td><td>&nbsp;"+imagedesc(doodad) +"</a></td><td align=center>"+full_amount(doodad)+"</td><td align=center>");
			stock[doodad].q = write_field(stock[doodad].q, "stock_q_"+doodad.to_int());
			write("</td><td align=center>");
			delstock[doodad] = write_check(delstock[doodad], "stock_del_"+doodad.to_int(), "");
			writeln("</td></tr>");
		}
		writeln("</table>");
	} else writeln("<p style='text-align:center; font-size:110%; font-weight:bold; color:#0000BB;'>Your stock list is completely empty!<br />Click the above button to create a list, or you can add items below.<br />When done, click \"Save All\"</p>");
	writeln("<p></p>");
	writeln("<table border=0 cellpadding=1>");
	writeln("<tr><th>Add New Item</th><th>Acquire</th><th>Purpose</th></tr>");
	for i from 1 to 11 {
		write("<tr><td valign=top>");
		newstock1[i].doodad = write_field(newstock1[i].doodad, "newd_"+i, 25);
		write("</td><td align=center valign=top>");
		newstock1[i].q = write_field(newstock1[i].q, "newq_"+i);
		write("</td><td valign=top>");
		newstock1[i].type = write_field(newstock1[i].type, "newt_"+i, 15);
		write("</td></tr>");
	}
	writeln("</table>");

	writeln("</fieldset>"); 	// finish_box()
}

void set_cats() {
	foreach key, value in OCD
		switch(value.action) {
		case "KEEP":
			keeps[key] = true;
			break;
		case "MAKE":
			makes[key] = true;
			break;
		case "UNTN":
			untinks[key] = true;
			break;
		case "USE":
		case "BREAK":
			uses[key] = true;
			break;
		case "PULV":
			pulvs[key] = true;
			break;
		case "MALL":
			malls[key] = true;
			break;
		case "AUTO":
		case "DISC":
			autos[key] = true;
			break;
		case "DISP":
			disps[key] = true;
			break;
		case "CLST":
			clsts[key] = true;
			break;
		case "CLAN":
			clans[key] = true;
			break;
		case "GIFT":
			gifts[key] = true;
			break;
		case "KBAY":
			kbays[key] = true;
			break;
		case "TODO":
			todos[key] = true;
			break;
		}
}

void zlib_vars() {
	writeln("<fieldset><legend>Configure Character Settings</legend>"); // write_box()
	
	write("<table class='zlib' border=0 cellpadding=1>");
	write("<tr><td align=right>Empty Closet First: </td><td>");
	if(vars["BaleOCD_EmptyCloset"] != "-1" && vars["BaleOCD_EmptyCloset"] != "0") vars["BaleOCD_EmptyCloset"] = 0;
	vars["BaleOCD_EmptyCloset"] = write_radio(vars["BaleOCD_EmptyCloset"], "EmptyCloset", "Never,", -1);
	write_radio(vars["BaleOCD_EmptyCloset"], "EmptyCloset", "Before Emptying Hangk's (recommended)", 0);
	write("<tr><td align=right>kBay Status: </td><td>");
	if(vars["BaleOCD_kBay"] != "0" && vars["BaleOCD_kBay"] != "1") vars["BaleOCD_kBay"] = 1;
	vars["BaleOCD_kBay"] = write_radio(vars["BaleOCD_kBay"], "EnableKBay", "Send Items to kBay,", 1);
	write_radio(vars["BaleOCD_kBay"], "EnableKBay", "Hold kBay items in inventory", 0);
	write("</td></tr><tr><td align=right>Mall Pricing: </td><td>");
	vars["BaleOCD_Pricing"] = write_radio(vars["BaleOCD_Pricing"], "Pricing", "Automatic,", "auto");
	write_radio(vars["BaleOCD_Pricing"], "Pricing", "999,999,999 meat.", "max");
	write("</td></tr></table>");
	
	write("<p class='zlib'>");
	vars["BaleOCD_Sim"] = write_check(vars["BaleOCD_Sim"], "Sim", "Simulate Only ");
	writeln(" <font size=1>(no actions will be taken)</font></p>");
	
	write("<table class='zlib' border=0 cellpadding=1><tr><td align=right>My Mall Multi:</td><td>");
	vars["BaleOCD_MallMulti"] = write_field(vars["BaleOCD_MallMulti"], "MallMulti", 14);
	write("</td><td align=right>&nbsp;&nbsp;Mall Multi kMail Text</td><td>");
	vars["BaleOCD_MultiMessage"] = write_field(vars["BaleOCD_MultiMessage"], "MultiMessage", 14);
	write("</td></tr><tr><td colspan=2>");
	vars["BaleOCD_UseMallMulti"] = write_check(vars["BaleOCD_UseMallMulti"], "UseMulti", "Use Mall Multi");
	write("</td></tr></table>");
	
	write("<p class='zlib'>Data file: OCDdata_");
	vars["BaleOCD_DataFile"] = write_field(vars["BaleOCD_DataFile"], "DataFile", 10);
	if(vars["BaleOCD_DataFile"] == "")
		vars["BaleOCD_DataFile"] = my_name();
	write("<br />Stock file: OCDstock_");
	vars["BaleOCD_StockFile"] = write_field(vars["BaleOCD_StockFile"], "StockFile", 10);
	if(vars["BaleOCD_StockFile"] == "")
		vars["BaleOCD_StockFile"] = my_name();
	write("<br />Change file names without writing any data: ");
	if(write_button("change", "Change Filename!")) {
		string DataFile = vars["BaleOCD_DataFile"];
		string StockFile = vars["BaleOCD_StockFile"];
		// Restore zlib values so only file name is changed!
		file_to_map("vars_"+replace_string(my_name()," ","_")+".txt",vars);
		vars["BaleOCD_DataFile"] = DataFile;
		vars["BaleOCD_StockFile"] = StockFile;
		updatevars();
		write("<div style='font-weight:bold; color:blue;'>Filename changed @ ");
		write("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
	}
	writeln("</p>");
	
	writeln("</fieldset>"); 	// finish_box()
}

void information(string ver) {
	writeln("<fieldset><legend>"+title+"</legend>"); // write_box()
	if(ver != "")
		writeln("<fieldset>"+ver+"</fieldset><br />");
	int AddQ;
	foreach key in OCDefault
		if(!(OCD contains key) && item_amount(key) > 0) AddQ += 1; #{AddQ += 1; print(key);}
	if(count(OCD) > 0) {
		int curr_items = curr_items();
		if(curr_items > 0 && AddQ > 0) {
			write("<p>");
			if(write_button("defaultdata", "Add data")) {
				foreach key in OCDefault
					if(!(OCD contains key) && item_amount(key) > 0) OCD[key] = OCDefault[key];
				save_ocd();
				curr_items = curr_items();
			}
			write(" Add default information for "+AddQ+" common item"+(AddQ == 1? " that is": "s that are")+" not already in your data.</p>");
		}
		writeln("<table border=0 cellpadding=1>");
		write("<tr");
		if(curr_items > 0) write(" style='color: #FF0000;'");
		writeln("><td align=right>"+curr_items+"&nbsp;</td><td colspan=3>Items in inventory to add</td></tr>");
		writeln("<tr><td align=right>"+count(OCD)+"&nbsp;</td><td colspan=3>Items in Database</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(keeps) + "&nbsp;</td><td>Items to keep</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(malls) + "&nbsp;</td><td>Items to mall</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(autos) + "&nbsp;</td><td>Items to dispose (autosell or discard)</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(pulvs) + "&nbsp;</td><td>Items to pulverize</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(uses)  + "&nbsp;</td><td>Items to use (or break)</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(clsts) + "&nbsp;</td><td>Items to closet</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(clans) + "&nbsp;</td><td>Items to stash</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(makes) + "&nbsp;</td><td>Items to craft</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(untinks)+"&nbsp;</td><td>Items to untinker</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(gifts) + "&nbsp;</td><td>Items to send as gifts</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(kbays) + "&nbsp;</td><td>Items to trade on kBay</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(disps) + "&nbsp;</td><td>Items to display</td></tr>");
		writeln("<tr><td>&nbsp;</td><td align=right>"+count(todos) + "&nbsp;</td><td>Items to remind me about</td></tr>");
		writeln("</table>");
	} else {
		writeln("</table>");
		writeln("<p style='text-align:center; font-size:140%; font-weight:bold; color:red;'>All item information is corrupted or missing.</p>");
		writeln("<p style='color:navy;'>Hopefully this is the first time you've run OCD Inventory. If so, you'll need to add handling instructions for every item in your inventory.</p>");
		writeln("<p>Simply click on the \"Add Items\" tab above. If this is your first run it may take a minute to load. Don't panic! This wait is normal when you have many uncategorized items.</p>");
		writeln("<p>From the \"Add Items\" tab you will select an action from the drop down next to each item. If you want to keep all of an item, then choose the \"Keep\" action. If you want to keep only a limited quantity of an item, then enter the number to keep into the text box.</p>");
		writeln("<p>If you want to craft an item into another item, list the product into the information field. When giving gifts, you should enter the name of the recipient into the information field. Later on, you may list the note to go with a gift if you edit the \"Gift List\" tab when editing the database.</p>");
	}
	writeln("</fieldset>"); 	// finish_box()
}

void write_tab(string tabname, string value) {
	write("<li");
	if(fields[tabname] == value) write(" class='tabberactive'");
	write("><input type='submit' class='nav' name='"+ tabname+ "' value='"+value+"'>");
	writeln("</li>");
}

void subcat_tabs() {
	write("<ul class='tabbernav'>");
	if(count(keeps) > 0) write_tab("editTab", "Keep");
	if(count(malls) > 0) write_tab("editTab", "Mall");
	if(count(pulvs) > 0) write_tab("editTab", "Pulverize");
	if(count(uses)  > 0) write_tab("editTab", "Use");
	if(count(clsts) > 0) write_tab("editTab", "Closet");
	if(count(clans) > 0) write_tab("editTab", "Clan Stash");
	if(count(makes) > 0) write_tab("editTab", "Crafting");
	if(count(untinks) > 0) write_tab("editTab", "Untinkering");
	if(count(gifts) > 0) write_tab("editTab", "Gift List");
	if(count(kbays) > 0) write_tab("editTab", "kBay");
	if(count(disps) > 0) write_tab("editTab", "Display");
	if(count(autos) > 0) write_tab("editTab", "Dispose");
	if(count(todos) > 0) write_tab("editTab", "Reminders");
	writeln("<li></ul>");
	
	if(fields["editTab"] == "")
		information("");
	else edit_items(fields["editTab"]);
}

void main() {
	load_OCD();
	set_craftable();
	set_cats();
	
	// write_page()
	fields = form_fields();
	success = count(fields) > 0;
	writeln("<html><head>");
	styles();
	writeln("</head><body><form name='relayform' method='POST' action=''>");
	
	if(!(fields contains "tab")) {
		if(fields contains "last_tab")
			fields["tab"] = fields["last_tab"];
		else {
			if(curr_items() > 99 || curr_items() < 1)
				fields["tab"] = "Information";
			else fields["tab"] = "Add Items";
		}
	}
	if(!(fields contains "editTab")) {
		if(fields contains "last_editTab")
			fields["editTab"] = fields["last_editTab"];
		else fields["editTab"] = "";
	}
	string ver = check_version("relay OCD dB Manager", "BaleOCDrelay", thisver, 1818);
	
	writeln("<table border=0 cellpadding=1><tr><td>");
	if(fields["tab"] == "information" || (fields["tab"] == "Edit Database" && fields["editTab"] == ""))
		write("&nbsp;");
	else {
		write_button("save", "Save All");
		writeln("</td><td>");
		if(test_button("save") && success) {
			write("<div style='font-weight:bold; color:blue;'>Last save @ ");
			write("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
		} else write("Save all changes below");
	}
	writeln("</td></tr></table>");

	write("<ul class='tabbernav'>");
	write_tab("tab", "Information");
	write_tab("tab", "Add Items");
	write_tab("tab", "Edit Database");
	write_tab("tab", "Items to Stock");
	write_tab("tab", "Configure Script");
	writeln("</ul>");

	// Save TRUE checkboxes
	foreach doodad in makes
		if(OCD[doodad].message == "true" && (fields["tab"] != "Edit Database" || fields["editTab"] != "Crafting"))
			write_hidden(count(fields) > 2? fields["m_"+doodad.to_int()]: OCD[doodad].message,"m_"+doodad.to_int());
	if(count(fields) > 2) {
		write_hidden(fields["tab"], "last_tab");
		write_hidden(fields["editTab"], "last_editTab");
	}
	if(fields["tab"] == "Configure Script") {
		zlib_vars();
	} else {
		write_hidden(vars["BaleOCD_Sim"], "Sim");
		write_hidden(vars["BaleOCD_UseMallMulti"], "UseMulti");
		switch(fields["tab"]) {
		case "Information":
			information(ver);
			break;
		case "Add Items":
			add_items();
			break;
		case "Edit Database":
			subcat_tabs();
			break;
		case "Items to Stock":
			stock_items();
			break;
		}
	}
	
	if(fields["tab"] == "information" || (fields["tab"] == "Edit Database" && fields["editTab"] == ""))
		write("&nbsp;");
	else {
		writeln("<table border=0 cellpadding=1><tr><td>");
		write_button("save", "Save All");
		writeln("</td><td>");
		if(test_button("save") && success) {
			save_ocd();
			foreach doodad in delstock
				if(delstock[doodad] && stock contains doodad) {
					remove stock[doodad];
					remove fields["stock_q_"+doodad.to_int()];
					remove fields["stock_t_"+doodad.to_int()];
					remove fields["stock_del_"+doodad.to_int()];
				}
			foreach i,val in newstock1
				if(val.doodad != $item[none]) {
					stock[val.doodad].q = val.q;
					stock[val.doodad].type = val.type;
					remove fields["newd_"+i];
					remove fields["newq_"+i];
					remove fields["newt_"+i];
				}
			clear(newstock1);
			map_to_file(stock, "OCDstock_"+vars["BaleOCD_StockFile"]+".txt");
			updatevars();
			vprint("Item(s) have been categorized.", "green", 3);
			write("<div style='font-weight:bold; color:blue;'>Last save @ ");
			write("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
		} else write("Save all changes above");
		writeln("</td></tr></table>");
	}
	
	writeln("</form></body></html>"); 	// finish_page()
}
