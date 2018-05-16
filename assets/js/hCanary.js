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

  // TEST KEYS - turn on during testing/development
  // can only search these test addresses: https://api.housecanary.com/v2/property/test_addresses
  // Ex: 2439 Russell St 94705 , 1207 Cardinal Rd 72401

  //   var key = 'test_QO8GY56KX06R7SQOQ2YV'
  //   var secret = 'OXAmnCLxAp8N1Uck2YNXpoasg59hvUEV'

  // TRIAL KEYS - turn on ONLY for deployment due to limited funds

  var key = 'JXKWBCVEIZS2ZTA2WJMP'
  var secret = 'LiThLtpAYJNYEDYUzHqwF1VuBpoHrkzW'

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
          console.log("property details: ")
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
              $("#addressHeader").empty().text(data[0].address_info.address_full).append('<br><a id="addFavorite" class="waves-effect waves-light btn cyan"><i class="material-icons left">star</i>Add to Favorites</a>')
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
              $("#essentialsTable").empty()
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
          console.log("schools: ")
          console.log(data)
          $("#schoolTable").empty();
          // elem school name
          var elem = data[0]["property/school"].result.school.elementary[0].name
          $("#schoolTable").append('<tr><th>Elementary:</th><td id="schoolsElem"></td></tr>')
          if (elem == null) $("#schoolsElem").text("not available")
          else $("#schoolsElem").text(titleCase(elem));
          // middle school name
          var middle = data[0]["property/school"].result.school.middle[0].name
          $("#schoolTable").append('<tr><th>Middle:</th><td id="schoolsMiddle"></td></tr>')
          if (middle == null) $("#schoolsMiddle").text("not available")
          else $("#schoolsMiddle").text(titleCase(middle));
          //high school name
          var high = data[0]["property/school"].result.school.high[0].name
          $("#schoolTable").append('<tr><th>High:</th><td id="schoolsHigh"></td></tr>')
          if (high == null) $("#schoolsHigh").text("not available")
          else $("#schoolsHigh").text(titleCase(high))
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
          console.log("crime: ")
          console.log(data)
          $("#crimeTable").empty();

          if (data[0]["block/crime"].result == null) $("#crimeTable").append('<tr><th>Data not available</th></tr>')
          else {
              // Number of incidents
              var crimeIncidents = data[0]["block/crime"].result.all.incidents
              $("#crimeTable").append('<tr><th>Incidents:</th><td id="crimeIncidents"></td></tr>')
              if (crimeIncidents == null) $("#crimeIncidents").text("not available")
              else $("#crimeIncidents").text(crimeIncidents);

              // County crime percentile
              var crimePctCty = data[0]["block/crime"].result.all.county_percentile
              $("#crimeTable").append('<tr><th>County Percentile:</th><td id="crimePctCounty"></td></tr>')
              if (crimePctCty == null) $("#crimePctCounty").text("not available")
              else $("#crimePctCounty").text(crimePctCty);

              //National crime percentile
              var crimePctNatl = data[0]["block/crime"].result.all.nation_percentile
              $("#crimeTable").append('<tr><th>National Percentile:</th><td id="crimePctNational"></td></tr>')
              if (crimePctNatl == null) $("#crimePctNational").text("not available")
              else $("#crimePctNational").text(crimePctNatl)
          }
      });
  }

  // Property Rental Stats Call \\
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
          console.log("rental data: ")
          console.log(data)
          $("#affordTable").empty();
          //house value data
          houseVal = data[0]["property/rental_yield"].result.value
          $("#affordTable").append('<tr><th>Value:</th><td id="houseValue"></td></tr>')
          if (houseVal == null) $("#houseValue").text("not available")
          else $("#houseValue").text(`$${houseVal.toLocaleString()}`);
          // monthly rent data
          var rent = data[0]["property/rental_yield"].result.monthly_rent
          $("#affordTable").append('<tr><th>Monthly Rent:</th><td id="monthlyRent"></td></tr>')
          if (rent == null) $("#monthlyRent").text("not available")
          else $("#monthlyRent").text(`$${rent.toLocaleString()} per month`);
          // mortgage data
          mortCalc();
          //property tax data
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
          console.log("block group: ")
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
          console.log("zip detail: ")
          console.log(data)
      });
  }