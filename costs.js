
//INIT
if(!localStorage.getItem('costGroups')){
    //init local storage
    var ggroups = [];
	ggroups.push(new Object());
	ggroups[0].name = 'other';
	localStorage.setItem('costGroups', JSON.stringify(ggroups));
}
var groups = JSON.parse(localStorage.getItem('costGroups'));
var colors = ["#fc4a1a", "#f7b733","#dfdce3","#4abdac","#0375b4",
			  "#007849","#373737","#96858f","#062f4f","#813772"];

$(document).ready(initCostsAnalytics());

//first init
function initCostsAnalytics(){
	$(".statement-container").before("<div id='plot-2' style='width:800px;height:500px'></div>");
	updateCosts();
}

/*
 * Update all transactions
 * try to categorize each of them
 * get summ array by cost groups
 */
function updateCosts(){
	var table = $('table.statement');

	var group2sum = [];
	for(var g of groups){
		group2sum.push(0.0);
	}
    //main loop by transactions
	table.find('tr.tx-debit').each(function(idx) {
		$this = $(this)
		tryDebt($this, idx, group2sum);
	});
	//update the chart
	plotGroups(group2sum);
}

/*
 * Update PIE chart
 */
function plotGroups(sums){
	//construct data array
	var data = [];
	for(var i=0; i<sums.length; i++){
		var obj = new Object();
		obj.label = groups[i].name+" ("+sums[i]+"p)";
		obj.data = sums[i];
		obj.color = colors[i];
		if(obj.data > 0){
		    data.push(obj);
		}
	}
	//sort
	data.sort(function(a, b){
		return a.data < b.data ? 1 : -1;
	});

	//plot
	$.plot('#plot-2', data, {
		series: {
			pie: { 
				show: true,
				radius: 1,
				label: {
					show: true,
					radius: 1,
					formatter: function(label, series){
						var percent = Math.round(series.percent);
						return ("<div class='chartlabel'>"+label.substring(0,label.indexOf(' ')) + " " + percent+"%</div>"); 
					}
				}
			}
		},
		legend: {
			show: true			
		}
	});
}

/*
 * Try to categorize transaction
 *
 *
 */
function tryDebt(tr, idx, group2sum) {
	tr.attr("id", idx)
	var name = tr.find("span.counterparty-name").text();
	var description = tr.find("span.description").text();
	var debt = Math.abs(parseFloat(tr.find("span.amount-only").text().replace(/\s+/g,'')));

	var groupN = 0;  //group for transaction
	var ruleN = -1;  //triggered rule
	loop1:for(var i=1; i<groups.length; i++) {
		var g = groups[i];
		for(var j=0; j<g.rules.length; j++) {
			var rule = g.rules[j];
			if((!rule.a || name.indexOf(rule.a)>=0)&&(!rule.b || description.indexOf(rule.b)>=0)) {
				groupN = i;
				ruleN = j;
				break loop1;
			} 
		}
	}
	//update summ
	group2sum[groupN] = group2sum[groupN] + debt;

	//update label
	tr.find(".costLabel").remove();
	tr.children('td').eq(1).append(
		"<span class='costLabel' style='background-color:"+colors[groupN%10]+"'>"+
			(groupN==0?"<a id='gridx' href='javascript:void(0);' onclick='javascript:showAdd2GroupDialog("+idx+");'>"+groups[groupN].name+"</a>":
			  groups[groupN].name)+
			(groupN>0?"<a href='javascript:void(0);' onclick='javascript:removeRule("+groupN+","+ruleN+");'> <sup>x</sup></a>":"") +
		"</span>");
	return;	
}

// Adding transaction to group dialog
function showAdd2GroupDialog(trIdx){
	tr = $("tr#"+trIdx);
	var name = tr.find("span.counterparty-name").text();
	var description = tr.find("span.description").text();
	var groups = JSON.parse(localStorage.getItem('costGroups'));
	
	tr.after(
	    "<dialog id='Add2GroupDlg'>"+
	        "Маркер:<input type='text' id='group' value='' list='groups'>"+
	        generateDatalist()+
	        "Получатель содержит <input type='text' id='name' value=''>"+
	        "Описание содержит <input type='text' id='description' value=''>"+
	    "</dialog>");
	
	var dialog = document.querySelector('#Add2GroupDlg');
	dialog.show();
	
	fnKey = function(event){
		if(event.keyCode==27){
			dialog.close();
			$("#Add2GroupDlg").remove();
		}else if(event.keyCode==13){
		    if($(this).attr('id')=='group'){
		        return;
		    }
			var group = dialog.querySelector('#group').value;
			var name = dialog.querySelector('#name').value;
			var desc = dialog.querySelector('#description').value;
			
			dialog.close();
			$("#Add2GroupDlg").remove();
			addRule(group, name, desc);
		}
	}
	dialog.querySelector('#group').onkeyup = fnKey;
	dialog.querySelector('#name').setAttribute("value", name);
	dialog.querySelector('#name').onkeyup = fnKey;
	dialog.querySelector('#description').setAttribute("value", description);
	dialog.querySelector('#description').onkeyup = fnKey;
	return false;
}

function generateDatalist(){
	var html = "<datalist id='groups'>";
	for(var g of groups){
		html+="<option value='"+g.name+"'>";
	}
	html+="</datalist>";
	return html;
}

// add rule to group and update UI
function addRule(gname, name, desc){
	for(var g of groups){
		if(g.name == gname){
			var rule = new Object();
			rule.a = name;
			rule.b = desc;
			g.rules.push(rule);
			localStorage.setItem('costGroups', JSON.stringify(groups));
			updateCosts();
			return;
		}
	}
	//new group
	var newgroup = new Object();
	newgroup.name = gname;
	newgroup.rules = [];
	var rule = new Object();
	rule.a = name;
	rule.b = desc;
	newgroup.rules.push(rule);
	groups.push(newgroup);
	localStorage.setItem('costGroups', JSON.stringify(groups));
	updateCosts();
}

// remove rule from group and update UI
function removeRule(groupN, ruleN){
	if(groupN==0 || ruleN<0){
		return;
	}
	var g = groups[groupN];
	var rule = g.rules[ruleN];
	if(!rule){
		return;
	}
	g.rules.splice(ruleN, 1);
	if(g.rules.length==0){
		groups.splice(groups.indexOf(g),1);
	}
	localStorage.setItem('costGroups', JSON.stringify(groups));
	updateCosts();
}