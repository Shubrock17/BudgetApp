
 //BUDGET CONTROLLER
var budgetController = (function()
{
	var Expense=function(id,desc,value)
	{
		this.id=id;
		this.desc=desc;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage=function(totalIncome)
	{
		if(totalIncome>0)
		this.percentage=Math.round(this.value/totalIncome*100);
		else
			this.percentage=-1;
	};

	Expense.prototype.getPercentage=function(){
		return this.percentage;
	};

	var Income=function(id,desc,value)
	{
		this.id=id;
		this.desc=desc;
		this.value=value;
	};

	var calculateTotal=function(type){
		var sum=0;
		data.allItems[type].forEach(function(cur){
			sum=sum+cur.value;
		});
		data.totals[type]=sum;
	};

	//data object which have all the data structures which will recieve data. 
	var data={
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage:-1
	};


	return{
		addItem:function(type,des,val)
		{
			var newItem,ID;


			//create new Id
			if(data.allItems[type].length>0)
			{
				ID=data.allItems[type][data.allItems[type].length-1].id +1; 	
			}
			else
			{
				ID=0;
			}


			//createe new item based on inc or exp
			if(type==='exp'){
				newItem = new Expense(ID,des,val);
			}
			else if(type==='inc')
			{
				newItem = new Income(ID,des,val);	
			}

			//push it into our data structure
			data.allItems[type].push(newItem);

			//retrun the new element
			return newItem;
		},

		deleteItem:function(type,id){
			var ids=data.allItems[type].map(function(current){
				return current.id;
			});

			var index=ids.indexOf(id);

			if(index!==-1)
			{
				data.allItems[type].splice(index,1);
			}
		},

		calculateBudget:function(){
			//calc total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calc budget
			data.budget=data.totals.inc-data.totals.exp;

			//calc % of income spent
			if(data.totals.inc>0)
			data.percentage=Math.round(data.totals.exp/data.totals.inc*100);
			else
				data.percentage=-1;
		},

		calculatePercentages: function(){
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages:function(){
			var allPerc=data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget:function(){
			return {
				budget:data.budget,
				totalInc:data.totals.inc,
				totalExp:data.totals.exp,
				percentage:data.percentage
			}
		},

		testing:function()
		{
			console.log(data);
		}
	};

})();
//using iffe method we cannot directly use any variables outside this cope and it is encapsulated in this and therefore it works like a different and self alone modeule.
//to make use oif different values we return a function so that we can get acces from outside.


 //UI CONTROLLER
var UIcontroller =(function()
{
	//code

	var DOMstrings={
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputButton:'.add__btn',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container:'.container',
		expensesPercLabel:'.item__percentage',
		dateLabel:'.budget__title--month'
	
	};
	var formatNumber=function(num,type)
		{
	
			num =Math.abs(num);

			//exactly 2 decimal pt
			num=num.toFixed(2);

			//comma seperating 1000
			var numSplit=num.split('.');
			var int =numSplit[0];
			// if(int.length>3)
			// {
			// 	int =int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
			// }

			//+ or - before no.
			var dec=numSplit[1];			
        	return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

		};

	var nodeListForEach=function(list,callback)
			{
				for(var i=0;i<list.length;i++)
				{
					callback(list[i],i);
				}
			};
	return {
		getinput: function()
		{
			return{
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addlistItem: function(obj,type){
			//string
			var html,newHtml;
			//create HTML string with placeholder text
			if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


			//replace placeholder txt with actual data
			newHtml=html.replace('%id%',obj.id);
			newHtml=newHtml.replace('%description%',obj.desc);
			newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));


			//finally insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


		},
		
		deleteListItem:function(selectorID)
		{

			//DOM API
			var el=document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function()
		{
			var fields;
			fields=document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
			
			var fieldsArr=Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array)
			{
				current.value="";
			});

			fieldsArr[0].focus();
		},

		displayBudget:function(obj)
		{
			var type;
			obj.budget >0 ? type='inc':type='exp';
			document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
				
			if(obj.percentage>0)
			{
				document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage;
			}
			else
			{
				document.querySelector(DOMstrings.percentageLabel).textContent='---';
			}
		},


		displayPercentages:function(percentages){
			var fields=document.querySelectorAll(DOMstrings.expensesPercLabel);

			
			nodeListForEach(fields,function(current,index)
			{
				if(percentages[index]>0)
				current.textContent=percentages[index]+'%';
				else
					current.textContent='---';
			});
		},

		displayMonth:function(){
			var now=new Date();
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			var year=now.getFullYear();
			var month=now.getMonth();	
			document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' ' +year;

		},
 		changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        

		getDomstrings: function()
		{
			return DOMstrings;
		}
	}


})();

 //GLOBAL APP CONTROLLER
var Controller=(function(budgetctrl,UIctrl)
{

	var setupEventListener=function()
	{

		var DOM=UIctrl.getDomstrings();
		document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
		//KEYPRESS EVENT
		document.addEventListener('keypress',function(event)
		{
			if(event.keyCode===13 || event.which===13)
			{
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changedType)
	};


	var updateBudget=function()
	{

		// 1.calculate budget
		budgetctrl.calculateBudget();

		// 2.return the budget
		var budget=budgetctrl.getBudget();

		// 3.display on ui 
		UIctrl.displayBudget(budget);
	};

	var updatePercentages=function(){

		//1. calculate percentage
		budgetctrl.calculatePercentages();

		//2. read percentages from budget controller
		var percentages=budgetctrl.getPercentages();

		//3. update the ui with new percentages
		UIctrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){
		// 1.Get the input data
		var input=UIctrl.getinput();

		if(input.description!=="" && !isNaN(input.value) && input.value>0)
		{
			// 2.add the item to budget controller
			var newItem = budgetctrl.addItem(input.type,input.description,input.value);
		
			// 3.add item to ui
			UIctrl.addlistItem(newItem,input.type);

			// 4.clear th fields
			UIctrl.clearFields();

			// 5.calculate and updata budget
			updateBudget(); 

			//6. calc and update percentages
			updatePercentages();
		}	
		
	};


	var ctrlDeleteItem=function(event){
		var itemID=(event.target.parentNode.parentNode.parentNode.parentNode.id);
		
		if(itemID)
		{
			var splitID=itemID.split('-');	
			var type=splitID[0];
			var ID=parseInt(splitID[1]);

			//1. delete the item from ds
			budgetctrl.deleteItem(type,ID);

			//2. delete the item from ui
			UIctrl.deleteListItem(itemID);

			//3. update and show new budget 
			updateBudget();

			//4. calc and update percentages
			updatePercentages();
		}

	};

	return{
		init:function()
		{
			console.log('Application started');
			UIctrl.displayMonth();
			UIctrl.displayBudget({
				budget:0,
				totalInc:0,
				totalExp:0,
				percentage:-1
			});
			setupEventListener();
		}
	};


})(budgetController,UIcontroller);

Controller.init();