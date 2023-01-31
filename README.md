prerequisites:
* node (v <= 16)
* postgresql

To use:
* run `npm install`
* create a local postgresql database. Run the following command to create the necesssary table:
  ```
  CREATE TABLE clarity_events (
  id serial PRIMARY KEY,
  timestamp BIGINT,
  raw_event TEXT,
  decoded_event TEXT, user_id VARCHAR(255));
  ```
* Set ENV var `USER` to your postgres user and `CLARITY_SERVER_DB_NAME` to the name postgres database you are using
* run `npm run build` to build the app
* run `npm run start` to start the local server on port 3456
* Navigate to localhost:3456 to view a replay of all stored events in the database

To send events:
* Add the following script to the `HEAD` of the page you want to record events on:
  ```
    <script>[INSERT PRODPERFECT KEEN SNIPPET HERE]</script>
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="http://localhost:3456/tracking_code";
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "XXXXXXXXXX");
    </script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var setClckCookie = function() {
          try {
            var prodperfectSessionCookie = JSON.parse(getCookie('prodperfect_session'))

            if(!prodperfectSessionCookie) {
              setTimeout(() => {
                setClckCookie()
              }, 100);
            } else {
              var userId = prodperfectSessionCookie['session_uuid']
              var clckCookie = getCookie('_clck')
              var clckDetails = clckCookie.split('|')
              clckDetails[0] = userId
              var newClckCookie = clckDetails.join('|')

              // identify doesn't seem to actually do anything meaningful
              window.clarity("identify", userId)

              // this is a hack so we can manipulate the userId sent with the clarity events to make up for the "identify" call weirdness
              document.cookie = "_clck=" + newClckCookie + ";path=/"
            }

          } catch(e){
            console.log('error identifying with prodperfect session cookie')
            console.log(e)
          }
        }
        setClckCookie()
      })
    </script>
  ```
  * replace `XXXXXXXXXX` with a MS project ID if you intend to change the configuration to send events to MS server instead


