var CUSTOMERS = "Customers";
var CUSTOMER_NAME_PLACEHOLDER = "{{CustomerName}}";
var CUSTOMER_EMAIL_PLACEHOLDER = "{{CustomerEmail}}";
var CUSTOMER_IMAGE_PLACEHOLDER = "{{CustomerImage}}";
var FileContent;

$(function() {
    init();
    attachEvents();
});

// Initializes the page
function init(){
    // Hides the error messages
    hideErrorMessage();

    // Sets up the customer list area
    refreshCustomerList();

    // Sets up the customer details area
    $("#pDefaultCustomerDetails").show();
    $("#divSelectedCustomerDetails").hide();
};

// Attaches events
function attachEvents() {
    $('#btnAddCustomer').click(addCustomer);

    $(document).on('click', '#customerList li', showCustomerDetails);

    $("#txtSearchCustomers").keyup(filterCustomerList).blur(removeFilter);

    $('#addCustomerModal').on('show.bs.modal', function (e) {
        hideErrorMessage();
        $("#txtCustomerName").val('');
        $("#txtCustomerEmail").val('');
        FileContent = '';

        var dropZone = document.getElementById('divDropImage');
        dropZone.ondragover = function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        };

        dropZone.ondrop = handleDrop;

        dropZone.ondragend = function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        };

        dropZone.style.background = '';
    });
};

// Handles drop of file
function handleDrop(evt){
    var file = evt.dataTransfer.files[0], reader = new FileReader(); // FileList object
    evt.preventDefault();
    evt.stopPropagation();

    reader.onload = (function(theFile) {
        return function(e) {
            FileContent = e.target.result;
            document.getElementById('divDropImage').style.background = 'url(' + FileContent + ') no-repeat center';
        };
    })(file);

    // Read in the image file as a data URL.
    reader.readAsDataURL(file);
    return false;
}

// shows customer details
function filterCustomerList(){
    var filterText = $('#txtSearchCustomers').val().toLowerCase(), customerNameLi;

    $('#customerList li').each(function(index, liCustomerList){
        customerNameLi = $(liCustomerList).find("#customerNameFromList").html().toLowerCase();
        if(customerNameLi.indexOf(filterText) < 0){
            $(liCustomerList).hide();
        }
        else{
            $(liCustomerList).show();
        }
    })
}

// shows all customer
function removeFilter(){
    $('#txtSearchCustomers').val('');
    filterCustomerList();
}

// shows customer details
function showCustomerDetails(e){
    var customerName, customerEmail, customerImage;

    customerName = $(e.currentTarget).find("#customerNameFromList").html();
    customerEmail = $(e.currentTarget).find("#customerEmailFromList").html();
    customerImage = $(e.currentTarget).find("#customerImageFromList").css('background');

    $("#pDefaultCustomerDetails").hide();

    $("#divSelectedCustomerDetails #customerNameFromDetails").html(customerName);
    $("#divSelectedCustomerDetails #customerEmailFromDetails").html(customerEmail);
    $("#divSelectedCustomerDetails #customerImageFromDetails").css('background', customerImage);

    $("#divSelectedCustomerDetails").show();
}

// Adds a customer
function addCustomer() {
    var customerName, customerEmail, customerList, customerObj;

    customerName = $("#txtCustomerName").val();
    customerEmail = $("#txtCustomerEmail").val();
    customerList = getCustomers();


    if(isValidName(customerName, customerList) && isValidEmail(customerEmail) && isValidFile()){
        customerObj = {
            Name: customerName,
            Email: customerEmail,
            Image: FileContent
        }

        customerList.push(customerObj);
        setCustomers(customerList);
        refreshCustomerList();
        $("#addCustomerModal").modal('hide');
    }
    else{
        $("#addCustomerModal").modal('hide');
    }
};

// Validates name
function isValidName(customerName, customerList) {
    var retVal = true;

    if(customerName){
        if(_.find(customerList, function(customerObj){ // if the customer already exists
            return customerObj.Name === customerName;
        })){
            showErrorMessage('Customer already exists.');
            retVal = false;
        }
    }
    else{ // if the customer name is empty
        showErrorMessage('Customer Name cannot be empty.');
        retVal = false;
    }

    return retVal;
};

// Validates email
function isValidEmail(customerEmail) {
    var retVal = true;
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!regex.test(customerEmail)){
        showErrorMessage('Invalid Email value.');
        retVal = false;
    }

    return retVal;
};

// validates file
function isValidFile(){
    var retVal = true;

    if(!FileContent){
        showErrorMessage('Upload a file');
        retVal = false;
    }

    return retVal;
}

// show Error Message
function showErrorMessage(message){
    $("#spanInvalid").next().html(message);
    $("#divInvalid").removeClass('invisible');
}

// hide Error Message
function hideErrorMessage(){
    $("#spanInvalid").next().html('');
    $("#divInvalid").addClass('invisible');
}

// get customer list
function getCustomers(){
    var retVal = localStorage.getItem(CUSTOMERS);

    if(retVal){
        retVal = JSON.parse(retVal);
    }
    else {
        retVal = [];
    }

    return retVal;
}

// set customer list
function setCustomers(customerList){
    localStorage.setItem(CUSTOMERS, JSON.stringify(customerList))
}

// show customer list
function refreshCustomerList(){
    var $ulCustomerList, liCustomer, customerList;

    $ulCustomerList = $("#customerList");
    $ulCustomerList.html('');

    customerList = getCustomers();
    $.each(customerList, function(index, customerObj){
        liCustomer = $('#customerTemplate').html().replace(
                      CUSTOMER_NAME_PLACEHOLDER, customerObj.Name).replace(
                      CUSTOMER_EMAIL_PLACEHOLDER, customerObj.Email).replace(
                      CUSTOMER_IMAGE_PLACEHOLDER, customerObj.Image);

        $ulCustomerList.append(liCustomer);
    });
}
