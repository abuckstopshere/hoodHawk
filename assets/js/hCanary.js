//                \\
// Global Variables \\
//                    \\
//var block = ''
var blockGroup = ''
var zip = ''
var lat = ''
var long = ''
var address = ''
var zipCode = ''
var houseVal
var key = 'UVFUMOJ62FUBUG8GSGQV'
var secret = 'QHQs8W0L6HfJgHmY18wCG42CnHHctyUG'


//                 \\
//   Event Handler   \\
//                     \\

$('#submit').on('click', function() {
        console.log("You Hit Me!")

        event.preventDefault()
        address = $('#addressInput').val().trim()
        zipCode = $('#zipCodeInput').val()

        initial(address, zipCode)

    })
    // Main Data Call \\ 
function initial(address, zipCode) {
    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/property/details?address=${address}&zipcode=${zipCode}`

    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        console.log(data)
        if (data[0]["property/details"].result === null) {
            $("#addressHeader").html("Sorry! I couldn't find any information about that address.")
        } else {
            console.log('working call')
            var block = data[0].address_info.block_id
            blockGroup = data[0].address_info.blockgroup_id
            zip = data[0].address_info.zipcode
            lat = data[0].address_info.lat
            long = data[0].address_info.lng
            $("#addressHeader").text(data[0].address_info.address_full).append('<br><a id="favorites" class="waves-effect waves-light btn cyan"><i class="material-icons left">star</i>Add to Favorites</a>')
            $("#bed, #bath").removeClass("blue-grey-text text-lighten-4").addClass("cyan-text");
            $("#numBath").text(data[0]["property/details"].result.property.total_bath_count)
            $("#numBed").text(data[0]["property/details"].result.property.number_of_bedrooms)
            airConditioning = data[0]["property/details"].result.property.air_conditioning
            if (airConditioning === null) {
                $("#icy").removeClass("blue-text")
            } else {
                $("#icy").removeClass("blue-grey-text text-lighten-4")
                $("#icy").addClass("blue-text")
            }
            heating = data[0]["property/details"].result.property.heating
            if (heating === null) {
                $("#fire").removeClass("deep-orange-text")
            } else {
                $("#fire").removeClass("blue-grey-text text-lighten-4")
                $("#fire").addClass("deep-orange-text")
            }

            //sqft data
            var sqFt = data[0]["property/details"].result.property.building_area_sq_ft
            $("#essentialsTable").append('<tr><th>Square Feet:</th><td id="sqFtText"></td></tr>')
            if (sqFt == null) $("#sqFtText").text("not available")
            else $("#sqFtText").text(sqFt.toLocaleString())
                //property type data
            var propType = data[0]["property/details"].result.property.property_type
            $("#essentialsTable").append('<tr><th>Property Type:</th><td id="propTypeText"></td></tr>')
            if (propType == null) $("#propTypeText").text("not available")
            else $("#propTypeText").text(propType)
                //assessed value and year data
            var assessedVal = data[0]["property/details"].result.assessment.total_assessed_value
            var assessedYr = data[0]["property/details"].result.assessment.assessment_year
            $("#essentialsTable").append('<tr><th>Assessed Value:</th><td><span id="assessedValueText"></span><span id="assessmentYearText"></span></td></tr>')
            if (assessedVal == null) $("#assessedValueText").text("data not available")
            else $("#assessedValueText").text(`$${assessedVal.toLocaleString()}`)
            if (assessedYr == null) $("#assessmentYearText").text("(year of assessment not available)")
            else $("#assessmentYearText").text(" (as of " + assessedYr + ")")

            var propTax = data[0]["property/details"].result.assessment.tax_amount

            // Other AJAX calls
            initMap()
            school(address, zipCode)
            crime(block)
            rental(address, zipCode, propTax)
        }
    });
}

// School Stats Call \\

function school(address, zipCode) {
    console.log(`school call: ${address} and ${zipCode}`)

    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/property/school?address=${address}&zipcode=${zipCode}`
    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        console.log(data)
        $("#schoolsElem").text(titleCase(data[0]["property/school"].result.school.elementary[0].name))
        $("#schoolsMiddle").text(titleCase(data[0]["property/school"].result.school.middle[0].name))
        $("#schoolsHigh").text(titleCase(data[0]["property/school"].result.school.high[0].name))
    })
}

// Crime Stats Call \\
function crime(block) {
    console.log(`crime call: ${block}`)

    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/block/crime?block_id=${block}`
    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        $("#crimePctNational").text(data[0]["block/crime"].result.all.nation_percentile)
        $("#crimeIncidents").text(data[0]["block/crime"].result.all.incidents)
        $("#crimePctCounty").text(data[0]["block/crime"].result.all.county_percentile)

    });
}

// Property Rental Stats Call \\
console.log(`rental call: ${address} and ${zipCode}`)

function rental(address, zipCode, propTax) {

    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/property/rental_yield?address=${address}&zipcode=${zipCode}`
    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        console.log("Rental Data: " + data)
            //house value data
        houseVal = data[0]["property/rental_yield"].result.value
        $("#affordTable").append('<tr><th>Value:</th><td id="houseValue"></td></tr>')
        if (houseVal == null) $("#houseValue").text("not available")
        else $("#houseValue").text(`$${houseVal.toLocaleString()}`)
            // monthly rent data
        var rent = data[0]["property/rental_yield"].result.monthly_rent
        $("#affordTable").append('<tr><th>Monthly Rent:</th><td id="monthlyRent"></td></tr>')
        if (rent == null) $("#monthlyRent").text("not available")
        else $("#monthlyRent").text(`$${rent.toLocaleString()} per month`)

        mortCalc()

        $("#affordTable").append('<tr><th>Property Tax:</th><td><span id="propertyTax"></span></td></tr>')
        if (propTax == null) $("#propertyTax").text("not available")
        else $("#propertyTax").text("$" + Math.round(propTax).toLocaleString() + " per year")
        console.log("propTax: $" + propTax + " per year")
    })
}

// Rewrite strings so only first letter is capitalized \\
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}


function blockgroup() {

    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/blockgroup/hcri?blockgroup_id=${blockGroup}&property_type=SFD`
    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        console.log(data)
    });
}

function zipdetail() {

    var url = `https://cors-anywhere.herokuapp.com/https://api.housecanary.com/v2/zip/details?zipcode=${zip}`
    $.ajax({
        url: url,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(key + ":" + secret)
            );
        },
        data: {}
    }).then(function(data) {
        console.log(data)
    });
}