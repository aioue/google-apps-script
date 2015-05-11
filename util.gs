/**
 * Lists all the users in a domain sorted by first name
 * input: domainName = 'foo.com'
 */
function listAllUsers(domainName) {
  var pageToken, page;

  // get users domain (e.g. company.com)
  var email = Session.getActiveUser().getEmail();
  domainName = email.replace(/.*@/, "");

  do {
    page = AdminDirectory.Users.list({
      domain: domainName,
      orderBy: 'givenName',
      maxResults: 100,
      pageToken: pageToken
    });
    var users = page.users;
    if (users) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];

        // Logger.log('%s (%s) (%s)', user.name.fullName, user.primaryEmail, user.thumbnailPhotoUrl);

         if (!user.thumbnailPhotoUrl) {
          Logger.log('Photo not set for %s', user.primaryEmail);
        }
      }
    } else {
      Logger.log('No users found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
}

/**
 * Get all the users without 2 step auth set
 */
function logUsers2step() {
  // google doesn't run reports on 2-step users until a week has past
  // this checks whether they had 2-step set a week ago
  var date = toISODate(new Date(Date.now()-7*24*60*60*1000));
  Logger.log(date);

  var console_text = "";

  var reports = AdminReports.UserUsageReport.get('all', date).usageReports;
  nextReport: for( var r in reports ) {
    for( var p in reports[r].parameters )
      if( reports[r].parameters[p].name == 'accounts:is_2sv_enrolled' ) {
        if (!reports[r].parameters[p].boolValue){
          console_text = console_text + reports[r].parameters[p].name+' '+reports[r].parameters[p].boolValue+' '+reports[r].entity.userEmail + "\n";
        }
        else {
          console_text = console_text + reports[r].parameters[p].name+' '+reports[r].parameters[p].boolValue+' '+reports[r].entity.userEmail + "\n";
        }
        continue nextReport;
      }
  }
  Logger.log("\n" + console_text);
}

function toISODate(date) { return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate()); }
function pad(number) { return number < 10 ? '0' + number : number; }

/**
 * email a user an HTML email from a no reply email address
 * input emailAddress = "foo@bar.com"
 */
function emailUser(emailAddress) {
    MailApp.sendEmail(emailAddress, "Update your Google Apps account", "", {
      name: 'Google Apps Cron',
      noReply: true,
            htmlBody: "All,<br/>" +
      "This is an email.<br/>" +
      "<br>Please go to <a href='https://www.google.com/landing/2step/'>2-step sign up</a> and set up Google Authenticator on your phone.<br>"
      }
    );
}

/**
 * Get all the users without a profile photo set
 * in the domain of the person running the script
 */
function getUsersWithNoProfilePhoto() {

  // get users domain (e.g. company.com)
  var email = Session.getActiveUser().getEmail();
  user_domain = email.replace(/.*@/, "");

  var console_text = ""

  var pageToken, page;
  do {
    page = AdminDirectory.Users.list({
      domain: user_domain,
      orderBy: 'givenName',
      maxResults: 100,
      pageToken: pageToken
    });
    var users = page.users;
    if (users) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];

        if (!user.thumbnailPhotoUrl) {
          Logger.log('Photo not set for %s', user.primaryEmail);
          emailUser(user.primaryEmail);
        }
      }
    } else {
      Logger.log('No users found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log(console_text);
  return console_text;
}
