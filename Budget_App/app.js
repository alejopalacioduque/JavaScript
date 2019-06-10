// BUDGET CONTROLLER
var budgetController = (function() {

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){

    if (totalIncome > 0) {
      this.percentage = Math.round ((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1
    }
  };
  
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(element => {
      sum += element.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp : [],
      inc : []
    },
    totals : {
      exp : 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem : function(type, desc, val){
      var newItem;
      // create new ID
      if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      } else {
        ID = 0
      }
       
      // Crete New Item
      if (type === 'exp'){
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, desc, val);
      }
      // Push it into data structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem : function(type, id){
      
      var ids, index;
      
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index,1);
      }
    },

    calculateBudget: function(){
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0 ) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
      
    },

    calculatePercentages : function(){

      data.allItems.exp.forEach(function(curr){
        curr.calcPercentage(data.totals.inc);
      });

    },

    getPercentages: function(){

      var allPerc = data.allItems.exp.map(function(curr){
        return curr.getPercentage();
      });
      return allPerc;

    },

    getBudget : function(){
      return {
        budget : data.budget,
        totalInc : data.totals.inc,
        totalExp : data.totals.exp,
        percentage : data.percentage
      }
    },

    testing : function(){
      console.log(data);
    }
  };

})();

// UI CONTROLLER
var UIController = (function() {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomContainer: '.income__list',
    expenseContaniner: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    contaniner: '.container',
    expensesPercLabel : '.item__percentage',
    dateLabel : '.budget__title--month',
    inputType: '.add__type'

  };

  var formatNumber = function(num, type){

    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? sign = '-' : '+') + ' ' + int  + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for (let index = 0; index < list.length; index++) {
     callback(list[index], index);
    }
  };

  return {
    getInput : function(){
      return {
        // Will be either inc or exp
        type : document.querySelector(DOMStrings.inputType).value,
        description : document.querySelector(DOMStrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },

    addListItem : function(obj, type){

      var html, newHtml, element;
      // Create HTML with placeholder
      if (type === 'inc'){
        element = DOMStrings.incomContainer;
        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix"><div class="item__value">%value%</div>
        <div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div></div></div>`;
      } else {
        element = DOMStrings.expenseContaniner;
        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix"><div class="item__value">%value%</div>
        <div class="item__percentage">21%</div><div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div></div></div>`;
      }
      
      // Replace the placeholder text
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem : function (selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields : function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + 
      DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach((element, index, array) => {
        element.value = '';
      });
      fieldsArr[0].focus();
    },

    displayBudget :function(obj){

      var type;
      obj.budget > 0  ? type = 'inc' :  type= 'exp';
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      
      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent= obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent= '---';
      }
    },

    displayPercentages : function(percentages) {

      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index){
        
        if (percentages[index] > 0 ) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
        
      });

    },

    displayMonth : function(){

      var now, year, month, months;
      now = new Date();

      months = ['January','February','March','April','May','June','July','August',
      'September','October','November','December'];
      year = now.getFullYear();
      month = now.getMonth() 
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + '/' + year;

    },

    changeType: function(){

      var fields = document.querySelectorAll(
        DOMStrings.inputType + ','+
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue);

      nodeListForEach(fields, function(curr){
        curr.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

    },

    getDOMStrings : function(){
      return DOMStrings;
    }
  }
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function (){
    var DOM = UIController.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddIten);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddIten();
      }
    });

    document.querySelector(DOM.contaniner).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
  };

  var updateBudget = function(){
    // 1. Calculate budget
    budgetCtrl.calculateBudget();

    // 2. return Budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  updatePercentages = function(){
    
    // 1. Calculate percentages

    budgetCtrl.calculatePercentages();

    // 2. Read percentages form the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddIten = function() {

    var input, newItem;
    // 1. Get field input data
    input = UIController.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2. Add item to the budget ccontroller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to UI
      UIController.addListItem(newItem, input.type);

      // 4. Clear fields
      UIController.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Update percentages
      updatePercentages();
    }
  };
  
  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Update percentages
      updatePercentages();

    }
  };

  return {
    init : function(){
      console.log('Application was started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget : 0,
        totalInc : 0,
        totalExp : 0,
        percentage : -1
      });
      setupEventListeners();

    }
  };

})(budgetController, UIController);

// Init Application
controller.init();