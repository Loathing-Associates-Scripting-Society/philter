// Relay OCD Inventory dB Manager by Bale

since r18040; // When you define a map with value as a zero-length array, file_to_map can now populate it
import "ocd-cleanup.ash";

OCDinfo [item] OCD;
OCDinfo [item] OCDefault;
file_to_map("ocd-cleanup-default.txt", OCDefault);

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
boolean [item] delstock;

item [int] makes;
item [int] untinks;
item [int] uses;
item [int] pulvs;
item [int] malls;
item [int] autos;
item [int] disps;
item [int] clsts;
item [int] clans;
item [int] gifts;
item [int] todos;
item [int] keeps;
item [int] search;

// One of KoLmafia's data files is helpful...
static boolean [item] is_craftable;

buffer page;

////////// Beginning of form functions based strongly on jasonharper's htmlform.ash from http://kolmafia.us/showthread.php?3842
string[string] fields;	// shared result from form_fields()
boolean success;	// form successfully submitted

string write_radio(string ov, string name, string label, string value) {
	if(fields contains name) ov = fields[name];
	if(label != "") page.append("<label>");
	page.append("<input type='radio' name='" + name + "' value='" + entity_encode(value) + "'");
	if(value == ov) page.append(" checked");
	page.append(">");
	if(label != "" ) page.append(label+ "</label>");
	return ov;
}

string write_select(string ov, string name, string label) {
	page.append("<label>" +label);
	if(fields contains name) ov = fields[name];
	page.append("<select style='width:112;' name='" +name);
	if(label == "") page.append("' id='" +name);
	page.append("'>");
	return ov;
}

void finish_select() {
	page.append("</select></label>");
}

void write_option(string ov, string label, string value) {
	page.append("<option value='" + entity_encode(value)+ "'");
	if(value == ov) page.append(" selected");
	page.append(">" +label+ "</option>");
}

void write_option(string ov, string label, string value, string style) {
	page.append("<option style='"+style+"' value='" + entity_encode(value)+ "'");
	if(value == ov) page.append(" selected");
	page.append(">" +label+ "</option>");
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

string write_field(string ov, string name, string label, int size, string validator, string extra) {
	if(label != "" )
		page.append("<label>"+label);
	string err;
	string rv = ov;
	if(fields contains name) {
		if(validator != "")
			err = call string validator(name);
		rv = fields[name];
	}
	page.append("<input type='text' name=\""+ name);
	if(label == "")
		page.append("\" id=\""+ name);
	page.append("\" value=\""+ entity_encode(rv)+ "\"");
	if(size != 0)
		page.append(" size="+size);
	if(extra != "")
		page.append(" "+extra);
	page.append(">");
	if(err != "") {
		success = false;
		rv = ov;
		page.append("<br /><font color='red'>"+ err+ "</font>");
	}
	if(label != "" )
		page.append("</label>");
	return rv;
}
string write_field(string ov, string name, string label, int size, string validator) {
	return write_field(ov, name, label, size, validator, "");
}
int write_field(int ov, string name) {
	return write_field(ov.to_string(), name, "", 2, "intvalidator", "").to_int();
}
string write_field(string ov, string name, int size) {
	return write_field(ov, name, "", size, "", "");
}
item write_field(item ov, string name, int size) {
	return write_field(ov.to_string(), name, "", size, "itemvalidator", "").to_item();
}

boolean write_check(boolean ov, string name, string label) {
	if(label != "" ) page.append("<label>"+label);
	if(fields contains name && fields[name] != "") ov = true;
	else if(count(fields) > 0) ov = false;
	page.append("<input type='checkbox' name='" + name + "'");
	if(ov) page.append(" checked");
	page.append(">");
	if(label != "" ) page.append("</label>");
	return ov;
}
string write_check(string ov, string name, string label) {
	return write_check(ov.to_boolean(), name, label).to_string();
}

/**
 * Checks if a submit button named `name` was clicked.
 */
boolean test_button(string name) {
	if(name == "")	return false;
	return success && fields contains name;
}

boolean write_button(string name, string label) {
	page.append("<input type='submit' name='");
	page.append(name+ "' value='");
	page.append(label+ "'>");
	return test_button(name);
}
////////// End of jasonharper's htmlform.ash

// This forgets all form changes if the user switches tabs without saving.
string write_hidden(string ov, string name) {
	if(ov != "false")
		page.append("<input type='hidden' name='"+ name+ "' value='"+entity_encode(ov)+ "'>");
	return ov;
}

void styles() {
	page.append('<script src="/philter-manager-classic/philter-manager-classic.web.js"></script>\n');
	page.append('<link rel="stylesheet" href="/philter-manager-classic/philter-manager-classic.css">\n');
}

void load_OCD() {
	if(count(fields) > 0) return;
	string OCDfile = "OCDdata_"+getvar("BaleOCD_DataFile")+".txt";
	string OCDfileOld = "OCD_"+my_name()+"_Data.txt";
	if((!file_to_map(OCDfile, OCD) || count(OCD) == 0) && (!file_to_map(OCDfileOld, OCD) || count(OCD) == 0))
		print(
			"All item information is corrupted or missing. Either you have not yet saved any item data or you lost it.",
			_ocd_color_error()
		);
	if((!file_to_map("OCDstock_"+getvar("BaleOCD_StockFile")+".txt", stock) || count(stock) == 0) && getvar("BaleOCD_Stock") == "1") {
		print(
			"All item stocking information is corrupted or missing. Either you have not yet saved any item stocking data or you lost it.",
			_ocd_color_error()
		);
	}
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
	if(doodad.is_integer()) // Integers are not items
		return $item[none];
	if(doodad.to_item() != $item[none]) return doodad.to_item();
	matcher find_item = create_matcher("([A-Za-z0-9' ]+)(\\(\\d+\\))?" , doodad);
	if(find_item.find())
		return find_item.group(1).to_item();
	return $item[none];
}

void set_craftable() {
	typedef string[] type_c;
	type_c [string] crafty;
	// Don't bother checking the return value of file_to_map().
	// It returns `true` even if the file path is incorrect.
	file_to_map("data/concoctions.txt", crafty);
	foreach product, mix in crafty {
		boolean method = true; // First item in a concoction is the method of crafting.
		foreach x,it in mix {
			if(method)
				method = false;
			else
				is_craftable[ item_name(it) ] = true;
		}
	}
	foreach it in $items[hot nuggets, cold nuggets, spooky nuggets, stench nuggets, sleaze nuggets, titanium assault umbrella]
		is_craftable[it] = true;
}

/**
 * @return Whether the item has a categorized OCD action
 */
boolean has_ocd_action(item doodad) {
	// Silently treat KBAY items as uncategorized items
	return OCD contains doodad && OCD[doodad].action != "KBAY";
}

/**
 * Renders a drop-down menu of available actions for the given item.
 * Returns `act` for further processing.
 * @param act Initially selected action ID
 * @param doodat
 * @return Unchanged value of `act`
 */
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
	if(craft_type(doodad) == "Meatpasting")
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
		}
	if(OCD contains $item[none]) remove OCD[$item[none]];
	map_to_file(OCD, "OCDdata_"+getvar("BaleOCD_DataFile")+".txt");
}

/**
 * Returns the number (not amount) of uncategorized items in inventory.
 */
int curr_items() {
	int total;
	foreach key in get_inventory()
		if(!has_ocd_action(key) && is_OCDable(key))
			total = total + 1;
	return total;
}

void add_catbuttons(buffer page) {
	page.append("<table border=0 cellpadding=1><tr><td>");
	write_button("mall", "Mall All");
	page.append("</td><td>Categorize all mallable items to be sold in the mall</td></tr><tr><td>");
	write_button("closet", "Closet All");
	page.append("</td><td>Categorize all uncategorized items to be stored in your closet</td></tr><tr><td>");
	write_button("keep", "Keep All");
	page.append("</td><td>Categorize all uncategorized items to be kept</td></tr></table>");
}

void append_price(buffer page, item doodad) {
	if(historical_price(doodad) > 0) {
		page.append(to_string(historical_price(doodad), ,"%,d"));
		if(historical_price(doodad) <= max(autosell_price(doodad) * 2, 100)) // Price can be less if they are purchasable from an NPC.
			page.append('<span style="float:right; transform:rotate(90deg); margin:3px -4px 0 -4px; font-size:11px; color:blue;">min</span>');
			# page.append('<span style="float:right; font-size:10px;">m<br>i<br>n</span>');
	}
}

// Temporary thing, should be removed after May 7th
void append_infobox() {
	page.append(`<div class="infobox">`);
	page.append(`OCD-Cleanup will be <a href="https://kolmafia.us/threads/thoughts-on-renaming-ocd-cleanup.26002/" target="_blank" rel="noreferrer noopener">renamed soon.</a>`);
	page.append(` Care to join in our <a href="https://forms.gle/tV3eK51hfk9ehEkL8" target="_blank" rel="noreferrer noopener">poll? (Google Forms, requires login)</a>`);
	page.append(`</div>`);
}

void add_items() {
	page.append("<fieldset><legend>Add Actions for these Items</legend>"); // write_box()
	append_infobox();

	int AddQ;
	foreach key in OCDefault
		if(!has_ocd_action(key) && (item_amount(key) > 0 || equipped_amount(key) > 0 || closet_amount(key) > 0 || storage_amount(key) > 0 || display_amount(key) > 0)) AddQ += 1; #{AddQ += 1; print(key);}
	int curr_items = curr_items();
	if(curr_items > 0 && AddQ > 0) {
		page.append("<p>");
		if(write_button("defaultdata", "Add default")) {
			foreach key in OCDefault
				if(!has_ocd_action(key) && (item_amount(key) > 0 || equipped_amount(key) > 0 || closet_amount(key) > 0 || storage_amount(key) > 0 || display_amount(key) > 0)) OCD[key] = OCDefault[key];
			save_ocd();
			curr_items = curr_items();
		}
		page.append(" Add default information for "+AddQ+" common item"+(AddQ == 1? " that is": "s that are")+" listed below.</p>");
	}

	boolean table_started = false;
	int[item] doodads;
	foreach doodad in $items[]
	{
		if (item_amount(doodad) > 0)
			doodads[doodad] += item_amount(doodad);
		if (equipped_amount(doodad) > 0)
			doodads[doodad] += equipped_amount(doodad);
		if (closet_amount(doodad) > 0)
			doodads[doodad] += closet_amount(doodad);
		if (storage_amount(doodad) > 0)
			doodads[doodad] += storage_amount(doodad);
		if (display_amount(doodad) > 0)
			doodads[doodad] += display_amount(doodad);
	}

	foreach doodad in doodads
		// Quest items are the only items that cannot be displayed, so check for is_OCDable()
		if(is_OCDable(doodad) && !(has_ocd_action(doodad) && OCD[doodad].action != "UNKN")) {
			if(!table_started) {
				page.add_catbuttons();

				page.append("<table class=\"ocd-item-table\" border=0 cellpadding=1>");
				page.append("<tr>");
				page.append("<th colspan=2>Item</th>");
				page.append("<th>Have</th>");
				page.append('<th><abbr title="Closet">C</abbr></th>');
				page.append('<th><abbr title="Storage">S</abbr></th>');
				page.append('<th><abbr title="Display Case">DC</abbr></th>');
				if(count(stock) > 0 && getvar("BaleOCD_Stock").to_int() > 0)
					page.append("<th>Stock</th>");
				page.append("<th>Price</th><th>Keep</th><th>Action</th><th>... information</th></tr>");
				table_started = true;
			}
			page.append("<tr valign=center class='item'");
			if(count(stock) > 0 && getvar("BaleOCD_Stock").to_int() > 0
			  && stock contains doodad && stock[doodad].q >= item_amount(doodad))
				page.append(" style='background-color:E3E3E3'");
			page.append("><td>"+imagedesc(doodad)+"</a></td>");
			int q = 0;
			string act = "UNKN";
			string info = "";
			if(OCD contains doodad) {
				q = OCD[doodad].q;
				act = OCD[doodad].action;
				info = OCD[doodad].info;
			}
			page.append("<td align=center>"+(item_amount(doodad)+equipped_amount(doodad))+"</td>");
			page.append("<td align=center>"+closet_amount(doodad)+"</td>");
			page.append("<td align=center>"+storage_amount(doodad)+"</td>");
			page.append("<td align=center>"+display_amount(doodad)+"</td>");
			if(count(stock) > 0 && getvar("BaleOCD_Stock").to_int() > 0) {
				page.append("<td align=center>");
				if(stock contains doodad) page.append(stock[doodad].q);
				else page.append("0");
				page.append("</td>");
			}
			page.append("<td align=right>");
			page.append_price(doodad);
			page.append("&nbsp;</td><td align=center>");
			OCD[doodad].q = write_field(q, "q_"+to_int(doodad));
			page.append("</td><td>");
			OCD[doodad].action = action_drop(act, doodad);
			page.append("</td><td>");
			OCD[doodad].info = write_field(info, "i_"+to_int(doodad), 14);
			page.append("</td></tr>");
		}
	if(table_started)
		page.append("</table>");
	else
		page.append(`<div class="ocd-alert ocd-alert--info">Your entire inventory has already been categorized.<br>Nothing to see here, please move along.</div>`);

	page.append("</fieldset>"); 	// finish_box()
}

item [int] search_items(string search) {
	item [int] ia;
	if(length(search) > 0) {
		search = to_lower_case(search);
		foreach it in $items[]
			if(it.to_string().to_lower_case().contains_text(search) && is_OCDable(it))
				ia[ count(ia) ] = it;
	}
	return ia;
}

void edit_items(string act) {
	string fieldset;
	void this_tab(item [int] cat) {
		sort cat by to_string(value);
		page.append("<fieldset><legend>"+fieldset+"</legend>");
		if(act == "Search") {
			page.append("<table border=0 cellpadding=1><tr><td>");
			write_field(fields["searchbox"], "searchbox", "Search for: ", 64, "", "autofocus");
			page.append("</td><td>");
			write_button("dosearch", "Search");
			page.append("</td></tr></table>");
		}
		if(count(cat) > 0) {
			if(act == "Search")
				page.add_catbuttons();
			page.append("<table class=\"ocd-item-table\" border=0 cellpadding=1>");
			page.append("<tr><th colspan=2>Item</th>");
			page.append("<th>Price</th>");
			if(act == "Keep" || act == "Search")
				page.append("<th>Have</th>");
			if(act == "Closet" || act == "Search")
				page.append("<th>Closet</th>");
			if(act == "Storage" || act == "Search")
				page.append("<th>Storage</th>");
			if(act == "Display" || act == "Search")
				page.append("<th>Display</th>");
			page.append("<th>Keep</th><th>Action</th>");
			switch(act) {
			case "Mall":
				page.append("<th>Minimum Sale Price</th>");
				break;
			case "Crafting":
				page.append("<th>Craft into a</th><th>No purchase</th>");
				break;
			case "Reminders":
				page.append("<th>To do...</th>");
				break;
			case "Gift List":
				page.append("<th>Send to</th><th>Message with Gift</th>");
				break;
			case "Search":
			case "Inventory":
				page.append("<th>Extra Info?</th>");
				break;
			}
			page.append("</tr>");
			foreach x, doodad in cat {
				page.append("<tr valign=center class='item'><td>"+descPlusQ(doodad) +"</a></td>");
				page.append("<td align=right>");
				page.append_price(doodad);
				page.append("&nbsp;</td>");
				if(act == "Keep" || act == "Search")
					page.append("<td align=center>"+(item_amount(doodad)+equipped_amount(doodad))+"</td>");
				if(act == "Closet" || act == "Search")
					page.append("<td align=center>"+closet_amount(doodad)+"</td>");
				if(act == "Storage" || act == "Search")
					page.append("<td align=center>"+storage_amount(doodad)+"</td>");
				if(act == "Display" || act == "Search")
					page.append("<td align=center>"+display_amount(doodad)+"</td>");
				page.append("<td>");
				OCD[doodad].q = write_field(OCD[doodad].q, "q_"+to_int(doodad));
				page.append("</td><td>");
				OCD[doodad].action = action_drop(OCD[doodad].action, doodad);
				switch(act) {
				case "Mall":
					page.append("</td><td>");
					OCD[doodad].info = write_field((is_integer(OCD[doodad].info) && OCD[doodad].info != "0")? OCD[doodad].info: "", "i_"+to_int(doodad), 20);
					break;
				case "Crafting":
				case "Reminders":
				case "Search":
				case "Inventory":
					page.append("</td><td>");
					OCD[doodad].info = write_field(OCD[doodad].info, "i_"+to_int(doodad), 25);
					if(act == "Crafting") {
						page.append("</td><td align=center>");
						OCD[doodad].message = write_check(OCD[doodad].message, "m_"+doodad.to_int(),"");
					}
					break;
				case "Gift List":
					page.append("</td><td>");
					OCD[doodad].info = write_field(OCD[doodad].info, "i_"+to_int(doodad), 10);
					page.append("</td><td>");
					OCD[doodad].message = write_field(OCD[doodad].message, "m_"+to_int(doodad), 25);
					break;
				}
				page.append("</td></tr>");
			}
			page.append("</table>");
		} else if(act == "Search" && fields["searchbox"].length() > 0)
			page.append("<p style='text-indent:3%; color:#FF6666'>No search results found. Try searching for a partial match.</p>");
		page.append("</fieldset>"); 	// finish_box()
	}

	switch(act) {
	case "Keep":
		fieldset = "Manage Items to Keep";
		this_tab(keeps);
		break;
	case "Mall":
		fieldset = "Manage Mall";
		this_tab(malls);
		break;
	case "Dispose":
		fieldset = "Manage Items to Autosell or Discard";
		this_tab(autos);
		break;
	case "Pulverize":
		fieldset = "Manage Items to Pulverize";
		this_tab(pulvs);
		break;
	case "Use":
		fieldset = "Manage Items to Use (or Break Apart)";
		this_tab(uses);
		break;
	case "Closet":
		fieldset = "Manage Closet Items";
		this_tab(clsts);
		break;
	case "Clan Stash":
		fieldset = "Manage Items for Clan Stash";
		this_tab(clans);
		break;
	case "Crafting":
		fieldset = "Manage Crafting Items";
		this_tab(makes);
		break;
	case "Untinkering":
		fieldset = "Manage Items to Untinker";
		this_tab(untinks);
		break;
	case "Gift List":
		fieldset = "Manage Gift List";
		this_tab(gifts);
		break;
	case "Display":
		fieldset = "Manage Display Case";
		this_tab(disps);
		break;
	case "Reminders":
		fieldset = "Manage Reminders";
		this_tab(todos);
		break;
	case "Search":
		fieldset = "Search for Items";
		this_tab(search);
		break;
	case "Inventory":
		fieldset = "Double check inventory that was already added";
		item [int] inv;
		foreach it in $items[]
			if(available_amount(it) > 0 && is_OCDable(it))
				inv[ count(inv) ] = it;
		this_tab(inv);
		break;
	}
}

void stock_items() {
	item [int] ostock;

	page.append("<fieldset><legend>Items to keep in stock</legend>"); // write_box()

	page.append("What to do with items on this list?<ul class='stock'><li>");
	vars["BaleOCD_Stock"] = write_radio(getvar("BaleOCD_Stock"), "stock", " Acquire these items for future use", 1);
	page.append("</li><li>");
	write_radio(getvar("BaleOCD_Stock"), "stock", " Keep them... if they <i>happen</i> to be in inventory", 2);
	page.append("</li><li>");
	write_radio(getvar("BaleOCD_Stock"), "stock", " Ignore this stock list", 0);
	page.append("</li></ul>");

	page.append("<table border=0 cellpadding=1><tr><td align=right>");
	if(write_button("stocknew", " New ")) {
		clear(stock);
		if(!file_to_map("ocd-cleanup-stock.txt", stock) || count(stock) == 0)
			print("Error loading default stock data.", _ocd_color_error());
	}
	page.append("</td><td>Create a default stock list for softcore pulls!</td></tr>");
	if(count(stock) > 0) {
		page.append("<tr><td align=right>");
		if(write_button("stockdel", "Delete")) {
			clear(stock);
			foreach key in fields
				if(key.contains_text("stock_"))
					remove fields[key];
			map_to_file(stock, "OCDstock_"+getvar("BaleOCD_StockFile")+".txt");
		}
		page.append("</td><td>Delete <i>all</i> entries in the following list!</td></tr>");
	}
	page.append("</table><br />");

	if(count(stock) > 0) {
		page.append("<table class=\"ocd-item-table\" border=0 cellpadding=1>");
		page.append("<tr><th>Purpose</th><th colspan=2>Item</th><th>Have</th><th>Stock</th><th>Delete?</th></tr>");
		foreach doodad in stock
			ostock[count(ostock)] = doodad;
		sort ostock by stock[value].type;
		string lasttype = stock[ostock[0]].type;
		foreach i, doodad in ostock {
			if(lasttype != stock[doodad].type) {
				page.append("<tr><td>&nbsp;</td></tr>");
				lasttype = stock[doodad].type;
			}
			page.append("<tr valign=center class='item'><td>");
			stock[doodad].type = write_field(stock[doodad].type, "stock_t_"+doodad.to_int(), 15);
			page.append("</td><td>&nbsp;"+imagedesc(doodad) +"</a></td><td align=center>"+full_amount(doodad)+"</td><td align=center>");
			stock[doodad].q = write_field(stock[doodad].q, "stock_q_"+doodad.to_int());
			page.append("</td><td align=center>");
			delstock[doodad] = write_check(delstock[doodad], "stock_del_"+doodad.to_int(), "");
			page.append("</td></tr>");
		}
		page.append("</table>");
	} else {
		page.append(
			`<div class="ocd-alert ocd-alert--info">`
			+ `Your stock list is completely empty!`
			+ `<br>Click the above button to create a list, or you can add items below.`
			+ `<br>When done, click "Save All".`
			+ `</div>`
		);
	}
	page.append("<p></p>");
	page.append("<table class=\"ocd-item-table\" border=0 cellpadding=1>");
	page.append("<tr><th>Add New Item</th><th>Acquire</th><th>Purpose</th></tr>");
	for i from 1 to 11 {
		page.append("<tr><td valign=top>");
		newstock1[i].doodad = write_field(newstock1[i].doodad, "newd_"+i, 25);
		page.append("</td><td align=center valign=top>");
		newstock1[i].q = write_field(newstock1[i].q, "newq_"+i);
		page.append("</td><td valign=top>");
		newstock1[i].type = write_field(newstock1[i].type, "newt_"+i, 15);
		page.append("</td></tr>");
	}
	page.append("</table>");

	page.append("</fieldset>"); 	// finish_box()
}

void set_cats() {
	foreach key, value in OCD
		switch(value.action) {
		case "KEEP":
			keeps[ count(keeps) ] = key;
			break;
		case "MAKE":
			makes[ count(makes) ] = key;
			break;
		case "UNTN":
			untinks[ count(untinks) ] = key;
			break;
		case "USE":
		case "BREAK":
			uses[ count(uses) ] = key;
			break;
		case "PULV":
			pulvs[ count(pulvs) ] = key;
			break;
		case "MALL":
			malls[ count(malls) ] = key;
			break;
		case "AUTO":
		case "DISC":
			autos[ count(autos) ] = key;
			break;
		case "DISP":
			disps[ count(disps) ] = key;
			break;
		case "CLST":
			clsts[ count(clsts) ] = key;
			break;
		case "CLAN":
			clans[ count(clans) ] = key;
			break;
		case "GIFT":
			gifts[ count(gifts) ] = key;
			break;
		case "TODO":
			todos[ count(todos) ] = key;
			break;
		}
}

void zlib_vars() {
	page.append("<fieldset><legend>Configure Character Settings</legend>"); // write_box()

	page.append("<table class='zlib' border=0 cellpadding=1>");
	page.append("<tr><td align=right>Empty Closet First: </td><td>");
	if(getvar("BaleOCD_EmptyCloset") != "-1" && getvar("BaleOCD_EmptyCloset") != "0") vars["BaleOCD_EmptyCloset"] = 0;
	vars["BaleOCD_EmptyCloset"] = write_radio(getvar("BaleOCD_EmptyCloset"), "EmptyCloset", "Never,", -1);
	write_radio(getvar("BaleOCD_EmptyCloset"), "EmptyCloset", "Before Emptying Hangk's (recommended)", 0);
	page.append("</td></tr><tr><td align=right>Mall Pricing: </td><td>");
	vars["BaleOCD_Pricing"] = write_radio(getvar("BaleOCD_Pricing"), "Pricing", "Automatic,", "auto");
	write_radio(getvar("BaleOCD_Pricing"), "Pricing", "999,999,999 meat.", "max");
	page.append("</td></tr></table>");

	page.append("<p class='zlib'>");
	vars["BaleOCD_Sim"] = write_check(getvar("BaleOCD_Sim"), "Sim", "Simulate Only ");
	page.append(" <font size=1>(no actions will be taken)</font></p>");

	page.append("<table class='zlib' border=0 cellpadding=1><tr><td align=right>My Mall Multi:</td><td>");
	vars["BaleOCD_MallMulti"] = write_field(getvar("BaleOCD_MallMulti"), "MallMulti", 14);
	page.append("</td><td align=right>&nbsp;&nbsp;Mall Multi kMail Text</td><td>");
	vars["BaleOCD_MultiMessage"] = write_field(getvar("BaleOCD_MultiMessage"), "MultiMessage", 14);
	page.append("</td></tr><tr><td colspan=2>");
	vars["BaleOCD_UseMallMulti"] = write_check(getvar("BaleOCD_UseMallMulti"), "UseMulti", "Use Mall Multi");
	page.append("</td></tr></table>");

	page.append("<p class='zlib'>Data file: OCDdata_");
	vars["BaleOCD_DataFile"] = write_field(getvar("BaleOCD_DataFile"), "DataFile", 10);
	if(getvar("BaleOCD_DataFile") == "")
		vars["BaleOCD_DataFile"] = my_name();
	page.append("<br />Stock file: OCDstock_");
	vars["BaleOCD_StockFile"] = write_field(getvar("BaleOCD_StockFile"), "StockFile", 10);
	if(getvar("BaleOCD_StockFile") == "")
		vars["BaleOCD_StockFile"] = my_name();
	page.append("<br />Change file names without writing any data: ");
	if(write_button("change", "Change Filename!")) {
		string DataFile = getvar("BaleOCD_DataFile");
		string StockFile = getvar("BaleOCD_StockFile");
		// Restore zlib values so only file name is changed!
		file_to_map("vars_"+replace_string(my_name()," ","_")+".txt",vars);
		vars["BaleOCD_DataFile"] = DataFile;
		vars["BaleOCD_StockFile"] = StockFile;
		updatevars();
		page.append("<div style='font-weight:bold; color:blue;'>Filename changed @ ");
		page.append("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
	}
	page.append("</p>");

	page.append("</fieldset>"); 	// finish_box()
}

void information() {
	// page.append(`<p style="">OCD-Cleanup is undergoing a </p>`);
	page.append(`<fieldset>`);
	page.append(`<legend>`);
	page.append(`<a class="version" href="https://kolmafia.us/threads/26027/" target="_blank" rel="noreferrer noopener">Philter Manager classic</a>`);
	page.append(`<small>, brought to you by <a class="version" href="https://github.com/Loathing-Associates-Scripting-Society/" target="_blank" rel="noreferrer noopener">Loathing Associates Scripting Society</a></small>`);
	page.append(`</legend>`);

	append_infobox();
	int AddQ;
	string[item] defaults;
	foreach key in OCDefault
		if(!has_ocd_action(key) && (item_amount(key) > 0 || equipped_amount(key) > 0 || closet_amount(key) > 0 || display_amount(key) > 0)) {AddQ += 1; defaults[key] = OCDefault[key].action; } #{AddQ += 1; print(key);}
	if(count(OCD) > 0) {
		int curr_items = curr_items();
		if(curr_items > 0 && AddQ > 0) {
			page.append("<p>");
			if(write_button("defaultdata", "Add data")) {
				foreach key in OCDefault
					if(!has_ocd_action(key) && (item_amount(key) > 0 || equipped_amount(key) > 0 || closet_amount(key) > 0 || display_amount(key) > 0)) OCD[key] = OCDefault[key];
				save_ocd();
				curr_items = curr_items();
			}
			page.append(" Add default information for "+AddQ+" common item"+(AddQ == 1? " that is": "s that are")+" not already in your data.</p>");
			page.append("<table class=\"ocd-item-table\" border=0 cellpadding=1>");
			page.append("<tr><th>Item</th><th>Default</th></tr>");
			foreach key in defaults
				page.append("<tr><td>" + key + "</td><th>" + defaults[key] + "</th></tr>");
			page.append("</table>");
		}
		page.append("<table border=0 cellpadding=1>");
		page.append("<tr");
		if(curr_items > 0) page.append(" style='color: #FF0000;'");
		page.append("><td align=right>"+curr_items+"&nbsp;</td><td colspan=3>Items in inventory to add</td></tr>");
		page.append("<tr><td align=right>"+count(OCD)+"&nbsp;</td><td colspan=3>Items in Database</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(keeps) + "&nbsp;</td><td>Items to keep</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(malls) + "&nbsp;</td><td>Items to mall</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(autos) + "&nbsp;</td><td>Items to dispose (autosell or discard)</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(pulvs) + "&nbsp;</td><td>Items to pulverize</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(uses)  + "&nbsp;</td><td>Items to use (or break)</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(clsts) + "&nbsp;</td><td>Items to closet</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(clans) + "&nbsp;</td><td>Items to stash</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(makes) + "&nbsp;</td><td>Items to craft</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(untinks)+"&nbsp;</td><td>Items to untinker</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(gifts) + "&nbsp;</td><td>Items to send as gifts</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(disps) + "&nbsp;</td><td>Items to display</td></tr>");
		page.append("<tr><td>&nbsp;</td><td align=right>"+count(todos) + "&nbsp;</td><td>Items to remind me about</td></tr>");
		page.append("</table>");
	} else {
		page.append("</table>");
		page.append("<p style='text-align:center; font-size:140%; font-weight:bold; color:red;'>All item information is corrupted or missing.</p>");
		page.append("<p style='color:navy;'>Hopefully this is the first time you've run OCD Inventory. If so, you'll need to add handling instructions for every item in your inventory.</p>");
		page.append("<p>Simply click on the \"Add Items\" tab above. If this is your first run it may take a minute to load. Don't panic! This wait is normal when you have many uncategorized items.</p>");
		page.append("<p>From the \"Add Items\" tab you will select an action from the drop down next to each item. If you want to keep all of an item, then choose the \"Keep\" action. If you want to keep only a limited quantity of an item, then enter the number to keep into the text box.</p>");
		page.append("<p>If you want to craft an item into another item, list the product into the information field. When giving gifts, you should enter the name of the recipient into the information field. Later on, you may list the note to go with a gift if you edit the \"Gift List\" tab when editing the database.</p>");
	}
	page.append("</fieldset>"); 	// finish_box()
}

void write_tab(string tabname, string value) {
	page.append("<li");
	if(fields[tabname] == value) page.append(" class='tabberactive'");
	page.append("><input type='submit' class='nav' name='"+ tabname+ "' value='"+value+"'>");
	page.append("</li>");
}

void subcat_tabs() {
	page.append("<ul class='tabbernav'>");
	if(count(keeps) > 0) write_tab("editTab", "Keep");
	if(count(malls) > 0) write_tab("editTab", "Mall");
	if(count(pulvs) > 0) write_tab("editTab", "Pulverize");
	if(count(uses)  > 0) write_tab("editTab", "Use");
	if(count(clsts) > 0) write_tab("editTab", "Closet");
	if(count(clans) > 0) write_tab("editTab", "Clan Stash");
	if(count(makes) > 0) write_tab("editTab", "Crafting");
	if(count(untinks) > 0) write_tab("editTab", "Untinkering");
	if(count(gifts) > 0) write_tab("editTab", "Gift List");
	if(count(disps) > 0) write_tab("editTab", "Display");
	if(count(autos) > 0) write_tab("editTab", "Dispose");
	if(count(todos) > 0) write_tab("editTab", "Reminders");
	write_tab("editTab", "Search");
	page.append("<li></ul>");

	edit_items(fields["editTab"]);
}

void main() {
	load_OCD();
	static set_craftable();
	set_cats();
	fields = form_fields();
	success = count(fields) > 0;
	# foreach x,y in fields print(x + " - "+ y); print("==============================");
	// If the script has already been run, save this information
	if(test_button("save") && success) {
		item doodad;
		string num;
		foreach key, val in fields
			if(key.char_at(0) == "_") {
				num = key.substring(1);
				doodad = num.to_int().to_item();
				OCD[doodad].action = val;
				OCD[doodad].q = fields["q_"+num].to_int();
				OCD[doodad].info = fields["i_"+num];
			} else if(key.contains_text("newd_") && val != "none") {
				num = key.substring(5);
				doodad = to_item(val);
				stock[doodad].type = fields["newt_"+num];
				stock[doodad].q = fields["newq_"+num].to_int();
				newstock1[to_int(num)].doodad = $item[none];
				fields["newd_"+num] = "none";
			} else if(key.contains_text("stock_del_") && val == "on") {
				num = key.substring(10);
				doodad = num.to_int().to_item();
				remove stock[doodad];
			}
	}

	// write_page()
	page.append("<html><head>");
	styles();
	page.append("</head><body><form name='relayform' method='POST' action=''>");
	page.append("<input type='submit' name='no show' value='donothing' style='position: absolute; left: -9999px'/>");  // Catches enter in a text field without saving

	if(!(fields contains "tab")) {
		if(fields contains "last_tab")
			fields["tab"] = fields["last_tab"];
		else {
			if((curr_items() > 99 || curr_items() < 1) && !test_button("save"))
				fields["tab"] = "Information";
			else fields["tab"] = "Add Items";
		}
	}
	if(!(fields contains "editTab")) {
		if(fields contains "last_editTab")
			fields["editTab"] = fields["last_editTab"];
		else fields["editTab"] = "Search";
	}
	if(fields contains "searchbox")
		search = search_items(fields["searchbox"]);

	# foreach x,y in fields print(x + " - "+ y); print("==============================");
	boolean noSave = fields["tab"] == "Information" || (fields["tab"] == "Edit Database" && fields["editTab"] == "Search" && (count(search) == 0));

	if(noSave) {
		page.append("&nbsp;");
	} else {
		page.append("<table border=0 cellpadding=1><tr><td>");
		write_button("save", "Save All");
		page.append("</td><td>");
		if(test_button("save") && success) {
			page.append("<div style='font-weight:bold; color:blue;'>Last save @ ");
			page.append("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
		} else if(!noSave) page.append("Save all changes above");
		page.append("</td></tr></table>");
	}

	page.append("<ul class='tabbernav'>");
	write_tab("tab", "Information");
	write_tab("tab", "Add Items");
	write_tab("tab", "Inventory Check");
	write_tab("tab", "Edit Database");
	write_tab("tab", "Items to Stock");
	write_tab("tab", "Configure Script");
	page.append("</ul>");

	// Save TRUE checkboxes
	foreach x, doodad in makes
		if(OCD[doodad].message == "true" && (fields["tab"] != "Edit Database" || fields["editTab"] != "Crafting"))
			write_hidden(count(fields) > 2? fields["m_"+doodad.to_int()]: OCD[doodad].message,"m_"+doodad.to_int());
	if(count(fields) > 2) {
		write_hidden(fields["tab"], "last_tab");
		write_hidden(fields["editTab"], "last_editTab");
	}
	if(fields["tab"] == "Configure Script") {
		zlib_vars();
	} else {
		write_hidden(getvar("BaleOCD_Sim"), "Sim");
		write_hidden(getvar("BaleOCD_UseMallMulti"), "UseMulti");
		switch(fields["tab"]) {
		case "Information":
			information();
			break;
		case "Add Items":
			add_items();
			break;
		case "Inventory Check":
			edit_items("Inventory");
			break;
		case "Edit Database":
			subcat_tabs();
			break;
		case "Items to Stock":
			stock_items();
			break;
		}
	}

	if(noSave)
		page.append("&nbsp;");
	else {
		page.append("<table border=0 cellpadding=1><tr><td>");
		write_button("save", "Save All");
		page.append("</td><td>");
	}
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
		map_to_file(stock, "OCDstock_"+getvar("BaleOCD_StockFile")+".txt");
		updatevars();
		vprint("Item(s) have been categorized.", _ocd_color_success(), 3);
		page.append("<div style='font-weight:bold; color:blue;'>Last save @ ");
		page.append("<script language='javascript'>ourDate = new Date();document.write(' at '+ ourDate.toLocaleString() + '.<br/>');</script></div>");
	} else if(!noSave) page.append("Save all changes above");
	if(!noSave)
		page.append("</td></tr></table>");

	// Ensure nothing is forgotten when tabs are switched
	if(success)
		foreach key, value in fields
			 if(!(page.contains_text(key) || key.contains_text("tab")))
				write_hidden(value, key);

	page.append("</form></body></html>"); 	// finish_page()
	writeln(page);
}
