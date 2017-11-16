var builder = require('botbuilder');
var Store = require('./store');
var ssml = require('./ssml');



module.exports = [
    
    // Destination
    function (session) {
        //session.send('Welcome to the Hotels finder!');
        //builder.Prompts.text(session, 'Please enter your destination');
        
        /*var choices = [
            { value: 'San Francisco', action: { title: 'San Francisco' }, synonyms: 'San Francisco' },
            { value: 'Los Angeles', action: { title: 'Los Angeles' }, synonyms: 'Los Angeles' },
            { value: 'Seattle', action: { title: 'Seattle' }, synonyms: 'Seattle' }
        ];
  
        builder.Prompts.choice(session, 'choose_dests', choices, { 
            speak: speak(session, 'choose_dests_ssml'),
            inputHint: builder.InputHint.expectingInput 
            
        }); */

        builder.Prompts.text(session, 'choose_dest', { 
            speak: speak(session, 'choose_dest_ssml'),
            retryPrompt: 'dest_retry_ssml',
            retrySpeak: speak(session, 'dest_retry_ssml'),
            inputHint: builder.InputHint.expectingInput
        }); 
    },

    /*function (session, results, next) {
        session.dialogData.destination = results.response;
        session.send('Looking for hotels in %s', results.response);
        next();
    },*/

    function (session, results, next) {
        /*session.dialogData.destination = results.response.entity;
        var prompt = session.gettext('search_dest', results.response.entity);*/

        session.dialogData.destination = results.response;
        var prompt = session.gettext('search_dest', results.response);
        
        session.say(prompt,prompt);
        next();
    },
        
    // Check-in
    /*function (session) {
        builder.Prompts.time(session, 'When do you want to check in?');
    }, 
    
    function (session, results, next) {
        session.dialogData.checkIn = results.response.resolution.start;
        next();
    },*/

    function (session)
    {
        /*var choices = [
            { value: 'Jan 10, 2018', action: { title: 'Jan 10, 2018' }, synonyms: 'January|one' },
            { value: 'Feb 10, 2018', action: { title: 'Feb 10, 2018' }, synonyms: 'Febuary|two' },
            { value: 'Mar 10, 2018', action: { title: 'Mar 10, 2018' }, synonyms: 'March|three' }
        ];
  
        builder.Prompts.choice(session, 'choose_dates', choices, { 
            speak: speak(session, 'choose_dates_ssml')
        });*/
             
        builder.Prompts.time(session, 'choose_date', {
            speak: speak(session, 'choose_date_ssml'),
            retryPrompt: 'date_retry_ssml',
            retrySpeak: speak(session, 'date_retry_ssml'),
            inputHint: builder.InputHint.expectingInput
        });
    },

    function (session, results, next) {
        //session.dialogData.checkIn = results.response.entity;
        session.dialogData.checkIn = results.response.resolution.start;  
        next();
    },

    // Nights
    /*function (session) {
        builder.Prompts.number(session, 'How many nights do you want to stay?');
    },
    function (session, results, next) {
        session.dialogData.nights = results.response;
        next();
    },*/


    function (session)
    {
      
        builder.Prompts.number(session,  'choose_nights', {
            speak: speak(session, 'choose_nights_ssml'),
            retryPrompt: 'nights_retry_ssml',
            retrySpeak: speak(session, 'nights_retry_ssml'),
            inputHint: builder.InputHint.expectingInput,
            minValue: 1,
            maxValue: 10,
            integerOnly: true
        });

    },

    function (session, results, next) {
        session.dialogData.nights = results.response;
        next();
    },

    // Search...
    function (session) {
        var destination = session.dialogData.destination;
        var checkIn = new Date(session.dialogData.checkIn);
        var checkOut = checkIn.addDays(session.dialogData.nights);

         var monthNames = ["January", "February", "March", "April", "May", "June", "July", "Auguest", "September", "October", "November", "December"];
        
        var prompt = session.gettext('search_hotel', destination,
            monthNames[checkIn.getMonth()], checkIn.getDate(), checkIn.getFullYear(),
            monthNames[checkOut.getMonth()], checkOut.getDate(), checkOut.getFullYear()); 
           
        session.say(prompt,prompt);
       
            
        /*session.send(
            'Ok. Searching for Hotels in %s from %d/%d to %d/%d...',
            destination,
            checkIn.getMonth() + 1, checkIn.getDate(),
            checkOut.getMonth() + 1, checkOut.getDate()); */
        //session.send(prompt);
         
        // Async search
        /*Store
            .searchHotels(destination, checkIn, checkOut)
            .then(function (hotels) { */
                // Results
        
                var hotels = Store.searchHotels(destination, checkIn, checkOut);

                //session.send('I found in total %d hotels for your dates:', hotels.length);

                prompt = session.gettext ('search_result', hotels.length);
                session.say (prompt, prompt);
                
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(hotels.map(hotelAsAttachment));

                session.send(message); 

                // End
                session.endDialog();
         // });
    }
];

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        //.images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}



Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function speak(session, prompt) {
    var localized = session.gettext(prompt);
    return ssml.speak(localized);
}